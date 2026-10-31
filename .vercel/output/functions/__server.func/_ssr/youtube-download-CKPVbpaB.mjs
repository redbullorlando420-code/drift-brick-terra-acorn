//#region node_modules/.nitro/vite/services/ssr/assets/youtube-download-CKPVbpaB.js
var target = null;
var listeners = /* @__PURE__ */ new Set();
var subscribeYoutubeDownload = (listener) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};
var getYoutubeDownload = () => target;
var getServerYoutubeDownload = () => null;
function youtubeDownloadTarget(video) {
	if (video.remote?.kind !== "youtube") return null;
	let id = video.remote.videoId;
	if (!id && video.remote.watchUrl) try {
		const url = new URL(video.remote.watchUrl);
		if ([
			"www.youtube.com",
			"youtube.com",
			"m.youtube.com"
		].includes(url.hostname)) id = url.searchParams.get("v") ?? url.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]{11})$/)?.[1];
		else if (url.hostname === "youtu.be") id = url.pathname.slice(1);
	} catch {}
	return id && /^[\w-]{11}$/.test(id) ? {
		videoId: id,
		title: video.name,
		live: Boolean(video.remote.live),
		...Number.isSafeInteger(video.size) && video.size > 0 ? { estimatedBytes: video.size } : {}
	} : null;
}
function openYoutubeDownload(video) {
	const next = youtubeDownloadTarget(video);
	if (!next) return;
	target = next;
	for (const listener of listeners) listener();
}
function closeYoutubeDownload() {
	target = null;
	for (const listener of listeners) listener();
}
//#endregion
export { subscribeYoutubeDownload as a, openYoutubeDownload as i, getServerYoutubeDownload as n, youtubeDownloadTarget as o, getYoutubeDownload as r, closeYoutubeDownload as t };
