import { r as __exportAll } from "../_runtime.mjs";
import { Jt as __exportAll$1 } from "./twitch-retry-C3xxOucA.mjs";
import { $a as saveFilmReviews, Fr as newestFilms, Gr as normalizeFilmLedger, d as EMPTY_FILMS, ei as parseFilmLedger, tr as loadFilmReviewsSync, va as restoreFilmReviews } from "./persist-BKzTZjAH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/film-review-store-DJpue6ks.js
var film_review_store_DJpue6ks_exports = /* @__PURE__ */ __exportAll({
	a: () => getServerFilmReviews,
	c: () => subscribeFilmReviews,
	i: () => getFilmReviews,
	n: () => changeFilmReviewsDurably,
	o: () => hydrateFilmReviews,
	r: () => film_review_store_exports,
	s: () => retryFilmReviewSave,
	t: () => changeFilmReviews
});
var film_review_store_exports = /* @__PURE__ */ __exportAll$1({
	changeFilmReviews: () => changeFilmReviews,
	changeFilmReviewsDurably: () => changeFilmReviewsDurably,
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
var durableBusy = false;
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
	if (durableBusy) throw Error("Wait for the reviewed movie import to finish saving.");
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
	if (durableBusy) throw Error("Wait for the reviewed movie import to finish saving.");
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
async function changeFilmReviewsDurably(expected, change) {
	const old = getFilmReviews();
	if (durableBusy || !old.ready || old.status === "pending" || old.ledger !== expected) throw Error("Film reviews changed or are still saving. Preview the import again.");
	durableBusy = true;
	snapshot = {
		...old,
		status: "pending"
	};
	emit();
	try {
		const latest = await restoreFilmReviews();
		if (JSON.stringify(latest) !== JSON.stringify(expected) || getFilmReviews().ledger !== expected) throw Error("Saved film reviews changed in another tab. Reload Movies and preview again.");
		const next = change(expected);
		if (next === expected) {
			snapshot = old;
			return false;
		}
		if (!await saveFilmReviews(next)) throw Error("Browser storage could not save the import. Previous film fields remain active.");
		snapshot = {
			ledger: next,
			status: "saved",
			ready: true
		};
		return true;
	} catch (e) {
		snapshot = old;
		throw e;
	} finally {
		durableBusy = false;
		emit();
	}
}
//#endregion
export { getServerFilmReviews as a, subscribeFilmReviews as c, getFilmReviews as i, changeFilmReviewsDurably as n, hydrateFilmReviews as o, film_review_store_DJpue6ks_exports as r, retryFilmReviewSave as s, changeFilmReviews as t };
