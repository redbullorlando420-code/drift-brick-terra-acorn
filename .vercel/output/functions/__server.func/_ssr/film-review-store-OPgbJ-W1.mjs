import { r as __exportAll } from "../_runtime.mjs";
import { Jt as __exportAll$1 } from "./twitch-retry-D5SsgGzE.mjs";
import { Hr as parseFilmLedger, Ia as saveFilmReviews, Jn as loadFilmReviewsSync, Pr as normalizeFilmLedger, Tr as newestFilms, d as EMPTY_FILMS, ta as restoreFilmReviews } from "./persist-BLKyjE-q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/film-review-store-OPgbJ-W1.js
var film_review_store_OPgbJ_W1_exports = /* @__PURE__ */ __exportAll({
	a: () => hydrateFilmReviews,
	i: () => getServerFilmReviews,
	n: () => film_review_store_exports,
	o: () => retryFilmReviewSave,
	r: () => getFilmReviews,
	s: () => subscribeFilmReviews,
	t: () => changeFilmReviews
});
var film_review_store_exports = /* @__PURE__ */ __exportAll$1({
	changeFilmReviews: () => changeFilmReviews,
	getFilmReviews: () => getFilmReviews,
	getServerFilmReviews: () => getServerFilmReviews,
	hydrateFilmReviews: () => hydrateFilmReviews,
	importFilmReviews: () => importFilmReviews,
	retryFilmReviewSave: () => retryFilmReviewSave,
	subscribeFilmReviews: () => subscribeFilmReviews
});
var server = {
	ledger: EMPTY_FILMS,
	status: "saved",
	ready: false
};
var listeners = /* @__PURE__ */ new Set();
var snapshot = server;
var started = false;
var pending;
var attempt = 0;
var emit = () => {
	for (const listener of listeners) listener();
};
function getFilmReviews() {
	if (!started && typeof window !== "undefined") {
		started = true;
		snapshot = {
			...snapshot,
			ledger: normalizeFilmLedger(loadFilmReviewsSync())
		};
	}
	return snapshot;
}
var getServerFilmReviews = () => server;
function subscribeFilmReviews(listener) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}
function hydrateFilmReviews() {
	getFilmReviews();
	if (typeof window === "undefined") return Promise.resolve();
	return pending ??= restoreFilmReviews().then((saved) => {
		const next = newestFilms(saved, snapshot.ledger);
		snapshot = {
			...snapshot,
			ledger: JSON.stringify(next) === JSON.stringify(snapshot.ledger) ? snapshot.ledger : next,
			ready: true
		};
		emit();
	}).catch(() => {
		snapshot = {
			...snapshot,
			ready: true
		};
		pending = void 0;
		emit();
	});
}
function save() {
	const current = ++attempt;
	snapshot = {
		...snapshot,
		status: "pending"
	};
	emit();
	saveFilmReviews(snapshot.ledger).then((ok) => {
		if (current !== attempt) return;
		snapshot = {
			...snapshot,
			status: ok ? "saved" : "failed"
		};
		emit();
	}, () => {
		if (current !== attempt) return;
		snapshot = {
			...snapshot,
			status: "failed"
		};
		emit();
	});
}
function changeFilmReviews(change) {
	const old = getFilmReviews().ledger, next = change(old);
	if (next === old) return;
	snapshot = {
		...snapshot,
		ledger: next
	};
	save();
}
function retryFilmReviewSave() {
	save();
}
function importFilmReviews(raw) {
	const old = getFilmReviews().ledger, parsed = parseFilmLedger(raw);
	snapshot = {
		...snapshot,
		ledger: {
			...parsed,
			updatedAt: Math.max(Date.now(), old.updatedAt + 1)
		}
	};
	save();
}
//#endregion
export { hydrateFilmReviews as a, getServerFilmReviews as i, film_review_store_OPgbJ_W1_exports as n, retryFilmReviewSave as o, getFilmReviews as r, subscribeFilmReviews as s, changeFilmReviews as t };
