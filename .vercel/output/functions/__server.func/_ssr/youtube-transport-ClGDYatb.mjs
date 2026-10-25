import { r as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { n as ProviderBudgetError, t as PROVIDER_BUDGETS } from "./provider-budgets-BFeaFj2c.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/youtube-transport-ClGDYatb.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
/** Count actual decompressed UTF-8 bytes, including chunked responses with no
* length header. Reject a whole oversized page; never publish truncated JSON. */
async function readProviderBody(response, options = {}) {
	const maximum = Math.max(1, Math.floor(options.maxBytes ?? PROVIDER_BUDGETS.responseBytes));
	if (!Number.isFinite(maximum)) throw new Error("Invalid metadata byte budget");
	options.signal?.throwIfAborted();
	if (!response.body) return /* @__PURE__ */ new Uint8Array();
	const reader = response.body.getReader();
	const blocks = [];
	let bytes = 0, allocated = 0, used = 0;
	const append = (value) => {
		let offset = 0;
		while (offset < value.byteLength) {
			let block = blocks[blocks.length - 1];
			if (!block || used === block.byteLength) {
				block = new Uint8Array(Math.min(65536, maximum - allocated));
				blocks.push(block);
				allocated += block.byteLength;
				used = 0;
			}
			const length = Math.min(value.byteLength - offset, block.byteLength - used);
			block.set(value.subarray(offset, offset + length), used);
			used += length;
			offset += length;
			bytes += length;
		}
	};
	const controller = new AbortController();
	const signal = options.signal ? AbortSignal.any([options.signal, controller.signal]) : controller.signal;
	const timer = setTimeout(() => controller.abort(new DOMException("Provider metadata body timed out", "TimeoutError")), options.timeoutMs ?? PROVIDER_BUDGETS.bodyTimeoutMs);
	let fail = () => {};
	const aborted = new Promise((_resolve, reject) => {
		fail = reject;
	});
	const abort = () => {
		reader.cancel(signal.reason).catch(() => void 0);
		fail(signal.reason);
	};
	signal.addEventListener("abort", abort, { once: true });
	try {
		if (signal.aborted) abort();
		while (true) {
			const { value, done } = await Promise.race([reader.read(), aborted]);
			signal.throwIfAborted();
			if (done) break;
			if (bytes + value.byteLength > maximum) {
				if (!options.prefix) throw new ProviderBudgetError("bytes", `Provider metadata exceeded the ${maximum.toLocaleString()}-byte response budget; the incomplete page was not accepted.`);
				const remaining = maximum - bytes;
				if (remaining) append(value.subarray(0, remaining));
				reader.cancel().catch(() => void 0);
				break;
			}
			if (value.byteLength) append(value);
			if (options.prefix && bytes === maximum) {
				reader.cancel().catch(() => void 0);
				break;
			}
		}
		const result = new Uint8Array(bytes);
		let offset = 0;
		for (const block of blocks) {
			const length = Math.min(block.byteLength, bytes - offset);
			result.set(block.subarray(0, length), offset);
			offset += length;
		}
		return result;
	} catch (error) {
		reader.cancel(error).catch(() => void 0);
		throw error;
	} finally {
		clearTimeout(timer);
		signal.removeEventListener("abort", abort);
		reader.releaseLock();
	}
}
/** Serialize complete transfers through a bounded shared lane. A cancelled
* queued job releases its closure immediately and never reaches fetch. */
function createProviderMetadataTransport(concurrency, fetcher = (...args) => globalThis.fetch(...args)) {
	if (!Number.isInteger(concurrency) || concurrency < 1) throw new Error("Invalid metadata concurrency");
	const queue = [];
	let active = 0;
	const work = async (job) => {
		job.init?.signal?.throwIfAborted();
		const response = await fetcher(job.url, job.init);
		const bytes = await readProviderBody(response, {
			signal: job.init?.signal ?? void 0,
			...!response.ok ? {
				maxBytes: PROVIDER_BUDGETS.errorPrefixBytes,
				prefix: true
			} : {}
		});
		const headers = new Headers(response.headers);
		headers.delete("content-encoding");
		headers.delete("content-length");
		headers.delete("transfer-encoding");
		return new Response([
			204,
			205,
			304
		].includes(response.status) ? null : bytes.buffer, {
			status: response.status,
			statusText: response.statusText,
			headers
		});
	};
	const drain = () => {
		while (active < concurrency && queue.length) {
			const job = queue.shift();
			job.init?.signal?.removeEventListener("abort", job.abort);
			active++;
			work(job).then(job.resolve, job.reject).finally(() => {
				active--;
				drain();
			});
		}
	};
	return {
		request: (url, init) => new Promise((resolve, reject) => {
			if (init?.signal?.aborted) {
				reject(init.signal.reason);
				return;
			}
			if (queue.length >= PROVIDER_BUDGETS.queuedRequests) {
				reject(new ProviderBudgetError("queue", "Provider metadata queue is full; accepted pages and saved positions are preserved."));
				return;
			}
			const job = {
				url,
				init,
				resolve,
				reject,
				abort: () => {
					const index = queue.indexOf(job);
					if (index < 0) return;
					queue.splice(index, 1);
					init?.signal?.removeEventListener("abort", job.abort);
					reject(init?.signal?.reason);
				}
			};
			queue.push(job);
			init?.signal?.addEventListener("abort", job.abort, { once: true });
			drain();
		}),
		snapshot: () => ({
			active,
			queued: queue.length,
			concurrency,
			maxQueued: PROVIDER_BUDGETS.queuedRequests
		})
	};
}
var twitch = createProviderMetadataTransport(PROVIDER_BUDGETS.twitchTransfers);
var adult = createProviderMetadataTransport(PROVIDER_BUDGETS.adultTransfers);
var fetchProviderMetadata = (url, init) => (new URL(url).hostname === "gql.twitch.tv" ? twitch : adult).request(url, init);
var YoutubeRequestError = class extends Error {
	status;
	retryAt;
	cooldownScope;
	constructor(message, status, nextRetryAt, scope) {
		super(message);
		this.status = status;
		this.retryAt = nextRetryAt;
		this.cooldownScope = scope;
	}
};
function youtubeRequestScope(url) {
	const path = new URL(url).pathname;
	return path.startsWith("/feeds/") ? "feed" : /\/(streams|live)\/?$/.test(path) ? "live" : path === "/watch" || path === "/oembed" || /\/youtubei\/v1\/(next|live_chat\/)/.test(path) ? "details" : path.startsWith("/youtubei/") ? "catalog" : "page";
}
/** The browser queue limits app jobs. This queue limits the actual upstream
* requests inside them, shared by imports, pages, RSS, and live checks. */
function createYoutubeTransport(options = {}) {
	const now = options.now ?? (() => Date.now());
	const sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
	const cooldowns = /* @__PURE__ */ new Map();
	let cooldownRevision = 0;
	let startTail = Promise.resolve(), lastStarted = -Infinity, queued = 0;
	const lanes = {
		live: {
			tail: Promise.resolve(),
			lastStarted: -Infinity
		},
		other: {
			tail: Promise.resolve(),
			lastStarted: -Infinity
		}
	};
	const archiveGap = () => Math.max(0, options.gapMs?.() ?? 80);
	const liveGap = () => Math.max(0, options.liveGapMs?.() ?? archiveGap());
	const waiting = [];
	const active = {
		live: 0,
		feed: 0,
		other: 0
	};
	const limits = {
		live: PROVIDER_BUDGETS.youtubeLiveTransfers,
		feed: PROVIDER_BUDGETS.youtubeFeedTransfers,
		other: PROVIDER_BUDGETS.youtubeTransfers
	};
	const pump = () => {
		for (let i = 0; i < waiting.length;) {
			const job = waiting[i];
			if (active[job.lane] >= limits[job.lane]) {
				i++;
				continue;
			}
			waiting.splice(i, 1);
			active[job.lane]++;
			job.start();
		}
	};
	const cooling = (scope, at = now()) => {
		return [cooldowns.get("all"), cooldowns.get(scope)].filter((row) => Boolean(row && row.retryAt > at)).sort((a, b) => b.retryAt - a.retryAt)[0];
	};
	const retryAt = (scope = "catalog", at = now()) => cooling(scope, at)?.retryAt;
	const cooldownScope = (scope = "catalog", at = now()) => {
		const next = cooling(scope, at);
		return next ? cooldowns.get("all") === next ? "all" : scope : void 0;
	};
	const manualRetry = () => ({ revision: cooldownRevision });
	const ready = (scope = "catalog", at = now(), retry) => {
		const next = [cooldowns.get("all"), cooldowns.get(scope)].filter((row) => Boolean(row && row.retryAt > at && (!retry || row.revision > retry.revision))).sort((a, b) => b.retryAt - a.retryAt)[0];
		if (next) throw new YoutubeRequestError(`YouTube HTTP ${next.status}${next.networkBlocked ? ": Google reported unusual traffic from this network" : " rate limit"}. Retry after ${new Date(next.retryAt).toLocaleTimeString()}.`, next.status, next.retryAt, cooldowns.get("all") === next ? "all" : scope);
	};
	const accept = (response, at = now(), scope = "catalog", networkBlocked = false, startedRevision = cooldownRevision) => {
		if (response.ok) {
			for (const key of [scope, "all"]) if ((cooldowns.get(key)?.revision ?? Infinity) <= startedRevision) cooldowns.delete(key);
			return;
		}
		if (response.status === 429 || response.status === 503 && response.headers.has("retry-after")) {
			const target = networkBlocked && scope !== "page" ? "all" : scope;
			const attempts = Math.min(3, (cooldowns.get(target)?.attempts ?? 0) + 1);
			const header = response.headers.get("retry-after");
			const seconds = header !== null && header.trim() ? Number(header) : NaN;
			const advertised = Number.isFinite(seconds) ? at + seconds * 1e3 : Date.parse(header ?? "");
			const deadline = Math.max(at + (networkBlocked ? 15 : 5) * 6e4 * 2 ** (attempts - 1), Number.isFinite(advertised) ? advertised : 0);
			cooldowns.set(target, {
				retryAt: deadline,
				attempts,
				status: response.status,
				networkBlocked,
				revision: ++cooldownRevision
			});
			response.body?.cancel().catch(() => void 0);
			throw new YoutubeRequestError(`YouTube HTTP ${response.status}${networkBlocked ? ": Google reported unusual traffic from this network" : " rate limit"}. Retry after ${new Date(deadline).toLocaleTimeString()}.`, response.status, deadline, target);
		}
		response.body?.cancel().catch(() => void 0);
		throw new YoutubeRequestError(`YouTube HTTP ${response.status}: public metadata request failed.`, response.status);
	};
	const request = (url, init) => {
		if (init?.signal?.aborted) return Promise.reject(init.signal.reason);
		if (queued >= PROVIDER_BUDGETS.queuedRequests) return Promise.reject(new ProviderBudgetError("queue", "YouTube metadata queue is full; accepted pages and saved positions are preserved."));
		const scope = init?.scope ?? youtubeRequestScope(url);
		const path = new URL(url).pathname;
		queued++;
		const html = !path.startsWith("/youtubei/") && !path.startsWith("/feeds/") && path !== "/oembed";
		const checkReady = () => {
			ready(scope, now(), init?.manualRetry);
			if (html && scope !== "page") ready("page", now(), init?.manualRetry);
		};
		const work = async () => {
			const lane = scope === "live" ? lanes.live : lanes.other;
			const start = lane.tail.then(async () => {
				checkReady();
				init?.signal?.throwIfAborted();
				const gap = scope === "live" ? liveGap() : archiveGap();
				const delay = lane.lastStarted + gap - now();
				if (delay > 0) await sleep(delay);
				const sharedStart = startTail.then(async () => {
					checkReady();
					init?.signal?.throwIfAborted();
					const delay = lastStarted + Math.min(archiveGap(), liveGap(), PROVIDER_BUDGETS.youtubeLiveRequestGapMs) - now();
					if (delay > 0) await sleep(delay);
					checkReady();
					init?.signal?.throwIfAborted();
					lastStarted = lane.lastStarted = now();
					return cooldownRevision;
				});
				startTail = sharedStart.catch(() => void 0);
				return sharedStart;
			});
			lane.tail = start.catch(() => void 0);
			const startedRevision = await start;
			checkReady();
			init?.signal?.throwIfAborted();
			const { timeoutMs, manualRetry: _manualRetry, scope: _scope, ...requestInit } = init ?? {};
			if (timeoutMs) requestInit.signal = AbortSignal.any([...requestInit.signal ? [requestInit.signal] : [], AbortSignal.timeout(timeoutMs)]);
			const response = await (options.fetch ?? globalThis.fetch)(url, requestInit);
			let body;
			try {
				body = await readProviderBody(response, {
					signal: requestInit.signal ?? void 0,
					...!response.ok ? {
						maxBytes: PROVIDER_BUDGETS.errorPrefixBytes,
						prefix: true
					} : {}
				});
			} catch (error) {
				if (!response.ok) accept(response, now(), scope);
				throw error;
			}
			const blocked = response.status === 429 && /unusual traffic from your computer network/i.test(new TextDecoder().decode(body));
			accept(response, now(), blocked && html ? "page" : scope, blocked, startedRevision);
			const headers = new Headers(response.headers);
			headers.delete("content-encoding");
			headers.delete("content-length");
			headers.delete("transfer-encoding");
			return new Response([
				204,
				205,
				304
			].includes(response.status) ? null : body.buffer, {
				status: response.status,
				statusText: response.statusText,
				headers
			});
		};
		const lane = scope === "live" ? "live" : scope === "feed" ? "feed" : "other";
		return new Promise((resolve, reject) => {
			const abort = () => {
				const position = waiting.indexOf(job);
				if (position < 0) return;
				waiting.splice(position, 1);
				queued--;
				init?.signal?.removeEventListener("abort", abort);
				reject(init?.signal?.reason ?? /* @__PURE__ */ new Error("YouTube request cancelled."));
				pump();
			};
			const job = {
				lane,
				start: () => {
					init?.signal?.removeEventListener("abort", abort);
					work().then(resolve, reject).finally(() => {
						queued--;
						active[lane]--;
						pump();
					});
				}
			};
			waiting.push(job);
			init?.signal?.addEventListener("abort", abort, { once: true });
			pump();
		});
	};
	return {
		request,
		retryAt,
		ready,
		accept,
		cooldownScope,
		manualRetry
	};
}
var requestGapMs = 80;
function setYoutubeRequestGap(value) {
	const gap = Number(value);
	if (Number.isFinite(gap)) requestGapMs = Math.max(0, Math.min(6e4, gap));
}
var transport = createYoutubeTransport({
	gapMs: () => requestGapMs,
	liveGapMs: () => PROVIDER_BUDGETS.youtubeLiveRequestGapMs
});
var fetchYoutubeResponse = transport.request;
var youtubeRetryAt = (now = Date.now(), scope = "catalog") => transport.retryAt(scope, now);
var youtubeCooldownScope = (now = Date.now(), scope = "catalog") => transport.cooldownScope(scope, now);
var assertYoutubeReady = (now = Date.now(), scope = "catalog", retry) => transport.ready(scope, now, retry);
var createYoutubeManualRetry = transport.manualRetry;
transport.accept;
//#endregion
export { fetchProviderMetadata as a, youtubeCooldownScope as c, createYoutubeManualRetry as i, youtubeRetryAt as l, assertYoutubeReady as n, fetchYoutubeResponse as o, createServerRpc as r, setYoutubeRequestGap as s, YoutubeRequestError as t };
