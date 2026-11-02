import { r as __exportAll } from "../_runtime.mjs";
import { Jt as __exportAll$1 } from "./twitch-retry-D5SsgGzE.mjs";
import { Ca as saveAnimeReviews, Hn as loadAnimeReviewsSync, Sr as newestAnimeReviews, Vi as restoreAnimeReviews, Vr as parseAnimeReviews, jr as normalizeAnimeReviews, s as EMPTY_ANIME_REVIEWS } from "./persist-BLKyjE-q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/anime-review-store-CoPJbh9Y.js
var anime_review_store_CoPJbh9Y_exports = /* @__PURE__ */ __exportAll({
	a: () => hydrateAnimeReviews,
	i: () => getServerAnimeReviews,
	n: () => changeAnimeReviews,
	o: () => retryAnimeReviewSave,
	r: () => getAnimeReviews,
	s: () => subscribeAnimeReviews,
	t: () => anime_review_store_exports
});
var anime_review_store_exports = /* @__PURE__ */ __exportAll$1({
	changeAnimeReviews: () => changeAnimeReviews,
	getAnimeReviews: () => getAnimeReviews,
	getServerAnimeReviews: () => getServerAnimeReviews,
	hydrateAnimeReviews: () => hydrateAnimeReviews,
	importAnimeReviews: () => importAnimeReviews,
	retryAnimeReviewSave: () => retryAnimeReviewSave,
	subscribeAnimeReviews: () => subscribeAnimeReviews
});
var server = {
	ledger: EMPTY_ANIME_REVIEWS,
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
function getAnimeReviews() {
	if (!started && typeof window !== "undefined") {
		started = true;
		snapshot = {
			...snapshot,
			ledger: normalizeAnimeReviews(loadAnimeReviewsSync())
		};
	}
	return snapshot;
}
var getServerAnimeReviews = () => server;
function subscribeAnimeReviews(listener) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}
function hydrateAnimeReviews() {
	getAnimeReviews();
	if (typeof window === "undefined") return Promise.resolve();
	return pending ??= restoreAnimeReviews().then((saved) => {
		const next = newestAnimeReviews(saved, snapshot.ledger);
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
	saveAnimeReviews(snapshot.ledger).then((ok) => {
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
function changeAnimeReviews(change) {
	const old = getAnimeReviews().ledger, next = change(old);
	if (next === old) return;
	snapshot = {
		...snapshot,
		ledger: next
	};
	save();
}
function retryAnimeReviewSave() {
	save();
}
function importAnimeReviews(raw) {
	const old = getAnimeReviews().ledger, parsed = parseAnimeReviews(raw);
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
export { hydrateAnimeReviews as a, getServerAnimeReviews as i, changeAnimeReviews as n, retryAnimeReviewSave as o, getAnimeReviews as r, subscribeAnimeReviews as s, anime_review_store_CoPJbh9Y_exports as t };
