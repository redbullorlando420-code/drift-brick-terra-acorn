//#region node_modules/.nitro/vite/services/ssr/assets/interaction-budget-2wyu0HNo.js
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
//#endregion
export { scheduleBackgroundWork as a, prioritizeInteraction as i, getInteractionPriorityDelay as n, measureInteraction as r, getInteractionBudgetSnapshot as t };
