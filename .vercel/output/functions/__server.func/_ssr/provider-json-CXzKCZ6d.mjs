//#region node_modules/.nitro/vite/services/ssr/assets/provider-json-CXzKCZ6d.js
/** Metadata safeguards; media playback/downloads never use these readers.
* Limits apply to each complete upstream page, not the accumulated archive. */
var PROVIDER_BUDGETS = {
	responseBytes: 8388608,
	/** Per-page structural ceilings, checked before allocating parsed objects. */
	json: {
		tokens: 12e4,
		containers: 4e4,
		depth: 96,
		stringUnits: 262144,
		scratchBytes: 33554432
	},
	errorPrefixBytes: 65536,
	bodyTimeoutMs: 15e3,
	queuedRequests: 80,
	youtubeTransfers: 1,
	/** Two lightweight RSS bodies can complete independently of archive pages. */
	youtubeFeedTransfers: 2,
	youtubeLiveTransfers: 8,
	youtubeLiveWorkers: 8,
	youtubeLiveRequestGapMs: 80,
	twitchTransfers: 6,
	adultTransfers: 6,
	refreshWorkers: 3,
	liveWorkers: 2,
	archiveWorkers: 1,
	importWorkers: 6,
	importAttempts: 2,
	warmCacheRows: 250,
	warmCacheEntryBytes: 1048576,
	youtubeCacheBytes: 4194304,
	twitchCacheBytes: 4194304,
	adultCacheBytes: 12582912
};
var ProviderBudgetError = class extends Error {
	budget;
	constructor(budget, message) {
		super(message);
		this.budget = budget;
		this.name = "ProviderBudgetError";
	}
};
var samples = [];
/** Scan before JSON.parse allocates an object graph. This is a structural and
* conservative payload estimate, not a claim to measure engine heap bytes. */
function parseProviderJson(text, provider = "other") {
	const limits = PROVIDER_BUDGETS.json, started = performance.now();
	let rawBytes = 0, tokens = 0, containers = 0, depth = 0, peakDepth = 0, quoted = false, escaped = false, atom = false, stringUnits = 0;
	const scratch = () => rawBytes + text.length * 2 + tokens * 24 + containers * 64;
	const fail = () => {
		throw new ProviderBudgetError("graph", "Provider metadata exceeded its parsed JSON graph budget; the page and its cursor were not accepted.");
	};
	try {
		if (text.length > PROVIDER_BUDGETS.responseBytes) fail();
		for (let i = 0; i < text.length; i++) {
			const code = text.charCodeAt(i), c = text[i];
			rawBytes += code < 128 ? 1 : code < 2048 ? 2 : code >= 55296 && code <= 56319 && text.charCodeAt(i + 1) >= 56320 && text.charCodeAt(i + 1) <= 57343 ? 1 : 3;
			if (quoted) {
				if (c === "\"" && !escaped) quoted = false;
				else {
					if (++stringUnits > limits.stringUnits) fail();
					if (escaped) escaped = false;
					else if (c === "\\") escaped = true;
				}
			} else if (c === "\"") {
				quoted = true;
				stringUnits = 0;
				atom = false;
				tokens++;
			} else if (c === "{" || c === "[") {
				depth++;
				peakDepth = Math.max(peakDepth, depth);
				containers++;
				tokens++;
				atom = false;
			} else if (c === "}" || c === "]") {
				depth--;
				atom = false;
			} else if (c === "," || c === ":" || code === 32 || code === 9 || code === 10 || code === 13) atom = false;
			else if (!atom) {
				tokens++;
				atom = true;
			}
			if (rawBytes > PROVIDER_BUDGETS.responseBytes || tokens > limits.tokens || containers > limits.containers || peakDepth > limits.depth || scratch() > limits.scratchBytes) fail();
		}
		const parsed = JSON.parse(text);
		samples.push({
			provider,
			outcome: "accepted",
			rawBytes,
			textUnits: text.length,
			tokens,
			containers,
			depth: peakDepth,
			estimatedScratchBytes: scratch(),
			parseMs: performance.now() - started
		});
		return parsed;
	} catch (error) {
		samples.push({
			provider,
			outcome: "rejected",
			rawBytes,
			textUnits: text.length,
			tokens,
			containers,
			depth: peakDepth,
			estimatedScratchBytes: scratch(),
			parseMs: performance.now() - started
		});
		throw error;
	} finally {
		if (samples.length > 16) samples.shift();
	}
}
var readProviderJson = async (response, provider = "other") => parseProviderJson(await response.text(), provider);
//#endregion
export { readProviderJson as i, ProviderBudgetError as n, parseProviderJson as r, PROVIDER_BUDGETS as t };
