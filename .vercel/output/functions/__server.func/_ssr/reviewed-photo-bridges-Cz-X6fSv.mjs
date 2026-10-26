import { vr as bridgeText } from "./library-app-CrsCDQmv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reviewed-photo-bridges-Cz-X6fSv.js
var EMPTY = Object.freeze([]);
var rows = EMPTY;
var listeners = /* @__PURE__ */ new Set();
var getReviewedPhotos = () => rows;
function setReviewedPhotos(next) {
	rows = Object.freeze(next.slice(0, 48).map((photo, index) => Object.freeze({
		id: "reviewed-photo:" + index,
		name: bridgeText(photo.name),
		tags: Object.freeze(photo.tags.filter((tag) => typeof tag === "string").slice(0, 80)),
		reviewed: photo.reviewed === true,
		direct: photo.direct === true,
		hidden: photo.hidden === true
	})));
	for (const listener of listeners) listener();
}
function clearReviewedPhotos() {
	if (!rows.length) return;
	rows = EMPTY;
	for (const listener of listeners) listener();
}
var subscribeReviewedPhotos = (listener) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};
var getServerReviewedPhotos = () => EMPTY;
//#endregion
export { subscribeReviewedPhotos as a, setReviewedPhotos as i, getReviewedPhotos as n, getServerReviewedPhotos as r, clearReviewedPhotos as t };
