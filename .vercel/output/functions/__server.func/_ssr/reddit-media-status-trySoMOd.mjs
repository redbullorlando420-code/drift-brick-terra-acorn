import { dt as isRedditRemovalText, ft as isRedditRemovalUrl } from "./live-rooms-9iiWP3WP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reddit-media-status-trySoMOd.js
var hosts = /* @__PURE__ */ new Set([
	"i.redd.it",
	"preview.redd.it",
	"external-preview.redd.it"
]);
var cache = /* @__PURE__ */ new Map();
var pending = /* @__PURE__ */ new Map();
function allowed(raw) {
	try {
		const url = new URL(raw);
		return url.protocol === "https:" && hosts.has(url.hostname) && !url.username && !url.password && !url.port;
	} catch {
		return false;
	}
}
/** On demand for the selected photo only. Inspect headers or at most 32 KiB;
* ordinary images are never downloaded a second time. Redirects stay allowlisted. */
async function inspectRedditImageUrl(raw, request = fetch) {
	if (!allowed(raw)) return { removed: false };
	if (isRedditRemovalUrl(raw)) return { removed: true };
	const saved = cache.get(raw);
	if (saved && saved.until > Date.now()) return saved.result;
	if (pending.has(raw)) return pending.get(raw);
	if (pending.size >= 4) return { removed: false };
	const job = (async () => {
		const signal = AbortSignal.timeout(3e3);
		let url = raw;
		try {
			for (let hop = 0; hop < 3; hop++) {
				const response = await request(url, {
					signal,
					redirect: "manual",
					headers: { Range: "bytes=0-32767" }
				});
				if (response.status >= 300 && response.status < 400) {
					await response.body?.cancel();
					const location = response.headers.get("location");
					if (!location) break;
					const next = new URL(location, url).href;
					if (!allowed(next)) break;
					if (isRedditRemovalUrl(next)) return { removed: true };
					url = next;
					continue;
				}
				const type = response.headers.get("content-type") ?? "";
				if (!response.ok || !/(?:svg|xml|html|text\/plain)/i.test(type)) {
					await response.body?.cancel();
					return { removed: false };
				}
				const reader = response.body?.getReader();
				if (!reader) return { removed: false };
				let bytes = 0, text = "";
				const decoder = new TextDecoder();
				try {
					while (bytes < 32768) {
						const chunk = await reader.read();
						if (chunk.done) break;
						const part = chunk.value.subarray(0, 32768 - bytes);
						bytes += part.length;
						text += decoder.decode(part, { stream: true });
					}
					text += decoder.decode();
				} finally {
					await reader.cancel().catch(() => void 0);
				}
				return { removed: isRedditRemovalText(text) };
			}
		} catch {}
		return { removed: false };
	})();
	pending.set(raw, job);
	try {
		const result = await job;
		if (cache.size >= 256) cache.delete(cache.keys().next().value);
		cache.set(raw, {
			until: Date.now() + (result.removed ? 36e5 : 6e4),
			result
		});
		return result;
	} finally {
		pending.delete(raw);
	}
}
//#endregion
export { inspectRedditImageUrl };
