import { r as __exportAll } from "../_runtime.mjs";
import { Jt as __exportAll$1, T as copyCatalogRecord, zt as yieldCatalogTask } from "./twitch-retry-C3xxOucA.mjs";
import { l as profileLocalStorage } from "./local-profile-storage-CUAAAjCd.mjs";
import { t as createLocalId } from "./local-id-CsDq4efR.mjs";
import { $r as parseFeedbackTimeline, Bt as commitFeedbackUndo, Ei as ratingPreference, Ga as saveDurableFeedback, Rr as newestRejections, St as changeRejection, Tr as mergeFeedbackWatch, U as appendFeedbackOperation, Vn as isRejectionLedger, Wo as undoFeedbackOperation, Yr as normalizeRejections, br as manualTimelineClock, h as EMPTY_REJECTIONS, pt as canonicalTopic, sa as restoreDurableFeedback, ts as waitForDurableWrites, vn as getTopicAliasRevision, yr as manualFeedbackFingerprint } from "./persist-BKzTZjAH.mjs";
import { a as scheduleBackgroundWork } from "./interaction-budget-2wyu0HNo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/media-feedback-DBJhTcWq.js
var media_feedback_DBJhTcWq_exports = /* @__PURE__ */ __exportAll({
	A: () => toggleTagLike,
	C: () => setRating,
	D: () => tagIsLiked,
	E: () => tagHasHeartHistory,
	F: () => RATING_GOALS,
	I: () => getRatingStreakSnapshot,
	L: () => setRatingWeeklyGoal,
	M: () => verifyCleanupFeedback,
	N: () => warmLegacyRatings,
	O: () => toggleCreatorFavorite,
	P: () => watchTimeScore,
	S: () => setNote,
	T: () => subscribeRating,
	_: () => rankingFeedbackSnapshot,
	a: () => getCreatorRating,
	b: () => retryFeedbackSave,
	c: () => getFeedbackSaveState,
	d: () => getNote,
	f: () => getRating,
	g: () => media_feedback_exports,
	h: () => hydrateDurableFeedback,
	i: () => exportFeedback,
	j: () => undoManualFeedback,
	k: () => toggleCreatorLike,
	l: () => getFeedbackTimeline,
	m: () => getWatchTime,
	n: () => creatorIsFavorited,
	o: () => getFeedbackDiagnostics,
	p: () => getRecommendationRejections,
	r: () => creatorIsLiked,
	s: () => getFeedbackRevision,
	t: () => creatorHasExplicitFeedback,
	u: () => getHeartedTagHistory,
	v: () => recommendationTopicIsLiked,
	w: () => setRecommendationRejection,
	x: () => setCreatorRating,
	y: () => recordWatchTime
});
var KEY$1 = "reelcase.rating-streaks.v1";
var GOAL_KEY = "reelcase.rating-weekly-goal.v1";
var DEFAULT_WEEKLY_GOAL = 5;
var RATING_GOALS = [
	3,
	5,
	10
];
function weeklyGoal() {
	try {
		const saved = Number(profileLocalStorage.getItem(GOAL_KEY) ?? DEFAULT_WEEKLY_GOAL);
		return RATING_GOALS.includes(saved) ? saved : DEFAULT_WEEKLY_GOAL;
	} catch {
		return DEFAULT_WEEKLY_GOAL;
	}
}
function setRatingWeeklyGoal(goal) {
	if (!RATING_GOALS.includes(goal) || typeof window === "undefined") return;
	try {
		profileLocalStorage.setItem(GOAL_KEY, String(goal));
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
function read$1() {
	try {
		const saved = JSON.parse(profileLocalStorage.getItem(KEY$1) ?? "[]");
		return Array.isArray(saved) ? saved.filter((row) => typeof row?.day === "string" && Array.isArray(row?.ids)).slice(-400) : [];
	} catch {
		return [];
	}
}
function write$1(days) {
	try {
		profileLocalStorage.setItem(KEY$1, JSON.stringify(days.slice(-400)));
	} catch {}
}
/** Rebuild current-week progress from the durable feedback ledger. Older
* versions saved the rating but did not always update this lightweight UI
* counter, especially after a refresh or browser restore. */
function reconcileRatingLedger(days) {
	try {
		const feedback = JSON.parse(profileLocalStorage.getItem("reelcase.media-feedback.v1") ?? "{}");
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
	const days = read$1();
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
	const days = reconcileRatingLedger(read$1());
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
var media_feedback_exports = /* @__PURE__ */ __exportAll$1({
	creatorHasExplicitFeedback: () => creatorHasExplicitFeedback,
	creatorIsFavorited: () => creatorIsFavorited,
	creatorIsLiked: () => creatorIsLiked,
	exportFeedback: () => exportFeedback,
	flushFeedbackForRestore: () => flushFeedbackForRestore,
	getCreatorRating: () => getCreatorRating,
	getFeedbackDiagnostics: () => getFeedbackDiagnostics,
	getFeedbackRevision: () => getFeedbackRevision,
	getFeedbackSaveState: () => getFeedbackSaveState,
	getFeedbackTimeline: () => getFeedbackTimeline,
	getHeartedTagHistory: () => getHeartedTagHistory,
	getNote: () => getNote,
	getRating: () => getRating,
	getRatingLedger: () => getRatingLedger,
	getRecommendationRejections: () => getRecommendationRejections,
	getWatchTime: () => getWatchTime,
	getWatchTimeLedger: () => getWatchTimeLedger,
	hydrateDurableFeedback: () => hydrateDurableFeedback,
	importFeedback: () => importFeedback,
	rankingFeedbackSnapshot: () => rankingFeedbackSnapshot,
	ratingPreference: () => ratingPreference,
	recommendationTopicIsLiked: () => recommendationTopicIsLiked,
	recordWatchTime: () => recordWatchTime,
	retryFeedbackSave: () => retryFeedbackSave,
	setCreatorRating: () => setCreatorRating,
	setNote: () => setNote,
	setRating: () => setRating,
	setRecommendationRejection: () => setRecommendationRejection,
	subscribeRating: () => subscribeRating,
	tagHasHeartHistory: () => tagHasHeartHistory,
	tagIsLiked: () => tagIsLiked,
	toggleCreatorFavorite: () => toggleCreatorFavorite,
	toggleCreatorLike: () => toggleCreatorLike,
	toggleTagLike: () => toggleTagLike,
	undoManualFeedback: () => undoManualFeedback,
	verifyCleanupFeedback: () => verifyCleanupFeedback,
	warmLegacyRatings: () => warmLegacyRatings,
	watchTimeScore: () => watchTimeScore
});
var EMPTY_WATCH_TIME = {
	preview: 0,
	fullscreen: 0
};
function watchTimeScore(time) {
	return Math.min(12, Math.floor(time.preview / 30) + Math.floor(time.fullscreen / 90) * 2 + Math.floor((time.previewEstimated ?? 0) / 90) + Math.floor((time.fullscreenEstimated ?? 0) / 180));
}
var KEY = "reelcase.media-feedback.v1";
var cached = null;
var signalVersion = 0;
/** Includes ratings, hearts, durable imports and elapsed watch-time changes. */
function getFeedbackRevision() {
	read();
	return signalVersion;
}
var snapshot;
var changeTimer;
var persistTimer;
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
function flushFeedbackForRestore() {
	flush();
}
function retryFeedbackSave() {
	pendingWrites = 1;
	flush();
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
		for (let index = 0; index < profileLocalStorage.length; index++) {
			const key = profileLocalStorage.key(index);
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
				for (let index = 0; index < profileLocalStorage.length; index++) {
					const key = profileLocalStorage.key(index);
					if (key?.startsWith("reelcase.rating.")) {
						const id = key.slice(16);
						legacyRatingKeys?.add(id);
						if (!legacyRatings.has(id)) {
							const value = Number(profileLocalStorage.getItem(key));
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
	const version = signalVersion, feedback = read();
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
		const current = read();
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
function read() {
	if (cached) return cached;
	try {
		const saved = JSON.parse(profileLocalStorage.getItem(KEY) ?? "{}");
		cached = {
			manualTimeline: saved.manualTimeline,
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
	const current = read();
	const manual = manualTimelineClock(durable.manualTimeline) > manualTimelineClock(current.manualTimeline) ? durable : current, other = manual === durable ? current : durable;
	cached = {
		manualTimeline: manual.manualTimeline,
		recommendationRejections: newestRejections(durable.recommendationRejections, manual.recommendationRejections),
		ratings: {
			...other.ratings,
			...manual.ratings
		},
		ratingHistory: manualTimelineClock(manual.manualTimeline) > 0 ? manual.ratingHistory ?? {} : {
			...other.ratingHistory,
			...manual.ratingHistory
		},
		notes: {
			...durable.notes,
			...current.notes
		},
		creatorRatings: manualTimelineClock(manual.manualTimeline) > 0 ? manual.creatorRatings ?? {} : {
			...other.creatorRatings,
			...manual.creatorRatings
		},
		creatorLikes: manualTimelineClock(manual.manualTimeline) > 0 ? manual.creatorLikes ?? {} : {
			...other.creatorLikes,
			...manual.creatorLikes
		},
		creatorFavorites: manualTimelineClock(manual.manualTimeline) > 0 ? manual.creatorFavorites ?? {} : {
			...other.creatorFavorites,
			...manual.creatorFavorites
		},
		tagLikes: manualTimelineClock(manual.manualTimeline) > 0 ? manual.tagLikes ?? {} : {
			...other.tagLikes,
			...manual.tagLikes
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
	persistTimer = void 0;
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
function flush() {
	if (persistTimer !== void 0) window.clearTimeout(persistTimer);
	persistTimer = void 0;
	cancelPersist?.();
	cancelPersist = void 0;
	persist();
}
function queuePersist(delay) {
	persistTimer = window.setTimeout(() => {
		persistTimer = void 0;
		cancelPersist = scheduleBackgroundWork(persist, { timeoutMs: 1e3 });
	}, delay);
}
if (typeof window !== "undefined") {
	window.addEventListener("pagehide", flush);
	const onHidden = () => {
		if (document.visibilityState === "hidden") flush();
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
	if (persistTimer) window.clearTimeout(persistTimer);
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
	if (persistTimer === void 0 && !cancelPersist) queuePersist(15e3);
}
function notifyChange() {
	if (typeof window === "undefined" || changeTimer) return;
	changeTimer = window.setTimeout(() => {
		changeTimer = void 0;
		window.dispatchEvent(new Event("reelcase:rating-change"));
	}, 48);
}
function getRating(id) {
	const value = read().ratings[id];
	if (Number.isFinite(value)) return value;
	if (typeof window === "undefined") return 0;
	const known = legacyRatings.get(id);
	if (known !== void 0) return known;
	if (!legacyKeys().has(id)) return 0;
	let legacy = 0;
	try {
		legacy = Number(profileLocalStorage.getItem(`reelcase.rating.${id}`) ?? 0);
	} catch {}
	const rating = Number.isFinite(legacy) ? legacy : 0;
	legacyRatings.set(id, rating);
	return rating;
}
function setRating(id, rating) {
	const started = typeof performance !== "undefined" ? performance.now() : Date.now();
	const next = read(), before = getRating(id);
	next.ratings[id] = Math.max(0, Math.min(5, Math.round(rating)));
	next.ratingHistory[id] = {
		rating: next.ratings[id],
		updatedAt: Date.now()
	};
	recordManual(next, "rating", id, before, next.ratings[id], id);
	legacyRatings.set(id, next.ratings[id]);
	legacyKeys().add(id);
	recordRatingForStreak(id, next.ratings[id]);
	write(next);
	ratingSignal.emit(id);
	notifyChange();
	lastRatingQueueMs = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - started);
}
function getRatingLedger() {
	return { ...read().ratingHistory };
}
function getWatchTime(id) {
	return read().watchTime[id] ?? EMPTY_WATCH_TIME;
}
function getWatchTimeLedger() {
	return { ...read().watchTime };
}
/** Count real elapsed playback in small bounded increments, never seek distance. */
function recordWatchTime(id, mode, seconds) {
	if (!id || !Number.isFinite(seconds) || seconds <= 0) return;
	const next = read();
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
	return read().creatorRatings[creatorKey(name)] ?? 0;
}
function setCreatorRating(name, rating) {
	const next = read(), key = creatorKey(name), before = next.creatorRatings[key] ?? 0;
	next.creatorRatings[key] = Math.max(0, Math.min(5, Math.round(rating)));
	recordManual(next, "creatorRating", key, before, next.creatorRatings[key], name);
	write(next);
	notifyChange();
}
function creatorIsFavorited(name) {
	return Boolean(read().creatorFavorites?.[creatorKey(name)]);
}
function toggleCreatorFavorite(name) {
	const key = creatorKey(name);
	if (!key) return;
	const next = read(), favorites = next.creatorFavorites ??= {};
	const before = Boolean(favorites[key]);
	if (favorites[key]) delete favorites[key];
	else favorites[key] = true;
	recordManual(next, "creatorFavorite", key, before, !before, name);
	write(next);
	notifyChange();
}
function creatorIsLiked(name) {
	return Boolean(read().creatorLikes[creatorKey(name)]);
}
function toggleCreatorLike(name) {
	const next = read(), key = creatorKey(name), before = Boolean(next.creatorLikes[key]);
	if (before) delete next.creatorLikes[key];
	else next.creatorLikes[key] = true;
	recordManual(next, "creatorLike", key, before, !before, name);
	write(next);
	notifyChange();
}
function tagKey(tag) {
	return tag.trim().toLowerCase();
}
function tagIsLiked(tag) {
	return Boolean(read().tagLikes[tagKey(tag)]);
}
function tagHasHeartHistory(tag) {
	return Boolean(read().tagHeartHistory[tagKey(tag)]);
}
function getHeartedTagHistory() {
	return Object.keys(read().tagHeartHistory).sort((a, b) => (read().tagHeartHistory[b] ?? 0) - (read().tagHeartHistory[a] ?? 0));
}
function toggleTagLike(tag) {
	const next = read();
	const key = tagKey(tag);
	const before = Boolean(next.tagLikes[key]), heartBefore = next.tagHeartHistory[key] ?? null;
	if (next.tagLikes[key]) delete next.tagLikes[key];
	else {
		next.tagLikes[key] = true;
		next.tagHeartHistory[key] ??= Date.now();
	}
	recordManual(next, "tagLike", key, before, !before, tag, {
		heartBefore,
		heartAfter: next.tagHeartHistory[key] ?? null
	});
	write(next);
	notifyChange();
}
/** Versioned rating/note payload used by the full library backup. */
function exportFeedback() {
	const { manualTimeline, ...feedback } = read();
	return {
		version: 5,
		...feedback
	};
}
function getNote(id) {
	const value = read().notes[id];
	if (typeof value === "string") return value;
	try {
		return profileLocalStorage.getItem(`reelcase.note.${id}`) ?? "";
	} catch {
		return "";
	}
}
function setNote(id, note) {
	const next = read();
	if (note.trim()) next.notes[id] = note.trim();
	else delete next.notes[id];
	write(next);
}
/** Merge an imported feedback payload without wiping unrelated keys. */
function importFeedback(partial) {
	const next = read();
	next.manualTimeline = {
		version: 1,
		entries: [],
		updatedAt: Date.now()
	};
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
	flush();
}
/** Reuses the feedback mirror and coalesced durable save; never enters shared room state. */
function getRecommendationRejections() {
	return read().recommendationRejections ?? EMPTY_REJECTIONS;
}
function setRecommendationRejection(entry, remove = false) {
	const current = getRecommendationRejections(), changed = changeRejection(current, entry, remove);
	if (changed === current) return;
	const next = {
		...read(),
		recommendationRejections: changed
	}, target = entry.scope + ":" + entry.target;
	recordManual(next, "rejection", target, current.entries.find((e) => e.scope + ":" + e.target === target) ?? null, remove ? null : changed.entries.find((e) => e.scope + ":" + e.target === target) ?? null, entry.label);
	write(next);
	notifyChange();
}
var topicHeartRevision = -1;
var topicHeartAliasRevision = -1;
var topicHearts = /* @__PURE__ */ new Set();
function recommendationTopicIsLiked(topic) {
	read();
	if (topicHeartRevision !== signalVersion || topicHeartAliasRevision !== getTopicAliasRevision()) {
		topicHearts = new Set(Object.keys(read().tagLikes).map(canonicalTopic).filter((value) => Boolean(value)));
		topicHeartRevision = signalVersion;
		topicHeartAliasRevision = getTopicAliasRevision();
	}
	return topicHearts.has(topic);
}
function recordManual(next, kind, target, before, after, label, aux = {}) {
	if (!target || target.length > 520) return;
	try {
		next.manualTimeline = appendFeedbackOperation(next, {
			id: createLocalId("feedback-"),
			kind,
			target,
			label: label.slice(0, 160),
			before,
			after,
			at: Date.now(),
			...aux
		});
	} catch {}
}
function getFeedbackTimeline() {
	return parseFeedbackTimeline(read().manualTimeline);
}
function creatorHasExplicitFeedback(name) {
	const key = creatorKey(name), f = read();
	return !!(f.creatorRatings[key] || f.creatorLikes[key] || f.creatorFavorites?.[key]);
}
var undoRunning = false;
async function undoManualFeedback(id) {
	if (undoRunning) throw Error("Another feedback undo is still saving.");
	undoRunning = true;
	try {
		await hydrateDurableFeedback();
		flush();
		await waitForDurableWrites();
		const expected = read(), fingerprint = manualFeedbackFingerprint(expected), next = undoFeedbackOperation(expected, id);
		const current = () => manualFeedbackFingerprint(read()) === fingerprint;
		const committed = await commitFeedbackUndo(expected, next, current);
		cached = {
			...read(),
			watchTime: mergeFeedbackWatch(committed.watchTime, read().watchTime),
			ratings: next.ratings,
			ratingHistory: next.ratingHistory,
			creatorRatings: next.creatorRatings,
			creatorLikes: next.creatorLikes,
			creatorFavorites: next.creatorFavorites,
			tagLikes: next.tagLikes,
			tagHeartHistory: next.tagHeartHistory,
			recommendationRejections: next.recommendationRejections,
			manualTimeline: next.manualTimeline
		};
		for (const [key, value] of Object.entries(next.ratings)) if (legacyRatings.has(key)) legacyRatings.set(key, value);
		signalVersion++;
		snapshot = void 0;
		ratingSignal.emitAll();
		notifyChange();
		savedState("saved");
	} finally {
		undoRunning = false;
	}
}
//#endregion
export { tagIsLiked as A, setCreatorRating as C, setRecommendationRejection as D, setRatingWeeklyGoal as E, verifyCleanupFeedback as F, warmLegacyRatings as I, watchTimeScore as L, toggleCreatorLike as M, toggleTagLike as N, subscribeRating as O, undoManualFeedback as P, retryFeedbackSave as S, setRating as T, hydrateDurableFeedback as _, exportFeedback as a, recommendationTopicIsLiked as b, getFeedbackRevision as c, getHeartedTagHistory as d, getNote as f, getWatchTime as g, getRecommendationRejections as h, creatorIsLiked as i, toggleCreatorFavorite as j, tagHasHeartHistory as k, getFeedbackSaveState as l, getRatingStreakSnapshot as m, creatorHasExplicitFeedback as n, getCreatorRating as o, getRating as p, creatorIsFavorited as r, getFeedbackDiagnostics as s, RATING_GOALS as t, getFeedbackTimeline as u, media_feedback_DBJhTcWq_exports as v, setNote as w, recordWatchTime as x, rankingFeedbackSnapshot as y };
