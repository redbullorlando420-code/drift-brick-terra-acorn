import { r as __exportAll } from "../_runtime.mjs";
import { Jt as __exportAll$1 } from "./twitch-retry-C3xxOucA.mjs";
import { l as profileLocalStorage } from "./local-profile-storage-CUAAAjCd.mjs";
import { o as subscribePerformanceProfile, r as getPerformanceProfile } from "./performance-profile-DmjhxzD1.mjs";
import { i as getServerFnById, n as createServerFn, r as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { i as prioritizeInteraction, n as getInteractionPriorityDelay } from "./interaction-budget-2wyu0HNo.mjs";
import { n as pullDispatchTrace } from "./pull-dispatch-trace-C71-V1QT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/functions-BQe-F8Mr.js
var functions_BQe_F8Mr_exports = /* @__PURE__ */ __exportAll({
	A: () => clearLowPriorityImageQueue,
	B: () => DEFAULT_PULL_SETTINGS,
	C: () => setPullViewerOpen,
	D: () => subscribePullQueue,
	E: () => subscribePullControl,
	F: () => watchImageSlot,
	G: () => PullPriorityDeferredError,
	H: () => getPullSettings,
	I: () => dataSaverActive,
	J: () => archiveNotBefore,
	K: () => DEFAULT_ARCHIVE_WINDOW,
	L: () => getDataSaverMode,
	M: () => getImageLoadBudgetSnapshot,
	N: () => isArtworkSuppressed,
	O: () => waitForCatalogCommit,
	P: () => subscribeArtworkSuppression,
	R: () => setDataSaverMode,
	S: () => setActivePullPage,
	T: () => subscribePullAvailability,
	U: () => subscribePullSettings,
	V: () => adultGrowthPreset,
	W: () => updatePullSettings,
	X: () => archiveWindowState,
	Y: () => archiveWindowLabel,
	Z: () => validArchiveWindow,
	_: () => cancelQueuedPulls,
	a: () => fetchTwitchFollowing,
	b: () => getPullQueueSnapshot,
	c: () => importChannels,
	d: () => resolveBooruOriginal,
	f: () => searchAdultVideos,
	g: () => automaticPullAvailable,
	h: () => createSsrRpc,
	i: () => fetchTwitchChapters,
	j: () => ensureImageBudgetVisibilityHook,
	k: () => waitForPulls,
	l: () => inspectRedditImage,
	m: () => youtubeCreatorProfiles,
	n: () => fetchAdultComments,
	o: () => followRemote,
	p: () => searchRedtubeStars,
	q: () => archiveClock,
	r: () => fetchLiveRooms,
	s: () => functions_exports,
	t: () => checkTwitchAlias,
	u: () => refreshRemotes,
	v: () => catalogPullAvailable,
	w: () => setPullsPaused,
	x: () => pullsPaused,
	y: () => getPullCancellationRevision,
	z: () => subscribeDataSaver
});
var DEFAULT_ARCHIVE_WINDOW = Object.freeze({
	version: 1,
	enabled: false,
	startMinute: 60,
	endMinute: 360,
	timeZone: "UTC"
});
function validArchiveWindow(raw) {
	const value = raw;
	if (!value || value.version !== 1 || typeof value.enabled !== "boolean" || ![value.startMinute, value.endMinute].every((n) => Number.isInteger(n) && n >= 0 && n < 1440) || value.startMinute === value.endMinute || typeof value.timeZone !== "string" || value.timeZone.length > 80) return false;
	try {
		new Intl.DateTimeFormat("en-GB", { timeZone: value.timeZone }).format(0);
		return true;
	} catch {
		return false;
	}
}
function normalizeArchiveWindow(raw) {
	if (raw === void 0) return DEFAULT_ARCHIVE_WINDOW;
	if (validArchiveWindow(raw)) {
		if (Object.isFrozen(raw) && Object.keys(raw).every((key) => [
			"version",
			"enabled",
			"startMinute",
			"endMinute",
			"timeZone"
		].includes(key))) return raw;
		return Object.freeze({
			version: 1,
			enabled: raw.enabled,
			startMinute: raw.startMinute,
			endMinute: raw.endMinute,
			timeZone: raw.timeZone
		});
	}
	return Object.freeze({
		version: 1,
		enabled: true,
		startMinute: 0,
		endMinute: 0,
		timeZone: ""
	});
}
var cache = /* @__PURE__ */ new Map();
/** Daily wall-clock windows: both repeated DST hours apply; skipped minutes
* have no real instants. Cache until the next actual boundary, without polling. */
function archiveWindowState(window, now = Date.now()) {
	if (!window) return {
		open: true,
		valid: true,
		nextChangeAt: Infinity
	};
	const key = JSON.stringify(window), saved = cache.get(key);
	if (saved && now >= saved.from && now < saved.state.nextChangeAt) return saved.state;
	const valid = validArchiveWindow(window);
	if (!valid || !window.enabled) {
		const state = {
			open: valid && !window.enabled,
			valid,
			nextChangeAt: Infinity
		};
		if (cache.size >= 8) cache.delete(cache.keys().next().value);
		cache.set(key, {
			from: now,
			state
		});
		return state;
	}
	const formatter = new Intl.DateTimeFormat("en-GB", {
		timeZone: window.timeZone,
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23"
	});
	const isOpen = (at) => {
		const time = formatter.format(at), minute = Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
		return window.startMinute < window.endMinute ? minute >= window.startMinute && minute < window.endMinute : minute >= window.startMinute || minute < window.endMinute;
	};
	const open = isOpen(now);
	let nextChangeAt = Infinity;
	for (let at = Math.floor(now / 6e4) * 6e4 + 6e4, end = at + 1728e5; at <= end; at += 6e4) if (isOpen(at) !== open) {
		nextChangeAt = at;
		break;
	}
	const state = {
		open,
		valid: true,
		nextChangeAt
	};
	if (cache.size >= 8) cache.delete(cache.keys().next().value);
	cache.set(key, {
		from: now,
		state
	});
	return state;
}
var archiveNotBefore = (window, now = Date.now()) => {
	const state = archiveWindowState(window, now);
	return state.open ? 0 : state.nextChangeAt;
};
var archiveClock = (minute) => `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
function archiveWindowLabel(window, now = Date.now()) {
	const state = archiveWindowState(window, now);
	if (!state.valid) return "Archive schedule needs repair. Automatic catalog work is held; save valid hours or disable the schedule.";
	if (!window?.enabled) return "Automatic archive hours: unrestricted.";
	const span = `${archiveClock(window.startMinute)}–${archiveClock(window.endMinute)} ${window.timeZone}${window.startMinute > window.endMinute ? " (overnight)" : ""}`;
	return state.open ? `Archive window open · ${span}.` : `Paused by archive schedule · ${span}. Next opening: ${new Date(state.nextChangeAt).toLocaleString(void 0, { timeZone: window.timeZone })} ${window.timeZone}.`;
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
var DEFAULT_PULL_SETTINGS = Object.freeze({
	archiveWorkWindow: DEFAULT_ARCHIVE_WINDOW,
	requestGapMs: 1500,
	youtubeRequestGapMs: 80,
	concurrentRequests: 1,
	youtubeBatchVideos: 100,
	youtubeSourcesPerSweep: 32,
	youtubeIntervalSeconds: 300,
	adultBatchVideos: 1e4,
	adultIntervalSeconds: 60,
	adultCatalogTarget: 25e4,
	automaticPulls: true,
	pauseWhileWatching: true,
	sharedCapCleanup: true,
	remoteMaxEntries: 5e5,
	youtubeMaxEntries: 1e5,
	twitchMaxEntries: 25e3,
	adultMaxEntries: 3e5,
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
	adultBatchVideos: [20, 5e4],
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
	next.archiveWorkWindow = normalizeArchiveWindow(input.archiveWorkWindow);
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
function adultGrowthPreset(current) {
	const adultMaxEntries = current.adultMaxEntries === 0 ? 0 : Math.max(current.adultMaxEntries, 3e5);
	return {
		adultBatchVideos: Math.max(current.adultBatchVideos, 1e4),
		adultIntervalSeconds: Math.min(current.adultIntervalSeconds, 60),
		adultCatalogTarget: Math.max(current.adultCatalogTarget, 25e4),
		adultMaxEntries,
		remoteMaxEntries: current.remoteMaxEntries === 0 ? 0 : Math.min(1e6, Math.max(current.remoteMaxEntries, adultMaxEntries + current.youtubeMaxEntries + current.twitchMaxEntries + current.otherMaxEntries))
	};
}
var KEY$1 = "reelcase.pull-settings.v1";
var settings = DEFAULT_PULL_SETTINGS;
var hydrated$1 = false;
var listeners$1 = /* @__PURE__ */ new Set();
function getPullSettings() {
	if (!hydrated$1 && typeof window !== "undefined") {
		hydrated$1 = true;
		try {
			settings = Object.freeze(normalizePullSettings(JSON.parse(profileLocalStorage.getItem(KEY$1) ?? "null")));
		} catch {}
	}
	return settings;
}
var subscribePullSettings = (listener) => {
	listeners$1.add(listener);
	return () => {
		listeners$1.delete(listener);
	};
};
function updatePullSettings(patch) {
	settings = Object.freeze(normalizePullSettings({
		...getPullSettings(),
		...patch
	}));
	let saved = true;
	try {
		profileLocalStorage.setItem(KEY$1, JSON.stringify(settings));
	} catch {
		saved = false;
	}
	for (const listener of listeners$1) listener();
	return saved;
}
if (typeof window !== "undefined") {
	const onStorage = (event) => {
		if (event.key !== KEY$1) return;
		try {
			settings = Object.freeze(normalizePullSettings(JSON.parse(event.newValue ?? "null")));
		} catch {
			settings = DEFAULT_PULL_SETTINGS;
		}
		hydrated$1 = true;
		for (const listener of listeners$1) listener();
	};
	window.addEventListener("storage", onStorage);
}
var DATA_SAVER_KEY = "reelcase.data-saver.v1";
var mode;
var sessionOnly = false;
var listeners = /* @__PURE__ */ new Set();
var read = () => {
	try {
		return profileLocalStorage.getItem("reelcase.data-saver.v1") === "save-data" ? "save-data" : "adaptive";
	} catch {
		return "adaptive";
	}
};
var getDataSaverMode = () => typeof window === "undefined" ? "adaptive" : mode ??= read();
var dataSaverActive = () => getDataSaverMode() === "save-data" || typeof navigator !== "undefined" && navigator.connection?.saveData === true;
function setDataSaverMode(value) {
	mode = value === "save-data" ? value : "adaptive";
	try {
		profileLocalStorage.setItem(DATA_SAVER_KEY, mode);
		sessionOnly = false;
	} catch {
		sessionOnly = true;
	}
	for (const notify of listeners) notify();
}
var stop;
function subscribeDataSaver(notify) {
	if (!listeners.size && typeof window !== "undefined") {
		if (!sessionOnly) mode = void 0;
		const storage = (event) => {
			if (event.key === "reelcase.data-saver.v1" || event.key === null) {
				mode = void 0;
				for (const fn of listeners) fn();
			}
		};
		const change = () => {
			for (const fn of listeners) fn();
		};
		const connection = navigator.connection;
		window.addEventListener("storage", storage);
		connection?.addEventListener("change", change);
		stop = () => {
			window.removeEventListener("storage", storage);
			connection?.removeEventListener("change", change);
		};
	}
	listeners.add(notify);
	return () => {
		listeners.delete(notify);
		if (!listeners.size) {
			stop?.();
			stop = void 0;
			if (!sessionOnly) mode = void 0;
		}
	};
}
/**
* Bound concurrent remote thumbnail fetches so Adults shelves do not stall
* scroll with hundreds of parallel CDN requests / retries.
* Visible cards use a high-priority lane; speculative/offscreen work waits.
*/
var artworkSuppressed = false;
var pageSuspended = false;
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
	return artworkSuppressed || pageSuspended || typeof document !== "undefined" && document.visibilityState === "hidden";
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
		pageSuspended = true;
		pump();
	};
	const show = () => {
		pageSuspended = false;
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
var KEY = "reelcase.pulls-paused.v1";
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
		control.set(profileLocalStorage.getItem(KEY) === "true");
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
		profileLocalStorage.setItem(KEY, String(value));
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
		if (event.key === KEY) {
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
		canStart: options?.automatic && !options.live ? () => automaticPullAvailable(options.provider) && archiveWindowState(getPullSettings().archiveWorkWindow).open : void 0,
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
var functions_exports = /* @__PURE__ */ __exportAll$1({
	checkTwitchAlias: () => checkTwitchAlias,
	checkTwitchMedia: () => checkTwitchMedia,
	fetchAdultComments: () => fetchAdultComments,
	fetchLiveRooms: () => fetchLiveRooms,
	fetchTwitchChapters: () => fetchTwitchChapters,
	fetchTwitchFollowing: () => fetchTwitchFollowing,
	followRemote: () => followRemote,
	importChannels: () => importChannels,
	inspectRedditImage: () => inspectRedditImage,
	refreshRemotes: () => refreshRemotes,
	resolveBooruOriginal: () => resolveBooruOriginal,
	searchAdultVideos: () => searchAdultVideos,
	searchRedtubeStars: () => searchRedtubeStars,
	youtubeCreatorProfiles: () => youtubeCreatorProfiles
});
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
}), {
	automatic: (args[0]?.data)?.automatic === true,
	provider: "adults",
	signal: args[0]?.signal
});
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
var checkTwitchMedia = createServerFn({ method: "POST" }).validator(input).handler(createSsrRpc("068b0d00dc1932fef152dacc0d17645179dedb7c0f25ceff81a3415147d54479"));
var checkTwitchAlias = createServerFn({ method: "POST" }).validator(input).handler(createSsrRpc("52010d1b7260c39fd9ed2192262cef608d7bb8450518e03f1cb84f580fdeb641"));
//#endregion
export { isArtworkSuppressed as A, subscribeArtworkSuppression as B, getDataSaverMode as C, getPullSettings as D, getPullQueueSnapshot as E, searchRedtubeStars as F, subscribePullSettings as G, subscribePullAvailability as H, setActivePullPage as I, waitForCatalogCommit as J, updatePullSettings as K, setDataSaverMode as L, refreshRemotes as M, resolveBooruOriginal as N, importChannels as O, searchAdultVideos as P, setPullViewerOpen as R, functions_BQe_F8Mr_exports as S, getPullCancellationRevision as T, subscribePullControl as U, subscribeDataSaver as V, subscribePullQueue as W, watchImageSlot as X, waitForPulls as Y, youtubeCreatorProfiles as Z, fetchAdultComments as _, archiveClock as a, fetchTwitchFollowing as b, archiveWindowState as c, catalogPullAvailable as d, checkTwitchAlias as f, ensureImageBudgetVisibilityHook as g, dataSaverActive as h, adultGrowthPreset as i, pullsPaused as j, inspectRedditImage as k, automaticPullAvailable as l, createSsrRpc as m, DEFAULT_PULL_SETTINGS as n, archiveNotBefore as o, clearLowPriorityImageQueue as p, validArchiveWindow as q, PullPriorityDeferredError as r, archiveWindowLabel as s, DEFAULT_ARCHIVE_WINDOW as t, cancelQueuedPulls as u, fetchLiveRooms as v, getImageLoadBudgetSnapshot as w, followRemote as x, fetchTwitchChapters as y, setPullsPaused as z };
