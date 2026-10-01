import "../_runtime.mjs";
import { H as isUsableAdultThumb, S as adultIngestTags, X as repairLegacyYoutubeDate, a as ADULT_FOLDER_BY_PROVIDER, b as RETIRED_ADULT_SOURCE_IDS, c as ADULT_PULL_PROVIDERS, h as LIBRARY_LIMITS, o as ADULT_FOLDER_IDS, q as redditIngestExtras, x as adultFolderIds } from "./adult-reddit-tags-D2uyB_M1.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { r as Slot, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as create } from "../_libs/zustand.mjs";
import { c as extensionOf, s as cn } from "./router-ZlJ09x8f.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-B99kasGz.js
var DEFAULT_PULL_SETTINGS = Object.freeze({
	requestGapMs: 1500,
	concurrentRequests: 1,
	youtubeBatchVideos: 100,
	youtubeSourcesPerSweep: 32,
	youtubeIntervalSeconds: 300,
	adultBatchVideos: 2e3,
	adultIntervalSeconds: 120,
	adultCatalogTarget: 1e5,
	automaticPulls: true,
	pauseWhileWatching: true
});
var limits = {
	requestGapMs: [250, 6e4],
	concurrentRequests: [1, 3],
	youtubeBatchVideos: [30, 500],
	youtubeSourcesPerSweep: [1, 1024],
	youtubeIntervalSeconds: [60, 3600],
	adultBatchVideos: [20, 1e4],
	adultIntervalSeconds: [30, 3600],
	adultCatalogTarget: [1e3, 1e6]
};
function normalizePullSettings(raw) {
	const input = raw && typeof raw === "object" ? raw : {};
	const next = { ...DEFAULT_PULL_SETTINGS };
	for (const key of Object.keys(limits)) {
		const value = Number(input[key]);
		if (input[key] !== void 0 && Number.isFinite(value)) next[key] = Math.max(limits[key][0], Math.min(limits[key][1], Math.floor(value)));
	}
	for (const key of ["automaticPulls", "pauseWhileWatching"]) if (typeof input[key] === "boolean") next[key] = input[key];
	return next;
}
var KEY$5 = "reelcase.pull-settings.v1";
var settings = DEFAULT_PULL_SETTINGS;
var hydrated$1 = false;
var listeners$2 = /* @__PURE__ */ new Set();
function getPullSettings() {
	if (!hydrated$1 && typeof window !== "undefined") {
		hydrated$1 = true;
		try {
			settings = Object.freeze(normalizePullSettings(JSON.parse(localStorage.getItem(KEY$5) ?? "null")));
		} catch {}
	}
	return settings;
}
var subscribePullSettings = (listener) => {
	listeners$2.add(listener);
	return () => {
		listeners$2.delete(listener);
	};
};
function updatePullSettings(patch) {
	settings = Object.freeze(normalizePullSettings({
		...getPullSettings(),
		...patch
	}));
	try {
		localStorage.setItem(KEY$5, JSON.stringify(settings));
	} catch {}
	for (const listener of listeners$2) listener();
}
if (typeof window !== "undefined") {
	const onStorage = (event) => {
		if (event.key !== KEY$5) return;
		try {
			settings = Object.freeze(normalizePullSettings(JSON.parse(event.newValue ?? "null")));
		} catch {
			settings = DEFAULT_PULL_SETTINGS;
		}
		hydrated$1 = true;
		for (const listener of listeners$2) listener();
	};
	window.addEventListener("storage", onStorage);
}
var cancelledError = () => /* @__PURE__ */ new Error("Pull cancelled; accepted catalog entries remain saved.");
/** A bounded queue sleeps on pause/visibility changes. Each active slot retains
* at most one response; cancellation aborts transport and releases that slot. */
function createPullScheduler(policy, available, maxWaiting = 8, options = {}) {
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
		const waiting = (queue.length > 0 || running.size > 0) && !available();
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
		emit();
		if (!available()) {
			if (queue.length || held.size) schedule(options.availabilityDelay?.() ?? Infinity);
			return;
		}
		for (const resume of [...held]) resume();
		const config = policy();
		if (!queue.length || running.size >= config.concurrency) return;
		const delay = lastStarted + config.gapMs - performance.now();
		if (delay > 0) {
			schedule(delay);
			return;
		}
		const job = queue.shift();
		running.add(job);
		(async () => {
			let timeout;
			let abort = () => {};
			try {
				const interruption = new Promise((_, reject) => {
					abort = () => reject(job.controller.signal.reason ?? cancelledError());
					job.controller.signal.addEventListener("abort", abort, { once: true });
					timeout = setTimeout(() => job.controller.abort(/* @__PURE__ */ new Error("Catalog request timed out. Its saved resume point is unchanged; retry the pull.")), options.requestTimeoutMs ?? 9e4);
				});
				lastStarted = performance.now();
				const work = job.work(job.controller.signal);
				emit();
				const result = await Promise.race([work, interruption]);
				clearTimeout(timeout);
				while (!available() && job.generation === generation) await new Promise((resolve) => {
					const resume = () => {
						held.delete(resume);
						job.controller.signal.removeEventListener("abort", resume);
						resolve();
					};
					held.add(resume);
					job.controller.signal.addEventListener("abort", resume, { once: true });
					pump();
				});
				if (job.generation !== generation || job.controller.signal.aborted) throw cancelledError();
				job.resolve(result);
			} catch (error) {
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
		run(work) {
			if (queue.length >= maxWaiting) return Promise.reject(/* @__PURE__ */ new Error("Pull queue is full. Let the current batch finish before adding more."));
			const result = new Promise((resolve, reject) => queue.push({
				work,
				resolve: (value) => resolve(value),
				reject,
				generation,
				controller: new AbortController()
			}));
			pump();
			return result;
		},
		cancel() {
			generation++;
			cancelled += queue.length + running.size;
			for (const job of queue.splice(0)) job.reject(cancelledError());
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
	interactionPriorityUntil = Math.max(interactionPriorityUntil, now + 240);
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
/**
* Bound concurrent remote thumbnail fetches so Adults shelves do not stall
* scroll with hundreds of parallel CDN requests / retries.
* Visible cards use a high-priority lane; speculative/offscreen work waits.
*/
var active = 0;
var artworkSuppressed = false;
var suppressionListeners = /* @__PURE__ */ new Set();
var waitingHigh = [];
var waitingLow = [];
var interactionTimer;
/** Default ceiling — aggressive enough that dense Adult rails stay scrollable. */
var MAX_CONCURRENT = 12;
/** Reserve a few slots so visible cards are not starved by speculative warm. */
var HIGH_RESERVED = 4;
function maxConcurrent() {
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
function settle(waiter, release) {
	waiter.signal?.removeEventListener("abort", waiter.cancel);
	waiter.resolve(release);
}
/** Reserve capacity synchronously before resolving promises. Refilling the
* whole budget avoids serial loading after a viewer/visibility pause. */
function pump() {
	if (interactionTimer !== void 0) {
		clearTimeout(interactionTimer);
		interactionTimer = void 0;
	}
	if (artworkSuppressed || typeof document !== "undefined" && document.visibilityState === "hidden") return;
	const max = maxConcurrent();
	while (active < max) {
		let waiter = waitingHigh.shift();
		if (!waiter) {
			if (!waitingLow.length || active >= Math.max(1, max - HIGH_RESERVED)) return;
			const delay = getInteractionPriorityDelay();
			if (delay > 0) {
				interactionTimer = setTimeout(pump, delay);
				return;
			}
			waiter = waitingLow.shift();
		}
		if (waiter.signal?.aborted) {
			settle(waiter, null);
			continue;
		}
		active += 1;
		let released = false;
		settle(waiter, () => {
			if (released) return;
			released = true;
			active -= 1;
			pump();
		});
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
function acquireImageSlot(opts) {
	const signal = opts?.signal;
	if (signal?.aborted) return Promise.resolve(null);
	ensureImageBudgetVisibilityHook();
	const queue = (opts?.priority ?? "low") === "high" ? waitingHigh : waitingLow;
	return new Promise((resolve) => {
		const waiter = {
			resolve,
			signal,
			cancel: () => {
				const index = queue.indexOf(waiter);
				if (index < 0) return;
				queue.splice(index, 1);
				settle(waiter, null);
				pump();
			}
		};
		queue.push(waiter);
		signal?.addEventListener("abort", waiter.cancel, { once: true });
		pump();
	});
}
/** Drop speculative decode waiters (keeps high-priority visible cards). */
function clearLowPriorityImageQueue() {
	const pending = waitingLow.splice(0, waitingLow.length);
	for (const waiter of pending) settle(waiter, null);
	pump();
}
var visibilityHooked = false;
/** One shared visibility listener, instead of one listener per waiting card. */
function ensureImageBudgetVisibilityHook() {
	if (visibilityHooked || typeof document === "undefined") return;
	visibilityHooked = true;
	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState === "hidden") clearLowPriorityImageQueue();
		else pump();
	});
}
var KEY$4 = "reelcase.pulls-paused.v1";
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
		control.set(localStorage.getItem(KEY$4) === "true");
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
		localStorage.setItem(KEY$4, String(value));
	} catch {}
}
var viewing = false;
var gateListeners = /* @__PURE__ */ new Set();
var gateChanged = () => {
	scheduler.wake();
	for (const listener of gateListeners) listener();
};
function setPullViewerOpen(value) {
	viewing = value;
	setArtworkSuppressed(value);
	gateChanged();
}
function catalogPullAvailable() {
	return !pullsPaused() && !(getPullSettings().pauseWhileWatching && viewing) && (typeof document === "undefined" || !document.hidden) && getInteractionPriorityDelay() === 0;
}
var scheduler = createPullScheduler(() => ({
	concurrency: getPullSettings().concurrentRequests,
	gapMs: getPullSettings().requestGapMs
}), catalogPullAvailable, 8, { availabilityDelay: () => !pullsPaused() && !(getPullSettings().pauseWhileWatching && viewing) && (typeof document === "undefined" || !document.hidden) ? getInteractionPriorityDelay() : Infinity });
control.subscribe(gateChanged);
subscribePullSettings(gateChanged);
if (typeof document !== "undefined") {
	const onStorage = (event) => {
		if (event.key === KEY$4) {
			hydrated = true;
			control.set(event.newValue === "true");
		}
	};
	window.addEventListener("storage", onStorage);
	document.addEventListener("visibilitychange", gateChanged);
}
var getPullQueueSnapshot = scheduler.snapshot;
var subscribePullQueue = scheduler.subscribe;
var cancelQueuedPulls = () => {
	scheduler.cancel();
	gateChanged();
};
var getPullCancellationRevision = scheduler.revision;
/** Yield preparation/commits behind input, watching, pause, and visibility.
* Cancellation wakes this wait even when the tab never becomes visible. */
function waitForCatalogCommit(revision = scheduler.revision()) {
	return new Promise((resolve, reject) => {
		let timer;
		const cleanup = () => {
			clearTimeout(timer);
			gateListeners.delete(check);
		};
		const check = () => {
			clearTimeout(timer);
			if (revision !== scheduler.revision()) {
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
		check();
	});
}
async function runPausablePull(request) {
	return scheduler.run(request);
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
var followRemote = (...args) => runPausablePull((signal) => followRemoteRequest({
	...args[0],
	signal
}));
var refreshRemotes = (...args) => runPausablePull((signal) => refreshRemotesRequest({
	...args[0],
	signal
}));
var importChannels = (...args) => runPausablePull((signal) => importChannelsRequest({
	...args[0],
	signal
}));
var searchAdultVideos = (...args) => runPausablePull((signal) => searchAdultVideosRequest({
	...args[0],
	signal
}));
var KEY$3 = "reelcase.rating-streaks.v1";
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
function read$1() {
	try {
		const saved = JSON.parse(localStorage.getItem(KEY$3) ?? "[]");
		return Array.isArray(saved) ? saved.filter((row) => typeof row?.day === "string" && Array.isArray(row?.ids)).slice(-400) : [];
	} catch {
		return [];
	}
}
function write$1(days) {
	try {
		localStorage.setItem(KEY$3, JSON.stringify(days.slice(-400)));
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
/** Run catalog work in small tasks. Callers provide their visibility/input/
* cancellation gate; the generic helper holds no catalog-wide lookup cache. */
async function forEachCatalogSlice(rows, visit, turn) {
	for (let offset = 0; offset < rows.length;) {
		await turn();
		const started = performance.now(), end = Math.min(rows.length, offset + 512);
		for (; offset < end; offset++) {
			visit(rows[offset], offset);
			if (performance.now() - started >= 4) {
				offset++;
				break;
			}
		}
	}
}
/** Immutable record copies also yield; spreading a 100k-entry tag map inside
* a Zustand update blocks every subscriber and incoming click. */
async function copyCatalogRecord(source, turn) {
	const copy = {};
	let visited = 0, started = performance.now();
	await turn();
	for (const key in source) {
		if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
		Object.defineProperty(copy, key, {
			value: source[key],
			writable: true,
			enumerable: true,
			configurable: true
		});
		if (++visited >= 512 || performance.now() - started >= 4) {
			await turn();
			visited = 0;
			started = performance.now();
		}
	}
	return copy;
}
/** Copy references without one catalog-sized synchronous slice on ingest. */
async function copyCatalogArray(source, turn) {
	const copy = new Array(source.length);
	await forEachCatalogSlice(source, (row, index) => {
		copy[index] = row;
	}, turn);
	return copy;
}
/** Native background tasks avoid the nested setTimeout clamp while still
* allowing rendering and input between slices. Older browsers use a timer. */
function yieldCatalogTask() {
	const scheduler = globalThis.scheduler;
	return scheduler ? scheduler.postTask(() => {}, { priority: "background" }) : new Promise((resolve) => setTimeout(resolve, 0));
}
var MAX_KEYS = 8192;
var snapshots$1 = /* @__PURE__ */ new WeakMap();
/** Index only requested activity keys, never five aliases for every unwatched
* title. Positions sharing an alias remain separate Continue candidates. */
function request(videos, keys, directIds = []) {
	let cache = snapshots$1.get(videos);
	if (!cache) {
		cache = /* @__PURE__ */ new Map();
		snapshots$1.set(videos, cache);
	}
	const offsets = /* @__PURE__ */ new Map();
	const fresh = /* @__PURE__ */ new Map();
	const aliasKeys = new Set(keys);
	const directKeys = new Set(directIds);
	const wanted = /* @__PURE__ */ new Set([...aliasKeys, ...directKeys]);
	const missing = /* @__PURE__ */ new Set();
	const result = /* @__PURE__ */ new Map();
	for (const key of wanted) {
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
	}
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
	const finish = () => {
		for (const key of missing) cache.set(key, fresh.get(key));
		while (cache.size > MAX_KEYS) cache.delete(cache.keys().next().value);
		return result;
	};
	return {
		missing,
		visit,
		finish,
		offsets
	};
}
function activityLookup(videos, keys) {
	const pending = request(videos, keys);
	if (pending.missing.size) for (let index = 0; index < videos.length; index++) pending.visit(videos[index], index);
	return pending.finish();
}
/** First-time sidebar activity lookup yields as it scans. Cancelled scans
* never leave partial matches or false misses in the shared cache. */
async function activityLookupAsync(videos, keys, turn) {
	const pending = request(videos, keys);
	if (pending.missing.size) await forEachCatalogSlice(videos, pending.visit, turn);
	return pending.finish();
}
/** Continue retains every matching card, including titles sharing a stable
* URL after a reimport; callers still apply their ID/privacy filters. */
function activityCandidates(videos, keys, directIds = []) {
	const pending = request(videos, keys, directIds);
	if (pending.missing.size) for (let index = 0; index < videos.length; index++) pending.visit(videos[index], index);
	const matches = pending.finish();
	return [...new Set([...matches.values()].flat())].sort((a, b) => (pending.offsets.get(a) ?? 0) - (pending.offsets.get(b) ?? 0));
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
	const savedIds = /* @__PURE__ */ new Set([...Object.keys(favorites), ...Object.keys(likes)]);
	if (!savedIds.size) return [];
	const saved = [];
	for (const video of activityCandidates(videos, [], savedIds)) {
		if (!savedIds.has(video.id) || hidden[video.id] || hideDemo && video.isSample) continue;
		if (adult === adultIds.has(video.folderId)) saved.push(video);
	}
	return saved;
}
/** One active batch and one latest value per key, instead of retaining a
* promise chain containing every obsolete full snapshot. Cache-only users
* can also cap pending entries/bytes; durable user data uses no eviction. */
var CoalescedWriter = class {
	pending = /* @__PURE__ */ new Map();
	running;
	pendingWeight = 0;
	persist;
	options;
	constructor(persist, options = {}) {
		this.persist = persist;
		this.options = options;
	}
	write(key, value) {
		const weight = this.options.weight ?? (() => 1);
		if (weight(value) > (this.options.maxWeight ?? Infinity)) return this.idle();
		if (this.pending.has(key)) this.pendingWeight -= weight(this.pending.get(key));
		this.pending.delete(key);
		this.pending.set(key, value);
		this.pendingWeight += weight(value);
		while (this.pending.size > (this.options.maxPending ?? Infinity) || this.pendingWeight > (this.options.maxWeight ?? Infinity)) {
			const oldest = this.pending.entries().next().value;
			if (!oldest) break;
			this.pending.delete(oldest[0]);
			this.pendingWeight -= weight(oldest[1]);
		}
		if (!this.running) this.running = Promise.resolve().then(async () => {
			let failure;
			let failed = false;
			try {
				while (this.pending.size) {
					const rows = [];
					for (const [id, item] of this.pending) {
						rows.push([id, item]);
						this.pending.delete(id);
						this.pendingWeight -= weight(item);
						if (rows.length >= (this.options.batchSize ?? 64)) break;
					}
					try {
						await this.persist(rows);
					} catch (error) {
						if (!failed) failure = error;
						failed = true;
					}
				}
				if (failed) throw failure;
			} finally {
				this.pending.clear();
				this.pendingWeight = 0;
				this.running = void 0;
			}
		});
		return this.running;
	}
	idle() {
		return this.running ?? Promise.resolve();
	}
	snapshot() {
		return {
			pending: this.pending.size,
			pendingWeight: this.pendingWeight,
			writing: Boolean(this.running)
		};
	}
};
var lastActivityAt = 0;
var phase = "active";
var listeners$1 = /* @__PURE__ */ new Set();
function getSessionPhase() {
	return phase;
}
function subscribeSessionPhase(listener) {
	listeners$1.add(listener);
	return () => {
		listeners$1.delete(listener);
	};
}
function publish(next) {
	if (next === phase) return;
	phase = next;
	for (const listener of listeners$1) listener();
}
/** Visible artwork remains painted during idle; speculative/hidden artwork
* releases decoded surfaces until input or visibility returns. */
function allowCardArtwork(current, near, visible) {
	return near && current !== "hidden" && (current === "active" || visible);
}
function sessionIsActive(lastInput, now, visible = true) {
	return visible && now - lastInput < 3e5;
}
/** Automatic catalog/live refreshes stop after five minutes without input.
* Explicit pulls and ongoing playback are independent of this gate. */
function allowAutomaticRefresh(now = Date.now()) {
	return typeof document !== "undefined" && sessionIsActive(lastActivityAt, now, !document.hidden);
}
function trackSessionActivity(onIdle, onActive = () => {}) {
	lastActivityAt = Date.now();
	publish(document.hidden ? "hidden" : "active");
	let trimmed = false;
	const mark = () => {
		if (document.hidden) return;
		lastActivityAt = Date.now();
		publish("active");
		if (trimmed) onActive();
		trimmed = false;
	};
	const check = () => {
		publish(document.hidden ? "hidden" : allowAutomaticRefresh() ? "active" : "idle");
		if (!allowAutomaticRefresh() && !trimmed) {
			trimmed = true;
			onIdle();
		}
	};
	const visible = () => {
		if (document.hidden) check();
		else mark();
	};
	const events = [
		"pointerdown",
		"keydown",
		"wheel",
		"touchstart"
	];
	for (const event of events) window.addEventListener(event, mark, { passive: true });
	document.addEventListener("visibilitychange", visible);
	const timer = window.setInterval(check, 3e4);
	return () => {
		window.clearInterval(timer);
		for (const event of events) window.removeEventListener(event, mark);
		document.removeEventListener("visibilitychange", visible);
	};
}
/** Thin client for the optional loopback Realhub Companion (127.0.0.1 only). */
var COMPANION_ORIGIN = "http://127.0.0.1:43123";
async function companionFetch(path, init) {
	return fetch(`${COMPANION_ORIGIN}${path}`, {
		...init,
		signal: init?.signal ?? AbortSignal.timeout(1e4),
		headers: {
			...init?.body ? { "content-type": "application/json" } : {},
			...init?.headers ?? {}
		}
	});
}
async function companionHealth() {
	try {
		const response = await companionFetch("/health");
		if (!response.ok) return null;
		return await response.json();
	} catch {
		return null;
	}
}
/**
* Optional, local-only metadata inspection. The Companion independently
* verifies every path is inside its approved roots and accepts at most 12.
*/
async function companionInspectMedia(paths) {
	const boundedPaths = paths.filter((path) => typeof path === "string" && Boolean(path.trim())).slice(0, 12);
	if (!boundedPaths.length) return {
		ok: false,
		entries: [],
		error: "No approved local files were selected."
	};
	try {
		const response = await companionFetch("/inspect-media", {
			method: "POST",
			body: JSON.stringify({ paths: boundedPaths })
		});
		const data = await response.json();
		return {
			ok: Boolean(response.ok && data.ok),
			entries: Array.isArray(data.entries) ? data.entries : [],
			...data.note ? { note: data.note } : {},
			...data.error ? { error: data.error } : {}
		};
	} catch {
		return {
			ok: false,
			entries: [],
			error: "Companion offline. Start it on this computer, then try again."
		};
	}
}
async function companionSteamEpicGames(limit = 250) {
	try {
		const data = await (await companionFetch(`/games/steam-epic?limit=${limit}`)).json();
		return data.ok && Array.isArray(data.games) ? data.games : [];
	} catch {
		return [];
	}
}
async function companionExportLibraryPack(files) {
	try {
		return await (await companionFetch("/library-pack/export", {
			method: "POST",
			body: JSON.stringify({ files })
		})).json();
	} catch {
		return {
			ok: false,
			error: "Companion offline."
		};
	}
}
async function companionImportLibraryPack() {
	try {
		return await (await companionFetch("/library-pack/import")).json();
	} catch {
		return {
			ok: false,
			error: "Companion offline."
		};
	}
}
async function companionPutThumb(id, dataUrl) {
	try {
		const data = await (await companionFetch("/thumbs/put", {
			method: "POST",
			body: JSON.stringify({
				id,
				dataUrl
			})
		})).json();
		return Boolean(data.ok);
	} catch {
		return false;
	}
}
async function companionGetThumb(id) {
	try {
		const response = await companionFetch(`/thumbs/get?id=${encodeURIComponent(id)}`);
		if (!response.ok) return null;
		const data = await response.json();
		return data.ok && data.dataUrl?.startsWith("data:image") ? data.dataUrl : null;
	} catch {
		return null;
	}
}
async function companionArtworkAudit() {
	try {
		const response = await companionFetch("/thumbs/audit", { signal: AbortSignal.timeout(5e3) });
		if (!response.ok) return {
			ok: false,
			error: "Restart the updated Companion to enable the artwork audit."
		};
		return await response.json();
	} catch {
		return {
			ok: false,
			error: "Companion is unavailable. Start it with an approved thumbnail cache folder to inspect disk artwork."
		};
	}
}
async function companionListPrints(limit = 200) {
	try {
		const data = await (await companionFetch(`/prints/list?limit=${limit}`)).json();
		return {
			prints: data.ok && Array.isArray(data.prints) ? data.prints : [],
			printsRoot: data.printsRoot
		};
	} catch {
		return { prints: [] };
	}
}
async function companionReadPrint(path) {
	try {
		return await (await companionFetch(`/prints/file?path=${encodeURIComponent(path)}`)).json();
	} catch {
		return {
			ok: false,
			error: "Companion offline."
		};
	}
}
async function companionSavePrint(name, dataBase64, dir) {
	try {
		return await (await companionFetch("/prints/save", {
			method: "POST",
			body: JSON.stringify({
				name,
				dataBase64,
				dir
			})
		})).json();
	} catch {
		return {
			ok: false,
			error: "Companion offline."
		};
	}
}
async function companionSetAutostart(enabled) {
	try {
		return await (await companionFetch("/tray/autostart", {
			method: "POST",
			body: JSON.stringify({ enabled })
		})).json();
	} catch {
		return {
			ok: false,
			error: "Companion offline."
		};
	}
}
async function companionAckJobs() {
	try {
		await companionFetch("/jobs/ack", {
			method: "POST",
			body: "{}"
		});
	} catch {}
}
var mirroredPosters = /* @__PURE__ */ new Map();
var posterRetryAt = 0;
var posterMirror = new CoalescedWriter(async (rows) => {
	for (const [id, url] of rows) {
		if (!allowAutomaticRefresh() || Date.now() < posterRetryAt || mirroredPosters.get(id) === url) continue;
		try {
			const response = await companionFetch("/thumbs/cache-url", {
				method: "POST",
				body: JSON.stringify({
					id,
					url
				})
			});
			const data = await response.json();
			if (response.ok && data.ok) {
				mirroredPosters.delete(id);
				mirroredPosters.set(id, url);
				if (mirroredPosters.size > 256) mirroredPosters.delete(mirroredPosters.keys().next().value);
			} else posterRetryAt = Date.now() + 6e4;
		} catch {
			posterRetryAt = Date.now() + 6e4;
		}
	}
}, {
	batchSize: 2,
	maxPending: 96,
	maxWeight: 262144,
	weight: (url) => url.length * 2
});
async function companionCacheThumbUrl(id, url) {
	if (!id || !url || !allowAutomaticRefresh() || Date.now() < posterRetryAt) return false;
	if (mirroredPosters.get(id) === url) return true;
	await posterMirror.write(id, url);
	return mirroredPosters.get(id) === url;
}
function getCompanionMemorySnapshot() {
	return {
		posters: posterMirror.snapshot(),
		rememberedPosters: mirroredPosters.size
	};
}
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
			comments: card.remote.comments ?? saved.remote?.comments,
			thumbFallbacks: card.detailsOnDisk ? saved.remote?.thumbFallbacks ?? card.remote.thumbFallbacks : card.remote.thumbFallbacks ?? saved.remote?.thumbFallbacks
		} : saved.remote
	};
}
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
var DB_NAME = "reelcase";
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
async function restoreDurablePrefs() {
	const db = await openDb();
	try {
		const saved = await new Promise((resolve, reject) => {
			const req = db.transaction(ACTIVITY_STORE).objectStore(ACTIVITY_STORE).get("preferences");
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error);
		});
		if (saved) durablePrefs = saved;
	} finally {
		db.close();
	}
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
		const cacheRaw = rec.cache && typeof rec.cache === "object" ? rec.cache : null;
		const cache = cacheRaw && typeof cacheRaw.at === "number" && Number.isFinite(cacheRaw.at) && typeof cacheRaw.hits === "number" && Number.isFinite(cacheRaw.hits) && typeof cacheRaw.misses === "number" && Number.isFinite(cacheRaw.misses) && (cacheRaw.scope === "feed" || cacheRaw.scope === "catalog" || cacheRaw.scope === "uncached") ? {
			at: cacheRaw.at,
			hits: Math.max(0, Math.floor(cacheRaw.hits)),
			misses: Math.max(0, Math.floor(cacheRaw.misses)),
			scope: cacheRaw.scope
		} : void 0;
		if (!kind || !handle && !id) continue;
		out.push({
			id: id || `${kind === "twitch" ? "tw" : "yt"}:${handle}`,
			kind,
			handle: handle || id.replace(/^(?:yt|tw):/i, ""),
			title: title || handle || id,
			...typeof rec.channelId === "string" ? { channelId: rec.channelId } : {},
			...typeof rec.thumb === "string" ? { thumb: rec.thumb } : {},
			...typeof rec.live === "boolean" ? { live: rec.live } : {},
			...typeof rec.lastCheckedAt === "number" ? { lastCheckedAt: rec.lastCheckedAt } : {},
			...typeof rec.liveCheckedAt === "number" && Number.isFinite(rec.liveCheckedAt) ? { liveCheckedAt: rec.liveCheckedAt } : {},
			...typeof rec.newestPublishedAt === "number" ? { newestPublishedAt: rec.newestPublishedAt } : {},
			...typeof rec.newestVideoId === "string" && rec.newestVideoId ? { newestVideoId: rec.newestVideoId } : {},
			...typeof rec.catalogCursor === "string" && rec.catalogCursor.length > 0 && rec.catalogCursor.length <= 16384 ? { catalogCursor: rec.catalogCursor } : {},
			...typeof rec.catalogCheckedAt === "number" && Number.isFinite(rec.catalogCheckedAt) ? { catalogCheckedAt: rec.catalogCheckedAt } : {},
			...typeof rec.catalogExhaustedAt === "number" && Number.isFinite(rec.catalogExhaustedAt) ? { catalogExhaustedAt: rec.catalogExhaustedAt } : {},
			...typeof rec.lastResponseCount === "number" ? { lastResponseCount: rec.lastResponseCount } : {},
			...cache ? { cache } : {},
			...rec.lastProviderFailure && typeof rec.lastProviderFailure === "object" ? { lastProviderFailure: rec.lastProviderFailure } : {}
		});
	}
	return out;
}
function readFollowsLocal() {
	try {
		const raw = JSON.parse(localStorage.getItem(FOLLOWS_LS_KEY) ?? "null");
		if (Array.isArray(raw)) return normalizeFollowChannels(raw);
		if (raw && typeof raw === "object" && Array.isArray(raw.channels)) return normalizeFollowChannels(raw.channels);
	} catch {}
	return null;
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
	try {
		const db = await openDb();
		try {
			const saved = await new Promise((resolve, reject) => {
				const req = db.transaction(ACTIVITY_STORE).objectStore(ACTIVITY_STORE).get(FOLLOWS_IDB_KEY);
				req.onsuccess = () => resolve(req.result);
				req.onerror = () => reject(req.error);
			});
			if (Array.isArray(saved)) fromIdb = normalizeFollowChannels(saved);
			else if (saved && typeof saved === "object") fromIdb = normalizeFollowChannels(saved.channels);
		} finally {
			db.close();
		}
	} catch {}
	const fromLs = readFollowsLocal() ?? [];
	const primary = fromIdb.length >= fromLs.length ? fromIdb : fromLs;
	const secondary = primary === fromIdb ? fromLs : fromIdb;
	const seen = new Set(primary.map((row) => `${row.kind}:${row.handle.toLowerCase()}`));
	const merged = [...primary];
	for (const row of secondary) {
		const key = `${row.kind}:${row.handle.toLowerCase()}`;
		if (seen.has(key)) continue;
		seen.add(key);
		merged.push(row);
	}
	durableFollows = merged;
	return merged;
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
	} catch {}
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
	const resumeKeys = Object.keys(resumeProgress);
	const slimResume = {};
	for (const key of resumeKeys.slice(-200)) slimResume[key] = resumeProgress[key];
	writeJsonLocal(DURABLE_RESUME_LS_KEY, {
		progress: {},
		resumeProgress: slimResume,
		savedAt: payload.savedAt
	});
	putActivityBlob(DURABLE_RESUME_IDB_KEY, payload).catch(() => void 0);
}
async function restoreDurableResume() {
	if (typeof window === "undefined") return {
		progress: {},
		resumeProgress: {}
	};
	let fromIdb;
	try {
		fromIdb = await getActivityBlob(DURABLE_RESUME_IDB_KEY);
	} catch {}
	const fromLs = readJsonLocal(DURABLE_RESUME_LS_KEY);
	return {
		progress: {
			...normalizeProgressMap(fromLs?.progress),
			...normalizeProgressMap(fromIdb?.progress)
		},
		resumeProgress: {
			...normalizeProgressMap(fromLs?.resumeProgress),
			...normalizeProgressMap(fromIdb?.resumeProgress)
		}
	};
}
function saveDurableMarks(viewCounts, cameCounts) {
	if (typeof window === "undefined") return;
	const payload = {
		viewCounts: asCountMap(viewCounts),
		cameCounts: asCountMap(cameCounts),
		savedAt: Date.now()
	};
	writeJsonLocal(DURABLE_MARKS_LS_KEY, payload);
	putActivityBlob(DURABLE_MARKS_IDB_KEY, payload).catch(() => void 0);
}
async function restoreDurableMarks() {
	if (typeof window === "undefined") return {
		viewCounts: {},
		cameCounts: {}
	};
	let fromIdb;
	try {
		fromIdb = await getActivityBlob(DURABLE_MARKS_IDB_KEY);
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
		savedAt: Date.now()
	};
	writeJsonLocal(DURABLE_SHELVES_LS_KEY, payload);
	putActivityBlob(DURABLE_SHELVES_IDB_KEY, payload).catch(() => void 0);
}
async function restoreDurableShelves() {
	if (typeof window === "undefined") return {
		favorites: [],
		likes: [],
		authoritative: false
	};
	let fromIdb;
	try {
		fromIdb = await getActivityBlob(DURABLE_SHELVES_IDB_KEY);
	} catch {}
	const fromLs = readJsonLocal(DURABLE_SHELVES_LS_KEY);
	return recoverSavedShelves(fromIdb, fromLs);
}
function saveDurableLinks(links) {
	if (typeof window === "undefined") return;
	const payload = {
		links: normalizeLinks(links),
		savedAt: Date.now()
	};
	writeJsonLocal(DURABLE_LINKS_LS_KEY, {
		links: payload.links.slice(0, 200),
		savedAt: payload.savedAt
	});
	putActivityBlob(DURABLE_LINKS_IDB_KEY, payload).catch(() => void 0);
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
	writeJsonLocal(DURABLE_FEEDBACK_LS_KEY, feedback);
	putActivityBlob(DURABLE_FEEDBACK_IDB_KEY, payload).catch(() => void 0);
}
async function restoreDurableFeedback() {
	if (typeof window === "undefined") return null;
	let fromIdb;
	try {
		fromIdb = await getActivityBlob(DURABLE_FEEDBACK_IDB_KEY);
	} catch {}
	const fromLs = readJsonLocal(DURABLE_FEEDBACK_LS_KEY);
	if (!fromIdb && !fromLs) return null;
	const pick = (a, b) => ({
		...b ?? {},
		...a ?? {}
	});
	return {
		ratings: pick(fromIdb?.ratings, fromLs?.ratings),
		ratingHistory: pick(fromIdb?.ratingHistory, fromLs?.ratingHistory),
		notes: pick(fromIdb?.notes, fromLs?.notes),
		creatorRatings: pick(fromIdb?.creatorRatings, fromLs?.creatorRatings),
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
var TAG_EDITS_KEY = "reelcase.tag-edits.v1";
var HISTORY_PENDING_KEY = "reelcase.history-pending.v1";
function readPending(key, fallback) {
	try {
		return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
	} catch {
		return fallback;
	}
}
function saveTagEdit(id, tags) {
	const edits = readPending(TAG_EDITS_KEY, {});
	edits[id] = tags;
	try {
		localStorage.setItem(TAG_EDITS_KEY, JSON.stringify(edits));
	} catch {}
}
function restoreTagEdits(tags) {
	return {
		...tags,
		...readPending(TAG_EDITS_KEY, {})
	};
}
/** Small synchronous mirror so a just-saved manual lock survives a tab close. */
function saveMetadataEdit(id, metadata) {
	const edits = readPending(TAG_PROVENANCE_EDITS_KEY, {});
	edits[id] = metadata;
	try {
		localStorage.setItem(TAG_PROVENANCE_EDITS_KEY, JSON.stringify(edits));
	} catch {}
}
function restoreMetadataEdits(metadata) {
	return {
		...metadata,
		...readPending(TAG_PROVENANCE_EDITS_KEY, {})
	};
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
async function saveDirHandle(entry) {
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, "readwrite");
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
async function deleteDirHandle(id) {
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction([
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
		const tx = db.transaction(VIDEO_STORE, "readwrite");
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
async function putVideosChunked(db, videos) {
	for (let i = 0; i < videos.length; i += IDB_WRITE_CHUNK) {
		const slice = videos.slice(i, i + IDB_WRITE_CHUNK);
		await new Promise((resolve, reject) => {
			const tx = db.transaction(VIDEO_STORE, "readwrite");
			const store = tx.objectStore(VIDEO_STORE);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
			tx.onabort = () => reject(tx.error ?? /* @__PURE__ */ new Error("Catalog save was interrupted. Please retry."));
			try {
				for (const video of slice) {
					if (video.isSample) continue;
					const previous = store.get(video.id);
					previous.onsuccess = () => {
						try {
							store.put(withCatalogDetails(video, previous.result));
						} catch (error) {
							tx.abort();
							reject(error);
						}
					};
				}
			} catch (error) {
				tx.abort();
				reject(error);
			}
		});
	}
}
/** Replace a folder atomically: a failed write must retain its previous catalog. */
async function saveFolderVideos(folderId, videos) {
	if (videos.some((video) => video.folderId !== folderId)) throw new Error("Cannot save catalog entries belonging to another folder.");
	const db = await openDb();
	try {
		await new Promise((resolve, reject) => {
			const tx = db.transaction(VIDEO_STORE, "readwrite");
			const store = tx.objectStore(VIDEO_STORE);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
			tx.onabort = () => reject(tx.error ?? /* @__PURE__ */ new Error("Catalog save was interrupted. Your previous catalog is preserved."));
			const request = store.index("folderId").openCursor(IDBKeyRange.only(folderId));
			request.onsuccess = () => {
				try {
					const cursor = request.result;
					if (cursor) {
						cursor.delete();
						cursor.continue();
						return;
					}
					for (const video of videos) if (!video.isSample) store.put(video);
				} catch (error) {
					tx.abort();
					reject(error);
				}
			};
		});
	} finally {
		db.close();
	}
}
/** Append/upsert catalog rows without rewriting the whole folder (batched ingest). */
async function appendCatalogVideos(videos) {
	if (!videos.length) return;
	const db = await openDb();
	try {
		await putVideosChunked(db, videos);
	} finally {
		db.close();
	}
}
async function clearFolderVideos(folderId) {
	const db = await openDb();
	await clearFolderVideosTx(db, folderId);
	db.close();
}
async function loadCatalogVideos() {
	const db = await openDb();
	try {
		const rows = [];
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
			for (const video of page.rows) if (!video.isSample) rows.push(catalogCard(video));
			if (page.keys.length < 512) break;
			after = page.keys.at(-1);
			await new Promise((resolve) => setTimeout(resolve, 0));
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
	const db = await openDb();
	try {
		return await new Promise((resolve, reject) => {
			const request = db.transaction(THUMB_STORE, "readonly").objectStore(THUMB_STORE).get(id);
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	} finally {
		db.close();
	}
}
async function loadThumbCache(limit = 120) {
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
				if (size <= 8388608 - bytes) {
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
async function loadRemoteSnapshot() {
	const db = await openDb();
	try {
		const legacy = await new Promise((resolve, reject) => {
			const tx = db.transaction("remote-cache", "readonly");
			const store = tx.objectStore("remote-cache");
			const currentReq = store.get("snapshot");
			const metaReq = store.get("meta");
			tx.oncomplete = () => resolve({
				current: currentReq.result,
				meta: metaReq.result
			});
			tx.onerror = () => reject(tx.error);
		});
		const videos = /* @__PURE__ */ new Map();
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
			for (const video of page.rows) if (video?.id) videos.set(video.id, catalogCard(video));
			if (page.keys.length < 512) break;
			afterKey = page.keys[page.keys.length - 1];
			await new Promise((resolve) => setTimeout(resolve, 0));
		}
		if (legacy.current?.videos.length) {
			const missing = legacy.current.videos.filter((video) => !videos.has(video.id));
			let migrated = false;
			try {
				await saveRemoteSnapshot({
					...legacy.current,
					videos: missing
				}, true);
				migrated = true;
			} catch {}
			for (const video of missing) videos.set(video.id, migrated ? catalogCard(video) : video);
		}
		const meta = legacy.meta ?? legacy.current;
		return meta ? {
			videos: [...videos.values()],
			folders: meta.folders,
			checkedAt: meta.checkedAt
		} : void 0;
	} finally {
		db.close();
	}
}
async function saveRemoteSnapshot(snapshot, complete = false) {
	const db = await openDb();
	try {
		await new Promise((resolve, reject) => {
			const tx = db.transaction("remote-cache", "readwrite");
			tx.objectStore("remote-cache").put({
				folders: snapshot.folders,
				checkedAt: snapshot.checkedAt
			}, "meta");
			tx.oncomplete = () => resolve();
			tx.onerror = tx.onabort = () => reject(tx.error);
		});
		for (let i = 0; i < snapshot.videos.length; i += IDB_WRITE_CHUNK) await new Promise((resolve, reject) => {
			const tx = db.transaction("remote-cache", "readwrite");
			const store = tx.objectStore("remote-cache");
			for (const video of snapshot.videos.slice(i, i + IDB_WRITE_CHUNK)) {
				const key = `video:${video.id}`, previous = store.get(key);
				previous.onsuccess = () => {
					try {
						store.put(withCatalogDetails(video, previous.result), key);
					} catch (error) {
						tx.abort();
						reject(error);
					}
				};
			}
			tx.oncomplete = () => resolve();
			tx.onerror = tx.onabort = () => reject(tx.error);
		});
		if (complete) await new Promise((resolve, reject) => {
			const tx = db.transaction("remote-cache", "readwrite");
			tx.objectStore("remote-cache").delete("snapshot");
			tx.oncomplete = () => resolve();
			tx.onerror = tx.onabort = () => reject(tx.error);
		});
	} finally {
		db.close();
	}
}
async function removeRemoteSnapshotVideos(ids) {
	if (!ids.length) return;
	const db = await openDb();
	try {
		for (let i = 0; i < ids.length; i += IDB_WRITE_CHUNK) await new Promise((resolve, reject) => {
			const tx = db.transaction("remote-cache", "readwrite");
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
			req.onsuccess = () => resolve(req.result);
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
			tx.objectStore(ACTIVITY_STORE).put(snapshot, "primary");
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
	const starred = raw.starred ?? [];
	const favorites = raw.favorites ?? starred;
	const sort = raw.sort ?? "added";
	return {
		favorites,
		likes: raw.likes ?? [],
		tags: raw.tags ?? {},
		metadataProvenance: raw.metadataProvenance && typeof raw.metadataProvenance === "object" ? raw.metadataProvenance : {},
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
	const pending = putActivityBlob("preferences", prefs);
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
var EMPTY_WATCH_TIME = {
	preview: 0,
	fullscreen: 0
};
/** Explicit dislike, neutral, then progressively stronger positive signals. */
function ratingPreference(rating) {
	return rating === 1 ? -3 : rating === 2 ? 0 : rating >= 3 ? Math.min(3, rating - 2) : 0;
}
function watchTimeScore(time) {
	return Math.min(12, Math.floor(time.preview / 30) + Math.floor(time.fullscreen / 90) * 2 + Math.floor((time.previewEstimated ?? 0) / 90) + Math.floor((time.fullscreenEstimated ?? 0) / 180));
}
var KEY$2 = "reelcase.media-feedback.v1";
var cached = null;
var changeTimer;
var persistTimer$1;
var cancelPersist;
var lastRatingQueueMs = 0;
var lastPersistMs = 0;
var pendingWrites = 0;
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
async function rankingFeedbackSnapshot() {
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
	const feedback = read();
	return {
		ratings: {
			...Object.fromEntries(legacyRatings),
			...feedback.ratings
		},
		heartedTags: Object.keys(feedback.tagLikes),
		historicTags: Object.keys(feedback.tagHeartHistory)
	};
}
var feedbackHydrated = false;
function read() {
	if (cached) return cached;
	try {
		const saved = JSON.parse(localStorage.getItem(KEY$2) ?? "{}");
		cached = {
			ratings: saved.ratings ?? {},
			ratingHistory: saved.ratingHistory ?? {},
			notes: saved.notes ?? {},
			creatorRatings: saved.creatorRatings ?? {},
			creatorLikes: saved.creatorLikes ?? {},
			tagLikes: saved.tagLikes ?? {},
			tagHeartHistory: saved.tagHeartHistory ?? {},
			watchTime: saved.watchTime ?? {}
		};
	} catch {
		cached = {
			ratings: {},
			ratingHistory: {},
			notes: {},
			creatorRatings: {},
			creatorLikes: {},
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
	cached = {
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
	notifyChange();
}
function persist() {
	persistTimer$1 = void 0;
	cancelPersist = void 0;
	if (!pendingWrites || !cached) return;
	const started = typeof performance !== "undefined" ? performance.now() : Date.now();
	try {
		saveDurableFeedback(cached);
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
	if (typeof window === "undefined") return;
	pendingWrites = 1;
	if (persistTimer$1) window.clearTimeout(persistTimer$1);
	cancelPersist?.();
	cancelPersist = void 0;
	queuePersist(90);
}
function writeWatchTime(next) {
	cached = next;
	if (typeof window === "undefined") return;
	pendingWrites = 1;
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
	const value = read().ratings[id];
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
	const next = read();
	next.ratings[id] = Math.max(0, Math.min(5, Math.round(rating)));
	next.ratingHistory[id] = {
		rating: next.ratings[id],
		updatedAt: Date.now()
	};
	legacyRatings.set(id, next.ratings[id]);
	legacyKeys().add(id);
	recordRatingForStreak(id, next.ratings[id]);
	write(next);
	notifyChange();
	lastRatingQueueMs = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - started);
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
	const next = read();
	next.creatorRatings[creatorKey(name)] = Math.max(0, Math.min(5, Math.round(rating)));
	write(next);
	notifyChange();
}
function creatorIsLiked(name) {
	return Boolean(read().creatorLikes[creatorKey(name)]);
}
function toggleCreatorLike(name) {
	const next = read();
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
		version: 4,
		...read()
	};
}
function getNote(id) {
	const value = read().notes[id];
	if (typeof value === "string") return value;
	try {
		return localStorage.getItem(`reelcase.note.${id}`) ?? "";
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
	if (partial.ratings) Object.assign(next.ratings, partial.ratings);
	if (partial.ratingHistory) Object.assign(next.ratingHistory, partial.ratingHistory);
	if (partial.notes) Object.assign(next.notes, partial.notes);
	if (partial.creatorRatings) Object.assign(next.creatorRatings, partial.creatorRatings);
	if (partial.creatorLikes) Object.assign(next.creatorLikes, partial.creatorLikes);
	if (partial.tagLikes) Object.assign(next.tagLikes, partial.tagLikes);
	if (partial.tagHeartHistory) Object.assign(next.tagHeartHistory, partial.tagHeartHistory);
	if (partial.watchTime) Object.assign(next.watchTime, partial.watchTime);
	write(next);
	notifyChange();
	flush$1();
}
var KEY$1 = "reelcase.adult-archive-cursors.v1";
function readRaw() {
	try {
		const raw = localStorage.getItem(KEY$1);
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === "object" ? parsed : {};
	} catch {
		return {};
	}
}
function writeRaw(map) {
	try {
		localStorage.setItem(KEY$1, JSON.stringify(map));
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
				...raw[key] ?? {
					page: 1,
					query,
					order
				},
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
/** Cache each scope independently using immutable store slices, not root state.
* Playback and UI updates must not invalidate catalog-sized computations. */
function memoizeSelector(compute, keys) {
	const scopes = /* @__PURE__ */ new Map();
	const inputsFor = (state) => {
		return (typeof keys === "function" ? keys(state) : keys).flatMap((key) => [key, state[key]]);
	};
	const peek = (state, adult = false) => {
		const inputs = inputsFor(state);
		const cached = scopes.get(adult);
		if (cached && inputs.length === cached.inputs.length && inputs.every((value, index) => Object.is(value, cached.inputs[index]))) return cached.result;
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
	return Object.assign(select, {
		peek,
		clear: () => scopes.clear(),
		evictStale
	});
}
/** A large user pull consists of bounded requests, never one huge response.
* Collect once per provider so each page doesn't rebuild the entire library. */
async function walkAdultPull(target, page, offset, request, check) {
	const rows = /* @__PURE__ */ new Map();
	let latest, error;
	const maxRequests = Math.min(100, Math.max(8, Math.ceil(target / 100) * 2));
	for (let attempt = 0; attempt < maxRequests && rows.size < target; attempt++) {
		await check();
		let result;
		try {
			result = await request(page, offset, Math.min(400, target - rows.size));
		} catch (failure) {
			if (!latest) throw failure;
			error = failure;
			break;
		}
		latest = result;
		for (const row of result.videos) rows.set(row.id, row);
		if (result.nextPage == null || result.nextPage === page && result.nextOffset === offset) break;
		page = result.nextPage;
		offset = result.nextOffset;
	}
	return {
		latest,
		videos: [...rows.values()],
		error
	};
}
/** Independent durable slices must not all be rewritten by a playback tick.
* Inputs are immutable references; a failed synchronous enqueue stays dirty. */
var SliceWriter = class {
	saved = /* @__PURE__ */ new Map();
	write(key, inputs, save) {
		const previous = this.saved.get(key);
		if (previous && previous.length === inputs.length && inputs.every((value, index) => Object.is(value, previous[index]))) return false;
		save();
		this.saved.set(key, inputs);
		return true;
	}
};
/**
* Local UI identifiers must work on HTTP/LAN pages and older embedded
* browsers, where Web Crypto can exist without randomUUID(). They identify
* ephemeral browser state only; they are never credentials or security keys.
*/
function createLocalId(prefix = "") {
	const webCrypto = typeof globalThis !== "undefined" ? globalThis.crypto : void 0;
	if (typeof webCrypto?.randomUUID === "function") return `${prefix}${webCrypto.randomUUID()}`;
	const bytes = /* @__PURE__ */ new Uint8Array(12);
	if (typeof webCrypto?.getRandomValues === "function") {
		webCrypto.getRandomValues(bytes);
		return `${prefix}${[...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
	}
	return `${prefix}${`${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`.replace(/[^a-z0-9]/gi, "").slice(0, 24)}`;
}
function createShortLocalId(prefix = "", length = 12) {
	return `${prefix}${createLocalId().replaceAll("-", "").slice(0, length)}`;
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
var cache$1 = createPreviewUrlCache(2400);
var loaded = false;
var dirty = false;
var timer;
var cancelFlush = () => {};
function load() {
	if (loaded || typeof localStorage === "undefined") return;
	loaded = true;
	try {
		cache$1.hydrate(JSON.parse(localStorage.getItem(LS_KEY) ?? "{}"));
	} catch {}
}
function flush() {
	cancelFlush();
	clearTimeout(timer);
	timer = void 0;
	if (!dirty || typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(LS_KEY, JSON.stringify(cache$1.serialize()));
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
	if (!cache$1.remember(id, {
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
		cache$1.clear();
	};
	window.addEventListener("storage", onStorage);
	window.addEventListener("pagehide", flush);
}
/** Fill missing/broken incoming artwork from the durable URL cache. */
function applyCachedAdultUrls(videos) {
	load();
	return videos.map((video) => {
		const cached = cache$1.get(video.id);
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
/** Provider IDs are case-sensitive. Titles and thumbnail URLs are never identity. */
function youtubeVideoKey(video) {
	if (video.remote?.kind !== "youtube") return void 0;
	const id = video.remote.videoId?.trim() || (/^yt:[A-Za-z0-9_-]{11}$/.test(video.id) ? video.id.slice(3) : "");
	return id ? `yt:${id}` : void 0;
}
var indexes = /* @__PURE__ */ new WeakMap();
var latestIndex;
/** Reuse an already-built creator index even when the caller holds the full
* catalog and the shelf indexed its YouTube slice. Never retain an old index. */
function peekYoutubeOwner(videos, video) {
	const index = indexes.get(videos) ?? latestIndex?.deref();
	if (!index || video.remote?.kind !== "youtube") return [];
	const rows = index.byChannel.get(video.remote.channelId ?? "") ?? index.bySource.get(video.folderId) ?? [];
	return rows.some((row) => row === video) ? rows : [];
}
/** Shared by coverage, creator panels, scheduling and diagnostics. A repeated
* video imported through a playlist keeps an edge to every saved source. */
function youtubeSourceIndex(videos) {
	const cached = indexes.get(videos);
	if (cached) {
		latestIndex = new WeakRef(cached);
		return cached;
	}
	const bySource = /* @__PURE__ */ new Map(), byChannel = /* @__PURE__ */ new Map();
	const seen = /* @__PURE__ */ new Set(), duplicates = /* @__PURE__ */ new Set();
	let duplicateRows = 0;
	const add = (map, key, video) => {
		const rows = map.get(key);
		if (rows) rows.push(video);
		else map.set(key, [video]);
	};
	for (const video of videos) {
		if (video.remote?.kind !== "youtube" || video.isSample) continue;
		const key = youtubeVideoKey(video) ?? video.id;
		if (seen.has(key)) {
			duplicateRows++;
			duplicates.add(key);
			continue;
		}
		seen.add(key);
		if (video.remote.live) continue;
		for (const source of /* @__PURE__ */ new Set([video.folderId, ...video.remote.sourceIds ?? []])) add(bySource, source, video);
		if (video.remote.channelId) add(byChannel, video.remote.channelId, video);
	}
	const result = {
		bySource,
		byChannel,
		distinctVideos: seen.size,
		duplicateRows,
		duplicateGroups: duplicates.size
	};
	indexes.set(videos, result);
	latestIndex = new WeakRef(result);
	return result;
}
function youtubeVideosForSource(index, source) {
	const direct = index.bySource.get(source.id) ?? [];
	if (source.id.startsWith("ytpl:")) return direct;
	const channelId = source.channelId || (/^yt:UC[A-Za-z0-9_-]{20,}$/.test(source.id) ? source.id.slice(3) : "");
	const channel = channelId ? index.byChannel.get(channelId) ?? [] : [];
	if (!channel.length || channel === direct) return direct;
	if (!direct.length) return channel;
	const rows = new Map(direct.map((video) => [youtubeVideoKey(video) ?? video.id, video]));
	for (const video of channel) rows.set(youtubeVideoKey(video) ?? video.id, video);
	return [...rows.values()];
}
function youtubeSourceCounts(videos, sources) {
	const index = youtubeSourceIndex(videos);
	return new Map(sources.map((source) => [source.id, youtubeVideosForSource(index, source).length]));
}
/** One stored card, multiple source edges. Keep its primary folder stable so
* refreshes of overlapping playlists cannot steal a creator's whole archive. */
function retainYoutubeSources(previous, incoming) {
	if (previous?.remote?.kind !== "youtube" || incoming.remote?.kind !== "youtube") return incoming;
	const oldSources = previous.remote.sourceIds ?? [previous.folderId];
	const nextSources = /* @__PURE__ */ new Set([
		...oldSources,
		previous.folderId,
		incoming.folderId,
		...incoming.remote.sourceIds ?? []
	]);
	const sourcesUnchanged = oldSources.length === nextSources.size && oldSources.every((id) => nextSources.has(id));
	if (sourcesUnchanged && incoming.folderId === previous.folderId && incoming.id === previous.id) return previous.remote.sourceIds && incoming.remote.sourceIds !== previous.remote.sourceIds ? {
		...incoming,
		remote: {
			...incoming.remote,
			sourceIds: previous.remote.sourceIds
		}
	} : incoming;
	return {
		...incoming,
		id: previous.id,
		folderId: previous.folderId,
		remote: {
			...incoming.remote,
			sourceIds: sourcesUnchanged ? previous.remote.sourceIds : [...nextSources]
		}
	};
}
function sameList(left, right) {
	return left === right || left?.length === right?.length && left?.every((value, index) => value === right?.[index]);
}
/** Avoid allocating two JSON strings for every card in a large refresh. */
function sameRemote(left, right) {
	if (left === right) return true;
	if (!left || !right) return left === right;
	return left.kind === right.kind && left.videoId === right.videoId && left.channelId === right.channelId && left.channelName === right.channelName && left.live === right.live && left.viewers === right.viewers && left.observedAt === right.observedAt && left.views === right.views && left.embedUrl === right.embedUrl && left.watchUrl === right.watchUrl && left.previewUrl === right.previewUrl && sameList(left.sourceKinds, right.sourceKinds) && sameList(left.sourceIds, right.sourceIds) && sameList(left.thumbFallbacks, right.thumbFallbacks) && left.comments === right.comments;
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
	incoming = retainYoutubeSources(previous, incoming);
	if (!previous?.remote || !incoming.remote) return incoming;
	const channelName = incoming.remote.channelName?.trim() || previous.remote.channelName?.trim();
	const comments = incoming.remote.comments?.length ? incoming.remote.comments : previous.remote.comments;
	const keepsName = Boolean(channelName && channelName !== incoming.remote.channelName);
	const keepsComments = Boolean(comments?.length && comments !== incoming.remote.comments);
	const keepsPublished = incoming.remote.kind === "youtube" && incoming.addedAt === 0 && repairLegacyYoutubeDate(previous).addedAt > 0;
	if (!keepsName && !keepsComments && !keepsPublished) return incoming;
	return {
		...incoming,
		...keepsPublished ? { addedAt: previous.addedAt } : {},
		remote: {
			...incoming.remote,
			...keepsName ? { channelName } : {},
			...keepsComments ? { comments } : {}
		}
	};
}
function sameOrder(left, right) {
	return left.length === right.length && left.every((video, index) => video === right[index]);
}
var remoteVideoIndexes = /* @__PURE__ */ new WeakMap();
/** Share one id index among accounting, merging, and offline cleanup for a snapshot. */
function remoteVideoIndex(videos) {
	const cached = remoteVideoIndexes.get(videos);
	if (cached) return cached;
	const index = /* @__PURE__ */ new Map();
	for (const video of videos) {
		index.set(video.id, video);
		const key = youtubeVideoKey(video);
		if (key && !index.has(key)) index.set(key, video);
	}
	remoteVideoIndexes.set(videos, index);
	return index;
}
/** Additive archive merge using an index shared across a multi-creator sweep. */
function mergeRemoteCatalog(existing, incoming, positions, mergedIncoming) {
	let merged = existing;
	for (const video of incoming) {
		const key = youtubeVideoKey(video);
		const index = positions.get(video.id) ?? (key ? positions.get(key) : void 0);
		const previous = index === void 0 ? void 0 : merged[index];
		let next = retainDurableRemoteFields(previous, video);
		if (previous?.remote?.live && next.remote?.live && (next.remote.observedAt ?? 0) < (previous.remote.observedAt ?? 0)) next = previous;
		else if (previous && sameVideo(previous, next)) next = previous;
		if (index === void 0) {
			if (merged === existing) merged = existing.slice();
			positions.set(next.id, merged.length);
			if (key) positions.set(key, merged.length);
			merged.push(next);
		} else if (next !== previous) {
			if (merged === existing) merged = existing.slice();
			merged[index] = next;
		}
		mergedIncoming.push(next);
	}
	return merged;
}
/**
* Merge a provider refresh without letting a shallow public response erase a
* known remote archive. Twitch's public archive endpoint can legitimately
* return a partial window (or no rows while it is rate-limited), and routine
* YouTube refreshes intentionally return only uploads newer than the saved
* feed cursor. Archive rows are therefore additive per channel. Fresh rows
* still win by id, and stale live cards are turned offline when their channel
* has checked successfully.
*
* The original catalog order is retained for every existing card. This is
* more than cosmetic: Zustand shallow selectors can now skip a shelf render
* when a response repeats its prior rows, while a single changed card keeps
* its neighbours' artwork and focus identity intact.
*/
function mergeRemoteRefresh(existing, incoming, refreshedIds, savedIds, options) {
	const refreshed = new Set(refreshedIds);
	const existingById = options?.index ?? remoteVideoIndex(existing);
	const fresh = /* @__PURE__ */ new Map();
	for (const incomingVideo of incoming) {
		const previous = existingById.get(incomingVideo.id) ?? existingById.get(youtubeVideoKey(incomingVideo) ?? incomingVideo.id);
		let next = retainDurableRemoteFields(previous, incomingVideo);
		const incomingObservation = next.remote?.observedAt ?? 0;
		const previousObservation = previous?.remote?.observedAt ?? 0;
		if (previous?.remote?.live && next.remote?.live && incomingObservation < previousObservation) next = previous;
		else if (previous && sameVideo(previous, next)) next = previous;
		fresh.set(next.id, next);
	}
	const merged = [];
	for (const video of existing) {
		const next = fresh.get(video.id);
		if (next) {
			merged.push(next);
			fresh.delete(video.id);
			continue;
		}
		if (!video.remote || !refreshed.has(video.folderId)) {
			merged.push(video);
			continue;
		}
		if (video.remote.live) {
			merged.push({
				...video,
				tagline: "Offline · saved channel",
				remote: {
					...video.remote,
					live: false
				}
			});
			options?.staleLiveIds?.push(video.id);
			continue;
		}
		if (savedIds.has(video.id)) {
			merged.push(video);
			continue;
		}
		if ((video.remote.kind === "twitch" || video.remote.kind === "youtube") && !video.remote.live) {
			merged.push(video);
			continue;
		}
		if (video.folderId.startsWith("ytpl:")) {
			merged.push(video);
			continue;
		}
	}
	merged.push(...fresh.values());
	return sameOrder(existing, merged) ? existing : merged;
}
function canonicalFollowHandle(kind, raw) {
	if (kind === "youtube") try {
		const url = new URL(raw.trim());
		const playlist = url.searchParams.get("list");
		if (/(^|\.)youtube\.com$/i.test(url.hostname) && playlist && /^[a-z0-9_-]{10,80}$/i.test(playlist)) return `playlist:${playlist}`;
	} catch {}
	const value = raw.trim().replaceAll("\\_", "_").toLowerCase();
	if (kind === "twitch") return (value.match(/(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([^/?#]+)/i)?.[1] ?? value.replace(/^tw:/, "")).replace(/^@/, "").replace(/[^a-z0-9_]/g, "");
	return (value.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:@|channel\/)?([^/?#]+)/i)?.[1] ?? value).replace(/^@/, "").replace(/[^a-z0-9_-]/g, "");
}
/** Provider refreshes can resolve an old handle to a channel ID or rename it.
* Both identities must be unique; the newest supplied row retains precedence. */
function dedupeFollows(rows) {
	const ids = /* @__PURE__ */ new Set(), handles = /* @__PURE__ */ new Set(), channels = /* @__PURE__ */ new Set();
	const unique = [];
	for (const row of rows) {
		const id = `${row.kind}:${row.id}`;
		const handle = canonicalFollowHandle(row.kind, row.handle || row.id);
		const key = `${row.kind}:${handle}`;
		const channel = row.kind === "youtube" && !row.id.startsWith("ytpl:") && row.channelId ? row.channelId : "";
		if (ids.has(id) || handle && handles.has(key) || channel && channels.has(channel)) continue;
		ids.add(id);
		if (handle) handles.add(key);
		if (channel) channels.add(channel);
		unique.push(row);
	}
	return unique.length === rows.length ? rows : unique;
}
var snapshots = /* @__PURE__ */ new WeakMap();
var MAX_REQUESTED = 128;
function rememberVideo(videos, video) {
	let cache = snapshots.get(videos);
	if (!cache) {
		cache = /* @__PURE__ */ new Map();
		snapshots.set(videos, cache);
	}
	cache.set(video.id, video);
	while (cache.size > MAX_REQUESTED) cache.delete(cache.keys().next().value);
}
function lookupVideos(videos, ids) {
	let cache = snapshots.get(videos);
	if (!cache) {
		cache = /* @__PURE__ */ new Map();
		snapshots.set(videos, cache);
	}
	let missing = new Set(ids.filter((id) => !cache.has(id)));
	if (missing.size) {
		if (cache.size + missing.size > MAX_REQUESTED) {
			cache.clear();
			missing = new Set(ids);
		}
		for (const video of videos) {
			if (!missing.delete(video.id)) continue;
			cache.set(video.id, video);
			if (!missing.size) break;
		}
		for (const id of missing) cache.set(id, void 0);
	}
	const found = ids.map((id) => cache.get(id));
	while (cache.size > MAX_REQUESTED) cache.delete(cache.keys().next().value);
	return found;
}
function lookupVideo(videos, id) {
	if (!id) return void 0;
	const cache = snapshots.get(videos);
	return cache?.has(id) ? cache.get(id) : lookupVideos(videos, [id])[0];
}
var TOPICS = /* @__PURE__ */ new Set([
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
var aliases = {
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
function canonicalTopic(tag) {
	const clean = tag.trim().toLowerCase().replace(/^#/, "").replace(/\s+/g, "-");
	return TOPICS.has(clean) ? clean : aliases[clean];
}
var isTopicTag = (tag) => Boolean(canonicalTopic(tag));
var rules = [
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
var cache = /* @__PURE__ */ new WeakMap();
var EMPTY = [];
function resolve(video, tags = EMPTY) {
	const previous = cache.get(video);
	if (previous?.tags === tags) return previous;
	const links = /* @__PURE__ */ new Map();
	for (const tag of tags) {
		const topic = canonicalTopic(tag);
		if (topic) links.set(topic, {
			topic,
			reason: `Saved tag: ${tag}`,
			saved: true
		});
	}
	const text = `${video.name.slice(0, 500)} ${video.genre ?? ""}`;
	for (const [topic, pattern] of rules) {
		const match = text.match(pattern);
		if (match && !links.has(topic)) links.set(topic, {
			topic,
			reason: `Title/category: ${match[0]}`,
			saved: false
		});
	}
	const result = {
		tags,
		links: [...links.values()],
		topics: [...links.keys()]
	};
	cache.set(video, result);
	return result;
}
var topicEvidence = (video, tags) => resolve(video, tags).links;
var topicsForVideo = (video, tags) => resolve(video, tags).topics;
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
/** Idle normalization may overlap a manual edit or a pull. Commit sparse
* patches only while their original values still match; clone each ledger once. */
function applyCachedTagPatches(tags, provenance, patches) {
	let nextTags = tags, nextProvenance = provenance;
	for (const [id, patch] of patches) {
		if (tags[id] !== patch.beforeTags || provenance[id] !== patch.beforeProvenance || provenance[id]?.lockedFields?.includes("tags")) continue;
		if (patch.tags !== tags[id]) {
			if (nextTags === tags) nextTags = { ...tags };
			nextTags[id] = patch.tags;
		}
		if (nextProvenance === provenance) nextProvenance = { ...provenance };
		nextProvenance[id] = patch.provenance;
	}
	return {
		tags: nextTags,
		metadataProvenance: nextProvenance
	};
}
function youtubeSweepDue(lastRunAt, now, intervalMs) {
	return !Number.isFinite(lastRunAt) || lastRunAt <= 0 || now - lastRunAt >= intervalMs;
}
/** Reserve recent-feed slots for empty sources without increasing background
* request volume. Failed sources take a cooldown instead of pinning the queue. */
function selectYoutubeCoverageRecovery(channels, counts, now, limit) {
	return channels.filter((channel) => channel.kind === "youtube" && !(counts.get(channel.id) ?? 0) && (!channel.lastProviderFailure || now - channel.lastProviderFailure.at >= 36e5)).sort((a, b) => (a.lastCheckedAt ?? 0) - (b.lastCheckedAt ?? 0) || a.id.localeCompare(b.id)).slice(0, limit);
}
/** Resume the least recently crawled creator first; completed archives rest a week. */
function selectYoutubeSweepChannels(channels, now, count, exhaustedRecheckMs, options) {
	const youtube = channels.filter((channel) => channel.kind === "youtube" && (options?.includePlaylists || !channel.id.startsWith("ytpl:"))).filter((channel) => options?.includeExhausted || !channel.lastProviderFailure || now - channel.lastProviderFailure.at >= 36e5).filter((channel) => options?.includeExhausted || !channel.catalogExhaustedAt || now - channel.catalogExhaustedAt >= exhaustedRecheckMs);
	return (youtube.length ? youtube : options?.recheckExhaustedWhenIdle ? channels.filter((channel) => channel.kind === "youtube" && (options.includePlaylists || !channel.id.startsWith("ytpl:"))) : []).sort((a, b) => {
		const aCount = options?.videoCounts?.get(a.id) ?? 0;
		const bCount = options?.videoCounts?.get(b.id) ?? 0;
		const boost = 864e5;
		const priority = (channel, videos) => Math.max(channel.catalogCheckedAt ?? 0, channel.lastProviderFailure?.at ?? 0) - (options?.videoCounts && videos < 100 ? boost : 0);
		return priority(a, aCount) - priority(b, bCount) || aCount - bCount || a.id.localeCompare(b.id);
	}).slice(0, count);
}
/**
* Keep known-live creators fresh while reserving half the batch to discover
* new streams across a large follow list. Both groups rotate least-recently
* checked first.
*/
function selectYoutubeLiveChannels(channels, count) {
	const eligible = channels.filter((channel) => channel.kind === "youtube" && !channel.id.startsWith("ytpl:")).sort((a, b) => (a.liveCheckedAt ?? 0) - (b.liveCheckedAt ?? 0) || a.id.localeCompare(b.id));
	const active = eligible.filter((channel) => channel.live);
	const discovery = eligible.filter((channel) => !channel.live);
	const activeSlots = Math.min(active.length, Math.ceil(Math.max(0, count) / 2));
	const selected = [...active.slice(0, activeSlots), ...discovery.slice(0, Math.max(0, count) - activeSlots)];
	if (selected.length < count) selected.push(...active.slice(activeSlots, activeSlots + count - selected.length));
	return selected;
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
	"social",
	"watch-room",
	"settings"
]);
var files = /* @__PURE__ */ new Map();
var fileHandles = /* @__PURE__ */ new Map();
var dirHandles = /* @__PURE__ */ new Map();
var objectUrls = /* @__PURE__ */ new Map();
var MAX_OBJECT_URLS = 48;
/** Release transient media blobs after idle/background time, keeping the
* open player/preview valid. File handles and saved metadata remain intact. */
function trimObjectUrls(keepIds = []) {
	const keep = new Set(keepIds);
	for (const [id, url] of objectUrls) if (!keep.has(id)) {
		URL.revokeObjectURL(url);
		objectUrls.delete(id);
	}
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
		const oldest = objectUrls.keys().next().value;
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
var imageFile = (file) => file.type.startsWith("image/") || /\.(avif|bmp|gif|heic|heif|jpe?g|png|tiff?|webp)$/i.test(file.name);
var shortcutFile = (file) => /\.(url|lnk|exe|appref-ms)$/i.test(file.name);
var MAX_WARM_PHOTOS = 900;
function releaseDiscardedUrls(previous, next) {
	const retained = new Set(next.map((asset) => asset.url));
	for (const asset of previous) if (!retained.has(asset.url)) URL.revokeObjectURL(asset.url);
}
/** Companion assets discovered in a source picker. File handles remain browser-private. */
var useSourceAssets = create((set) => ({
	photos: [],
	shortcuts: [],
	capture: (input) => set((state) => {
		const files = Array.from(input);
		const append = (current, next) => [...current, ...next.filter((file) => !current.some((saved) => `${saved.name}:${saved.lastModified}` === `${file.name}:${file.lastModified}`))].slice(-600);
		const photoFiles = files.filter(imageFile);
		const existing = new Set(state.photos.map((asset) => `${asset.path}:${asset.file.lastModified}`));
		const incoming = photoFiles.filter((file) => {
			const key = `${file.webkitRelativePath || file.name}:${file.lastModified}`;
			if (existing.has(key)) return false;
			existing.add(key);
			return true;
		}).slice(-900);
		const overflow = Math.max(0, state.photos.length + incoming.length - MAX_WARM_PHOTOS);
		const photos = [...state.photos.slice(overflow), ...incoming.map((file) => ({
			file,
			path: file.webkitRelativePath || file.name,
			url: URL.createObjectURL(file)
		}))];
		releaseDiscardedUrls(state.photos, photos);
		return {
			photos,
			shortcuts: append(state.shortcuts, files.filter(shortcutFile))
		};
	}),
	capturePhoto: (file, path) => set((state) => {
		const key = `${path}:${file.lastModified}`;
		if (state.photos.some((asset) => `${asset.path}:${asset.file.lastModified}` === key)) return state;
		const next = [...state.photos, {
			file,
			path,
			url: URL.createObjectURL(file)
		}].slice(-900);
		releaseDiscardedUrls(state.photos, next);
		return { photos: next };
	})
}));
function normalizedLabel(value) {
	return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}
function stableId(value) {
	return value?.trim() ?? "";
}
/**
* Resolve a missing display name only when the card and a saved follow share
* an exact provider-issued identifier. Titles, filenames, and loose handles
* are intentionally excluded: a plausible creator guess is worse than a
* visible coverage gap in a media library.
*/
function resolveCreatorCoverage(video, follows) {
	const remote = video.remote;
	const existingName = remote?.channelName?.trim();
	if (existingName) return {
		status: "present",
		channelName: existingName
	};
	if (!remote || remote.kind !== "youtube" && remote.kind !== "twitch") return { status: "unsupported" };
	const matchingFollows = follows.filter((follow) => follow.kind === remote.kind && follow.title.trim());
	const evidence = [];
	const channelId = stableId(remote.channelId);
	const sourceId = stableId(video.folderId);
	for (const follow of matchingFollows) {
		if (channelId && stableId(follow.channelId) === channelId) evidence.push({
			title: follow.title.trim(),
			kind: "channel-id"
		});
		if (sourceId && stableId(follow.id) === sourceId) evidence.push({
			title: follow.title.trim(),
			kind: "source-id"
		});
	}
	const names = /* @__PURE__ */ new Map();
	for (const candidate of evidence) {
		const key = normalizedLabel(candidate.title);
		if (key && !names.has(key)) names.set(key, {
			title: candidate.title,
			evidence: candidate.kind
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
	if (!current || current.selectorReadyMs !== void 0) return;
	current.catalogRows = rows;
	current.selectorMs = Math.max(0, Math.round(workMs));
	current.selectorReadyMs = Math.max(0, Math.round(at - current.startedAt));
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
var restoring = false;
var navigationChanged = false;
var remoteRefreshCursor = 0;
var twitchRefreshCursor = 0;
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
var preferencesRestored = false;
var savedShelfRevision = 0;
var durableSliceWriter = new SliceWriter();
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
	persistActivityNow(get);
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
function persistActivityNow(get) {
	if (!preferencesRestored) return;
	const s = get();
	durableSliceWriter.write("history", [s.history], () => saveDurableHistory(s.history));
	durableSliceWriter.write("resume", [s.progress, s.resumeProgress], () => saveDurableResume(s.progress, s.resumeProgress));
	durableSliceWriter.write("marks", [s.viewCounts, s.cameCounts], () => saveDurableMarks(s.viewCounts, s.cameCounts));
	durableSliceWriter.write("links", [s.history, s.resumeProgress], () => saveDurableLinks(linksFromHistoryAndResume(s.history, s.resumeProgress)));
	durableSliceWriter.write("activity", [
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
	const hasAliases = Object.keys(resumeProgress).length > 0;
	if (!hasAliases && !Object.keys(progress).length) return progress;
	const next = { ...progress };
	if (!hasAliases) {
		for (const video of videos) {
			if (!next[video.id]) continue;
			const mark = newestResume(next[video.id]);
			if (mark) next[video.id] = mark;
		}
		return next;
	}
	for (const video of videos) {
		const mark = newestResume(next[video.id], resumeProgress[`id:${video.id}`], video.remote?.watchUrl ? resumeProgress[video.remote.watchUrl] : void 0, video.remote?.embedUrl ? resumeProgress[video.remote.embedUrl] : void 0, video.src ? resumeProgress[video.src] : void 0, video.path ? resumeProgress[video.path] : void 0);
		if (mark) next[video.id] = mark;
	}
	return next;
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
function mergeVideos(existing, incoming) {
	const positions = /* @__PURE__ */ new Map();
	for (let index = 0; index < existing.length; index++) {
		const video = existing[index];
		positions.set(video.id, index);
		const key = youtubeVideoKey(video);
		if (key && !positions.has(key)) positions.set(key, index);
	}
	return mergeRemoteCatalog(existing, incoming.map(catalogCard), positions, []);
}
function cacheRemotes(get, changedVideos, alreadyMerged = false) {
	const s = get();
	changedVideos && !alreadyMerged && new Set(changedVideos.map((video) => video.id));
	return saveRemoteSnapshot({
		videos: changedVideos ? alreadyMerged ? changedVideos : lookupVideos(s.videos, changedVideos.map((video) => video.id)).map((card, index) => withCatalogDetails(card ?? changedVideos[index], changedVideos[index])) : s.videos.filter((video) => video.remote && !video.isSample),
		folders: s.folders.filter((f) => f.kind === "youtube" || f.kind === "twitch"),
		checkedAt: s.remoteCheckedAt
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
function mergeInferredTagProvenance(previousTags, nextTags, existing, inferred, source) {
	const inferredSet = new Set(inferred.map(normalizeTagValue).filter(Boolean));
	const previousSources = existing?.tags ?? {};
	const tags = Object.fromEntries(nextTags.map((tag) => [tag, previousSources[tag] ?? (inferredSet.has(tag) ? source : "legacy")]));
	return {
		...existing,
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
		const compact = compactIngestedTags(reconcileProviderTopicTags(video, current, provenance), inferred);
		const tagsChanged = !sameTags(current, compact);
		if (tagsChanged) {
			if (tags === existing) tags = { ...existing };
			tags[video.id] = compact;
		}
		const sources = provenance?.tags;
		if (!(!tagsChanged && provenance?.updatedAt && sources && Object.keys(sources).length === compact.length && compact.every((tag) => sources[tag] !== void 0))) {
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
function metadataTagsForVideo(video, folders) {
	return video.remote ? remoteMetadataTags(video) : [...isAdultVideo(video, folders) ? ["adult"] : [], ...localNameTags(video)];
}
function metadataTailSource(video) {
	return video.remote?.kind ?? "local";
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
	const text = `${video.remote?.channelName ?? ""} ${video.name} ${video.description ?? video.tagline ?? ""}`.toLowerCase();
	const words = text.match(/[a-z][a-z0-9-]{3,30}/g) ?? [];
	const seen = /* @__PURE__ */ new Set();
	const tags = [];
	const publicTopics = video.remote?.kind === "youtube" || video.remote?.kind === "twitch" ? new Set(topicsForVideo(video)) : null;
	const unsupportedTopic = (word) => {
		const topic = canonicalTopic(word);
		return publicTopics && topic && !publicTopics.has(topic);
	};
	if (video.remote?.kind === "youtube") for (const match of text.matchAll(/#([a-z][a-z0-9_-]{2,30})\b/g)) {
		const tag = match[1].replaceAll("_", "-");
		if (IGNORED_DESCRIPTION_WORDS.has(tag) || seen.has(tag) || unsupportedTopic(tag)) continue;
		seen.add(tag);
		tags.push(tag);
		if (tags.length >= LIBRARY_LIMITS.descriptionKeywordTagsPerTitle) return tags;
	}
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
	const text = `${video.name} ${video.path} ${video.tagline ?? ""} ${video.description ?? ""}`.toLowerCase();
	const publicRemote = video.remote?.kind === "youtube" || video.remote?.kind === "twitch";
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
	const next = { ...existing };
	const metadataProvenance = { ...existingProvenance };
	for (const video of videos) {
		if (tagsLocked(existingProvenance[video.id])) continue;
		const inferred = localNameTags(video);
		if (!inferred.length) continue;
		const current = next[video.id] ?? [];
		const compact = [.../* @__PURE__ */ new Set([...current, ...inferred.map(normalizeTagValue).filter(Boolean)])].slice(0, 18);
		next[video.id] = compact;
		metadataProvenance[video.id] = mergeInferredTagProvenance(current, compact, existingProvenance[video.id], inferred, "local-name");
	}
	return {
		tags: next,
		metadataProvenance
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
	return adultIdSet(folders).has(video.folderId);
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
	refreshing: false,
	remoteCheckedAt: 0,
	remoteRefreshStatus: null,
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
			const favorites = { ...s.favorites };
			if (favorites[id]) delete favorites[id];
			else favorites[id] = true;
			return { favorites };
		});
		savedShelfRevision++;
		saveDurableShelves(Object.keys(get().favorites), Object.keys(get().likes));
	},
	toggleLike: (id) => {
		measureInteraction("rating");
		set((s) => {
			const likes = { ...s.likes };
			if (likes[id]) delete likes[id];
			else likes[id] = true;
			return { likes };
		});
		savedShelfRevision++;
		saveDurableShelves(Object.keys(get().favorites), Object.keys(get().likes));
	},
	markCame: (id) => {
		set((s) => ({ cameCounts: {
			...s.cameCounts,
			[id]: (s.cameCounts[id] ?? 0) + 1
		} }));
		persistNow(get);
	},
	setVideoComments: (id, comments) => {
		set((s) => ({ videos: s.videos.map((video) => {
			if (video.id !== id || !video.remote) return video.remote?.comments ? catalogCard(video) : video;
			return {
				...video,
				remote: {
					...video.remote,
					comments
				}
			};
		}) }));
		const updated = lookupVideo(get().videos, id);
		if (updated?.remote) cacheRemotes(get, [updated]).then(() => {
			if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("reelcase:video-details-changed", { detail: id }));
		});
	},
	releaseVideoComments: () => {
		const videos = get().videos;
		if (!videos.some((video) => video.remote?.comments)) return;
		set({ videos: videos.map((video) => video.remote?.comments ? catalogCard(video) : video) });
	},
	setVideoTags: (id, tags) => {
		const manualTags = [...new Set(tags.map(normalizeTagValue).filter(Boolean))].slice(0, 18);
		set((s) => ({
			tags: {
				...s.tags,
				[id]: manualTags
			},
			metadataProvenance: {
				...s.metadataProvenance,
				[id]: {
					...s.metadataProvenance[id],
					tags: Object.fromEntries(manualTags.map((tag) => [tag, "manual"])),
					lockedFields: [.../* @__PURE__ */ new Set([...s.metadataProvenance[id]?.lockedFields ?? [], "tags"])],
					updatedAt: Date.now()
				}
			}
		}));
		const state = get();
		saveTagEdit(id, state.tags[id] ?? []);
		saveMetadataEdit(id, state.metadataProvenance[id] ?? {
			tags: {},
			lockedFields: ["tags"]
		});
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
			tags: {
				...s.tags,
				[id]: merged
			},
			metadataProvenance: {
				...s.metadataProvenance,
				[id]: mergeInferredTagProvenance(existing, merged, s.metadataProvenance[id], inspected, source)
			}
		}));
		const state = get();
		saveTagEdit(id, state.tags[id] ?? []);
		saveMetadataEdit(id, state.metadataProvenance[id] ?? { tags: {} });
		persistNow(get);
		return added;
	},
	applyCompanionTags: (id, tags) => get().applyReviewedTags(id, tags, "companion-inspection"),
	autoTagLibrary: () => {
		let changed = 0;
		set((s) => {
			const tags = { ...s.tags };
			const metadataProvenance = { ...s.metadataProvenance };
			for (const video of s.videos) {
				if (tagsLocked(s.metadataProvenance[video.id])) continue;
				const inferred = metadataTagsForVideo(video, s.folders);
				const existing = (tags[video.id] ?? []).map((tag) => tag.replace(/^keyword-/i, ""));
				const merged = compactIngestedTags(existing, inferred);
				if (!sameTags(tags[video.id], merged)) changed += 1;
				tags[video.id] = merged;
				metadataProvenance[video.id] = mergeInferredTagProvenance(existing, merged, s.metadataProvenance[video.id], inferred, video.remote ? `provider:${video.remote.kind}` : "local-name");
			}
			return {
				tags,
				metadataProvenance
			};
		});
		persistNow(get);
		return changed;
	},
	enrichMetadataTail: () => {
		const state = get();
		const candidates = state.videos.flatMap((video) => {
			if (tagsLocked(state.metadataProvenance[video.id]) || (state.tags[video.id] ?? []).length) return [];
			const inferred = metadataTagsForVideo(video, state.folders);
			return inferred.length ? [{
				video,
				inferred,
				source: metadataTailSource(video)
			}] : [];
		});
		const batch = candidates.slice(0, LIBRARY_LIMITS.metadataTailBatchSize);
		const bySource = /* @__PURE__ */ new Map();
		for (const candidate of candidates) {
			const row = bySource.get(candidate.source) ?? {
				processed: 0,
				changed: 0,
				remaining: 0
			};
			row.remaining += 1;
			bySource.set(candidate.source, row);
		}
		if (!batch.length) return {
			processed: 0,
			changed: 0,
			remaining: 0,
			sources: []
		};
		const tags = { ...state.tags };
		const metadataProvenance = { ...state.metadataProvenance };
		let changed = 0;
		for (const { video, inferred, source } of batch) {
			const existing = tags[video.id] ?? [];
			const compact = compactIngestedTags(existing, inferred);
			const nextProvenance = mergeInferredTagProvenance(existing, compact, metadataProvenance[video.id], inferred, video.remote ? `provider:${video.remote.kind}` : "local-name");
			if (!sameTags(existing, compact)) {
				tags[video.id] = compact;
				changed += 1;
			}
			metadataProvenance[video.id] = nextProvenance;
			const row = bySource.get(source);
			row.processed += 1;
			row.remaining -= 1;
			if (!sameTags(existing, compact)) row.changed += 1;
		}
		set({
			tags,
			metadataProvenance
		});
		persistNow(get);
		return {
			processed: batch.length,
			changed,
			remaining: Math.max(0, candidates.length - batch.length),
			sources: [...bySource.entries()].map(([source, row]) => ({
				source,
				...row
			})).filter((row) => row.processed || row.remaining)
		};
	},
	repairCreatorCoverage: () => {
		const state = get();
		const candidates = state.videos.flatMap((video) => {
			const resolution = resolveCreatorCoverage(video, state.follows);
			return resolution.status === "resolved" ? [{
				video,
				channelName: resolution.channelName
			}] : [];
		});
		const batch = candidates.slice(0, LIBRARY_LIMITS.creatorCoverageRepairBatchSize);
		if (!batch.length) return {
			processed: 0,
			repaired: 0,
			tagged: 0,
			remaining: 0
		};
		const repairs = new Map(batch.map((candidate) => [candidate.video.id, candidate.channelName]));
		const repairedById = /* @__PURE__ */ new Map();
		const videos = state.videos.map((video) => {
			const channelName = repairs.get(video.id);
			const repaired = channelName && video.remote ? {
				...video,
				remote: {
					...video.remote,
					channelName
				}
			} : video;
			if (channelName && repaired !== video) repairedById.set(video.id, repaired);
			return repaired;
		});
		const tags = { ...state.tags };
		const metadataProvenance = { ...state.metadataProvenance };
		let tagged = 0;
		for (const { video } of batch) {
			const repaired = repairedById.get(video.id) ?? video;
			if (tagsLocked(metadataProvenance[video.id])) continue;
			const inferred = remoteMetadataTags(repaired).filter((tag) => tag.startsWith("creator-"));
			if (!inferred.length) continue;
			const existing = tags[video.id] ?? [];
			const compact = compactIngestedTags(existing, inferred);
			const nextProvenance = mergeInferredTagProvenance(existing, compact, metadataProvenance[video.id], inferred, `provider:${repaired.remote.kind}`);
			if (!sameTags(existing, compact)) {
				tags[video.id] = compact;
				tagged += 1;
			}
			if (JSON.stringify(nextProvenance) !== JSON.stringify(metadataProvenance[video.id])) metadataProvenance[video.id] = nextProvenance;
		}
		set({
			videos,
			tags,
			metadataProvenance
		});
		cacheRemotes(get);
		persistNow(get);
		return {
			processed: batch.length,
			repaired: batch.length,
			tagged,
			remaining: Math.max(0, candidates.length - batch.length)
		};
	},
	setVideoCategory: (id, category) => {
		set((s) => ({
			categories: {
				...s.categories,
				[id]: category.trim().slice(0, 40)
			},
			metadataProvenance: {
				...s.metadataProvenance,
				[id]: {
					...s.metadataProvenance[id],
					tags: s.metadataProvenance[id]?.tags ?? {},
					category: "manual",
					lockedFields: [.../* @__PURE__ */ new Set([...s.metadataProvenance[id]?.lockedFields ?? [], "category"])],
					updatedAt: Date.now()
				}
			}
		}));
		const state = get();
		saveTagEdit(id, state.tags[id] ?? []);
		saveMetadataEdit(id, state.metadataProvenance[id] ?? {
			tags: {},
			lockedFields: ["category"]
		});
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
			}, ...s.history] : s.history;
			const mark = incoming;
			const video = lookupVideo(s.videos, id);
			const resumeProgress = { ...s.resumeProgress };
			if (video) for (const key of stableResumeKeys(video)) resumeProgress[key] = newestResume(resumeProgress[key], mark) ?? mark;
			return {
				progress: {
					...s.progress,
					[id]: mark
				},
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
				viewCounts: {
					...s.viewCounts,
					[id]: (s.viewCounts[id] ?? 0) + 1
				}
			};
		});
		const event = get().history[0];
		if (event?.id === id && event.at !== beforeAt) appendActivityJournal(event).catch(() => void 0);
		persistActivity(get);
	},
	clearHistory: () => {
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
		setPullViewerOpen(true);
		set({
			activeId,
			previewId: null
		});
		queueMicrotask(() => get().recordPlay(activeId));
	},
	openPreview: (previewId, card) => {
		if (card?.id === previewId) rememberVideo(get().videos, card);
		setPullViewerOpen(true);
		measureInteraction("navigation");
		set({ previewId });
	},
	closePreview: () => set({ previewId: null }),
	closePlayer: () => set({ activeId: null }),
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
		const policy = getPullSettings();
		const providers = opts?.providers ?? "all";
		const providerList = providers === "all" ? [...ADULT_PULL_PROVIDERS] : [...new Set(providers)];
		const startedAt = Date.now(), pullId = makePullId(), cancellation = getPullCancellationRevision();
		const targets = providerList.map((provider) => ADULT_FOLDER_BY_PROVIDER[provider].name);
		const maxVideos = Math.min(policy.adultBatchVideos, Math.max(1, opts?.maxVideos ?? policy.adultBatchVideos));
		const cursors = loadAdultArchiveCursors(query, order);
		let received = 0, added = 0, done = 0;
		const diagnostics = [];
		const counts = /* @__PURE__ */ new Map();
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
			for (const [index, provider] of providerList.entries()) {
				if (getPullCancellationRevision() !== cancellation) break;
				const budget = Math.floor(maxVideos / providerList.length) + (index < maxVideos % providerList.length ? 1 : 0);
				if (!budget) continue;
				const saved = cursors[provider];
				const page = opts?.providerPages?.[provider] ?? (opts?.resumeArchive === false ? opts?.page ?? 1 : saved?.page ?? opts?.page ?? 1);
				const offset = opts?.resumeArchive === false || opts?.providerPages?.[provider] !== void 0 && opts.providerPages[provider] !== saved?.page ? 0 : saved?.offset ?? 0;
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
					}, turn);
					if (!walked.latest) continue;
					const result = {
						...walked.latest,
						videos: walked.videos,
						providerDiagnostics: walked.latest.providerDiagnostics.map((row) => ({
							...row,
							titles: walked.videos.length,
							detail: `${walked.videos.length.toLocaleString()} entries across archive pages${walked.error ? " · stopped after a provider error; saved results are retained" : ""}`
						}))
					};
					if (walked.error) result.providerDiagnostics.push({
						provider,
						status: "failed",
						titles: 0,
						detail: walked.error instanceof Error ? walked.error.message : String(walked.error)
					});
					await turn();
					const videos = dedupeAdultVideoCards(applyCachedAdultUrls(result.videos));
					if (!videos.length) {
						diagnostics.push(...result.providerDiagnostics);
						saveAdultArchiveCursors(query, order, result.providerNextPages, result.providerNextOffsets);
						done++;
						get().updatePull({
							done,
							received,
							added,
							failed: diagnostics.filter((row) => row.status === "failed").length
						});
						continue;
					}
					const inferredTags = /* @__PURE__ */ new Map();
					await forEachCatalogSlice(videos, (video) => {
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
						const base = get(), wanted = new Set(videos.map((video) => video.id));
						const positions = /* @__PURE__ */ new Map();
						counts.clear();
						await forEachCatalogSlice(base.videos, (video, index) => {
							if (wanted.has(video.id)) positions.set(video.id, index);
							if (ADULT_FOLDER_IDS.includes(video.folderId)) counts.set(video.folderId, (counts.get(video.folderId) ?? 0) + 1);
						}, turn);
						const nextTags = await copyCatalogRecord(base.tags, turn);
						const nextMetadata = await copyCatalogRecord(base.metadataProvenance, turn);
						const nextVideos = await copyCatalogArray(base.videos, turn);
						let batchAdded = 0;
						await forEachCatalogSlice(videos, (video) => {
							const position = positions.get(video.id);
							if (position === void 0) {
								positions.set(video.id, nextVideos.length);
								nextVideos.push(catalogCard(video));
								batchAdded++;
								counts.set(video.folderId, (counts.get(video.folderId) ?? 0) + 1);
							} else nextVideos[position] = catalogCard(video);
							const current = base.tags[video.id] ?? [];
							if (tagsLocked(base.metadataProvenance[video.id])) return;
							const inferred = inferredTags.get(video.id) ?? [];
							const compact = compactIngestedTags(current, inferred);
							nextTags[video.id] = compact;
							nextMetadata[video.id] = mergeInferredTagProvenance(current, compact, base.metadataProvenance[video.id], inferred, `provider:${video.remote?.kind ?? "eporner"}`);
						}, turn);
						await turn();
						const latest = get();
						if (latest.videos !== base.videos || latest.tags !== base.tags || latest.metadataProvenance !== base.metadataProvenance) continue;
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
							tags: nextTags,
							metadataProvenance: nextMetadata,
							adultsUnlocked: true
						});
						added += batchAdded;
						received += videos.length;
						committed = true;
					}
					if (!committed) break;
					cacheAdultVideoUrls(videos);
					diagnostics.push(...result.providerDiagnostics);
					for (const diagnostic of result.providerDiagnostics) if (diagnostic.status === "failed" && ADULT_PULL_PROVIDERS.includes(diagnostic.provider)) recordAdultArchiveFailure(query, order, diagnostic.provider);
					saveAdultArchiveCursors(query, order, result.providerNextPages, result.providerNextOffsets);
				} catch (error) {
					if (getPullCancellationRevision() !== cancellation) break;
					recordAdultArchiveFailure(query, order, provider);
					diagnostics.push({
						provider,
						status: "failed",
						titles: 0,
						detail: error instanceof Error ? error.message : String(error)
					});
				}
				done++;
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
			set({ adultPullStatus: {
				note: cancelled ? "Pull cancelled. Accepted entries and archive resume points are saved." : `${added.toLocaleString()} new entries · ${received.toLocaleString()} received. Archive pages are saved separately for each provider.`,
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
				status: cancelled ? "partial" : failed.length ? received ? "partial" : "failed" : received ? "success" : "partial",
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
	restoreFolders: async () => {
		if (get().hydrated || restoring) return;
		restoring = true;
		set({ pullHistory: loadPullHistory() });
		await restoreDurablePrefs().catch(() => void 0);
		hydrateDurableFeedback().catch(() => void 0);
		const dedicatedFollows = await restoreDurableFollows().catch(() => loadFollows() ?? []);
		preferencesRestored = true;
		const prefsState = applyPrefs({});
		prefsState.tags = restoreTagEdits(prefsState.tags ?? {});
		prefsState.metadataProvenance = restoreMetadataEdits(prefsState.metadataProvenance ?? {});
		const prefsFollows = Array.isArray(prefsState.follows) ? prefsState.follows : [];
		const migratedFollows = dedupeFollows([...dedicatedFollows, ...prefsFollows]);
		prefsState.follows = migratedFollows;
		if (migratedFollows.length) saveFollows(migratedFollows);
		const adultIds = new Set(loadPrefs()?.privateFolderIds ?? []);
		let cachedFolderIds = /* @__PURE__ */ new Set();
		let savedHealth = /* @__PURE__ */ new Map();
		set((s) => ({
			...prefsState,
			...navigationChanged ? { sourceId: s.sourceId } : {}
		}));
		const restoringShelfRevision = savedShelfRevision;
		Promise.all([
			loadActivitySnapshot(),
			loadActivityJournal(),
			restoreDurableHistory(),
			restoreDurableResume(),
			restoreDurableMarks(),
			restoreDurableShelves(),
			restoreDurableLinks()
		]).then(([activity, journal, durableHistory, durableResume, durableMarks, durableShelves, durableLinks]) => {
			const queuedResume = takeQueuedResumeReplay();
			const hasShelves = durableShelves.authoritative || durableShelves.favorites.length || durableShelves.likes.length;
			if (!(activity || journal.length || durableHistory.length || Object.keys(durableResume.resumeProgress).length || Object.keys(durableMarks.viewCounts).length || Object.keys(durableMarks.cameCounts).length || hasShelves || durableLinks.length || Object.keys(queuedResume).length)) return;
			if (durableHistory.length || (activity?.history?.length ?? 0) || journal.length) {
				const mergedEarly = mergeHistory(mergeHistory(durableHistory, activity?.history ?? []), journal);
				if (mergedEarly.length) saveDurableHistory(mergedEarly);
			}
			if (Object.keys(durableResume.resumeProgress).length || activity?.resumeProgress) saveDurableResume({
				...activity?.progress ?? {},
				...durableResume.progress
			}, {
				...activity?.resumeProgress ?? {},
				...durableResume.resumeProgress
			});
			if (Object.keys(durableMarks.viewCounts).length || Object.keys(durableMarks.cameCounts).length || activity?.viewCounts || activity?.cameCounts) saveDurableMarks({
				...activity?.viewCounts ?? {},
				...durableMarks.viewCounts
			}, {
				...activity?.cameCounts ?? {},
				...durableMarks.cameCounts
			});
			if (durableLinks.length) saveDurableLinks(durableLinks);
			set((s) => {
				const resumeProgress = {
					...activity?.resumeProgress ?? {},
					...durableResume.resumeProgress,
					...queuedResume,
					...s.resumeProgress
				};
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
					progress: reconcileResumeForVideos(s.videos, {
						...activity?.progress ?? {},
						...durableResume.progress,
						...s.progress
					}, resumeProgress),
					viewCounts: {
						...activity?.viewCounts ?? {},
						...durableMarks.viewCounts,
						...s.viewCounts
					},
					cameCounts: {
						...activity?.cameCounts ?? {},
						...durableMarks.cameCounts,
						...s.cameCounts
					},
					favorites,
					likes
				};
			});
		}).catch(() => void 0);
		set({ hydrated: true });
		await new Promise((resolve) => {
			if (typeof window === "undefined") resolve();
			else window.setTimeout(resolve, 32);
		});
		try {
			const snapshot = await loadRemoteSnapshot();
			if (snapshot) {
				const ids = new Set(get().follows.map((channel) => channel.id));
				const youtubeChannels = new Set(get().follows.filter((channel) => channel.kind === "youtube" && !channel.id.startsWith("ytpl:") && channel.channelId).map((channel) => channel.channelId));
				set((s) => {
					const restored = snapshot.videos.filter((video) => shouldRestoreRemoteVideo(video, ids, s.favorites, s.likes, youtubeChannels)).map(repairLegacyYoutubeDate);
					const videos = mergeVideos(s.videos, restored);
					return {
						videos,
						progress: reconcileResumeForVideos(videos, s.progress, s.resumeProgress),
						folders: [...s.folders.filter((f) => !snapshot.folders.some((saved) => saved.id === f.id)), ...snapshot.folders.filter((f) => ids.has(f.id))],
						remoteCheckedAt: snapshot.checkedAt
					};
				});
			}
		} catch {}
		restoreDurablePhotos().then((photos) => {
			if (!photos.sources.length) return;
			set((s) => {
				let folders = s.folders;
				for (const source of photos.sources) if (folders.some((folder) => folder.id === source.id)) folders = folders.map((folder) => folder.id === source.id ? {
					...folder,
					name: source.name || folder.name,
					kind: source.kind,
					...source.photoCount != null ? { photoCount: source.photoCount } : {},
					...source.lastCheckedAt != null ? { lastCheckedAt: source.lastCheckedAt } : {}
				} : folder);
				else folders = [...folders, {
					id: source.id,
					name: source.name,
					kind: source.kind,
					videoCount: 0,
					photoCount: source.photoCount ?? 0,
					lastCheckedAt: source.lastCheckedAt,
					needsPermission: true,
					health: "permission-needed"
				}];
				return { folders };
			});
		}).catch(() => void 0);
		restoring = false;
		if (typeof window !== "undefined") {
			let index = 0;
			let lastTagCommitAt = Date.now();
			const pendingTags = /* @__PURE__ */ new Map();
			const schedule = (work) => {
				scheduleBackgroundWork(work, {
					timeoutMs: 2e3,
					fallbackDelayMs: 80
				});
			};
			const compactCachedRemoteTags = () => {
				const snapshot = get();
				if (snapshot.activeId || snapshot.previewId || snapshot.sourceId === "stats") {
					window.setTimeout(() => schedule(compactCachedRemoteTags), 1e3);
					return;
				}
				const started = performance.now();
				const end = Math.min(snapshot.videos.length, index + 96);
				for (; index < end; index += 1) {
					if (index % 8 === 0 && performance.now() - started >= 4) break;
					const video = snapshot.videos[index];
					if (!video?.remote) continue;
					const previousProvenance = snapshot.metadataProvenance[video.id];
					if (tagsLocked(previousProvenance)) continue;
					const current = snapshot.tags[video.id] ?? [];
					const inferred = remoteMetadataTags(video);
					const compact = compactIngestedTags(reconcileProviderTopicTags(video, current, previousProvenance), inferred);
					const tagsChanged = !sameTags(current, compact);
					const sources = previousProvenance?.tags;
					if (!tagsChanged && previousProvenance?.updatedAt && sources && Object.keys(sources).length === compact.length && compact.every((tag) => sources[tag] !== void 0)) continue;
					const provenance = mergeInferredTagProvenance(current, compact, previousProvenance, inferred, `provider:${video.remote.kind}`);
					pendingTags.set(video.id, {
						beforeTags: snapshot.tags[video.id],
						beforeProvenance: previousProvenance,
						tags: tagsChanged ? compact : current,
						provenance
					});
				}
				if (pendingTags.size && (pendingTags.size >= 2048 || index >= get().videos.length || Date.now() - lastTagCommitAt >= 5e3)) {
					const current = get();
					const next = applyCachedTagPatches(current.tags, current.metadataProvenance, pendingTags);
					pendingTags.clear();
					lastTagCommitAt = Date.now();
					if (next.tags !== current.tags || next.metadataProvenance !== current.metadataProvenance) set(next);
				}
				if (index < get().videos.length) schedule(compactCachedRemoteTags);
			};
			window.setTimeout(() => schedule(compactCachedRemoteTags), 600);
		}
		if (typeof window !== "undefined") {
			const recover = async (kind) => {
				try {
					const saved = JSON.parse(localStorage.getItem(`reelcase.import-history.${kind}`) ?? "[]");
					if (!Array.isArray(saved) || !saved.length) return;
					const handles = saved.filter((value) => typeof value === "string" && Boolean(value.trim()));
					const stubs = handles.map((query) => {
						const handle = canonicalFollowHandle(kind, query);
						return {
							id: `${kind === "twitch" ? "tw" : "yt"}:${handle}`,
							kind,
							handle,
							title: handle
						};
					}).filter((row) => row.handle);
					if (stubs.length) {
						const merged = dedupeFollows([...get().follows, ...stubs]);
						set({ follows: merged });
						saveFollows(merged);
					}
					if (!getPullSettings().automaticPulls || pullsPaused()) return;
					await get().importBatch(handles.slice(0, 80).map((query) => ({
						query,
						kind
					})));
				} catch {}
			};
			(async () => {
				await recover("twitch");
				await recover("youtube");
			})();
		}
		try {
			const [storedCatalog, healthRows] = await Promise.all([loadCatalogVideos(), loadSourceHealth()]);
			const catalog = storedCatalog.map(repairLegacyYoutubeDate);
			savedHealth = new Map(healthRows.map((entry) => [entry.id, entry]));
			cachedFolderIds = new Set(catalog.map((video) => video.folderId));
			if (catalog.length) {
				const counts = /* @__PURE__ */ new Map();
				for (const v of catalog) counts.set(v.folderId, (counts.get(v.folderId) ?? 0) + 1);
				set((s) => {
					const videos = mergeVideos(s.videos, catalog);
					return {
						videos,
						progress: reconcileResumeForVideos(videos, s.progress, s.resumeProgress),
						folders: [...s.folders, ...[...counts.entries()].filter(([id]) => !s.folders.some((f) => f.id === id)).map(([id, videoCount]) => ({
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
		} catch {}
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
			await deleteDirHandle(folderId);
		} catch {}
	},
	followRemoteQuery: async (query, kind = "auto", opts) => {
		const startedAt = Date.now();
		const pullId = makePullId();
		const provider = kind === "twitch" ? "twitch" : "youtube";
		get().beginPull({
			id: pullId,
			provider,
			action: "Creator video pull",
			startedAt,
			targets: [query],
			done: 0,
			total: 1,
			received: 0,
			added: 0,
			failed: 0
		});
		const beforeIds = new Set(get().videos.map((video) => video.id));
		set({ remoteBusy: true });
		try {
			const knownYoutube = get().follows.find((channel) => channel.kind === "youtube" && (channel.id === query || channel.channelId === query || canonicalFollowHandle("youtube", channel.handle) === canonicalFollowHandle("youtube", query)));
			const result = await followRemote({ data: {
				query,
				kind,
				...opts?.clipLimit ? { clipLimit: opts.clipLimit } : {},
				...knownYoutube?.catalogCursor ? { catalogCursor: knownYoutube.catalogCursor } : {}
			} });
			set((s) => {
				const follows = dedupeFollows([result.channel, ...s.follows.filter((f) => f.id !== result.channel.id)]);
				const folder = {
					id: result.channel.id,
					name: result.channel.title,
					kind: result.channel.kind,
					videoCount: result.videos.length
				};
				const enriched = enrichRemoteTags(s.tags, s.metadataProvenance, result.videos);
				return {
					follows,
					folders: [...s.folders.filter((f) => f.id !== folder.id), folder],
					videos: mergeVideos(s.videos.filter((v) => v.folderId !== result.channel.id || s.favorites[v.id] || s.likes[v.id] || (result.channel.kind === "twitch" || result.channel.kind === "youtube") && v.remote?.kind === result.channel.kind && !v.remote.live), result.videos),
					tags: enriched.tags,
					metadataProvenance: enriched.metadataProvenance,
					remoteBusy: false
				};
			});
			persistNow(get);
			cacheRemotes(get, result.videos);
			const added = result.videos.filter((video) => !beforeIds.has(video.id)).length;
			get().finishPull({
				id: pullId,
				provider,
				action: "Creator video pull",
				startedAt,
				finishedAt: Date.now(),
				targets: [result.channel.title || query],
				done: 1,
				total: 1,
				received: result.videos.length,
				added,
				failed: 0,
				status: result.videos.length ? "success" : "partial"
			});
		} catch (err) {
			set({ remoteBusy: false });
			get().finishPull({
				id: pullId,
				provider,
				action: "Creator video pull",
				startedAt,
				finishedAt: Date.now(),
				targets: [query],
				done: 1,
				total: 1,
				received: 0,
				added: 0,
				failed: 1,
				status: "failed",
				errors: [err instanceof Error ? err.message : String(err)]
			});
			throw err;
		}
	},
	importBatch: async (items) => {
		const savedHandles = new Set(get().follows.map((follow) => `${follow.kind}:${canonicalFollowHandle(follow.kind, follow.handle)}`));
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
		const knownVideoIds = new Set(get().videos.map((video) => video.id));
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
		const chunk = 20;
		try {
			for (let i = 0; i < unique.length; i += chunk) {
				if (getPullCancellationRevision() !== cancellation) break;
				const slice = unique.slice(i, i + chunk);
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
				for (const row of result.ok) for (const video of row.videos) {
					pulledVideos += 1;
					if (!knownVideoIds.has(video.id)) addedVideos += 1;
					knownVideoIds.add(video.id);
				}
				if (result.failedQueries?.length) {
					failedQueries.push(...result.failedQueries);
					for (const query of result.failedQueries) failedReasons[query] = "Channel was not found publicly, is unavailable, or provider metadata could not be read";
				}
				get().updatePull({
					done: Math.min(i + slice.length, unique.length),
					received: pulledVideos,
					added: addedVideos,
					failed
				});
				set((s) => {
					let follows = s.follows;
					let folders = s.folders;
					let videos = s.videos;
					for (const row of result.ok) {
						const key = canonicalFollowHandle(row.channel.kind, row.channel.handle);
						follows = [row.channel, ...follows.filter((f) => canonicalFollowHandle(f.kind, f.handle) !== key)];
						const folder = {
							id: row.channel.id,
							name: row.channel.title,
							kind: row.channel.kind,
							videoCount: row.videos.length
						};
						folders = [...folders.filter((f) => f.id !== folder.id), folder];
						videos = mergeVideos(videos.filter((v) => v.folderId !== row.channel.id || s.favorites[v.id] || s.likes[v.id] || (row.channel.kind === "twitch" || row.channel.kind === "youtube") && v.remote?.kind === row.channel.kind && !v.remote.live), row.videos);
					}
					const enriched = enrichRemoteTags(s.tags, s.metadataProvenance, result.ok.flatMap((row) => row.videos));
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
				persistSoon(get);
				cacheRemotes(get, result.ok.flatMap((row) => row.videos));
			}
			persistNow(get);
			const added = get().follows.filter((f) => !existing.has(f.id)).length;
			if (getPullCancellationRevision() === cancellation) get().pushNotice({
				title: `Imported ${added || ok} channel${(added || ok) === 1 ? "" : "s"}`,
				body: failed ? `${failed} need attention. Open the importer for the saved reason list.` : "Latest uploads are on the shelves.",
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
				status: getPullCancellationRevision() !== cancellation ? "partial" : failed ? ok ? "partial" : "failed" : "success",
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
	refreshFollows: async (kind, options) => {
		await waitForPulls();
		const overlappingLive = Boolean((options?.youtubeLiveOnly || options?.backgroundLive) && get().refreshing);
		if (get().refreshing && !overlappingLive || get().remoteBusy || options?.youtubeLiveOnly && youtubeLiveCheckBusy || options?.backgroundLive && twitchLiveCheckBusy) return {
			wentLive: [],
			newVideos: []
		};
		const allFollows = dedupeFollows(get().follows).filter((follow) => !kind || follow.kind === kind);
		if (!allFollows.length) return {
			wentLive: [],
			newVideos: []
		};
		const rotate = (items, limit, cursor) => {
			if (!items.length) return [];
			const savedCursor = cursor === "twitch" ? twitchRefreshCursor : cursor === "youtube" ? youtubeRefreshCursor : remoteRefreshCursor;
			const count = Math.min(limit, items.length);
			const start = savedCursor % items.length;
			const next = Array.from({ length: count }, (_, index) => items[(start + index) % items.length]);
			const updated = (start + count) % items.length;
			if (cursor === "twitch") twitchRefreshCursor = updated;
			else if (cursor === "youtube") youtubeRefreshCursor = updated;
			else remoteRefreshCursor = updated;
			return next;
		};
		const twitch = allFollows.filter((follow) => follow.kind === "twitch");
		const youtube = allFollows.filter((follow) => follow.kind === "youtube");
		const youtubeCoverage = kind === "youtube" && !options?.youtubeLiveOnly ? youtubeSourceCounts(get().videos, youtube) : void 0;
		const recovering = youtubeCoverage && !options?.catalog ? selectYoutubeCoverageRecovery(youtube, youtubeCoverage, Date.now(), Math.ceil(LIBRARY_LIMITS.youtubeRecentRefreshChannels / 2)) : [];
		const requestedIds = options?.channelIds?.length ? new Set(options.channelIds) : null;
		const current = requestedIds ? kind === "youtube" && options?.catalog ? selectYoutubeSweepChannels(allFollows.filter((follow) => requestedIds.has(follow.id)), Date.now(), getPullSettings().youtubeSourcesPerSweep, LIBRARY_LIMITS.youtubeCatalogRecheckExhaustedMs, {
			includeExhausted: true,
			includePlaylists: true,
			videoCounts: youtubeCoverage
		}) : allFollows.filter((follow) => requestedIds.has(follow.id)) : kind === "youtube" && options?.youtubeLiveOnly ? selectYoutubeLiveChannels(youtube, LIBRARY_LIMITS.youtubeLiveRefreshChannels) : kind === "youtube" && options?.catalog && options.scheduled ? selectYoutubeSweepChannels(youtube, Date.now(), Math.min(getPullSettings().youtubeSourcesPerSweep, LIBRARY_LIMITS.youtubeScheduledRefreshChannels), LIBRARY_LIMITS.youtubeCatalogRecheckExhaustedMs, {
			includePlaylists: true,
			videoCounts: youtubeCoverage
		}) : kind === "youtube" && options?.catalog ? selectYoutubeSweepChannels(youtube, Date.now(), getPullSettings().youtubeSourcesPerSweep, LIBRARY_LIMITS.youtubeCatalogRecheckExhaustedMs, {
			includeExhausted: true,
			includePlaylists: true,
			videoCounts: youtubeCoverage
		}) : kind === "youtube" ? [...recovering, ...rotate(youtube.filter((channel) => !recovering.some((row) => row.id === channel.id)), LIBRARY_LIMITS.youtubeRecentRefreshChannels - recovering.length, "youtube")] : kind === "twitch" && options?.backgroundLive ? rotate(twitch, LIBRARY_LIMITS.twitchChannelsReservedPerRefresh, "twitch") : twitch.length && youtube.length ? [...rotate(twitch, Math.min(LIBRARY_LIMITS.twitchChannelsReservedPerRefresh, REMOTE_REFRESH_BATCH_SIZE), "twitch"), ...rotate(youtube, REMOTE_REFRESH_BATCH_SIZE - Math.min(LIBRARY_LIMITS.twitchChannelsReservedPerRefresh, REMOTE_REFRESH_BATCH_SIZE), "youtube")] : rotate(allFollows, REMOTE_REFRESH_BATCH_SIZE, "all");
		if (!current.length) return {
			wentLive: [],
			newVideos: []
		};
		if (options?.youtubeLiveOnly) youtubeLiveCheckBusy = true;
		if (options?.backgroundLive) twitchLiveCheckBusy = true;
		if (!overlappingLive) set({ refreshing: true });
		const startedAt = Date.now();
		const pullId = makePullId();
		const provider = kind ?? (current.some((channel) => channel.kind === "youtube") && current.some((channel) => channel.kind === "twitch") ? "multi" : current[0].kind);
		const action = options?.youtubeLiveOnly ? "YouTube live check" : options?.scheduled ? "Scheduled YouTube archive sweep" : options?.catalog ? "YouTube archive pull" : "Channel refresh";
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
		const beforeLiveChannels = new Set(get().follows.filter((channel) => channel.live).map((channel) => channel.id));
		const catalogQueue = kind === "youtube" && options?.catalog === true;
		let received = 0;
		let added = 0;
		let refreshed = 0;
		const errors = [];
		const wentLive = [];
		const newVideos = [];
		let catalogIndexedVideos = catalogQueue ? get().videos : null;
		const catalogPositions = catalogIndexedVideos ? /* @__PURE__ */ new Map() : null;
		if (catalogPositions && catalogIndexedVideos) for (let index = 0; index < catalogIndexedVideos.length; index++) {
			const video = catalogIndexedVideos[index];
			catalogPositions.set(video.id, index);
			const key = youtubeVideoKey(video);
			if (key && !catalogPositions.has(key)) catalogPositions.set(key, index);
		}
		const catalogFolderCounts = catalogQueue ? /* @__PURE__ */ new Map() : null;
		if (catalogFolderCounts && catalogIndexedVideos) for (const video of catalogIndexedVideos) catalogFolderCounts.set(video.folderId, (catalogFolderCounts.get(video.folderId) ?? 0) + 1);
		const syncCatalogIndex = () => {
			if (!catalogPositions || !catalogFolderCounts || get().videos === catalogIndexedVideos) return;
			catalogIndexedVideos = get().videos;
			catalogPositions.clear();
			catalogFolderCounts.clear();
			for (const [index, video] of catalogIndexedVideos.entries()) {
				catalogPositions.set(video.id, index);
				const key = youtubeVideoKey(video);
				if (key && !catalogPositions.has(key)) catalogPositions.set(key, index);
				catalogFolderCounts.set(video.folderId, (catalogFolderCounts.get(video.folderId) ?? 0) + 1);
			}
		};
		const waitForCatalogTurn = () => new Promise((resolve) => {
			const schedule = () => scheduleBackgroundWork(() => {
				if (getPullCancellationRevision() === cancellation && getPullSettings().pauseWhileWatching && (get().activeId || get().previewId)) window.setTimeout(schedule, 300);
				else resolve();
			});
			schedule();
		});
		const cancellation = getPullCancellationRevision();
		try {
			const batchSize = catalogQueue ? LIBRARY_LIMITS.youtubeCatalogSourcesPerRequest : current.length;
			for (let offset = 0; offset < current.length; offset += batchSize) {
				if (getPullCancellationRevision() !== cancellation) break;
				const batch = current.slice(offset, offset + batchSize).map((channel) => youtubeCoverage && !(youtubeCoverage.get(channel.id) ?? 0) ? {
					...channel,
					catalogCursor: void 0,
					catalogExhaustedAt: void 0,
					newestVideoId: void 0
				} : channel);
				if (catalogQueue) await waitForCatalogTurn();
				await waitForPulls();
				syncCatalogIndex();
				let result;
				try {
					result = await refreshRemotes({ data: {
						youtubeVideoLimit: getPullSettings().youtubeBatchVideos,
						channels: batch,
						youtubeCatalog: catalogQueue,
						youtubeBackground: options?.scheduled === true,
						youtubeLiveOnly: options?.youtubeLiveOnly === true,
						backgroundLive: options?.backgroundLive === true
					} });
				} catch (error) {
					if (getPullCancellationRevision() !== cancellation) break;
					errors.push(`${batch.map((channel) => channel.title).join(", ")}: ${error instanceof Error ? error.message : String(error)}`);
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
				syncCatalogIndex();
				if (getPullCancellationRevision() !== cancellation) break;
				const existingVideos = get().videos;
				const existingIndex = catalogPositions ? null : remoteVideoIndex(existingVideos);
				const knownVideoIndex = catalogPositions ?? existingIndex;
				const isNewVideo = (video) => !knownVideoIndex.has(video.id) && !knownVideoIndex.has(youtubeVideoKey(video) ?? video.id);
				const newVideoIds = new Set(result.videos.filter(isNewVideo).map((video) => video.id));
				const newCount = newVideoIds.size;
				received += result.videos.length;
				added += newCount;
				refreshed += result.refreshedIds.length;
				if (!catalogQueue) newVideos.push(...result.videos.filter((video) => isNewVideo(video) && Boolean(video.remote)));
				for (const channel of result.channels) {
					if (channel.lastProviderFailure && errors.length < 12) errors.push(`${channel.title}: ${channel.lastProviderFailure.message}`);
					if (channel.live && !beforeLiveChannels.has(channel.id)) wentLive.push(channel);
				}
				if (!overlappingLive) get().updatePull({
					done: Math.min(current.length, offset + batch.length),
					received,
					added,
					failed: Math.min(current.length, offset + batch.length) - refreshed
				});
				const staleLiveIds = [];
				const mergedIncoming = [];
				set((s) => {
					const mergedVideos = catalogPositions ? mergeRemoteCatalog(s.videos, result.videos.map(catalogCard), catalogPositions, mergedIncoming) : mergeRemoteRefresh(s.videos, result.videos.map(catalogCard), result.refreshedIds, /* @__PURE__ */ new Set([
						...Object.keys(s.favorites),
						...Object.keys(s.likes),
						...s.history.map((entry) => entry.id)
					]), {
						index: s.videos === existingVideos ? existingIndex ?? void 0 : remoteVideoIndex(s.videos),
						staleLiveIds
					});
					const enriched = enrichRemoteTags(s.tags, s.metadataProvenance, result.videos);
					const folderCounts = catalogFolderCounts ?? new Map(s.folders.map((folder) => [folder.id, folder.videoCount ?? 0]));
					for (const video of result.videos) if (newVideoIds.has(video.id)) {
						folderCounts.set(video.folderId, (folderCounts.get(video.folderId) ?? 0) + 1);
						newVideoIds.delete(video.id);
					}
					return {
						follows: dedupeFollows([...result.channels, ...s.follows]),
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
						progress: reconcileResumeForVideos(result.videos, s.progress, s.resumeProgress),
						tags: enriched.tags,
						metadataProvenance: enriched.metadataProvenance,
						...!overlappingLive && !options?.youtubeLiveOnly ? { remoteRefreshStatus: {
							at: Date.now(),
							checked: offset + batch.length,
							refreshed,
							failed: offset + batch.length - refreshed,
							youtube: catalogQueue ? received : result.videos.filter((video) => video.remote?.kind === "youtube").length,
							twitch: result.videos.filter((video) => video.remote?.kind === "twitch" && !video.remote.live).length
						} } : {},
						...!overlappingLive && !options?.youtubeLiveOnly ? { remoteRetryAt: result.retryAt } : {}
					};
				});
				if (catalogPositions) catalogIndexedVideos = get().videos;
				if (catalogQueue) {
					const changed = new Map(mergedIncoming.map((video) => [video.id, video]));
					await cacheRemotes(get, result.videos.filter((video) => changed.has(video.id)).map((video) => ({
						...video,
						folderId: changed.get(video.id).folderId,
						remote: {
							...video.remote,
							sourceIds: changed.get(video.id).remote?.sourceIds
						}
					})), true);
					if ((offset + batch.length) % 4 === 0) saveFollows(get().follows);
					await new Promise((resolve) => setTimeout(resolve, 0));
				} else {
					await cacheRemotes(get, result.videos);
					if (staleLiveIds.length) await removeRemoteSnapshotVideos(staleLiveIds).catch(() => void 0);
				}
			}
			persistNow(get);
			const failed = current.length - refreshed;
			if (!overlappingLive) get().finishPull({
				id: pullId,
				provider,
				action,
				startedAt,
				finishedAt: Date.now(),
				targets: current.slice(0, 12).map((channel) => channel.title || channel.handle),
				done: current.length,
				total: current.length,
				received,
				added,
				failed,
				status: failed ? refreshed ? "partial" : "failed" : "success",
				...errors.length ? { errors: errors.slice(0, 12) } : {}
			});
			return {
				wentLive,
				newVideos
			};
		} catch (error) {
			if (!options?.youtubeLiveOnly) set({ remoteRefreshStatus: {
				at: Date.now(),
				checked: current.length,
				refreshed: 0,
				failed: current.length,
				youtube: 0,
				twitch: 0
			} });
			if (!overlappingLive) get().finishPull({
				id: pullId,
				provider,
				action,
				startedAt,
				finishedAt: Date.now(),
				targets: current.slice(0, 12).map((channel) => channel.title || channel.handle),
				done: current.length,
				total: current.length,
				received: 0,
				added: 0,
				failed: current.length,
				status: "failed",
				errors: [error instanceof Error ? error.message : String(error)]
			});
			return {
				wentLive: [],
				newVideos: []
			};
		} finally {
			if (options?.youtubeLiveOnly) youtubeLiveCheckBusy = false;
			if (options?.backgroundLive) twitchLiveCheckBusy = false;
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
		if (!video || video.remote) return;
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
var youtubeSelectorSnapshot;
if (typeof window !== "undefined") {
	const flushPending = () => {
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
	let list = state.videos.filter((v) => !state.unavailable[v.id] && !state.hiddenVideos[v.id] && !adult.has(v.folderId) && (knownFolders.has(v.folderId) || Boolean(v.remote) || v.isSample));
	if (state.hideDemo) list = list.filter((v) => !v.isSample);
	memo.public = list;
	return list;
}
function computeAdultList(state) {
	const memo = memoFor(state);
	if (memo.adult) return memo.adult;
	const adult = adultIdSet(state.folders);
	memo.adult = dedupeAdultVideoCards(state.videos.filter((v) => !state.unavailable[v.id] && !state.hiddenVideos[v.id] && adult.has(v.folderId) && !RETIRED_ADULT_SOURCE_IDS.includes(v.remote?.kind ?? v.folderId.split(":")[0]) && (state.showHiddenAdult || !(state.tags[v.id] ?? []).includes("hidden"))));
	return memo.adult;
}
var videoNameOrder = new Intl.Collator(void 0, { sensitivity: "base" });
function computeSelectVisible(state) {
	const q = state.query.trim().toLowerCase();
	const inAdults = state.sourceId === "adults" || state.sourceId === "adult-fetishes";
	let list = state.sourceId === "history" ? selectHistory(state, false) : state.sourceId === "continue" ? selectContinue(state, false) : state.sourceId === "favorites" ? selectFavorites(state, false) : inAdults ? adultList(state) : publicList(state);
	if (state.sourceId === "favorites") list = list.filter((v) => state.favorites[v.id] || state.likes[v.id]);
	else if (state.sourceId === "continue") list = selectContinue(state, false);
	else if (state.sourceId === "history") {} else if (state.sourceId === "movies") list = list.filter((v) => !v.remote);
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
	sorted.sort((a, b) => {
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
	});
	return sorted;
}
function scoped(state, adult) {
	return adult ? adultList(state) : publicList(state);
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
	const watched = activityCandidates(state.videos, resumeKeys.filter((key) => !key.startsWith("id:")), watchedIds).filter((video) => !(state.hideDemo && video.isSample) && !state.hiddenVideos[video.id] && adult === adultIds.has(video.folderId));
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
function computeSelectHistory(state, adult = false) {
	const adultIds = adultIdSet(state.folders);
	const byId = activityLookup(state.videos, state.history.flatMap((entry) => entry.url ? [entry.id, entry.url] : [entry.id]));
	const lastMatch = (key) => {
		const matches = byId.get(key);
		for (let index = (matches?.length ?? 0) - 1; index >= 0; index--) {
			const video = matches[index];
			if (!(state.hideDemo && video.isSample) && !state.hiddenVideos[video.id] && adult === adultIds.has(video.folderId)) return video;
		}
	};
	const seen = /* @__PURE__ */ new Set();
	const resolvedIds = /* @__PURE__ */ new Set();
	return state.history.filter((h) => !state.hiddenVideos[h.id] && !seen.has(h.id) && Boolean(seen.add(h.id))).map((h) => {
		const cached = lastMatch(h.id) ?? (h.url ? lastMatch(h.url) : void 0);
		if (cached) return cached;
		const live = byId.get(h.id)?.[0];
		if (live) {
			if (state.hiddenVideos[live.id] || state.hideDemo && live.isSample) return null;
			const isAdult = adultIds.has(live.folderId);
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
	}).filter((v) => {
		if (!v || resolvedIds.has(v.id)) return false;
		resolvedIds.add(v.id);
		return true;
	});
}
/** Combined official adult pull shelves (Eporner + RedTube). */
function computeSelectAdultRemote(state) {
	const memo = memoFor(state);
	if (memo.adultRemote) return memo.adultRemote;
	const matching = state.videos.filter((v) => v.remote?.kind === "eporner" || v.remote?.kind === "redtube" || v.remote?.kind === "chaturbate" || v.remote?.kind === "myfreecams" || v.remote?.kind === "reddit" || v.remote?.kind === "booru" || v.remote?.kind === "redgifs" || ADULT_FOLDER_IDS.includes(v.folderId)).filter((video) => !state.hiddenVideos[video.id] && (state.showHiddenAdult || !(state.tags[video.id] ?? []).includes("hidden")));
	memo.adultRemote = dedupeAdultVideoCards([...new Map(matching.map((video) => [video.id, video])).values()]).sort((a, b) => b.addedAt - a.addedAt);
	return memo.adultRemote;
}
function computeSelectYoutube(state) {
	const memo = memoFor(state);
	if (memo.youtube) return memo.youtube;
	const previous = youtubeSelectorSnapshot;
	const sameVisibility = previous && previous.folders === state.folders && previous.unavailable === state.unavailable && previous.hiddenVideos === state.hiddenVideos && previous.hideDemo === state.hideDemo;
	let result;
	if (sameVisibility && previous.videos !== state.videos) {
		let sharedPrefix = previous.videos.length <= state.videos.length;
		for (let index = 0; sharedPrefix && index < previous.videos.length; index += 1) if (previous.videos[index] !== state.videos[index]) sharedPrefix = false;
		if (sharedPrefix) {
			const newVideos = state.videos.slice(previous.videos.length);
			const adult = adultIdSet(state.folders);
			const knownFolders = new Set(state.folders.map((folder) => folder.id));
			const added = newVideos.filter((video) => video.remote?.kind === "youtube" && !state.unavailable[video.id] && !state.hiddenVideos[video.id] && !adult.has(video.folderId) && (knownFolders.has(video.folderId) || Boolean(video.remote) || video.isSample) && !(state.hideDemo && video.isSample)).sort((a, b) => b.addedAt - a.addedAt);
			result = [];
			let oldIndex = 0, newIndex = 0;
			while (oldIndex < previous.result.length && newIndex < added.length) if (previous.result[oldIndex].addedAt >= added[newIndex].addedAt) result.push(previous.result[oldIndex++]);
			else result.push(added[newIndex++]);
			result.push(...previous.result.slice(oldIndex), ...added.slice(newIndex));
		} else result = [...publicList(state).filter((video) => video.remote?.kind === "youtube")].sort((a, b) => b.addedAt - a.addedAt);
	} else result = [...publicList(state).filter((video) => video.remote?.kind === "youtube")].sort((a, b) => b.addedAt - a.addedAt);
	memo.youtube = result;
	youtubeSelectorSnapshot = {
		videos: state.videos,
		folders: state.folders,
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
function selectFeatured(state, adult = false) {
	const cont = selectContinue(state, adult);
	if (cont[0]) return cont[0];
	const pool = adult ? scoped(state, true) : [...selectClassics(state), ...publicList(state).filter((video) => !video.remote && !isClassicVideo(video))];
	if (!pool.length) return void 0;
	return pool[Math.floor(Date.now() / 864e5) % pool.length];
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
	if (state.sourceId === "movies") keys.push("likes");
	if (state.sourceId === "history" || state.sourceId === "continue") keys.push("history");
	if (state.sourceId === "continue") keys.push("progress", "resumeProgress");
	else if (state.sort === "recent" && state.sourceId !== "history") keys.push("progress");
	return keys;
});
var selectYoutube = memoizeSelector(computeSelectYoutube, [
	"videos",
	"folders",
	"unavailable",
	"hiddenVideos",
	"hideDemo"
]);
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
function clearCatalogSelectorCaches() {
	for (const selector of catalogSelectors) selector.clear();
	selectorMemo = /* @__PURE__ */ new WeakMap();
}
useLibrary.subscribe((state, previous) => {
	if (state.videos === previous.videos && state.tags === previous.tags && state.folders === previous.folders && state.categories === previous.categories && state.hiddenVideos === previous.hiddenVideos) return;
	for (const selector of catalogSelectors) selector.evictStale(state);
});
require_react();
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[transform,background-color,color,opacity,box-shadow] duration-150 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:opacity-90",
			secondary: "bg-elevated text-fg shadow-border hover:shadow-border-hover",
			ghost: "text-muted hover:bg-elevated hover:text-fg",
			outline: "text-fg shadow-border hover:bg-elevated",
			danger: "bg-danger text-fg hover:opacity-90"
		},
		size: {
			default: "h-11 rounded-md px-4 text-sm",
			sm: "h-9 rounded-sm px-3 text-sm",
			lg: "h-12 rounded-lg px-5 text-sm",
			icon: "size-11 rounded-md",
			"icon-sm": "size-9 rounded-sm"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		"data-slot": "button",
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("h-11 w-full min-w-0 rounded-md bg-elevated px-3 text-sm text-fg shadow-border outline-none transition-[box-shadow] duration-150 placeholder:text-subtle", "focus-visible:shadow-border-hover focus-visible:ring-2 focus-visible:ring-ring/50", "disabled:cursor-not-allowed disabled:opacity-40", className),
		...props
	});
}
//#endregion
export { getSessionPhase as $, selectLive as $t, companionSetAutostart as A, watchTimeScore as An, releaseArtwork as At, getCompanionMemorySnapshot as B, saveDurablePhotos as Bt, companionGetThumb as C, topicsForVideo as Cn, measureInteraction as Ct, companionListPrints as D, useLibrary as Dn, rankingFeedbackSnapshot as Dt, companionInspectMedia as E, updatePullSettings as En, pullsPaused as Et, ensureImageBudgetVisibilityHook as F, youtubeSourceIndex as Fn, restoreDurablePhotos as Ft, getInteractionPriorityDelay as G, scheduleBackgroundWork as Gt, getFeedbackDiagnostics as H, saveDurableShelves as Ht, exportFeedback as I, youtubeSweepDue as In, resumeForVideo as It, getPullCancellationRevision as J, selectClassics as Jt, getNote as K, searchRedtubeStars as Kt, fetchAdultComments as L, youtubeVideosForSource as Ln, saveDurableHistory as Lt, createLocalId as M, yieldCatalogTask as Mn, resolveBooruOriginal as Mt, createShortLocalId as N, youtubeCreatorProfiles as Nn, resolveCreatorCoverage as Nt, companionReadPrint as O, useSourceAssets as On, ratingPreference as Ot, creatorIsLiked as P, youtubeSourceCounts as Pn, resolvePlayUrl as Pt, getRatingStreakSnapshot as Q, selectHistory as Qt, fetchTwitchFollowing as R, saveDurableLinks as Rt, companionExportLibraryPack as S, topicEvidence as Sn, markYoutubeSelectorReady as St, companionImportLibraryPack as T, trimObjectUrls as Tn, planFollowRemoval as Tt, getHeartedTagHistory as U, saveFollows as Ut, getCreatorRating as V, saveDurableResume as Vt, getInteractionBudgetSnapshot as W, saveThumbCache as Wt, getPullSettings as X, selectFavorites as Xt, getPullQueueSnapshot as Y, selectContinue as Yt, getRating as Z, selectFeatured as Zt, clearCatalogSelectorCaches as _, tagHasHeartHistory as _n, loadThumbCache as _t, RECOMMENDED_FOLDERS as a, setCreatorRating as an, hasFreshViewerCount as at, companionArtworkAudit as b, toggleCreatorLike as bn, markYoutubeArtworkReady as bt, adultArchiveDepthLabel as c, setPullsPaused as cn, isArtworkSuppressed as ct, artworkBytes as d, subscribeArtworkSuppression as dn, isTopicTag as dt, selectTwitch as en, getSourceMemorySnapshot as et, artworkUrl as f, subscribePullControl as fn, linksFromHistoryAndResume as ft, catalogPullAvailable as g, subscribeYoutubeTrace as gn, loadDurablePhotosSync as gt, canonicalTopic as h, subscribeSessionPhase as hn, loadCatalogVideo as ht, RATING_GOALS as i, selectYoutubeSweepChannels as in, getYoutubeTraceRevision as it, companionSteamEpicGames as j, withCatalogDetails as jn, rememberVideo as jt, companionSavePrint as k, userFolderCount as kn, recordWatchTime as kt, allowAutomaticRefresh as l, setRating as ln, isClassicVideo as lt, cancelQueuedPulls as m, subscribePullSettings as mn, loadCachedThumb as mt, Input as n, selectYoutube as nn, getWatchTimeLedger as nt, acquireImageSlot as o, setNote as on, importFeedback as ot, binaryArtwork as p, subscribePullQueue as pn, loadAdultArchiveCursors as pt, getPersistenceMemorySnapshot as q, selectAdultRemote as qt, DEFAULT_PULL_SETTINGS as r, selectYoutubeLiveChannels as rn, getYoutubeFirstClickTrace as rt, activityLookupAsync as s, setPullViewerOpen as sn, isAdultVideo as st, Button as t, selectVisible as tn, getWatchTime as tt, allowCardArtwork as u, setRatingWeeklyGoal as un, isLikelyPlayable as ut, clearLowPriorityImageQueue as v, tagIsLiked as vn, lookupVideo as vt, companionHealth as w, trackSessionActivity as wn, peekYoutubeOwner as wt, companionCacheThumbUrl as x, toggleTagLike as xn, markYoutubeRailReady as xt, companionAckJobs as y, titleOf as yn, lookupVideos as yt, forEachCatalogSlice as z, saveDurableMarks as zt };
