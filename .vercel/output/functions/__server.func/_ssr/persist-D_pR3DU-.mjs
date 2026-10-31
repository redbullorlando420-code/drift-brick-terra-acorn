import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { _ as youtubePublicationTime, d as retainYoutubeMetadata, p as youtubeContentKind } from "./provider-json-CjRAnOrq.mjs";
import { t as LIBRARY_LIMITS } from "./youtube-contract-DMSANo43.mjs";
import { $t as patchSparseRecord, Cn as sparseRecordOrderedParts, D as adultAdapter, Fn as verifiedYoutubeSource, Gt as normalizeProviderCache, In as yieldCatalogTask, Jt as normalizeTwitchRetry, Kt as normalizeRecentPull, Sn as sparseRecordBuilder, Wt as normalizePlaylistWalk, Yt as normalizeYoutubeEvents, Z as collectCatalogRows, Zt as normalizeYoutubeLiveEvidence, bt as forEachCatalogSlice, dt as encodeSparseRecord, et as copyCatalogArray, ft as encodeTwitchArchiveCursor, it as decodeTwitchClipCursor, k as adultFolderIds, l as ADULT_PULL_PROVIDERS, mn as retainTwitchContent, nt as decodeSparseRecord, pt as encodeTwitchClipCursor, qt as normalizeTwitchPullPolicy, rt as decodeTwitchArchiveCursor, un as repairLegacyYoutubeDate, wn as sparseRecordScan, xn as sortCatalogRows, yt as forEachCatalogEntry } from "./live-rooms-DInVyvi_.mjs";
import { t as createLocalId } from "./local-id-CsDq4efR.mjs";
import { c as normalizeSignalProfile, l as readSignalPack, r as SIGNAL_PLATFORMS, u as signalOwnerPrefix } from "./stream-signal-CGbrHSsX.mjs";
import { r as CoalescedWriter, y as companionPutThumb } from "./companion-DacueTBp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/persist-D_pR3DU-.js
var persist_D_pR3DU__exports = /* @__PURE__ */ __exportAll({
	$: () => restoreTagEdits,
	$i: () => recipeDocument,
	$n: () => normalizeRecommendationSession,
	$r: () => retiredYoutubeKeys,
	$t: () => activityLookupAsync,
	A: () => pruneActivityJournal,
	Aa: () => confidenceBand,
	Ai: () => rememberVideo,
	An: () => bridgeText,
	Ar: () => reviewedAnimeInfo,
	At: () => saveWorkspaceDocuments,
	B: () => restoreDurableHistory,
	Ba: () => newestTopicAliases,
	Bi: () => chooseProviderView,
	Bn: () => guidePersonalScore,
	Br: () => adultAdmissionPolicy,
	Bt: () => recoverResumeRecords,
	C: () => loadRecommendationExposureSync,
	Ca: () => topicsForVideo,
	Ci: () => ratingMultiplier,
	Cn: () => rejectionKey,
	Cr: () => editAnimeSeries,
	Ct: () => saveRemoteSnapshot,
	D: () => loadTopicAliasesSync,
	Da: () => youtubeTagEvidence,
	Di: () => youtubeVideoKey,
	Dn: () => bridgeFields,
	Dr: () => parseAnimeReviews,
	Dt: () => saveTopicAliases,
	E: () => loadThumbCache,
	Ea: () => refreshYoutubeTags,
	Ei: () => peekYoutubeOwner,
	En: () => EMPTY_BRIDGES,
	Er: () => normalizeAnimeReviews,
	Et: () => saveThumbCache,
	F: () => removeRemoteSnapshotVideos,
	Fa: () => changeTopicAlias,
	Fi: () => createBoundedPicks,
	Fn: () => normalizeBridgeLedger,
	Fr: () => publicVideoBoundary,
	Ft: () => waitForFollowsWrites,
	G: () => restoreDurableResume,
	Ga: () => TOPICS,
	Gi: () => parseProviderViewing,
	Gn: () => isGuideWeights,
	Gr: () => cleanupLabel,
	Gt: () => releaseArtwork,
	H: () => restoreDurableMarks,
	Ha: () => reviewedRankingTag,
	Hi: () => newestProviderViewing,
	Hn: () => guideTieRank,
	Hr: () => cleanupBudgetAvailable,
	Ht: () => artworkBytes,
	I: () => restoreAnimeReviews,
	Ia: () => getTopicAliasRevision,
	Ii: () => takeBestMapped,
	In: () => videoBridgeSource,
	Ir: () => videoIsPrivate,
	It: () => waitForPrefsWrites,
	J: () => restoreFilmReviews,
	Ji: () => STUDIO_OUTPUT_LIMITS,
	Jn: () => rollbackGuidePreset,
	Jr: () => consumeCleanupBudget,
	Jt: () => selectSavedCards,
	K: () => restoreDurableShelves,
	Ka: () => baseCanonicalTopic,
	Ki: () => providerLoginGuidance,
	Kn: () => newestGuidePreset,
	Kr: () => cleanupPolicy,
	Kt: () => cacheMetrics,
	L: () => restoreCatalogMetadata,
	La: () => getTopicAliases,
	Li: () => catalogCard,
	Ln: () => DEFAULT_GUIDE_WEIGHTS,
	Lr: () => catalogRecoverySnapshot,
	Lt: () => withCatalogRead,
	M: () => readWorkspaceDocument,
	Ma: () => EMPTY_TOPIC_ALIASES,
	Mi: () => youtubeCoverageCounts,
	Mn: () => changeBridge,
	Mr: () => setAnimeRange,
	Mt: () => signalRevisions,
	N: () => recoverCatalogMutations,
	Na: () => aliasLabel,
	Ni: () => youtubeCoverageIndexAsync,
	Nn: () => isBridgeLedger,
	Nr: () => undoAnimeReview,
	Nt: () => studioOutputs,
	O: () => loadTopicBridgesSync,
	Oa: () => youtubeTagTitleHash,
	Oi: () => lookupVideo,
	On: () => bridgeKey,
	Or: () => preferAnimeVersion,
	Ot: () => saveTopicBridges,
	P: () => removeEnrichmentRows,
	Pa: () => aliasSearchTerms,
	Pi: () => youtubeSourceNewest,
	Pn: () => newestBridges,
	Pr: () => animeTitleInfo,
	Pt: () => waitForDurableWrites,
	Q: () => restoreRecommendationExposure,
	Qi: () => parseRecipe,
	Qn: () => createSourcePicks,
	Qr: () => replacementRequestBudget,
	Qt: () => activityLookup,
	R: () => restoreDurableFeedback,
	Ra: () => installTopicAliases,
	Ri: () => withCatalogDetails,
	Rn: () => EMPTY_GUIDE_PRESET,
	Rr: () => subscribeCatalogRecovery,
	Rt: () => patchActivityRecord,
	S: () => loadProviderViewingSync,
	Sa: () => topicEvidenceForScan,
	Si: () => ratingAdjustedScore,
	Sn: () => normalizeRejections,
	Sr: () => confirmAnimeEpisode,
	St: () => saveRecoveryLinks,
	T: () => loadSourceHealth,
	Ta: () => compactYoutubeTagEvidence,
	Ti: () => topicPreferenceScore,
	Tn: () => BRIDGE_SOURCES,
	Tr: () => nextAnimeEpisode,
	Tt: () => saveSourceHealth,
	U: () => restoreDurablePhotos,
	Ua: () => reviewedTopic,
	Ui: () => normalizeProviderViewing,
	Un: () => guideWeights,
	Ur: () => cleanupBudgets,
	Ut: () => artworkUrl,
	V: () => restoreDurableLinks,
	Va: () => normalizeTopicAliases,
	Vi: () => forgetProviderView,
	Vn: () => guidePositive,
	Vr: () => canRotateForGroup,
	Vt: () => prepareEnrichmentBatch,
	W: () => restoreDurablePrefs,
	Wa: () => validAliasLabel,
	Wi: () => officialAdultUrl,
	Wn: () => isGuidePreset,
	Wr: () => cleanupKey,
	Wt: () => binaryArtwork,
	X: () => restoreMetadataEdits,
	Xi: () => generatedCheckpoint,
	Xn: () => DEFAULT_RECOMMENDATION_SESSION,
	Xr: () => planYoutubeCleanup,
	Xt: () => activityCandidates,
	Y: () => restoreGuidePreset,
	Yi: () => MAX_RECIPE_BYTES,
	Yn: () => sameGuideWeights,
	Yr: () => emptyYoutubeCleanup,
	Yt: () => selectSavedCardsAsync,
	Z: () => restoreProviderViewing,
	Zi: () => generatedProvenance,
	Zn: () => createSessionPicks,
	Zr: () => recordYoutubeCleanup,
	Zt: () => activityCandidatesAsync,
	_: () => loadDurablePhotosSync,
	_a: () => canonicalTopic,
	_i: () => RATING_STAR_WEIGHTS,
	_n: () => changeRejection,
	_r: () => projectFilmVideo,
	_t: () => saveFollows,
	a: () => clearFolderVideos,
	aa: () => importModelNote,
	ai: () => remainingEntrySlots,
	an: () => clipWindowStop,
	ar: () => applyFilmFields,
	at: () => saveCreatorCoverageRows,
	b: () => loadGuidePresetSync,
	ba: () => reconcileProviderTopicTags,
	bi: () => personalRankScore,
	bn: () => isRejectionLedger,
	br: () => animeReviewVisibility,
	bt: () => saveProviderViewing,
	c: () => linksFromHistoryAndResume,
	ca: () => readModelNotes,
	ci: () => mergeRemoteCatalogAsync,
	cn: () => EXPOSURE_DWELL_MS,
	cr: () => filmPoster,
	ct: () => saveDurableHistory,
	d: () => loadActivitySnapshot,
	da: () => DEFAULT_STUDIO_SETTINGS,
	di: () => prepareRefreshSavedIds,
	dn: () => createExposurePenalty,
	dr: () => lockFilmField,
	dt: () => saveDurablePhotos,
	ea: () => recipeLoadReview,
	ei: () => rotationAvailable,
	en: () => mergeFollowRecovery,
	er: () => sameRecommendationSession,
	et: () => restoreTopicAliases,
	f: () => loadAnimeReviewsSync,
	fa: () => generatedSeed,
	fi: () => remoteVideoIndexAsync,
	fn: () => exposureKey,
	fr: () => newestFilms,
	ft: () => saveDurableResume,
	g: () => loadDirHandles,
	ga: () => rebaseSignalEdit,
	gi: () => INTEREST_MULTIPLIERS,
	gn: () => EMPTY_REJECTIONS,
	gr: () => previewFilmFields,
	gt: () => saveFolderVideos,
	h: () => loadCatalogVideos,
	ha: () => SignalConflictError,
	hi: () => twitchIdentity,
	hn: () => normalizeExposure,
	hr: () => preferFilmVersion,
	ht: () => saveFilmReviews,
	i: () => clearActivityJournal,
	ia: () => MODEL_ROLES,
	ii: () => holdEntryLimitCursors,
	in: () => clipWindowLabel,
	ir: () => FILM_FIELDS,
	it: () => saveCatalogMetadataEdit,
	j: () => readOfflineAuditStorage,
	ja: () => sourcesInMask,
	ji: () => youtubeCatalogCoverage,
	jn: () => bridgeTopic,
	jr: () => setAnimePolicy,
	jt: () => saveYoutubeCleanup,
	k: () => persist_exports,
	ka: () => youtubeTextTags,
	ki: () => lookupVideos,
	kn: () => bridgePolicy,
	kr: () => removeAnimeMapping,
	kt: () => saveViewPrefs,
	l: () => listWorkspaceDocuments,
	la: () => readModelPreflight,
	li: () => mergeRemoteRefreshAsync,
	ln: () => applyExposureEvents,
	lr: () => filmVisibility,
	lt: () => saveDurableLinks,
	m: () => loadCatalogVideo,
	ma: () => studioSettingsError,
	mi: () => lookupCatalogIdentity,
	mn: () => newestExposure,
	mr: () => parseFilmLedger,
	mt: () => saveEnrichmentRows,
	n: () => appendCatalogVideos,
	na: () => EMPTY_MODEL_NOTES,
	ni: () => admitRemoteEntries,
	nn: () => clipCoverageAction,
	nr: () => sessionPreferenceAdjustment,
	nt: () => saveActivitySnapshot,
	o: () => deleteDirHandle,
	oa: () => modelNoteChecklist,
	oi: () => rememberEntryCounts,
	on: () => EMPTY_EXPOSURE,
	or: () => confirmFilm,
	ot: () => saveDirHandle,
	p: () => loadCachedThumb,
	pa: () => studioSettings,
	pi: () => catalogIdentityKeys,
	pn: () => isExposureLedger,
	pr: () => normalizeFilmLedger,
	pt: () => saveDurableShelves,
	q: () => restoreEnrichmentRows,
	qi: () => myFreeCamsRoomUrl,
	qn: () => normalizeGuidePreset,
	qr: () => cleanupSourceKeys,
	qt: () => savedRecordScan,
	r: () => catalogWriter,
	ra: () => MODEL_NOTE_BYTES,
	ri: () => entryGroup,
	rn: () => clipCoverageSummary,
	rr: () => EMPTY_FILMS,
	rt: () => saveAnimeReviews,
	s: () => getPersistenceMemorySnapshot,
	sa: () => parseModelNote,
	si: () => remoteEntryCounts,
	sn: () => EXPOSURE_COOLDOWN_MS,
	sr: () => filmNameEvidence,
	st: () => saveDurableFeedback,
	t: () => appendActivityJournal,
	ta: () => restoreRecipes,
	ti: () => youtubeCleanupProtected,
	tn: () => normalizeFollowCheckpoints,
	tr: () => sessionAllows,
	tt: () => restoreTopicBridges,
	u: () => loadActivityJournal,
	ua: () => saveModelNote,
	ui: () => prepareIndexedRemoteCatalog,
	un: () => clearExposure,
	ur: () => groupFilmVersions,
	ut: () => saveDurableMarks,
	v: () => loadFilmReviewsSync,
	va: () => hasTopicForScan,
	vi: () => confidenceAdjustedPreference,
	vn: () => createRejectionPenalty,
	vr: () => undoFilmReview,
	vt: () => saveGuidePreset,
	w: () => loadRemoteSnapshot,
	wa: () => automaticYoutubeTags,
	wi: () => ratingPreference,
	wn: () => titleRejectionTarget,
	wr: () => newestAnimeReviews,
	wt: () => saveSavedShelfEdit,
	x: () => loadPrefs,
	xa: () => topicEvidence,
	xi: () => rankingTags,
	xn: () => newestRejections,
	xr: () => buildAnimeEpisodeMap,
	xt: () => saveRecommendationExposure,
	y: () => loadFollows,
	ya: () => isTopicTag,
	yi: () => personalRankBreakdown,
	yn: () => creatorRejectionTarget,
	yr: () => EMPTY_ANIME_REVIEWS,
	yt: () => savePrefs,
	z: () => restoreDurableFollows,
	za: () => isTopicAliasLedger,
	zi: () => EMPTY_PROVIDER_VIEWING,
	zn: () => changeGuidePreset,
	zr: () => CLEANUP_GROUPS,
	zt: () => recoverActivityCounts
});
var TOPICS = /* @__PURE__ */ new Set([
	"racing",
	"gaming",
	"technology",
	"news-commentary",
	"music",
	"film",
	"anime",
	"food",
	"travel",
	"fitness",
	"learning",
	"comedy",
	"relaxing",
	"talk",
	"commentary",
	"creative",
	"nature",
	"business",
	"style",
	"motors",
	"horror",
	"maker",
	"sports",
	"science",
	"relationships",
	"wellbeing",
	"skills",
	"hardware",
	"legal",
	"animation",
	"documentary",
	"history",
	"true-crime",
	"photography",
	"art",
	"design",
	"family",
	"animals",
	"lifestyle",
	"beauty",
	"fashion",
	"home",
	"outdoors",
	"space",
	"environment",
	"politics",
	"finance"
]);
var BUILTIN_ALIASES = {
	funny: "comedy",
	laughs: "comedy",
	racing: "racing",
	simracing: "racing",
	tech: "technology",
	coding: "technology",
	programming: "technology",
	cooking: "food",
	recipes: "food",
	automotive: "motors",
	cars: "motors",
	diy: "maker",
	education: "learning",
	meditation: "wellbeing",
	football: "sports",
	podcast: "talk",
	photos: "photography",
	photo: "photography",
	artworks: "art",
	documentaries: "documentary",
	truecrime: "true-crime",
	pets: "animals",
	makeup: "beauty",
	skincare: "beauty",
	investing: "finance",
	money: "finance",
	hiking: "outdoors"
};
function baseCanonicalTopic(tag) {
	const clean = tag.trim().toLowerCase().replace(/^#/, "").replace(/\s+/g, "-");
	return TOPICS.has(clean) ? clean : BUILTIN_ALIASES[clean];
}
var EMPTY_TOPIC_ALIASES = {
	version: 1,
	updatedAt: 0,
	entries: []
};
var aliasLabel = (raw) => raw.trim().toLowerCase().replace(/^#/, "").replace(/^keyword-/, "").replace(/\s+/g, "-");
function validAliasLabel(raw) {
	const label = aliasLabel(raw);
	return label.length >= 2 && label.length <= 64 && /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(label) && !baseCanonicalTopic(label) && ![
		"shorts",
		"vod",
		"clips",
		"live",
		"upload",
		"video",
		"youtube",
		"twitch"
	].includes(label) && !/^(?:provider|creator|source|format|auto|sub|fetish|genre|meta)-/.test(label);
}
function isTopicAliasLedger(raw) {
	const v = raw;
	return Boolean(v && v.version === 1 && Number.isSafeInteger(v.updatedAt) && v.updatedAt >= 0 && Array.isArray(v.entries));
}
function normalizeTopicAliases(raw) {
	if (!isTopicAliasLedger(raw)) return EMPTY_TOPIC_ALIASES;
	const entries = /* @__PURE__ */ new Map();
	for (const row of raw.entries.slice(0, 256)) {
		if (!row || typeof row.alias !== "string" || !validAliasLabel(row.alias) || aliasLabel(row.alias) !== row.alias || !TOPICS.has(row.topic) || !Number.isSafeInteger(row.at) || row.at < 0 || !["spelling-review", "manual-review"].includes(row.method)) continue;
		const old = entries.get(row.alias);
		if (old && old.at > row.at) continue;
		entries.set(row.alias, {
			alias: row.alias,
			topic: row.topic,
			at: row.at,
			method: row.method,
			titleCount: Number.isFinite(row.titleCount) ? Math.max(0, Math.min(1e7, Math.floor(row.titleCount))) : 0,
			sources: Array.isArray(row.sources) ? [...new Set(row.sources.filter((value) => typeof value === "string" && [
				"local",
				"youtube",
				"twitch"
			].includes(value)))].slice(0, 3) : []
		});
	}
	return {
		version: 1,
		updatedAt: raw.updatedAt,
		entries: [...entries.values()].sort((a, b) => b.at - a.at || a.alias.localeCompare(b.alias)).slice(0, 128)
	};
}
function newestTopicAliases(a, b) {
	const left = normalizeTopicAliases(a), right = normalizeTopicAliases(b);
	return right.updatedAt >= left.updatedAt ? right : left;
}
var current = EMPTY_TOPIC_ALIASES;
var revision = 0;
var historyFloor = 0;
var versions = /* @__PURE__ */ new Map();
var byAlias = /* @__PURE__ */ new Map();
function installTopicAliases(raw) {
	const next = normalizeTopicAliases(raw), map = new Map(next.entries.map((row) => [row.alias, row.topic])), changed = [.../* @__PURE__ */ new Set([...byAlias.keys(), ...map.keys()])].filter((key) => byAlias.get(key) !== map.get(key));
	current = next;
	if (changed.length) {
		revision++;
		for (const key of changed) versions.set(key, revision);
		while (versions.size > 512) {
			const first = versions.keys().next().value;
			historyFloor = Math.max(historyFloor, versions.get(first));
			versions.delete(first);
		}
		byAlias = map;
	}
	return changed;
}
var getTopicAliases = () => current;
var getTopicAliasRevision = () => revision;
var reviewedTopic = (tag) => byAlias.get(aliasLabel(tag));
function aliasTagsChanged(tags, since) {
	return since < historyFloor || tags.some((tag) => (versions.get(aliasLabel(tag)) ?? 0) > since);
}
function reviewedRankingTag(tag) {
	return reviewedTopic(tag) ?? tag;
}
function changeTopicAlias(ledger, entry, remove = false, now = Date.now()) {
	if (!validAliasLabel(entry.alias) || !TOPICS.has(entry.topic)) throw new Error("Choose a new descriptive label and an existing topic. Built-in topics and provider/creator labels cannot be remapped.");
	const existing = ledger.entries.find((row) => row.alias === entry.alias);
	if (remove && !existing) return ledger;
	if (!remove && !existing && ledger.entries.length >= 128) throw new Error("The 128-alias limit is reached. Undo an existing alias before adding another.");
	return normalizeTopicAliases({
		version: 1,
		updatedAt: Math.max(now, ledger.updatedAt + 1),
		entries: [...remove ? [] : [entry], ...ledger.entries.filter((row) => row.alias !== entry.alias)]
	});
}
/** Exact reviewed labels only; short/prefix guesses never expand a query. */
function aliasSearchTerms(token, ledger) {
	const label = aliasLabel(token), topic = ledger.entries.find((row) => row.alias === label)?.topic ?? (TOPICS.has(label) ? label : void 0);
	if (!topic || !ledger.entries.some((row) => row.topic === topic)) return [];
	return [.../* @__PURE__ */ new Set([topic, ...ledger.entries.filter((row) => row.topic === topic).flatMap((row) => [
		row.alias,
		"keyword-" + row.alias,
		row.alias.replaceAll("-", " "),
		"keyword-" + row.alias.replaceAll("-", " ")
	])])];
}
var TOPIC_RULES = [
	["racing", /\b(iracing|sim racing|racing simulator|assetto corsa|automobilista|gran turismo|forza motorsport|forza horizon|formula (one|1)|f1|nascar|motogp)\b/i],
	["gaming", /\b(gaming|gameplay|playthrough|speedrun|walkthrough|minecraft|fortnite|valorant|counter.strike|grand theft auto|gta [v56]|call of duty|cod zombies|elden ring|roblox|league of legends|world of warcraft|warcraft iii|dota|overwatch|apex legends|baldur.s gate|resident evil|silent hill|dark souls|rust|runescape|stardew valley|pokemon|pokémon|rainbow six|rocket league|marvel rivals|deadlock|mario kart|super smash bros|street fighter|mortal kombat|dark and darker|path of exile|pubg|streamer games|nba 2k\d*|cozy games|arc raiders)\b/i],
	["technology", /\b(software|programming|coding|artificial intelligence|machine learning|linux|javascript)\b/i],
	["hardware", /\b(pc build|graphics card|gpu|cpu|keyboard|smartphone|iphone|computer hardware)\b/i],
	["motors", /\b(dash.?cam|tesla.?cam|car repair|motorcycle|automotive|formula (one|1)|nascar|simucube|racing rig)\b/i],
	["legal", /\b(police chase|body.?cam|courtroom|lawsuit|trial verdict)\b/i],
	["food", /\b(cooking|recipe|baking|restaurant|street food|chef|cake|cake decorating)\b/i],
	["travel", /\b(travel|vacation|backpacking|road trip|walking tour|city tour|japan trip|china trip|travel vlog|visiting|sightseeing|airport lounge)\b/i],
	["music", /\b(music|concert|song|album|guitar|piano|dj set|karaoke)\b/i],
	["film", /\b(movie|cinema|film review|movie trailer)\b/i],
	["anime", /\b(anime|manga)\b/i],
	["fitness", /\b(workout|weightlifting|fitness|pilates|yoga)\b/i],
	["sports", /\b(football|soccer|basketball|baseball|tennis|olympics|esports)\b/i],
	["science", /\b(physics|chemistry|astronomy|biology|space telescope|scientific)\b/i],
	["maker", /\b(woodworking|diy|3d printing|restoration|soldering)\b/i],
	["creative", /\b(painting|drawing|photography|sculpture|animation tutorial)\b/i],
	["animation", /\b(animation|animated|animator|cartoon)\b/i],
	["documentary", /\b(documentary|docuseries)\b/i],
	["history", /\b(history|historical|ancient|medieval|world war|archaeology)\b/i],
	["true-crime", /\b(true crime|murder case|missing person|serial killer|crime documentary)\b/i],
	["photography", /\b(photography|photo shoot|camera review|street photography)\b/i],
	["art", /\b(fine art|artwork|watercolor|illustration|digital art)\b/i],
	["design", /\b(interior design|graphic design|ui design|architecture)\b/i],
	["family", /\b(family|parenting|parenthood|baby)\b/i],
	["animals", /\b(animals?|pets?|dogs?|cats?|wildlife)\b/i],
	["lifestyle", /\b(lifestyle|daily vlog|day in the life|routine)\b/i],
	["beauty", /\b(makeup|skincare|beauty|hair tutorial)\b/i],
	["fashion", /\b(fashion|outfit|streetwear|clothing haul)\b/i],
	["home", /\b(home tour|home decor|organization|clean with me)\b/i],
	["outdoors", /\b(hiking|camping|fishing|outdoors?|backpacking)\b/i],
	["space", /\b(space|nasa|astronomy|rocket launch|astronaut)\b/i],
	["environment", /\b(climate|environment|sustainability|recycling|conservation)\b/i],
	["politics", /\b(politics?|election|government|congress|parliament)\b/i],
	["finance", /\b(finance|stock market|personal finance|budgeting|investing)\b/i],
	["learning", /\b(tutorial|lesson|lecture|course|how to)\b/i],
	["talk", /\b(podcast|interview|just chatting)\b/i],
	["comedy", /\b(comedy|stand.up|sketch comedy)\b/i],
	["nature", /\b(wildlife|birdwatching|rainforest|coral reef)\b/i],
	["wellbeing", /\b(meditation|mental health|mindfulness|acupuncture)\b/i],
	["relaxing", /\b(asmr|massage|relaxation|relaxing|sleep sounds|ambient sounds|white noise|meditation)\b/i],
	["skills", /\b(language lesson|learn japanese|learn spanish|public speaking|study tips|skill tutorial)\b/i],
	["business", /\b(entrepreneur|small business|startup funding|investing)\b/i],
	["news-commentary", /\b(election|political|breaking news)\b/i]
];
var YOUTUBE_TAG_SOURCES = [
	"video-tag",
	"hashtag",
	"chapter",
	"title",
	"description"
];
var sourceBit = (source) => {
	const index = YOUTUBE_TAG_SOURCES.indexOf(source);
	return index < 0 ? 0 : 1 << index;
};
function confidenceBand(score) {
	return score >= 80 ? "high" : score >= 50 ? "medium" : "low";
}
/** Evidence strength, not a probability. Repetition within one field adds no strength. */
function scoreYoutubeTag(mask, specific) {
	const has = (source) => Boolean(mask & sourceBit(source));
	if (has("title")) return has("video-tag") ? 96 : has("chapter") || has("description") ? 90 : specific ? 85 : 60;
	if (has("chapter")) return has("video-tag") ? 88 : has("description") ? 82 : 75;
	if (has("video-tag")) return has("description") ? 70 : 55;
	if (has("description")) return specific ? 60 : 35;
	return has("hashtag") ? 40 : 0;
}
var sourcesInMask = (mask) => YOUTUBE_TAG_SOURCES.filter((source) => mask & sourceBit(source));
var YOUTUBE_TEXT_LIMITS = {
	title: 500,
	description: 16e3,
	lines: 128,
	words: 480,
	tags: 28
};
var STOP = new Set("a an and are as at be been but by can could did do does for from get got had has have how i if in into is it its just like make more my new of on one or our out over part that the their them then there these they this to too up us was we were what when where which who why will with would you your about after also being between channel click creator description here next official please really subscribe through today video videos watch youtube episode full older catalog item public vod views published upload uploads".split(" "));
var PROMO = /\b(subscribe|sponsored|sponsor|affiliate|patreon|merch|discount|promo code|coupon|copyright|all rights reserved|music (?:used|provided|by|credit)|background music|soundtrack|use code|links below|gear links|follow (?:me|us|my|our|on)|support (?:me|us|my|our)|check out (?:my|our)|social (?:media|links)|buy (?:now|here)|business (?:inquiries|enquiries))\b/i;
for (const word of "best amazing awesome incredible welcome thanks thank enjoy link links discord instagram twitter facebook tiktok twitch com www intro introduction outro timestamps chapters timestamp follow daily weekly latest shorts short viral trending fyp foryou subscribe subscribers".split(" ")) STOP.add(word);
var ENTITIES = [
	["minecraft", /\bminecraft\b/i],
	["elden-ring", /\belden ring\b/i],
	["grand-theft-auto", /\b(?:grand theft auto|gta [v56])\b/i],
	["world-of-warcraft", /\bworld of warcraft\b/i],
	["stardew-valley", /\bstardew valley\b/i],
	["machine-learning", /\bmachine learning\b/i],
	["artificial-intelligence", /\bartificial intelligence\b/i],
	["3d-printing", /\b3d print(?:ing|er)?\b/i],
	["pc-build", /\bpc build\b/i],
	["black-holes", /\bblack holes?\b/i],
	["meal-prep", /\bmeal prep\b/i],
	["street-food", /\bstreet food\b/i],
	["true-crime", /\btrue crime\b/i],
	["javascript", /\bjavascript\b/i],
	["typescript", /\btypescript\b/i],
	["python", /\bpython\b/i],
	["blender", /\bblender\b/i],
	["davinci-resolve", /\bdavinci resolve\b/i],
	["photoshop", /\bphotoshop\b/i],
	["iracing-arcade", /\biracing arcade\b/i],
	["sim-racing", /\bsim(?:ulator)? racing\b/i]
];
var SOURCE_PRIORITY = {
	"video-tag": 5,
	hashtag: 4,
	chapter: 3,
	title: 2,
	description: 1
};
var PHRASE_ALIASES = new Map(ENTITIES.filter(([tag]) => tag.includes("-")).map(([tag]) => [tag.replaceAll("-", ""), tag]));
var EMPTY$1 = {
	tags: [],
	sources: {},
	scores: [],
	signals: [],
	descriptionTopics: []
};
var cache$1 = /* @__PURE__ */ new Map();
var clean$2 = (text) => text.normalize("NFKC").replace(/(?:https?:\/\/|www\.)\S+|\b\S+@\S+\.\S+\b/gi, " ").replace(/<[^>]{0,200}>/g, " ").replace(/&(?:amp|quot|lt|gt);/g, " ");
function normalizeYoutubeTag(text) {
	let value = clean$2(text.slice(0, 100)).toLowerCase().trim().replace(/^#/, "").replace(/c\+\+/g, "cplusplus").replace(/c#/g, "csharp").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
	value = PHRASE_ALIASES.get(value.replaceAll("-", "")) ?? value;
	if (!value || value.length > 64 || PROMO.test(value.replaceAll("-", " "))) return "";
	const tokens = value.split("-");
	return tokens.some((token) => token.length >= 2 && !STOP.has(token)) && !tokens.every((token) => STOP.has(token) || /^\d+$/.test(token)) ? value : "";
}
function words(text) {
	const scored = /* @__PURE__ */ new Map();
	for (const word of (text.toLowerCase().match(/[\p{L}][\p{L}\p{N}]*(?:[-'][\p{L}\p{N}]+)*/gu) ?? []).slice(0, YOUTUBE_TEXT_LIMITS.words)) {
		if (word.length < 3 || word.length > 32 || STOP.has(word)) continue;
		scored.set(word, (scored.get(word) ?? 0) + 1);
	}
	return [...scored].sort((a, b) => b[1] - a[1]).map(([word]) => word.replaceAll("'", ""));
}
/** Bounded CPU-only inference; retains at most 512 compact results, never
* descriptions or token arrays. A million-row catalog cannot grow this cache. */
function youtubeTextTags(video) {
	if (video.remote?.kind !== "youtube") return EMPTY$1;
	const previous = cache$1.get(video);
	if (previous) return previous;
	const summary = video.remote.youtubeTagSummary;
	if (video.description === void 0 && summary?.version === 4 && (!summary.titleHash || summary.titleHash === youtubeTagTitleHash(video.name))) {
		const tags = Object.keys(summary.sources).slice(0, YOUTUBE_TEXT_LIMITS.tags), sources = Object.fromEntries(tags.map((tag) => [tag, summary.sources[tag]]));
		const result = {
			tags,
			sources,
			scores: tags.map((_, i) => validScore(summary.scores?.[i])),
			signals: tags.map((tag, i) => validMask(summary.signals?.[i]) || sourceBit(sources[tag])),
			descriptionTopics: summary.topics,
			titleHash: summary.titleHash
		};
		if (cache$1.size >= 512) cache$1.delete(cache$1.keys().next().value);
		cache$1.set(video, result);
		return result;
	}
	const title = clean$2(video.name.slice(0, YOUTUBE_TEXT_LIMITS.title));
	const lines = clean$2((video.description ?? video.tagline ?? "").slice(0, YOUTUBE_TEXT_LIMITS.description)).split(/\r?\n/).slice(0, YOUTUBE_TEXT_LIMITS.lines);
	const content = [], chapters = [], prose = [];
	for (const line of lines) {
		if (PROMO.test(line)) continue;
		const chapter = line.match(/^\s*(?:\d{1,2}:)?\d{1,2}:\d{2}\s*[-–—|:]?\s*(.+)/);
		if (chapter) chapters.push(chapter[1]);
		else prose.push(line.replace(/#[\p{L}\p{N}_-]+/gu, ""));
		content.push(chapter ? chapter[1] : line);
	}
	const description = content.join("\n"), text = `${title}\n${description}`;
	const keywords = (video.remote.youtubeKeywords ?? []).slice(0, 40).map(normalizeYoutubeTag).filter(Boolean);
	const descriptionTopics = [];
	for (const [topic, pattern] of TOPIC_RULES) {
		const match = description.match(pattern), keyword = keywords.find((tag) => pattern.test(tag.replaceAll("-", " ")));
		if (match || keyword) descriptionTopics.push({
			topic,
			reason: match ? `Description/chapter: ${match[0]}` : `Video tag: ${keyword}`
		});
		if (descriptionTopics.length >= 8) break;
	}
	const candidates = /* @__PURE__ */ new Map();
	const add = (raw, source, score) => {
		const tag = normalizeYoutubeTag(raw);
		if (!tag) return;
		const before = candidates.get(tag);
		if (!before && candidates.size < 96) candidates.set(tag, {
			source,
			score,
			order: candidates.size
		});
		else if (before) candidates.set(tag, {
			source: SOURCE_PRIORITY[source] > SOURCE_PRIORITY[before.source] ? source : before.source,
			score: Math.max(score, before.score),
			order: before.order
		});
	};
	const normalizedTitle = `-${title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-")}-`;
	const normalizedDescription = `-${description.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-")}-`;
	const keywordScore = (tag) => normalizedTitle.includes(`-${tag}-`) ? 110 : normalizedDescription.includes(`-${tag}-`) ? 99 : 90;
	for (const tag of [...new Set(keywords)].sort((a, b) => keywordScore(b) - keywordScore(a)).slice(0, 16)) add(tag, "video-tag", keywordScore(tag));
	let hashtags = 0;
	for (const match of text.matchAll(/#([\p{L}][\p{L}\p{N}_-]{2,48})/gu)) {
		add(match[1], "hashtag", 100);
		if (++hashtags >= 12) break;
	}
	for (const [tag, pattern] of ENTITIES) if (pattern.test(text)) add(tag, pattern.test(title) ? "title" : "description", 95);
	for (const chapter of chapters.slice(0, 6)) {
		const tokens = (chapter.toLowerCase().match(/[\p{L}][\p{L}\p{N}-]*/gu) ?? []).filter((word) => !STOP.has(word));
		if (tokens.length >= 2 && tokens.length <= 5) add(tokens.join("-"), "chapter", 94);
	}
	const titleWords = words(title);
	for (const word of titleWords.slice(0, 12)) add(word, "title", 75);
	const descriptionWords = words(description);
	const counts = /* @__PURE__ */ new Map();
	for (const word of (description.toLowerCase().match(/[\p{L}][\p{L}\p{N}]*(?:[-'][\p{L}\p{N}]+)*/gu) ?? []).slice(0, YOUTUBE_TEXT_LIMITS.words)) counts.set(word, (counts.get(word) ?? 0) + 1);
	const openingWords = new Set(words(description.slice(0, 600)).slice(0, 12));
	for (const word of descriptionWords) {
		const repeated = (counts.get(word) ?? 0) >= 2;
		if (repeated || openingWords.has(word)) add(word, "description", repeated ? 55 : 40);
	}
	const phrases = [...candidates].filter(([tag, row]) => tag.includes("-") && row.score >= 90).map(([tag]) => new Set(tag.split("-")));
	const hashtagTags = new Set([...text.matchAll(/#([\p{L}][\p{L}\p{N}_-]{2,48})/gu)].slice(0, 12).map((match) => normalizeYoutubeTag(match[1])));
	const plainTitle = title.replace(/#[\p{L}\p{N}_-]+/gu, ""), plainChapters = chapters.map((line) => line.replace(/#[\p{L}\p{N}_-]+/gu, ""));
	const ranked = [...candidates].filter(([tag, row]) => row.score >= 80 || !phrases.some((tokens) => tokens.has(tag))).map(([tag, row]) => {
		let mask = 0;
		if (keywords.includes(tag)) mask |= sourceBit("video-tag");
		if (matchesTag(plainTitle, tag)) mask |= sourceBit("title");
		if (plainChapters.some((line) => matchesTag(line, tag) || chapterTag(line) === tag)) mask |= sourceBit("chapter");
		if (prose.some((line) => matchesTag(line, tag))) mask |= sourceBit("description");
		if (hashtagTags.has(tag)) mask |= sourceBit("hashtag");
		return {
			tag,
			...row,
			signals: mask,
			confidence: scoreYoutubeTag(mask, specificTag(tag))
		};
	}).filter((row) => row.signals > 0).sort((a, b) => b.confidence - a.confidence || b.score - a.score || a.order - b.order).slice(0, YOUTUBE_TEXT_LIMITS.tags);
	const tags = ranked.map((row) => row.tag), sources = Object.fromEntries(ranked.map((row) => [row.tag, row.source])), scores = ranked.map((row) => row.confidence), signals = ranked.map((row) => row.signals);
	const grounded = descriptionTopics.filter((link) => {
		const rule = TOPIC_RULES.find(([topic]) => topic === link.topic)?.[1];
		return tags.some((tag, i) => scores[i] >= 80 && rule?.test(tag.replaceAll("-", " ")));
	});
	const result = {
		tags,
		sources,
		scores,
		signals,
		titleHash: youtubeTagTitleHash(video.name),
		descriptionTopics: grounded
	};
	if (cache$1.size >= 512) cache$1.delete(cache$1.keys().next().value);
	cache$1.set(video, result);
	return result;
}
/** Topic scans need no keyword objects or title tokenization for sparse rows.
* Compact checked cards return their persisted topic array without allocation. */
function youtubeDescriptionTopics(video) {
	const remote = video.remote;
	if (remote?.kind !== "youtube") return EMPTY$1.descriptionTopics;
	if (video.description === void 0 && remote.youtubeTagSummary?.version === 4 && (!remote.youtubeTagSummary.titleHash || remote.youtubeTagSummary.titleHash === youtubeTagTitleHash(video.name))) return remote.youtubeTagSummary.topics;
	if (!video.description && !video.tagline && !remote.youtubeKeywords?.length) return EMPTY$1.descriptionTopics;
	return youtubeTextTags(video).descriptionTopics;
}
/** Replace only tags attributed to this provider. Manual/unknown legacy tags
* retain priority; locked rows are untouched. Existing oversized manual rows
* survive intact rather than silently losing saved choices. */
function refreshYoutubeTags(current, inferred, provenance, limit = 32) {
	if (provenance?.lockedFields?.includes("tags")) return current;
	const protectedTags = current.filter((tag) => provenance?.tags[tag] !== "provider:youtube");
	const next = [.../* @__PURE__ */ new Set([...protectedTags, ...inferred])].slice(0, Math.max(limit, protectedTags.length));
	return current.length === next.length && current.every((tag, index) => tag === next[index]) ? current : next;
}
var validScore = (raw) => typeof raw === "number" && Number.isFinite(raw) ? Math.max(0, Math.min(100, Math.floor(raw))) : 0;
var validMask = (raw) => typeof raw === "number" && Number.isSafeInteger(raw) && raw >= 0 && raw <= 31 ? raw : 0;
var specificTag = (tag) => TOPICS.has(tag) || tag.includes("-") || ENTITIES.some(([entity]) => entity === tag);
function matchesTag(text, tag) {
	return ("-" + text.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-") + "-").includes("-" + tag + "-") || Boolean(ENTITIES.find(([entity]) => entity === tag)?.[1].test(text));
}
function automaticYoutubeTags(video) {
	const result = youtubeTextTags(video);
	return result.tags.filter((_, i) => result.scores[i] >= 80);
}
function compactYoutubeTagEvidence(result) {
	return {
		version: 4,
		sources: result.sources,
		scores: result.scores,
		signals: result.signals,
		titleHash: result.titleHash,
		topics: result.descriptionTopics
	};
}
/** Excerpts are prepared for one selected preview, never stored on browse cards. */
function youtubeTagEvidence(video, tag) {
	const result = youtubeTextTags(video), index = result.tags.indexOf(tag);
	if (index < 0) return [];
	const available = sourcesInMask(result.signals[index] ?? 0), rows = [];
	const lines = clean$2((video.description ?? video.tagline ?? "").slice(0, YOUTUBE_TEXT_LIMITS.description)).split(/\r?\n/).slice(0, YOUTUBE_TEXT_LIMITS.lines).filter((line) => !PROMO.test(line));
	for (const source of available) {
		const excerpt = source === "video-tag" ? (video.remote?.youtubeKeywords ?? []).find((value) => normalizeYoutubeTag(value) === tag) : source === "title" ? video.name : source === "chapter" ? lines.find((line) => /^\s*(?:\d{1,2}:)?\d{1,2}:\d{2}/.test(line) && (matchesTag(line, tag) || chapterTag(line) === tag)) : source === "hashtag" ? lines.concat(video.name).find((line) => [...line.matchAll(/#([\p{L}][\p{L}\p{N}_-]{2,48})/gu)].some((match) => normalizeYoutubeTag(match[1]) === tag)) : lines.find((line) => !/^\s*(?:\d{1,2}:)?\d{1,2}:\d{2}/.test(line) && matchesTag(line.replace(/#[\p{L}\p{N}_-]+/gu, ""), tag));
		rows.push({
			source,
			excerpt: excerpt ? evidenceExcerpt(excerpt, tag) : "Saved metadata evidence; recheck this video to inspect the original field."
		});
		if (rows.length === 3) break;
	}
	return rows;
}
function youtubeTagTitleHash(title) {
	let hash = 2166136261;
	for (const char of title.slice(0, YOUTUBE_TEXT_LIMITS.title)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
	return (hash >>> 0).toString(16);
}
function evidenceExcerpt(raw, tag) {
	const text = raw.replace(/\s+/g, " ").trim(), found = (ENTITIES.find(([name]) => name === tag)?.[1])?.exec(text)?.index ?? text.toLowerCase().indexOf(tag.split("-")[0]);
	const start = Math.max(0, found - 40);
	return (start ? "…" : "") + text.slice(start, start + (start ? 119 : 120));
}
function chapterTag(line) {
	const tokens = (line.toLowerCase().match(/[\p{L}][\p{L}\p{N}-]*/gu) ?? []).filter((word) => !STOP.has(word));
	return tokens.length >= 2 && tokens.length <= 5 ? normalizeYoutubeTag(tokens.join("-")) : "";
}
function canonicalTopic(tag) {
	return baseCanonicalTopic(tag) ?? reviewedTopic(tag);
}
var isTopicTag = (tag) => Boolean(canonicalTopic(tag));
var cache = /* @__PURE__ */ new WeakMap();
var legacyCache = /* @__PURE__ */ new WeakMap();
var EMPTY = [];
var rulesByTopic = new Map(TOPIC_RULES);
var titleEvidence = (video) => video.remote?.kind === "youtube" ? video.name.slice(0, 500).replace(/#[\p{L}\p{N}_-]+/gu, "") : video.name.slice(0, 500);
/** Single-topic catalog scans avoid building every topic/evidence array and
* never populate the resident per-card cache for unseen catalog entries. */
function hasTopicForScan(video, topic, tags = EMPTY) {
	const previous = cache.get(video);
	if (previous?.tags === tags && !aliasTagsChanged(tags, previous.aliasRevision)) {
		previous.aliasRevision = getTopicAliasRevision();
		return previous.topics.includes(topic);
	}
	if (tags.some((tag) => canonicalTopic(tag) === topic)) return true;
	if (rulesByTopic.get(topic)?.test(`${titleEvidence(video)} ${video.genre ?? ""}`)) return true;
	return youtubeDescriptionTopics(video).some((link) => link.topic === topic);
}
function resolve(video, tags = EMPTY, retain = true, reviewed = true) {
	const activeCache = reviewed ? cache : legacyCache;
	const previous = activeCache.get(video);
	if (previous?.tags === tags && !aliasTagsChanged(tags, previous.aliasRevision)) {
		previous.aliasRevision = getTopicAliasRevision();
		return previous;
	}
	const links = /* @__PURE__ */ new Map();
	for (const tag of tags) {
		const topic = reviewed ? canonicalTopic(tag) : baseCanonicalTopic(tag);
		if (topic) links.set(topic, {
			topic,
			reason: `Saved tag: ${tag}`,
			saved: true
		});
	}
	const text = `${titleEvidence(video)} ${video.genre ?? ""}`;
	for (const [topic, pattern] of TOPIC_RULES) {
		const match = text.match(pattern);
		if (match && !links.has(topic)) links.set(topic, {
			topic,
			reason: `Title/category: ${match[0]}`,
			saved: false
		});
	}
	if (video.remote?.kind === "youtube") {
		for (const link of youtubeDescriptionTopics(video)) if (!links.has(link.topic)) links.set(link.topic, {
			...link,
			saved: false
		});
	}
	const result = {
		tags,
		aliasRevision: getTopicAliasRevision(),
		links: [...links.values()],
		topics: [...links.keys()]
	};
	if (retain) activeCache.set(video, result);
	return result;
}
var topicEvidence = (video, tags, reviewed = true) => resolve(video, tags, true, reviewed).links;
/** Full-library aggregates reuse existing card evidence but never fill the
* resident per-card cache with an object/array bundle for every catalog title. */
var topicEvidenceForScan = (video, tags) => resolve(video, tags, false).links;
var topicsForVideo = (video, tags, reviewed = true) => resolve(video, tags, true, reviewed).topics;
/** Refresh only explicitly provider-authored interests. Unknown legacy tags,
* manual choices, and locked fields remain the owner's saved decisions. */
function reconcileProviderTopicTags(video, tags, provenance) {
	const kind = video.remote?.kind;
	if (kind !== "youtube" && kind !== "twitch" || provenance?.lockedFields?.includes("tags")) return tags;
	const evidence = new Set(topicsForVideo(video));
	const unsupported = (tag) => {
		const topic = canonicalTopic(tag);
		return Boolean(topic && provenance?.tags[tag] === `provider:${kind}` && !evidence.has(topic));
	};
	return tags.some(unsupported) ? tags.filter((tag) => !unsupported(tag)) : tags;
}
var WRITER_LEASE_PREFIX = "writer-lease:v1:";
var WriterBusyError = class extends Error {
	constructor() {
		super("Another app tab is updating this workspace. Your pending changes are kept; retry after that tab finishes.");
		this.name = "WriterBusyError";
	}
};
var WriterFenceError = class extends Error {
	constructor() {
		super("This tab no longer owns the write lease. No fenced transaction was applied; review current data before retrying.");
		this.name = "WriterFenceError";
	}
};
function validWriterToken(raw) {
	const row = raw;
	return !!row && row.version === 1 && typeof row.scope === "string" && row.scope.length <= 1024 && typeof row.owner === "string" && row.owner.length <= 128 && row.owner.length > 0 && (row.dirty === void 0 || typeof row.dirty === "boolean") && [
		row.generation,
		row.expiresAt,
		row.revision
	].every((value) => Number.isSafeInteger(value) && value >= 0);
}
/** One short same-origin lease per workspace. Generations fence every write in
* the same IDB transaction as its data. Idle tabs do not renew or poll. */
function createWriterLease(open, scope, options = {}) {
	if (!scope || scope.length > 1024) throw Error("Invalid writer scope.");
	const owner = options.owner ?? createLocalId("tab:"), now = options.now ?? Date.now, ttl = options.ttl ?? 15e3, key = WRITER_LEASE_PREFIX + scope;
	let active;
	let acquiring, ending;
	let state = {
		phase: "idle",
		generation: 0,
		revision: 0,
		message: ""
	};
	const listeners = /* @__PURE__ */ new Set(), commits = /* @__PURE__ */ new Set();
	const publish = (patch) => {
		state = {
			...state,
			...patch
		};
		for (const listener of listeners) listener();
	};
	let disposed = false;
	let channel, lastRemoteRevision = 0;
	const receive = (raw) => {
		const release = raw;
		if (release?.type === "released" && release.scope === scope && release.owner !== owner && state.phase === "busy") publish({
			phase: "idle",
			message: ""
		});
		const notice = raw;
		if (notice?.type !== "commit" || notice.scope !== scope || notice.owner === owner || typeof notice.owner !== "string" || notice.owner.length > 128 || notice.revision <= lastRemoteRevision || !Number.isSafeInteger(notice.generation) || !Number.isSafeInteger(notice.revision) || notice.revision < 1) return;
		lastRemoteRevision = notice.revision;
		for (const listener of commits) listener(notice);
	};
	const listen = () => {
		if (disposed || channel || typeof window === "undefined" || options.transport === false) return;
		if (typeof BroadcastChannel !== "undefined") {
			channel = new BroadcastChannel("reelcase-writers.v1");
			channel.onmessage = (event) => receive(event.data);
		}
	};
	async function update(body) {
		const db = await open();
		try {
			return await new Promise((resolve, reject) => {
				const tx = db.transaction("remote-cache", "readwrite"), store = tx.objectStore("remote-cache");
				let value, cause;
				tx.oncomplete = () => resolve(value);
				tx.onabort = tx.onerror = () => reject(cause ?? tx.error ?? Error("Writer lease storage failed."));
				const request = store.get(key);
				request.onsuccess = () => {
					try {
						body(store, request.result, (result) => {
							value = result;
						});
					} catch (error) {
						cause = error;
						tx.abort();
					}
				};
			});
		} finally {
			db.close();
		}
	}
	async function acquire() {
		const token = await update((store, raw, done) => {
			if (raw !== void 0 && !validWriterToken(raw)) throw Error("Unsupported writer lease. Existing data is retained.");
			const previous = raw;
			if (previous && previous.scope !== scope) throw Error("Writer scope mismatch.");
			if (previous && previous.expiresAt > now()) throw new WriterBusyError();
			const generation = (previous?.generation ?? 0) + 1;
			if (!Number.isSafeInteger(generation)) throw Error("Writer generations are exhausted.");
			const next = {
				version: 1,
				scope,
				owner,
				generation,
				expiresAt: now() + ttl,
				revision: previous?.revision ?? 0,
				dirty: previous?.dirty === true
			};
			store.put(next, key);
			done(next);
		});
		active = {
			token,
			users: 0,
			changed: token.dirty === true
		};
		publish({
			phase: "owned",
			generation: token.generation,
			revision: token.revision,
			message: "This tab is saving this workspace."
		});
		active.timer = setInterval(() => {
			const held = active;
			if (!held) return;
			update((store, raw, done) => {
				if (active !== held) {
					done();
					return;
				}
				assert(raw, held.token);
				store.put({
					...raw,
					expiresAt: now() + ttl
				}, key);
				done();
			}).catch((error) => {
				if (active === held) publish({
					phase: "error",
					message: error instanceof Error ? error.message : "Writer renewal failed."
				});
			});
		}, Math.max(100, Math.floor(ttl / 3)));
	}
	function assert(raw, token) {
		if (!validWriterToken(token) || token.scope !== scope || !validWriterToken(raw) || raw.scope !== scope || raw.owner !== token.owner || raw.generation !== token.generation || raw.expiresAt <= now()) throw new WriterFenceError();
	}
	function guard(tx, token, body, failed, dirty = true) {
		const request = tx.objectStore("remote-cache").get(key);
		request.onsuccess = () => {
			try {
				assert(request.result, token);
				if (dirty && !request.result.dirty) tx.objectStore("remote-cache").put({
					...request.result,
					dirty: true
				}, key);
				body();
			} catch (error) {
				publish({
					phase: "error",
					message: error instanceof Error ? error.message : "Writer fencing failed."
				});
				failed?.(error);
				try {
					tx.abort();
				} catch {}
			}
		};
	}
	async function finish() {
		const held = active;
		if (!held) return;
		clearInterval(held.timer);
		active = void 0;
		try {
			let released = false;
			const notice = await update((store, raw, done) => {
				if (!validWriterToken(raw) || raw.owner !== owner || raw.generation !== held.token.generation) {
					done(void 0);
					return;
				}
				released = true;
				const revision = raw.revision + (held.changed || raw.dirty ? 1 : 0);
				if (!Number.isSafeInteger(revision)) throw Error("Writer revisions are exhausted.");
				store.put({
					...raw,
					expiresAt: 0,
					revision,
					dirty: false
				}, key);
				done(held.changed || raw.dirty ? {
					type: "commit",
					scope,
					owner,
					generation: raw.generation,
					revision
				} : void 0);
			});
			if (notice) {
				listen();
				channel?.postMessage(notice);
				publish({ revision: notice.revision });
			}
			listen();
			if (released) channel?.postMessage({
				type: "released",
				scope,
				owner,
				generation: held.token.generation
			});
			if (state.phase !== "error") publish({
				phase: "idle",
				message: ""
			});
		} catch (error) {
			publish({
				phase: "error",
				message: error instanceof Error ? error.message : "Writer release failed."
			});
			throw error;
		}
	}
	async function run(work, mutates = true) {
		if (disposed) throw Error("This writer instance was closed. Reopen the workspace before retrying.");
		listen();
		if (ending) await ending;
		if (!active) {
			if (!acquiring) acquiring = acquire().finally(() => {
				acquiring = void 0;
			});
			try {
				await acquiring;
			} catch (error) {
				publish({
					phase: error instanceof WriterBusyError ? "busy" : "error",
					message: error instanceof Error ? error.message : "Writer unavailable."
				});
				throw error;
			}
		}
		const held = active;
		held.users++;
		try {
			const result = await work(held.token);
			if (mutates) held.changed = true;
			return result;
		} catch (error) {
			publish({
				phase: "error",
				message: error instanceof Error ? error.message : "Workspace save failed."
			});
			throw error;
		} finally {
			held.users--;
			if (!held.users) {
				ending = finish();
				try {
					await ending;
				} finally {
					ending = void 0;
				}
			}
		}
	}
	async function inspect() {
		const db = await open();
		try {
			return await new Promise((resolve, reject) => {
				const request = db.transaction("remote-cache").objectStore("remote-cache").get(key);
				request.onsuccess = () => {
					if (request.result !== void 0 && !validWriterToken(request.result)) {
						reject(Error("Unsupported writer lease."));
						return;
					}
					resolve(request.result);
				};
				request.onerror = () => reject(request.error);
			});
		} finally {
			db.close();
		}
	}
	return {
		owner,
		scope,
		run,
		guard,
		touch: (tx, token) => guard(tx, token, () => {}),
		assert,
		inspect,
		current: () => active?.token,
		markChanged: () => {
			if (active) active.changed = true;
		},
		getSnapshot: () => state,
		subscribe(listener) {
			listen();
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
		onCommit(listener) {
			listen();
			commits.add(listener);
			return () => {
				commits.delete(listener);
			};
		},
		close() {
			disposed = true;
			channel?.close();
			channel = void 0;
			if (active) clearInterval(active.timer);
		}
	};
}
var SignalConflictError = class extends Error {
	key;
	current;
	constructor(key, current) {
		super("Another tab saved a newer revision. Your edit is kept here. Choose which changes to keep before saving.");
		this.name = "SignalConflictError";
		this.key = key;
		this.current = current;
	}
};
function readSignalProfileRevision(raw) {
	if (raw && typeof raw === "object" && "version" in raw) {
		const row = raw;
		if (row.version !== 2 || !Number.isSafeInteger(row.revision) || row.revision < 0) throw Error("Unsupported saved channel setup.");
		return {
			version: 2,
			revision: row.revision,
			profile: normalizeSignalProfile(row.profile)
		};
	}
	return {
		version: 2,
		revision: 0,
		profile: normalizeSignalProfile(raw)
	};
}
function nextSignalRevision(current, input, now = Date.now()) {
	const draft = readSignalPack(input);
	if (current && current.id !== draft.id) throw Error("Announcement identity changed.");
	const changed = SIGNAL_PLATFORMS.filter((platform) => !current || current.drafts[platform] !== draft.drafts[platform] || current.shared[platform] !== draft.shared[platform]);
	if (current && !changed.length) return current;
	const revision = (current?.revision ?? 0) + 1;
	if (!Number.isSafeInteger(revision)) throw Error("Announcement revisions are exhausted.");
	const at = Math.max(now, draft.createdAt, (current?.updatedAt ?? 0) + 1), draftRevisions = { ...current?.draftRevisions };
	const history = [...current?.history ?? []];
	for (const platform of changed) {
		draftRevisions[platform] = (draftRevisions[platform] ?? 0) + 1;
		if (current) history.push({
			revision,
			at,
			platform,
			text: current.drafts[platform],
			...current.shared[platform] !== void 0 ? { shared: current.shared[platform] } : {}
		});
	}
	return {
		...draft,
		profile: current?.profile ?? draft.profile,
		createdAt: current?.createdAt ?? draft.createdAt,
		updatedAt: at,
		revision,
		draftRevisions,
		history: history.slice(-12)
	};
}
/** Conflict recovery reapplies only the fields this editor changed from its base.
* Other platforms from the newer saved pack remain intact. */
function rebaseSignalEdit(current, mine, base) {
	const drafts = { ...current.drafts }, shared = { ...current.shared };
	for (const platform of SIGNAL_PLATFORMS) {
		if (!base || mine.drafts[platform] !== base.drafts[platform]) drafts[platform] = mine.drafts[platform];
		if (!base || mine.shared[platform] !== base.shared[platform]) {
			if (mine.shared[platform] === void 0) delete shared[platform];
			else shared[platform] = mine.shared[platform];
		}
	}
	return {
		...current,
		drafts,
		shared
	};
}
function createSignalRevisions(open, owner) {
	const prefix = signalOwnerPrefix(owner), writer = createWriterLease(open, "signal:" + encodeURIComponent(owner));
	async function read(key) {
		const db = await open();
		try {
			return await new Promise((resolve, reject) => {
				const r = db.transaction("activity").objectStore("activity").get(key);
				r.onsuccess = () => resolve(r.result);
				r.onerror = () => reject(r.error);
			});
		} finally {
			db.close();
		}
	}
	async function save(key, input, expected) {
		if (!Number.isSafeInteger(expected) || expected < 0) throw Error("Invalid expected announcement revision.");
		const profile = key === prefix + "profile";
		if (!profile && !key.startsWith(prefix + "pack:")) throw Error("Announcement belongs to another workspace.");
		const incoming = profile ? normalizeSignalProfile(input) : readSignalPack(input);
		if (!profile && key !== prefix + incoming.id) throw Error("Announcement key does not match its identity.");
		return writer.run(async (token) => {
			const db = await open();
			try {
				return await new Promise((resolve, reject) => {
					const tx = db.transaction(["activity", "remote-cache"], "readwrite"), store = tx.objectStore("activity");
					let result, cause, didWrite = false;
					tx.oncomplete = () => {
						if (didWrite) writer.markChanged();
						resolve(result);
					};
					tx.onabort = tx.onerror = () => reject(cause ?? tx.error ?? Error("Announcement save failed. Existing text is retained."));
					const fail = (error) => {
						cause = error;
						tx.abort();
					};
					writer.guard(tx, token, () => {
						const request = store.get(key);
						request.onsuccess = () => {
							try {
								const current = profile ? readSignalProfileRevision(request.result) : request.result === void 0 ? void 0 : readSignalPack(request.result);
								if ((current?.revision ?? 0) !== expected) throw new SignalConflictError(key, current);
								if (profile) {
									const old = current;
									if (JSON.stringify(old.profile) === JSON.stringify(incoming)) {
										result = old;
										return;
									}
									if (!Number.isSafeInteger(expected + 1)) throw Error("Channel setup revisions are exhausted.");
									result = {
										version: 2,
										revision: expected + 1,
										profile: incoming
									};
								} else result = nextSignalRevision(current, incoming);
								if (result !== current) {
									writer.touch(tx, token);
									store.put(result, key);
									didWrite = true;
								}
							} catch (error) {
								fail(error);
							}
						};
					}, fail, false);
				});
			} finally {
				db.close();
			}
		}, false);
	}
	return {
		writer,
		save,
		read,
		profile: async () => readSignalProfileRevision(await read(prefix + "profile"))
	};
}
var DEFAULT_STUDIO_SETTINGS = {
	prompt: "",
	negative: "",
	steps: 20,
	seed: -1,
	size: 512
};
function studioSettings(value, legacyPrompt = "") {
	const row = value && typeof value === "object" ? value : {};
	return {
		...row.engine === "comfy" ? { engine: "comfy" } : {},
		...typeof row.model === "string" && row.model.length <= 240 ? { model: row.model } : {},
		prompt: typeof row.prompt === "string" ? row.prompt.slice(0, 4e3) : legacyPrompt.slice(0, 4e3),
		negative: typeof row.negative === "string" ? row.negative.slice(0, 4e3) : "",
		steps: Number.isInteger(row.steps) && row.steps >= 1 && row.steps <= 40 ? row.steps : 20,
		seed: Number.isInteger(row.seed) && row.seed >= -1 && row.seed <= 2147483647 ? row.seed : -1,
		size: [
			256,
			512,
			768
		].includes(row.size) ? row.size : 512
	};
}
function studioSettingsError(settings) {
	if (!settings || typeof settings.prompt !== "string" || settings.prompt.length > 4e3 || typeof settings.negative !== "string" || settings.negative.length > 4e3) return "Use prompts of up to 4,000 characters.";
	if (![
		256,
		512,
		768
	].includes(settings.size) || settings.engine !== void 0 && !["a1111", "comfy"].includes(settings.engine)) return "Choose a supported engine and image size.";
	if (settings.model !== void 0 && (typeof settings.model !== "string" || settings.model.length > 240 || /[\\/:\x00-\x1f]/.test(settings.model))) return "Choose an engine model name without paths or credentials.";
	if (!settings.prompt.trim()) return "Enter a prompt to describe your image.";
	if (!Number.isInteger(settings.steps) || settings.steps < 1 || settings.steps > 40) return "Steps must be a whole number from 1 to 40.";
	if (!Number.isInteger(settings.seed) || settings.seed < -1 || settings.seed > 2147483647) return "Seed must be −1 for random, or a whole number from 0 to 2147483647.";
}
/** AUTOMATIC1111 supplies the actual seed in JSON info, including random runs. */
function generatedSeed(info, fallback) {
	try {
		const row = typeof info === "string" ? JSON.parse(info) : info;
		const value = row?.seed ?? row?.all_seeds?.[0];
		if (Number.isInteger(value) && value >= 0 && value <= 2147483647) return value;
	} catch {}
	return fallback >= 0 ? fallback : void 0;
}
var MODEL_NOTE_BYTES = 32e3;
var MODEL_ROLES = [
	"checkpoint",
	"diffusion-model",
	"lora",
	"vae",
	"text-encoder",
	"pipeline"
];
var EMPTY_MODEL_NOTES = {
	version: 1,
	updatedAt: 0,
	notes: []
};
function readModelPreflight(raw) {
	const r = raw;
	if (!r || r.version !== 1 || !["a1111", "comfy"].includes(r.engine) || typeof r.name !== "string" || r.name.length > 240 || typeof r.family !== "string" || r.family.length > 60 || typeof r.role !== "string" || r.role.length > 60 || !Array.isArray(r.checks) || !r.checks.length || r.checks.length > 32 || !Number.isSafeInteger(r.bytes) || r.bytes < 0 || !r.hardware || !Number.isFinite(r.hardware.weightsGiB) || r.hardware.weightsGiB < 0 || typeof r.hardware.note !== "string" || r.hardware.note.length > 1e3) throw Error("Unsupported model compatibility report.");
	const checks = r.checks.map((c) => {
		if (!c || typeof c.label !== "string" || c.label.length > 200 || typeof c.detail !== "string" || c.detail.length > 1e3 || ![
			"pass",
			"fail",
			"unknown"
		].includes(c.state)) throw Error("Invalid model compatibility checklist.");
		return {
			label: c.label,
			state: c.state,
			detail: c.detail
		};
	});
	const ready = r.ready === true && checks.every((c) => c.state !== "fail") && (r.engine === "a1111" ? ["sd1", "sdxl"].includes(r.family) && r.role === "checkpoint" : r.family === "qwen-image-2.1" && r.role === "diffusion-model");
	let source;
	if (r.source) {
		source = {
			url: canonicalModelUrl(r.source.url),
			revision: r.source.revision
		};
		if (!/^[a-f0-9]{40}$/.test(source.revision)) throw Error("Invalid installation revision.");
		if (r.source.recordedDigest && /^[a-f0-9]{64}$/.test(r.source.recordedDigest)) source.recordedDigest = r.source.recordedDigest;
	}
	return {
		version: 1,
		engine: r.engine,
		name: r.name,
		family: r.family,
		role: r.role,
		ready,
		bytes: r.bytes,
		checks,
		hardware: {
			weightsGiB: r.hardware.weightsGiB,
			note: r.hardware.note
		},
		...source ? { source } : {}
	};
}
function canonicalModelUrl(value) {
	const u = new URL(value);
	if (u.protocol !== "https:" || u.hostname !== "huggingface.co" || u.username || u.password || u.port || u.search || u.hash) throw Error("Use a public HTTPS Hugging Face repository or file URL without credentials or query parameters.");
	const parts = decodeURIComponent(u.pathname).split("/").filter(Boolean);
	if (parts.length < 2 || !parts.slice(0, 2).every((p) => /^[\w.-]+$/.test(p)) || parts.some((p) => p === "." || p === "..") || parts.length > 2 && (!["blob", "resolve"].includes(parts[2]) || parts.length < 5 || !parts.slice(3).every((p) => /^[\w .-]+$/.test(p)))) throw Error("Use a model repository or an exact model file page.");
	return "https://huggingface.co/" + parts.map(encodeURIComponent).join("/");
}
function parseModelNote(raw) {
	const r = raw;
	if (!r || r.version !== 1 || typeof r.url !== "string" || r.url.length > 2048) throw Error("Unsupported model requirements note.");
	const string = (key, max) => {
		const value = r[key];
		if (typeof value !== "string" || value.length > max) throw Error("Invalid " + key + " in model requirements.");
		return value.trim();
	};
	const revision = string("revision", 80), file = string("file", 180), license = string("license", 200), requirements = string("requirements", 4e3), hardware = string("hardware", 500);
	if (revision && !/^[\w.-]+$/.test(revision) || file && (!/^[\w .-]+$/.test(file) || file.includes(".."))) throw Error("Use a revision label and a filename without paths.");
	if (![
		"sd1",
		"sdxl",
		"qwen-image-2.1",
		"other",
		"unknown"
	].includes(r.family) || ![
		"a1111",
		"comfy",
		"other",
		"unknown"
	].includes(r.engine) || !MODEL_ROLES.includes(r.role)) throw Error("Select a supported note family, engine and artifact role.");
	return {
		version: 1,
		url: canonicalModelUrl(r.url),
		revision,
		file,
		license,
		family: r.family,
		engine: r.engine,
		role: r.role,
		requirements,
		hardware
	};
}
function importModelNote(text) {
	if (text.length > 32e3 || new TextEncoder().encode(text).length > 32e3) throw Error("Requirements notes must be smaller than 32 KB.");
	return parseModelNote(JSON.parse(text));
}
function readModelNotes(raw) {
	const r = raw;
	if (!r || r.version !== 1 || !Number.isSafeInteger(r.updatedAt) || r.updatedAt < 0 || !Array.isArray(r.notes) || r.notes.length > 64) throw Error("Unsupported model requirements storage.");
	const seen = /* @__PURE__ */ new Set();
	const notes = r.notes.map((value) => {
		const note = parseModelNote(value);
		if (!Number.isSafeInteger(value.savedAt) || value.savedAt < 0 || seen.has(note.url + "|" + note.file + "|" + note.revision)) throw Error("Invalid or duplicate saved model note.");
		seen.add(note.url + "|" + note.file + "|" + note.revision);
		return {
			...note,
			savedAt: value.savedAt
		};
	});
	return {
		version: 1,
		updatedAt: r.updatedAt,
		notes
	};
}
function saveModelNote(ledger, raw, now = Date.now()) {
	const note = parseModelNote(raw), same = (n) => n.url === note.url && n.file === note.file && n.revision === note.revision, notes = ledger.notes.filter((n) => !same(n));
	if (notes.length >= 64) throw Error("All 64 note slots are used. Export or remove a note before adding one.");
	return readModelNotes({
		version: 1,
		updatedAt: Math.max(now, ledger.updatedAt + 1),
		notes: [{
			...note,
			savedAt: now
		}, ...notes]
	});
}
function modelNoteChecklist(note, review) {
	const match = !!review && review.name === note.file;
	return [
		{
			label: "Exact repository revision",
			verified: /^[a-f0-9]{40}$/.test(note.revision),
			detail: /^[a-f0-9]{40}$/.test(note.revision) ? "Pinned revision recorded; content verification is separate." : "Branch, missing or ambiguous revision remains unverified."
		},
		{
			label: "Artifact role",
			verified: match && review.role === note.role,
			detail: note.role === "checkpoint" ? "Full checkpoint, not a LoRA/VAE/encoder." : note.role === "diffusion-model" ? "Diffusion weights require matching text encoder and VAE." : note.role === "pipeline" ? "A pipeline is a multi-component package; this installer cannot run arbitrary pipeline code." : note.role + " is an add-on/component, not a full checkpoint."
		},
		{
			label: "Architecture and engine",
			verified: match && review.ready && review.family === note.family && review.engine === note.engine,
			detail: match ? "Compared with the inspected local model." : "Owner-entered requirements are unverified until the exact installed file is inspected."
		},
		{
			label: "License review",
			verified: false,
			detail: note.license ? "Recorded license: " + note.license + ". Review publisher terms; text is not legal verification." : "License is missing; review the publisher model card."
		},
		{
			label: "Hardware suitability",
			verified: false,
			detail: note.hardware || "No verified runtime/VRAM measurement is recorded."
		}
	];
}
var modelLabel = (v) => typeof v === "string" && v.trim() && v.length <= 240 && !/[\\/:\x00-\x1f]/.test(v) ? v.trim() : void 0;
var modelIdentity = (v) => v.replace(/ \[[a-f0-9]+\]$/i, "").replace(/\.(safetensors|ckpt)$/i, "");
function provenance(raw) {
	const r = raw;
	if (!r || !["a1111", "comfy"].includes(r.engine) || ![
		256,
		512,
		768
	].includes(r.width) || r.height !== r.width) throw Error("Unsupported recipe engine or dimensions.");
	const out = {
		engine: r.engine,
		width: r.width,
		height: r.height
	};
	for (const key of [
		"modelName",
		"family",
		"sampler",
		"scheduler"
	]) if (r[key] !== void 0) {
		const value = modelLabel(r[key]);
		if (!value) throw Error("Invalid recipe " + key + ".");
		out[key] = value;
	}
	for (const [key, re] of [
		["revision", /^[a-f0-9]{40}$/],
		["sha256", /^[a-f0-9]{64}$/],
		["engineHash", /^[a-f0-9]{8,64}$/]
	]) if (r[key] !== void 0) {
		if (typeof r[key] !== "string" || !re.test(r[key])) throw Error("Invalid recipe " + key + ".");
		out[key] = r[key];
	}
	if (r.source !== void 0) {
		if (typeof r.source !== "string" || r.source.length > 2048) throw Error("Invalid recipe model source.");
		out.source = canonicalModelUrl(r.source);
	}
	for (const key of ["guidance", "denoise"]) if (r[key] !== void 0) {
		if (!Number.isFinite(r[key]) || r[key] < 0 || r[key] > (key === "denoise" ? 1 : 100)) throw Error("Invalid recipe " + key + ".");
		out[key] = r[key];
	}
	return out;
}
function recipeDocument(recipe) {
	return {
		format: "realhub-studio-recipe",
		version: 2,
		...parseRecipe(JSON.stringify({
			format: "realhub-studio-recipe",
			version: 2,
			...recipe
		}))
	};
}
/** Imports are an allow-list of form values, never native engine instructions. */
function parseRecipe(text) {
	if (text.length > 64e3 || new TextEncoder().encode(text).length > 64e3) throw new Error("Choose a recipe JSON file smaller than 64 KB.");
	let data;
	try {
		data = JSON.parse(text);
	} catch {
		throw new Error("This file is not valid JSON. Choose an exported Realhub image recipe.");
	}
	if (data?.format !== "realhub-studio-recipe" || ![1, 2].includes(data.version) || !data.settings || typeof data.settings !== "object") throw new Error("This is not a supported Realhub image recipe.");
	const row = data.settings;
	if (typeof row.prompt !== "string" || row.prompt.length > 4e3 || typeof row.negative !== "string" || row.negative.length > 4e3 || ![
		256,
		512,
		768
	].includes(row.size)) throw new Error("The recipe contains invalid prompts or image dimensions.");
	const failure = studioSettingsError(row);
	if (failure) throw new Error(failure);
	if (data.version === 2 && data.provenance !== void 0) {
		const p = provenance(data.provenance);
		if (p.engine !== (row.engine ?? "a1111") || p.width !== row.size) throw Error("Recipe provenance disagrees with its engine or dimensions.");
	}
	return {
		name: typeof data.name === "string" && data.name.trim() ? data.name.trim().slice(0, 80) : row.prompt.trim().slice(0, 80),
		settings: studioSettings(row),
		...modelLabel(data.checkpoint) ? { checkpoint: modelLabel(data.checkpoint) } : {},
		...data.version === 2 && data.provenance !== void 0 ? { provenance: provenance(data.provenance) } : {}
	};
}
function restoreRecipes(text) {
	if (!text || text.length > 512e3) return [];
	try {
		const data = JSON.parse(text);
		if (!Array.isArray(data)) return [];
		const rows = [];
		for (const row of data.slice(0, 8)) {
			if (typeof row?.id !== "string" || row.id.length > 100 || !Number.isFinite(row.savedAt) || row.savedAt <= 0 || rows.some((item) => item.id === row.id)) continue;
			try {
				rows.push({
					...parseRecipe(JSON.stringify({
						...row,
						format: "realhub-studio-recipe",
						version: 2
					})),
					id: row.id,
					savedAt: row.savedAt
				});
			} catch {}
		}
		return rows;
	} catch {
		return [];
	}
}
function generatedCheckpoint(info) {
	try {
		const value = (typeof info === "string" ? JSON.parse(info) : info)?.sd_model_name;
		return modelLabel(value);
	} catch {
		return;
	}
}
/** Engine observations and the exact inspected install are separate evidence. */
function generatedProvenance(settings, info, review) {
	let row = {};
	try {
		const r = typeof info === "string" ? JSON.parse(info) : info;
		if (r && typeof r === "object") row = r;
	} catch {}
	const engine = settings.engine ?? "a1111", modelName = generatedCheckpoint(row) ?? modelLabel(settings.model);
	const out = {
		engine,
		width: settings.size,
		height: settings.size,
		...modelName ? { modelName } : {}
	};
	for (const [key, value] of [["sampler", row.sampler_name ?? row.sampler], ["scheduler", row.scheduler]]) {
		const clean = modelLabel(value);
		if (clean) out[key] = clean;
	}
	if (typeof row.cfg_scale === "number" && Number.isFinite(row.cfg_scale) && row.cfg_scale >= 0 && row.cfg_scale <= 100) out.guidance = row.cfg_scale;
	if (typeof row.denoising_strength === "number" && row.denoising_strength >= 0 && row.denoising_strength <= 1) out.denoise = row.denoising_strength;
	if (typeof row.sd_model_hash === "string" && /^[a-f0-9]{8,64}$/.test(row.sd_model_hash)) out.engineHash = row.sd_model_hash;
	if (review?.ready && review.engine === engine && modelName && modelIdentity(review.name) === modelIdentity(modelName)) {
		out.family = review.family;
		if (review.source) {
			out.source = review.source.url;
			out.revision = review.source.revision;
			if (review.source.recordedDigest) out.sha256 = review.source.recordedDigest;
		}
	}
	return provenance(out);
}
function recipeLoadReview(recipe, engine, models, selection, review) {
	const sourceEngine = recipe.provenance?.engine ?? recipe.settings.engine ?? "a1111", expected = recipe.provenance?.modelName ?? recipe.settings.model ?? recipe.checkpoint;
	const exact = expected ? models.find((name) => modelIdentity(name) === modelIdentity(expected)) : void 0;
	const chosen = selection === void 0 ? exact : models.includes(selection) ? selection : void 0;
	const p = recipe.provenance, qwen = chosen?.toLowerCase().includes("turbo"), warnings = [];
	if (sourceEngine !== engine) warnings.push("This recipe uses a different engine. Switch the image engine and check it before loading.");
	if (!chosen) warnings.push("The recorded model is missing or unverified. Choose an installed compatible model explicitly.");
	if (chosen && (!expected || modelIdentity(chosen) !== modelIdentity(expected))) warnings.push("You selected a different model. Its output will differ from this recipe.");
	const supported = {
		sampler: engine === "comfy" ? "euler" : "Euler",
		scheduler: engine === "comfy" ? "simple" : "Automatic",
		guidance: engine === "comfy" ? qwen ? 1 : 4 : 7,
		denoise: 1
	};
	if (!p?.sampler || !p?.scheduler || p.guidance === void 0) warnings.push("Sampler, scheduler or guidance was not recorded. The current supported engine parameters will be used.");
	else if (p.sampler !== supported.sampler || p.scheduler !== supported.scheduler || p.guidance !== supported.guidance || p.denoise !== void 0 && p.denoise !== supported.denoise) warnings.push("This engine form cannot apply the recorded sampler, scheduler, guidance or denoise. Only the displayed supported parameters can be loaded.");
	const matching = review?.ready && review.engine === engine && chosen && modelIdentity(review.name) === modelIdentity(chosen);
	if (p?.sha256 && (!matching || review.source?.recordedDigest !== p.sha256)) warnings.push("The recorded model digest does not match a reviewed install. Review the model before generation.");
	if (p?.revision && (!matching || review.source?.revision !== p.revision)) warnings.push("The recorded repository revision has not been matched to a reviewed install.");
	if (p?.engineHash && (!matching || !review.source?.recordedDigest?.startsWith(p.engineHash))) warnings.push("The engine-reported model hash has not been independently matched.");
	if (!p?.sha256 && !p?.engineHash) warnings.push("No model hash was recorded. A matching filename alone does not verify identical weights.");
	if (recipe.settings.seed === -1) warnings.push("The seed is random or was not returned. Loading cannot reproduce the same noise seed.");
	return {
		sourceEngine,
		expected,
		chosen,
		warnings,
		supported,
		canLoad: sourceEngine === engine && !!chosen,
		settings: chosen ? {
			...studioSettings(recipe.settings),
			engine,
			model: chosen
		} : void 0
	};
}
var STUDIO_OUTPUT_LIMITS = {
	previewBytes: 10 * 1024 ** 2,
	saved: 32,
	savedBytes: 128 * 1024 ** 2
};
var validId = (id) => typeof id === "string" && /^[\w:-]{1,100}$/.test(id);
function readLedger(raw) {
	if (raw === void 0) return {
		version: 1,
		rows: []
	};
	const value = raw;
	if (!value || value.version !== 1 || !Array.isArray(value.rows) || value.rows.length > STUDIO_OUTPUT_LIMITS.saved) throw Error("Unsupported saved image index. Existing images were retained.");
	const seen = /* @__PURE__ */ new Set();
	const rows = value.rows.map((row) => {
		if (!row || !validId(row.id) || seen.has(row.id) || !Number.isSafeInteger(row.savedAt) || row.savedAt < 0 || !Number.isSafeInteger(row.bytes) || row.bytes < 8 || row.bytes > STUDIO_OUTPUT_LIMITS.previewBytes || !Number.isFinite(row.seconds) || row.seconds < 0) throw Error("Saved image index is unreadable. Existing images were retained.");
		seen.add(row.id);
		const { format: _format, version: _version, ...recipe } = recipeDocument(row);
		return {
			...recipe,
			id: row.id,
			savedAt: row.savedAt,
			bytes: row.bytes,
			seconds: row.seconds,
			...Number.isSafeInteger(row.seed) && row.seed >= 0 ? { seed: row.seed } : {}
		};
	});
	if (rows.reduce((sum, row) => sum + row.bytes, 0) > STUDIO_OUTPUT_LIMITS.savedBytes) throw Error("Saved image index exceeds its declared budget.");
	return {
		version: 1,
		rows
	};
}
/** The ledger and selected PNG commit together. A read never loads other saved image bytes.
* Read-modify-write stays in one IDB transaction so concurrent tabs cannot overrun the budget. */
function createStudioOutputs(open, owner) {
	if (!owner || owner.length > 512) throw Error("A current app user is required.");
	const prefix = "studio-outputs:v1:" + encodeURIComponent(owner) + ":", key = prefix + "index";
	async function transaction(mode, run) {
		const db = await open();
		try {
			return await new Promise((resolve, reject) => {
				const tx = db.transaction("activity", mode), store = tx.objectStore("activity");
				let value, cause;
				tx.oncomplete = () => resolve(value);
				tx.onabort = tx.onerror = () => reject(cause ?? tx.error ?? Error("Saved image storage failed. Previous saved images were retained."));
				run(store, (result) => {
					value = result;
				}, (error) => {
					cause = error;
					tx.abort();
				});
			});
		} finally {
			db.close();
		}
	}
	async function list() {
		return transaction("readonly", (store, done, fail) => {
			const request = store.get(key);
			request.onsuccess = () => {
				try {
					done(readLedger(request.result).rows);
				} catch (error) {
					fail(error);
				}
			};
		});
	}
	async function save(image) {
		if (!validId(image.id) || image.blob.type !== "image/png" || image.blob.size > STUDIO_OUTPUT_LIMITS.previewBytes) throw Error("Choose a generated PNG within the 10 MiB preview budget.");
		if (new Uint8Array(await image.blob.slice(0, 8).arrayBuffer()).join(",") !== "137,80,78,71,13,10,26,10") throw Error("The generated file is not a PNG.");
		const { format: _format, version: _version, ...recipe } = recipeDocument({
			name: image.settings.prompt.slice(0, 80),
			settings: image.settings,
			checkpoint: image.checkpoint,
			provenance: image.provenance
		});
		const row = {
			...recipe,
			id: image.id,
			savedAt: Date.now(),
			bytes: image.blob.size,
			seconds: image.seconds,
			...image.seed !== void 0 ? { seed: image.seed } : {}
		};
		return transaction("readwrite", (store, done, fail) => {
			const request = store.get(key);
			request.onsuccess = () => {
				try {
					const current = readLedger(request.result);
					if (current.rows.find((item) => item.id === row.id)) {
						done(current.rows);
						return;
					}
					if (current.rows.length >= STUDIO_OUTPUT_LIMITS.saved || current.rows.reduce((sum, item) => sum + item.bytes, 0) + row.bytes > STUDIO_OUTPUT_LIMITS.savedBytes) throw Error("Saved image storage is full (32 images / 128 MiB). Download and explicitly remove a saved image before saving another.");
					const rows = readLedger({
						version: 1,
						rows: [row, ...current.rows]
					}).rows;
					store.put(image.blob, prefix + "png:" + row.id);
					store.put({
						version: 1,
						rows
					}, key);
					done(rows);
				} catch (error) {
					fail(error);
				}
			};
		});
	}
	async function load(id) {
		if (!validId(id)) throw Error("Invalid saved image.");
		const blob = await transaction("readonly", (store, done, fail) => {
			const request = store.get(prefix + "png:" + id);
			request.onsuccess = () => {
				const blob = request.result;
				done(blob instanceof Blob && blob.type === "image/png" && blob.size <= STUDIO_OUTPUT_LIMITS.previewBytes ? blob : void 0);
			};
		});
		if (!blob || blob.size < 8) return;
		if (new Uint8Array(await blob.slice(0, 8).arrayBuffer()).join(",") !== "137,80,78,71,13,10,26,10") throw Error("Saved PNG is unreadable. Its receipt and settings were retained.");
		return blob;
	}
	async function remove(id) {
		if (!validId(id)) throw Error("Invalid saved image.");
		return transaction("readwrite", (store, done, fail) => {
			const request = store.get(key);
			request.onsuccess = () => {
				try {
					const rows = readLedger(request.result).rows.filter((row) => row.id !== id);
					store.delete(prefix + "png:" + id);
					store.put({
						version: 1,
						rows
					}, key);
					done(rows);
				} catch (error) {
					fail(error);
				}
			};
		});
	}
	return {
		list,
		save,
		load,
		remove
	};
}
/** Construct an official room address from an identifier, never an arbitrary
* stored URL. Browsing metadata does not authorize a restream or iframe. */
function myFreeCamsRoomUrl(remote) {
	if (remote?.kind !== "myfreecams") return;
	let candidates = [remote.videoId, remote.channelName];
	try {
		const url = new URL(remote.watchUrl ?? "");
		if (url.protocol === "https:" && [
			"www.myfreecams.com",
			"myfreecams.com",
			"app.myfreecams.com"
		].includes(url.hostname)) candidates = [
			...candidates,
			decodeURIComponent(url.hash.slice(1)),
			decodeURIComponent(url.pathname.slice(1))
		];
	} catch {}
	const name = candidates.find((value) => typeof value === "string" && /^[a-z0-9_]{1,50}$/i.test(value) && value.toLowerCase() !== "homepage");
	return name ? `https://app.myfreecams.com/${encodeURIComponent(name)}` : void 0;
}
var EMPTY_PROVIDER_VIEWING = {
	version: 1,
	updatedAt: 0,
	choices: {}
};
var known = (id) => typeof id === "string" && ADULT_PULL_PROVIDERS.includes(id);
var providerCanEmbed = (id) => {
	const r = adultAdapter(id);
	return !!r && (r.player === "embed" || r.player === "mixed" || r.pageView === true);
};
/** Persist only canonical first-party destinations. Tracking/auth parameters,
* credentials, arbitrary hosts and embed URLs never enter this ledger. */
function safeProviderUrl(provider, value) {
	if (!known(provider) || typeof value !== "string" || value.length > 2048) return;
	try {
		const u = new URL(value);
		if (u.protocol !== "https:" || u.username || u.password || u.port) return;
		const host = u.hostname.toLowerCase(), p = u.pathname;
		if (provider === "myfreecams") {
			if (![
				"myfreecams.com",
				"www.myfreecams.com",
				"app.myfreecams.com"
			].includes(host)) return;
			const name = host === "app.myfreecams.com" ? p.slice(1) : u.hash.slice(1);
			if (!name || name.toLowerCase() === "homepage") return "https://app.myfreecams.com/";
			return /^[a-z0-9_]{1,50}$/i.test(name) ? "https://app.myfreecams.com/" + name : void 0;
		}
		if (provider === "eporner" && ["www.eporner.com", "eporner.com"].includes(host) && (p === "/" || /^\/video-[a-z0-9]+(?:\/[^?#]*)?$/i.test(p))) return "https://www.eporner.com" + p;
		if (provider === "redtube" && ["www.redtube.com", "redtube.com"].includes(host) && (p === "/" || /^\/\d+(?:\/[^?#]*)?$/.test(p))) return "https://www.redtube.com" + p;
		if (provider === "chaturbate" && ["www.chaturbate.com", "chaturbate.com"].includes(host) && (p === "/" || /^\/[a-z0-9_]+\/?$/i.test(p))) return "https://chaturbate.com" + p;
		if (provider === "redgifs" && ["www.redgifs.com", "redgifs.com"].includes(host) && (p === "/" || /^\/watch\/[a-z0-9_-]+\/?$/i.test(p))) return "https://www.redgifs.com" + p;
		if (provider === "reddit" && [
			"www.reddit.com",
			"reddit.com",
			"old.reddit.com"
		].includes(host) && (p === "/" || /^\/r\/[a-z0-9_]+\/(?:comments\/[a-z0-9]+(?:\/[^?#]*)?)?$/i.test(p))) return "https://www.reddit.com" + p;
		if (provider === "booru" && [
			"rule34.xxx",
			"gelbooru.com",
			"realbooru.com",
			"xbooru.com",
			"tbib.org",
			"hypnohub.net"
		].includes(host)) {
			if (p === "/") return u.origin + "/";
			if (p === "/index.php" && u.searchParams.get("page") === "post" && u.searchParams.get("s") === "view" && /^\d+$/.test(u.searchParams.get("id") ?? "")) return u.origin + "/index.php?page=post&s=view&id=" + u.searchParams.get("id");
		}
		if (provider === "booru" && host === "e621.net" && (p === "/" || /^\/posts\/\d+\/?$/.test(p))) return u.origin + p;
	} catch {}
}
function officialAdultUrl(remote) {
	if (!remote || !known(remote.kind)) return;
	const safe = safeProviderUrl(remote.kind, remote.watchUrl);
	if (safe) return safe;
	const id = remote.videoId ?? "";
	if (remote.kind === "myfreecams") return myFreeCamsRoomUrl(remote);
	if (remote.kind === "eporner" && /^[a-z0-9]+$/i.test(id)) return "https://www.eporner.com/video-" + id + "/";
	if (remote.kind === "redtube" && /^\d+$/.test(id)) return "https://www.redtube.com/" + id;
	if (remote.kind === "chaturbate" && /^[a-z0-9_]{1,50}$/i.test(id)) return "https://chaturbate.com/" + id + "/";
	if (remote.kind === "redgifs" && /^[a-z0-9_-]+$/i.test(id)) return "https://www.redgifs.com/watch/" + id;
	return adultAdapter(remote.kind)?.home;
}
function parseProviderViewing(raw) {
	const r = raw;
	if (!r || r.version !== 1 || !Number.isSafeInteger(r.updatedAt) || r.updatedAt < 0 || !r.choices || typeof r.choices !== "object" || Array.isArray(r.choices) || Object.keys(r.choices).length > 7) throw Error("Unsupported provider viewing preferences.");
	const choices = {};
	for (const [id, v] of Object.entries(r.choices)) {
		if (!known(id) || !v || !["embedded", "website"].includes(v.mode) || v.mode === "embedded" && !providerCanEmbed(id) || !Number.isSafeInteger(v.at) || v.at < 0) throw Error("Invalid provider viewing choice.");
		const url = safeProviderUrl(id, v.url);
		if (!url) throw Error("Invalid official provider URL.");
		choices[id] = {
			mode: v.mode,
			url,
			at: v.at
		};
	}
	return {
		version: 1,
		updatedAt: r.updatedAt,
		choices
	};
}
function normalizeProviderViewing(raw) {
	try {
		return parseProviderViewing(raw);
	} catch {
		return EMPTY_PROVIDER_VIEWING;
	}
}
function newestProviderViewing(a, b) {
	const left = normalizeProviderViewing(a), right = normalizeProviderViewing(b);
	return right.updatedAt >= left.updatedAt ? right : left;
}
function chooseProviderView(ledger, id, mode, url, now = Date.now()) {
	const safe = safeProviderUrl(id, url);
	if (!safe) throw Error("Use a valid official provider link.");
	if (ledger.choices[id]?.mode === mode && ledger.choices[id]?.url === safe) return ledger;
	return parseProviderViewing({
		version: 1,
		updatedAt: Math.max(now, ledger.updatedAt + 1),
		choices: {
			...ledger.choices,
			[id]: {
				mode,
				url: safe,
				at: now
			}
		}
	});
}
function forgetProviderView(ledger, id, now = Date.now()) {
	if (!ledger.choices[id]) return ledger;
	const choices = { ...ledger.choices };
	delete choices[id];
	return {
		...ledger,
		choices,
		updatedAt: Math.max(now, ledger.updatedAt + 1)
	};
}
var providerLoginGuidance = (id) => ({
	summary: "Use the official site in its own tab and your usual browser profile. Browser cookie restrictions can make embedded sign-in repeat; full screen is still an embedded page.",
	boundary: "A login in another tab or browser does not guarantee that this embedded view is authenticated. Realhub cannot inspect, copy or repair provider cookies or credentials.",
	specific: id === "myfreecams" ? "MyFreeCams has no integrated video player here. The optional whole-page view may refuse sign-in or share/profile panels. Keep those panels on their official top-level site." : "If the provider blocks the embedded player, continue on its official site. Provider access restrictions still apply."
});
/** The browse index never retains provider descriptions or comment transcripts.
* Full records stay on disk and are fetched only for the selected video. */
function catalogCard(video) {
	video = repairLegacyYoutubeDate(video);
	if (!video.remote || video.detailsOnDisk && !video.description && !video.remote.comments && (video.tagline?.length ?? 0) <= 240 && (video.remote.thumbFallbacks?.length ?? 0) <= 4) return video;
	const { description: _description, tagline, remote, ...card } = video;
	const { comments: _comments, thumbFallbacks, ...reference } = remote;
	return {
		...card,
		detailsOnDisk: true,
		...tagline ? { tagline: tagline.slice(0, 240) } : {},
		remote: {
			...reference,
			...thumbFallbacks ? { thumbFallbacks: thumbFallbacks.slice(0, 4) } : {}
		}
	};
}
/** Listing metadata wins over stale disk metadata; heavier details survive
* sparse provider refreshes and full-cache saves of lightweight cards. */
function withCatalogDetails(card, saved) {
	if (!saved) return card;
	return {
		...saved,
		...card,
		detailsOnDisk: saved.detailsOnDisk && card.detailsOnDisk,
		description: card.description ?? saved.description,
		tagline: card.detailsOnDisk ? saved.tagline ?? card.tagline : card.tagline ?? saved.tagline,
		remote: card.remote ? {
			...saved.remote,
			...card.remote,
			...!card.remote.youtubeTagsCheckedAt && saved.remote?.youtubeTagsCheckedAt ? {
				youtubeKeywords: saved.remote.youtubeKeywords,
				youtubeTagsCheckedAt: saved.remote.youtubeTagsCheckedAt,
				youtubeTagSummary: saved.remote.youtubeTagSummary
			} : {},
			comments: card.remote.comments ?? saved.remote?.comments,
			thumbFallbacks: card.detailsOnDisk ? saved.remote?.thumbFallbacks ?? card.remote.thumbFallbacks : card.remote.thumbFallbacks ?? saved.remote?.thumbFallbacks
		} : saved.remote
	};
}
/** Return the best few rows without retaining or sorting a huge candidate list.
* `compare(a, b) < 0` means a should appear before b. */
function createBoundedPicks(limit, compare) {
	const heap = [];
	let finished = false;
	const add = (row) => {
		if (finished) throw new TypeError("Bounded selection already finished");
		if (limit <= 0) return;
		if (heap.length < limit) {
			heap.push(row);
			let child = heap.length - 1;
			while (child > 0) {
				const parent = Math.floor((child - 1) / 2);
				if (compare(heap[parent], heap[child]) >= 0) break;
				[heap[parent], heap[child]] = [heap[child], heap[parent]];
				child = parent;
			}
			return;
		}
		if (compare(row, heap[0]) >= 0) return;
		heap[0] = row;
		let parent = 0;
		while (true) {
			const left = parent * 2 + 1;
			if (left >= heap.length) break;
			const right = left + 1;
			const worse = right < heap.length && compare(heap[right], heap[left]) > 0 ? right : left;
			if (compare(heap[parent], heap[worse]) >= 0) break;
			[heap[parent], heap[worse]] = [heap[worse], heap[parent]];
			parent = worse;
		}
	};
	return {
		add,
		finish: () => {
			finished = true;
			return heap.sort(compare);
		}
	};
}
function takeBestMapped(items, limit, project, compare) {
	if (limit <= 0) return [];
	const picks = createBoundedPicks(limit, compare);
	for (const item of items) {
		const row = project(item);
		if (row != null) picks.add(row);
	}
	return picks.finish();
}
var completed$1 = /* @__PURE__ */ new WeakMap();
var pending$1 = /* @__PURE__ */ new WeakMap();
function builder() {
	const index = {
		bySource: /* @__PURE__ */ new Map(),
		byChannel: /* @__PURE__ */ new Map(),
		overlap: /* @__PURE__ */ new Map(),
		newestBySource: /* @__PURE__ */ new Map(),
		newestByChannel: /* @__PURE__ */ new Map(),
		ownerSamples: /* @__PURE__ */ new Map(),
		distinctVideos: 0,
		duplicateRows: 0,
		duplicateGroups: 0
	};
	const seen = /* @__PURE__ */ new Set(), duplicates = /* @__PURE__ */ new Set();
	const increment = (map, key) => map.set(key, (map.get(key) ?? 0) + 1);
	const visit = (video, position) => {
		if (video.remote?.kind !== "youtube" || video.isSample) return;
		const key = youtubeVideoKey(video) ?? video.id;
		if (seen.has(key)) {
			index.duplicateRows++;
			duplicates.add(key);
			return;
		}
		seen.add(key);
		if (youtubeContentKind(video) === "live" || youtubeContentKind(video) === "upcoming") return;
		const channel = video.remote.channelId;
		if (channel) {
			increment(index.byChannel, channel);
			index.newestByChannel.set(channel, Math.max(index.newestByChannel.get(channel) ?? 0, youtubePublicationTime(video)));
			let samples = index.ownerSamples.get(channel);
			if (!samples) index.ownerSamples.set(channel, samples = []);
			const count = index.byChannel.get(channel);
			if (samples.length < 64) samples.push(position);
			else {
				const slot = (Math.imul(position + 1, 2654435761) >>> 0) % count;
				if (slot < samples.length) samples[slot] = position;
			}
		}
		const addSource = (source) => {
			increment(index.bySource, source);
			index.newestBySource.set(source, Math.max(index.newestBySource.get(source) ?? 0, youtubePublicationTime(video)));
			if (!channel) return;
			let channels = index.overlap.get(source);
			if (!channels) index.overlap.set(source, channels = /* @__PURE__ */ new Map());
			increment(channels, channel);
		};
		addSource(video.folderId);
		const sources = video.remote.sourceIds;
		if (sources) for (let i = 0; i < sources.length; i++) {
			const source = sources[i];
			if (source !== video.folderId && sources.indexOf(source) === i) addSource(source);
		}
	};
	return {
		visit,
		finish() {
			index.distinctVideos = seen.size;
			index.duplicateGroups = duplicates.size;
			return index;
		}
	};
}
/** Disk-sized catalogs yield between short tasks; concurrent readers share work. */
function youtubeCoverageIndexAsync(videos, signal) {
	if (signal?.aborted) return Promise.reject(signal.reason);
	const cached = completed$1.get(videos);
	if (cached) return Promise.resolve(cached);
	let job = pending$1.get(videos);
	if (!job) {
		const work = builder(), controller = new AbortController();
		const created = {
			controller,
			readers: 0,
			durable: false,
			promise: void 0
		};
		const turn = async () => {
			controller.signal.throwIfAborted();
			await yieldCatalogTask();
			controller.signal.throwIfAborted();
		};
		created.promise = forEachCatalogSlice(videos, work.visit, turn).then(() => {
			controller.signal.throwIfAborted();
			const index = work.finish();
			completed$1.set(videos, index);
			return index;
		}).finally(() => {
			if (pending$1.get(videos) === created) pending$1.delete(videos);
		});
		pending$1.set(videos, created);
		job = created;
	}
	if (!signal) {
		job.durable = true;
		return job.promise;
	}
	const owner = job;
	owner.readers++;
	return new Promise((resolve, reject) => {
		let settled = false;
		const finish = (aborted, value, error) => {
			if (settled) return;
			settled = true;
			signal.removeEventListener("abort", abort);
			owner.readers--;
			if (aborted && !owner.readers && !owner.durable) {
				owner.controller.abort();
				if (pending$1.get(videos) === owner) pending$1.delete(videos);
			}
			if (aborted || error !== void 0) reject(aborted ? signal.reason : error);
			else resolve(value);
		};
		const abort = () => finish(true);
		signal.addEventListener("abort", abort, { once: true });
		owner.promise.then((value) => finish(false, value), (error) => finish(false, void 0, error));
		if (signal.aborted) abort();
	});
}
/** Exact union cardinality, including legacy source aliases and playlist edges. */
function youtubeCoverageCounts(index, sources) {
	return new Map(sources.map((source) => {
		const direct = index.bySource.get(source.id) ?? 0;
		const channel = source.channelId || (/^yt:UC[A-Za-z0-9_-]{20,}$/.test(source.id) ? source.id.slice(3) : "");
		const count = source.id.startsWith("ytpl:") || !channel ? direct : direct + (index.byChannel.get(channel) ?? 0) - (index.overlap.get(source.id)?.get(channel) ?? 0);
		return [source.id, count];
	}));
}
function youtubeCatalogCoverage(index, follows) {
	const sources = follows.filter((source) => source.kind === "youtube");
	const review = sources.filter((source) => source.importNeedsReview).length;
	const verified = sources.filter(verifiedYoutubeSource);
	const counts = youtubeCoverageCounts(index, verified);
	const missing = verified.filter((source) => !counts.get(source.id)).map((source) => source.id);
	return {
		total: verified.length,
		verified: verified.length,
		ready: verified.length - missing.length,
		missing,
		review,
		pending: sources.length - verified.length - review
	};
}
function youtubeSourceNewest(index, source) {
	const direct = index.newestBySource.get(source.id) ?? 0;
	if (source.id.startsWith("ytpl:")) return direct;
	const channel = source.channelId || (/^yt:UC[A-Za-z0-9_-]{20,}$/.test(source.id) ? source.id.slice(3) : "");
	return Math.max(direct, index.newestByChannel.get(channel) ?? 0);
}
/** Never builds an index on the preview click path. Samples belong to the
* exact immutable catalog snapshot and cannot retain obsolete card objects. */
function peekYoutubeCoverageOwner(videos, video) {
	const channel = video.remote?.channelId;
	if (!channel) return [];
	const samples = completed$1.get(videos)?.ownerSamples.get(channel);
	return samples ? samples.map((position) => videos[position]).filter((row) => row.remote?.channelId === channel) : [];
}
var snapshots$1 = /* @__PURE__ */ new WeakMap();
var MAX_REQUESTED = 128;
var positions = /* @__PURE__ */ new Map();
function rememberPosition(id, position) {
	positions.delete(id);
	positions.set(id, position);
	while (positions.size > MAX_REQUESTED) positions.delete(positions.keys().next().value);
}
function rememberVideo(videos, video) {
	let cache = snapshots$1.get(videos);
	if (!cache) {
		cache = /* @__PURE__ */ new Map();
		snapshots$1.set(videos, cache);
	}
	cache.set(video.id, video);
	while (cache.size > MAX_REQUESTED) cache.delete(cache.keys().next().value);
}
function lookupVideos(videos, ids) {
	let cache = snapshots$1.get(videos);
	if (!cache) {
		cache = /* @__PURE__ */ new Map();
		snapshots$1.set(videos, cache);
	}
	let missing = new Set(ids.filter((id) => !cache.has(id)));
	if (missing.size) {
		if (cache.size + missing.size > MAX_REQUESTED) {
			cache.clear();
			missing = new Set(ids);
		}
		for (const id of missing) {
			const position = positions.get(id);
			if (position === void 0) continue;
			const video = videos[position];
			if (video?.id === id) {
				cache.set(id, video);
				missing.delete(id);
			}
		}
		for (let position = 0; missing.size && position < videos.length; position++) {
			const video = videos[position];
			if (!missing.delete(video.id)) continue;
			cache.set(video.id, video);
			rememberPosition(video.id, position);
		}
		for (const id of missing) cache.set(id, void 0);
	}
	const found = ids.map((id) => cache.get(id));
	while (cache.size > MAX_REQUESTED) cache.delete(cache.keys().next().value);
	return found;
}
function lookupVideo(videos, id) {
	if (!id) return void 0;
	const cache = snapshots$1.get(videos);
	return cache?.has(id) ? cache.get(id) : lookupVideos(videos, [id])[0];
}
/** Provider IDs are case-sensitive. Titles and thumbnail URLs are never identity. */
function youtubeVideoKey(video) {
	if (video.remote?.kind !== "youtube") return void 0;
	const id = video.remote.videoId?.trim() || (/^yt:[A-Za-z0-9_-]{11}$/.test(video.id) ? video.id.slice(3) : "");
	return id ? `yt:${id}` : void 0;
}
var indexes = /* @__PURE__ */ new WeakMap();
/** Reuse an already-built creator index even when the caller holds the full
* catalog and the shelf indexed its YouTube slice. Never retain an old index. */
function peekYoutubeOwner(videos, video) {
	const index = indexes.get(videos) ?? void 0;
	if (video.remote?.kind !== "youtube") return [];
	if (!index) return peekYoutubeCoverageOwner(videos, video);
	const rows = index.byChannel.get(video.remote.channelId ?? "") ?? index.bySource.get(video.folderId) ?? [];
	const anchor = rows.find((row) => row.id === video.id);
	return anchor && lookupVideo(videos, video.id) === anchor ? rows : peekYoutubeCoverageOwner(videos, video);
}
/** One stored card, multiple source edges. Keep its primary folder stable so
* refreshes of overlapping playlists cannot steal a creator's whole archive. */
function retainYoutubeSources(previous, incoming) {
	if (previous?.remote?.kind !== "youtube" || incoming.remote?.kind !== "youtube") return incoming;
	const oldSources = previous.remote.sourceIds ?? [previous.folderId];
	const sources = [.../* @__PURE__ */ new Set([
		...oldSources,
		previous.folderId,
		incoming.folderId,
		...incoming.remote.sourceIds ?? []
	])];
	const memberships = incoming.remote.playlistMemberships ? { ...previous.remote.playlistMemberships } : previous.remote.playlistMemberships;
	for (const [id, edge] of Object.entries(incoming.remote.playlistMemberships ?? {})) if (memberships && (!memberships[id] || memberships[id].at <= edge.at)) memberships[id] = edge;
	const oldEvent = previous.remote.youtubeEvent, nextEvent = incoming.remote.youtubeEvent;
	const event = nextEvent && (!oldEvent || nextEvent.observedAt >= oldEvent.observedAt) ? {
		...nextEvent,
		announcedAt: oldEvent?.announcedAt ?? nextEvent.announcedAt
	} : oldEvent;
	return {
		...incoming,
		id: previous.id,
		folderId: previous.folderId,
		remote: {
			...incoming.remote,
			channelId: incoming.remote.channelId === "playlist" && previous.remote.channelId !== "playlist" ? previous.remote.channelId : incoming.remote.channelId,
			sourceIds: oldSources.length === sources.length && oldSources.every((id) => sources.includes(id)) ? previous.remote.sourceIds : sources,
			...memberships ? { playlistMemberships: memberships } : {},
			...event ? { youtubeEvent: event } : {},
			...!nextEvent && oldEvent && oldEvent.state !== "completed" ? {
				youtubeType: previous.remote.youtubeType,
				live: previous.remote.live,
				observedAt: previous.remote.observedAt,
				viewers: previous.remote.viewers
			} : {}
		}
	};
}
/** UI and workers share the original star meanings: 1 = dislike, 2 = neutral,
* 3–5 = increasingly positive. Unrated is neutral, never a zero multiplier. */
function normalizeRating(value) {
	return Number.isFinite(value) ? Math.max(0, Math.min(5, Math.round(value))) : 0;
}
function ratingPreference(value) {
	const rating = normalizeRating(value);
	return rating === 1 ? -3 : rating >= 3 ? rating - 2 : 0;
}
var RATING_MULTIPLIERS = [
	1,
	.2,
	1,
	1.2,
	1.5,
	1.9
];
var RATING_STAR_WEIGHTS = {
	personal: 12,
	youtube: 6,
	preview: 2
};
var ratingMultiplier = (rating) => RATING_MULTIPLIERS[normalizeRating(rating)];
var clamp = (value, maximum) => Math.max(0, Math.min(maximum, Number.isFinite(value) ? value : 0));
var affinity = (value, maximum) => Math.max(-maximum, Math.min(maximum, Number.isFinite(value) ? value : 0));
/** Multiplying a negative novelty penalty made higher ratings rank worse.
* Multiply positive evidence and divide negative evidence before star points. */
function ratingAdjustedScore(base, rating, ratingWeight = RATING_STAR_WEIGHTS.personal) {
	const finite = Number.isFinite(base) ? base : 0, multiplier = ratingMultiplier(rating);
	return (finite >= 0 ? finite * multiplier : finite / multiplier) + ratingPreference(rating) * clamp(ratingWeight, 100);
}
var PERSONAL_RANK_WEIGHTS = {
	baseline: 10,
	favorite: 12,
	like: 6,
	watch: 12,
	plays: 6,
	marks: 12,
	topics: 12,
	creatorAffinity: 8,
	creatorLike: 6,
	creatorFavorite: 8,
	freshness: 3,
	rating: RATING_STAR_WEIGHTS.personal
};
function personalRankBreakdown(s) {
	const w = PERSONAL_RANK_WEIGHTS;
	const parts = {
		baseline: w.baseline,
		favorite: s.favorite ? w.favorite : 0,
		like: s.liked ? w.like : 0,
		watch: clamp(s.watch, w.watch),
		plays: clamp(Math.log2(1 + clamp(s.plays, 1e6)) * 1.5, w.plays),
		marks: clamp(Math.log2(1 + clamp(s.marks, 1e6)) * 4, w.marks),
		topics: affinity(s.topics, w.topics),
		creatorAffinity: affinity(s.creatorAffinity, w.creatorAffinity),
		creatorLike: s.creatorLiked ? w.creatorLike : 0,
		creatorFavorite: s.creatorFavorite ? w.creatorFavorite : 0,
		freshness: clamp(s.freshness, 1) * w.freshness
	};
	const base = Object.values(parts).reduce((sum, value) => sum + value, 0);
	const creator = ratingPreference(s.creatorRating ?? 0) * 3;
	return {
		parts,
		base,
		multiplier: ratingMultiplier(s.rating),
		ratingPoints: ratingPreference(s.rating) * w.rating,
		creatorPoints: creator,
		interestMultiplier: interestMultiplier(s),
		score: applyInterestMultipliers(ratingAdjustedScore(base, s.rating, w.rating) + creator, s)
	};
}
/** Hot catalog path avoids allocating a breakdown object for every title. */
function personalRankScore(s) {
	const w = PERSONAL_RANK_WEIGHTS;
	return applyInterestMultipliers(ratingAdjustedScore(w.baseline + (s.favorite ? w.favorite : 0) + (s.liked ? w.like : 0) + clamp(s.watch, w.watch) + clamp(Math.log2(1 + clamp(s.plays, 1e6)) * 1.5, w.plays) + clamp(Math.log2(1 + clamp(s.marks, 1e6)) * 4, w.marks) + affinity(s.topics, w.topics) + affinity(s.creatorAffinity, w.creatorAffinity) + (s.creatorLiked ? w.creatorLike : 0) + (s.creatorFavorite ? w.creatorFavorite : 0) + clamp(s.freshness, 1) * w.freshness, s.rating, w.rating) + ratingPreference(s.creatorRating ?? 0) * 3, s);
}
/** Unrated catalog volume is coverage, not preference evidence. */
function confidenceAdjustedPreference(total, evidenceCount) {
	return Number.isFinite(total) ? total / (clamp(evidenceCount, Number.MAX_SAFE_INTEGER) + 3) : 0;
}
var topicPreferenceScore = (total, evidenceCount, hearted) => confidenceAdjustedPreference(total, evidenceCount) * 10 + (hearted ? 12 : 0);
/** Independent, bounded preference families. Catalog keyword volume cannot create votes. */
var INTEREST_MULTIPLIERS = {
	liked: 1.35,
	favorite: 1.55,
	topics: 1.25,
	tagHearts: 1.25,
	creatorLiked: 1.2,
	creatorFavorite: 1.4,
	marks: 1.3,
	watch: 1.25,
	maximum: 3
};
function interestMultiplier(s) {
	const w = INTEREST_MULTIPLIERS;
	const marks = clamp(Math.log2(1 + clamp(s.marks, 1e6)) * 4, 12) / 12;
	return Math.min(w.maximum, (s.liked ? w.liked : 1) * (s.favorite ? w.favorite : 1) * (1 + (w.topics - 1) * clamp(s.topics, 12) / 12) * (1 + (w.tagHearts - 1) * clamp(s.tagHearts, 3) / 3) * (s.creatorLiked ? w.creatorLiked : 1) * (s.creatorFavorite ? w.creatorFavorite : 1) * (1 + (w.marks - 1) * marks) * (1 + (w.watch - 1) * clamp(s.watch, 12) / 12));
}
function applyInterestMultipliers(score, signals) {
	const multiplier = interestMultiplier(signals);
	return score >= 0 ? score * multiplier : score / multiplier;
}
var preparedTags = /* @__PURE__ */ new WeakMap();
/** Reuse immutable tag arrays; mechanical provider/creator labels are facets, not interests. */
function rankingTags(tags) {
	const saved = preparedTags.get(tags);
	if (saved) return saved;
	const distinct = /* @__PURE__ */ new Set();
	for (const raw of tags) {
		if (/^(?:source|creator|provider|format|auto|sub)-/i.test(raw)) continue;
		const clean = raw.replace(/^keyword-/i, "").trim().toLowerCase();
		if (clean.length < 3 || /^(?:https?:|www\.)/.test(clean)) continue;
		distinct.add(clean);
		if (distinct.size >= 64) break;
	}
	const result = [...distinct];
	preparedTags.set(tags, result);
	return result;
}
var slug = /^[A-Za-z0-9_-]{1,160}$/;
var number$1 = /^\d{1,40}$/;
var channel = /^[A-Za-z0-9_]{1,25}$/;
/** Public routes only. Tracking, offsets, titles and display names never establish identity. */
function twitchUrlIdentity(raw) {
	if (typeof raw !== "string" || raw.length > 2048) return;
	try {
		const url = new URL(raw);
		if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.port) return;
		const host = url.hostname.toLowerCase(), path = url.pathname.replace(/\/$/, "");
		let value;
		if (host === "clips.twitch.tv") {
			value = path === "/embed" ? url.searchParams.get("clip") : path.slice(1);
			if (value && slug.test(value)) return {
				kind: "clip",
				value
			};
		}
		if ([
			"twitch.tv",
			"www.twitch.tv",
			"m.twitch.tv"
		].includes(host)) {
			value = path.match(/^\/[\w]{1,25}\/clip\/([\w-]+)$/)?.[1];
			if (value && slug.test(value)) return {
				kind: "clip",
				value
			};
			value = path.match(/^\/videos\/(\d+)$/)?.[1];
			if (value && number$1.test(value)) return {
				kind: "vod",
				value
			};
			value = path.match(/^\/([\w]+)$/)?.[1];
			if (value && channel.test(value) && ![
				"directory",
				"downloads",
				"videos",
				"settings",
				"clip",
				"embed"
			].includes(value.toLowerCase())) return {
				kind: "live",
				value: value.toLowerCase()
			};
		}
		if (host === "player.twitch.tv" && !path) {
			value = url.searchParams.get("video")?.replace(/^v/, "");
			if (value && number$1.test(value)) return {
				kind: "vod",
				value
			};
			value = url.searchParams.get("channel");
			if (value && channel.test(value)) return {
				kind: "live",
				value: value.toLowerCase()
			};
		}
	} catch {}
}
function twitchIdentity(remote, extension) {
	const routes = [remote.watchUrl, remote.embedUrl].map(twitchUrlIdentity).filter((v) => !!v);
	if (routes.length) {
		if (routes.some((row) => row.kind !== routes[0].kind || row.value !== routes[0].value)) return;
		return routes[0];
	}
	if (remote.live) {
		if (remote.channelName && channel.test(remote.channelName)) return {
			kind: "live",
			value: remote.channelName.toLowerCase()
		};
		return;
	}
	const value = remote.videoId;
	const verified = remote.twitchClipIdentity;
	if (verified?.version === 1 && slug.test(verified.slug) && (!value || value === verified.id || value === verified.slug)) return {
		kind: "clip",
		value: verified.slug
	};
	if (value && /^v?\d{1,40}$/.test(value) && extension !== "clip") return {
		kind: "vod",
		value: value.replace(/^v/, "")
	};
	if (value && slug.test(value) && (extension === "clip" || !number$1.test(value))) return {
		kind: "clip",
		value
	};
}
function twitchIdentityKeys(video) {
	if (video.remote?.kind !== "twitch") return [];
	const identity = twitchIdentity(video.remote, video.extension);
	if (!identity) return [];
	const keys = [`twitch:${identity.kind}:${identity.value}`];
	const pair = video.remote.twitchClipIdentity;
	if (identity.kind === "clip" && pair?.version === 1 && pair.slug === identity.value && pair.id && number$1.test(pair.id)) keys.push(`twitch:clip-id:${pair.id}`);
	if (identity.kind === "clip" && number$1.test(identity.value) && ![video.remote.watchUrl, video.remote.embedUrl].some(twitchUrlIdentity)) return [`twitch:clip-id:${identity.value}`];
	return keys;
}
function normalized(video, known) {
	if (video.remote?.kind !== "twitch") return video;
	let identity = twitchIdentity(video.remote, video.extension);
	const pair = video.remote.twitchClipIdentity ?? known;
	if (identity?.kind === "clip" && pair?.version === 1 && pair.id === identity.value && slug.test(pair.slug) && ![video.remote.watchUrl, video.remote.embedUrl].some(twitchUrlIdentity)) identity = {
		kind: "clip",
		value: pair.slug
	};
	if (!identity || identity.kind === "live") return video;
	if (identity.kind === "clip" && number$1.test(identity.value) && ![video.remote.watchUrl, video.remote.embedUrl].some(twitchUrlIdentity) && !(pair?.version === 1 && pair.slug === identity.value)) return video;
	const watchUrl = identity.kind === "clip" ? "https://clips.twitch.tv/" + identity.value : "https://www.twitch.tv/videos/" + identity.value;
	const embedUrl = identity.kind === "clip" ? "https://clips.twitch.tv/embed?clip=" + identity.value : "https://player.twitch.tv/?video=v" + identity.value;
	if (video.remote.videoId === identity.value && video.remote.watchUrl === watchUrl && video.remote.embedUrl === embedUrl) return video;
	return {
		...video,
		remote: {
			...video.remote,
			videoId: identity.value,
			watchUrl,
			embedUrl,
			...pair ? { twitchClipIdentity: pair } : {}
		}
	};
}
function retainTwitchIdentity(previous, incoming) {
	const keys = twitchIdentityKeys(incoming);
	if (!previous || !keys.length || !twitchIdentityKeys(previous).some((key) => keys.includes(key))) return normalized(incoming);
	incoming = normalized(incoming, previous.remote?.twitchClipIdentity);
	const sources = [.../* @__PURE__ */ new Set([
		previous.folderId,
		...previous.remote?.sourceIds ?? [],
		incoming.folderId,
		...incoming.remote?.sourceIds ?? []
	])];
	return {
		...incoming,
		id: previous.id,
		folderId: previous.folderId,
		remote: {
			...incoming.remote,
			sourceIds: sources,
			twitchClipIdentity: incoming.remote?.twitchClipIdentity ?? previous.remote?.twitchClipIdentity
		}
	};
}
function catalogIdentityKeys(video) {
	const youtube = youtubeVideoKey(video);
	return youtube ? [youtube] : twitchIdentityKeys(video);
}
function catalogIdentityKey(video) {
	return catalogIdentityKeys(video)[0];
}
function lookupCatalogIdentity(index, video) {
	for (const key of [video.id, ...catalogIdentityKeys(video)]) {
		const row = index.get(key);
		if (row !== void 0) return row;
	}
}
function sameList(left, right) {
	return left === right || left?.length === right?.length && left?.every((value, index) => value === right?.[index]);
}
/** Avoid allocating two JSON strings for every card in a large refresh. */
function sameRemote(left, right) {
	if (left === right) return true;
	if (!left || !right) return left === right;
	return left.kind === right.kind && left.videoId === right.videoId && left.twitchClipIdentity?.slug === right.twitchClipIdentity?.slug && left.twitchClipIdentity?.id === right.twitchClipIdentity?.id && left.channelId === right.channelId && left.channelName === right.channelName && left.live === right.live && left.twitchContent?.kind === right.twitchContent?.kind && left.twitchContent?.source === right.twitchContent?.source && left.twitchContent?.videoId === right.twitchContent?.videoId && left.twitchContent?.at === right.twitchContent?.at && left.youtubeEvent === right.youtubeEvent && left.playlistMemberships === right.playlistMemberships && left.youtubeType === right.youtubeType && left.youtubeTagsCheckedAt === right.youtubeTagsCheckedAt && left.youtubeTagSummary === right.youtubeTagSummary && sameList(left.youtubeKeywords, right.youtubeKeywords) && left.publishedSource === right.publishedSource && left.publishedPrecision === right.publishedPrecision && left.publishedLabel === right.publishedLabel && left.publishedLabelAt === right.publishedLabelAt && left.publishedDate === right.publishedDate && left.viewers === right.viewers && left.observedAt === right.observedAt && left.liveOfflineSince === right.liveOfflineSince && left.views === right.views && left.embedUrl === right.embedUrl && left.watchUrl === right.watchUrl && left.previewUrl === right.previewUrl && sameList(left.sourceKinds, right.sourceKinds) && sameList(left.sourceIds, right.sourceIds) && sameList(left.thumbFallbacks, right.thumbFallbacks) && left.comments === right.comments;
}
function sameVideo(left, right) {
	return left === right || left.id === right.id && left.folderId === right.folderId && left.name === right.name && left.path === right.path && left.extension === right.extension && left.mime === right.mime && left.size === right.size && left.duration === right.duration && left.addedAt === right.addedAt && left.isSample === right.isSample && left.src === right.src && left.year === right.year && left.genre === right.genre && left.tagline === right.tagline && left.description === right.description && left.collection === right.collection && left.poster === right.poster && sameRemote(left.remote, right.remote);
}
/**
* Routine catalog responses are intentionally shallow and omit on-demand
* details. Carry forward only durable card fields that they cannot author so
* a metadata repair or fetched comments do not disappear on the next live
* check. A newer non-empty provider name still wins (channel renames remain
* possible), and no object is allocated when there is nothing to preserve.
*/
function retainDurableRemoteFields(previous, incoming) {
	incoming = retainTwitchIdentity(previous, retainYoutubeSources(previous, incoming));
	incoming = retainYoutubeMetadata(previous, incoming);
	incoming = retainTwitchContent(previous, incoming);
	if (!previous?.remote || !incoming.remote) return incoming;
	const channelName = incoming.remote.channelName?.trim() || previous.remote.channelName?.trim();
	const comments = incoming.remote.comments?.length ? incoming.remote.comments : previous.remote.comments;
	const keepsName = Boolean(channelName && channelName !== incoming.remote.channelName);
	const keepsComments = Boolean(comments?.length && comments !== incoming.remote.comments);
	const twitch = incoming.remote.kind === "twitch";
	const keepsAdultPublished = !!incoming.remote && [
		"eporner",
		"redtube",
		"reddit",
		"booru",
		"redgifs"
	].includes(incoming.remote.kind) && incoming.addedAt === 0 && ["instant", "day"].includes(previous.remote.publishedPrecision ?? "") && previous.addedAt > 0;
	const keepsPublished = keepsAdultPublished || incoming.remote.kind === "youtube" && incoming.addedAt === 0 && repairLegacyYoutubeDate(previous).addedAt > 0 || twitch && (!Number.isFinite(incoming.addedAt) || incoming.addedAt <= 0) && previous.addedAt > 0;
	const keepsViews = (incoming.remote.kind === "youtube" || twitch) && incoming.remote.views === void 0 && previous.remote.views !== void 0;
	const keepsDuration = (incoming.remote.kind === "youtube" || twitch) && (!Number.isFinite(incoming.duration) || (incoming.duration ?? 0) <= 0) && (previous.duration ?? 0) > 0;
	const keepsPoster = twitch && !incoming.poster && Boolean(previous.poster);
	const keepsGenre = twitch && !incoming.genre && Boolean(previous.genre);
	const keepsTagline = twitch && !incoming.tagline && Boolean(previous.tagline);
	const keepsCollection = twitch && !incoming.collection && Boolean(previous.collection);
	const keepsYear = twitch && incoming.year === void 0 && previous.year !== void 0;
	if (!keepsName && !keepsComments && !keepsPublished && !keepsViews && !keepsDuration && !keepsPoster && !keepsGenre && !keepsTagline && !keepsCollection && !keepsYear) return incoming;
	return {
		...incoming,
		...keepsPublished ? { addedAt: previous.addedAt } : {},
		...keepsDuration ? { duration: previous.duration } : {},
		...keepsPoster ? { poster: previous.poster } : {},
		...keepsGenre ? { genre: previous.genre } : {},
		...keepsTagline ? { tagline: previous.tagline } : {},
		...keepsCollection ? { collection: previous.collection } : {},
		...keepsYear ? { year: previous.year } : {},
		remote: {
			...incoming.remote,
			...keepsAdultPublished ? {
				publishedPrecision: previous.remote.publishedPrecision,
				publishedDate: previous.remote.publishedDate
			} : {},
			...keepsName ? { channelName } : {},
			...keepsComments ? { comments } : {},
			...keepsViews ? { views: previous.remote.views } : {}
		}
	};
}
/** An older cached/held clip page cannot replace newer provider metadata.
* Unknown legacy clocks lose to a known observation; unrelated titles are untouched. */
function olderRemoteObservation(previous, incoming) {
	if (!previous?.remote || !incoming.remote) return false;
	const timed = previous.remote.youtubeEvent && incoming.remote.youtubeEvent || previous.remote.live && incoming.remote.live || previous.remote.kind === "twitch" && incoming.remote.kind === "twitch" && previous.extension === "clip" && incoming.extension === "clip";
	return Boolean(timed && (incoming.remote.observedAt ?? 0) < (previous.remote.observedAt ?? 0));
}
var remoteVideoIndexes = /* @__PURE__ */ new WeakMap();
/** Share one id index among accounting, merging, and offline cleanup for a snapshot. */
function remoteVideoIndex(videos) {
	const cached = remoteVideoIndexes.get(videos);
	if (cached) return cached;
	const index = /* @__PURE__ */ new Map();
	for (const video of videos) {
		index.set(video.id, video);
		for (const alias of catalogIdentityKeys(video)) if (!index.has(alias)) index.set(alias, video);
	}
	remoteVideoIndexes.set(videos, index);
	return index;
}
var pendingIndexes = /* @__PURE__ */ new WeakMap();
/** Prepare the shared lookup without monopolizing input on large libraries. */
function remoteVideoIndexAsync(videos) {
	const cached = remoteVideoIndexes.get(videos);
	if (cached) return Promise.resolve(cached);
	const pending = pendingIndexes.get(videos);
	if (pending) return pending;
	const index = /* @__PURE__ */ new Map();
	const work = forEachCatalogSlice(videos, (video) => {
		index.set(video.id, video);
		for (const alias of catalogIdentityKeys(video)) if (!index.has(alias)) index.set(alias, video);
	}, yieldCatalogTask).then(() => {
		remoteVideoIndexes.set(videos, index);
		return index;
	}).finally(() => pendingIndexes.delete(videos));
	pendingIndexes.set(videos, work);
	return work;
}
/** Focused/bulk imports scan once per batch; transient positions cover only incoming IDs. */
async function mergeRemoteCatalogAsync(existing, incoming, options = {}) {
	if (!incoming.length) return existing;
	const turn = options.turn ?? yieldCatalogTask;
	const wanted = /* @__PURE__ */ new Set();
	const positions = /* @__PURE__ */ new Map();
	if (existing.length) {
		await forEachCatalogSlice(incoming, (video) => {
			wanted.add(video.id);
			for (const alias of catalogIdentityKeys(video)) wanted.add(alias);
		}, turn);
		await forEachCatalogSlice(existing, (video, index) => {
			if (wanted.has(video.id)) positions.set(video.id, index);
			for (const alias of catalogIdentityKeys(video)) if (wanted.has(alias) && !positions.has(alias)) positions.set(alias, index);
		}, turn);
		wanted.clear();
	}
	const replacements = /* @__PURE__ */ new Map();
	const appended = [];
	let merged;
	const applyReplacements = async () => {
		if (!replacements.size) return;
		merged ??= await copyCatalogArray(existing, turn);
		await forEachCatalogEntry(replacements, ([index, video]) => {
			merged[index] = video;
		}, turn);
		replacements.clear();
	};
	const mergeTurn = async () => {
		if (replacements.size >= 512) await applyReplacements();
		await turn();
	};
	await forEachCatalogSlice(incoming, (video) => {
		const index = lookupCatalogIdentity(positions, video);
		const previous = index === void 0 ? void 0 : replacements.get(index) ?? (index < existing.length ? (merged ?? existing)[index] : appended[index - existing.length]);
		let next = options.preferExisting && previous ? retainDurableRemoteFields(video, previous) : retainDurableRemoteFields(previous, video);
		if (options.preferExisting && previous && (next.id !== previous.id || next.folderId !== previous.folderId)) next = {
			...next,
			id: previous.id,
			folderId: previous.folderId
		};
		if (olderRemoteObservation(previous, next)) next = retainTwitchIdentity(next, previous);
		else if (previous && sameVideo(previous, next)) next = previous;
		if (index === void 0) {
			const position = existing.length + appended.length;
			positions.set(next.id, position);
			for (const alias of catalogIdentityKeys(next)) positions.set(alias, position);
			appended.push(next);
		} else if (next !== previous) {
			for (const alias of catalogIdentityKeys(next)) positions.set(alias, index);
			if (index < existing.length) {
				if (merged) merged[index] = next;
				else replacements.set(index, next);
			} else appended[index - existing.length] = next;
		}
	}, mergeTurn);
	if (!merged && !replacements.size && !appended.length) return existing;
	if (!existing.length) return appended;
	await applyReplacements();
	merged ??= await copyCatalogArray(existing, turn);
	await forEachCatalogSlice(appended, (video) => {
		merged.push(video);
	}, turn);
	return merged;
}
/** A sweep already owns an index. Stage its small delta, and copy changed
* catalogs outside the store publication stack. Cancellation never mutates
* the shared index or existing catalog; the caller commits the returned delta. */
async function prepareIndexedRemoteCatalog(existing, incoming, positions, turn = yieldCatalogTask) {
	const positionChanges = /* @__PURE__ */ new Map(), replacements = /* @__PURE__ */ new Map();
	const appended = [], rows = [];
	let videos;
	const apply = async () => {
		if (!replacements.size) return;
		videos ??= await copyCatalogArray(existing, turn);
		await forEachCatalogEntry(replacements, ([position, video]) => {
			videos[position] = video;
		}, turn);
		replacements.clear();
	};
	await forEachCatalogSlice(incoming, (video) => {
		const position = lookupCatalogIdentity(positionChanges, video) ?? lookupCatalogIdentity(positions, video);
		const previous = position === void 0 ? void 0 : position < existing.length ? replacements.get(position) ?? (videos ?? existing)[position] : appended[position - existing.length];
		let next = retainDurableRemoteFields(previous, video);
		if (olderRemoteObservation(previous, next)) next = retainTwitchIdentity(next, previous);
		else if (previous && sameVideo(previous, next)) next = previous;
		if (position === void 0) {
			const addedPosition = existing.length + appended.length;
			positionChanges.set(next.id, addedPosition);
			for (const alias of catalogIdentityKeys(next)) positionChanges.set(alias, addedPosition);
			appended.push(next);
		} else if (next !== previous) {
			for (const alias of catalogIdentityKeys(next)) positionChanges.set(alias, position);
			if (position < existing.length) {
				if (videos) videos[position] = next;
				else replacements.set(position, next);
			} else appended[position - existing.length] = next;
		}
		rows.push(next);
	}, async () => {
		if (replacements.size >= 512) await apply();
		await turn();
	});
	if (!videos && !replacements.size && !appended.length) return {
		videos: existing,
		rows,
		positionChanges
	};
	await apply();
	videos ??= await copyCatalogArray(existing, turn);
	await forEachCatalogSlice(appended, (video) => {
		videos.push(video);
	}, turn);
	return {
		videos,
		rows,
		positionChanges
	};
}
/** Saved ledgers may be much larger than a provider page. Walk their sparse
* records directly instead of exporting/sorting every key on the UI thread. */
async function prepareRefreshSavedIds(favorites, likes, history, turn = yieldCatalogTask) {
	const ids = /* @__PURE__ */ new Set();
	await forEachCatalogEntry(sparseRecordScan(favorites, false), (row) => {
		if (row) ids.add(row[0]);
	}, turn);
	await forEachCatalogEntry(sparseRecordScan(likes, false), (row) => {
		if (row) ids.add(row[0]);
	}, turn);
	await forEachCatalogSlice(history, (entry) => {
		ids.add(entry.id);
	}, turn);
	return ids;
}
function remoteRefreshPlan(existing, incoming, refreshedIds, savedIds, options) {
	const liveChecked = new Set(options?.liveCheckedIds ?? refreshedIds);
	const refreshed = new Set(refreshedIds), existingById = options?.index ?? remoteVideoIndex(existing);
	const fresh = /* @__PURE__ */ new Map();
	for (const video of incoming) {
		const previous = lookupCatalogIdentity(existingById, video);
		let next = retainDurableRemoteFields(previous, video);
		if (olderRemoteObservation(previous, next)) next = retainTwitchIdentity(next, previous);
		else if (previous && sameVideo(previous, next)) next = previous;
		fresh.set(next.id, next);
	}
	const visit = (video) => {
		const next = fresh.get(video.id);
		if (next) {
			fresh.delete(video.id);
			return next;
		}
		if (!video.remote) return video;
		const observedChannel = liveChecked.has(video.folderId) || video.remote.kind === "youtube" && Boolean(video.remote.channelId && liveChecked.has(`yt:${video.remote.channelId}`));
		const checkAt = options?.liveCheckedAt?.[video.folderId] ?? (video.remote.channelId ? options?.liveCheckedAt?.[`yt:${video.remote.channelId}`] : void 0);
		if (video.remote.live && observedChannel && (checkAt === void 0 || checkAt >= (video.remote.observedAt ?? 0))) {
			if (video.remote.kind === "youtube" && options?.youtubeOfflineGraceMs && checkAt) {
				const since = video.remote.liveOfflineSince && video.remote.liveOfflineSince <= checkAt ? video.remote.liveOfflineSince : checkAt;
				if (checkAt - since < options.youtubeOfflineGraceMs) {
					if (video.remote.liveOfflineSince === since) return video;
					const pending = {
						...video,
						tagline: "Rechecking live status · retained for 10 minutes after the first missing broadcast",
						remote: {
							...video.remote,
							liveOfflineSince: since
						}
					};
					options.pendingYoutubeRows?.push(pending);
					return pending;
				}
			}
			options?.staleLiveIds?.push(video.id);
			const ended = {
				...video,
				tagline: video.remote.kind === "youtube" ? "Completed YouTube stream" : "Offline · saved channel",
				remote: {
					...video.remote,
					live: false,
					...video.remote.kind === "youtube" ? { youtubeType: "replay" } : {}
				}
			};
			if (video.remote.kind === "youtube") options?.endedYoutubeRows?.push(ended);
			if (video.remote.kind === "twitch") options?.endedTwitchRows?.push(ended);
			return ended;
		}
		if (!refreshed.has(video.folderId)) return video;
		if (savedIds.has(video.id) || video.remote.kind === "twitch" || video.remote.kind === "youtube" || video.folderId.startsWith("ytpl:")) return video;
	};
	return {
		fresh,
		visit
	};
}
/** Routine refreshes share the same merge contract while yielding the catalog traversal. */
async function mergeRemoteRefreshAsync(existing, incoming, refreshedIds, savedIds, options) {
	const turn = options?.turn ?? yieldCatalogTask;
	const index = options?.index ?? await remoteVideoIndexAsync(existing);
	await turn();
	const plan = remoteRefreshPlan(existing, incoming, refreshedIds, savedIds, {
		...options,
		index
	});
	const changes = /* @__PURE__ */ new Map();
	let merged, processed = 0;
	const materializePrefix = async () => {
		merged = [];
		function* prefix() {
			for (let position = 0; position < processed; position++) yield position;
		}
		await forEachCatalogEntry(prefix(), (position) => {
			const next = changes.has(position) ? changes.get(position) : existing[position];
			if (next) merged.push(next);
		}, turn);
		changes.clear();
	};
	await forEachCatalogSlice(existing, (video, position) => {
		const next = plan.visit(video);
		if (merged) {
			if (next) merged.push(next);
		} else if (next !== video) changes.set(position, next);
		processed = position + 1;
	}, async () => {
		if (!merged && changes.size) await materializePrefix();
		await turn();
	});
	if (!merged && !changes.size && !plan.fresh.size) return existing;
	if (!merged) await materializePrefix();
	if (plan.fresh.size) await forEachCatalogEntry(plan.fresh.values(), (video) => {
		merged.push(video);
	}, turn);
	return merged;
}
var EMPTY_ENTRY_COUNTS = {
	total: 0,
	youtube: 0,
	twitch: 0,
	adult: 0,
	other: 0
};
var adultKinds = /* @__PURE__ */ new Set([
	"eporner",
	"redtube",
	"chaturbate",
	"myfreecams",
	"reddit",
	"booru",
	"redgifs"
]);
function entryGroup(video) {
	if (!video.remote || video.isSample) return null;
	const kind = video.remote.kind;
	return kind === "youtube" || kind === "twitch" ? kind : adultKinds.has(kind) ? "adult" : "other";
}
var completed = /* @__PURE__ */ new WeakMap();
var pending = /* @__PURE__ */ new WeakMap();
/** Counts include hidden/saved/live cards: each retained record uses memory. */
function remoteEntryCounts(videos) {
	const cached = completed.get(videos);
	if (cached) return Promise.resolve(cached);
	const running = pending.get(videos);
	if (running) return running;
	const counts = { ...EMPTY_ENTRY_COUNTS };
	const work = forEachCatalogSlice(videos, (video) => {
		const group = entryGroup(video);
		if (group) {
			counts[group]++;
			counts.total++;
		}
	}, yieldCatalogTask).then(() => {
		completed.set(videos, counts);
		return counts;
	}).finally(() => pending.delete(videos));
	pending.set(videos, work);
	return work;
}
function remainingEntrySlots(counts, settings, group) {
	const limit = settings[`${group}MaxEntries`];
	return Math.max(0, Math.min(settings.remoteMaxEntries - counts.total, limit - counts[group]));
}
/** Admission precedes metadata, merging and disk writes. Existing identities
* can refresh at/over a cap; rejected new rows never acquire tags or storage. */
async function admitRemoteEntries(existing, incoming, settings, known) {
	const counts = { ...await remoteEntryCounts(existing) };
	const index = known ?? await remoteVideoIndexAsync(existing);
	const admitted = [], newIds = /* @__PURE__ */ new Map(), skippedSources = /* @__PURE__ */ new Set();
	let skipped = 0, added = 0;
	await forEachCatalogSlice(incoming, (video) => {
		catalogIdentityKey(video) ?? video.id;
		const group = entryGroup(video);
		if (!group || lookupCatalogIdentity(index, video) !== void 0 || lookupCatalogIdentity(newIds, video) !== void 0) {
			const found = lookupCatalogIdentity(index, video);
			const canonical = (typeof found === "number" ? existing[found] : found)?.id ?? lookupCatalogIdentity(newIds, video) ?? video.id;
			admitted.push(canonical !== video.id ? {
				...video,
				id: canonical
			} : video);
			return;
		}
		if (!remainingEntrySlots(counts, settings, group)) {
			skipped++;
			skippedSources.add(video.folderId);
			for (const source of video.remote?.sourceIds ?? []) skippedSources.add(source);
			return;
		}
		newIds.set(video.id, video.id);
		for (const alias of catalogIdentityKeys(video)) newIds.set(alias, video.id);
		added++;
		counts[group]++;
		counts.total++;
		admitted.push(video);
	}, yieldCatalogTask);
	return {
		videos: admitted,
		skipped,
		skippedSources,
		added,
		counts,
		settings
	};
}
/** Additive merges can carry forward their five counters without a rescan. */
function rememberEntryCounts(videos, counts) {
	completed.set(videos, counts);
}
/** Revisit partially admitted pages after a limit is raised; do not skip the
* rejected tail by publishing the provider's already-advanced continuation. */
function holdEntryLimitCursors(previous, incoming, skippedSources) {
	const saved = new Map(previous.map((channel) => [channel.id, channel]));
	return incoming.map((channel) => skippedSources.has(channel.id) ? {
		...channel,
		playlistWalk: saved.get(channel.id)?.playlistWalk ? {
			...saved.get(channel.id).playlistWalk,
			membership: "provisional",
			completed: false
		} : void 0,
		catalogCursor: saved.get(channel.id)?.catalogCursor,
		catalogExhaustedAt: saved.get(channel.id)?.catalogExhaustedAt,
		twitchArchiveCursor: saved.get(channel.id)?.twitchArchiveCursor,
		twitchArchiveExhaustedAt: saved.get(channel.id)?.twitchArchiveExhaustedAt,
		twitchArchiveLastVideoId: saved.get(channel.id)?.twitchArchiveLastVideoId,
		...channel.twitchArchiveDiagnostics ? { twitchArchiveDiagnostics: {
			...channel.twitchArchiveDiagnostics,
			stopReason: "entry-limit"
		} } : {},
		twitchClipCursor: saved.get(channel.id)?.twitchClipCursor,
		twitchClipExhaustedAt: saved.get(channel.id)?.twitchClipExhaustedAt,
		newestVideoId: saved.get(channel.id)?.newestVideoId
	} : channel);
}
var TOTAL_RETIRED_KEY_LIMIT = 4e4;
var CLEANUP_GROUPS = [
	"youtube",
	"twitch",
	"adult"
];
var spentBudgets = /* @__PURE__ */ new WeakMap();
var cleanupBudgets = (settings) => {
	const budgets = {
		youtube: settings.youtubeCleanupBatch,
		twitch: settings.twitchCleanupBatch,
		adult: settings.adultCleanupBatch
	};
	spentBudgets.set(budgets, {
		youtube: 0,
		twitch: 0,
		adult: 0
	});
	return budgets;
};
function cleanupBudgetAvailable(budgets, settings, group) {
	return Math.max(0, Math.min(budgets[group], settings[`${group}CleanupBatch`] - (spentBudgets.get(budgets)?.[group] ?? 0)));
}
function consumeCleanupBudget(budgets, group, removed) {
	const spent = spentBudgets.get(budgets) ?? {
		youtube: 0,
		twitch: 0,
		adult: 0
	};
	spent[group] += removed;
	spentBudgets.set(budgets, spent);
	budgets[group] = Math.max(0, budgets[group] - removed);
}
var cleanupLabel = (group) => group === "youtube" ? "YouTube" : group === "twitch" ? "Twitch" : "Adult";
function cleanupPolicy(settings, group) {
	return {
		enabled: settings[`${group}AutoCleanup`],
		batch: settings[`${group}CleanupBatch`],
		minAgeDays: settings[`${group}CleanupMinAgeDays`]
	};
}
var emptyYoutubeCleanup = () => ({
	recentKeys: [],
	removedCount: 0,
	lastRemoved: 0,
	lastAt: 0
});
var adultKeyPrefixes = /* @__PURE__ */ new Set([
	"eporner",
	"redtube",
	"chaturbate",
	"myfreecams",
	"reddit",
	"booru",
	"redgifs"
]);
function boundedRetiredKeys(keys) {
	const counts = {
		youtube: 0,
		twitch: 0,
		adult: 0,
		legacy: 0
	}, seen = /* @__PURE__ */ new Set(), retained = [];
	for (let i = keys.length - 1; i >= 0 && retained.length < TOTAL_RETIRED_KEY_LIMIT; i--) {
		const key = keys[i];
		if (seen.has(key)) continue;
		const prefix = key.slice(0, key.indexOf(":"));
		const group = prefix === "yt" ? "youtube" : prefix === "tw" || prefix === "twitch" ? "twitch" : adultKeyPrefixes.has(prefix) ? "adult" : "legacy";
		if (counts[group] >= 1e4) continue;
		counts[group]++;
		seen.add(key);
		retained.push(key);
	}
	return retained.reverse();
}
var cleanupCount = (n) => typeof n === "number" && Number.isSafeInteger(n) && n >= 0 ? n : 0;
function normalizeYoutubeCleanup(raw) {
	const value = raw && typeof raw === "object" ? raw : {};
	const result = {
		recentKeys: Array.isArray(value.recentKeys) ? boundedRetiredKeys(value.recentKeys.slice(-4e4).filter((key) => typeof key === "string")) : [],
		removedCount: cleanupCount(value.removedCount),
		lastRemoved: cleanupCount(value.lastRemoved),
		lastAt: cleanupCount(value.lastAt)
	};
	if (value.groups && typeof value.groups === "object") {
		result.groups = {};
		for (const group of CLEANUP_GROUPS) {
			const row = value.groups[group];
			if (row && typeof row === "object") result.groups[group] = {
				removedCount: cleanupCount(row.removedCount),
				lastRemoved: cleanupCount(row.lastRemoved),
				lastAt: cleanupCount(row.lastAt)
			};
		}
	}
	return result;
}
var cleanupKey = (video) => youtubeVideoKey(video) ?? video.id;
var keyCache = /* @__PURE__ */ new WeakMap();
function retiredYoutubeKeys(journal) {
	let keys = keyCache.get(journal.recentKeys);
	if (!keys) {
		keys = new Set(journal.recentKeys);
		keyCache.set(journal.recentKeys, keys);
	}
	return keys;
}
function recordYoutubeCleanup(previous, removed, now) {
	const keys = new Set(removed.map(cleanupKey));
	const counts = {
		youtube: 0,
		twitch: 0,
		adult: 0
	}, groups = { ...previous.groups };
	for (const video of removed) {
		const group = entryGroup(video);
		if (group && group !== "other") counts[group]++;
	}
	for (const group of CLEANUP_GROUPS) if (counts[group]) groups[group] = {
		removedCount: (groups[group]?.removedCount ?? 0) + counts[group],
		lastRemoved: counts[group],
		lastAt: now
	};
	return {
		recentKeys: boundedRetiredKeys([...previous.recentKeys.filter((key) => !keys.has(key)), ...keys]),
		groups,
		removedCount: previous.removedCount + removed.length,
		lastRemoved: removed.length,
		lastAt: now
	};
}
function youtubeCleanupProtected(video, signals) {
	const alias = cleanupKey(video);
	return Boolean(signals.favorites[video.id] || signals.likes[video.id] || signals.favorites[alias] || signals.likes[alias] || signals.managed?.(video.id) || signals.managed?.(alias) || video.remote?.live || video.remote?.youtubeType === "live" || video.remote?.youtubeType === "upcoming" || normalizeRating(signals.rating(video.id)) >= 3 || alias !== video.id && normalizeRating(signals.rating(alias)) >= 3 || signals.activeId === video.id || signals.previewId === video.id || signals.activeId === alias || signals.previewId === alias);
}
function rotationAvailable(counts, settings, group, remaining = cleanupPolicy(settings, group).batch) {
	return cleanupPolicy(settings, group).enabled && settings[`${group}MaxEntries`] > 0 && settings.remoteMaxEntries > 0 && remaining > 0;
}
/** A lowered cap can recover gradually. Actual retirement still requires a
* successful provider response containing fresh, unretired identities. */
function replacementRequestBudget(counts, settings, group, budgets = cleanupBudgets(settings)) {
	const capacity = remainingEntrySlots(counts, settings, group);
	if (!cleanupPolicy(settings, group).enabled || settings[`${group}MaxEntries`] <= 0 || settings.remoteMaxEntries <= 0) return capacity;
	const own = cleanupBudgetAvailable(budgets, settings, group);
	let shared = 0;
	if (settings.sharedCapCleanup) for (const donor of CLEANUP_GROUPS) {
		const available = cleanupBudgetAvailable(budgets, settings, donor);
		if (donor !== group && counts[donor] && rotationAvailable(counts, settings, donor, available)) shared += available;
	}
	const sourceRoom = Math.max(0, settings[`${group}MaxEntries`] - counts[group] + own - capacity);
	return capacity + Math.max(own, Math.min(own + shared, sourceRoom));
}
var canRotateForGroup = (counts, settings, group, budgets = cleanupBudgets(settings)) => replacementRequestBudget(counts, settings, group, budgets) > remainingEntrySlots(counts, settings, group);
var adultPolicies = /* @__PURE__ */ new WeakMap();
function adultAdmissionPolicy(settings, automatic = false) {
	if (!automatic || settings.adultCatalogTarget >= settings.adultMaxEntries) return settings;
	let policy = adultPolicies.get(settings);
	if (!policy) {
		policy = Object.freeze({
			...settings,
			adultMaxEntries: Math.min(settings.adultMaxEntries, settings.adultCatalogTarget)
		});
		adultPolicies.set(settings, policy);
	}
	return policy;
}
function cleanupAge(video) {
	if (video.remote?.kind === "youtube") return youtubePublicationTime(video);
	const at = video.addedAt;
	return Number.isFinite(at) && at > Date.UTC(2e3, 0, 1) ? at : 0;
}
var cleanupSourceKeys = (video) => [
	video.folderId,
	...video.remote?.sourceIds ?? [],
	...video.remote?.channelId ? [`${video.remote.kind}:creator:${video.remote.channelId}`] : []
];
/** Smallest rating first, then oldest known publication. No complete sort or
* scored catalog copy; source representatives and positive user signals stay. */
async function planYoutubeCleanup(videos, signals, options, turn) {
	const limit = Math.max(0, Math.min(1e3, Math.floor(options.limit)));
	if (!limit) return {
		videos,
		removed: []
	};
	const group = options.group ?? "youtube";
	const keepers = /* @__PURE__ */ new Map();
	await forEachCatalogSlice(videos, (video) => {
		if (entryGroup(video) !== group) return;
		const key = cleanupKey(video), at = cleanupAge(video) || Number.MAX_SAFE_INTEGER;
		for (const source of cleanupSourceKeys(video)) {
			const before = keepers.get(source);
			if (!before || at > before.at) keepers.set(source, {
				key,
				at
			});
		}
	}, turn);
	const keptKeys = /* @__PURE__ */ new Set();
	await forEachCatalogEntry(keepers.entries(), ([source, row]) => {
		if (!options.replacementSources?.has(source)) keptKeys.add(row.key);
	}, turn);
	const best = createBoundedPicks(Math.min(2048, limit * 2 + 32), (a, b) => a.rating - b.rating || a.at - b.at || a.index - b.index);
	const cutoff = options.now - Math.max(0, options.minAgeDays) * 864e5;
	await forEachCatalogSlice(videos, (video, index) => {
		if (entryGroup(video) !== group) return;
		const key = cleanupKey(video), at = cleanupAge(video);
		if (!at || at > cutoff || keptKeys.has(key) || options.exclude?.has(key) || youtubeCleanupProtected(video, signals)) return;
		best.add({
			video,
			rating: normalizeRating(signals.rating(video.id)),
			at,
			index
		});
	}, turn);
	const candidates = best.finish(), candidateKeys = new Set(candidates.map((row) => cleanupKey(row.video))), blocked = /* @__PURE__ */ new Set();
	const rowCounts = /* @__PURE__ */ new Map();
	await forEachCatalogSlice(videos, (video) => {
		if (entryGroup(video) !== group || !candidateKeys.has(cleanupKey(video))) return;
		const key = cleanupKey(video);
		rowCounts.set(key, (rowCounts.get(key) ?? 0) + 1);
		if (youtubeCleanupProtected(video, signals)) blocked.add(cleanupKey(video));
	}, turn);
	const removed = [], selectedKeys = /* @__PURE__ */ new Set();
	let count = 0;
	for (const { video } of candidates) {
		const key = cleanupKey(video);
		if (selectedKeys.has(key) || blocked.has(key) || count + rowCounts.get(key) > limit) continue;
		selectedKeys.add(key);
		count += rowCounts.get(key);
	}
	if (!selectedKeys.size) return {
		videos,
		removed
	};
	const retained = [];
	await forEachCatalogSlice(videos, (video) => {
		if (selectedKeys.has(cleanupKey(video)) && entryGroup(video) === group) removed.push(video);
		else retained.push(video);
	}, turn);
	return {
		videos: retained,
		removed
	};
}
var CATALOG_OPERATION_PREFIX = "catalog-operation:";
var CATALOG_CONTROL_KEY = "catalog-operation-control";
var CATALOG_EDIT_PREFIX = "catalog-metadata:";
var CATALOG_EDIT_MIRROR = "reelcase.catalog-edits.v1";
var CATALOG_OPERATION_LIMITS = {
	rows: 64,
	pending: 8,
	bytes: 8 * 1024 ** 2,
	mirror: 256
};
var state = {
	revision: 0,
	phase: "idle",
	recovered: 0,
	pending: 0
};
var listeners = /* @__PURE__ */ new Set();
var catalogRecoverySnapshot = () => state;
var subscribeCatalogRecovery = (listener) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};
function publish(patch) {
	state = {
		...state,
		...patch,
		revision: state.revision + 1
	};
	for (const listener of listeners) listener();
}
function catalogSaveFailure(error) {
	const message = error instanceof DOMException && error.name === "QuotaExceededError" ? "Browser storage is full. Preview disposable artwork cleanup, then retry saved operations." : "Catalog changes need recovery. Existing saved data is retained; retry or review the recovery notes.";
	if (state.phase === "error" && state.error === message) return;
	publish({
		phase: "error",
		error: message
	});
	if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("reelcase:save-error"));
}
function sized(value) {
	const stack = [value], seen = /* @__PURE__ */ new Set();
	let bytes = 0, nodes = 0;
	while (stack.length) {
		const item = stack.pop();
		if (++nodes > 3e5) throw Error("Catalog operation exceeds its metadata budget.");
		if (typeof item === "string") bytes += item.length * 2;
		else if (item && typeof item === "object") {
			if (seen.has(item)) continue;
			seen.add(item);
			if (item instanceof Blob) bytes += item.size;
			else for (const [key, value] of Object.entries(item)) {
				bytes += key.length * 2;
				stack.push(value);
			}
		} else if (typeof item === "function" || typeof item === "symbol") throw Error("Catalog operation contains unsupported metadata.");
		else bytes += 8;
		if (bytes > CATALOG_OPERATION_LIMITS.bytes) throw Error("Catalog operation exceeds its metadata budget.");
	}
	return bytes;
}
var id = (value) => typeof value === "string" && value.length > 0 && value.length <= 2048;
function validProvenance(value) {
	if (!value || typeof value !== "object") return false;
	const row = value;
	return !!row.tags && typeof row.tags === "object" && !Array.isArray(row.tags) && Object.keys(row.tags).length <= 256 && Object.values(row.tags).every((source) => typeof source === "string" && source.length <= 128) && (!row.lockedFields || Array.isArray(row.lockedFields) && row.lockedFields.every((field) => field === "tags" || field === "category")) && [
		row.updatedAt,
		row.manualTagsAt,
		row.manualCategoryAt
	].every((at) => at === void 0 || Number.isFinite(at) && at >= 0);
}
function validCatalogControl(value) {
	if (value === void 0) return true;
	if (!value || typeof value !== "object") return false;
	const row = value;
	return row.version === 1 && Number.isSafeInteger(row.sequence) && Number(row.sequence) >= 0 && (row.committed === void 0 || Number.isSafeInteger(row.committed) && Number(row.committed) >= 0);
}
function validCatalogOperation(value) {
	if (!value || typeof value !== "object") return false;
	const row = value;
	if (row.version !== 1 || ![
		"remote",
		"local",
		"cleanup",
		"edit"
	].includes(row.kind)) return false;
	if (row.kind === "edit") return !!row.edit && id(row.edit.id) && id(row.edit.nonce) && Number.isFinite(row.edit.at) && Array.isArray(row.edit.tags) && row.edit.tags.length <= 256 && row.edit.tags.every((tag) => typeof tag === "string" && tag.length <= 512) && validProvenance(row.edit.provenance) && (row.edit.field === void 0 || row.edit.field === "tags" || row.edit.field === "category") && (row.edit.category === void 0 || typeof row.edit.category === "string" && row.edit.category.length <= 80);
	if (row.kind === "cleanup") return Array.isArray(row.removed) && row.removed.length <= 1e3 && row.removed.every(id) && !!row.cleanup && Array.isArray(row.cleanup.recentKeys) && row.cleanup.recentKeys.length <= 4e4;
	return Array.isArray(row.rows) && row.rows.length <= CATALOG_OPERATION_LIMITS.rows && row.rows.every((video) => video && id(video.id) && id(video.folderId)) && (!row.enrichment || row.enrichment.length <= 64 && row.enrichment.every((edit) => id(edit.id) && Array.isArray(edit.tags) && edit.tags.length <= 256 && edit.tags.every((tag) => typeof tag === "string" && tag.length <= 512) && validProvenance(edit.provenance))) && (!row.meta || Array.isArray(row.meta.folders) && row.meta.folders.length <= 2e4 && Number.isFinite(row.meta.checkedAt));
}
function pendingRange() {
	return IDBKeyRange.bound(CATALOG_OPERATION_PREFIX, "catalog-operation:￿");
}
function transaction(db, stores, body) {
	return new Promise((resolve, reject) => {
		let tx;
		try {
			tx = db.transaction(stores, "readwrite", { durability: "strict" });
		} catch (error) {
			if (!(error instanceof TypeError)) throw error;
			tx = db.transaction(stores, "readwrite");
		}
		let value;
		let failure;
		tx.oncomplete = () => resolve(value);
		tx.onerror = tx.onabort = () => reject(failure ?? tx.error ?? /* @__PURE__ */ new Error("Catalog transaction interrupted."));
		try {
			body(tx, (next) => {
				value = next;
			}, (error) => {
				failure = error;
				tx.abort();
			});
		} catch (error) {
			try {
				tx.abort();
			} finally {
				reject(error);
			}
		}
	});
}
/** Only pending journal records are walked. Payloads are bounded deltas, never a
* duplicate catalog. Apply, metadata and commit marker share one transaction. */
function createCatalogMutations(open, writer) {
	function ownedTransaction(db, stores, body, dirty = true) {
		return transaction(db, stores, (tx, done, fail) => {
			const token = writer?.current();
			if (writer) {
				if (!token) {
					fail(Error("Catalog writer lease is required."));
					return;
				}
				writer.guard(tx, token, () => body(tx, done, fail), fail, dirty);
			} else body(tx, done, fail);
		});
	}
	let recovering;
	const memoryEdits = /* @__PURE__ */ new Map();
	function readLocalMirror() {
		let text;
		try {
			text = localStorage.getItem(CATALOG_EDIT_MIRROR);
		} catch {
			text = null;
		}
		if (!text) return [];
		if (text.length > 4 * 1024 ** 2) throw Error("Manual edit recovery exceeds its budget.");
		const value = JSON.parse(text);
		if (value.version !== 1 || !Array.isArray(value.edits) || value.edits.length > 256 || !value.edits.every((edit) => validCatalogOperation({
			version: 1,
			kind: "edit",
			edit
		}))) throw Error("Unknown or damaged manual edit recovery; original records were preserved.");
		return value.edits;
	}
	function readMirror() {
		const rows = new Map(readLocalMirror().map((row) => [row.id, row]));
		for (const [id, row] of memoryEdits) if ((rows.get(id)?.at ?? 0) <= row.at) rows.set(id, row);
		return [...rows.values()];
	}
	function mirror(rows) {
		if (rows.length) {
			const text = JSON.stringify({
				version: 1,
				edits: rows
			});
			if (rows.length > 256 || text.length > 4 * 1024 ** 2) throw Error("Edit mirror budget reached.");
			localStorage.setItem(CATALOG_EDIT_MIRROR, text);
		} else localStorage.removeItem(CATALOG_EDIT_MIRROR);
	}
	async function stage(operation) {
		if (!validCatalogOperation(operation)) throw Error("Invalid or unsupported catalog operation.");
		sized(operation);
		const db = await open();
		try {
			await ownedTransaction(db, ["remote-cache"], (tx, _done, fail) => {
				const remote = tx.objectStore("remote-cache"), control = remote.get(CATALOG_CONTROL_KEY), pending = remote.getAllKeys(pendingRange(), 9);
				pending.onsuccess = () => {
					try {
						if (!validCatalogControl(control.result)) throw Error("Unknown catalog recovery version; records preserved.");
						if (pending.result.length >= 8) throw Error("Catalog recovery queue is full. Retry existing operations first.");
						const sequence = (control.result?.sequence ?? 0) + 1;
						if (!Number.isSafeInteger(sequence)) throw Error("Catalog recovery sequence unavailable.");
						remote.put({
							...control.result,
							version: 1,
							sequence
						}, CATALOG_CONTROL_KEY);
						remote.put(operation, CATALOG_OPERATION_PREFIX + String(sequence).padStart(16, "0"));
					} catch (error) {
						fail(error);
					}
				};
			});
		} finally {
			db.close();
		}
	}
	async function applyNext() {
		const db = await open();
		try {
			return await ownedTransaction(db, [
				"remote-cache",
				"videos",
				"activity"
			], (tx, done, fail) => {
				const remote = tx.objectStore("remote-cache"), activity = tx.objectStore("activity"), videos = tx.objectStore("videos");
				const request = remote.openCursor(pendingRange());
				request.onsuccess = () => {
					const cursor = request.result;
					if (!cursor) {
						done(false);
						return;
					}
					const token = writer?.current();
					if (writer && token) writer.touch(tx, token);
					const operation = cursor.value;
					if (!validCatalogOperation(operation) || operation.kind === "cleanup") {
						tx.abort();
						return;
					}
					const control = remote.get(CATALOG_CONTROL_KEY), cleanup = remote.get("youtube-cleanup");
					cleanup.onsuccess = () => {
						try {
							if (!control.result || !validCatalogControl(control.result)) throw Error("Unsupported recovery control.");
							const retired = retiredYoutubeKeys(normalizeYoutubeCleanup(cleanup.result));
							if (operation.kind === "edit") {
								const edit = operation.edit, previous = activity.get(CATALOG_EDIT_PREFIX + edit.id);
								previous.onsuccess = () => {
									try {
										if (!previous.result || previous.result.at < edit.at || previous.result.at === edit.at && previous.result.nonce !== edit.nonce) {
											const prior = previous.result;
											activity.put({
												...edit,
												category: edit.category ?? prior?.category,
												provenance: {
													...edit.provenance,
													manualTagsAt: edit.provenance.manualTagsAt ?? prior?.provenance.manualTagsAt,
													manualCategoryAt: edit.provenance.manualCategoryAt ?? prior?.provenance.manualCategoryAt
												}
											}, CATALOG_EDIT_PREFIX + edit.id);
										}
									} catch (error) {
										fail(error);
									}
								};
							} else {
								const target = operation.kind === "remote" ? remote : videos;
								for (const video of operation.rows) {
									if (video.isSample || video.remote && retired.has(cleanupKey(video))) continue;
									const key = operation.kind === "remote" ? "video:" + video.id : video.id, previous = target.get(key);
									previous.onsuccess = () => {
										try {
											target.put(withCatalogDetails(video, previous.result), keyPath(target, key));
										} catch (error) {
											fail(error);
										}
									};
								}
								for (const row of operation.enrichment ?? []) {
									const manual = activity.get(CATALOG_EDIT_PREFIX + row.id), previous = activity.get("metadata-enrichment:" + row.id);
									previous.onsuccess = () => {
										try {
											if (!manual.result?.provenance?.lockedFields?.includes("tags") && (!previous.result || (previous.result.provenance?.updatedAt ?? 0) <= (row.provenance.updatedAt ?? 0))) activity.put(row, "metadata-enrichment:" + row.id);
										} catch (error) {
											fail(error);
										}
									};
								}
								if (operation.meta) remote.put(operation.meta, "meta");
								if (operation.complete) remote.delete("snapshot");
							}
							remote.delete(cursor.primaryKey);
							remote.put({
								...control.result,
								committed: (control.result.committed ?? 0) + 1,
								lastKind: operation.kind,
								at: Date.now()
							}, CATALOG_CONTROL_KEY);
							done(true);
						} catch (error) {
							fail(error);
						}
					};
				};
			}, false);
		} finally {
			db.close();
		}
	}
	async function drain() {
		let count = 0;
		while (await applyNext()) {
			count++;
			writer?.markChanged();
			publish({
				phase: "working",
				recovered: state.recovered + 1
			});
			await yieldCatalogTask();
			if (count > 1024) throw Error("Recovery is still busy. Retry after current writers settle.");
		}
	}
	async function recoverInternal() {
		if (recovering) return recovering;
		recovering = (async () => {
			publish({
				phase: "working",
				error: void 0
			});
			await drain();
			for (let pass = 0; pass < 8; pass++) {
				const pending = readMirror();
				if (!pending.length) {
					publish({
						phase: "idle",
						pending: 0
					});
					return;
				}
				publish({ pending: pending.length });
				for (const edit of pending) {
					await stage({
						version: 1,
						kind: "edit",
						edit
					});
					await drain();
					const latest = readLocalMirror();
					try {
						const kept = latest.filter((row) => row.id !== edit.id || row.nonce !== edit.nonce);
						if (kept.length !== latest.length) mirror(kept);
						if (memoryEdits.get(edit.id)?.nonce === edit.nonce) memoryEdits.delete(edit.id);
					} catch {
						throw Error("The committed edit mirror could not be acknowledged. Retry safely.");
					}
				}
			}
			throw Error("New edits are still arriving. Retry after editing settles.");
		})().catch((error) => {
			catalogSaveFailure(error);
			throw error;
		}).finally(() => {
			recovering = void 0;
		});
		return recovering;
	}
	async function commitCleanup(operation) {
		if (!validCatalogOperation(operation)) throw Error("Invalid cleanup operation.");
		sized(operation);
		const db = await open();
		try {
			await ownedTransaction(db, [
				"remote-cache",
				"videos",
				"activity"
			], (tx, _done, fail) => {
				const remote = tx.objectStore("remote-cache"), control = remote.get(CATALOG_CONTROL_KEY);
				control.onsuccess = () => {
					try {
						if (!validCatalogControl(control.result)) throw Error("Unknown recovery control.");
						const sequence = (control.result?.sequence ?? 0) + 1, key = CATALOG_OPERATION_PREFIX + String(sequence).padStart(16, "0");
						remote.put(operation, key);
						for (const id of operation.removed) {
							remote.delete("video:" + id);
							tx.objectStore("videos").delete(id);
							tx.objectStore("activity").delete("metadata-enrichment:" + id);
						}
						remote.put(operation.cleanup, "youtube-cleanup");
						remote.delete(key);
						remote.put({
							...control.result,
							version: 1,
							sequence,
							committed: (control.result?.committed ?? 0) + 1,
							lastKind: "cleanup",
							at: Date.now()
						}, CATALOG_CONTROL_KEY);
					} catch (error) {
						fail(error);
					}
				};
			});
		} finally {
			db.close();
		}
	}
	async function writeInternal(operation) {
		try {
			await recoverInternal();
			if (operation.kind === "cleanup") await commitCleanup(operation);
			else {
				await stage(operation);
				await drain();
			}
			publish({
				phase: "idle",
				error: void 0,
				lastKind: operation.kind
			});
		} catch (error) {
			catalogSaveFailure(error);
			throw error;
		}
	}
	function edit(row) {
		let edits;
		try {
			edits = readMirror();
		} catch (error) {
			catalogSaveFailure(error);
			return;
		}
		const previous = edits.find((value) => value.id === row.id), at = Math.max(Date.now(), (previous?.at ?? 0) + 1, row.provenance.updatedAt ?? 0, (row.provenance.manualTagsAt ?? 0) + 1, (row.provenance.manualCategoryAt ?? 0) + 1), edit = {
			...row,
			nonce: crypto.randomUUID(),
			at,
			provenance: {
				...row.provenance,
				updatedAt: at,
				...row.field === "category" ? { manualCategoryAt: at } : { manualTagsAt: at }
			}
		};
		try {
			if (!validCatalogOperation({
				version: 1,
				kind: "edit",
				edit
			}) || sized(edit) > 32768) throw Error("Manual metadata exceeds its recovery budget.");
		} catch (error) {
			catalogSaveFailure(error);
			return;
		}
		if (edits.length >= 256 && !previous) {
			catalogSaveFailure(Error("Pending edit limit reached."));
			return;
		}
		edits = edits.filter((value) => value.id !== row.id);
		edits.push(edit);
		try {
			mirror(edits);
		} catch {
			memoryEdits.set(edit.id, edit);
		}
		recover().catch(() => {});
		return edit;
	}
	async function restore(base) {
		let result = base, after;
		const admit = (edit) => {
			if (!validCatalogOperation({
				version: 1,
				kind: "edit",
				edit
			})) return;
			const current = result.metadataProvenance[edit.id], tagAt = edit.provenance.manualTagsAt ?? (edit.field === "category" ? 0 : edit.at), categoryAt = edit.provenance.manualCategoryAt ?? (edit.category === void 0 ? 0 : edit.at);
			const currentTagAt = current?.lockedFields?.includes("tags") ? current.manualTagsAt ?? current.updatedAt ?? 0 : current?.updatedAt ?? 0;
			const tags = tagAt > 0 && tagAt >= currentTagAt, category = edit.category !== void 0 && categoryAt > 0 && categoryAt >= (current?.manualCategoryAt ?? (current?.category === "manual" ? current.updatedAt ?? 0 : 0));
			if (!tags && !category) return;
			const locks = new Set(current?.lockedFields ?? []);
			for (const field of ["tags", "category"]) if ((field === "tags" ? tags : category) && edit.provenance.lockedFields?.includes(field)) locks.add(field);
			const provenance = {
				...current,
				...tags ? edit.provenance : {},
				...category ? {
					category: edit.provenance.category ?? "manual",
					manualCategoryAt: categoryAt
				} : {
					category: current?.category,
					manualCategoryAt: current?.manualCategoryAt
				},
				lockedFields: [...locks],
				updatedAt: Math.max(current?.updatedAt ?? 0, edit.at),
				tags: tags ? edit.provenance.tags : current?.tags ?? {}
			};
			result = {
				tags: tags ? patchSparseRecord(result.tags, [[edit.id, edit.tags]]) : result.tags,
				metadataProvenance: patchSparseRecord(result.metadataProvenance, [[edit.id, provenance]]),
				categories: category ? patchSparseRecord(result.categories, [[edit.id, edit.category]]) : result.categories
			};
		};
		const db = await open();
		try {
			for (;;) {
				const rows = await new Promise((resolve, reject) => {
					const request = db.transaction("activity").objectStore("activity").getAll(IDBKeyRange.bound(after ?? "catalog-metadata:", "catalog-metadata:￿", !!after), 256);
					request.onsuccess = () => resolve(request.result);
					request.onerror = () => reject(request.error);
				});
				for (const row of rows) admit(row);
				if (rows.length < 256) break;
				after = CATALOG_EDIT_PREFIX + rows.at(-1).id;
				await yieldCatalogTask();
			}
		} finally {
			db.close();
		}
		for (const row of readMirror()) admit(row);
		return result;
	}
	const recover = () => writer ? writer.run(() => recoverInternal(), false) : recoverInternal();
	const write = (operation) => writer ? writer.run(() => writeInternal(operation)) : writeInternal(operation);
	return {
		write,
		recover,
		edit,
		restore
	};
}
function keyPath(store, key) {
	return store.keyPath === null ? key : void 0;
}
var bytes = (thumb) => typeof thumb === "string" ? thumb.length * 2 : thumb instanceof Blob ? thumb.size : 0;
var labels = {
	"thumb-cache": "Disposable artwork",
	videos: "Saved video catalog",
	dirs: "Approved folder handles",
	"source-health": "Source health",
	activity: "Personal state and tool documents",
	"activity-journal": "Watch activity events",
	"remote-cache": "Remote catalog, details and pending recovery"
};
/** Counts/estimates only. Personal values and full catalogs are never scanned. */
function createStorageRecovery(open, now = Date.now) {
	let plan;
	async function inventory(signal) {
		signal?.throwIfAborted();
		const db = await open();
		let stores;
		try {
			stores = await new Promise((resolve, reject) => {
				const names = Array.from(db.objectStoreNames).filter((name) => Object.hasOwn(labels, name)), tx = db.transaction(names), rows = [];
				for (const name of names) {
					const request = tx.objectStore(name).count();
					request.onsuccess = () => rows.push({
						name: labels[name],
						count: request.result,
						disposable: name === "thumb-cache"
					});
				}
				tx.oncomplete = () => resolve(rows);
				tx.onerror = tx.onabort = () => reject(tx.error ?? Error("Storage inventory unavailable."));
			});
		} finally {
			db.close();
		}
		let estimate = {};
		try {
			estimate = await navigator.storage?.estimate() ?? {};
		} catch {}
		let localKeys;
		try {
			localKeys = localStorage.length;
		} catch {}
		signal?.throwIfAborted();
		return {
			at: now(),
			stores,
			localKeys,
			...Number.isFinite(estimate.usage) && estimate.usage >= 0 ? { usage: estimate.usage } : {},
			...Number.isFinite(estimate.quota) && estimate.quota > 0 ? { quota: estimate.quota } : {}
		};
	}
	async function preview(signal) {
		plan = void 0;
		const snapshot = await inventory(signal), db = await open(), rows = [];
		let after;
		try {
			while (rows.length < 256) {
				signal?.throwIfAborted();
				const page = await new Promise((resolve, reject) => {
					const tx = db.transaction("thumb-cache"), store = tx.objectStore("thumb-cache"), range = after === void 0 ? void 0 : IDBKeyRange.lowerBound(after, true), keys = store.getAllKeys(range, 16), values = store.getAll(range, 16);
					tx.oncomplete = () => resolve({
						keys: keys.result,
						values: values.result
					});
					tx.onerror = tx.onabort = () => reject(tx.error ?? Error("Artwork preview unavailable."));
				});
				for (const row of page.values) {
					if (rows.length >= 256) break;
					if (typeof row.id === "string" && Number.isFinite(row.at)) rows.push({
						id: row.id,
						at: row.at,
						bytes: bytes(row.thumb)
					});
				}
				if (page.keys.length < 16) break;
				after = page.keys.at(-1);
				await yieldCatalogTask();
			}
		} finally {
			db.close();
		}
		signal?.throwIfAborted();
		const result = {
			id: crypto.randomUUID(),
			at: now(),
			count: rows.length,
			estimatedBytes: rows.reduce((total, row) => total + row.bytes, 0),
			limit: 256,
			inventory: snapshot
		};
		plan = {
			preview: result,
			rows
		};
		return result;
	}
	function cancel(id) {
		if (!id || plan?.preview.id === id) plan = void 0;
	}
	async function clean(id) {
		const selected = plan;
		if (!selected || selected.preview.id !== id || now() - selected.preview.at > 3e5) {
			plan = void 0;
			throw Error("Artwork preview expired. Preview again before clearing.");
		}
		plan = void 0;
		const db = await open();
		let removed = 0, estimatedBytes = 0;
		try {
			for (let offset = 0; offset < selected.rows.length; offset += 16) {
				const batch = selected.rows.slice(offset, offset + 16);
				const result = await new Promise((resolve, reject) => {
					const tx = db.transaction("thumb-cache", "readwrite"), store = tx.objectStore("thumb-cache");
					let removed = 0, estimatedBytes = 0, failure;
					for (const receipt of batch) {
						const request = store.get(receipt.id);
						request.onsuccess = () => {
							try {
								const row = request.result;
								if (row && row.at === receipt.at && bytes(row.thumb) === receipt.bytes) {
									store.delete(receipt.id);
									removed++;
									estimatedBytes += receipt.bytes;
								}
							} catch (error) {
								failure = error;
								tx.abort();
							}
						};
					}
					tx.oncomplete = () => resolve({
						removed,
						estimatedBytes
					});
					tx.onerror = tx.onabort = () => reject(failure ?? tx.error ?? Error("Artwork cleanup was interrupted."));
				});
				removed += result.removed;
				estimatedBytes += result.estimatedBytes;
				await yieldCatalogTask();
			}
		} catch (error) {
			throw Object.assign(/* @__PURE__ */ new Error("Artwork cleanup stopped. " + removed + " cache entries were removed; saved media and personal records are unchanged. Preview again to continue."), {
				cause: error,
				removed,
				estimatedBytes
			});
		} finally {
			db.close();
		}
		return {
			removed,
			estimatedBytes,
			skipped: selected.rows.length - removed
		};
	}
	return {
		inventory,
		preview,
		cancel,
		clean
	};
}
var adult = new Set(ADULT_PULL_PROVIDERS);
function videoIsPrivate(privateIds, video) {
	return adult.has(video.remote?.kind ?? "") || privateIds.has(video.folderId) || (video.remote?.sourceIds ?? []).some((id) => privateIds.has(id));
}
/** Public surfaces never inherit permission from unlocking the private desk.
* A merged title keeps the most restrictive source membership. */
function publicVideoBoundary(folders) {
	const privateIds = adultFolderIds(folders ?? []);
	return (video) => !videoIsPrivate(privateIds, video);
}
/** Read scene/fansub episode notation without treating years, resolution or
* codecs as episode numbers. This groups titles for browsing, never identity. */
function animeTitleInfo(name) {
	const clean = name.replace(/\.(?:mkv|mp4|webm|avi|mov|m4v|ts)$/i, "").replace(/\[[^\]]{0,120}\]/g, " ").replace(/[._]+/g, " ").replace(/\s+/g, " ").trim();
	const film = /\b(?:movie|film|theatrical)\b/i.test(clean), special = !film && /\b(?:ova|ona|special)\b/i.test(clean);
	const episode = /\bS(\d{1,2})\s*E(\d{1,3})(?:v\d)?\b/i.exec(clean) ?? /\b(\d{1,2})x(\d{1,3})\b/i.exec(clean);
	const numbered = /\b(?:episode|ep\.?|e)\s*(\d{1,3})(?:v\d)?\b/i.exec(clean) ?? /(?:\s[-–]\s|\s-)(\d{1,3})(?:v\d)?(?=\s|$|\()/i.exec(clean) ?? /第\s*(\d{1,3})\s*話/.exec(clean);
	const marker = episode ?? numbered;
	const series = (marker ? clean.slice(0, marker.index) : clean).replace(/\b(?:season\s*\d+)\b.*$/i, "").replace(/[\s\-–:]+$/, "").trim() || clean;
	return {
		series,
		key: series.normalize("NFKC").toLocaleLowerCase(),
		season: episode ? Number(episode[1]) : Number(/\bseason\s*(\d+)\b/i.exec(clean)?.[1] ?? 1),
		...marker ? { episode: Number(episode ? episode[2] : numbered[1]) } : {},
		format: film ? "film" : special ? "special" : marker ? "episode" : "title"
	};
}
var ANIME_EPISODE_LIMIT = 4096;
var EMPTY_ANIME_REVIEWS = {
	version: 1,
	updatedAt: 0,
	series: {},
	episodes: {}
};
var clean$1 = (v, max = 160) => typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "";
var key$1 = (v) => typeof v === "string" && v.length > 0 && v.length <= 500 && !/[\u0000-\u001f]/.test(v) && ![
	"__proto__",
	"prototype",
	"constructor"
].includes(v);
var stamp$1 = (v) => Number.isSafeInteger(v) && Number(v) >= 0;
var number = (v, min, max) => Number.isInteger(v) && Number(v) >= min && Number(v) <= max;
var mode = (v) => v === "season" || v === "absolute";
var identity = (v) => /^anime:[a-z0-9-]{1,80}$/i.test(v);
var lane = (v) => v.numbering === "absolute" ? "absolute" : "season:" + v.season;
var animeSlotKey = (v) => lane(v) + ":" + v.kind + ":" + (v.episode ?? "?");
function readRange(r) {
	if (!r || !mode(r.numbering) || !number(r.season, r.numbering === "absolute" ? 0 : 1, r.numbering === "absolute" ? 0 : 100) || !number(r.start, 1, 1e4) || !number(r.end, r.start, 1e4) || r.end - r.start + 1 > 200) throw Error("Choose a range of at most 200 episodes within one numbering lane.");
	return {
		numbering: r.numbering,
		season: r.season,
		start: r.start,
		end: r.end
	};
}
function readSeries(r, id) {
	if (!identity(id) || !r || !clean$1(r.title) || !clean$1(r.release, 80) || !stamp$1(r.at) || !Array.isArray(r.aliases) || r.aliases.length > 12 || r.aliases.some((a) => typeof a !== "string" || !clean$1(a)) || !Array.isArray(r.ranges) || r.ranges.length > 24 || !r.policy || !mode(r.policy.numbering) || ![
		.9,
		.95,
		.992,
		1
	].includes(r.policy.threshold) || typeof r.policy.specials !== "boolean") throw Error("Invalid reviewed anime series. Enter a title and release/version label.");
	const ranges = r.ranges.map(readRange);
	if (new Set(ranges.map(lane)).size !== ranges.length) throw Error("Each season/absolute lane can have only one reviewed range.");
	return {
		id,
		title: clean$1(r.title),
		release: clean$1(r.release, 80),
		aliases: [...new Set(r.aliases.map((a) => clean$1(a)))],
		ranges,
		policy: {
			numbering: r.policy.numbering,
			threshold: r.policy.threshold,
			specials: r.policy.specials
		},
		at: r.at
	};
}
function readEpisode(r) {
	if (!r || !identity(r.seriesId) || !mode(r.numbering) || !number(r.season, r.numbering === "absolute" ? 0 : 1, r.numbering === "absolute" ? 0 : 100) || ![
		"episode",
		"special",
		"ova",
		"unresolved"
	].includes(r.kind) || !stamp$1(r.at) || typeof r.preferred !== "boolean" || r.episode !== void 0 && !number(r.episode, 1, 1e4) || r.kind === "episode" && r.episode === void 0 || r.kind === "unresolved" && r.episode !== void 0) throw Error("Confirm a valid episode number, or keep this source unresolved.");
	return {
		seriesId: r.seriesId,
		numbering: r.numbering,
		season: r.season,
		...r.episode !== void 0 ? { episode: r.episode } : {},
		kind: r.kind,
		preferred: r.preferred,
		at: r.at
	};
}
function parseAnimeReviews(raw) {
	const r = raw;
	if (!r || r.version !== 1 || !stamp$1(r.updatedAt) || !r.series || !r.episodes || typeof r.series !== "object" || typeof r.episodes !== "object" || Array.isArray(r.series) || Array.isArray(r.episodes) || Object.keys(r.series).length > 512 || Object.keys(r.episodes).length > 4096) throw Error("Unsupported or invalid anime review ledger.");
	const series = Object.create(null), episodes = Object.create(null), preferred = /* @__PURE__ */ new Set();
	for (const [id, value] of Object.entries(r.series)) series[id] = readSeries(value, id);
	for (const [id, value] of Object.entries(r.episodes)) {
		if (!key$1(id)) throw Error("Invalid anime source key.");
		const e = readEpisode(value);
		if (!series[e.seriesId]) throw Error("Episode has no reviewed series.");
		if (e.preferred) {
			const slot = e.seriesId + ":" + animeSlotKey(e);
			if (preferred.has(slot)) throw Error("Only one preferred version is allowed for each episode.");
			preferred.add(slot);
		}
		episodes[id] = e;
	}
	let undo;
	if (r.undo) {
		if (!r.undo.series || !r.undo.episodes || Object.keys(r.undo.series).length > 1 || Object.keys(r.undo.episodes).length > 48) throw Error("Invalid anime review Undo.");
		undo = {
			series: Object.create(null),
			episodes: Object.create(null)
		};
		for (const [id, v] of Object.entries(r.undo.series)) {
			if (!identity(id)) throw Error("Invalid Undo series.");
			undo.series[id] = v === null ? null : readSeries(v, id);
		}
		for (const [id, v] of Object.entries(r.undo.episodes)) {
			if (!key$1(id)) throw Error("Invalid Undo source.");
			undo.episodes[id] = v === null ? null : readEpisode(v);
		}
	}
	return {
		version: 1,
		updatedAt: r.updatedAt,
		series,
		episodes,
		...undo ? { undo } : {},
		...clean$1(r.action, 120) ? { action: clean$1(r.action, 120) } : {}
	};
}
function normalizeAnimeReviews(raw) {
	try {
		return parseAnimeReviews(raw);
	} catch {
		return EMPTY_ANIME_REVIEWS;
	}
}
function newestAnimeReviews(a, b) {
	const left = normalizeAnimeReviews(a), right = normalizeAnimeReviews(b);
	return right.updatedAt >= left.updatedAt ? right : left;
}
function commit$1(ledger, patch, action, now) {
	const series = { ...ledger.series }, episodes = { ...ledger.episodes }, undo = {
		series: {},
		episodes: {}
	};
	for (const [id, v] of Object.entries(patch.series)) {
		undo.series[id] = series[id] ?? null;
		if (v) series[id] = v;
		else delete series[id];
	}
	for (const [id, v] of Object.entries(patch.episodes)) {
		undo.episodes[id] = episodes[id] ?? null;
		if (v) episodes[id] = v;
		else delete episodes[id];
	}
	if (Object.keys(series).length > 512 || Object.keys(episodes).length > 4096) throw Error("Anime review holds at most 512 identities and 4,096 source versions. Undo a recent addition before adding another.");
	return parseAnimeReviews({
		version: 1,
		updatedAt: Math.max(now, ledger.updatedAt + 1),
		series,
		episodes,
		undo,
		action
	});
}
function confirmAnimeEpisode(ledger, videoId, choice, now = Date.now()) {
	if (!key$1(videoId)) throw Error("Invalid source.");
	const old = ledger.episodes[videoId], existing = ledger.series[choice.seriesId];
	if (choice.existing && !existing) throw Error("Choose an existing reviewed series.");
	if (!choice.existing && existing) throw Error("Use the existing identity control to avoid replacing a reviewed series.");
	const series = choice.existing ? existing : readSeries({
		id: choice.seriesId,
		title: choice.title,
		release: choice.release,
		aliases: choice.aliases,
		ranges: [],
		policy: {
			numbering: choice.numbering,
			threshold: .95,
			specials: false
		},
		at: now
	}, choice.seriesId);
	const episode = readEpisode({
		...choice,
		preferred: false,
		at: now
	});
	episode.preferred = old?.seriesId === episode.seriesId && animeSlotKey(old) === animeSlotKey(episode) ? old.preferred : false;
	return commit$1(ledger, {
		series: choice.existing ? {} : { [series.id]: series },
		episodes: { [videoId]: episode }
	}, "Confirmed anime identity and episode mapping", now);
}
function editAnimeSeries(ledger, id, values, now = Date.now()) {
	const current = ledger.series[id];
	if (!current) throw Error("Review the series first.");
	const next = readSeries({
		...current,
		...values,
		at: now
	}, id);
	return commit$1(ledger, {
		series: { [id]: next },
		episodes: {}
	}, "Updated reviewed series labels and aliases", now);
}
function removeAnimeMapping(ledger, videoId, now = Date.now()) {
	if (!ledger.episodes[videoId]) return ledger;
	return commit$1(ledger, {
		series: {},
		episodes: { [videoId]: null }
	}, "Removed episode mapping; source and progress retained", now);
}
function setAnimeRange(ledger, id, range, remove = false, now = Date.now()) {
	const current = ledger.series[id];
	if (!current) throw Error("Review the series first.");
	const valid = readRange(range), ranges = current.ranges.filter((r) => lane(r) !== lane(valid));
	if (!remove) ranges.push(valid);
	return commit$1(ledger, {
		series: { [id]: {
			...current,
			ranges,
			at: now
		} },
		episodes: {}
	}, remove ? "Removed entered episode range" : "Saved entered episode range; release schedule unverified", now);
}
function setAnimePolicy(ledger, id, policy, now = Date.now()) {
	const current = ledger.series[id];
	if (!current) throw Error("Review the series first.");
	if (JSON.stringify(current.policy) === JSON.stringify(policy)) return ledger;
	return commit$1(ledger, {
		series: { [id]: {
			...current,
			policy,
			at: now
		} },
		episodes: {}
	}, "Saved explicit next-episode policy", now);
}
function preferAnimeVersion(ledger, videoId, available, now = Date.now()) {
	const e = ledger.episodes[videoId];
	if (!e || !available.includes(videoId)) throw Error("Choose an available reviewed source version.");
	if (e.preferred) return ledger;
	const episodes = {};
	for (const [id, row] of Object.entries(ledger.episodes)) if (row.preferred && row.seriesId === e.seriesId && animeSlotKey(row) === animeSlotKey(e)) episodes[id] = {
		...row,
		preferred: false,
		at: now
	};
	episodes[videoId] = {
		...e,
		preferred: true,
		at: now
	};
	return commit$1(ledger, {
		series: {},
		episodes
	}, "Changed preferred episode version", now);
}
function undoAnimeReview(ledger, now = Date.now()) {
	return ledger.undo ? commit$1(ledger, ledger.undo, "Undid last anime review change", now) : ledger;
}
function animeReviewVisibility(scope) {
	const publicIds = new Set(scope.folders.filter((f) => !f.adult).map((f) => f.id)), privateIds = new Set(scope.folders.filter((f) => f.adult).map((f) => f.id));
	return (v) => !scope.hidden[v.id] && !scope.unavailable[v.id] && !videoIsPrivate(privateIds, v) && !v.isSample && !v.remote?.live && (!v.remote ? publicIds.has(v.folderId) : v.remote.kind === "youtube" && v.remote.youtubeType !== "short" && v.remote.youtubeType !== "upcoming");
}
function reviewedAnimeInfo(video, ledger) {
	const e = ledger?.episodes[video.id], s = e && ledger?.series[e.seriesId];
	return s && e ? {
		series: s.title + " · " + s.release,
		key: s.id,
		season: e.season,
		episode: e.episode,
		format: e.kind === "episode" ? "episode" : e.kind === "unresolved" ? "title" : "special"
	} : animeTitleInfo(video.name);
}
/** Input is the current eligible reviewed catalog. No tail beyond the observed
* maximum is invented, and large/absolute lanes never allocate a huge gap grid. */
function buildAnimeEpisodeMap(series, owned) {
	const slotMap = /* @__PURE__ */ new Map(), unresolved = [];
	for (const v of owned.slice(0, ANIME_EPISODE_LIMIT)) {
		const e = v.review;
		if (e.seriesId !== series.id) continue;
		if (e.kind === "unresolved" || e.episode === void 0) {
			unresolved.push(v);
			continue;
		}
		const k = animeSlotKey(e), slot = slotMap.get(k);
		if (slot) slot.versions.push(v);
		else slotMap.set(k, {
			key: k,
			numbering: e.numbering,
			season: e.season,
			episode: e.episode,
			kind: e.kind,
			versions: [v]
		});
	}
	const order = (a, b) => a.numbering.localeCompare(b.numbering) || a.season - b.season || a.episode - b.episode || a.kind.localeCompare(b.kind);
	const numbered = [...slotMap.values()].filter((s) => s.kind === "episode").sort(order), specials = [...slotMap.values()].filter((s) => s.kind !== "episode").sort(order), lanes = /* @__PURE__ */ new Map();
	for (const s of numbered) {
		const k = lane(s), row = lanes.get(k) ?? {
			numbering: s.numbering,
			season: s.season,
			episodes: /* @__PURE__ */ new Map()
		};
		row.episodes.set(s.episode, s.versions);
		lanes.set(k, row);
	}
	for (const r of series.ranges) {
		const k = lane(r), row = lanes.get(k) ?? {
			numbering: r.numbering,
			season: r.season,
			episodes: /* @__PURE__ */ new Map()
		};
		row.range = r;
		lanes.set(k, row);
	}
	const result = [];
	for (const [key, row] of lanes) {
		const seen = [...row.episodes.keys()], start = row.range?.start ?? Math.min(...seen), end = row.range?.end ?? Math.max(...seen), unverified = !Number.isFinite(start) || end - start + 1 > 200;
		result.push({
			key,
			numbering: row.numbering,
			season: row.season,
			start,
			end,
			origin: row.range ? "entered" : "observed",
			unverified,
			slots: unverified ? [] : Array.from({ length: end - start + 1 }, (_, i) => ({
				episode: start + i,
				versions: row.episodes.get(start + i) ?? []
			}))
		});
	}
	result.sort((a, b) => a.numbering.localeCompare(b.numbering) || a.season - b.season);
	return {
		lanes: result,
		numbered,
		specials,
		unresolved
	};
}
var progress = (v) => {
	const r = v.resume;
	return r && Number.isFinite(r.t) && Number.isFinite(r.d) && Number.isFinite(r.at) && r.d > 0 && r.t >= 2 && r.at >= 0 ? r : void 0;
};
/** Each slot is one episode regardless of duplicate cuts. Specials are a
* separate opt-in tail. Numbering lanes are never inferred or mixed. */
function nextAnimeEpisode(series, map) {
	const numbered = map.numbered.filter((s) => s.numbering === series.policy.numbering), specials = series.policy.specials ? map.specials.filter((s) => s.numbering === series.policy.numbering) : [], slots = [...numbered, ...specials];
	const playable = (s) => s.versions.filter((v) => v.available), pick = (s) => {
		const all = playable(s);
		return all.find((v) => v.review.preferred) ?? all.find((v) => !v.video.remote) ?? all.slice().sort((a, b) => a.video.id.localeCompare(b.video.id))[0];
	};
	let anchor = -1, last;
	for (let i = 0; i < slots.length; i++) for (const v of slots[i].versions) {
		const r = progress(v), old = last && progress(last);
		if (r && (!old || r.at > old.at || r.at === old.at && v.video.id.localeCompare(last.video.id) < 0)) {
			anchor = i;
			last = v;
		}
	}
	if (last && progress(last).t / progress(last).d < series.policy.threshold) {
		if (last.available) return {
			version: last,
			slot: slots[anchor],
			reason: "Resume the exact version most recently watched; other versions keep their own progress.",
			skip: 0,
			resume: true
		};
		return {
			reason: "The most recently watched version needs its source reconnected. Choose a version in the episode map.",
			skip: 0,
			resume: true
		};
	}
	let unavailable = 0;
	for (let i = anchor + 1; i < slots.length; i++) {
		const s = slots[i];
		if (s.versions.some((v) => {
			const r = progress(v);
			return r && r.t / r.d >= series.policy.threshold;
		})) continue;
		const version = pick(s);
		if (!version) {
			unavailable++;
			continue;
		}
		let skip = 0;
		const previous = slots[anchor];
		if (previous && s.kind === "episode" && previous.kind === "episode" && s.numbering === previous.numbering && s.season === previous.season) {
			const existing = new Set(numbered.filter((r) => r.season === s.season).map((r) => r.episode));
			skip = Math.max(0, s.episode - previous.episode - 1) - [...existing].filter((n) => n > previous.episode && n < s.episode).length;
		}
		return {
			version,
			slot: s,
			reason: (s.kind !== "episode" ? "Specials/OVAs are explicitly enabled and follow the numbered episodes. " : anchor < 0 ? "Start with the first confirmed available episode. " : "Next confirmed episode after the most recent completed episode. ") + (skip ? `${skip} intervening episode slot${skip === 1 ? " is" : "s are"} absent from the eligible reviewed library. ` : "") + (unavailable ? `${unavailable} saved slot${unavailable === 1 ? " needs" : "s need"} a reconnected source. ` : "") + "Opening requires your action; no autoplay is added.",
			skip,
			resume: false
		};
	}
	return {
		reason: slots.length ? "No later incomplete confirmed episode is available in the chosen numbering lane. Specials stay excluded unless enabled." : "Review numbered episodes in this numbering lane first. Unresolved sources never become automatic next choices.",
		skip: 0,
		resume: false
	};
}
var FILM_FIELDS = [
	"title",
	"year",
	"poster",
	"genre"
];
var EMPTY_FILMS = {
	version: 1,
	updatedAt: 0,
	films: {},
	versions: {}
};
var clean = (value, max = 160) => typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "";
var key = (value) => typeof value === "string" && value.length > 0 && value.length <= 500 && !/[\u0000-\u001f]/.test(value) && ![
	"__proto__",
	"constructor",
	"prototype"
].includes(value);
var stamp = (value) => Number.isSafeInteger(value) && Number(value) >= 0;
var validFilmRuntime = (n) => typeof n === "number" && Number.isFinite(n) && n > 600 && n <= 31536e3;
var validFilmYear = (n) => Number.isInteger(n) && Number(n) >= 1888 && Number(n) <= (/* @__PURE__ */ new Date()).getFullYear() + 1;
function filmPoster(value) {
	const text = clean(value, 2048);
	if (!text) return void 0;
	if (/^\/(?!\/)/.test(text) && !text.includes("..")) return text;
	try {
		const url = new URL(text);
		if (url.protocol === "https:" && !url.username && !url.password) return url.href;
	} catch {}
}
function readFilm(raw, id) {
	if (!/^film:[a-z0-9-]{1,80}$/i.test(id) || !raw || !clean(raw.title) || !validFilmYear(raw.year) || !stamp(raw.at) || !Array.isArray(raw.locks) || raw.locks.some((f) => !FILM_FIELDS.includes(f)) || raw.preferred !== void 0 && !key(raw.preferred)) throw Error("Invalid film identity.");
	if (raw.poster !== void 0 && !filmPoster(raw.poster)) throw Error("Invalid film poster URL.");
	const origins = {};
	for (const field of FILM_FIELDS) {
		const value = raw.origins?.[field];
		if (value !== void 0 && !["owner-review", "saved-catalog"].includes(value)) throw Error("Invalid film provenance.");
		if (value) origins[field] = value;
	}
	return {
		id,
		title: clean(raw.title),
		year: raw.year,
		...raw.poster ? { poster: filmPoster(raw.poster) } : {},
		...clean(raw.genre, 80) ? { genre: clean(raw.genre, 80) } : {},
		locks: [...new Set(raw.locks)],
		origins,
		...raw.preferred ? { preferred: raw.preferred } : {},
		at: raw.at
	};
}
function readVersion(raw) {
	if (!raw || !/^film:[a-z0-9-]{1,80}$/i.test(raw.filmId) || !validFilmRuntime(raw.runtime) || !stamp(raw.at) || typeof raw.grouped !== "boolean") throw Error("Invalid reviewed film version.");
	return {
		filmId: raw.filmId,
		runtime: raw.runtime,
		edition: clean(raw.edition, 80) || "Unspecified edition",
		grouped: raw.grouped,
		at: raw.at
	};
}
function parseFilmLedger(raw) {
	const r = raw;
	if (!r || r.version !== 1 || !stamp(r.updatedAt) || !r.films || !r.versions || typeof r.films !== "object" || typeof r.versions !== "object" || Array.isArray(r.films) || Array.isArray(r.versions) || Object.keys(r.films).length > 1024 || Object.keys(r.versions).length > 4096) throw Error("Unsupported or invalid film review ledger.");
	const films = Object.create(null), versions = Object.create(null);
	for (const [id, value] of Object.entries(r.films)) films[id] = readFilm(value, id);
	for (const [id, value] of Object.entries(r.versions)) {
		if (!key(id)) throw Error("Invalid version identity.");
		const v = readVersion(value);
		if (!films[v.filmId]) throw Error("Reviewed version has no film.");
		versions[id] = v;
	}
	let undo;
	if (r.undo) {
		if (!r.undo.films || !r.undo.versions || Object.keys(r.undo.films).length > 1 || Object.keys(r.undo.versions).length > 48) throw Error("Invalid film undo record.");
		undo = {
			films: Object.create(null),
			versions: Object.create(null)
		};
		for (const [id, v] of Object.entries(r.undo.films)) undo.films[id] = v === null ? null : readFilm(v, id);
		for (const [id, v] of Object.entries(r.undo.versions)) {
			if (!key(id)) throw Error("Invalid undo version.");
			undo.versions[id] = v === null ? null : readVersion(v);
		}
	}
	return {
		version: 1,
		updatedAt: r.updatedAt,
		films,
		versions,
		...undo ? { undo } : {},
		...clean(r.action, 100) ? { action: clean(r.action, 100) } : {}
	};
}
function normalizeFilmLedger(raw) {
	try {
		return parseFilmLedger(raw);
	} catch {
		return EMPTY_FILMS;
	}
}
function newestFilms(a, b) {
	const left = normalizeFilmLedger(a), right = normalizeFilmLedger(b);
	return right.updatedAt >= left.updatedAt ? right : left;
}
function commit(ledger, patch, action, now) {
	const films = { ...ledger.films }, versions = { ...ledger.versions }, undo = {
		films: {},
		versions: {}
	};
	for (const [id, v] of Object.entries(patch.films)) {
		undo.films[id] = films[id] ?? null;
		if (v) films[id] = v;
		else delete films[id];
	}
	for (const [id, v] of Object.entries(patch.versions)) {
		undo.versions[id] = versions[id] ?? null;
		if (v) versions[id] = v;
		else delete versions[id];
	}
	if (Object.keys(films).length > 1024 || Object.keys(versions).length > 4096) throw Error("The review limit is 1,024 film identities and 4,096 source versions. Undo a recent addition before adding another.");
	return parseFilmLedger({
		version: 1,
		updatedAt: Math.max(now, ledger.updatedAt + 1),
		films,
		versions,
		undo,
		action
	});
}
function confirmFilm(ledger, videoId, choice, now = Date.now()) {
	if (!key(videoId) || !validFilmRuntime(choice.runtime)) throw Error("Confirm a runtime over 10 minutes.");
	const existing = ledger.films[choice.filmId];
	if (choice.existing && !existing) throw Error("Select an existing reviewed film.");
	const film = choice.existing ? existing : readFilm({
		id: choice.filmId,
		title: choice.title,
		year: choice.year,
		locks: ["title", "year"],
		origins: {
			title: "owner-review",
			year: "owner-review"
		},
		at: now
	}, choice.filmId);
	return commit(ledger, {
		films: choice.existing ? {} : { [film.id]: film },
		versions: { [videoId]: {
			filmId: film.id,
			runtime: choice.runtime,
			edition: clean(choice.edition, 80) || "Unspecified edition",
			grouped: ledger.versions[videoId]?.filmId === film.id ? ledger.versions[videoId].grouped : false,
			at: now
		} }
	}, "Confirmed film identity and runtime", now);
}
function groupFilmVersions(ledger, ids, grouped, now = Date.now()) {
	if (!ids.length || ids.length > 48 || new Set(ids).size !== ids.length) throw Error("Select 1–48 reviewed versions.");
	const filmId = ledger.versions[ids[0]]?.filmId;
	if (!filmId || ids.some((id) => ledger.versions[id]?.filmId !== filmId)) throw Error("Only versions of the same reviewed film can group.");
	return commit(ledger, {
		films: {},
		versions: Object.fromEntries(ids.map((id) => [id, {
			...ledger.versions[id],
			grouped,
			at: now
		}]))
	}, grouped ? "Grouped reviewed editions" : "Ungrouped editions; individual records retained", now);
}
function preferFilmVersion(ledger, filmId, videoId, available, now = Date.now()) {
	const film = ledger.films[filmId];
	if (!film || ledger.versions[videoId]?.filmId !== filmId || !available.includes(videoId)) throw Error("Choose an available reviewed version with verified runtime.");
	if (film.preferred === videoId) return ledger;
	return commit(ledger, {
		films: { [filmId]: {
			...film,
			preferred: videoId,
			at: now
		} },
		versions: {}
	}, "Changed preferred film version", now);
}
function lockFilmField(ledger, id, field, locked, now = Date.now()) {
	const film = ledger.films[id];
	if (!film || !FILM_FIELDS.includes(field)) throw Error("Unknown film field.");
	if (film.locks.includes(field) === locked) return ledger;
	return commit(ledger, {
		films: { [id]: {
			...film,
			locks: locked ? [...film.locks, field] : film.locks.filter((f) => f !== field),
			at: now
		} },
		versions: {}
	}, (locked ? "Locked " : "Unlocked ") + field, now);
}
function previewFilmFields(film, proposal, selected, categoryLocked = false) {
	return FILM_FIELDS.filter((field) => selected.includes(field)).map((field) => {
		const value = proposal[field], valid = field === "year" ? validFilmYear(value) : field === "poster" ? Boolean(filmPoster(value)) : Boolean(clean(value, field === "genre" ? 80 : 160));
		return {
			field,
			before: film[field] ?? "",
			after: field === "poster" ? filmPoster(value) ?? "" : value ?? "",
			state: film.locks.includes(field) || field === "genre" && categoryLocked ? "locked" : !valid ? "invalid" : value === film[field] ? "unchanged" : "ready"
		};
	});
}
function applyFilmFields(ledger, id, proposal, selected, origin, categoryLocked = false, now = Date.now()) {
	const film = ledger.films[id];
	if (!film) throw Error("Review the film identity first.");
	const preview = previewFilmFields(film, proposal, selected, categoryLocked);
	if (preview.some((row) => row.state === "invalid")) throw Error("The selected metadata proposal is invalid. Previous fields were kept.");
	const ready = preview.filter((row) => row.state === "ready");
	if (!ready.length) throw Error("No unlocked changed fields are selected.");
	const next = {
		...film,
		origins: { ...film.origins },
		at: now
	};
	for (const row of ready) {
		if (row.field === "year") next.year = Number(row.after);
		else next[row.field] = clean(row.after, row.field === "poster" ? 2048 : row.field === "genre" ? 80 : 160);
		next.origins[row.field] = origin;
	}
	return commit(ledger, {
		films: { [id]: next },
		versions: {}
	}, "Applied selected film fields: " + ready.map((r) => r.field).join(", "), now);
}
function undoFilmReview(ledger, now = Date.now()) {
	return ledger.undo ? commit(ledger, ledger.undo, "Undid last film review change", now) : ledger;
}
function editionEvidence(name) {
	const title = name.slice(0, 500).replace(/[._]/g, " ");
	return [
		[/\b(director'?s cut)\b/i, "Director’s cut"],
		[/\b(extended(?: edition| cut)?)\b/i, "Extended cut"],
		[/\b(theatrical(?: edition| cut)?)\b/i, "Theatrical cut"],
		[/\b(final cut)\b/i, "Final cut"],
		[/\b(unrated)\b/i, "Unrated"],
		[/\b(remastered|remaster)\b/i, "Remastered"]
	].find(([pattern]) => pattern.test(title))?.[1];
}
function filmNameEvidence(video) {
	const base = video.name.replace(/\.(mkv|mp4|avi|mov|m4v|webm)$/i, "").replace(/[._]/g, " "), year = /\b(18[89]\d|19\d{2}|20\d{2})\b/.exec(base);
	return {
		title: base.split(/\b(?:18[89]\d|19\d{2}|20\d{2}|2160p|1080p|720p|bluray|webrip|extended|theatrical|directors? cut)\b/i)[0].replace(/[()[\] -]+$/g, "").trim().slice(0, 160),
		year: validFilmYear(video.year) ? video.year : year ? Number(year[1]) : void 0,
		edition: editionEvidence(video.name),
		runtime: validFilmRuntime(video.duration) ? video.duration : void 0,
		origin: "Saved title/year/runtime; unverified identity until owner review"
	};
}
function filmVisibility(scope) {
	const publicIds = new Set(scope.folders.filter((f) => !f.adult).map((f) => f.id)), privateIds = new Set(scope.folders.filter((f) => f.adult).map((f) => f.id));
	return (video) => !scope.hidden[video.id] && !scope.unavailable[video.id] && !videoIsPrivate(privateIds, video) && !video.isSample && !video.remote?.live && (!video.remote ? publicIds.has(video.folderId) : video.remote.kind === "youtube" && video.remote.youtubeType !== "short" && video.remote.youtubeType !== "upcoming");
}
function projectFilmVideo(video, ledger, provenance) {
	const version = ledger.versions[video.id], film = version && ledger.films[version.filmId];
	if (!film) return video;
	return {
		...video,
		name: film.title + " (" + film.year + ")" + (version.edition === "Unspecified edition" ? "" : " · " + version.edition),
		year: film.year,
		duration: version.runtime,
		...film.poster ? { poster: film.poster } : {},
		...film.genre && !provenance?.lockedFields?.includes("category") ? { genre: film.genre } : {},
		filmReview: {
			filmId: film.id,
			edition: version.edition,
			ownerReviewed: true
		}
	};
}
var DEFAULT_RECOMMENDATION_SESSION = Object.freeze({
	familiarity: "balanced",
	length: "any",
	sources: "all"
});
function normalizeRecommendationSession(raw) {
	const familiarity = [
		"balanced",
		"familiar",
		"explore"
	].includes(raw?.familiarity ?? "") ? raw.familiarity : "balanced";
	const length = [
		"any",
		"short",
		"medium",
		"long"
	].includes(raw?.length ?? "") ? raw.length : "any";
	const sources = [
		"all",
		"balanced",
		"youtube",
		"twitch",
		"local"
	].includes(raw?.sources ?? "") ? raw.sources : "all";
	return familiarity === "balanced" && length === "any" && sources === "all" ? DEFAULT_RECOMMENDATION_SESSION : Object.freeze({
		familiarity,
		length,
		sources
	});
}
var sameRecommendationSession = (a, b) => a.familiarity === b.familiarity && a.length === b.length && a.sources === b.sources;
function recommendationSource(video) {
	return video.remote?.kind ?? "local";
}
/** Length is a strict recording filter. Live observations have no promised end time. */
function sessionAllows(video, tuning, live = false) {
	if (tuning.sources !== "all" && tuning.sources !== "balanced" && recommendationSource(video) !== tuning.sources) return false;
	if (live || tuning.length === "any") return true;
	const seconds = video.duration;
	if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) return false;
	return tuning.length === "short" ? seconds <= 600 : tuning.length === "medium" ? seconds > 600 && seconds <= 3600 : seconds > 3600;
}
/** A temporary score modifier never edits or cancels explicit feedback penalties. */
function sessionPreferenceAdjustment(preference, tuning) {
	const weight = Math.max(0, Math.min(96, Number.isFinite(preference) ? preference : 0)) * 2;
	return tuning.familiarity === "familiar" ? Math.min(24, weight) : tuning.familiarity === "explore" ? -weight : 0;
}
/** Balanced sources retains at most twelve rows per source, never a second full ranking. */
function createSessionPicks(limit, compare, videoOf, tuning) {
	return createSourcePicks(limit, compare, (row) => recommendationSource(videoOf(row)), tuning);
}
function createSourcePicks(limit, compare, sourceOf, tuning) {
	if (tuning.sources !== "balanced") return createBoundedPicks(limit, compare);
	const buckets = new Map([
		"youtube",
		"twitch",
		"local",
		"other"
	].map((source) => [source, createBoundedPicks(limit, compare)]));
	return {
		add(row) {
			const source = sourceOf(row);
			buckets.get(buckets.has(source) ? source : "other").add(row);
		},
		finish() {
			const queues = [...buckets.values()].map((bucket) => bucket.finish()).filter((queue) => queue.length).sort((a, b) => compare(a[0], b[0]));
			const selected = [];
			for (let offset = 0; selected.length < limit; offset++) {
				let added = false;
				for (const queue of queues) if (queue[offset] !== void 0) {
					selected.push(queue[offset]);
					added = true;
					if (selected.length === limit) break;
				}
				if (!added) break;
			}
			return selected;
		}
	};
}
var DEFAULT_GUIDE_WEIGHTS = Object.freeze({
	favorite: 3,
	like: 2,
	topic: 1
});
function isGuideWeights(raw) {
	const r = raw;
	return Boolean(r && Number.isInteger(r.favorite) && r.favorite >= 0 && r.favorite <= 8 && Number.isInteger(r.like) && r.like >= 0 && r.like <= 8 && Number.isInteger(r.topic) && r.topic >= 0 && r.topic <= 3);
}
var sameGuideWeights = (a, b) => a.favorite === b.favorite && a.like === b.like && a.topic === b.topic;
function guideWeights(raw) {
	return isGuideWeights(raw) ? Object.freeze({
		favorite: raw.favorite,
		like: raw.like,
		topic: raw.topic
	}) : DEFAULT_GUIDE_WEIGHTS;
}
var guidePositive = (favorite, like, topics, w) => Number(favorite) * w.favorite + Number(like) * w.like + topics * w.topic;
function guidePersonalScore(row, w, session) {
	const positive = guidePositive(row.favorite, row.like, row.topics, w);
	return positive + sessionPreferenceAdjustment(positive, session) - row.penalty - row.exposure;
}
function guideTieRank(id, seed) {
	let value = seed >>> 0;
	for (const char of id) value = Math.imul(value ^ char.charCodeAt(0), 73244475);
	return value >>> 0;
}
var EMPTY_GUIDE_PRESET = Object.freeze({
	version: 1,
	updatedAt: 0,
	current: DEFAULT_GUIDE_WEIGHTS
});
function isGuidePreset(raw) {
	const r = raw;
	return Boolean(r && r.version === 1 && Number.isSafeInteger(r.updatedAt) && r.updatedAt >= 0 && isGuideWeights(r.current) && (r.previous === void 0 || isGuideWeights(r.previous)));
}
function normalizeGuidePreset(raw) {
	return isGuidePreset(raw) ? Object.freeze({
		version: 1,
		updatedAt: raw.updatedAt,
		current: guideWeights(raw.current),
		...raw.previous ? { previous: guideWeights(raw.previous) } : {}
	}) : EMPTY_GUIDE_PRESET;
}
function newestGuidePreset(a, b) {
	const left = normalizeGuidePreset(a), right = normalizeGuidePreset(b);
	return right.updatedAt >= left.updatedAt ? right : left;
}
function changeGuidePreset(ledger, weights, now = Date.now()) {
	if (!isGuideWeights(weights)) throw Error("Invalid Guide weights.");
	if (sameGuideWeights(ledger.current, weights)) return ledger;
	return normalizeGuidePreset({
		version: 1,
		updatedAt: Math.max(now, ledger.updatedAt + 1),
		current: weights,
		previous: ledger.current
	});
}
var rollbackGuidePreset = (ledger, now = Date.now()) => ledger.previous ? changeGuidePreset(ledger, ledger.previous, now) : ledger;
var BRIDGE_SOURCES = [
	"local",
	"youtube",
	"twitch",
	"photo"
];
var EMPTY_BRIDGES = {
	version: 1,
	updatedAt: 0,
	entries: []
};
var bridgeText = (value) => value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
function videoBridgeSource(video) {
	return !video.remote ? "local" : video.remote.kind === "youtube" || video.remote.kind === "twitch" ? video.remote.kind : void 0;
}
/** Operational labels must not become topics even through an approved alias. */
function bridgeTopic(raw) {
	const value = raw.trim().toLowerCase().replace(/^keyword-/, "");
	if (!/^[\p{L}\p{N}][\p{L}\p{N} -]{1,63}$/u.test(value) || /^(?:provider|creator|source|format|auto|sub|fetish|genre|meta|vision|file|filetype|extension|year|date|published|added|downloaded|resolution|codec)[ -]/.test(value) || /^(?:\d[\d -]*|youtube|twitch|photo|photos|video|videos|shorts?|clips?|vod|live|upload|mp4|mkv|webm|mov|avi|png|jpe?g|gif|webp|heic|camera|screenshot|download)$/i.test(value)) return;
	return canonicalTopic(value);
}
var bridgePair = (a, b) => BRIDGE_SOURCES.indexOf(a) < BRIDGE_SOURCES.indexOf(b) ? [a, b] : [b, a];
var bridgeKey = (row) => {
	const [a, b] = bridgePair(row.a, row.b);
	return row.topic + "|" + a + "|" + b;
};
function isBridgeLedger(raw) {
	const v = raw;
	return Boolean(v && v.version === 1 && Number.isSafeInteger(v.updatedAt) && v.updatedAt >= 0 && Array.isArray(v.entries));
}
function normalizeBridgeLedger(raw) {
	if (!isBridgeLedger(raw)) return EMPTY_BRIDGES;
	const rows = /* @__PURE__ */ new Map();
	for (const row of raw.entries.slice(0, 512)) {
		if (!row || !BRIDGE_SOURCES.includes(row.a) || !BRIDGE_SOURCES.includes(row.b) || row.a === row.b || typeof row.topic !== "string" || bridgeTopic(row.topic) !== row.topic || !Number.isSafeInteger(row.at) || row.at < 0) continue;
		const [a, b] = bridgePair(row.a, row.b), next = {
			topic: row.topic,
			a,
			b,
			at: row.at
		}, key = bridgeKey(next);
		if (!rows.has(key) || rows.get(key).at <= row.at) rows.set(key, next);
	}
	return {
		version: 1,
		updatedAt: raw.updatedAt,
		entries: [...rows.values()].sort((a, b) => b.at - a.at || bridgeKey(a).localeCompare(bridgeKey(b))).slice(0, 256)
	};
}
function newestBridges(a, b) {
	const left = normalizeBridgeLedger(a), right = normalizeBridgeLedger(b);
	return right.updatedAt >= left.updatedAt ? right : left;
}
function changeBridge(ledger, row, remove = false, now = Date.now()) {
	const clean = normalizeBridgeLedger({
		version: 1,
		updatedAt: now,
		entries: [row]
	}).entries[0];
	if (!clean) throw Error("Choose a supported content topic and two different public sources.");
	const key = bridgeKey(clean), present = ledger.entries.some((entry) => bridgeKey(entry) === key);
	if (remove && !present || !remove && present) return ledger;
	if (!remove && ledger.entries.length >= 256) throw Error("The 256-bridge limit is reached. Undo a pause before adding another.");
	return {
		version: 1,
		updatedAt: Math.max(now, ledger.updatedAt + 1),
		entries: remove ? ledger.entries.filter((entry) => bridgeKey(entry) !== key) : [{
			...clean,
			at: now
		}, ...ledger.entries]
	};
}
function bridgePolicy(raw) {
	const paused = new Set(normalizeBridgeLedger(raw).entries.map(bridgeKey));
	return (topic, a, b) => a !== b && paused.has(bridgeKey({
		topic,
		a,
		b
	}));
}
function bridgeFields(video, tags = []) {
	const source = videoBridgeSource(video);
	if (!source) return [];
	const fields = /* @__PURE__ */ new Map();
	for (const raw of tags.slice(0, 80)) {
		const topic = bridgeTopic(raw);
		if (topic && !fields.has(topic)) fields.set(topic, {
			topic,
			field: "saved tag",
			quote: bridgeText(raw)
		});
	}
	if (source !== "local") for (const [field, raw] of [["provider title", video.name], ["provider category", video.genre ?? ""]]) {
		const value = raw.slice(0, 500).replace(/#[\p{L}\p{N}_-]+/gu, "");
		if (/^https?:/i.test(value) || /\.(?:mp4|mkv|webm|mov|avi|png|jpe?g|gif|webp|heic)(?:\s|$)/i.test(value)) continue;
		for (const [topic, pattern] of TOPIC_RULES) if (!fields.has(topic) && pattern.test(value)) fields.set(topic, {
			topic,
			field,
			quote: bridgeText(value)
		});
	}
	return [...fields.values()];
}
var EMPTY_REJECTIONS = {
	version: 1,
	updatedAt: 0,
	entries: []
};
var rejectionKey = (entry) => entry.scope + ":" + entry.target;
function titleRejectionTarget(video) {
	return video.remote?.videoId ? video.remote.kind + ":" + video.remote.videoId : "local:" + video.id;
}
function creatorRejectionTarget(video) {
	if (!video.remote) return video.folderId ? "local:" + video.folderId : void 0;
	const creator = video.remote.channelId || video.remote.channelName?.trim().toLowerCase();
	return creator ? video.remote.kind + ":" + creator : void 0;
}
function isRejectionLedger(raw) {
	const value = raw;
	return Boolean(value && value.version === 1 && Number.isSafeInteger(value.updatedAt) && value.updatedAt >= 0 && Array.isArray(value.entries));
}
function normalizeRejections(raw) {
	const value = raw;
	if (!isRejectionLedger(value)) return EMPTY_REJECTIONS;
	const entries = /* @__PURE__ */ new Map();
	for (const row of value.entries.slice(0, 1024)) {
		if (!row || ![
			"title",
			"creator",
			"topic"
		].includes(row.scope) || typeof row.target !== "string" || !row.target.trim() || row.target.length > 500 || typeof row.label !== "string" || !Number.isSafeInteger(row.at) || row.at < 0) continue;
		if (row.scope === "topic" && canonicalTopic(row.target) !== row.target) continue;
		const key = rejectionKey(row), old = entries.get(key);
		if (!old || row.at >= old.at) entries.set(key, {
			scope: row.scope,
			target: row.target,
			label: row.label.slice(0, 160),
			at: row.at
		});
	}
	return {
		version: 1,
		updatedAt: value.updatedAt,
		entries: [...entries.values()].sort((a, b) => b.at - a.at || rejectionKey(a).localeCompare(rejectionKey(b))).slice(0, 512)
	};
}
/** Whole-ledger timestamps retain removals too, so an older mirror cannot resurrect Undo. */
function newestRejections(a, b) {
	const left = normalizeRejections(a), right = normalizeRejections(b);
	return right.updatedAt >= left.updatedAt ? right : left;
}
function changeRejection(ledger, entry, remove = false, now = Date.now()) {
	const key = rejectionKey(entry), present = ledger.entries.some((row) => rejectionKey(row) === key);
	if (remove && !present || !remove && present) return ledger;
	if (!remove && ledger.entries.length >= 512) throw new Error("The 512-choice limit is reached. Undo an existing choice before adding another.");
	return normalizeRejections({
		version: 1,
		updatedAt: Math.max(now, ledger.updatedAt + 1),
		entries: remove ? ledger.entries.filter((row) => rejectionKey(row) !== key) : [{
			...entry,
			at: now
		}, ...ledger.entries]
	});
}
/** Soft, bounded ranking evidence only. Title rejections never train creator/topic affinity. */
function createRejectionPenalty(raw) {
	const ledger = normalizeRejections(raw), titles = /* @__PURE__ */ new Set(), creators = /* @__PURE__ */ new Set(), topics = /* @__PURE__ */ new Set();
	for (const row of ledger.entries) (row.scope === "title" ? titles : row.scope === "creator" ? creators : topics).add(row.target);
	if (!ledger.entries.length) return (_video, _tags, _protection) => 0;
	return (video, tags, protection = {}) => {
		if (protection.favorite || protection.creatorFavorite) return 0;
		let penalty = titles.has(titleRejectionTarget(video)) ? 40 : 0;
		const creator = creatorRejectionTarget(video);
		if (creator && creators.has(creator)) penalty += 24;
		if (topics.size && topicEvidenceForScan(video, tags).some((link) => topics.has(link.topic) && !protection.tagIsLiked?.(link.topic))) penalty += 16;
		return Math.min(64, penalty);
	};
}
var EXPOSURE_LIMIT = 2048;
var EXPOSURE_DWELL_MS = 2e3;
var EXPOSURE_HALF_LIFE_MS = 6048e5;
var EMPTY_EXPOSURE = {
	version: 1,
	updatedAt: 0,
	entries: []
};
var exposureKey = titleRejectionTarget;
function isExposureLedger(raw) {
	const value = raw;
	return Boolean(value && value.version === 1 && Number.isSafeInteger(value.updatedAt) && value.updatedAt >= 0 && Array.isArray(value.entries));
}
function normalizeExposure(raw, now = Date.now()) {
	if (!isExposureLedger(raw)) return EMPTY_EXPOSURE;
	const entries = /* @__PURE__ */ new Map();
	for (const row of raw.entries.slice(0, EXPOSURE_LIMIT * 2)) {
		if (!row || typeof row.key !== "string" || !row.key || row.key.length > 500 || !Number.isInteger(row.count) || row.count < 1 || !Number.isSafeInteger(row.at) || row.at < 0 || row.at > now || now - row.at >= 2592e6) continue;
		const previous = entries.get(row.key);
		if (!previous || row.at >= previous.at) entries.set(row.key, {
			key: row.key,
			count: Math.min(8, row.count),
			at: row.at
		});
	}
	return {
		version: 1,
		updatedAt: raw.updatedAt,
		entries: [...entries.values()].sort((a, b) => b.at - a.at || a.key.localeCompare(b.key)).slice(0, EXPOSURE_LIMIT)
	};
}
function newestExposure(a, b, now = Date.now()) {
	const left = normalizeExposure(a, now), right = normalizeExposure(b, now);
	return right.updatedAt >= left.updatedAt ? right : left;
}
function applyExposureEvents(ledger, events, now = Date.now()) {
	const rows = new Map(normalizeExposure(ledger, now).entries.map((row) => [row.key, row]));
	let changed = false;
	for (const event of events.slice(0, 256)) {
		if (!event.key || event.key.length > 500 || !Number.isSafeInteger(event.at) || event.at < 0 || event.at > now || now - event.at >= 2592e6) continue;
		const old = rows.get(event.key);
		if (old && event.at - old.at < 18e5) continue;
		rows.set(event.key, {
			key: event.key,
			count: Math.min(8, (old?.count ?? 0) + 1),
			at: event.at
		});
		changed = true;
	}
	return changed ? normalizeExposure({
		version: 1,
		updatedAt: Math.max(now, ledger.updatedAt + 1),
		entries: [...rows.values()]
	}, now) : ledger;
}
function clearExposure(ledger, key, now = Date.now()) {
	return {
		version: 1,
		updatedAt: Math.max(now, ledger.updatedAt + 1),
		entries: key ? ledger.entries.filter((row) => row.key !== key) : []
	};
}
/** A temporary novelty penalty, never an unavailable/hidden flag or negative taste training. */
function createExposurePenalty(ledger, now = Date.now()) {
	const entries = new Map(normalizeExposure(ledger, now).entries.map((row) => [row.key, row]));
	return (video, protection = {}) => {
		if (protection.favorite || protection.liked || protection.creatorFavorite || (protection.rating ?? 0) >= 4) return 0;
		const row = entries.get(exposureKey(video));
		if (!row) return 0;
		return Math.min(18, row.count * 3) * Math.pow(.5, Math.max(0, now - row.at) / EXPOSURE_HALF_LIFE_MS);
	};
}
var periods = [
	"CURRENT",
	"LAST_WEEK",
	"LAST_MONTH",
	"ALL_TIME"
];
var stops = [
	"quota",
	"page-budget",
	"exhausted",
	"partial-error",
	"provider-hold"
];
var count = (n) => typeof n === "number" && Number.isSafeInteger(n) && n >= 0 && n <= 1e5;
var clock = (n) => typeof n === "number" && Number.isFinite(n) && n > 0 && n <= 864e13;
/** One bounded snapshot per creator, shared by reload and backup import. Older
* snapshots remain readable without inventing their missing quota or reason. */
function normalizeTwitchClipDiagnostics(raw) {
	if (!raw || typeof raw !== "object") return;
	const d = raw;
	if (!clock(d.at) || !["recent", "archive"].includes(d.mode) || ![
		d.pages,
		d.received,
		d.accepted,
		d.duplicates
	].every(count) || !Array.isArray(d.windows) || d.windows.length > 4 || new Set(d.windows.map((w) => w?.period)).size !== d.windows.length || !d.windows.every((w) => w && periods.includes(w.period) && [
		"budget",
		"quota",
		"exhausted",
		"error"
	].includes(w.stop) && [
		w.pages,
		w.received,
		w.accepted,
		w.duplicates
	].every(count))) return;
	return {
		at: d.at,
		mode: d.mode,
		pages: d.pages,
		received: d.received,
		accepted: d.accepted,
		duplicates: d.duplicates,
		...count(d.requested) && d.requested <= 500 ? { requested: d.requested } : {},
		...count(d.maxPages) && d.maxPages > 0 && d.maxPages <= 8 ? { maxPages: d.maxPages } : {},
		...stops.includes(d.stopReason ?? "") ? { stopReason: d.stopReason } : {},
		...typeof d.cacheHit === "boolean" ? { cacheHit: d.cacheHit } : {},
		...clock(d.servedAt) ? { servedAt: d.servedAt } : {},
		windows: d.windows.map((w) => ({
			period: w.period,
			pages: w.pages,
			received: w.received,
			accepted: w.accepted,
			duplicates: w.duplicates,
			stop: w.stop,
			...count(w.requested) && w.requested <= 2e3 ? { requested: w.requested } : {},
			...typeof w.error === "string" ? { error: w.error.slice(0, 240) } : {}
		}))
	};
}
function clipCoverageSummary(d) {
	switch (d.stopReason) {
		case "quota": return {
			label: "Requested count reached",
			detail: "The unique clip target was filled. Some returned clips may already be saved in your library."
		};
		case "page-budget": return {
			label: "Page budget reached",
			detail: "The bounded page allowance ended while more shelves or pages remained. Overlapping highlights can use pages without adding unique clips."
		};
		case "exhausted": return {
			label: "Public shelves exhausted",
			detail: "The checked shelves reported no further pages. A sparse public highlight shelf does not prove this creator has no other clips."
		};
		case "partial-error": return {
			label: "Partial window failure",
			detail: "A shelf failed; healthy windows continued within the same budget. Accepted clips and safe older positions were kept."
		};
		case "provider-hold": return {
			label: "Provider wait or challenge",
			detail: "New window reads stopped after Twitch requested a wait or integrity check. Accepted clips and safe positions were kept."
		};
		default: return {
			label: "Saved coverage · reason unrecorded",
			detail: "This older snapshot did not record the overall quota or stop reason. Window results below are the available evidence."
		};
	}
}
function clipWindowLabel(period) {
	return {
		CURRENT: "Current highlights",
		LAST_WEEK: "Past week",
		LAST_MONTH: "Past month",
		ALL_TIME: "All-time highlights"
	}[period] ?? "Public shelf";
}
function clipWindowStop(stop) {
	return {
		quota: "Window quota reached",
		budget: "Page budget or earlier quota · legacy snapshots may not distinguish them",
		exhausted: "No further public pages",
		error: "Window failed"
	}[stop];
}
/** No request, catalog scan or retry override is performed by diagnostics. */
function clipCoverageAction(channel, mode, now) {
	const retryAt = (mode === "recent" ? channel.twitchClipRecentRetry : channel.twitchClipRetry)?.retryAt ?? 0;
	if (retryAt > now) return {
		allowed: false,
		retryAt,
		reason: "Retry available after " + new Date(retryAt).toLocaleString()
	};
	if (mode === "archive" && channel.twitchClipExhaustedAt) return {
		allowed: false,
		retryAt: 0,
		reason: "The saved older public shelf has no further pages. Refresh recent clips for new highlights."
	};
	return {
		allowed: !channel.importNeedsReview,
		retryAt: 0,
		reason: channel.importNeedsReview ? "Resolve this creator before checking clips." : ""
	};
}
var reasons = [
	"page-budget",
	"entry-budget",
	"exhausted",
	"stalled",
	"incomplete-page",
	"challenge",
	"provider-error",
	"entry-limit"
];
function normalizeTwitchPullDiagnostics(raw) {
	if (!raw || typeof raw !== "object") return;
	const row = raw;
	const count = (key) => typeof row[key] === "number" && Number.isSafeInteger(row[key]) && row[key] >= 0 && row[key] <= 1e6;
	if (typeof row.at !== "number" || !Number.isFinite(row.at) || row.at <= 0 || ![
		"pages",
		"received",
		"accepted",
		"duplicates"
	].every(count) || !reasons.includes(row.stopReason)) return;
	return {
		at: row.at,
		pages: row.pages,
		received: row.received,
		accepted: row.accepted,
		duplicates: row.duplicates,
		resumed: row.resumed === true,
		stopReason: row.stopReason,
		...[
			"ARCHIVE",
			"HIGHLIGHT",
			"UPLOAD"
		].includes(row.stage) ? { stage: row.stage } : {},
		...typeof row.lastVideoId === "string" && row.lastVideoId.length <= 128 ? { lastVideoId: row.lastVideoId } : {},
		...typeof row.error === "string" ? { error: row.error.slice(0, 240) } : {}
	};
}
/** The same compact checkpoint contract is used by reloads and backup imports. */
function normalizeFollowCheckpoints(row) {
	const out = {};
	if (row.kind === "youtube") {
		const walk = normalizePlaylistWalk(row.playlistWalk), events = normalizeYoutubeEvents(row.youtubeEvents);
		if (walk) out.playlistWalk = walk;
		if (events) out.youtubeEvents = events;
	}
	const policy = normalizeTwitchPullPolicy(row.twitchPullPolicy);
	if (policy && row.kind === "twitch") out.twitchPullPolicy = policy;
	const clip = normalizeTwitchClipDiagnostics(row.twitchClipDiagnostics);
	if (clip) out.twitchClipDiagnostics = clip;
	const recentPull = normalizeRecentPull(row.recentPull);
	if (recentPull) out.recentPull = recentPull;
	for (const field of [
		"twitchArchiveRetry",
		"twitchLiveRetry",
		"twitchClipRetry",
		"twitchClipRecentRetry"
	]) {
		const retry = normalizeTwitchRetry(row[field]);
		if (retry) out[field] = retry;
	}
	for (const field of [
		"twitchClipRecentAttemptedAt",
		"twitchClipArchiveAttemptedAt",
		"twitchArchiveCheckedAt",
		"catalogCheckedAt",
		"catalogExhaustedAt",
		"twitchArchiveExhaustedAt",
		"twitchClipExhaustedAt",
		"twitchClipCheckedAt",
		"twitchClipRecentCheckedAt"
	]) {
		const value = row[field];
		if (typeof value === "number" && Number.isFinite(value) && value > 0) out[field] = value;
	}
	if (typeof row.catalogCursor === "string" && row.catalogCursor.length > 0 && row.catalogCursor.length <= 16384) out.catalogCursor = row.catalogCursor;
	if (typeof row.twitchArchiveCursor === "string" && row.twitchArchiveCursor.length <= 16384) {
		const decoded = decodeTwitchArchiveCursor(row.twitchArchiveCursor);
		try {
			const raw = JSON.parse(row.twitchArchiveCursor);
			if (raw?.v === 1 && raw.stage === decoded.stage && raw.after === decoded.after) out.twitchArchiveCursor = encodeTwitchArchiveCursor(decoded);
		} catch {}
	}
	if (typeof row.twitchClipCursor === "string") out.twitchClipCursor = encodeTwitchClipCursor(decodeTwitchClipCursor(row.twitchClipCursor));
	if (typeof row.twitchArchiveLastVideoId === "string" && row.twitchArchiveLastVideoId.length <= 128) out.twitchArchiveLastVideoId = row.twitchArchiveLastVideoId;
	const diagnostics = normalizeTwitchPullDiagnostics(row.twitchArchiveDiagnostics);
	if (diagnostics) out.twitchArchiveDiagnostics = diagnostics;
	if (row.lastClipFailure && typeof row.lastClipFailure === "object" && typeof row.lastClipFailure.message === "string") out.lastClipFailure = row.lastClipFailure;
	return out;
}
/** A newer local mirror can be ahead of IndexedDB after a partial write. Keep
* every followed identity, but never let the larger stale list rewind it. */
function mergeFollowRecovery(a, b) {
	const primary = a.channels.length >= b.channels.length ? a : b;
	const secondary = primary === a ? b : a;
	const key = (row) => `${row.kind}:${row.id}`;
	const at = (row, snapshotAt) => snapshotAt || Math.max(row.lastCheckedAt ?? 0, row.catalogCheckedAt ?? 0, row.twitchArchiveDiagnostics?.at ?? 0);
	const out = [...primary.channels];
	const positions = new Map(out.map((row, index) => [key(row), index]));
	for (const row of secondary.channels) {
		const index = positions.get(key(row));
		if (index === void 0) {
			positions.set(key(row), out.length);
			out.push(row);
		} else if (at(row, secondary.savedAt) > at(out[index], primary.savedAt)) out[index] = row;
	}
	return out;
}
var MAX_KEYS = 8192;
var snapshots = /* @__PURE__ */ new WeakMap();
/** Index only requested activity keys, never five aliases for every unwatched
* title. Positions sharing an alias remain separate Continue candidates. */
function createRequest(videos, directKeys) {
	let cache = snapshots.get(videos);
	if (!cache) {
		cache = /* @__PURE__ */ new Map();
		snapshots.set(videos, cache);
	}
	const offsets = /* @__PURE__ */ new Map();
	const fresh = /* @__PURE__ */ new Map();
	const missing = /* @__PURE__ */ new Set();
	const result = /* @__PURE__ */ new Map();
	const acceptKey = (key) => {
		if (result.has(key)) return;
		const saved = cache.get(key);
		if (saved) {
			result.set(key, saved.cards);
			saved.cards.forEach((card, index) => offsets.set(card, saved.offsets[index]));
		} else {
			missing.add(key);
			const entry = {
				cards: [],
				offsets: []
			};
			fresh.set(key, entry);
			result.set(key, entry.cards);
		}
	};
	const visit = (video, offset) => {
		const record = (key) => {
			if (!key || !missing.has(key)) return;
			const entry = fresh.get(key);
			if (entry.cards[entry.cards.length - 1] === video) return;
			entry.cards.push(video);
			entry.offsets.push(offset);
			if (!offsets.has(video)) offsets.set(video, offset);
		};
		record(video.id);
		if (!directKeys.size) record(`id:${video.id}`);
		record(video.remote?.watchUrl);
		record(video.remote?.embedUrl);
		record(video.src);
		record(video.path);
	};
	const commit = (key) => {
		cache.set(key, fresh.get(key));
		if (cache.size > MAX_KEYS) cache.delete(cache.keys().next().value);
	};
	const finish = () => {
		for (const key of missing) commit(key);
		return result;
	};
	const finishAsync = async (turn) => {
		await forEachCatalogEntry(missing, commit, turn);
		return result;
	};
	return {
		missing,
		visit,
		finish,
		finishAsync,
		acceptKey,
		offsets
	};
}
function request(videos, keys, directIds = []) {
	const direct = new Set(directIds), pending = createRequest(videos, direct);
	for (const key of keys) pending.acceptKey(key);
	for (const key of direct) pending.acceptKey(key);
	return pending;
}
function activityLookup(videos, keys) {
	const pending = request(videos, keys);
	if (pending.missing.size) for (let index = 0; index < videos.length; index++) pending.visit(videos[index], index);
	return pending.finish();
}
/** First-time sidebar activity lookup yields as it scans. Cancelled scans
* never leave partial matches or false misses in the shared cache. */
async function activityLookupAsync(videos, keys, turn) {
	const pending = createRequest(videos, /* @__PURE__ */ new Set());
	await forEachCatalogEntry(keys, pending.acceptKey, turn);
	if (pending.missing.size) await forEachCatalogSlice(videos, pending.visit, turn);
	return pending.finishAsync(turn);
}
/** Continue retains every matching card, including titles sharing a stable
* URL after a reimport; callers still apply their ID/privacy filters. */
function activityCandidates(videos, keys, directIds = []) {
	const pending = request(videos, keys, directIds);
	if (pending.missing.size) for (let index = 0; index < videos.length; index++) pending.visit(videos[index], index);
	const matches = pending.finish();
	return [...new Set([...matches.values()].flat())].sort((a, b) => (pending.offsets.get(a) ?? 0) - (pending.offsets.get(b) ?? 0));
}
/** Match saved shelves without doing key allocation or sorting inside a click. */
async function activityCandidatesAsync(videos, keys, directIds, turn) {
	const direct = /* @__PURE__ */ new Set(), pending = createRequest(videos, direct);
	await forEachCatalogEntry(directIds, (id) => {
		if (id !== void 0) {
			direct.add(id);
			pending.acceptKey(id);
		}
	}, turn);
	await forEachCatalogEntry(keys, (key) => {
		if (key !== void 0) pending.acceptKey(key);
	}, turn);
	if (pending.missing.size) await forEachCatalogSlice(videos, pending.visit, turn);
	const matches = await pending.finishAsync(turn);
	const seen = /* @__PURE__ */ new Set(), rows = [];
	function* cards() {
		for (const values of matches.values()) yield* values;
	}
	await forEachCatalogEntry(cards(), (video) => {
		if (!seen.has(video)) {
			seen.add(video);
			rows.push(video);
		}
	}, turn);
	return sortCatalogRows(rows, (a, b) => (pending.offsets.get(a) ?? 0) - (pending.offsets.get(b) ?? 0), turn);
}
function isSavedShelfEdit(row) {
	if (!row || typeof row !== "object") return false;
	const edit = row;
	return typeof edit.id === "string" && Boolean(edit.id.trim()) && (edit.shelf === "favorites" || edit.shelf === "likes") && typeof edit.saved === "boolean" && Number.isFinite(edit.at) && edit.at > 0;
}
var savedShelfEditKey = (edit) => `${edit.shelf}:${edit.id}`;
/** Sparse edits replay over the newest full snapshot. Explicit removals stay
* removed, including after an older preference backup is recovered. */
function recoverSavedShelfEdits(a, b, legacy, edits) {
	const baseline = recoverSavedShelves(a, b);
	const validTime = (row) => row && Number.isFinite(row.savedAt) && row.savedAt > 0 && Array.isArray(row.favorites) && Array.isArray(row.likes) ? row.savedAt : 0;
	const cutoff = Math.max(validTime(a), validTime(b));
	const latest = /* @__PURE__ */ new Map();
	for (const row of edits) if (isSavedShelfEdit(row) && row.at >= cutoff) {
		const key = savedShelfEditKey(row), previous = latest.get(key);
		if (!previous || previous.at <= row.at) latest.set(key, row);
	}
	if (!latest.size) return baseline;
	const start = baseline.authoritative ? baseline : recoverSavedShelves(legacy, {
		favorites: baseline.favorites,
		likes: baseline.likes
	});
	const favorites = new Set(start.favorites), likes = new Set(start.likes);
	for (const edit of latest.values()) {
		const shelf = edit.shelf === "favorites" ? favorites : likes;
		if (edit.saved) shelf.add(edit.id);
		else shelf.delete(edit.id);
	}
	return {
		favorites: [...favorites],
		likes: [...likes],
		authoritative: true
	};
}
function recoverSavedShelves(a, b) {
	const valid = (row) => Boolean(row && Number.isFinite(row.savedAt) && row.savedAt > 0 && Array.isArray(row.favorites) && Array.isArray(row.likes));
	const clean = (rows) => [...new Set((Array.isArray(rows) ? rows : []).filter((id) => typeof id === "string" && id.trim()))];
	if (valid(a) || valid(b)) {
		const latest = !valid(a) ? b : !valid(b) ? a : a.savedAt > b.savedAt ? a : b;
		return {
			favorites: clean(latest.favorites),
			likes: clean(latest.likes),
			authoritative: true
		};
	}
	return {
		favorites: clean([...clean(a?.favorites), ...clean(b?.favorites)]),
		likes: clean([...clean(a?.likes), ...clean(b?.likes)]),
		authoritative: false
	};
}
function selectSavedCards(videos, favorites, likes, adultIds, adult, hidden, hideDemo) {
	if (adult && !adultIds.size) return [];
	const savedIds = /* @__PURE__ */ new Set([...Object.keys(favorites), ...Object.keys(likes)]);
	if (!savedIds.size) return [];
	const saved = [];
	for (const video of activityCandidates(videos, [], savedIds)) {
		if (!savedIds.has(video.id) || hidden[video.id] || hideDemo && video.isSample) continue;
		if (adult === videoIsPrivate(adultIds, video)) saved.push(video);
	}
	return saved;
}
/** Include removed/overridden scan steps so background work can yield even
* through a mostly deleted shelf, without the Proxy's full key export. */
function* savedRecordScan(record) {
	for (const row of sparseRecordScan(record, false)) yield row?.[0];
}
async function selectSavedCardsAsync(videos, favorites, likes, adultIds, adult, hidden, hideDemo, turn) {
	if (adult && !adultIds.size) return [];
	const savedIds = /* @__PURE__ */ new Set();
	await forEachCatalogEntry(savedRecordScan(favorites), (id) => {
		if (id !== void 0) savedIds.add(id);
	}, turn);
	await forEachCatalogEntry(savedRecordScan(likes), (id) => {
		if (id !== void 0) savedIds.add(id);
	}, turn);
	if (!savedIds.size) return [];
	const candidates = await activityCandidatesAsync(videos, [], savedIds, turn), saved = [];
	await forEachCatalogEntry(candidates, (video) => {
		if (savedIds.has(video.id) && !hidden[video.id] && !(hideDemo && video.isSample) && adult === videoIsPrivate(adultIds, video)) saved.push(video);
	}, turn);
	return saved;
}
/** Fixed categories and counters only: never retain keys, media, or store slices. */
function createCacheMetrics() {
	const counters = {
		"catalog-selectors": {
			hits: 0,
			misses: 0,
			errors: 0
		},
		"thumbnail-disk": {
			hits: 0,
			misses: 0,
			errors: 0
		}
	};
	return {
		record(kind, result, at = Date.now(), entry) {
			const row = counters[kind];
			if (result === "hit") row.hits++;
			else if (result === "miss") row.misses++;
			else row.errors++;
			row.lastAccessAt = at;
			if (entry && Number.isFinite(entry.bytes) && entry.bytes >= 0) row.lastEntryBytes = entry.bytes;
			if (entry && Number.isFinite(entry.at) && entry.at > 0) row.oldestObservedEntryAt = Math.min(row.oldestObservedEntryAt ?? entry.at, entry.at);
		},
		snapshot: () => ({
			"catalog-selectors": { ...counters["catalog-selectors"] },
			"thumbnail-disk": { ...counters["thumbnail-disk"] }
		})
	};
}
var cacheMetrics = createCacheMetrics();
var sizes = /* @__PURE__ */ new Map();
var artworkBytes = (value) => typeof value === "string" ? sizes.get(value) ?? value.length * 2 : value.size;
function artworkUrl(value) {
	if (typeof value === "string") return value;
	const url = URL.createObjectURL(value);
	sizes.set(url, value.size);
	return url;
}
function releaseArtwork(url) {
	if (sizes.delete(url)) URL.revokeObjectURL(url);
}
/** Old data URLs remain readable; native decoding avoids a base64 JS byte loop. */
async function binaryArtwork(value) {
	if (typeof value !== "string" || !value.startsWith("data:image/")) return value;
	try {
		return await (await fetch(value)).blob();
	} catch {
		return value;
	}
}
/** Only the optional companion mirror needs base64, never the live card cache. */
function artworkDataUrl(value) {
	if (typeof value === "string") return Promise.resolve(value);
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(value);
	});
}
/** Copy only touched hash branches. Recheck the ledgers after every task and
* before publishing; no enumeration or materialization of the base record. */
async function prepareEnrichmentBatch(get, patches, turn) {
	const base = get(), rows = [];
	for (const [id, patch] of patches) {
		if (base.tags[id] !== patch.beforeTags || base.metadataProvenance[id] !== patch.beforeProvenance || base.metadataProvenance[id]?.lockedFields?.includes("tags")) continue;
		rows.push({
			id,
			tags: patch.tags,
			provenance: patch.provenance
		});
	}
	if (!rows.length) return {
		base,
		next: base,
		rows
	};
	const checkedTurn = async () => {
		await turn();
		const latest = get();
		if (latest.tags !== base.tags || latest.metadataProvenance !== base.metadataProvenance) throw new DOMException("Metadata changed during preparation", "AbortError");
	};
	await checkedTurn();
	const tags = sparseRecordBuilder(base.tags), metadataProvenance = sparseRecordBuilder(base.metadataProvenance);
	let visited = 0, started = performance.now();
	for (const row of rows) {
		tags.set(row.id, row.tags);
		metadataProvenance.set(row.id, row.provenance);
		if (++visited >= 64 || performance.now() - started >= 4) {
			await checkedTurn();
			visited = 0;
			started = performance.now();
		}
	}
	return {
		base,
		next: {
			tags: tags.finish(),
			metadataProvenance: metadataProvenance.finish()
		},
		rows
	};
}
/** Older snapshots may resolve after a completed enrichment batch. Its small
* durable row wins only over older unlocked metadata; manual journals apply last. */
function recoveredEnrichmentRow(ledgers, row) {
	const existing = ledgers.metadataProvenance[row.id];
	if (existing?.lockedFields?.includes("tags") || (existing?.updatedAt ?? 0) > (row.provenance.updatedAt ?? 0)) return;
	if (existing?.updatedAt === row.provenance.updatedAt && ledgers.tags[row.id] && (ledgers.tags[row.id].length !== row.tags.length || ledgers.tags[row.id].some((tag, index) => tag !== row.tags[index]))) return;
	return {
		...row,
		provenance: {
			...row.provenance,
			...existing,
			...row.provenance.youtubeTextTagVersion || existing?.youtubeTextTagVersion ? { youtubeTextTagVersion: Math.max(row.provenance.youtubeTextTagVersion ?? 0, existing?.youtubeTextTagVersion ?? 0) } : {},
			tags: Object.fromEntries(row.tags.map((tag) => [tag, existing?.tags[tag] ?? row.provenance.tags[tag] ?? "legacy"])),
			updatedAt: row.provenance.updatedAt
		}
	};
}
var fields = [
	"progress",
	"resumeProgress",
	"viewCounts",
	"cameCounts"
];
var recent = /* @__PURE__ */ new WeakMap();
/** One watch update copies only touched trie branches. Keep a bounded list of
* recently touched keys for the emergency localStorage mirror, too. */
function patchActivityRecord(source, entries) {
	const result = patchSparseRecord(source, entries);
	if (result === source) return source;
	const touched = new Set(entries.map(([key]) => key));
	recent.set(result, [...(recent.get(source) ?? []).filter((key) => !touched.has(key)), ...touched].slice(-200));
	return result;
}
/** Mirrors stay small; full activity remains in IndexedDB. Explicit imports
* and legacy plain records take the full-key path only outside hot updates. */
function recentActivityRecord(source) {
	let keys = recent.get(source);
	if (!keys) {
		keys = Object.keys(source).slice(-200);
		recent.set(source, keys);
	}
	return Object.fromEntries(keys.map((key) => [key, source[key]]));
}
/** An emergency mirror can be newer than a failed IndexedDB write. Compare
* timestamps so recovery also preserves backward seeks and completed videos. */
function mergeResumeRecords(base, mirror) {
	return patchActivityRecord(base, Object.entries(mirror).filter(([key, mark]) => !base[key] || mark.at > base[key].at));
}
/** Full startup recovery is an explicit boundary. Preferences, activity
* snapshots and dedicated stores may finish in different orders. */
function recoverResumeRecords(...records) {
	const result = {};
	for (const record of records) if (record) for (const key of Object.keys(record)) {
		const mark = record[key];
		if (mark && (!result[key] || mark.at > result[key].at)) result[key] = mark;
	}
	return result;
}
function recoverActivityCounts(...records) {
	const result = {};
	for (const record of records) if (record) for (const key of Object.keys(record)) result[key] = Math.max(result[key] ?? 0, record[key] ?? 0);
	return result;
}
/** Proxies cannot be structured cloned. Preserve the plain baseline for old
* readers and attach its immutable tree for new readers without enumerating. */
function encodeActivityRecords(value) {
	const result = { ...value };
	const sparse = {};
	for (const field of fields) {
		const record = value[field];
		if (!record) continue;
		const encoded = encodeSparseRecord(record);
		if (encoded === record) continue;
		const tree = encoded;
		result[field] = tree.snapshot.base;
		sparse[field] = tree;
	}
	if (Object.keys(sparse).length) result.sparseActivityRecords = sparse;
	return result;
}
function decodeActivityRecords(value) {
	const { sparseActivityRecords, ...rest } = value;
	const result = rest;
	for (const field of fields) if (sparseActivityRecords?.[field]) result[field] = decodeSparseRecord(sparseActivityRecords[field]);
	return result;
}
/** Keep the first URL's metadata/order, matching the durable legacy format.
* Preparation, de-duplication and sparse resume traversal all yield; no second
* full intermediate link array or Object.entries export is needed. */
async function prepareRecoveryLinks(input, turn = yieldCatalogTask) {
	const links = [], seen = /* @__PURE__ */ new Set();
	const accept = (row) => {
		if (!row || typeof row !== "object") return;
		const url = typeof row.url === "string" ? row.url.trim() : "";
		const id = typeof row.id === "string" ? row.id.trim() : url;
		if (!url || !id || seen.has(url.toLowerCase())) return;
		seen.add(url.toLowerCase());
		links.push({
			id,
			url,
			savedAt: typeof row.savedAt === "number" && Number.isFinite(row.savedAt) ? row.savedAt : Date.now(),
			source: row.source === "bookmark" || row.source === "continue" || row.source === "history" ? row.source : "history",
			...typeof row.title === "string" ? { title: row.title } : {},
			...typeof row.poster === "string" ? { poster: row.poster } : {},
			...typeof row.kind === "string" ? { kind: row.kind } : {}
		});
	};
	if ("links" in input) await forEachCatalogSlice(input.links, accept, turn);
	else {
		await forEachCatalogSlice(input.history, (entry) => {
			if (entry.url && /^https?:\/\//i.test(entry.url)) accept({
				id: entry.id,
				url: entry.url,
				savedAt: entry.at,
				source: "history",
				...entry.title ? { title: entry.title } : {},
				...entry.poster ? { poster: entry.poster } : {}
			});
		}, turn);
		const parts = sparseRecordOrderedParts(input.resumeProgress), appended = [];
		await forEachCatalogEntry(parts.existing, (row) => {
			if (row && row[0].startsWith("http")) accept({
				id: row[0],
				url: row[0],
				savedAt: row[1].at,
				source: "continue"
			});
		}, turn);
		await forEachCatalogEntry(parts.appended, (row) => {
			if (row && row[0].startsWith("http")) appended.push(row);
		}, turn);
		const ordered = await sortCatalogRows(appended, (a, b) => a[2] - b[2], turn);
		await forEachCatalogSlice(ordered, ([key, mark]) => {
			accept({
				id: key,
				url: key,
				savedAt: mark.at,
				source: "continue"
			});
		}, turn);
	}
	return links;
}
/** One active preparation/write and one latest immutable input. New work
* cancels obsolete preparation at its next task; disk writes stay ordered. */
function createRecoveryLinkWriter(save, turn = yieldCatalogTask) {
	let latest, running;
	let revision = 0, preparing = false, writing = false;
	const replaced = Symbol("Recovery links replaced");
	return {
		write(input) {
			latest = input;
			revision++;
			running ??= Promise.resolve().then(async () => {
				let failed = false, failure;
				try {
					while (latest) {
						const input = latest, expected = revision;
						latest = void 0;
						const nextTurn = async () => {
							await turn();
							if (expected !== revision) throw replaced;
						};
						try {
							preparing = true;
							const links = await prepareRecoveryLinks(input, nextTurn);
							await nextTurn();
							preparing = false;
							writing = true;
							await save(links);
						} catch (error) {
							if (error !== replaced && !failed) {
								failed = true;
								failure = error;
							}
						} finally {
							preparing = false;
							writing = false;
						}
					}
					if (failed) throw failure;
				} finally {
					running = void 0;
				}
			});
			return running;
		},
		idle() {
			return running ?? Promise.resolve();
		},
		diagnostics() {
			return {
				pending: latest ? 1 : 0,
				preparing,
				writing
			};
		}
	};
}
var persist_exports = /* @__PURE__ */ __exportAll$1({
	PHOTO_META_LS_KEY: () => PHOTO_META_LS_KEY,
	appendActivityJournal: () => appendActivityJournal,
	appendCatalogVideos: () => appendCatalogVideos,
	cancelStorageCleanup: () => cancelStorageCleanup,
	catalogWriter: () => catalogWriter,
	clearActivityJournal: () => clearActivityJournal,
	clearFolderVideos: () => clearFolderVideos,
	confirmStorageCleanup: () => confirmStorageCleanup,
	deleteDirHandle: () => deleteDirHandle,
	getPersistenceMemorySnapshot: () => getPersistenceMemorySnapshot,
	linksFromHistoryAndResume: () => linksFromHistoryAndResume,
	listWorkspaceDocuments: () => listWorkspaceDocuments,
	loadActivityJournal: () => loadActivityJournal,
	loadActivitySnapshot: () => loadActivitySnapshot,
	loadAnimeReviewsSync: () => loadAnimeReviewsSync,
	loadCachedThumb: () => loadCachedThumb,
	loadCatalogVideo: () => loadCatalogVideo,
	loadCatalogVideos: () => loadCatalogVideos,
	loadDirHandles: () => loadDirHandles,
	loadDurablePhotosSync: () => loadDurablePhotosSync,
	loadFilmReviewsSync: () => loadFilmReviewsSync,
	loadFollows: () => loadFollows,
	loadGuidePresetSync: () => loadGuidePresetSync,
	loadPrefs: () => loadPrefs,
	loadProviderViewingSync: () => loadProviderViewingSync,
	loadRecommendationExposureSync: () => loadRecommendationExposureSync,
	loadRemoteSnapshot: () => loadRemoteSnapshot,
	loadSourceHealth: () => loadSourceHealth,
	loadThumbCache: () => loadThumbCache,
	loadTopicAliasesSync: () => loadTopicAliasesSync,
	loadTopicBridgesSync: () => loadTopicBridgesSync,
	previewStorageCleanup: () => previewStorageCleanup,
	pruneActivityJournal: () => pruneActivityJournal,
	readOfflineAuditStorage: () => readOfflineAuditStorage,
	readWorkspaceDocument: () => readWorkspaceDocument,
	recoverCatalogMutations: () => recoverCatalogMutations,
	removeEnrichmentRows: () => removeEnrichmentRows,
	removeRemoteSnapshotVideos: () => removeRemoteSnapshotVideos,
	restoreAnimeReviews: () => restoreAnimeReviews,
	restoreCatalogMetadata: () => restoreCatalogMetadata,
	restoreDurableFeedback: () => restoreDurableFeedback,
	restoreDurableFollows: () => restoreDurableFollows,
	restoreDurableHistory: () => restoreDurableHistory,
	restoreDurableLinks: () => restoreDurableLinks,
	restoreDurableMarks: () => restoreDurableMarks,
	restoreDurablePhotos: () => restoreDurablePhotos,
	restoreDurablePrefs: () => restoreDurablePrefs,
	restoreDurableResume: () => restoreDurableResume,
	restoreDurableShelves: () => restoreDurableShelves,
	restoreEnrichmentRows: () => restoreEnrichmentRows,
	restoreFilmReviews: () => restoreFilmReviews,
	restoreGuidePreset: () => restoreGuidePreset,
	restoreMetadataEdits: () => restoreMetadataEdits,
	restoreProviderViewing: () => restoreProviderViewing,
	restoreRecommendationExposure: () => restoreRecommendationExposure,
	restoreTagEdits: () => restoreTagEdits,
	restoreTopicAliases: () => restoreTopicAliases,
	restoreTopicBridges: () => restoreTopicBridges,
	saveActivitySnapshot: () => saveActivitySnapshot,
	saveAnimeReviews: () => saveAnimeReviews,
	saveCatalogMetadataEdit: () => saveCatalogMetadataEdit,
	saveCreatorCoverageRows: () => saveCreatorCoverageRows,
	saveDirHandle: () => saveDirHandle,
	saveDurableFeedback: () => saveDurableFeedback,
	saveDurableHistory: () => saveDurableHistory,
	saveDurableLinks: () => saveDurableLinks,
	saveDurableMarks: () => saveDurableMarks,
	saveDurablePhotos: () => saveDurablePhotos,
	saveDurableResume: () => saveDurableResume,
	saveDurableShelves: () => saveDurableShelves,
	saveEnrichmentRows: () => saveEnrichmentRows,
	saveFilmReviews: () => saveFilmReviews,
	saveFolderVideos: () => saveFolderVideos,
	saveFollows: () => saveFollows,
	saveGuidePreset: () => saveGuidePreset,
	savePrefs: () => savePrefs,
	saveProviderViewing: () => saveProviderViewing,
	saveRecommendationExposure: () => saveRecommendationExposure,
	saveRecoveryLinks: () => saveRecoveryLinks,
	saveRemoteSnapshot: () => saveRemoteSnapshot,
	saveSavedShelfEdit: () => saveSavedShelfEdit,
	saveSourceHealth: () => saveSourceHealth,
	saveThumbCache: () => saveThumbCache,
	saveTopicAliases: () => saveTopicAliases,
	saveTopicBridges: () => saveTopicBridges,
	saveViewPrefs: () => saveViewPrefs,
	saveWorkspaceDocuments: () => saveWorkspaceDocuments,
	saveYoutubeCleanup: () => saveYoutubeCleanup,
	signalRevisions: () => signalRevisions,
	studioOutputs: () => studioOutputs,
	waitForDurableWrites: () => waitForDurableWrites,
	waitForFollowsWrites: () => waitForFollowsWrites,
	waitForPrefsWrites: () => waitForPrefsWrites,
	withCatalogRead: () => withCatalogRead
});
function signalRevisions(owner) {
	return createSignalRevisions(openDb, owner);
}
function studioOutputs(owner) {
	return createStudioOutputs(openDb, owner);
}
var DB_NAME = "reelcase";
var catalogWriter = createWriterLease(openDb, "catalog");
function catalogTransaction(db, stores, mode = "readwrite") {
	const token = catalogWriter.current();
	if (!token) throw Error("Catalog writer lease is required.");
	const tx = db.transaction([.../* @__PURE__ */ new Set([...typeof stores === "string" ? [stores] : stores, "remote-cache"])], mode);
	catalogWriter.guard(tx, token, () => {});
	return tx;
}
function withCatalogRead(work) {
	if (catalogWriter.current()) return Promise.reject(/* @__PURE__ */ new Error("Wait for this tab to finish its current catalog work."));
	return catalogWriter.run(work, false);
}
var catalogMutations = createCatalogMutations(openDb, catalogWriter);
function recoverCatalogMutations() {
	return catalogMutations.recover();
}
function saveCatalogMetadataEdit(row) {
	return catalogMutations.edit(row);
}
function restoreCatalogMetadata(base) {
	return catalogMutations.restore(base);
}
var storageRecovery = createStorageRecovery(openDb);
var previewStorageCleanup = storageRecovery.preview;
var cancelStorageCleanup = storageRecovery.cancel;
var confirmStorageCleanup = storageRecovery.clean;
var STORE = "dirs";
var VIDEO_STORE = "videos";
var SOURCE_HEALTH_STORE = "source-health";
var THUMB_STORE = "thumb-cache";
var ACTIVITY_STORE = "activity";
var ACTIVITY_JOURNAL_STORE = "activity-journal";
var PREFS_KEY = "reelcase.prefs.v4";
var TAG_PROVENANCE_EDITS_KEY = "reelcase.tag-provenance-edits.v1";
var LEGACY_KEYS = [
	"reelcase.prefs.v3",
	"reelcase.prefs.v2",
	"reelcase.prefs.v1"
];
/** Small YouTube/Twitch follow list — never co-pruned with thumbs/history/Adult tags. */
var FOLLOWS_LS_KEY = "reelcase.follows.v1";
var FOLLOWS_IDB_KEY = "follows";
var durablePrefs = null;
var durableFollows = null;
var prefsWrites = Promise.resolve();
var followsWrites = Promise.resolve();
var normalizedCountWrites = /* @__PURE__ */ new WeakMap();
async function restoreDurablePrefs() {
	const db = await openDb();
	try {
		const saved = await new Promise((resolve, reject) => {
			const req = db.transaction(ACTIVITY_STORE).objectStore(ACTIVITY_STORE).get("preferences");
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error);
		});
		if (saved) {
			const { sparseMetadataRecords, ...prefs } = decodeActivityRecords(saved);
			durablePrefs = {
				...prefs,
				tags: decodeSparseRecord(sparseMetadataRecords?.tags ?? saved.tags),
				metadataProvenance: decodeSparseRecord(sparseMetadataRecords?.metadataProvenance ?? saved.metadataProvenance),
				categories: decodeSparseRecord(sparseMetadataRecords?.categories ?? saved.categories)
			};
		}
	} finally {
		db.close();
	}
}
function waitForPrefsWrites() {
	return prefsWrites;
}
function normalizeFollowChannels(raw) {
	if (!Array.isArray(raw)) return [];
	const out = [];
	for (const row of raw) {
		if (!row || typeof row !== "object") continue;
		const rec = row;
		const kind = rec.kind === "twitch" || rec.kind === "youtube" ? rec.kind : null;
		const handle = typeof rec.handle === "string" ? rec.handle.trim() : "";
		const id = typeof rec.id === "string" ? rec.id.trim() : "";
		const title = typeof rec.title === "string" ? rec.title.trim() : handle;
		const cache = normalizeProviderCache(rec.cache);
		if (!kind || !handle && !id) continue;
		out.push({
			id: id || `${kind === "twitch" ? "tw" : "yt"}:${handle}`,
			kind,
			handle: handle || id.replace(/^(?:yt|tw):/i, ""),
			title: title || handle || id,
			...typeof rec.channelId === "string" ? { channelId: rec.channelId } : {},
			...typeof rec.importQuery === "string" && rec.importQuery.length <= 2048 ? { importQuery: rec.importQuery } : {},
			...rec.importNeedsReview === true ? { importNeedsReview: true } : {},
			...rec.identityReview && typeof rec.identityReview === "object" && /^v1:[a-f0-9]{1,8}:\d+$/.test(String(rec.identityReview.fingerprint)) && typeof rec.identityReview.at === "number" && Number.isFinite(rec.identityReview.at) ? { identityReview: rec.identityReview } : {},
			...typeof rec.thumb === "string" ? { thumb: rec.thumb } : {},
			...typeof rec.live === "boolean" ? { live: rec.live } : {},
			...kind === "youtube" ? {
				...rec.youtubeLiveKnownOverflow === true ? { youtubeLiveKnownOverflow: true } : {},
				...normalizeYoutubeLiveEvidence(rec.youtubeLiveEvidence) ? { youtubeLiveEvidence: normalizeYoutubeLiveEvidence(rec.youtubeLiveEvidence) } : {},
				...Array.isArray(rec.youtubeLiveVideoIds) ? { youtubeLiveVideoIds: [...new Set(rec.youtubeLiveVideoIds.filter((id) => typeof id === "string" && /^[A-Za-z0-9_-]{11}$/.test(id)))].slice(0, 64) } : {}
			} : {},
			...typeof rec.liveOfflineSince === "number" && Number.isFinite(rec.liveOfflineSince) && rec.liveOfflineSince > 0 ? { liveOfflineSince: rec.liveOfflineSince } : {},
			...rec.lastLiveWarning && typeof rec.lastLiveWarning === "object" && Number.isFinite(rec.lastLiveWarning.at) && rec.lastLiveWarning.at > 0 && typeof rec.lastLiveWarning.message === "string" ? { lastLiveWarning: {
				at: rec.lastLiveWarning.at,
				message: rec.lastLiveWarning.message.slice(0, 240)
			} } : {},
			...typeof rec.lastCheckedAt === "number" ? { lastCheckedAt: rec.lastCheckedAt } : {},
			...typeof rec.liveCheckedAt === "number" && Number.isFinite(rec.liveCheckedAt) ? { liveCheckedAt: rec.liveCheckedAt } : {},
			...typeof rec.newestPublishedAt === "number" ? { newestPublishedAt: rec.newestPublishedAt } : {},
			...typeof rec.newestVideoId === "string" && rec.newestVideoId ? { newestVideoId: rec.newestVideoId } : {},
			...normalizeFollowCheckpoints(rec),
			...typeof rec.lastResponseCount === "number" ? { lastResponseCount: rec.lastResponseCount } : {},
			...cache ? { cache } : {},
			...rec.lastProviderFailure && typeof rec.lastProviderFailure === "object" ? { lastProviderFailure: rec.lastProviderFailure } : {},
			...rec.lastLiveFailure && typeof rec.lastLiveFailure === "object" ? { lastLiveFailure: rec.lastLiveFailure } : {}
		});
	}
	return out;
}
function readFollowsLocalPayload() {
	try {
		const raw = JSON.parse(localStorage.getItem(FOLLOWS_LS_KEY) ?? "null");
		if (Array.isArray(raw)) return {
			channels: normalizeFollowChannels(raw),
			savedAt: 0
		};
		if (raw && typeof raw === "object" && Array.isArray(raw.channels)) return {
			channels: normalizeFollowChannels(raw.channels),
			savedAt: Number.isFinite(raw.savedAt) ? raw.savedAt : 0
		};
	} catch {}
	return null;
}
function readFollowsLocal() {
	return readFollowsLocalPayload()?.channels ?? null;
}
/** Sync mirror + IndexedDB. Intentionally tiny so QuotaExceeded on the prefs blob cannot erase follows. */
function saveFollows(channels) {
	if (typeof window === "undefined") return;
	durableFollows = channels;
	const payload = {
		channels,
		savedAt: Date.now()
	};
	try {
		localStorage.setItem(FOLLOWS_LS_KEY, JSON.stringify(payload));
	} catch {}
	const pending = putActivityBlob(FOLLOWS_IDB_KEY, payload);
	if (followsWrites !== pending) {
		followsWrites = pending;
		pending.catch(() => void 0);
	}
}
function loadFollows() {
	if (typeof window === "undefined") return null;
	if (durableFollows) return durableFollows;
	return readFollowsLocal();
}
async function restoreDurableFollows() {
	if (typeof window === "undefined") return [];
	let fromIdb = [];
	let idbSavedAt = 0;
	try {
		const db = await openDb();
		try {
			const saved = await new Promise((resolve, reject) => {
				const req = db.transaction(ACTIVITY_STORE).objectStore(ACTIVITY_STORE).get(FOLLOWS_IDB_KEY);
				req.onsuccess = () => resolve(req.result);
				req.onerror = () => reject(req.error);
			});
			if (Array.isArray(saved)) fromIdb = normalizeFollowChannels(saved);
			else if (saved && typeof saved === "object") {
				fromIdb = normalizeFollowChannels(saved.channels);
				idbSavedAt = Number.isFinite(saved.savedAt) ? saved.savedAt : 0;
			}
		} finally {
			db.close();
		}
	} catch {}
	const fromLs = readFollowsLocalPayload() ?? {
		channels: [],
		savedAt: 0
	};
	const merged = mergeFollowRecovery({
		channels: fromIdb,
		savedAt: idbSavedAt
	}, fromLs);
	durableFollows = merged;
	return merged;
}
function waitForFollowsWrites() {
	return followsWrites;
}
/** ----- Broader durable activity blobs (same pattern as follows) -----
* Thumb prune, Adult catalog caps, and prefs QuotaExceeded must not wipe these.
* Each key lives under ACTIVITY_STORE with a tiny localStorage mirror when helpful.
*/
var DURABLE_HISTORY_IDB_KEY = "history";
var DURABLE_HISTORY_LS_KEY = "reelcase.history.v1";
var DURABLE_RESUME_IDB_KEY = "resume";
var DURABLE_RESUME_LS_KEY = "reelcase.resume.v1";
var DURABLE_MARKS_IDB_KEY = "marks";
var DURABLE_MARKS_LS_KEY = "reelcase.marks.v1";
var DURABLE_SHELVES_IDB_KEY = "shelves";
var DURABLE_SHELVES_LS_KEY = "reelcase.shelves.v1";
var DURABLE_LINKS_IDB_KEY = "links";
var DURABLE_LINKS_LS_KEY = "reelcase.links.v1";
var DURABLE_FEEDBACK_IDB_KEY = "feedback";
var DURABLE_FEEDBACK_LS_KEY = "reelcase.media-feedback.v1";
var DURABLE_PHOTOS_IDB_KEY = "photos";
var DURABLE_PHOTOS_LS_KEY = "reelcase.photos.v1";
/** Legacy Photos metadata key — migrated into the durable photos blob. */
var PHOTO_META_LS_KEY = "reelcase.photo-meta.v1";
var activityWriter = new CoalescedWriter(async (rows) => {
	const db = await openDb();
	try {
		await new Promise((resolve, reject) => {
			const tx = db.transaction(ACTIVITY_STORE, "readwrite");
			const store = tx.objectStore(ACTIVITY_STORE);
			for (const [key, payload] of rows) store.put(payload, key);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
			tx.onabort = () => reject(tx.error);
		});
		let changed = false;
		for (const [key, payload] of rows) if (key.startsWith(SHELF_EDIT_PREFIX) && isSavedShelfEdit(payload)) {
			const edits = pendingShelfEdits();
			const id = savedShelfEditKey(payload);
			if (edits.get(id)?.at === payload.at) {
				edits.delete(id);
				changed = true;
			}
		}
		if (changed) mirrorShelfEdits();
	} finally {
		db.close();
	}
});
function putActivityBlob(key, payload) {
	return activityWriter.write(key, payload);
}
async function getActivityBlob(key) {
	const db = await openDb();
	try {
		return await new Promise((resolve, reject) => {
			const req = db.transaction(ACTIVITY_STORE).objectStore(ACTIVITY_STORE).get(key);
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error);
		});
	} finally {
		db.close();
	}
}
function readJsonLocal(key) {
	try {
		return JSON.parse(localStorage.getItem(key) ?? "null");
	} catch {
		return null;
	}
}
function writeJsonLocal(key, value) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
		return true;
	} catch {
		return false;
	}
}
function normalizeHistoryEntries(raw) {
	if (!Array.isArray(raw)) return [];
	const out = [];
	for (const row of raw) {
		if (!row || typeof row !== "object") continue;
		const rec = row;
		const id = typeof rec.id === "string" ? rec.id.trim() : "";
		const at = typeof rec.at === "number" && Number.isFinite(rec.at) ? rec.at : NaN;
		if (!id || !Number.isFinite(at)) continue;
		out.push({
			id,
			at,
			...typeof rec.eventId === "string" ? { eventId: rec.eventId } : {},
			...typeof rec.url === "string" ? { url: rec.url } : {},
			...typeof rec.position === "number" ? { position: rec.position } : {},
			...typeof rec.duration === "number" ? { duration: rec.duration } : {},
			...rec.source === "open" || rec.source === "progress" || rec.source === "watch-room" ? { source: rec.source } : {},
			...typeof rec.title === "string" ? { title: rec.title } : {},
			...typeof rec.poster === "string" ? { poster: rec.poster } : {},
			...typeof rec.rating === "number" ? { rating: rec.rating } : {}
		});
	}
	return out;
}
function normalizeProgressMap(raw) {
	if (!raw || typeof raw !== "object") return {};
	const out = {};
	for (const [id, value] of Object.entries(raw)) {
		if (!value || typeof value !== "object") continue;
		const rec = value;
		const t = Number(rec.t);
		const d = Number(rec.d);
		const at = Number(rec.at);
		if (!Number.isFinite(t) || !Number.isFinite(d) || !Number.isFinite(at) || d <= 0) continue;
		out[id] = {
			t,
			d,
			at
		};
	}
	return out;
}
function normalizeStringList(raw) {
	if (!Array.isArray(raw)) return [];
	return [...new Set(raw.filter((item) => typeof item === "string" && item.trim().length > 0).map((item) => item.trim()))];
}
function normalizeLinks(raw) {
	if (!Array.isArray(raw)) return [];
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const row of raw) {
		if (!row || typeof row !== "object") continue;
		const rec = row;
		const url = typeof rec.url === "string" ? rec.url.trim() : "";
		const id = typeof rec.id === "string" ? rec.id.trim() : url;
		if (!url || !id) continue;
		const key = url.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		const source = rec.source === "bookmark" || rec.source === "continue" || rec.source === "history" ? rec.source : "history";
		out.push({
			id,
			url,
			savedAt: typeof rec.savedAt === "number" && Number.isFinite(rec.savedAt) ? rec.savedAt : Date.now(),
			source,
			...typeof rec.title === "string" ? { title: rec.title } : {},
			...typeof rec.poster === "string" ? { poster: rec.poster } : {},
			...typeof rec.kind === "string" ? { kind: rec.kind } : {}
		});
	}
	return out;
}
/** Derive sticky video links from history + resume so Continue/recovery URLs survive catalog prune. */
function linksFromHistoryAndResume(history, resumeProgress) {
	const links = [];
	for (const entry of history) {
		if (!entry.url || !/^https?:\/\//i.test(entry.url)) continue;
		links.push({
			id: entry.id,
			url: entry.url,
			savedAt: entry.at,
			source: "history",
			...entry.title ? { title: entry.title } : {},
			...entry.poster ? { poster: entry.poster } : {}
		});
	}
	for (const [key, mark] of Object.entries(resumeProgress)) {
		if (!key.startsWith("http")) continue;
		links.push({
			id: key,
			url: key,
			savedAt: mark.at,
			source: "continue"
		});
	}
	return normalizeLinks(links);
}
function saveDurableHistory(entries) {
	if (typeof window === "undefined") return;
	const payload = {
		entries,
		savedAt: Date.now()
	};
	writeJsonLocal(DURABLE_HISTORY_LS_KEY, {
		entries: entries.slice(0, 120),
		savedAt: payload.savedAt
	});
	putActivityBlob(DURABLE_HISTORY_IDB_KEY, payload).catch(() => void 0);
}
async function restoreDurableHistory() {
	if (typeof window === "undefined") return [];
	let fromIdb = [];
	try {
		const saved = await getActivityBlob(DURABLE_HISTORY_IDB_KEY);
		if (Array.isArray(saved)) fromIdb = normalizeHistoryEntries(saved);
		else if (saved && typeof saved === "object") fromIdb = normalizeHistoryEntries(saved.entries);
	} catch {}
	const lsRaw = readJsonLocal(DURABLE_HISTORY_LS_KEY);
	const fromLs = Array.isArray(lsRaw) ? normalizeHistoryEntries(lsRaw) : normalizeHistoryEntries(lsRaw && typeof lsRaw === "object" ? lsRaw.entries : []);
	return fromIdb.length >= fromLs.length ? fromIdb : fromLs;
}
function saveDurableResume(progress, resumeProgress) {
	if (typeof window === "undefined") return;
	const payload = {
		progress,
		resumeProgress,
		savedAt: Date.now()
	};
	writeJsonLocal(DURABLE_RESUME_LS_KEY, {
		progress: {},
		resumeProgress: recentActivityRecord(resumeProgress),
		savedAt: payload.savedAt
	});
	putActivityBlob(DURABLE_RESUME_IDB_KEY, encodeActivityRecords(payload)).catch(() => void 0);
}
async function restoreDurableResume() {
	if (typeof window === "undefined") return {
		progress: {},
		resumeProgress: {}
	};
	let fromIdb;
	try {
		const saved = await getActivityBlob(DURABLE_RESUME_IDB_KEY);
		if (saved) fromIdb = decodeActivityRecords(saved);
	} catch {}
	const fromLs = readJsonLocal(DURABLE_RESUME_LS_KEY);
	return {
		progress: mergeResumeRecords(normalizeProgressMap(fromIdb?.progress), normalizeProgressMap(fromLs?.progress)),
		resumeProgress: mergeResumeRecords(normalizeProgressMap(fromIdb?.resumeProgress), normalizeProgressMap(fromLs?.resumeProgress))
	};
}
function saveDurableMarks(viewCounts, cameCounts) {
	if (typeof window === "undefined") return;
	const clean = (record) => {
		if (encodeSparseRecord(record) !== record) return record;
		let normalized = normalizedCountWrites.get(record);
		if (!normalized) {
			normalized = asCountMap(record);
			normalizedCountWrites.set(record, normalized);
		}
		return normalized;
	};
	const payload = {
		viewCounts: clean(viewCounts),
		cameCounts: clean(cameCounts),
		savedAt: Date.now()
	};
	writeJsonLocal(DURABLE_MARKS_LS_KEY, {
		viewCounts: recentActivityRecord(viewCounts),
		cameCounts: recentActivityRecord(cameCounts),
		savedAt: payload.savedAt
	});
	putActivityBlob(DURABLE_MARKS_IDB_KEY, encodeActivityRecords(payload)).catch(() => void 0);
}
async function restoreDurableMarks() {
	if (typeof window === "undefined") return {
		viewCounts: {},
		cameCounts: {}
	};
	let fromIdb;
	try {
		const saved = await getActivityBlob(DURABLE_MARKS_IDB_KEY);
		if (saved) fromIdb = decodeActivityRecords(saved);
	} catch {}
	const fromLs = readJsonLocal(DURABLE_MARKS_LS_KEY);
	const mergeCounts = (a = {}, b = {}) => {
		const out = { ...a };
		for (const [id, value] of Object.entries(b)) out[id] = Math.max(out[id] ?? 0, value);
		return out;
	};
	return {
		viewCounts: mergeCounts(asCountMap(fromLs?.viewCounts), asCountMap(fromIdb?.viewCounts)),
		cameCounts: mergeCounts(asCountMap(fromLs?.cameCounts), asCountMap(fromIdb?.cameCounts))
	};
}
function saveDurableShelves(favorites, likes) {
	if (typeof window === "undefined") return;
	const payload = {
		favorites: normalizeStringList(favorites),
		likes: normalizeStringList(likes),
		savedAt: nextShelfTime()
	};
	writeJsonLocal(DURABLE_SHELVES_LS_KEY, payload);
	putActivityBlob(DURABLE_SHELVES_IDB_KEY, payload).then(() => walkShelfEdits((row, key, store) => {
		if (isSavedShelfEdit(row) && row.at < payload.savedAt) store.delete(key);
	}, true)).catch(() => void 0);
}
var SHELF_EDIT_PREFIX = "saved-edit:";
var SHELF_EDITS_LS_KEY = "reelcase.saved-edits.v1";
var shelfTime = 0;
var shelfEdits;
function nextShelfTime() {
	return shelfTime = Math.max(Date.now(), shelfTime + 1);
}
function pendingShelfEdits() {
	if (!shelfEdits) {
		shelfEdits = /* @__PURE__ */ new Map();
		const rows = readJsonLocal(SHELF_EDITS_LS_KEY);
		if (Array.isArray(rows)) {
			for (const row of rows) if (isSavedShelfEdit(row)) {
				const key = savedShelfEditKey(row), previous = shelfEdits.get(key);
				if (!previous || previous.at <= row.at) shelfEdits.set(key, row);
				shelfTime = Math.max(shelfTime, row.at);
			}
		}
	}
	return shelfEdits;
}
function mirrorShelfEdits() {
	const edits = pendingShelfEdits();
	if (edits.size) writeJsonLocal(SHELF_EDITS_LS_KEY, [...edits.values()]);
	else try {
		localStorage.removeItem(SHELF_EDITS_LS_KEY);
	} catch {}
}
function enqueueShelfEdit(row) {
	putActivityBlob(SHELF_EDIT_PREFIX + savedShelfEditKey(row), row).catch(() => void 0);
}
/** A click writes one tiny replay record, never enumerating/serializing its full shelf. */
function saveSavedShelfEdit(id, shelf, saved) {
	if (typeof window === "undefined" || !id.trim()) return;
	const edits = pendingShelfEdits(), row = {
		id,
		shelf,
		saved,
		at: nextShelfTime()
	};
	edits.set(savedShelfEditKey(row), row);
	mirrorShelfEdits();
	enqueueShelfEdit(row);
}
/** Complete disk replay/compaction in bounded transactions. Newer edits survive
* a checkpoint racing with a queued write; old snapshots cannot resurrect removals. */
async function walkShelfEdits(visit, writing = false) {
	const db = await openDb();
	let after = SHELF_EDIT_PREFIX;
	try {
		for (;;) {
			await yieldCatalogTask();
			const page = await new Promise((resolve, reject) => {
				const tx = db.transaction(ACTIVITY_STORE, writing ? "readwrite" : "readonly"), store = tx.objectStore(ACTIVITY_STORE);
				const range = IDBKeyRange.bound(after, "saved-edit;", after !== SHELF_EDIT_PREFIX, true);
				const rows = store.getAll(range, 256), keys = store.getAllKeys(range, 256);
				let visited = false;
				const read = () => {
					if (visited || rows.readyState !== "done" || keys.readyState !== "done") return;
					visited = true;
					for (let i = 0; i < rows.result.length; i++) visit(rows.result[i], keys.result[i], store);
				};
				rows.onsuccess = read;
				keys.onsuccess = read;
				tx.oncomplete = () => resolve({
					rows: rows.result,
					keys: keys.result
				});
				tx.onerror = () => reject(tx.error);
				tx.onabort = () => reject(tx.error);
			});
			if (page.keys.length < 256) break;
			after = page.keys[page.keys.length - 1];
		}
	} finally {
		db.close();
	}
}
async function restoreDurableShelves(strict = false) {
	if (typeof window === "undefined") return {
		favorites: [],
		likes: [],
		authoritative: false
	};
	let fromIdb;
	try {
		fromIdb = await getActivityBlob(DURABLE_SHELVES_IDB_KEY);
	} catch (error) {
		if (strict) throw new Error("Saved likes and favorites could not be verified. Cache cleanup was stopped.", { cause: error });
	}
	const fromLs = readJsonLocal(DURABLE_SHELVES_LS_KEY);
	shelfTime = Math.max(shelfTime, Number.isFinite(fromIdb?.savedAt) ? fromIdb.savedAt : 0, Number.isFinite(fromLs?.savedAt) ? fromLs.savedAt : 0);
	const edits = [];
	try {
		await walkShelfEdits((row) => {
			if (isSavedShelfEdit(row)) {
				edits.push(row);
				shelfTime = Math.max(shelfTime, row.at);
			}
		});
	} catch (error) {
		if (strict) throw new Error("Saved likes and favorites could not be verified. Cache cleanup was stopped.", { cause: error });
	}
	const pending = [...pendingShelfEdits().values()];
	const result = recoverSavedShelfEdits(fromIdb, fromLs, loadPrefs(), [...edits, ...pending]);
	for (const row of pending) enqueueShelfEdit(row);
	return result;
}
var recoveryLinkWriter = createRecoveryLinkWriter(async (links) => {
	const payload = {
		links,
		savedAt: Date.now()
	};
	writeJsonLocal(DURABLE_LINKS_LS_KEY, {
		links: payload.links.slice(0, 200),
		savedAt: payload.savedAt
	});
	await putActivityBlob(DURABLE_LINKS_IDB_KEY, payload);
});
function saveDurableLinks(links) {
	if (typeof window === "undefined") return Promise.resolve();
	return recoveryLinkWriter.write({ links }).catch(() => void 0);
}
/** Derive recovery URLs after the action paints; retain the complete disk list. */
function saveRecoveryLinks(history, resumeProgress) {
	if (typeof window === "undefined") return Promise.resolve();
	return recoveryLinkWriter.write({
		history,
		resumeProgress
	}).catch(() => void 0);
}
async function restoreDurableLinks() {
	if (typeof window === "undefined") return [];
	let fromIdb = [];
	try {
		fromIdb = normalizeLinks((await getActivityBlob(DURABLE_LINKS_IDB_KEY))?.links);
	} catch {}
	const fromLs = normalizeLinks(readJsonLocal(DURABLE_LINKS_LS_KEY)?.links);
	return normalizeLinks([...fromIdb, ...fromLs]);
}
function saveDurableFeedback(feedback) {
	if (typeof window === "undefined") return;
	const payload = {
		...feedback,
		savedAt: Date.now()
	};
	const localSaved = writeJsonLocal(DURABLE_FEEDBACK_LS_KEY, feedback);
	return putActivityBlob(DURABLE_FEEDBACK_IDB_KEY, payload).then(() => true, () => localSaved);
}
async function restoreDurableFeedback(strict = false) {
	if (typeof window === "undefined") return null;
	let fromIdb;
	try {
		fromIdb = await getActivityBlob(DURABLE_FEEDBACK_IDB_KEY);
	} catch (error) {
		if (strict) throw new Error("Saved ratings could not be verified. Cache cleanup was stopped.", { cause: error });
	}
	const fromLs = readJsonLocal(DURABLE_FEEDBACK_LS_KEY);
	if (!fromIdb && !fromLs) return null;
	const pick = (a, b) => ({
		...b ?? {},
		...a ?? {}
	});
	return {
		recommendationRejections: newestRejections(fromIdb?.recommendationRejections, fromLs?.recommendationRejections),
		ratings: pick(fromIdb?.ratings, fromLs?.ratings),
		ratingHistory: pick(fromIdb?.ratingHistory, fromLs?.ratingHistory),
		notes: pick(fromIdb?.notes, fromLs?.notes),
		creatorRatings: pick(fromIdb?.creatorRatings, fromLs?.creatorRatings),
		creatorFavorites: pick(fromIdb?.creatorFavorites ?? fromIdb?.creatorLikes, fromLs?.creatorFavorites ?? fromLs?.creatorLikes),
		creatorLikes: pick(fromIdb?.creatorLikes, fromLs?.creatorLikes),
		tagLikes: pick(fromIdb?.tagLikes, fromLs?.tagLikes),
		tagHeartHistory: pick(fromIdb?.tagHeartHistory, fromLs?.tagHeartHistory),
		watchTime: pick(fromIdb?.watchTime, fromLs?.watchTime)
	};
}
function normalizePhotoSources(raw) {
	if (!Array.isArray(raw)) return [];
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const row of raw) {
		if (!row || typeof row !== "object") continue;
		const rec = row;
		const id = typeof rec.id === "string" ? rec.id.trim() : "";
		const name = typeof rec.name === "string" ? rec.name.trim() : "";
		const kind = rec.kind === "files" ? "files" : rec.kind === "directory" ? "directory" : null;
		if (!id || !name || !kind || seen.has(id)) continue;
		seen.add(id);
		const photoCount = typeof rec.photoCount === "number" && Number.isFinite(rec.photoCount) ? Math.max(0, Math.floor(rec.photoCount)) : void 0;
		const lastCheckedAt = typeof rec.lastCheckedAt === "number" && Number.isFinite(rec.lastCheckedAt) ? rec.lastCheckedAt : void 0;
		out.push({
			id,
			name,
			kind,
			...photoCount != null ? { photoCount } : {},
			...lastCheckedAt != null ? { lastCheckedAt } : {}
		});
	}
	return out;
}
function normalizePhotoMeta(raw) {
	if (!raw || typeof raw !== "object") return {};
	const out = {};
	for (const [id, value] of Object.entries(raw)) {
		if (!id || !value || typeof value !== "object") continue;
		const rec = value;
		const meta = {};
		if (typeof rec.path === "string") meta.path = rec.path;
		if (Array.isArray(rec.people)) meta.people = rec.people.filter((p) => typeof p === "string");
		if (Array.isArray(rec.tags)) meta.tags = rec.tags.filter((t) => typeof t === "string");
		if (typeof rec.album === "string") meta.album = rec.album;
		if (typeof rec.favorite === "boolean") meta.favorite = rec.favorite;
		if (typeof rec.hidden === "boolean") meta.hidden = rec.hidden;
		if (typeof rec.rating === "number" && Number.isFinite(rec.rating)) meta.rating = Math.max(0, Math.min(5, Math.floor(rec.rating)));
		if (typeof rec.width === "number" && Number.isFinite(rec.width)) meta.width = Math.floor(rec.width);
		if (typeof rec.height === "number" && Number.isFinite(rec.height)) meta.height = Math.floor(rec.height);
		if (typeof rec.visionModel === "string") meta.visionModel = rec.visionModel;
		if (Array.isArray(rec.vision)) meta.vision = rec.vision.flatMap((row) => {
			if (!row || typeof row !== "object") return [];
			const label = typeof row.label === "string" ? row.label : "";
			const score = typeof row.score === "number" ? row.score : 0;
			return label ? [{
				label,
				score
			}] : [];
		});
		out[id] = meta;
	}
	return out;
}
function likesFromPhotoMeta(meta, explicit) {
	const liked = new Set(normalizeStringList(explicit));
	for (const [id, row] of Object.entries(meta)) if (row.favorite) liked.add(id);
	return [...liked];
}
/** Persist photo source stubs + likes/meta. Thumb prune and prefs QuotaExceeded never clear this key. */
function saveDurablePhotos(input) {
	if (typeof window === "undefined") return;
	const meta = normalizePhotoMeta(input.meta ?? {});
	const likes = likesFromPhotoMeta(meta, input.likes);
	for (const id of likes) meta[id] = {
		...meta[id] ?? {},
		favorite: true
	};
	const payload = {
		sources: normalizePhotoSources(input.sources ?? []),
		meta,
		likes,
		savedAt: Date.now()
	};
	writeJsonLocal(PHOTO_META_LS_KEY, payload.meta);
	writeJsonLocal(DURABLE_PHOTOS_LS_KEY, {
		sources: payload.sources,
		likes: payload.likes.slice(0, 2e3),
		meta: Object.fromEntries(Object.entries(payload.meta).slice(0, 2e3)),
		savedAt: payload.savedAt
	});
	putActivityBlob(DURABLE_PHOTOS_IDB_KEY, payload).catch(() => void 0);
}
async function restoreDurablePhotos() {
	if (typeof window === "undefined") return {
		sources: [],
		meta: {},
		likes: [],
		savedAt: 0
	};
	let fromIdb;
	try {
		fromIdb = await getActivityBlob(DURABLE_PHOTOS_IDB_KEY);
	} catch {}
	const fromLs = readJsonLocal(DURABLE_PHOTOS_LS_KEY);
	const meta = {
		...normalizePhotoMeta(readJsonLocal(PHOTO_META_LS_KEY)),
		...normalizePhotoMeta(fromLs?.meta),
		...normalizePhotoMeta(fromIdb?.meta)
	};
	const sources = normalizePhotoSources([...fromLs?.sources ?? [], ...fromIdb?.sources ?? []]);
	const byId = new Map(sources.map((row) => [row.id, row]));
	const likes = likesFromPhotoMeta(meta, [...fromLs?.likes ?? [], ...fromIdb?.likes ?? []]);
	const merged = {
		sources: [...byId.values()],
		meta,
		likes,
		savedAt: Math.max(fromIdb?.savedAt ?? 0, fromLs?.savedAt ?? 0, Date.now())
	};
	if (merged.sources.length || Object.keys(merged.meta).length || merged.likes.length) saveDurablePhotos(merged);
	return merged;
}
function loadDurablePhotosSync() {
	if (typeof window === "undefined") return null;
	const fromLs = readJsonLocal(DURABLE_PHOTOS_LS_KEY);
	const legacyMeta = normalizePhotoMeta(readJsonLocal(PHOTO_META_LS_KEY));
	if (!fromLs && !Object.keys(legacyMeta).length) return null;
	const meta = {
		...legacyMeta,
		...normalizePhotoMeta(fromLs?.meta)
	};
	return {
		sources: normalizePhotoSources(fromLs?.sources),
		meta,
		likes: likesFromPhotoMeta(meta, fromLs?.likes),
		savedAt: fromLs?.savedAt ?? Date.now()
	};
}
function waitForDurableWrites() {
	return activityWriter.idle();
}
var TAG_EDITS_KEY = "reelcase.tag-edits.v1";
var HISTORY_PENDING_KEY = "reelcase.history-pending.v1";
function readPending(key, fallback) {
	try {
		return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
	} catch {
		return fallback;
	}
}
function restoreTagEdits(tags) {
	return patchSparseRecord(tags, Object.entries(readPending(TAG_EDITS_KEY, {})));
}
function restoreMetadataEdits(metadata) {
	return patchSparseRecord(metadata, Object.entries(readPending(TAG_PROVENANCE_EDITS_KEY, {})));
}
var ENRICHMENT_PREFIX = "metadata-enrichment:";
/** Save one small creator repair atomically with its optional unlocked tags.
* A foreground edit aborts the pending transaction, so obsolete preparation
* cannot overwrite disk after an unfollow, manual edit or catalog refresh. */
function saveCreatorCoverageRows(...args) {
	if (!args[0].length) return Promise.resolve();
	return catalogWriter.run(() => saveCreatorCoverageRowsOwned(...args));
}
async function saveCreatorCoverageRowsOwned(rows, turn, valid, subscribe) {
	if (!rows.length) return;
	const db = await openDb();
	try {
		await turn();
		if (!valid()) throw new DOMException("Creator repair inputs changed", "AbortError");
		await new Promise((resolve, reject) => {
			const tx = catalogTransaction(db, ["remote-cache", ACTIVITY_STORE], "readwrite");
			let stale = false;
			const invalidate = () => {
				if (!valid()) {
					stale = true;
					try {
						tx.abort();
					} catch {}
				}
			};
			const stop = subscribe?.(invalidate) ?? (() => {});
			tx.oncomplete = () => {
				stop();
				resolve();
			};
			tx.onerror = tx.onabort = () => {
				stop();
				reject(stale ? new DOMException("Creator repair inputs changed", "AbortError") : tx.error ?? /* @__PURE__ */ new Error("Creator repair was not saved"));
			};
			const remote = tx.objectStore("remote-cache"), activity = tx.objectStore(ACTIVITY_STORE);
			for (const row of rows) {
				const previous = remote.get(`video:${row.video.id}`);
				previous.onsuccess = () => {
					invalidate();
					if (stale) return;
					try {
						remote.put(withCatalogDetails(row.video, previous.result), `video:${row.video.id}`);
						if (row.enrichment) activity.put(row.enrichment, ENRICHMENT_PREFIX + row.video.id);
					} catch (error) {
						try {
							tx.abort();
						} finally {
							reject(error);
						}
					}
				};
			}
		});
	} finally {
		db.close();
	}
}
/** Sparse durable rows avoid cloning the entire preference blob for every
* automatic batch. A transaction completes before a batch reports success. */
async function saveEnrichmentRows(rows, turn = yieldCatalogTask) {
	if (!rows.length) return;
	const db = await openDb();
	try {
		for (let offset = 0; offset < rows.length; offset += 64) {
			await turn();
			await new Promise((resolve, reject) => {
				const tx = db.transaction(ACTIVITY_STORE, "readwrite"), store = tx.objectStore(ACTIVITY_STORE);
				for (let index = offset; index < Math.min(rows.length, offset + 64); index++) {
					const row = rows[index];
					store.put(row, ENRICHMENT_PREFIX + row.id);
				}
				tx.oncomplete = () => resolve();
				tx.onerror = () => reject(tx.error);
				tx.onabort = () => reject(tx.error);
			});
		}
	} finally {
		db.close();
	}
}
async function removeEnrichmentRows(ids) {
	if (!ids.length) return;
	const db = await openDb();
	try {
		for (let offset = 0; offset < ids.length; offset += 64) {
			await yieldCatalogTask();
			await new Promise((resolve, reject) => {
				const tx = db.transaction(ACTIVITY_STORE, "readwrite"), store = tx.objectStore(ACTIVITY_STORE);
				for (let index = offset; index < Math.min(ids.length, offset + 64); index++) store.delete(ENRICHMENT_PREFIX + ids[index]);
				tx.oncomplete = () => resolve();
				tx.onerror = () => reject(tx.error);
				tx.onabort = () => reject(tx.error);
			});
		}
	} finally {
		db.close();
	}
}
async function restoreEnrichmentRows(base) {
	const db = await openDb();
	let ledgers = base, after;
	try {
		for (;;) {
			const rows = await new Promise((resolve, reject) => {
				const range = IDBKeyRange.bound(after ?? ENRICHMENT_PREFIX, ENRICHMENT_PREFIX + "￿", Boolean(after), true);
				const request = db.transaction(ACTIVITY_STORE).objectStore(ACTIVITY_STORE).getAll(range, 256);
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
			});
			if (!rows.length) break;
			const tags = sparseRecordBuilder(ledgers.tags), provenance = sparseRecordBuilder(ledgers.metadataProvenance);
			await forEachCatalogSlice(rows, (row) => {
				if (row && typeof row.id === "string" && Array.isArray(row.tags) && row.tags.every((tag) => typeof tag === "string") && row.provenance && row.provenance.tags && typeof row.provenance.tags === "object") {
					const restored = recoveredEnrichmentRow(ledgers, row);
					if (restored) {
						tags.set(row.id, restored.tags);
						provenance.set(row.id, restored.provenance);
					}
				}
			}, yieldCatalogTask, 96);
			ledgers = {
				tags: tags.finish(),
				metadataProvenance: provenance.finish()
			};
			after = ENRICHMENT_PREFIX + rows[rows.length - 1].id;
			if (rows.length < 256) break;
		}
		return ledgers;
	} finally {
		db.close();
	}
}
function migrateSource(id) {
	if (!id || id === "all" || id === "starred") {
		if (id === "starred") return "favorites";
		return "home";
	}
	return id;
}
function openDb() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, 8);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains("remote-cache")) db.createObjectStore("remote-cache");
			if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
			if (!db.objectStoreNames.contains(VIDEO_STORE)) db.createObjectStore(VIDEO_STORE, { keyPath: "id" }).createIndex("folderId", "folderId", { unique: false });
			if (!db.objectStoreNames.contains(SOURCE_HEALTH_STORE)) db.createObjectStore(SOURCE_HEALTH_STORE, { keyPath: "id" });
			if (!db.objectStoreNames.contains(THUMB_STORE)) db.createObjectStore(THUMB_STORE, { keyPath: "id" });
			const thumbs = req.transaction.objectStore(THUMB_STORE);
			if (!thumbs.indexNames.contains("at")) thumbs.createIndex("at", "at");
			if (!db.objectStoreNames.contains(ACTIVITY_STORE)) db.createObjectStore(ACTIVITY_STORE);
			if (!db.objectStoreNames.contains(ACTIVITY_JOURNAL_STORE)) db.createObjectStore(ACTIVITY_JOURNAL_STORE, { keyPath: "key" });
		};
		req.onsuccess = () => {
			const db = req.result;
			db.onversionchange = () => db.close();
			resolve(db);
		};
		req.onerror = () => reject(req.error);
	});
}
/** Small tool documents share the existing activity store. The caller supplies
* the current-user namespace; these reads never walk the media catalog. */
async function readWorkspaceDocument(key) {
	const db = await openDb();
	try {
		return await new Promise((resolve, reject) => {
			const request = db.transaction(ACTIVITY_STORE).objectStore(ACTIVITY_STORE).get(key);
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	} finally {
		db.close();
	}
}
async function listWorkspaceDocuments(prefix, before, limit = 9) {
	const db = await openDb();
	try {
		return await new Promise((resolve, reject) => {
			const result = [];
			const range = IDBKeyRange.bound(prefix, before ?? prefix + "￿", false, !!before);
			const request = db.transaction(ACTIVITY_STORE).objectStore(ACTIVITY_STORE).openCursor(range, "prev");
			request.onsuccess = () => {
				const cursor = request.result;
				if (!cursor || result.length >= Math.max(1, Math.min(50, limit))) {
					resolve(result);
					return;
				}
				result.push({
					key: String(cursor.key),
					value: cursor.value
				});
				cursor.continue();
			};
			request.onerror = () => reject(request.error);
		});
	} finally {
		db.close();
	}
}
async function saveWorkspaceDocuments(rows) {
	if (!rows.length) return;
	const db = await openDb();
	try {
		await new Promise((resolve, reject) => {
			const tx = db.transaction(ACTIVITY_STORE, "readwrite");
			tx.oncomplete = () => resolve();
			tx.onerror = tx.onabort = () => reject(tx.error ?? Error("Could not save tool documents."));
			for (const row of rows) tx.objectStore(ACTIVITY_STORE).put(row.value, row.key);
		});
	} finally {
		db.close();
	}
}
function saveDirHandle(...args) {
	return catalogWriter.run(() => saveDirHandleOwned(...args));
}
async function saveDirHandleOwned(entry) {
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = catalogTransaction(db, STORE, "readwrite");
		tx.objectStore(STORE).put(entry);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
	db.close();
}
async function loadDirHandles() {
	const db = await openDb();
	const rows = await new Promise((resolve, reject) => {
		const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
		req.onsuccess = () => resolve(req.result ?? []);
		req.onerror = () => reject(req.error);
	});
	db.close();
	return rows;
}
function deleteDirHandle(...args) {
	return catalogWriter.run(() => deleteDirHandleOwned(...args));
}
async function deleteDirHandleOwned(id) {
	await recoverCatalogMutations();
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = catalogTransaction(db, [
			STORE,
			VIDEO_STORE,
			SOURCE_HEALTH_STORE
		], "readwrite");
		tx.objectStore(STORE).delete(id);
		tx.objectStore(SOURCE_HEALTH_STORE).delete(id);
		const req = tx.objectStore(VIDEO_STORE).index("folderId").openCursor(IDBKeyRange.only(id));
		req.onsuccess = () => {
			const cursor = req.result;
			if (cursor) {
				cursor.delete();
				cursor.continue();
			}
		};
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
	db.close();
}
var IDB_WRITE_CHUNK = 400;
async function clearFolderVideosTx(db, folderId) {
	await new Promise((resolve, reject) => {
		const tx = catalogTransaction(db, VIDEO_STORE, "readwrite");
		const req = tx.objectStore(VIDEO_STORE).index("folderId").openCursor(IDBKeyRange.only(folderId));
		req.onsuccess = () => {
			const cursor = req.result;
			if (cursor) {
				cursor.delete();
				cursor.continue();
			}
		};
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}
async function putVideosChunked(_db, videos, metadata) {
	for (let offset = 0; offset < videos.length; offset += 64) {
		const rows = videos.slice(offset, offset + 64), enrichment = metadata ? rows.flatMap((video) => {
			const provenance = metadata.metadataProvenance?.[video.id];
			return provenance ? [{
				id: video.id,
				tags: metadata.tags[video.id] ?? [],
				provenance
			}] : [];
		}) : void 0;
		await catalogMutations.write({
			version: 1,
			kind: "local",
			rows,
			enrichment
		});
		await yieldCatalogTask();
	}
}
/** Replace a folder atomically: a failed write must retain its previous catalog. */
function saveFolderVideos(...args) {
	return catalogWriter.run(() => saveFolderVideosOwned(...args));
}
async function saveFolderVideosOwned(folderId, videos) {
	await recoverCatalogMutations();
	if (videos.some((video) => video.folderId !== folderId)) throw new Error("Cannot save catalog entries belonging to another folder.");
	const db = await openDb();
	try {
		await new Promise((resolve, reject) => {
			const tx = catalogTransaction(db, [VIDEO_STORE, "remote-cache"], "readwrite");
			const store = tx.objectStore(VIDEO_STORE);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
			tx.onabort = () => reject(tx.error ?? /* @__PURE__ */ new Error("Catalog save was interrupted. Your previous catalog is preserved."));
			const cleanup = tx.objectStore("remote-cache").get(YOUTUBE_CLEANUP_KEY);
			cleanup.onsuccess = () => {
				const retired = retiredYoutubeKeys(normalizeYoutubeCleanup(cleanup.result));
				const request = store.index("folderId").openCursor(IDBKeyRange.only(folderId));
				request.onsuccess = () => {
					try {
						const cursor = request.result;
						if (cursor) {
							cursor.delete();
							cursor.continue();
							return;
						}
						for (const video of videos) if (!video.isSample && !(video.remote && retired.has(cleanupKey(video)))) store.put(video);
					} catch (error) {
						tx.abort();
						reject(error);
					}
				};
			};
		});
	} finally {
		db.close();
	}
}
/** Append/upsert catalog rows without rewriting the whole folder (batched ingest). */
function appendCatalogVideos(...args) {
	if (!args[0].length) return Promise.resolve();
	return catalogWriter.run(() => appendCatalogVideosOwned(...args));
}
async function appendCatalogVideosOwned(videos, metadata) {
	if (!videos.length) return;
	const db = await openDb();
	try {
		await putVideosChunked(db, videos, metadata);
	} finally {
		db.close();
	}
}
function clearFolderVideos(...args) {
	return catalogWriter.run(() => clearFolderVideosOwned(...args));
}
async function clearFolderVideosOwned(folderId) {
	await recoverCatalogMutations();
	const db = await openDb();
	await clearFolderVideosTx(db, folderId);
	db.close();
}
async function loadCatalogVideos() {
	const db = await openDb();
	try {
		const rows = [];
		const retired = retiredYoutubeKeys(await new Promise((resolve, reject) => {
			const req = db.transaction("remote-cache", "readonly").objectStore("remote-cache").get(YOUTUBE_CLEANUP_KEY);
			req.onsuccess = () => resolve(normalizeYoutubeCleanup(req.result));
			req.onerror = () => reject(req.error);
		}));
		let after;
		while (true) {
			const page = await new Promise((resolve, reject) => {
				const tx = db.transaction(VIDEO_STORE, "readonly");
				const store = tx.objectStore(VIDEO_STORE);
				const range = after === void 0 ? void 0 : IDBKeyRange.lowerBound(after, true);
				const keys = store.getAllKeys(range, 512), values = store.getAll(range, 512);
				tx.oncomplete = () => resolve({
					keys: keys.result,
					rows: values.result
				});
				tx.onerror = () => reject(tx.error);
				tx.onabort = () => reject(tx.error);
			});
			for (const video of page.rows) if (!video.isSample && !(video.remote && retired.has(cleanupKey(video)))) rows.push(catalogCard(video));
			if (page.keys.length < 512) break;
			after = page.keys.at(-1);
			await yieldCatalogTask();
		}
		return rows;
	} finally {
		db.close();
	}
}
async function loadCatalogVideo(id) {
	const db = await openDb();
	try {
		return await new Promise((resolve, reject) => {
			const tx = db.transaction([VIDEO_STORE, "remote-cache"], "readonly");
			const local = tx.objectStore(VIDEO_STORE).get(id);
			const remote = tx.objectStore("remote-cache").get(`video:${id}`);
			tx.oncomplete = () => resolve(remote.result ? withCatalogDetails(remote.result, local.result) : local.result);
			tx.onerror = () => reject(tx.error);
			tx.onabort = () => reject(tx.error);
		});
	} finally {
		db.close();
	}
}
async function loadCachedThumb(id) {
	const db = await openDb().catch((error) => {
		cacheMetrics.record("thumbnail-disk", "error");
		throw error;
	});
	try {
		return await new Promise((resolve, reject) => {
			const request = db.transaction(THUMB_STORE, "readonly").objectStore(THUMB_STORE).get(id);
			request.onsuccess = () => {
				const row = request.result;
				cacheMetrics.record("thumbnail-disk", row?.thumb ? "hit" : "miss", Date.now(), row?.thumb ? {
					bytes: artworkBytes(row.thumb),
					at: row.at
				} : void 0);
				resolve(row);
			};
			request.onerror = () => reject(request.error);
		});
	} catch (error) {
		cacheMetrics.record("thumbnail-disk", "error");
		throw error;
	} finally {
		db.close();
	}
}
async function loadThumbCache(limit = 120, maxBytes = 8388608) {
	const db = await openDb();
	try {
		return await new Promise((resolve, reject) => {
			const rows = [];
			let bytes = 0;
			const tx = db.transaction(THUMB_STORE, "readonly");
			const req = tx.objectStore(THUMB_STORE).index("at").openCursor(null, "prev");
			req.onsuccess = () => {
				const cursor = req.result;
				if (!cursor || rows.length >= Math.max(0, limit)) return;
				const row = cursor.value;
				const size = row.thumb ? artworkBytes(row.thumb) : 0;
				if (size <= maxBytes - bytes) {
					rows.push(row);
					bytes += size;
				}
				cursor.continue();
			};
			tx.oncomplete = () => resolve(rows);
			tx.onerror = () => reject(tx.error);
			tx.onabort = () => reject(tx.error);
		});
	} finally {
		db.close();
	}
}
var thumbMirrorWriter = new CoalescedWriter(async (rows) => {
	for (const [, entry] of rows) await companionPutThumb(entry.id, await artworkDataUrl(entry.thumb));
}, {
	batchSize: 2,
	maxPending: 16,
	maxWeight: 2097152,
	weight: (row) => artworkBytes(row.thumb)
});
var thumbWriter = new CoalescedWriter(async (rows) => {
	const db = await openDb();
	try {
		await new Promise((resolve, reject) => {
			const tx = db.transaction(THUMB_STORE, "readwrite");
			const store = tx.objectStore(THUMB_STORE);
			for (const [, { entry }] of rows) store.put(entry);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
			tx.onabort = () => reject(tx.error);
		});
		await pruneThumbCache(db, Math.min(...rows.map(([, row]) => row.maxEntries)));
	} finally {
		db.close();
	}
	for (const [, { entry }] of rows) if (typeof entry.thumb !== "string" || entry.thumb.startsWith("data:image")) thumbMirrorWriter.write(entry.id, entry).catch(() => void 0);
}, {
	batchSize: 64,
	maxPending: LIBRARY_LIMITS.thumbCacheEntries,
	maxWeight: 8388608,
	weight: (row) => artworkBytes(row.entry.thumb)
});
/** Artwork is a recoverable cache: coalesce bursts, cap pending bytes, and
* prune keys once per batch without cloning every cached image repeatedly. */
function saveThumbCache(entry, maxEntries = LIBRARY_LIMITS.thumbCacheEntries) {
	return thumbWriter.write(entry.id, {
		entry,
		maxEntries
	});
}
async function pruneThumbCache(db, maxEntries) {
	if (maxEntries <= 0) return;
	await new Promise((resolve, reject) => {
		const tx = db.transaction(THUMB_STORE, "readwrite");
		const store = tx.objectStore(THUMB_STORE);
		const count = store.count();
		count.onsuccess = () => {
			let remaining = count.result - maxEntries;
			if (remaining <= 0) return;
			const req = store.index("at").openKeyCursor();
			req.onsuccess = () => {
				const cursor = req.result;
				if (!cursor || remaining <= 0) return;
				store.delete(cursor.primaryKey);
				remaining--;
				cursor.continue();
			};
		};
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
		tx.onabort = () => reject(tx.error);
	});
}
function getPersistenceMemorySnapshot() {
	return {
		activity: activityWriter.snapshot(),
		artwork: thumbWriter.snapshot(),
		artworkMirror: thumbMirrorWriter.snapshot()
	};
}
var YOUTUBE_CLEANUP_KEY = "youtube-cleanup";
async function loadRemoteSnapshot() {
	const db = await openDb();
	try {
		const legacy = await new Promise((resolve, reject) => {
			const tx = db.transaction("remote-cache", "readonly");
			const store = tx.objectStore("remote-cache");
			const currentReq = store.get("snapshot");
			const metaReq = store.get("meta");
			const cleanupReq = store.get(YOUTUBE_CLEANUP_KEY);
			tx.oncomplete = () => resolve({
				current: currentReq.result,
				meta: metaReq.result,
				youtubeCleanup: normalizeYoutubeCleanup(cleanupReq.result)
			});
			tx.onerror = () => reject(tx.error);
		});
		const videos = /* @__PURE__ */ new Map();
		const retired = retiredYoutubeKeys(legacy.youtubeCleanup);
		let afterKey;
		while (true) {
			const page = await new Promise((resolve, reject) => {
				const tx = db.transaction("remote-cache", "readonly");
				const store = tx.objectStore("remote-cache");
				const range = IDBKeyRange.bound(afterKey ?? "video:", "video;", afterKey !== void 0, true);
				const keysReq = store.getAllKeys(range, 512);
				const rowsReq = store.getAll(range, 512);
				tx.oncomplete = () => resolve({
					keys: keysReq.result,
					rows: rowsReq.result
				});
				tx.onerror = () => reject(tx.error);
			});
			for (const video of page.rows) if (video?.id && !(video.remote && retired.has(cleanupKey(video)))) videos.set(video.id, catalogCard(video));
			if (page.keys.length < 512) break;
			afterKey = page.keys[page.keys.length - 1];
			await yieldCatalogTask();
		}
		if (legacy.current?.videos.length) {
			const missing = [];
			await forEachCatalogSlice(legacy.current.videos, (video) => {
				if (!videos.has(video.id) && !(video.remote && retired.has(cleanupKey(video)))) missing.push(video);
			}, yieldCatalogTask);
			let migrated = false;
			try {
				await saveRemoteSnapshot({
					...legacy.current,
					videos: missing
				}, true);
				migrated = true;
			} catch {}
			await forEachCatalogSlice(missing, (video) => {
				videos.set(video.id, migrated ? catalogCard(video) : video);
			}, yieldCatalogTask);
		}
		const meta = legacy.meta ?? legacy.current ?? (legacy.youtubeCleanup.removedCount || legacy.youtubeCleanup.recentKeys.length ? {
			folders: [],
			checkedAt: 0
		} : void 0);
		return meta ? {
			videos: await collectCatalogRows(videos.values()),
			folders: meta.folders,
			checkedAt: meta.checkedAt,
			youtubeCleanup: legacy.youtubeCleanup
		} : void 0;
	} finally {
		db.close();
	}
}
function saveRemoteSnapshot(...args) {
	return catalogWriter.run(() => saveRemoteSnapshotOwned(...args));
}
async function saveRemoteSnapshotOwned(snapshot, complete = false, rowsOnly = false) {
	for (let offset = 0; offset < snapshot.videos.length; offset += 64) {
		const rows = snapshot.videos.slice(offset, offset + 64);
		const enrichment = snapshot.metadata ? rows.flatMap((video) => {
			const provenance = snapshot.metadata.metadataProvenance?.[video.id];
			return provenance ? [{
				id: video.id,
				tags: snapshot.metadata.tags[video.id] ?? [],
				provenance
			}] : [];
		}) : void 0;
		await catalogMutations.write({
			version: 1,
			kind: "remote",
			rows,
			enrichment
		});
		await yieldCatalogTask();
	}
	if (rowsOnly) return;
	await catalogMutations.write({
		version: 1,
		kind: "remote",
		rows: [],
		meta: {
			folders: snapshot.folders,
			checkedAt: snapshot.checkedAt
		},
		complete
	});
}
/** One bounded transaction retires cards and automatic metadata together.
* Watch history, favorites, likes, ratings and follow cursors are untouched. */
async function saveYoutubeCleanup(removed, journal) {
	await catalogMutations.write({
		version: 1,
		kind: "cleanup",
		removed: removed.map((video) => video.id),
		cleanup: journal
	});
}
function removeRemoteSnapshotVideos(...args) {
	if (!args[0].length) return Promise.resolve();
	return catalogWriter.run(() => removeRemoteSnapshotVideosOwned(...args));
}
async function removeRemoteSnapshotVideosOwned(ids) {
	await recoverCatalogMutations();
	if (!ids.length) return;
	const db = await openDb();
	try {
		for (let i = 0; i < ids.length; i += IDB_WRITE_CHUNK) await new Promise((resolve, reject) => {
			const tx = catalogTransaction(db, "remote-cache", "readwrite");
			const store = tx.objectStore("remote-cache");
			for (const id of ids.slice(i, i + IDB_WRITE_CHUNK)) store.delete(`video:${id}`);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	} finally {
		db.close();
	}
}
async function loadActivitySnapshot() {
	const db = await openDb();
	try {
		return await new Promise((resolve, reject) => {
			const req = db.transaction(ACTIVITY_STORE, "readonly").objectStore(ACTIVITY_STORE).get("primary");
			req.onsuccess = () => resolve(req.result ? decodeActivityRecords(req.result) : void 0);
			req.onerror = () => reject(req.error);
		});
	} finally {
		db.close();
	}
}
async function saveActivitySnapshot(snapshot) {
	const db = await openDb();
	try {
		await new Promise((resolve, reject) => {
			const tx = db.transaction(ACTIVITY_STORE, "readwrite");
			tx.objectStore(ACTIVITY_STORE).put(encodeActivityRecords(snapshot), "primary");
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	} finally {
		db.close();
	}
}
/** Append-only playback journal: a snapshot write can never erase an earlier event. */
async function appendActivityJournal(entry) {
	const pending = readPending(HISTORY_PENDING_KEY, []);
	try {
		localStorage.setItem(HISTORY_PENDING_KEY, JSON.stringify([entry, ...pending].slice(0, 50)));
	} catch {}
	const db = await openDb();
	try {
		await new Promise((resolve, reject) => {
			const tx = db.transaction(ACTIVITY_JOURNAL_STORE, "readwrite");
			tx.objectStore(ACTIVITY_JOURNAL_STORE).put({
				key: entry.eventId ?? `${entry.id}:${entry.at}:${entry.source ?? "open"}`,
				entry
			});
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	} finally {
		db.close();
	}
}
async function loadActivityJournal() {
	const db = await openDb();
	try {
		return await new Promise((resolve, reject) => {
			const req = db.transaction(ACTIVITY_JOURNAL_STORE, "readonly").objectStore(ACTIVITY_JOURNAL_STORE).getAll();
			req.onsuccess = () => resolve([...req.result.map((row) => row.entry).filter((entry) => Boolean(entry)), ...readPending(HISTORY_PENDING_KEY, [])]);
			req.onerror = () => reject(req.error);
		});
	} finally {
		db.close();
	}
}
async function clearActivityJournal() {
	try {
		localStorage.removeItem(HISTORY_PENDING_KEY);
	} catch {}
	const db = await openDb();
	try {
		await new Promise((resolve, reject) => {
			const tx = db.transaction(ACTIVITY_JOURNAL_STORE, "readwrite");
			tx.objectStore(ACTIVITY_JOURNAL_STORE).clear();
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	} finally {
		db.close();
	}
}
async function pruneActivityJournal(before) {
	try {
		localStorage.setItem(HISTORY_PENDING_KEY, JSON.stringify(readPending(HISTORY_PENDING_KEY, []).filter((entry) => entry.at >= before)));
	} catch {}
	const db = await openDb();
	try {
		await new Promise((resolve, reject) => {
			const tx = db.transaction(ACTIVITY_JOURNAL_STORE, "readwrite");
			const req = tx.objectStore(ACTIVITY_JOURNAL_STORE).openCursor();
			req.onsuccess = () => {
				const cursor = req.result;
				if (!cursor) return;
				const entry = cursor.value.entry;
				if (entry && entry.at < before) cursor.delete();
				cursor.continue();
			};
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	} finally {
		db.close();
	}
}
async function saveSourceHealth(entry) {
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction(SOURCE_HEALTH_STORE, "readwrite");
		tx.objectStore(SOURCE_HEALTH_STORE).put(entry);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
	db.close();
}
async function loadSourceHealth() {
	const db = await openDb();
	const rows = await new Promise((resolve, reject) => {
		const req = db.transaction(SOURCE_HEALTH_STORE, "readonly").objectStore(SOURCE_HEALTH_STORE).getAll();
		req.onsuccess = () => resolve(req.result ?? []);
		req.onerror = () => reject(req.error);
	});
	db.close();
	return rows;
}
function asCountMap(raw) {
	if (!raw || typeof raw !== "object") return {};
	const out = {};
	for (const [id, value] of Object.entries(raw)) if (typeof value === "number" && Number.isFinite(value) && value > 0) out[id] = Math.floor(value);
	return out;
}
function normalize(raw) {
	raw = decodeActivityRecords(raw);
	const starred = raw.starred ?? [];
	const favorites = raw.favorites ?? starred;
	const sort = raw.sort ?? "added";
	const sparse = raw.sparseMetadataRecords;
	return {
		favorites,
		likes: raw.likes ?? [],
		tags: decodeSparseRecord(sparse?.tags ?? raw.tags),
		metadataProvenance: decodeSparseRecord(sparse?.metadataProvenance ?? raw.metadataProvenance),
		categories: raw.categories ?? {},
		progress: raw.progress ?? {},
		resumeProgress: raw.resumeProgress ?? {},
		history: raw.history ?? [],
		viewCounts: asCountMap(raw.viewCounts),
		cameCounts: asCountMap(raw.cameCounts),
		view: raw.view ?? "grid",
		sort,
		sortDir: raw.sortDir ?? (sort === "name" ? "asc" : "desc"),
		hideDemo: Boolean(raw.hideDemo),
		sourceId: migrateSource(raw.sourceId),
		hardwareAccel: raw.hardwareAccel !== false,
		privateFolderIds: raw.privateFolderIds ?? [],
		adultPinHash: raw.adultPinHash ?? null,
		extFilter: typeof raw.extFilter === "string" ? raw.extFilter : "all",
		sizeFilter: raw.sizeFilter ?? "any",
		playableOnly: Boolean(raw.playableOnly),
		groupBy: raw.groupBy ?? "none",
		follows: Array.isArray(raw.follows) ? raw.follows : [],
		notices: Array.isArray(raw.notices) ? raw.notices : [],
		notifyPush: Boolean(raw.notifyPush),
		unavailableVideoIds: Array.isArray(raw.unavailableVideoIds) ? raw.unavailableVideoIds.filter((id) => typeof id === "string") : [],
		hiddenVideoIds: Array.isArray(raw.hiddenVideoIds) ? raw.hiddenVideoIds.filter((id) => typeof id === "string") : []
	};
}
var VIEW_PREFS_KEY = "reelcase.view-prefs.v1";
var viewPrefs;
function saveViewPrefs(prefs) {
	viewPrefs = {
		view: prefs.view,
		sort: prefs.sort,
		sourceId: prefs.sourceId === "adults" || prefs.sourceId === "adult-fetishes" ? "home" : prefs.sourceId
	};
	try {
		localStorage.setItem(VIEW_PREFS_KEY, JSON.stringify(viewPrefs));
	} catch {}
}
function loadFullPrefs() {
	if (typeof window === "undefined") return null;
	if (durablePrefs) return durablePrefs;
	try {
		const raw = localStorage.getItem(PREFS_KEY);
		if (raw) return normalize(JSON.parse(raw));
		for (const key of LEGACY_KEYS) {
			const legacy = localStorage.getItem(key);
			if (legacy) return normalize(JSON.parse(legacy));
		}
		return null;
	} catch {
		return null;
	}
}
function loadPrefs() {
	const full = loadFullPrefs();
	if (typeof window === "undefined") return full;
	if (!viewPrefs) try {
		const saved = JSON.parse(localStorage.getItem(VIEW_PREFS_KEY) ?? "null");
		if (saved && ["grid", "list"].includes(saved.view) && [
			"name",
			"added",
			"size",
			"duration",
			"recent",
			"type",
			"folder",
			"path"
		].includes(saved.sort) && typeof saved.sourceId === "string") viewPrefs = saved;
	} catch {}
	const prefs = viewPrefs ? {
		...full ?? normalize({}),
		...viewPrefs
	} : full;
	const shelves = recoverSavedShelves(null, readJsonLocal(DURABLE_SHELVES_LS_KEY));
	return shelves.authoritative ? {
		...prefs ?? normalize({}),
		favorites: shelves.favorites,
		likes: shelves.likes
	} : prefs;
}
function savePrefs(prefs) {
	if (typeof window === "undefined") return;
	saveViewPrefs(prefs);
	durablePrefs = prefs;
	const encodedTags = encodeSparseRecord(prefs.tags), encodedProvenance = prefs.metadataProvenance && encodeSparseRecord(prefs.metadataProvenance), encodedCategories = encodeSparseRecord(prefs.categories);
	const tags = encodedTags !== prefs.tags ? encodedTags : void 0;
	const metadataProvenance = encodedProvenance !== prefs.metadataProvenance ? encodedProvenance : void 0;
	const categories = encodedCategories !== prefs.categories ? encodedCategories : void 0;
	const pending = putActivityBlob("preferences", encodeActivityRecords({
		...prefs,
		tags: tags?.snapshot.base ?? prefs.tags,
		metadataProvenance: metadataProvenance?.snapshot.base ?? prefs.metadataProvenance,
		categories: categories?.snapshot.base ?? prefs.categories,
		sparseMetadataRecords: tags || metadataProvenance || categories ? {
			tags,
			metadataProvenance,
			categories
		} : void 0
	}));
	if (prefsWrites !== pending) {
		prefsWrites = pending;
		pending.catch(() => {
			try {
				localStorage.setItem(PREFS_KEY, JSON.stringify(durablePrefs));
			} catch {
				window.dispatchEvent(new CustomEvent("reelcase:save-error"));
			}
		});
	}
}
/** Read artwork in small pages, retaining only actual stored image byte counts.
* A remote URL in this store is a reference, not proof of offline availability. */
async function readOfflineAuditStorage(signal) {
	signal.throwIfAborted();
	const db = await openDb();
	const artwork = /* @__PURE__ */ new Map();
	try {
		let after;
		while (true) {
			signal.throwIfAborted();
			const rows = await new Promise((resolve, reject) => {
				const tx = db.transaction(THUMB_STORE, "readonly");
				const request = tx.objectStore(THUMB_STORE).getAll(after === void 0 ? void 0 : IDBKeyRange.lowerBound(after, true), 32);
				tx.oncomplete = () => resolve(request.result);
				tx.onerror = tx.onabort = () => reject(tx.error ?? /* @__PURE__ */ new Error("Artwork audit could not read storage."));
			});
			for (const row of rows) if (row.thumb instanceof Blob || typeof row.thumb === "string" && row.thumb.startsWith("data:image/")) artwork.set(row.id, {
				at: row.at,
				bytes: artworkBytes(row.thumb)
			});
			if (rows.length < 32) break;
			after = rows[rows.length - 1].id;
			await yieldCatalogTask();
		}
		signal.throwIfAborted();
		const saved = await new Promise((resolve, reject) => {
			const tx = db.transaction(["remote-cache", ACTIVITY_STORE], "readonly");
			const meta = tx.objectStore("remote-cache").get("meta"), links = tx.objectStore(ACTIVITY_STORE).get(DURABLE_LINKS_IDB_KEY);
			tx.oncomplete = () => resolve({
				meta: meta.result,
				links: links.result
			});
			tx.onerror = tx.onabort = () => reject(tx.error ?? /* @__PURE__ */ new Error("Recovery audit could not read storage."));
		});
		signal.throwIfAborted();
		const mirror = readJsonLocal(DURABLE_LINKS_LS_KEY);
		const links = [];
		for (const source of [saved.links?.links, mirror?.links]) if (Array.isArray(source)) await forEachCatalogSlice(source, (row) => {
			if (row && typeof row.url === "string" && typeof row.id === "string") links.push(row);
		}, async () => {
			signal.throwIfAborted();
			await yieldCatalogTask();
		});
		return {
			artwork,
			links,
			savedAt: saved.meta?.checkedAt
		};
	} finally {
		db.close();
	}
}
/** Disposable, bounded recommendation impressions use the existing activity store. */
var EXPOSURE_LS_KEY = "reelcase.recommendation-exposure.v1";
function loadRecommendationExposureSync() {
	return readJsonLocal(EXPOSURE_LS_KEY);
}
async function restoreRecommendationExposure() {
	let durable;
	try {
		durable = await getActivityBlob("recommendation-exposure");
	} catch {}
	return newestExposure(durable, loadRecommendationExposureSync());
}
function saveRecommendationExposure(ledger) {
	const local = writeJsonLocal(EXPOSURE_LS_KEY, ledger);
	return putActivityBlob("recommendation-exposure", ledger).then(() => true, () => local);
}
var TOPIC_ALIASES_LS_KEY = "reelcase.topic-aliases.v1";
function loadTopicAliasesSync() {
	return readJsonLocal(TOPIC_ALIASES_LS_KEY);
}
async function restoreTopicAliases() {
	let durable;
	try {
		durable = await getActivityBlob("topic-aliases");
	} catch {}
	return newestTopicAliases(durable, loadTopicAliasesSync());
}
function saveTopicAliases(ledger) {
	const local = writeJsonLocal(TOPIC_ALIASES_LS_KEY, ledger);
	return putActivityBlob("topic-aliases", ledger).then(() => true, () => local);
}
var BRIDGES_LS_KEY = "reelcase.topic-bridges.v1";
function loadTopicBridgesSync() {
	return readJsonLocal(BRIDGES_LS_KEY);
}
async function restoreTopicBridges() {
	let saved;
	try {
		saved = await getActivityBlob("topic-bridges");
	} catch {}
	return newestBridges(saved, loadTopicBridgesSync());
}
function saveTopicBridges(ledger) {
	const local = writeJsonLocal(BRIDGES_LS_KEY, ledger);
	return putActivityBlob("topic-bridges", ledger).then(() => true, () => local);
}
var GUIDE_PRESET_LS_KEY = "reelcase.guide-preset.v1";
function loadGuidePresetSync() {
	return readJsonLocal(GUIDE_PRESET_LS_KEY);
}
async function restoreGuidePreset() {
	let saved;
	try {
		saved = await getActivityBlob("guide-preset");
	} catch {}
	return newestGuidePreset(saved, loadGuidePresetSync());
}
function saveGuidePreset(ledger) {
	const local = writeJsonLocal(GUIDE_PRESET_LS_KEY, ledger);
	return putActivityBlob("guide-preset", ledger).then(() => true, () => local);
}
var FILMS_LS_KEY = "reelcase.film-reviews.v1";
function loadFilmReviewsSync() {
	return readJsonLocal(FILMS_LS_KEY);
}
async function restoreFilmReviews() {
	let saved;
	try {
		saved = await getActivityBlob("film-reviews");
	} catch {}
	return newestFilms(saved, loadFilmReviewsSync());
}
function saveFilmReviews(ledger) {
	const local = writeJsonLocal(FILMS_LS_KEY, ledger);
	return putActivityBlob("film-reviews", ledger).then(() => true, () => local);
}
var ANIME_REVIEWS_LS_KEY = "reelcase.anime-reviews.v1";
function loadAnimeReviewsSync() {
	return readJsonLocal(ANIME_REVIEWS_LS_KEY);
}
async function restoreAnimeReviews() {
	let saved;
	try {
		saved = await getActivityBlob("anime-reviews");
	} catch {}
	return newestAnimeReviews(saved, loadAnimeReviewsSync());
}
function saveAnimeReviews(ledger) {
	const local = writeJsonLocal(ANIME_REVIEWS_LS_KEY, ledger);
	return putActivityBlob("anime-reviews", ledger).then(() => true, () => local);
}
var PROVIDER_VIEWING_LS_KEY = "reelcase.provider-viewing.v1";
function loadProviderViewingSync() {
	return readJsonLocal(PROVIDER_VIEWING_LS_KEY);
}
async function restoreProviderViewing() {
	let saved;
	try {
		saved = await getActivityBlob("provider-viewing");
	} catch {}
	return newestProviderViewing(saved, loadProviderViewingSync());
}
function saveProviderViewing(ledger) {
	const local = writeJsonLocal(PROVIDER_VIEWING_LS_KEY, ledger);
	return putActivityBlob("provider-viewing", ledger).then(() => true, () => local);
}
//#endregion
export { catalogIdentityKeys as $, saveSourceHealth as $i, normalizeGuidePreset as $n, replacementRequestBudget as $r, holdEntryLimitCursors as $t, aliasLabel as A, videoIsPrivate as Aa, saveAnimeReviews as Ai, lockFilmField as An, readModelNotes as Ar, createSourcePicks as At, automaticYoutubeTags as B, youtubeSourceNewest as Ba, saveDurableShelves as Bi, newestBridges as Bn, recoverCatalogMutations as Br, forgetProviderView as Bt, TOPICS as C, topicPreferenceScore as Ca, reviewedRankingTag as Ci, loadProviderViewingSync as Cn, providerLoginGuidance as Cr, confirmAnimeEpisode as Ct, activityLookupAsync as D, undoFilmReview as Da, sameGuideWeights as Di, loadThumbCache as Dn, ratingAdjustedScore as Dr, createExposurePenalty as Dt, activityLookup as E, undoAnimeReview as Ea, rotationAvailable as Ei, loadSourceHealth as En, rankingTags as Er, createBoundedPicks as Et, appendCatalogVideos as F, withCatalogRead as Fa, saveDurableHistory as Fi, mergeRemoteCatalogAsync as Fn, recipeDocument as Fr, entryGroup as Ft, bridgePolicy as G, saveGuidePreset as Gi, newestRejections as Gn, remainingEntrySlots as Gr, getTopicAliasRevision as Gt, binaryArtwork as H, youtubeTagTitleHash as Ha, saveFilmReviews as Hi, newestFilms as Hn, refreshYoutubeTags as Hr, generatedProvenance as Ht, applyExposureEvents as I, youtubeCatalogCoverage as Ia, saveDurableLinks as Ii, mergeRemoteRefreshAsync as In, recipeLoadReview as Ir, exposureKey as It, buildAnimeEpisodeMap as J, saveProviderViewing as Ji, normalizeAnimeReviews as Jn, remoteEntryCounts as Jr, guidePersonalScore as Jt, bridgeText as K, saveModelNote as Ki, newestTopicAliases as Kn, rememberEntryCounts as Kr, getTopicAliases as Kt, applyFilmFields as L, youtubeCleanupProtected as La, saveDurableMarks as Li, modelNoteChecklist as Ln, reconcileProviderTopicTags as Lr, filmNameEvidence as Lt, animeReviewVisibility as M, waitForFollowsWrites as Ma, saveCreatorCoverageRows as Mi, lookupVideo as Mn, readOfflineAuditStorage as Mr, deleteDirHandle as Mt, animeTitleInfo as N, waitForPrefsWrites as Na, saveDirHandle as Ni, lookupVideos as Nn, readWorkspaceDocument as Nr, editAnimeSeries as Nt, admitRemoteEntries as O, validAliasLabel as Oa, sameRecommendationSession as Oi, loadTopicAliasesSync as On, ratingMultiplier as Or, createRejectionPenalty as Ot, appendActivityJournal as P, withCatalogDetails as Pa, saveDurableFeedback as Pi, mergeFollowRecovery as Pn, rebaseSignalEdit as Pr, emptyYoutubeCleanup as Pt, catalogCard as Q, saveSavedShelfEdit as Qi, normalizeFollowCheckpoints as Qn, removeRemoteSnapshotVideos as Qr, hasTopicForScan as Qt, artworkBytes as R, youtubeCoverageCounts as Ra, saveDurablePhotos as Ri, myFreeCamsRoomUrl as Rn, recordYoutubeCleanup as Rr, filmPoster as Rt, SignalConflictError as S, topicEvidenceForScan as Sa, reviewedAnimeInfo as Si, loadPrefs as Sn, projectFilmVideo as Sr, confidenceBand as St, activityCandidatesAsync as T, twitchIdentity as Ta, rollbackGuidePreset as Ti, loadRemoteSnapshot as Tn, publicVideoBoundary as Tr, consumeCleanupBudget as Tt, bridgeFields as U, youtubeTextTags as Ua, saveFolderVideos as Ui, newestGuidePreset as Un, rejectionKey as Ur, generatedSeed as Ut, baseCanonicalTopic as V, youtubeTagEvidence as Va, saveEnrichmentRows as Vi, newestExposure as Vn, recoverResumeRecords as Vr, generatedCheckpoint as Vt, bridgeKey as W, youtubeVideoKey as Wa, saveFollows as Wi, newestProviderViewing as Wn, releaseArtwork as Wr, getPersistenceMemorySnapshot as Wt, canRotateForGroup as X, saveRecoveryLinks as Xi, normalizeExposure as Xn, removeAnimeMapping as Xr, guideTieRank as Xt, cacheMetrics as Y, saveRecommendationExposure as Yi, normalizeBridgeLedger as Yn, remoteVideoIndexAsync as Yr, guidePositive as Yt, canonicalTopic as Z, saveRemoteSnapshot as Zi, normalizeFilmLedger as Zn, removeEnrichmentRows as Zr, guideWeights as Zt, INTEREST_MULTIPLIERS as _, studioSettingsError as _a, restoreRecommendationExposure as _i, loadDirHandles as _n, preferFilmVersion as _r, clipCoverageSummary as _t, DEFAULT_STUDIO_SETTINGS as a, saveYoutubeCleanup as aa, restoreDurableLinks as ai, isGuideWeights as an, parseAnimeReviews as ar, changeTopicAlias as at, RATING_STAR_WEIGHTS as b, titleRejectionTarget as ba, restoreTopicBridges as bi, loadFollows as bn, prepareRefreshSavedIds as br, compactYoutubeTagEvidence as bt, EMPTY_EXPOSURE as c, selectSavedCardsAsync as ca, restoreDurablePrefs as ci, isTopicTag as cn, parseProviderViewing as cr, cleanupBudgets as ct, EMPTY_MODEL_NOTES as d, setAnimePolicy as da, restoreEnrichmentRows as di, loadActivityJournal as dn, peekYoutubeOwner as dr, cleanupPolicy as dt, saveThumbCache as ea, restoreAnimeReviews as ei, importModelNote as en, normalizeProviderViewing as er, catalogRecoverySnapshot as et, EMPTY_PROVIDER_VIEWING as f, setAnimeRange as fa, restoreFilmReviews as fi, loadActivitySnapshot as fn, persist_D_pR3DU__exports as fr, cleanupSourceKeys as ft, FILM_FIELDS as g, studioSettings as ga, restoreRecipes as gi, loadCatalogVideos as gn, preferAnimeVersion as gr, clipCoverageAction as gt, EXPOSURE_DWELL_MS as h, studioOutputs as ha, restoreProviderViewing as hi, loadCatalogVideo as hn, planYoutubeCleanup as hr, clearFolderVideos as ht, DEFAULT_RECOMMENDATION_SESSION as i, saveWorkspaceDocuments as ia, restoreDurableHistory as ii, isGuidePreset as in, officialAdultUrl as ir, changeRejection as it, aliasSearchTerms as j, waitForDurableWrites as ja, saveCatalogMetadataEdit as ji, lookupCatalogIdentity as jn, readModelPreflight as jr, creatorRejectionTarget as jt, adultAdmissionPolicy as k, videoBridgeSource as ka, saveActivitySnapshot as ki, loadTopicBridgesSync as kn, ratingPreference as kr, createSessionPicks as kt, EMPTY_FILMS as l, sessionAllows as la, restoreDurableResume as li, linksFromHistoryAndResume as ln, parseRecipe as lr, cleanupKey as lt, EMPTY_TOPIC_ALIASES as m, sourcesInMask as ma, restoreMetadataEdits as mi, loadCachedThumb as mn, personalRankScore as mr, clearExposure as mt, CLEANUP_GROUPS as n, saveTopicBridges as na, restoreDurableFeedback as ni, isBridgeLedger as nn, normalizeRejections as nr, changeBridge as nt, EMPTY_ANIME_REVIEWS as o, savedRecordScan as oa, restoreDurableMarks as oi, isRejectionLedger as on, parseFilmLedger as or, chooseProviderView as ot, EMPTY_REJECTIONS as p, signalRevisions as pa, restoreGuidePreset as pi, loadAnimeReviewsSync as pn, personalRankBreakdown as pr, clearActivityJournal as pt, bridgeTopic as q, savePrefs as qi, nextAnimeEpisode as qn, rememberVideo as qr, groupFilmVersions as qt, DEFAULT_GUIDE_WEIGHTS as r, saveViewPrefs as ra, restoreDurableFollows as ri, isExposureLedger as rn, normalizeTopicAliases as rr, changeGuidePreset as rt, EMPTY_BRIDGES as s, selectSavedCards as sa, restoreDurablePhotos as si, isTopicAliasLedger as sn, parseModelNote as sr, cleanupBudgetAvailable as st, BRIDGE_SOURCES as t, saveTopicAliases as ta, restoreCatalogMetadata as ti, installTopicAliases as tn, normalizeRecommendationSession as tr, catalogWriter as tt, EMPTY_GUIDE_PRESET as u, sessionPreferenceAdjustment as ua, restoreDurableShelves as ui, listWorkspaceDocuments as un, patchActivityRecord as ur, cleanupLabel as ut, MODEL_NOTE_BYTES as v, subscribeCatalogRecovery as va, restoreTagEdits as vi, loadDurablePhotosSync as vn, prepareEnrichmentBatch as vr, clipWindowLabel as vt, activityCandidates as w, topicsForVideo as wa, reviewedTopic as wi, loadRecommendationExposureSync as wn, pruneActivityJournal as wr, confirmFilm as wt, STUDIO_OUTPUT_LIMITS as x, topicEvidence as xa, retiredYoutubeKeys as xi, loadGuidePresetSync as xn, previewFilmFields as xr, confidenceAdjustedPreference as xt, MODEL_ROLES as y, takeBestMapped as ya, restoreTopicAliases as yi, loadFilmReviewsSync as yn, prepareIndexedRemoteCatalog as yr, clipWindowStop as yt, artworkUrl as z, youtubeCoverageIndexAsync as za, saveDurableResume as zi, newestAnimeReviews as zn, recoverActivityCounts as zr, filmVisibility as zt };
