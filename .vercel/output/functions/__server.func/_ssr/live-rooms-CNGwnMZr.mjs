import { i as validateYoutubeLiveContent } from "./youtube-contract-DMSANo43.mjs";
import { i as repairYoutubePublication, r as exactYoutubePublished } from "./youtube-metadata-BN08kKrN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/live-rooms-CNGwnMZr.js
var ADULT_PULL_PROVIDERS = [
	"eporner",
	"redtube",
	"chaturbate",
	"myfreecams",
	"reddit",
	"booru",
	"redgifs"
];
var snapshots$1 = /* @__PURE__ */ new WeakMap();
var latest;
/** Built-in provider privacy does not depend on a legacy folder flag. */
function adultFolderIds(folders) {
	const cached = snapshots$1.get(folders);
	if (cached) return cached;
	const ids = /* @__PURE__ */ new Set([...ADULT_PULL_PROVIDERS.map((provider) => `${provider}:discover`), ...folders.filter((folder) => folder.adult).map((folder) => folder.id)]);
	const result = latest && latest.size === ids.size && [...ids].every((id) => latest.has(id)) ? latest : ids;
	latest = result;
	snapshots$1.set(folders, result);
	return result;
}
function pageJson(html, name) {
	const marker = new RegExp(`(?:var\\s+)?${name}\\s*=\\s*|window\\["${name}"\\]\\s*=\\s*`).exec(html);
	if (!marker) return;
	const start = html.indexOf("{", marker.index + marker[0].length);
	if (start < 0) return;
	let depth = 0, quoted = false, escaped = false;
	for (let i = start; i < html.length; i++) {
		const c = html[i];
		if (quoted) {
			if (escaped) escaped = false;
			else if (c === "\\") escaped = true;
			else if (c === "\"") quoted = false;
			continue;
		}
		if (c === "\"") quoted = true;
		else if (c === "{") depth++;
		else if (c === "}" && --depth === 0) try {
			return JSON.parse(html.slice(start, i + 1));
		} catch {
			return;
		}
	}
}
function label(value) {
	return (typeof value === "string" ? value : value?.simpleText ?? value?.content ?? value?.runs?.map((run) => run.text ?? "").join("") ?? "").slice(0, 512);
}
/** Only an explicitly concurrent label counts. Lifetime views and waiting
* audiences must never be relabeled as people currently watching. */
function youtubeConcurrentViewers(value) {
	const text = label(value).replace(/[\u00a0\u202f]/g, " ");
	const match = /(?:^|\s)(\d[\d,. ]*?)\s*([KMB])?\s+(?:watching(?: now)?|concurrent viewers|viewers)(?:\b|$)/i.exec(text);
	if (!match || /waiting|scheduled|starts? in/i.test(text)) return;
	const base = Number(match[1].replace(/[, ]/g, ""));
	if (!match[2] && !Number.isInteger(base)) return;
	const amount = base * ({
		K: 1e3,
		M: 1e6,
		B: 1e9
	}[match[2]?.toUpperCase() ?? ""] ?? 1);
	return Number.isSafeInteger(Math.round(amount)) && amount >= 0 ? Math.round(amount) : void 0;
}
function rendererViewers(renderer) {
	for (const value of [
		renderer.viewCountText,
		renderer.shortViewCountText,
		renderer.viewCount?.videoViewCountRenderer?.viewCount
	]) {
		const count = youtubeConcurrentViewers(value);
		if (count !== void 0) return count;
	}
}
function lockupViewers(lockup) {
	const rows = lockup.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows ?? [];
	for (const row of rows) for (const part of row.metadataParts ?? []) {
		const count = youtubeConcurrentViewers(part.text);
		if (count !== void 0) return count;
	}
}
/** Bind live evidence to one video, never a nearby recommendation or scheduled broadcast. */
function youtubeLivePage(html, channelId) {
	const player = pageJson(html, "ytInitialPlayerResponse");
	if (player) {
		const details = player.videoDetails;
		const broadcast = player.microformat?.playerMicroformatRenderer?.liveBroadcastDetails;
		if (!details && player.playabilityStatus?.status !== "OK") throw new Error("YouTube could not confirm this creator's live state. Retry the live check.");
		if (broadcast?.isLiveNow !== true) return null;
		if (!/^[A-Za-z0-9_-]{11}$/.test(details?.videoId ?? "") || details.channelId && details.channelId !== channelId) return null;
		const primary = pageJson(html, "ytInitialData")?.contents?.twoColumnWatchNextResults?.results?.results?.contents?.find((row) => row.videoPrimaryInfoRenderer)?.videoPrimaryInfoRenderer;
		return {
			id: details.videoId,
			title: details.title,
			viewers: primary ? rendererViewers(primary) : void 0
		};
	}
	const initial = pageJson(html, "ytInitialData");
	if (!initial) throw new Error("YouTube returned an unreadable live page. The previous live observation was kept.");
	return youtubeLiveData(initial, channelId)[0] ?? null;
}
function youtubeLiveData(initial, channelId) {
	if (!initial || typeof initial !== "object" || !initial.contents) throw new Error("YouTube returned an unreadable live catalog. The previous live observation was kept.");
	const owner = initial.metadata?.channelMetadataRenderer?.externalId;
	if (owner && owner !== channelId) throw new Error("YouTube returned a different creator's live page.");
	const selected = (initial.contents.twoColumnBrowseResultsRenderer?.tabs)?.find((tab) => tab.tabRenderer?.selected)?.tabRenderer;
	validateYoutubeLiveContent(selected ? selected.content : initial.contents);
	const stack = [selected ? selected.content : initial.contents];
	const results = [], seen = /* @__PURE__ */ new Set();
	while (stack.length) {
		const node = stack.pop();
		if (!node || typeof node !== "object") continue;
		const renderer = node.videoRenderer ?? node.gridVideoRenderer;
		const lockup = node.lockupViewModel;
		if (lockup && /^[A-Za-z0-9_-]{11}$/.test(lockup.contentId ?? "")) {
			const overlays = lockup.contentImage?.thumbnailViewModel?.overlays ?? [];
			const viewers = lockupViewers(lockup);
			if ((viewers !== void 0 || overlays.some((overlay) => overlay.thumbnailBottomOverlayViewModel?.badges?.some((badge) => badge.thumbnailBadgeViewModel?.badgeStyle === "THUMBNAIL_OVERLAY_BADGE_STYLE_LIVE"))) && !seen.has(lockup.contentId)) {
				seen.add(lockup.contentId);
				results.push({
					id: lockup.contentId,
					title: lockup.metadata?.lockupMetadataViewModel?.title?.content,
					...viewers !== void 0 ? { viewers } : {}
				});
			}
		}
		if (renderer && /^[A-Za-z0-9_-]{11}$/.test(renderer.videoId ?? "")) {
			const viewers = rendererViewers(renderer);
			const live = viewers !== void 0 || renderer.thumbnailOverlays?.some((overlay) => overlay.thumbnailOverlayTimeStatusRenderer?.style === "LIVE") || renderer.badges?.some((badge) => badge.metadataBadgeRenderer?.style === "BADGE_STYLE_TYPE_LIVE_NOW");
			const rowOwner = (renderer.ownerText ?? renderer.shortBylineText ?? renderer.longBylineText)?.runs?.find((run) => run.navigationEndpoint?.browseEndpoint?.browseId)?.navigationEndpoint?.browseEndpoint?.browseId;
			if (live && !renderer.upcomingEventData && (!rowOwner || rowOwner === channelId) && !seen.has(renderer.videoId)) {
				seen.add(renderer.videoId);
				results.push({
					id: renderer.videoId,
					title: renderer.title?.simpleText ?? renderer.title?.runs?.map((r) => r.text ?? "").join(""),
					...viewers !== void 0 ? { viewers } : {}
				});
			}
		}
		for (const value of Object.values(node)) if (value && typeof value === "object") stack.push(value);
	}
	return results.slice(0, 64);
}
var YoutubeLiveEvidenceError = class extends Error {
	evidence;
	constructor(evidence) {
		super("YouTube could not confirm that this stream ended (" + evidence.reason + "). The last live observation was kept.");
		this.name = "YoutubeLiveEvidenceError";
		this.evidence = evidence;
	}
};
function isYoutubeStreamsTab(tab) {
	return /\/streams(?:[?#]|$)/.test(tab?.endpoint?.commandMetadata?.webCommandMetadata?.url ?? "") || tab?.title === "Live";
}
function hasContinuation(root) {
	const stack = [root];
	while (stack.length) {
		const node = stack.pop();
		if (!node || typeof node !== "object") continue;
		if (node.continuationItemRenderer || node.continuationItemViewModel || node.continuationCommand || node.nextContinuationData || node.reloadContinuationData || node.continuations?.length) return true;
		for (const value of Object.values(node)) if (value && typeof value === "object") stack.push(value);
	}
	return false;
}
/** A readable Home shelf supplies positive evidence only. A Streams page with
* unread continuations cannot establish absence, even when its first page is empty. */
function youtubeCatalogLiveEvidence(page, channelId, at = Date.now()) {
	if (page?.metadata?.channelMetadataRenderer?.externalId !== channelId) throw Error("YouTube did not confirm the requested live creator.");
	const selected = page.contents?.twoColumnBrowseResultsRenderer?.tabs?.find((row) => row.tabRenderer?.selected)?.tabRenderer;
	const observations = youtubeLiveData(page, channelId);
	const streams = isYoutubeStreamsTab(selected);
	const complete = streams && !hasContinuation(selected.content) && observations.length < 64;
	return {
		observations,
		evidence: {
			at,
			state: observations.length ? "live" : complete ? "absent" : "unknown",
			source: streams ? "streams" : "home",
			complete,
			reason: complete ? observations.length ? "live-found" : "complete-streams" : streams ? "partial-streams" : "home-only"
		}
	};
}
/** A watch page can establish absence only for the exact known broadcast and
* creator, with playable metadata and an explicit ended/not-live signal. */
function youtubeWatchLiveEvidence(html, channelId, videoId, at = Date.now()) {
	const player = pageJson(html, "ytInitialPlayerResponse");
	const details = player?.videoDetails, live = player?.microformat?.playerMicroformatRenderer?.liveBroadcastDetails;
	const owned = details?.channelId === channelId && details?.videoId === videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId);
	const readable = player?.playabilityStatus?.status === "OK";
	if (owned && readable && live?.isLiveNow === true) {
		const observed = youtubeLivePage(html, channelId);
		if (observed) return {
			observations: [observed],
			evidence: {
				at,
				state: "live",
				source: "watch",
				complete: true,
				reason: "known-broadcasts"
			}
		};
	}
	if (owned && readable && (live?.isLiveNow === false || typeof live?.endTimestamp === "string" && Number.isFinite(Date.parse(live.endTimestamp)) && Date.parse(live.endTimestamp) <= at)) return {
		observations: [],
		evidence: {
			at,
			state: "absent",
			source: "watch",
			complete: true,
			reason: "known-broadcasts"
		}
	};
	return {
		observations: [],
		evidence: {
			at,
			state: "unknown",
			source: "watch",
			complete: false,
			reason: "unreadable"
		}
	};
}
function youtubeHtmlLiveEvidence(html, channelId, at = Date.now()) {
	const page = pageJson(html, "ytInitialData");
	if (!page) throw Error("YouTube returned an unreadable live page. The previous observation was kept.");
	return youtubeCatalogLiveEvidence(page, channelId, at);
}
function normalizeYoutubeLiveEvidence(value) {
	if (!value || typeof value !== "object") return;
	const v = value;
	if (typeof v.at !== "number" || !Number.isFinite(v.at) || v.at <= 0 || ![
		"live",
		"absent",
		"unknown"
	].includes(String(v.state)) || ![
		"streams",
		"home",
		"watch",
		"unreadable"
	].includes(String(v.source)) || typeof v.complete !== "boolean" || ![
		"live-found",
		"complete-streams",
		"partial-streams",
		"home-only",
		"known-broadcasts",
		"unreadable"
	].includes(String(v.reason))) return;
	if (v.state === "absent" && (!v.complete || !["streams", "watch"].includes(String(v.source)))) return;
	return {
		at: v.at,
		state: v.state,
		source: v.source,
		complete: v.complete,
		reason: v.reason
	};
}
function youtubeEvidenceExplanation(evidence) {
	if (evidence.reason === "partial-streams") return "YouTube returned only part of the Streams catalog. Missing broadcasts remain provisionally live.";
	if (evidence.reason === "home-only") return "Only the Home shelf was readable. It cannot confirm that a broadcast ended.";
	if (evidence.state === "unknown") return "The latest response did not confirm the broadcast state. The previous live observation is retained.";
	if (evidence.state === "absent") return evidence.source === "watch" ? "The exact known broadcasts were explicitly not live. The ten-minute hold applies." : "A complete Streams listing did not contain a live broadcast. The ten-minute hold applies.";
	return evidence.complete ? "Fresh live evidence was confirmed." : "Fresh live broadcasts were found; the listing could not rule out other broadcasts.";
}
/** At most two exact known broadcasts may supplement an incomplete listing.
* This never walks a catalog continuation or probes ordinary offline creators. */
async function completeKnownYoutubeEvidence(result, knownIds, channelId, read, now = Date.now) {
	if (result.evidence.complete) return result;
	const known = [...new Set(knownIds.filter((id) => /^[A-Za-z0-9_-]{11}$/.test(id)))];
	const found = new Set(result.observations.map((row) => row.id));
	const missing = known.filter((id) => !found.has(id));
	if (!known.length || !missing.length || missing.length > 2) return result;
	const observations = [...result.observations];
	for (const id of missing) {
		let probe;
		try {
			probe = youtubeWatchLiveEvidence(await read(id), channelId, id, now());
		} catch {
			return result;
		}
		if (!probe.evidence.complete) return result;
		observations.push(...probe.observations);
	}
	return {
		observations,
		evidence: {
			at: now(),
			state: observations.length ? "live" : "absent",
			source: missing.length ? "watch" : result.evidence.source,
			complete: true,
			reason: missing.length ? "known-broadcasts" : "live-found"
		}
	};
}
var natural = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0;
function normalizeProviderCache(value) {
	if (!value || typeof value !== "object") return;
	const row = value;
	if (!natural(row.at) || typeof row.hits !== "number" || !Number.isFinite(row.hits) || typeof row.misses !== "number" || !Number.isFinite(row.misses) || ![
		"feed",
		"catalog",
		"uncached"
	].includes(String(row.scope))) return;
	return {
		at: row.at,
		hits: Math.max(0, Math.floor(row.hits)),
		misses: Math.max(0, Math.floor(row.misses)),
		scope: row.scope,
		...natural(row.entries) ? { entries: Math.floor(row.entries) } : {},
		...natural(row.estimatedBytes) ? { estimatedBytes: Math.floor(row.estimatedBytes) } : {}
	};
}
/** Approximate retained string/scalar payload, excluding JS object overhead.
* Called once on cache insertion; no JSON clone or retained media graph. */
function estimateProviderPayload(rows) {
	let bytes = 0;
	const visit = (row, depth) => {
		for (const value of Object.values(row)) if (typeof value === "string") bytes += value.length * 2;
		else if (typeof value === "number" || typeof value === "boolean") bytes += 8;
		else if (value && typeof value === "object" && depth < 3) visit(value, depth + 1);
	};
	for (const row of rows) visit(row, 0);
	return bytes;
}
/** Latest saved per-creator observations, never a claim of live server inventory. */
function aggregateProviderCache(rows, now) {
	return ["youtube", "twitch"].map((kind) => {
		const samples = rows.filter((row) => row.kind === kind && row.cache).map((row) => row.cache);
		const retained = samples.filter((row) => row.scope !== "uncached");
		return {
			kind,
			samples: samples.length,
			hits: samples.reduce((n, row) => n + row.hits, 0),
			misses: samples.reduce((n, row) => n + row.misses, 0),
			uncached: samples.length - retained.length,
			sizedSamples: retained.filter((row) => row.estimatedBytes !== void 0).length,
			estimatedBytes: retained.reduce((n, row) => n + (row.estimatedBytes ?? 0), 0),
			entries: retained.reduce((n, row) => n + (row.entries ?? 0), 0),
			oldestAgeMs: samples.length ? Math.max(0, ...samples.map((row) => now - row.at)) : void 0
		};
	});
}
var snapshots = /* @__PURE__ */ new WeakMap();
function hashKey(key) {
	let hash = 2166136261;
	for (let i = 0; i < key.length; i++) hash = Math.imul(hash ^ key.charCodeAt(i), 16777619);
	return hash >>> 0;
}
function popcount(bits) {
	bits -= bits >>> 1 & 1431655765;
	bits = (bits & 858993459) + (bits >>> 2 & 858993459);
	return (bits + (bits >>> 4) & 252645135) * 16843009 >>> 24;
}
function lookup(node, key, hash) {
	for (let shift = 0; node; shift += 5) {
		if ("key" in node) return node.key === key ? node : void 0;
		if ("entries" in node) return node.entries.find((entry) => entry.key === key);
		const bit = 1 << (hash >>> shift & 31);
		if (!(node.bitmap & bit)) return;
		node = node.children[popcount(node.bitmap & bit - 1)];
	}
}
function insert(node, leaf, shift, owned) {
	if (!node) return leaf;
	if ("key" in node && node.key === leaf.key) return leaf;
	if (!("children" in node)) {
		if (node.hash === leaf.hash) {
			const entries = "entries" in node ? node.entries.slice() : [node];
			const index = entries.findIndex((entry) => entry.key === leaf.key);
			if (index < 0) entries.push(leaf);
			else entries[index] = leaf;
			return {
				hash: leaf.hash,
				entries
			};
		}
		const oldBit = 1 << (node.hash >>> shift & 31), newBit = 1 << (leaf.hash >>> shift & 31);
		const branch = {
			bitmap: oldBit | newBit,
			children: oldBit === newBit ? [insert(node, leaf, shift + 5, owned)] : (node.hash >>> shift & 31) < (leaf.hash >>> shift & 31) ? [node, leaf] : [leaf, node]
		};
		owned.add(branch);
		return branch;
	}
	const branch = owned.has(node) ? node : {
		bitmap: node.bitmap,
		children: node.children.slice()
	};
	owned.add(branch);
	const bit = 1 << (leaf.hash >>> shift & 31), index = popcount(branch.bitmap & bit - 1);
	if (branch.bitmap & bit) branch.children[index] = insert(branch.children[index], leaf, shift + 5, owned);
	else {
		branch.bitmap |= bit;
		branch.children.splice(index, 0, leaf);
	}
	return branch;
}
function* leaves(node) {
	if (!node) return;
	if ("key" in node) yield node;
	else if ("entries" in node) yield* node.entries;
	else for (const child of node.children) yield* leaves(child);
}
function removeNode(node, key, hash, shift, owned) {
	if (!node) return;
	if ("key" in node) return node.key === key ? void 0 : node;
	if ("entries" in node) {
		const entries = node.entries.filter((entry) => entry.key !== key);
		return entries.length === node.entries.length ? node : entries.length === 1 ? entries[0] : entries.length ? {
			hash: node.hash,
			entries
		} : void 0;
	}
	const bit = 1 << (hash >>> shift & 31);
	if (!(node.bitmap & bit)) return node;
	const index = popcount(node.bitmap & bit - 1), previous = node.children[index];
	const child = removeNode(previous, key, hash, shift + 5, owned);
	if (child === previous) return node;
	const branch = owned.has(node) ? node : {
		bitmap: node.bitmap,
		children: node.children.slice()
	};
	owned.add(branch);
	if (child) branch.children[index] = child;
	else {
		branch.children.splice(index, 1);
		branch.bitmap &= ~bit;
	}
	if (!branch.children.length) return;
	return branch.children.length === 1 && !("children" in branch.children[0]) ? branch.children[0] : branch;
}
function snapshotOf(source) {
	return snapshots.get(source) ?? {
		base: source,
		order: 0
	};
}
function recordFor(snapshot) {
	const own = (key) => lookup(snapshot.root, key, hashKey(key));
	const proxy = new Proxy({}, {
		get: (_target, key) => {
			const patch = typeof key === "string" ? own(key) : void 0;
			return patch ? patch.deleted ? void 0 : patch.value : Reflect.get(snapshot.base, key);
		},
		has: (_target, key) => {
			const patch = typeof key === "string" ? own(key) : void 0;
			return patch ? !patch.deleted : Reflect.has(snapshot.base, key);
		},
		getOwnPropertyDescriptor: (_target, key) => {
			const patch = typeof key === "string" ? own(key) : void 0;
			const original = Reflect.getOwnPropertyDescriptor(snapshot.base, key);
			return patch ? patch.deleted ? void 0 : {
				value: patch.value,
				enumerable: true,
				writable: false,
				configurable: true
			} : original ? {
				...original,
				configurable: true
			} : void 0;
		},
		ownKeys: () => {
			const patches = [...leaves(snapshot.root)], excluded = new Set(patches.filter((leaf) => leaf.deleted || leaf.reinserted).map((leaf) => leaf.key));
			const baseKeys = Reflect.ownKeys(snapshot.base);
			const keys = excluded.size ? baseKeys.filter((key) => typeof key !== "string" || !excluded.has(key)) : baseKeys;
			const added = patches.filter((leaf) => !leaf.deleted && (leaf.reinserted || !Object.hasOwn(snapshot.base, leaf.key))).sort((a, b) => a.order - b.order);
			const strings = keys.filter((key) => typeof key === "string").concat(added.map((leaf) => leaf.key));
			const integer = (key) => String(Number(key) >>> 0) === key && key !== "4294967295";
			return [
				...strings.filter(integer).sort((a, b) => Number(a) - Number(b)),
				...strings.filter((key) => !integer(key)),
				...keys.filter((key) => typeof key === "symbol")
			];
		},
		set: () => {
			throw new TypeError("Catalog snapshots are immutable; use a sparse patch");
		},
		defineProperty: () => {
			throw new TypeError("Catalog snapshots are immutable; use a sparse patch");
		},
		deleteProperty: () => {
			throw new TypeError("Catalog snapshots are immutable; copy before removal");
		},
		preventExtensions: () => false,
		setPrototypeOf: () => false
	});
	snapshots.set(proxy, snapshot);
	return proxy;
}
/** A builder owns only nodes copied for this batch. finish seals the builder;
* subsequent batches share untouched branches without a chain of old records. */
function sparseRecordBuilder(source) {
	const original = snapshotOf(source), owned = /* @__PURE__ */ new WeakSet();
	let root = original.root, order = original.order, changed = false, sealed = false;
	return {
		get(key) {
			const patch = lookup(root, key, hashKey(key));
			return patch ? patch.deleted ? void 0 : patch.value : original.base[key];
		},
		set(key, value) {
			if (sealed) throw new TypeError("Sparse patch already finished");
			const hash = hashKey(key), previous = lookup(root, key, hash);
			if (previous ? !previous.deleted && Object.is(previous.value, value) : Object.hasOwn(original.base, key) && Object.is(original.base[key], value)) return;
			root = insert(root, {
				key,
				hash,
				value,
				order: previous?.deleted ? order++ : previous?.order ?? order++,
				...previous?.deleted || previous?.reinserted ? { reinserted: true } : {}
			}, 0, owned);
			changed = true;
		},
		remove(key) {
			if (sealed) throw new TypeError("Sparse patch already finished");
			const hash = hashKey(key), previous = lookup(root, key, hash);
			if (previous ? previous.deleted : !Object.hasOwn(original.base, key)) return;
			root = Object.hasOwn(original.base, key) ? insert(root, {
				key,
				hash,
				value: void 0,
				order: previous?.order ?? order++,
				deleted: true
			}, 0, owned) : removeNode(root, key, hash, 0, owned);
			changed = true;
		},
		finish() {
			if (sealed) throw new TypeError("Sparse patch already finished");
			sealed = true;
			return changed ? recordFor({
				base: original.base,
				root,
				order
			}) : source;
		}
	};
}
function patchSparseRecord(source, entries) {
	const builder = sparseRecordBuilder(source);
	for (const [key, value] of entries) builder.set(key, value);
	return builder.finish();
}
/** Removed keys disappear from lookup, own keys, spread and JSON. A tombstone
* distinguishes deletion from an explicitly stored undefined value. */
function removeSparseRecordKeys(source, keys) {
	const builder = sparseRecordBuilder(source);
	for (const key of keys) builder.remove(key);
	return builder.finish();
}
/** Incremental, unordered own enumerable string entries for background scans.
* Going through the Proxy's ownKeys trap materializes and sorts every patch
* before the first yield. Walk the immutable base and tree directly instead;
* callers can yield/cancel between entries without a catalog-sized key array.
* Ordered JSON/spread exports still use the standard object interface. */
function* sparseRecordScan(record, readValues = true) {
	const snapshot = snapshots.get(record);
	const base = snapshot?.base ?? record;
	for (const key in base) {
		if (!Object.hasOwn(base, key)) {
			yield void 0;
			continue;
		}
		const patch = lookup(snapshot?.root, key, hashKey(key));
		if (patch?.deleted || patch?.reinserted) {
			yield void 0;
			continue;
		}
		yield [key, readValues ? patch ? patch.value : base[key] : void 0];
	}
	for (const patch of leaves(snapshot?.root)) if (!patch.deleted && (patch.reinserted || !Object.prototype.propertyIsEnumerable.call(base, patch.key))) yield [patch.key, patch.value];
	else yield void 0;
}
/** Ordered consumers can scan the base and cooperatively sort only relevant
* appended entries by their insertion ordinal, instead of exporting all keys. */
function sparseRecordOrderedParts(record) {
	const snapshot = snapshots.get(record), base = snapshot?.base ?? record;
	function* existing() {
		for (const key in base) {
			if (!Object.hasOwn(base, key)) {
				yield void 0;
				continue;
			}
			const patch = lookup(snapshot?.root, key, hashKey(key));
			if (patch?.deleted || patch?.reinserted) {
				yield void 0;
				continue;
			}
			yield [key, patch ? patch.value : base[key]];
		}
	}
	function* appended() {
		for (const patch of leaves(snapshot?.root)) if (!patch.deleted && (patch.reinserted || !Object.prototype.propertyIsEnumerable.call(base, patch.key))) yield [
			patch.key,
			patch.value,
			patch.order
		];
		else yield void 0;
	}
	return {
		existing: existing(),
		appended: appended()
	};
}
/** IndexedDB cannot clone a Proxy. Persist the plain base/tree representation;
* decoding restores indexed lookup without materializing or copying all keys. */
function encodeSparseRecord(record) {
	const snapshot = snapshots.get(record);
	return snapshot ? {
		__reelcaseSparseRecord: 1,
		snapshot
	} : record;
}
function decodeSparseRecord(stored) {
	if (!stored || typeof stored !== "object" || Array.isArray(stored)) return {};
	const encoded = stored;
	if (encoded.__reelcaseSparseRecord === 1 && encoded.snapshot?.base && typeof encoded.snapshot.base === "object" && typeof encoded.snapshot.order === "number") return recordFor(encoded.snapshot);
	return stored;
}
/** Run catalog work in small tasks. Callers provide their visibility/input/
* cancellation gate; the generic helper holds no catalog-wide lookup cache. */
async function forEachCatalogSlice(rows, visit, turn, maxRowsPerSlice = 512) {
	for (let offset = 0; offset < rows.length;) {
		await turn();
		const started = performance.now(), end = Math.min(rows.length, offset + maxRowsPerSlice);
		for (; offset < end; offset++) {
			visit(rows[offset], offset);
			if (performance.now() - started >= 4) {
				offset++;
				break;
			}
		}
	}
}
/** Immutable record copies also yield; spreading a 100k-entry tag map inside
* a Zustand update blocks every subscriber and incoming click. */
async function copyCatalogRecord(source, turn) {
	const copy = {};
	await forEachCatalogEntry(sparseRecordScan(source), (row) => {
		if (row) Object.defineProperty(copy, row[0], {
			value: row[1],
			writable: true,
			enumerable: true,
			configurable: true
		});
	}, turn);
	return copy;
}
/** Copy references without one catalog-sized synchronous slice on ingest. */
async function copyCatalogArray(source, turn) {
	const copy = new Array(source.length);
	await forEachCatalogSlice(source, (row, index) => {
		copy[index] = row;
	}, turn);
	return copy;
}
/** Materialize Map/Set iterators without one synchronous spread at the end
* of a paged disk read. The result holds references, not cloned records. */
async function collectCatalogRows(source, turn = yieldCatalogTask) {
	const rows = [];
	await forEachCatalogEntry(source, (row) => {
		rows.push(row);
	}, turn);
	return rows;
}
/** Visit sparse changes without first spreading a large Map into an array. */
async function forEachCatalogEntry(source, visit, turn = yieldCatalogTask) {
	await turn();
	let visited = 0, started = performance.now();
	for (const row of source) {
		visit(row);
		if (++visited >= 512 || performance.now() - started >= 4) {
			await turn();
			visited = 0;
			started = performance.now();
		}
	}
}
/** Native background tasks avoid the nested setTimeout clamp while still
* allowing rendering and input between slices. Older browsers use a timer. */
function yieldCatalogTask() {
	const scheduler = globalThis.scheduler;
	return scheduler ? scheduler.postTask(() => {}, { priority: "background" }) : new Promise((resolve) => setTimeout(resolve, 0));
}
/** Sort small stable native runs, then merge cooperatively. Already ordered
* catalogs finish after the run pass instead of log(N) full-array passes.
* Native sorts never receive a catalog-sized array. The input is scratch
* storage, as in the previous merge implementation. */
async function sortCatalogRows(rows, compare, turn, maxRowsPerSlice = 2048) {
	if (rows.length < 2) return rows;
	await turn();
	const runSize = Math.max(1, Math.min(256, maxRowsPerSlice));
	let visited = 0, started = performance.now(), ordered = true;
	for (let offset = 0; offset < rows.length; offset += runSize) {
		const run = rows.slice(offset, Math.min(rows.length, offset + runSize));
		run.sort(compare);
		if (offset && compare(rows[offset - 1], run[0]) > 0) ordered = false;
		for (let index = 0; index < run.length; index++) rows[offset + index] = run[index];
		visited += run.length;
		if (visited >= maxRowsPerSlice || performance.now() - started >= 4) {
			await turn();
			visited = 0;
			started = performance.now();
		}
	}
	if (ordered) return rows;
	let source = rows, target = new Array(rows.length);
	for (let width = runSize; width < rows.length; width *= 2) {
		for (let left = 0; left < rows.length; left += width * 2) {
			const middle = Math.min(left + width, rows.length), right = Math.min(left + width * 2, rows.length);
			let a = left, b = middle;
			const orderedRun = middle === right || compare(source[middle - 1], source[middle]) <= 0;
			for (let out = left; out < right; out++) {
				target[out] = orderedRun ? source[out] : a < middle && (b >= right || compare(source[a], source[b]) <= 0) ? source[a++] : source[b++];
				if (++visited >= maxRowsPerSlice || visited % 64 === 0 && performance.now() - started >= 4) {
					await turn();
					visited = 0;
					started = performance.now();
				}
			}
		}
		[source, target] = [target, source];
	}
	return source;
}
var DEFAULT_TWITCH_PULL_POLICY = Object.freeze({
	version: 1,
	clips: true,
	vods: true,
	priority: "normal"
});
/** Missing/invalid legacy settings use the existing all-content, normal-priority behavior. No eager migration writes. */
function normalizeTwitchPullPolicy(raw) {
	if (!raw || typeof raw !== "object") return;
	const r = raw;
	if (r.version !== 1 || typeof r.clips !== "boolean" || typeof r.vods !== "boolean" || ![
		"low",
		"normal",
		"high"
	].includes(r.priority)) return;
	return {
		version: 1,
		clips: r.clips,
		vods: r.vods,
		priority: r.priority
	};
}
function twitchPullPolicy(channel) {
	const p = channel.twitchPullPolicy;
	return p?.version === 1 && typeof p.clips === "boolean" && typeof p.vods === "boolean" && [
		"low",
		"normal",
		"high"
	].includes(p.priority) ? p : DEFAULT_TWITCH_PULL_POLICY;
}
function twitchPolicyAllows(channel, scope) {
	if (channel.kind !== "twitch" || scope === "live") return true;
	const p = twitchPullPolicy(channel);
	return scope === "archive" ? p.vods : p.clips || p.vods;
}
/** Provider responses never author user choices, including late copies of old settings. */
function retainTwitchPullPolicy(previous, incoming) {
	if (!previous || previous.kind !== "twitch" || incoming.kind !== "twitch" || incoming.twitchPullPolicy === previous.twitchPullPolicy) return incoming;
	return {
		...incoming,
		twitchPullPolicy: previous.twitchPullPolicy
	};
}
function twitchPullPolicySummary(channels) {
	let creators = 0, clipsSkipped = 0, vodsSkipped = 0, contentSkipped = 0;
	for (const c of channels) if (c.kind === "twitch") {
		creators++;
		const p = twitchPullPolicy(c);
		if (!p.clips) clipsSkipped++;
		if (!p.vods) vodsSkipped++;
		if (!p.clips && !p.vods) contentSkipped++;
	}
	return {
		creators,
		clipsSkipped,
		vodsSkipped,
		contentSkipped
	};
}
function canonicalFollowHandle(kind, raw) {
	const original = raw.trim().replaceAll("\\_", "_");
	if (kind === "youtube") {
		const channelId = original.match(/^(?:yt:)?(UC[A-Za-z0-9_-]{22})$/)?.[1] ?? original.match(/youtube\.com\/channel\/(UC[A-Za-z0-9_-]{22})(?:[/?#]|$)/i)?.[1];
		if (channelId) return `channel:${channelId}`;
		try {
			const url = new URL(raw.trim());
			const playlist = url.searchParams.get("list");
			if (/(^|\.)youtube\.com$/i.test(url.hostname) && playlist && /^[a-z0-9_-]{10,80}$/i.test(playlist)) return `playlist:${playlist}`;
		} catch {}
	}
	const value = raw.trim().replaceAll("\\_", "_").toLowerCase();
	if (kind === "twitch") return (value.match(/(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([^/?#]+)/i)?.[1] ?? value.replace(/^tw:/, "")).replace(/^@/, "").replace(/[^a-z0-9_]/g, "");
	return (value.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:@|c\/|user\/)?([^/?#]+)/i)?.[1] ?? value).normalize("NFKC").replace(/^@/, "").replace(/\s+/g, " ");
}
/** Legacy follows may retain their exact provider ID only in the source key. */
function confirmedYoutubeChannelId(row) {
	if (row.kind !== "youtube" || row.id.startsWith("ytpl:")) return;
	return row.channelId || /^yt:(UC[\w-]{22})$/.exec(row.id)?.[1];
}
/** Provider refreshes can resolve an old handle to a channel ID or rename it.
* Both identities must be unique; the newest supplied row retains precedence. */
function dedupeFollows(rows) {
	const ids = /* @__PURE__ */ new Set(), handles = /* @__PURE__ */ new Set(), channels = /* @__PURE__ */ new Set();
	const unique = [];
	for (const row of rows) {
		const id = `${row.kind}:${row.id}`;
		const handle = canonicalFollowHandle(row.kind, row.handle || row.id);
		const key = `${row.kind}:${handle}`;
		const channel = confirmedYoutubeChannelId(row) ?? "";
		const handleKey = channel ? `${key}:${channel}` : key;
		if (ids.has(id) || handle && handles.has(handleKey) || channel && channels.has(channel)) continue;
		ids.add(id);
		if (handle) handles.add(handleKey);
		if (channel) channels.add(channel);
		unique.push(row);
	}
	return unique.length === rows.length ? rows : unique;
}
/** Resolution replaces its pending query, while confirmed provider identities
* remain authoritative even when two channels share a display name. */
function mergeResolvedFollow(rows, resolved) {
	const keys = new Set([resolved.handle, resolved.importQuery].filter(Boolean).map((value) => canonicalFollowHandle(resolved.kind, value)));
	const ambiguous = /* @__PURE__ */ new Set();
	const resolvedChannel = resolved.kind === "youtube" ? confirmedYoutubeChannelId(resolved) : resolved.channelId;
	if (resolved.kind === "youtube" && resolvedChannel) for (const key of keys) {
		const channels = /* @__PURE__ */ new Set([resolvedChannel]);
		for (const row of rows) if (confirmedYoutubeChannelId(row) && [
			row.handle,
			row.importQuery,
			row.title
		].some((value) => value && canonicalFollowHandle("youtube", value) === key)) channels.add(confirmedYoutubeChannelId(row));
		if (channels.size > 1) ambiguous.add(key);
	}
	resolved = retainTwitchPullPolicy(rows.find((row) => row.kind === resolved.kind && (row.id === resolved.id || row.channelId && row.channelId === resolved.channelId || !row.channelId && keys.has(canonicalFollowHandle(row.kind, row.handle)))), resolved);
	return [resolved, ...rows.filter((row) => {
		if (row.kind !== resolved.kind) return true;
		if (row.id === resolved.id) return false;
		const channel = row.kind === "youtube" ? confirmedYoutubeChannelId(row) : row.channelId;
		if (row.kind === "youtube" && channel && !resolvedChannel) return true;
		if (channel && resolvedChannel) return channel !== resolvedChannel;
		if (row.kind === "youtube" && !channel && [row.handle, row.importQuery].some((value) => value && ambiguous.has(canonicalFollowHandle("youtube", value)))) return true;
		return ![row.handle, row.importQuery].filter(Boolean).some((value) => keys.has(canonicalFollowHandle(row.kind, value)));
	})];
}
/** CSV/newline boundaries preserve display names, including quoted commas.
* Whitespace lists remain supported when every item is an explicit URL/@handle. */
function parseFollowImport(value, kind) {
	const fields = [], rows = [];
	let field = "", quoted = false, row = [];
	const flush = () => {
		fields.push(field);
		row.push(field);
		field = "";
	};
	for (let index = 0; index < value.length; index++) {
		const char = value[index];
		if (char === "\"" && (quoted || !field.trim())) {
			if (quoted && value[index + 1] === "\"") {
				field += "\"";
				index++;
			} else quoted = !quoted;
		} else if (!quoted && /[,;\n\r\t]/.test(char)) {
			flush();
			if (char === "\n" || char === "\r") {
				if (row.some(Boolean)) rows.push(row);
				row = [];
			}
		} else field += char;
	}
	flush();
	if (row.some(Boolean)) rows.push(row);
	const header = rows[0]?.map((value) => value.trim().replace(/^\uFEFF/, "").toLowerCase()) ?? [];
	const urlColumn = header.indexOf("channel url"), idColumn = header.indexOf("channel id");
	const queries = (kind === "youtube" && (urlColumn >= 0 || idColumn >= 0) ? rows.slice(1).map((row) => row[urlColumn] || row[idColumn] || "") : fields).flatMap((raw) => {
		const text = raw.trim().replace(/^\uFEFF/, "").replaceAll("\\_", "_");
		const words = text.split(/\s+/).filter(Boolean);
		return kind === "twitch" || words.length > 1 && words.every((word) => /^(?:@|https?:\/\/|(?:www\.)?(?:youtube\.com|youtu\.be)\/)/i.test(word)) ? words : [text];
	}).filter(Boolean);
	const seen = /* @__PURE__ */ new Set();
	return queries.filter((query) => {
		const key = canonicalFollowHandle(kind, query);
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	}).map((query) => ({
		query,
		kind
	}));
}
/** Repair only recognizable legacy whitespace fragments. Never remove follows
* or cached media; unresolved fragments stay available for manual review. */
function repairYoutubeImport(saved, draft) {
	const intended = parseFollowImport(draft, "youtube").map((row) => row.query);
	const legacy = new Set(draft.split(/[\s,]+/).map((word) => word.trim().replaceAll("\\_", "_").replace(/^["'([{<]+|["')\]}>.;:]+$/g, "")).filter(Boolean));
	const intendedKeys = new Set(intended.map((query) => canonicalFollowHandle("youtube", query)));
	const fragments = new Set([...legacy].filter((query) => !intendedKeys.has(canonicalFollowHandle("youtube", query))).map((query) => canonicalFollowHandle("youtube", query)));
	if (!intended.length || !fragments.size) return {
		queries: saved,
		fragments
	};
	return {
		queries: [.../* @__PURE__ */ new Set([...intended, ...saved.filter((query) => !legacy.has(query) || intendedKeys.has(canonicalFollowHandle("youtube", query)))])],
		fragments
	};
}
function importedFollowStub(query, kind) {
	return {
		id: `${kind === "youtube" ? "yt:pending" : "tw"}:${encodeURIComponent(canonicalFollowHandle(kind, query))}`,
		kind,
		handle: query,
		title: query
	};
}
var verifiedYoutubeSource = (channel) => channel.kind === "youtube" && !channel.importNeedsReview && Boolean(channel.channelId || /^yt:UC[\w-]{20,}$/.test(channel.id) || channel.id.startsWith("ytpl:"));
function youtubeFollowHealth(follows) {
	const rows = follows.filter((channel) => channel.kind === "youtube");
	const review = rows.filter((channel) => channel.importNeedsReview).length;
	const verified = rows.filter(verifiedYoutubeSource).length;
	return {
		saved: rows.length,
		verified,
		review,
		pending: rows.length - verified - review,
		following: rows.length - review
	};
}
/** Old imports retained their synthetic word ID even after resolving an
* unrelated real channel. Quarantine that evidence without deleting media. */
function reviewYoutubeImport(follows, draft) {
	const { fragments } = repairYoutubeImport([], draft);
	const intended = new Set(parseFollowImport(draft, "youtube").map((row) => canonicalFollowHandle("youtube", row.query)));
	return follows.map((channel) => {
		if (channel.kind !== "youtube" || channel.importNeedsReview) return channel;
		if (channel.channelId && channel.importQuery && /^(?:@|https?:\/\/)/i.test(channel.importQuery)) return channel;
		const legacyId = channel.id.replace(/^yt:/, "");
		const legacyWord = fragments.has(legacyId) && !/^UC[\w-]{20,}$/.test(legacyId);
		const importedFragment = Boolean(channel.importQuery && fragments.has(canonicalFollowHandle("youtube", channel.importQuery)));
		const unresolvedFragment = !channel.channelId && fragments.has(canonicalFollowHandle("youtube", channel.handle));
		return ![
			channel.importQuery,
			channel.handle,
			channel.title
		].some((value) => value && intended.has(canonicalFollowHandle("youtube", value))) && (legacyWord || importedFragment || unresolvedFragment) ? {
			...channel,
			importNeedsReview: true
		} : channel;
	});
}
function bindYoutubeCorrection(result, source, query) {
	return {
		...result,
		channel: {
			...result.channel,
			id: source.id,
			importQuery: query,
			importNeedsReview: void 0
		},
		videos: result.videos.map((video) => ({
			...video,
			folderId: source.id
		}))
	};
}
/** Unique verified display names can identify saved creators too. Do not
* create a second unresolved stub just because their public handle differs. */
function resolvedFollowQueries(follows, kind) {
	const keys = /* @__PURE__ */ new Set(), titles = /* @__PURE__ */ new Map();
	for (const channel of follows) {
		if (channel.kind !== kind || channel.importNeedsReview || !(kind === "twitch" ? channel.lastCheckedAt && !channel.lastProviderFailure : verifiedYoutubeSource(channel))) continue;
		keys.add(canonicalFollowHandle(kind, channel.handle));
		if (channel.importQuery) keys.add(canonicalFollowHandle(kind, channel.importQuery));
		const title = canonicalFollowHandle(kind, channel.title);
		if (title) titles.set(title, (titles.get(title) ?? 0) + 1);
	}
	if (kind === "youtube") {
		for (const [title, count] of titles) if (count === 1) keys.add(title);
	}
	return keys;
}
var sourceKind = {
	ARCHIVE: "past-broadcast",
	HIGHLIGHT: "highlight",
	UPLOAD: "upload",
	CLIPS: "clip"
};
var TWITCH_CONTENT_OPTIONS = [
	["all", "All content types"],
	["past-broadcast", "Past broadcasts"],
	["highlight", "Highlights"],
	["upload", "Uploads"],
	["clip", "Clips"],
	["live", "Live streams"],
	["unknown", "Unknown subtype"]
];
function twitchContentEvidence(source, videoId, at) {
	if (typeof source !== "string" || typeof videoId !== "string" || !Object.hasOwn(sourceKind, source) || !/^[-_a-zA-Z0-9]{1,128}$/.test(videoId) || !Number.isFinite(at) || at <= 0 || at > 864e13) return;
	return {
		kind: sourceKind[source],
		source,
		videoId,
		at
	};
}
function identity(video) {
	if (video.extension === "clip" || video.id.startsWith("tw:c:")) return "clip";
	if (video.extension === "vod" || video.id.startsWith("tw:v:")) return "video";
	for (const raw of [video.remote?.watchUrl, video.remote?.embedUrl]) {
		if (!raw) continue;
		try {
			const u = new URL(raw);
			if (u.protocol !== "https:" && u.protocol !== "http:") continue;
			if (u.hostname === "clips.twitch.tv" && u.pathname !== "/" || /^(?:www\.|player\.)?twitch\.tv$/.test(u.hostname) && (/^\/[^/]+\/clip\/[^/]+/.test(u.pathname) || u.searchParams.has("clip"))) return "clip";
			if (/^(?:www\.|player\.)?twitch\.tv$/.test(u.hostname) && (/^\/videos\/\d+/.test(u.pathname) || u.searchParams.has("video"))) return "video";
		} catch {}
	}
}
function knownTwitchContent(video) {
	if (video.remote?.kind !== "twitch") return;
	const raw = video.remote.twitchContent;
	if (!raw || typeof raw !== "object") return;
	const valid = typeof raw.source === "string" && Object.hasOwn(sourceKind, raw.source) && typeof raw.videoId === "string" && /^[-_a-zA-Z0-9]{1,128}$/.test(raw.videoId) && Number.isFinite(raw.at) && raw.at > 0 && raw.at <= 864e13;
	const videoId = video.remote.videoId ?? (/^tw:[vc]:/.test(video.id) ? video.id.slice(5) : void 0);
	if (!valid || sourceKind[raw.source] !== raw.kind || raw.videoId !== videoId) return;
	if (video.id.startsWith("tw:c:") && video.id.slice(5) !== raw.videoId || video.id.startsWith("tw:v:") && video.id.slice(5) !== raw.videoId) return;
	const family = identity(video);
	if (family === "clip" && raw.kind !== "clip" || family === "video" && raw.kind === "clip") return;
	return raw;
}
function twitchContentKind(video) {
	if (video.remote?.kind !== "twitch") return "unknown";
	if (video.remote.live) return "live";
	const evidence = knownTwitchContent(video);
	if (evidence) return evidence.kind;
	return identity(video) === "clip" ? "clip" : "unknown";
}
function twitchContentLabel(video) {
	if (video.remote?.kind === "twitch" && !video.remote.live && (video.extension === "live" || /:(?:live|channel)$/.test(video.id))) return "Channel bookmark";
	return {
		"past-broadcast": "Past broadcast",
		highlight: "Highlight",
		upload: "Upload",
		clip: "Clip",
		live: "Live stream",
		unknown: "Unknown video subtype"
	}[twitchContentKind(video)];
}
function matchesTwitchContent(video, filter) {
	if (filter === "all") return true;
	if (video.remote?.kind !== "twitch") return false;
	if (filter !== "live" && !video.remote.live && (video.extension === "live" || /:(?:live|channel)$/.test(video.id))) return false;
	return twitchContentKind(video) === filter;
}
/** Carry matching evidence through sparse refreshes; no guesses or bulk migration. */
function retainTwitchContent(previous, incoming) {
	if (incoming.remote?.kind !== "twitch") return incoming;
	const current = knownTwitchContent(incoming), prior = previous && knownTwitchContent(previous);
	const candidate = prior && prior.videoId === (incoming.remote.videoId ?? (/^tw:[vc]:/.test(incoming.id) ? incoming.id.slice(5) : void 0)) && (!current || prior.at > current.at) ? prior : current;
	const keep = candidate && candidate !== current ? knownTwitchContent({
		...incoming,
		remote: {
			...incoming.remote,
			twitchContent: candidate
		}
	}) : current;
	if (keep === incoming.remote.twitchContent) return incoming;
	const { twitchContent: _invalid, ...remote } = incoming.remote;
	return {
		...incoming,
		remote: {
			...remote,
			...keep ? { twitchContent: keep } : {}
		}
	};
}
/** Explicit export walks the current selection cooperatively, without cloning
* a catalog or logging local paths/account data. */
async function twitchContentReport(videos, turn = yieldCatalogTask) {
	const parts = ["id,title,video_id,type,evidence_source,evidence_observed_at,watch_url\r\n"];
	let chunk = [];
	const cell = (v) => {
		const text = String(v ?? "");
		return "\"" + (/^[=+@-]/.test(text) ? "'" + text : text).replaceAll("\"", "\"\"") + "\"";
	};
	await forEachCatalogSlice(videos, (video) => {
		if (video.remote?.kind !== "twitch") return;
		const e = knownTwitchContent(video);
		chunk.push([
			video.id,
			video.name,
			video.remote.videoId,
			twitchContentKind(video),
			e?.source ?? (twitchContentKind(video) === "clip" ? "saved-clip-identity" : "unrecorded"),
			e ? new Date(e.at).toISOString() : "",
			video.remote.watchUrl
		].map(cell).join(",") + "\r\n");
		if (chunk.length >= 256) {
			parts.push(chunk.join(""));
			chunk = [];
		}
	}, turn, 256);
	if (chunk.length) parts.push(chunk.join(""));
	return new Blob(parts, { type: "text/csv;charset=utf-8" });
}
/** A continuation identifies a whole page. Consume it completely before
* advancing, allowing at most one provider page beyond the requested budget. */
function uniqueYoutubePage(rows, seen) {
	const result = [];
	for (const row of rows) {
		if (!row.videoId || seen.has(row.videoId)) continue;
		seen.add(row.videoId);
		result.push(row);
	}
	return result;
}
function youtubePublishedTime(value) {
	const exact = exactYoutubePublished(value);
	return exact ? Date.parse(exact) : 0;
}
/** This exact description was generated only for undated archive rows. */
function repairLegacyYoutubeDate(video) {
	return repairYoutubePublication(video);
}
var stages = [
	"ARCHIVE",
	"HIGHLIGHT",
	"UPLOAD"
];
/** Keep the persisted provider cursor small and reject malformed saved values. */
function decodeTwitchArchiveCursor(raw) {
	if (!raw || raw.length > 16384) return {
		stage: "ARCHIVE",
		after: null
	};
	try {
		const value = JSON.parse(raw);
		if (value.v !== 1 || !stages.includes(value.stage)) return {
			stage: "ARCHIVE",
			after: null
		};
		if (value.after !== null && (typeof value.after !== "string" || value.after.length > 4096)) return {
			stage: "ARCHIVE",
			after: null
		};
		return {
			stage: value.stage,
			after: value.after
		};
	} catch {
		return {
			stage: "ARCHIVE",
			after: null
		};
	}
}
function encodeTwitchArchiveCursor(cursor) {
	return cursor ? JSON.stringify({
		v: 1,
		stage: cursor.stage,
		after: cursor.after
	}) : void 0;
}
/** Advance only after a valid page has been read. A terminal page moves to the
* next public shelf; the final shelf marks the channel exhausted. */
function advanceTwitchArchiveCursor(cursor, hasNextPage, endCursor) {
	if (hasNextPage && endCursor && endCursor !== cursor.after) return {
		...cursor,
		after: endCursor
	};
	if (hasNextPage) return cursor;
	const next = stages[stages.indexOf(cursor.stage) + 1];
	return next ? {
		stage: next,
		after: null
	} : null;
}
/** Clip cursors are small provider state, not a durable copy of clip rows. */
function decodeTwitchClipCursor(raw) {
	if (!raw || raw.length > 8192) return void 0;
	try {
		const value = JSON.parse(raw);
		if (value.v !== 1 || typeof value.after !== "string" || !value.after || value.after.length > 4096) return void 0;
		return { after: value.after };
	} catch {
		return;
	}
}
function encodeTwitchClipCursor(cursor) {
	return cursor ? JSON.stringify({
		v: 1,
		after: cursor.after
	}) : void 0;
}
var positive = (value) => typeof value === "number" && Number.isFinite(value) && value > 0;
function normalizeRecentPull(raw) {
	if (!raw || typeof raw !== "object") return;
	const row = raw;
	if (!positive(row.attemptedAt) || !Number.isInteger(row.failures) || row.failures < 0 || row.failures > 8) return;
	const failure = row.failure && positive(row.failure.at) && typeof row.failure.message === "string" && typeof row.failure.kind === "string" ? {
		...row.failure,
		message: row.failure.message.slice(0, 240),
		recovery: typeof row.failure.recovery === "string" ? row.failure.recovery.slice(0, 500) : ""
	} : void 0;
	return {
		attemptedAt: row.attemptedAt,
		failures: row.failures,
		...positive(row.checkedAt) ? { checkedAt: row.checkedAt } : {},
		...positive(row.retryAt) ? { retryAt: row.retryAt } : {},
		...failure ? { failure } : {},
		...typeof row.newestVideoId === "string" && row.newestVideoId.length <= 128 ? { newestVideoId: row.newestVideoId } : {}
	};
}
function recentPullFailure(channel, failure, now = Date.now()) {
	const previous = normalizeRecentPull(channel.recentPull), failures = Math.min(8, (previous?.failures ?? 0) + 1);
	const base = failure.kind === "unavailable" ? 9e5 : failure.kind === "rate-limited" || failure.kind === "integrity-challenge" ? 3e5 : failure.kind === "response-budget" ? 6e4 : 15e3;
	const retryAt = Math.max(failure.retryAt ?? 0, now + Math.min(failure.kind === "unavailable" ? 36e5 : 6e5, base * 2 ** (failures - 1)));
	return {
		...previous,
		attemptedAt: now,
		failures,
		retryAt,
		failure: {
			...failure,
			retryAt
		}
	};
}
function recentPullSuccess(channel, observation, now = Date.now()) {
	const previous = normalizeRecentPull(channel.recentPull), raw = observation.cache?.at ?? observation.lastCheckedAt ?? now;
	const checkedAt = positive(raw) && raw <= now ? raw : now;
	if (previous && checkedAt < Math.max(previous.checkedAt ?? 0, previous.failure?.at ?? 0)) return {
		...previous,
		attemptedAt: now
	};
	return {
		attemptedAt: now,
		checkedAt,
		failures: 0,
		...observation.newestVideoId || previous?.newestVideoId ? { newestVideoId: observation.newestVideoId || previous?.newestVideoId } : {}
	};
}
function recentPullReady(channel, now = Date.now()) {
	if ((channel.recentPull?.retryAt ?? 0) > now) return false;
	const legacy = channel.lastProviderFailure;
	return !(legacy?.kind === "rate-limited" && ["all", "feed"].includes(legacy.cooldownScope ?? "") && (legacy.retryAt ?? 0) > now);
}
function selectRecentPullChannels(channels, kind, now, limit) {
	return channels.filter((channel) => channel.kind === kind && !channel.importNeedsReview && !channel.id.startsWith("ytpl:") && (kind !== "youtube" || channel.channelId || /^yt:UC[\w-]{20,}$/.test(channel.id)) && recentPullReady(channel, now)).sort((a, b) => (a.recentPull?.attemptedAt ?? 0) - (b.recentPull?.attemptedAt ?? 0) || a.id.localeCompare(b.id)).slice(0, Math.max(0, Math.floor(limit)));
}
function normalizeTwitchRetry(raw) {
	if (!raw || typeof raw !== "object") return;
	const row = raw;
	if (!Number.isInteger(row.attempts) || Number(row.attempts) < 1 || Number(row.attempts) > 8 || typeof row.retryAt !== "number" || !Number.isFinite(row.retryAt) || row.retryAt <= 0) return;
	return {
		attempts: Number(row.attempts),
		retryAt: row.retryAt
	};
}
/** Durable, independent budgets. An explicit retry only changes its own scope. */
function twitchRetryPatch(channel, scope, failure, now = Date.now()) {
	const key = scope === "clips-recent" ? "twitchClipRecentRetry" : scope === "clips" ? "twitchClipRetry" : scope === "live" ? "twitchLiveRetry" : "twitchArchiveRetry";
	const failureKey = scope === "clips" || scope === "clips-recent" ? "lastClipFailure" : scope === "live" ? "lastLiveFailure" : "lastProviderFailure";
	if (!failure) return {
		[key]: void 0,
		[failureKey]: void 0
	};
	const attempts = Math.min(8, (normalizeTwitchRetry(channel[key])?.attempts ?? 0) + 1);
	const retryAt = Math.max(failure.retryAt ?? 0, now + Math.min(3e5, 15e3 * 2 ** (attempts - 1)));
	return {
		[key]: {
			attempts,
			retryAt
		},
		[failureKey]: {
			...failure,
			retryAt
		}
	};
}
/** Small enough to use in client-side creator controls and failure commits. */
function classifyTwitchFailure(error, at = Date.now()) {
	const message = (error instanceof Error ? error.message : String(error || "Unknown provider failure")).replace(/\s+/g, " ").trim().slice(0, 240);
	const common = {
		message,
		at
	};
	if (/metadata.*(?:budget|queue)|response budget/i.test(message)) return {
		...common,
		kind: "response-budget",
		recovery: "The response exceeded the metadata budget. Accepted pages and saved positions remain available; retry this creator later."
	};
	if (/\b429\b|rate.?limit|too many requests|retrying after/i.test(message)) return {
		...common,
		kind: "rate-limited",
		recovery: "Wait until the recommended retry time, or explicitly retry this creator. Saved videos and positions are preserved."
	};
	if (/integrity|challenge/i.test(message)) return {
		...common,
		kind: "integrity-challenge",
		recovery: "Twitch requires a public integrity check. Accepted pages are saved; retry this creator later."
	};
	if (/page.?limit|first.*100|public.*page|cursor.*(?:stall|advance)/i.test(message)) return {
		...common,
		kind: "public-page-limit",
		recovery: "The public shelf stopped advancing. Keep the saved position and retry later; increasing the page size will not help."
	};
	if (/json|parse|malformed|invalid response|unexpected token/i.test(message)) return {
		...common,
		kind: "malformed",
		recovery: "Twitch returned an unreadable response. Saved videos remain available; retry after the provider recovers."
	};
	if (/\b404\b|\b410\b|could not (?:find|resolve)|not found|unavailable|does not exist/i.test(message)) return {
		...common,
		kind: "unavailable",
		recovery: "Check the creator link for a rename or unavailable channel. Keep saved videos while checking."
	};
	return {
		...common,
		kind: "network-offline",
		recovery: "Twitch could not be reached. Check the connection and retry later; saved videos remain available."
	};
}
var ADULT_EXTRA_MILESTONES = [
	{
		name: "CooMeet",
		href: "https://coomeet.com/",
		copy: "CooMeet — open externally (milestone / link-out).",
		group: "cam",
		sourceId: "coomeet"
	},
	{
		name: "Flirtify",
		href: "https://flirtify.com/",
		copy: "Flirtify — open externally (milestone / link-out).",
		group: "cam",
		sourceId: "flirtify"
	},
	{
		name: "LuckyCrush",
		href: "https://luckycrush.live/",
		copy: "LuckyCrush — open externally (milestone / link-out).",
		group: "cam",
		sourceId: "luckycrush"
	},
	{
		name: "PornDudeGirls",
		href: "https://porndudegirls.com/",
		copy: "PornDudeGirls — open externally (milestone / link-out).",
		group: "cam",
		sourceId: "porndudegirls"
	},
	{
		name: "Wife Bucket",
		href: "https://www.wifebucket.com/",
		copy: "Wife Bucket — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "wife-bucket"
	},
	{
		name: "Exploited College Girls",
		href: "https://www.exploitedcollegegirls.com/",
		copy: "Exploited College Girls — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "exploited-college-girls"
	},
	{
		name: "NetVideoGirls",
		href: "https://netvideogirls.com/",
		copy: "NetVideoGirls — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "netvideogirls"
	},
	{
		name: "True Amateurs",
		href: "https://www.trueamateurs.com/",
		copy: "True Amateurs — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "true-amateurs"
	},
	{
		name: "Backroom Casting Couch",
		href: "https://backroomcastingcouch.com/",
		copy: "Backroom Casting Couch — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "backroom-casting-couch"
	},
	{
		name: "Czech Casting",
		href: "https://czechcasting.com/",
		copy: "Czech Casting — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "czech-casting"
	},
	{
		name: "BangBus",
		href: "https://bangbros.com/site/bangbus",
		copy: "BangBus — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "bangbus"
	},
	{
		name: "Private Society",
		href: "https://www.privatesociety.com/",
		copy: "Private Society — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "private-society"
	},
	{
		name: "Woodman Casting X",
		href: "https://www.woodmancastingx.com/",
		copy: "Woodman Casting X — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "woodman-casting-x"
	},
	{
		name: "LoveHomePorn",
		href: "https://www.lovehomeporn.com/",
		copy: "LoveHomePorn — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "lovehomeporn"
	},
	{
		name: "VRPorn",
		href: "https://vrporn.com/",
		copy: "VRPorn — open externally (milestone / link-out).",
		group: "vr",
		sourceId: "vrporn"
	},
	{
		name: "POVR",
		href: "https://www.povr.com/",
		copy: "POVR — open externally (milestone / link-out).",
		group: "vr",
		sourceId: "povr"
	},
	{
		name: "VirtualRealPorn",
		href: "https://virtualrealporn.com/",
		copy: "VirtualRealPorn — open externally (milestone / link-out).",
		group: "vr",
		sourceId: "virtualrealporn"
	},
	{
		name: "Naughty America VR",
		href: "https://www.naughtyamericavr.com/",
		copy: "Naughty America VR — open externally (milestone / link-out).",
		group: "vr",
		sourceId: "naughty-america-vr"
	},
	{
		name: "BadoinkVR",
		href: "https://badoinkvr.com/",
		copy: "BadoinkVR — open externally (milestone / link-out).",
		group: "vr",
		sourceId: "badoinkvr"
	},
	{
		name: "Virtual Taboo",
		href: "https://virtualtaboo.com/",
		copy: "Virtual Taboo — open externally (milestone / link-out).",
		group: "vr",
		sourceId: "virtual-taboo"
	},
	{
		name: "Dark Room VR",
		href: "https://www.darkroomvr.com/",
		copy: "Dark Room VR — open externally (milestone / link-out).",
		group: "vr",
		sourceId: "dark-room-vr"
	},
	{
		name: "VRBangers",
		href: "https://vrbangers.com/",
		copy: "VRBangers — open externally (milestone / link-out).",
		group: "vr",
		sourceId: "vrbangers"
	},
	{
		name: "WankzVR",
		href: "https://www.wankzvr.com/",
		copy: "WankzVR — open externally (milestone / link-out).",
		group: "vr",
		sourceId: "wankzvr"
	},
	{
		name: "AdultTime VR",
		href: "https://adulttime.com/",
		copy: "AdultTime VR — open externally (milestone / link-out).",
		group: "vr",
		sourceId: "adulttime-vr"
	},
	{
		name: "FapHouse VR",
		href: "https://faphouse.com/",
		copy: "FapHouse VR — open externally (milestone / link-out).",
		group: "vr",
		sourceId: "faphouse-vr"
	},
	{
		name: "FapHouse Shorts",
		href: "https://faphouse.com/shorts",
		copy: "FapHouse shorts feed — deep-link milestone (no public pull API found). Tags as source-faphouse.",
		group: "short",
		sourceId: "faphouse"
	},
	{
		name: "Brazzers VR",
		href: "https://www.brazzers.com/",
		copy: "Brazzers VR — open externally (milestone / link-out).",
		group: "vr",
		sourceId: "brazzers-vr"
	},
	{
		name: "CzechVR",
		href: "https://www.czechvr.com/",
		copy: "CzechVR — open externally (milestone / link-out).",
		group: "vr",
		sourceId: "czechvr"
	},
	{
		name: "Virtual Porn",
		href: "https://www.virtualporn.com/",
		copy: "Virtual Porn — open externally (milestone / link-out).",
		group: "vr",
		sourceId: "virtual-porn"
	},
	{
		name: "MilfVR",
		href: "https://www.milfvr.com/",
		copy: "MilfVR — open externally (milestone / link-out).",
		group: "vr",
		sourceId: "milfvr"
	},
	{
		name: "WetVR",
		href: "https://www.wetvr.com/",
		copy: "WetVR — open externally (milestone / link-out).",
		group: "vr",
		sourceId: "wetvr"
	},
	{
		name: "VRHush",
		href: "https://vrhush.com/",
		copy: "VRHush — open externally (milestone / link-out).",
		group: "vr",
		sourceId: "vrhush"
	},
	{
		name: "VRCosplayX",
		href: "https://www.vrcosplayx.com/",
		copy: "VRCosplayX — open externally (milestone / link-out).",
		group: "vr",
		sourceId: "vrcosplayx"
	},
	{
		name: "VirtualRealJapan",
		href: "https://virtualrealjapan.com/",
		copy: "VirtualRealJapan — open externally (milestone / link-out).",
		group: "vr",
		sourceId: "virtualrealjapan"
	},
	{
		name: "XVirtual",
		href: "https://www.xvirtual.com/",
		copy: "XVirtual — open externally (milestone / link-out).",
		group: "vr",
		sourceId: "xvirtual"
	},
	{
		name: "SwallowBay",
		href: "https://swallowbay.com/",
		copy: "SwallowBay — open externally (milestone / link-out).",
		group: "vr",
		sourceId: "swallowbay"
	},
	{
		name: "18VR",
		href: "https://18vr.com/",
		copy: "18VR — open externally (milestone / link-out).",
		group: "vr",
		sourceId: "18vr"
	},
	{
		name: "TmwVRnet",
		href: "https://tmwvrnet.com/",
		copy: "TmwVRnet — open externally (milestone / link-out).",
		group: "vr",
		sourceId: "tmwvrnet"
	},
	{
		name: "Fapello",
		href: "https://fapello.com/",
		copy: "Fapello — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "fapello"
	},
	{
		name: "SimpCity",
		href: "https://simpcity.su/",
		copy: "SimpCity — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "simpcity"
	},
	{
		name: "PimpBunny",
		href: "https://pimpbunny.com/",
		copy: "PimpBunny — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "pimpbunny"
	},
	{
		name: "Coomer Party",
		href: "https://coomer.party/",
		copy: "Coomer Party — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "coomer-party"
	},
	{
		name: "LeakGallery",
		href: "https://leakgallery.com/",
		copy: "LeakGallery — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "leakgallery"
	},
	{
		name: "MissAV",
		href: "https://missav.ws/",
		copy: "MissAV — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "missav"
	},
	{
		name: "SupJav",
		href: "https://supjav.com/",
		copy: "SupJav — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "supjav"
	},
	{
		name: "VJAV",
		href: "https://vjav.com/",
		copy: "VJAV — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "vjav"
	},
	{
		name: "JavGuru",
		href: "https://jav.guru/",
		copy: "JavGuru — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "javguru"
	},
	{
		name: "JAVMost",
		href: "https://www5.javmost.com/",
		copy: "JAVMost — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "javmost"
	},
	{
		name: "KissJAV (ShyAV)",
		href: "https://kissjav.com/",
		copy: "KissJAV (ShyAV) — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "kissjav-shyav"
	},
	{
		name: "7MMTV",
		href: "https://7mmtv.sx/",
		copy: "7MMTV — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "7mmtv"
	},
	{
		name: "BestJavPorn",
		href: "https://www.bestjavporn.com/",
		copy: "BestJavPorn — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "bestjavporn"
	},
	{
		name: "JavBangers",
		href: "https://www.javbangers.com/",
		copy: "JavBangers — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "javbangers"
	},
	{
		name: "91Porn",
		href: "https://91porn.com/",
		copy: "91Porn — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "91porn"
	},
	{
		name: "JAVHD.today",
		href: "https://javhd.today/",
		copy: "JAVHD.today — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "javhd-today"
	},
	{
		name: "JAVGG",
		href: "https://javgg.net/",
		copy: "JAVGG — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "javgg"
	},
	{
		name: "Javtiful",
		href: "https://javtiful.com/",
		copy: "Javtiful — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "javtiful"
	},
	{
		name: "nJAV",
		href: "https://njav.tv/",
		copy: "nJAV — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "njav"
	},
	{
		name: "Nutaku",
		href: "https://www.nutaku.net/home/",
		copy: "Nutaku — open externally (milestone / link-out).",
		group: "games",
		sourceId: "nutaku"
	},
	{
		name: "Hentai Heroes",
		href: "https://www.nutaku.net/games/hentai-heroes/",
		copy: "Hentai Heroes — open externally (milestone / link-out).",
		group: "games",
		sourceId: "hentai-heroes"
	},
	{
		name: "Lust Goddess",
		href: "https://www.nutaku.net/",
		copy: "Lust Goddess — open externally (milestone / link-out).",
		group: "games",
		sourceId: "lust-goddess"
	},
	{
		name: "F95zone",
		href: "https://f95zone.to/",
		copy: "F95zone — open externally (milestone / link-out).",
		group: "games",
		sourceId: "f95zone"
	},
	{
		name: "PornGamesHub",
		href: "https://porngameshub.com/",
		copy: "PornGamesHub — open externally (milestone / link-out).",
		group: "games",
		sourceId: "porngameshub"
	},
	{
		name: "GamCore",
		href: "https://gamcore.com/",
		copy: "GamCore — open externally (milestone / link-out).",
		group: "games",
		sourceId: "gamcore"
	},
	{
		name: "FAP Nation",
		href: "https://fap-nation.com/",
		copy: "FAP Nation — open externally (milestone / link-out).",
		group: "games",
		sourceId: "fap-nation"
	},
	{
		name: "LewdZone",
		href: "https://lewdzone.com/",
		copy: "LewdZone — open externally (milestone / link-out).",
		group: "games",
		sourceId: "lewdzone"
	},
	{
		name: "Itch.io NSFW",
		href: "https://itch.io/games/free/nsfw",
		copy: "Itch.io NSFW — open externally (milestone / link-out).",
		group: "games",
		sourceId: "itch-io-nsfw"
	},
	{
		name: "Fenoxo",
		href: "https://fenoxo.com/",
		copy: "Fenoxo — open externally (milestone / link-out).",
		group: "games",
		sourceId: "fenoxo"
	},
	{
		name: "MultPorn",
		href: "https://multporn.net/",
		copy: "MultPorn — open externally (milestone / link-out).",
		group: "comic",
		sourceId: "multporn"
	},
	{
		name: "AllPornComic",
		href: "https://allporncomic.com/",
		copy: "AllPornComic — open externally (milestone / link-out).",
		group: "comic",
		sourceId: "allporncomic"
	},
	{
		name: "8Muses",
		href: "https://8muses.io/",
		copy: "8Muses — open externally (milestone / link-out).",
		group: "comic",
		sourceId: "8muses"
	},
	{
		name: "Oglaf",
		href: "https://www.oglaf.com/",
		copy: "Oglaf — open externally (milestone / link-out).",
		group: "comic",
		sourceId: "oglaf"
	},
	{
		name: "MilfNut",
		href: "https://milfnut.com/",
		copy: "MilfNut — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "milfnut"
	},
	{
		name: "TabooTube",
		href: "https://www.tabootube.xxx/",
		copy: "TabooTube — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "tabootube"
	},
	{
		name: "FamilyPornHD",
		href: "https://familypornhd.com/",
		copy: "FamilyPornHD — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "familypornhd"
	},
	{
		name: "FamilyPorner",
		href: "https://familyporner.com/",
		copy: "FamilyPorner — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "familyporner"
	},
	{
		name: "TabooDude",
		href: "https://theporndude.com/",
		copy: "TabooDude — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "taboodude"
	},
	{
		name: "XVideos Taboo",
		href: "https://www.xvideos.com/?k=taboo",
		copy: "XVideos Taboo — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "xvideos-taboo"
	},
	{
		name: "SxyPrn Taboo",
		href: "https://sxyprn.com/taboo",
		copy: "SxyPrn Taboo — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "sxyprn-taboo"
	},
	{
		name: "iXXX Taboo",
		href: "https://www.ixxx.com/search/?q=taboo",
		copy: "iXXX Taboo — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "ixxx-taboo"
	},
	{
		name: "PornPics Taboo",
		href: "https://www.pornpics.com/?q=taboo",
		copy: "PornPics Taboo — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "pornpics-taboo"
	},
	{
		name: "Scrolller Taboo",
		href: "https://scrolller.com/search/taboo",
		copy: "Scrolller Taboo — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "scrolller-taboo"
	},
	{
		name: "ImageFap Taboo",
		href: "https://www.imagefap.com/gallery.php?search=taboo",
		copy: "ImageFap Taboo — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "imagefap-taboo"
	},
	{
		name: "XVideos Gangbang",
		href: "https://www.xvideos.com/?k=gangbang",
		copy: "XVideos Gangbang — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "xvideos-gangbang"
	},
	{
		name: "PornHub GangBang",
		href: "https://www.pornhub.com/video/search?search=gangbang",
		copy: "PornHub GangBang — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "pornhub-gangbang"
	},
	{
		name: "xHamster GangBang",
		href: "https://xhamster.com/search/gangbang",
		copy: "xHamster GangBang — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "xhamster-gangbang"
	},
	{
		name: "SpankBang GangBang",
		href: "https://spankbang.com/s/gangbang/",
		copy: "SpankBang GangBang — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "spankbang-gangbang"
	},
	{
		name: "Eporner GangBang",
		href: "https://www.eporner.com/search/gangbang/",
		copy: "Eporner GangBang — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "eporner-gangbang"
	},
	{
		name: "PornHub Cuckold",
		href: "https://www.pornhub.com/video/search?search=cuckold",
		copy: "PornHub Cuckold — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "pornhub-cuckold"
	},
	{
		name: "xHamster Cuckold",
		href: "https://xhamster.com/search/cuckold",
		copy: "xHamster Cuckold — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "xhamster-cuckold"
	},
	{
		name: "XVideos Cuckold",
		href: "https://www.xvideos.com/?k=cuckold",
		copy: "XVideos Cuckold — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "xvideos-cuckold"
	},
	{
		name: "CuckoldsPorn",
		href: "https://www.cuckoldsporn.com/",
		copy: "CuckoldsPorn — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "cuckoldsporn"
	},
	{
		name: "SpankBang Cuckold",
		href: "https://spankbang.com/s/cuckold/",
		copy: "SpankBang Cuckold — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "spankbang-cuckold"
	},
	{
		name: "Eporner Cuckold",
		href: "https://www.eporner.com/search/cuckold/",
		copy: "Eporner Cuckold — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "eporner-cuckold"
	},
	{
		name: "SxyPrn Cuckold",
		href: "https://sxyprn.com/cuckold",
		copy: "SxyPrn Cuckold — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "sxyprn-cuckold"
	},
	{
		name: "XVideos Masturbation",
		href: "https://www.xvideos.com/?k=masturbation",
		copy: "XVideos Masturbation — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "xvideos-masturbation"
	},
	{
		name: "PornHub Masturbation",
		href: "https://www.pornhub.com/video/search?search=masturbation",
		copy: "PornHub Masturbation — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "pornhub-masturbation"
	},
	{
		name: "xHamster Masturbation",
		href: "https://xhamster.com/search/masturbation",
		copy: "xHamster Masturbation — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "xhamster-masturbation"
	},
	{
		name: "PornTrex Masturbation",
		href: "https://www.porntrex.com/search/masturbation",
		copy: "PornTrex Masturbation — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "porntrex-masturbation"
	},
	{
		name: "SxyPrn Masturbation",
		href: "https://sxyprn.com/masturbation",
		copy: "SxyPrn Masturbation — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "sxyprn-masturbation"
	},
	{
		name: "iXXX Masturbating",
		href: "https://www.ixxx.com/search/?q=masturbating",
		copy: "iXXX Masturbating — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "ixxx-masturbating"
	},
	{
		name: "AlohaTube Masturbation",
		href: "https://www.alohatube.com/search/masturbation",
		copy: "AlohaTube Masturbation — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "alohatube-masturbation"
	},
	{
		name: "iWank Masturbation",
		href: "https://www.iwank.tv/masturbation",
		copy: "iWank Masturbation — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "iwank-masturbation"
	},
	{
		name: "PornPics Masturbation",
		href: "https://www.pornpics.com/?q=masturbation",
		copy: "PornPics Masturbation — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "pornpics-masturbation"
	},
	{
		name: "Scrolller Masturbation",
		href: "https://scrolller.com/search/masturbation",
		copy: "Scrolller Masturbation — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "scrolller-masturbation"
	},
	{
		name: "Sex.com Masturbation",
		href: "https://www.sex.com/search?query=masturbation",
		copy: "Sex.com Masturbation — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "sex-com-masturbation"
	},
	{
		name: "ImageFap Masturbation",
		href: "https://www.imagefap.com/gallery.php?search=masturbation",
		copy: "ImageFap Masturbation — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "imagefap-masturbation"
	},
	{
		name: "XVideos Voyeur",
		href: "https://www.xvideos.com/?k=voyeur",
		copy: "XVideos Voyeur — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "xvideos-voyeur"
	},
	{
		name: "PornHub Voyeur",
		href: "https://www.pornhub.com/video/search?search=voyeur",
		copy: "PornHub Voyeur — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "pornhub-voyeur"
	},
	{
		name: "xHamster Voyeur",
		href: "https://xhamster.com/search/voyeur",
		copy: "xHamster Voyeur — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "xhamster-voyeur"
	},
	{
		name: "iXXX Voyeur",
		href: "https://www.ixxx.com/search/?q=voyeur",
		copy: "iXXX Voyeur — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "ixxx-voyeur"
	},
	{
		name: "Scrolller Voyeur",
		href: "https://scrolller.com/search/voyeur",
		copy: "Scrolller Voyeur — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "scrolller-voyeur"
	},
	{
		name: "PornPics Voyeur",
		href: "https://www.pornpics.com/?q=voyeur",
		copy: "PornPics Voyeur — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "pornpics-voyeur"
	},
	{
		name: "Voyeur House Club",
		href: "https://www.voyeurhouse.com/",
		copy: "Voyeur House Club — open externally (milestone / link-out).",
		group: "tube",
		sourceId: "voyeur-house-club"
	},
	{
		name: "eFukt",
		href: "https://efukt.com/",
		copy: "eFukt — open externally (milestone / link-out).",
		group: "community",
		sourceId: "efukt"
	},
	{
		name: "XVideos Funny Porn",
		href: "https://www.xvideos.com/?k=funny+porn",
		copy: "XVideos Funny Porn — open externally (milestone / link-out).",
		group: "community",
		sourceId: "xvideos-funny-porn"
	},
	{
		name: "PornHub Funny Porn",
		href: "https://www.pornhub.com/video/search?search=funny+porn",
		copy: "PornHub Funny Porn — open externally (milestone / link-out).",
		group: "community",
		sourceId: "pornhub-funny-porn"
	},
	{
		name: "xHamster Funny Porn",
		href: "https://xhamster.com/search/funny+porn",
		copy: "xHamster Funny Porn — open externally (milestone / link-out).",
		group: "community",
		sourceId: "xhamster-funny-porn"
	},
	{
		name: "XNXX Funny Porn",
		href: "https://www.xnxx.com/search/funny+porn",
		copy: "XNXX Funny Porn — open externally (milestone / link-out).",
		group: "community",
		sourceId: "xnxx-funny-porn"
	},
	{
		name: "ImageFap Captions",
		href: "https://www.imagefap.com/gallery.php?search=captions",
		copy: "ImageFap Captions — open externally (milestone / link-out).",
		group: "community",
		sourceId: "imagefap-captions"
	},
	{
		name: "Sex.com Captions",
		href: "https://www.sex.com/search?query=captions",
		copy: "Sex.com Captions — open externally (milestone / link-out).",
		group: "community",
		sourceId: "sex-com-captions"
	},
	{
		name: "AcmeJoy",
		href: "https://www.acmejoy.com/",
		copy: "AcmeJoy — open externally (milestone / link-out).",
		group: "directory",
		sourceId: "acmejoy"
	},
	{
		name: "BestVibe",
		href: "https://www.bestvibe.com/",
		copy: "BestVibe — open externally (milestone / link-out).",
		group: "directory",
		sourceId: "bestvibe"
	},
	{
		name: "Adam & Eve Store",
		href: "https://www.adameve.com/",
		copy: "Adam & Eve Store — open externally (milestone / link-out).",
		group: "directory",
		sourceId: "adam-eve-store"
	},
	{
		name: "Fleshlight",
		href: "https://www.fleshlight.com/",
		copy: "Fleshlight — open externally (milestone / link-out).",
		group: "directory",
		sourceId: "fleshlight"
	},
	{
		name: "Tenga",
		href: "https://www.tenga.co.jp/",
		copy: "Tenga — open externally (milestone / link-out).",
		group: "directory",
		sourceId: "tenga"
	},
	{
		name: "Lovense",
		href: "https://www.lovense.com/",
		copy: "Lovense — open externally (milestone / link-out).",
		group: "directory",
		sourceId: "lovense"
	},
	{
		name: "The Handy Feeling",
		href: "https://www.thehandy.com/",
		copy: "The Handy Feeling — open externally (milestone / link-out).",
		group: "directory",
		sourceId: "the-handy-feeling"
	},
	{
		name: "Kiiroo",
		href: "https://www.kiiroo.com/",
		copy: "Kiiroo — open externally (milestone / link-out).",
		group: "directory",
		sourceId: "kiiroo"
	},
	{
		name: "BathMate Direct",
		href: "https://www.bathmatedirect.com/",
		copy: "BathMate Direct — open externally (milestone / link-out).",
		group: "directory",
		sourceId: "bathmate-direct"
	},
	{
		name: "The Enhanced Male",
		href: "https://www.enhancedmale.com/",
		copy: "The Enhanced Male — open externally (milestone / link-out).",
		group: "directory",
		sourceId: "the-enhanced-male"
	},
	{
		name: "MrSkin",
		href: "https://www.mrskin.com/",
		copy: "MrSkin — open externally (milestone / link-out).",
		group: "directory",
		sourceId: "mrskin"
	},
	{
		name: "GoneWild",
		href: "https://www.reddit.com/r/gonewild/",
		copy: "GoneWild — open externally (milestone / link-out).",
		group: "community",
		sourceId: "gonewild"
	},
	{
		name: "NSFW",
		href: "https://www.reddit.com/r/nsfw/",
		copy: "NSFW — open externally (milestone / link-out).",
		group: "community",
		sourceId: "nsfw"
	},
	{
		name: "Reddit NSFW GIF",
		href: "https://www.reddit.com/r/NSFW_GIF/",
		copy: "Reddit NSFW GIF — open externally (milestone / link-out).",
		group: "community",
		sourceId: "reddit-nsfw-gif"
	},
	{
		name: "Reddit Real Girls",
		href: "https://www.reddit.com/r/RealGirls/",
		copy: "Reddit Real Girls — open externally (milestone / link-out).",
		group: "community",
		sourceId: "reddit-real-girls"
	},
	{
		name: "JizzedToThis",
		href: "https://www.reddit.com/r/JizzedToThis/",
		copy: "JizzedToThis — open externally (milestone / link-out).",
		group: "community",
		sourceId: "jizzedtothis"
	},
	{
		name: "Hold The Moan",
		href: "https://www.reddit.com/r/HoldTheMoan/",
		copy: "Hold The Moan — open externally (milestone / link-out).",
		group: "community",
		sourceId: "hold-the-moan"
	},
	{
		name: "Reddit Busty Petite",
		href: "https://www.reddit.com/r/BustyPetite/",
		copy: "Reddit Busty Petite — open externally (milestone / link-out).",
		group: "community",
		sourceId: "reddit-busty-petite"
	},
	{
		name: "Reddit CumSluts",
		href: "https://www.reddit.com/r/cumsluts/",
		copy: "Reddit CumSluts — open externally (milestone / link-out).",
		group: "community",
		sourceId: "reddit-cumsluts"
	},
	{
		name: "PetiteGoneWild",
		href: "https://www.reddit.com/r/PetiteGoneWild/",
		copy: "PetiteGoneWild — open externally (milestone / link-out).",
		group: "community",
		sourceId: "petitegonewild"
	},
	{
		name: "Sex",
		href: "https://www.reddit.com/r/sex/",
		copy: "Sex — open externally (milestone / link-out).",
		group: "community",
		sourceId: "sex"
	},
	{
		name: "Reddit TikTokThots",
		href: "https://www.reddit.com/r/TikTokThots/",
		copy: "Reddit TikTokThots — open externally (milestone / link-out).",
		group: "community",
		sourceId: "reddit-tiktokthots"
	},
	{
		name: "Reddit Mature Milf",
		href: "https://www.reddit.com/r/maturemilf/",
		copy: "Reddit Mature Milf — open externally (milestone / link-out).",
		group: "community",
		sourceId: "reddit-mature-milf"
	},
	{
		name: "Adorable Porn",
		href: "https://www.reddit.com/r/adorableporn/",
		copy: "Adorable Porn — open externally (milestone / link-out).",
		group: "community",
		sourceId: "adorable-porn"
	},
	{
		name: "Reddit NSFW GIFS",
		href: "https://www.reddit.com/r/nsfw_gifs/",
		copy: "Reddit NSFW GIFS — open externally (milestone / link-out).",
		group: "community",
		sourceId: "reddit-nsfw-gifs"
	},
	{
		name: "God Pussy",
		href: "https://www.reddit.com/r/GodPussy/",
		copy: "God Pussy — open externally (milestone / link-out).",
		group: "community",
		sourceId: "god-pussy"
	},
	{
		name: "Reddit AsiansGoneWild",
		href: "https://www.reddit.com/r/AsiansGoneWild/",
		copy: "Reddit AsiansGoneWild — open externally (milestone / link-out).",
		group: "community",
		sourceId: "reddit-asiansgonewild"
	},
	{
		name: "Reddit GirlsFinishingTheJob",
		href: "https://www.reddit.com/r/GirlsFinishingTheJob/",
		copy: "Reddit GirlsFinishingTheJob — open externally (milestone / link-out).",
		group: "community",
		sourceId: "reddit-girlsfinishingthejob"
	},
	{
		name: "Reddit Rule 34",
		href: "https://www.reddit.com/r/rule34/",
		copy: "Reddit Rule 34 — open externally (milestone / link-out).",
		group: "community",
		sourceId: "reddit-rule-34"
	},
	{
		name: "Reddit Public",
		href: "https://www.reddit.com/r/Public/",
		copy: "Reddit Public — open externally (milestone / link-out).",
		group: "community",
		sourceId: "reddit-public"
	},
	{
		name: "Reddit College Sluts",
		href: "https://www.reddit.com/r/collegesluts/",
		copy: "Reddit College Sluts — open externally (milestone / link-out).",
		group: "community",
		sourceId: "reddit-college-sluts"
	},
	{
		name: "Reddit Amateur",
		href: "https://www.reddit.com/r/Amateur/",
		copy: "Reddit Amateur — open externally (milestone / link-out).",
		group: "community",
		sourceId: "reddit-amateur"
	},
	{
		name: "Reddit Hentai",
		href: "https://www.reddit.com/r/hentai/",
		copy: "Reddit Hentai — open externally (milestone / link-out).",
		group: "community",
		sourceId: "reddit-hentai"
	},
	{
		name: "Reddit Bigger Than You Thought",
		href: "https://www.reddit.com/r/BiggerThanYouThought/",
		copy: "Reddit Bigger Than You Thought — open externally (milestone / link-out).",
		group: "community",
		sourceId: "reddit-bigger-than-you-thought"
	},
	{
		name: "Mom Bod",
		href: "https://www.reddit.com/r/MomBod/",
		copy: "Mom Bod — open externally (milestone / link-out).",
		group: "community",
		sourceId: "mom-bod"
	},
	{
		name: "Reddit Small Cutie",
		href: "https://www.reddit.com/r/SmallCutie/",
		copy: "Reddit Small Cutie — open externally (milestone / link-out).",
		group: "community",
		sourceId: "reddit-small-cutie"
	},
	{
		name: "Reddit Tip Of My Penis",
		href: "https://www.reddit.com/r/TipOfMyPenis/",
		copy: "Reddit Tip Of My Penis — open externally (milestone / link-out).",
		group: "community",
		sourceId: "reddit-tip-of-my-penis"
	},
	{
		name: "Reddit MassiveTitsnAss",
		href: "https://www.reddit.com/r/MassiveTitsNAss/",
		copy: "Reddit MassiveTitsnAss — open externally (milestone / link-out).",
		group: "community",
		sourceId: "reddit-massivetitsnass"
	},
	{
		name: "Reddit Titty Drop",
		href: "https://www.reddit.com/r/tittydrop/",
		copy: "Reddit Titty Drop — open externally (milestone / link-out).",
		group: "community",
		sourceId: "reddit-titty-drop"
	},
	{
		name: "Reddit Porn In Fifteen Seconds",
		href: "https://www.reddit.com/r/porninfifteenseconds/",
		copy: "Reddit Porn In Fifteen Seconds — open externally (milestone / link-out).",
		group: "community",
		sourceId: "reddit-porn-in-fifteen-seconds"
	},
	{
		name: "JustFriendsHavingFun",
		href: "https://www.reddit.com/r/JustFriendsHavingFun/",
		copy: "JustFriendsHavingFun — open externally (milestone / link-out).",
		group: "community",
		sourceId: "justfriendshavingfun"
	}
];
/** Niche / feet / cosplay / celeb / manhwa milestones — link-out only, 18+. Skip revenge-porn leak sites. */
var ADULT_NICHE_MILESTONES = [
	{
		name: "PornDude AI",
		href: "https://theporndude.com/ai-porn",
		copy: "PornDude AI — open externally (milestone / link-out).",
		group: "review",
		sourceId: "porndude-ai"
	},
	{
		name: "Hentai Sites hub",
		href: "https://theporndude.com/hentai-sites",
		copy: "Hentai Sites hub — open externally (milestone / link-out).",
		group: "review",
		sourceId: "porndude-hentai"
	},
	{
		name: "BestPornGames",
		href: "https://bestporngames.com/",
		copy: "BestPornGames — open externally (milestone / link-out).",
		group: "review",
		sourceId: "bestporngames"
	},
	{
		name: "TPD Deals",
		href: "https://theporndude.com/deals",
		copy: "TPD Deals — open externally (milestone / link-out).",
		group: "review",
		sourceId: "tpd-deals"
	},
	{
		name: "MyGaySites",
		href: "https://mygaysites.com/",
		copy: "MyGaySites — open externally (milestone / link-out).",
		group: "review",
		sourceId: "mygaysites"
	},
	{
		name: "Porn Webmasters",
		href: "https://theporndude.com/porn-webmasters",
		copy: "Porn Webmasters — open externally (milestone / link-out).",
		group: "review",
		sourceId: "porn-webmasters"
	},
	{
		name: "RealLifeCam",
		href: "https://reallifecam.com/",
		copy: "RealLifeCam — open externally (milestone / link-out).",
		group: "voyeur",
		sourceId: "reallifecam"
	},
	{
		name: "Voyeur House TV",
		href: "https://www.voyeurhouse.com/",
		copy: "Voyeur House TV — open externally (milestone / link-out).",
		group: "voyeur",
		sourceId: "voyeur-house-tv"
	},
	{
		name: "StripChat Spy Shows",
		href: "https://stripchat.com/tags/spy",
		copy: "StripChat Spy Shows — open externally (milestone / link-out).",
		group: "voyeur",
		sourceId: "stripchat-spy"
	},
	{
		name: "BongaCams Spy Shows",
		href: "https://bongacams.com/",
		copy: "BongaCams Spy Shows — open externally (milestone / link-out).",
		group: "voyeur",
		sourceId: "bongacams-spy"
	},
	{
		name: "ThePornDude Blog",
		href: "https://theporndude.com/blog",
		copy: "ThePornDude Blog — open externally (milestone / link-out).",
		group: "blog",
		sourceId: "porndude-blog"
	},
	{
		name: "DampLips",
		href: "https://damplips.com/",
		copy: "DampLips — open externally (milestone / link-out).",
		group: "blog",
		sourceId: "damplips"
	},
	{
		name: "Bdsmlr",
		href: "https://bdsmlr.com/",
		copy: "Bdsmlr — open externally (milestone / link-out).",
		group: "blog",
		sourceId: "bdsmlr"
	},
	{
		name: "Phun.org",
		href: "https://www.phun.org/",
		copy: "Phun.org — open externally (milestone / link-out).",
		group: "blog",
		sourceId: "phun"
	},
	{
		name: "xMissy",
		href: "https://www.xmissy.nl/",
		copy: "xMissy — open externally (milestone / link-out).",
		group: "blog",
		sourceId: "xmissy"
	},
	{
		name: "SexyAndFunny",
		href: "https://www.sexyandfunny.com/",
		copy: "SexyAndFunny — open externally (milestone / link-out).",
		group: "blog",
		sourceId: "sexyandfunny"
	},
	{
		name: "AlRincon",
		href: "https://www.alrincon.com/",
		copy: "AlRincon — open externally (milestone / link-out).",
		group: "blog",
		sourceId: "alrincon"
	},
	{
		name: "URLGalleries",
		href: "https://www.urlgalleries.net/",
		copy: "URLGalleries — open externally (milestone / link-out).",
		group: "blog",
		sourceId: "urlgalleries"
	},
	{
		name: "Fleshbot",
		href: "https://www.fleshbot.com/",
		copy: "Fleshbot — open externally (milestone / link-out).",
		group: "blog",
		sourceId: "fleshbot"
	},
	{
		name: "RussiaSexyGirls",
		href: "https://russiasexygirls.com/",
		copy: "RussiaSexyGirls — open externally (milestone / link-out).",
		group: "blog",
		sourceId: "russiasexygirls"
	},
	{
		name: "AI Smut Writer",
		href: "https://aisumutwriter.com/",
		copy: "AI Smut Writer — open externally (milestone / link-out).",
		group: "ai",
		sourceId: "ai-smut-writer"
	},
	{
		name: "MySpicyVanilla",
		href: "https://www.myspicyvanilla.com/",
		copy: "MySpicyVanilla — open externally (milestone / link-out).",
		group: "ai",
		sourceId: "myspicyvanilla"
	},
	{
		name: "NovelX",
		href: "https://novelx.ai/",
		copy: "NovelX — open externally (milestone / link-out).",
		group: "ai",
		sourceId: "novelx"
	},
	{
		name: "CrazyShit",
		href: "https://www.crazyshit.com/",
		copy: "CrazyShit — open externally (milestone / link-out).",
		group: "extreme",
		sourceId: "crazyshit"
	},
	{
		name: "DarknessPorn",
		href: "https://www.darknessporn.com/",
		copy: "DarknessPorn — open externally (milestone / link-out).",
		group: "extreme",
		sourceId: "darknessporn"
	},
	{
		name: "XVideos Horror",
		href: "https://www.xvideos.com/?k=horror",
		copy: "XVideos Horror — open externally (milestone / link-out).",
		group: "extreme",
		sourceId: "xvideos-horror"
	},
	{
		name: "PornHub Horror",
		href: "https://www.pornhub.com/video/search?search=horror",
		copy: "PornHub Horror — open externally (milestone / link-out).",
		group: "extreme",
		sourceId: "pornhub-horror"
	},
	{
		name: "Scrolller Weird Porn",
		href: "https://scrolller.com/",
		copy: "Scrolller Weird Porn — open externally (milestone / link-out).",
		group: "extreme",
		sourceId: "scrolller-weird"
	},
	{
		name: "Literotica Horror",
		href: "https://www.literotica.com/c/horror-erotica",
		copy: "Literotica Horror — open externally (milestone / link-out).",
		group: "extreme",
		sourceId: "literotica-horror"
	},
	{
		name: "NaughtyBlog",
		href: "https://www.naughtyblog.org/",
		copy: "NaughtyBlog — link-out only (no in-app downloader or torrent client).",
		group: "download",
		sourceId: "naughtyblog"
	},
	{
		name: "0XXX",
		href: "https://0xxx.ws/",
		copy: "0XXX — link-out only (no in-app downloader or torrent client).",
		group: "download",
		sourceId: "0xxx"
	},
	{
		name: "XXXStreams",
		href: "https://xxxstreams.org/",
		copy: "XXXStreams — link-out only (no in-app downloader or torrent client).",
		group: "download",
		sourceId: "xxxstreams"
	},
	{
		name: "JavLibrary",
		href: "https://www.javlibrary.com/",
		copy: "JavLibrary — link-out only (no in-app downloader or torrent client).",
		group: "download",
		sourceId: "javlibrary"
	},
	{
		name: "MaxJAV",
		href: "https://maxjav.com/",
		copy: "MaxJAV — link-out only (no in-app downloader or torrent client).",
		group: "download",
		sourceId: "maxjav"
	},
	{
		name: "HotPornFile",
		href: "https://www.hotpornfile.org/",
		copy: "HotPornFile — link-out only (no in-app downloader or torrent client).",
		group: "download",
		sourceId: "hotpornfile"
	},
	{
		name: "Keep2Porn",
		href: "https://keep2porn.com/",
		copy: "Keep2Porn — link-out only (no in-app downloader or torrent client).",
		group: "download",
		sourceId: "keep2porn"
	},
	{
		name: "The Pirate Bay",
		href: "https://thepiratebay.org/",
		copy: "The Pirate Bay — link-out only (no in-app downloader or torrent client).",
		group: "torrent",
		sourceId: "thepiratebay"
	},
	{
		name: "1337x",
		href: "https://1337x.to/",
		copy: "1337x — link-out only (no in-app downloader or torrent client).",
		group: "torrent",
		sourceId: "1337x"
	},
	{
		name: "Sukebei Nyaa",
		href: "https://sukebei.nyaa.si/",
		copy: "Sukebei Nyaa — link-out only (no in-app downloader or torrent client).",
		group: "torrent",
		sourceId: "sukebei-nyaa"
	},
	{
		name: "OneJAV",
		href: "https://onejav.com/",
		copy: "OneJAV — link-out only (no in-app downloader or torrent client).",
		group: "torrent",
		sourceId: "onejav"
	},
	{
		name: "Tokyo Toshokan",
		href: "https://www.tokyotosho.info/",
		copy: "Tokyo Toshokan — link-out only (no in-app downloader or torrent client).",
		group: "torrent",
		sourceId: "tokyo-toshokan"
	},
	{
		name: "PornHub Feet",
		href: "https://www.pornhub.com/video/search?search=feet",
		copy: "PornHub Feet — open externally (milestone / link-out).",
		group: "feet",
		sourceId: "pornhub-feet"
	},
	{
		name: "XVideos Feet",
		href: "https://www.xvideos.com/?k=feet",
		copy: "XVideos Feet — open externally (milestone / link-out).",
		group: "feet",
		sourceId: "xvideos-feet"
	},
	{
		name: "xHamster Feet",
		href: "https://xhamster.com/search/feet",
		copy: "xHamster Feet — open externally (milestone / link-out).",
		group: "feet",
		sourceId: "xhamster-feet"
	},
	{
		name: "Feet9",
		href: "https://www.feet9.com/",
		copy: "Feet9 — open externally (milestone / link-out).",
		group: "feet",
		sourceId: "feet9"
	},
	{
		name: "FootStockings",
		href: "https://www.footstockings.com/",
		copy: "FootStockings — open externally (milestone / link-out).",
		group: "feet",
		sourceId: "footstockings"
	},
	{
		name: "wikiFeet",
		href: "https://www.wikifeet.com/",
		copy: "wikiFeet — open externally (milestone / link-out).",
		group: "feet",
		sourceId: "wikifeet-db"
	},
	{
		name: "Eporner Footjob",
		href: "https://www.eporner.com/search/footjob/",
		copy: "Eporner Footjob — open externally (milestone / link-out).",
		group: "feet",
		sourceId: "eporner-footjob"
	},
	{
		name: "AZNude Feet",
		href: "https://www.aznude.com/",
		copy: "AZNude Feet — open externally (milestone / link-out).",
		group: "feet",
		sourceId: "aznude-feet"
	},
	{
		name: "PornHub Cosplay",
		href: "https://www.pornhub.com/video/search?search=cosplay",
		copy: "PornHub Cosplay — open externally (milestone / link-out).",
		group: "cosplay",
		sourceId: "pornhub-cosplay"
	},
	{
		name: "VRCosplayX",
		href: "https://www.vrcosplayx.com/",
		copy: "VRCosplayX — open externally (milestone / link-out).",
		group: "cosplay",
		sourceId: "vrcosplayx-hub"
	},
	{
		name: "Eporner Cosplay",
		href: "https://www.eporner.com/search/cosplay/",
		copy: "Eporner Cosplay — open externally (milestone / link-out).",
		group: "cosplay",
		sourceId: "eporner-cosplay"
	},
	{
		name: "AZNude",
		href: "https://www.aznude.com/",
		copy: "AZNude — open externally (milestone / link-out).",
		group: "celeb",
		sourceId: "aznude"
	},
	{
		name: "Nudography",
		href: "https://www.nudography.com/",
		copy: "Nudography — open externally (milestone / link-out).",
		group: "celeb",
		sourceId: "nudography"
	},
	{
		name: "MrSkin",
		href: "https://www.mrskin.com/",
		copy: "MrSkin — open externally (milestone / link-out).",
		group: "celeb",
		sourceId: "mrskin-celeb"
	},
	{
		name: "Toomics",
		href: "https://toomics.com/",
		copy: "Toomics — open externally (milestone / link-out).",
		group: "manhwa",
		sourceId: "toomics"
	},
	{
		name: "Eporner Manhwa",
		href: "https://www.eporner.com/search/manhwa/",
		copy: "Eporner Manhwa — open externally (milestone / link-out).",
		group: "manhwa",
		sourceId: "eporner-manhwa"
	},
	{
		name: "PornHub Hentai Comics",
		href: "https://www.pornhub.com/video/search?search=manhwa",
		copy: "PornHub Hentai Comics — open externally (milestone / link-out).",
		group: "manhwa",
		sourceId: "pornhub-manhwa"
	}
];
/** Adult fetish / category chips. Featured first; includes every Pornhub category + languages. */
var ADULT_FEATURED_FETISH_TAGS = [
	"milf",
	"double penetration",
	"dp",
	"role play",
	"roleplay",
	"feet",
	"anal",
	"lesbian",
	"gangbang",
	"cuckold",
	"cosplay",
	"step fantasy",
	"latina",
	"asian",
	"ebony",
	"bbw",
	"hentai",
	"vr",
	"webcam"
];
var ADULT_CATALOG_FETISH_TAGS = [
	"ebony",
	"bbw",
	"solo female",
	"big dick",
	"masturbation",
	"transgender",
	"pornstar",
	"exclusive",
	"interracial",
	"small tits",
	"18-25",
	"60fps",
	"ai",
	"amateur",
	"anal",
	"arab",
	"asian",
	"babe",
	"babysitter (18+)",
	"behind the scenes",
	"big ass",
	"big tits",
	"bisexual male",
	"blonde",
	"blowjob",
	"bondage",
	"brazilian",
	"british",
	"brunette",
	"bukkake",
	"cartoon",
	"casting",
	"celebrity",
	"closed captions",
	"college (18+)",
	"compilation",
	"cosplay",
	"creampie",
	"cuckold",
	"cumshot",
	"czech",
	"deepthroat",
	"described video",
	"double penetration",
	"euro",
	"feet",
	"female orgasm",
	"fetish",
	"fingering",
	"fisting",
	"french",
	"funny",
	"gaming",
	"gangbang",
	"german",
	"handjob",
	"hardcore",
	"hd porn",
	"hentai",
	"indian",
	"interactive",
	"italian",
	"japanese",
	"korean",
	"latina",
	"lesbian",
	"massage",
	"mature",
	"milf",
	"muscular men",
	"music",
	"old/young (18+)",
	"orgy",
	"parody",
	"party",
	"pissing",
	"podcast",
	"popular with women",
	"pov",
	"public",
	"pussy licking",
	"reaction",
	"reality",
	"red head",
	"role play",
	"romantic",
	"rough sex",
	"russian",
	"school (18+)",
	"sfw",
	"smoking",
	"solo male",
	"squirt",
	"step fantasy",
	"strap on",
	"striptease",
	"tattooed women",
	"threesome",
	"toys",
	"verified amateurs",
	"verified couples",
	"verified models",
	"vintage",
	"virtual reality",
	"webcam",
	"spanish",
	"arabic",
	"portuguese",
	"tagalog",
	"thai",
	"ukrainian",
	"polish",
	"dutch",
	"hindi",
	"chinese",
	"persian",
	"dp",
	"roleplay",
	"vr",
	"thruple",
	"manhwa",
	"taboo",
	"celeb",
	"bdsm",
	"femdom",
	"jav",
	"pawg",
	"pegging",
	"joi",
	"bbc"
];
function uniqueLower(values) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const raw of values) {
		const tag = raw.trim().toLowerCase();
		if (tag.length < 2 || seen.has(tag)) continue;
		seen.add(tag);
		out.push(tag);
	}
	return out;
}
/** Featured first, then the rest of the catalog (stable, de-duped). */
var ADULT_CURATED_FETISH_TAGS = uniqueLower([...ADULT_FEATURED_FETISH_TAGS, ...ADULT_CATALOG_FETISH_TAGS]);
uniqueLower([
	"milf",
	"double penetration",
	"role play",
	"feet",
	"anal",
	"lesbian",
	"gangbang",
	"cuckold",
	"cosplay",
	"step fantasy",
	"latina",
	"asian",
	"ebony",
	"bbw",
	"hentai",
	"vr",
	"webcam",
	"creampie",
	"amateur",
	"threesome",
	"bondage",
	"pov",
	"japanese"
]);
var FETISH_SEARCH_ALIASES = {
	"dp": "double penetration",
	"roleplay": "role play",
	"role play": "role play",
	"vr": "virtual reality",
	"virtual reality": "vr",
	"red head": "redhead",
	"strap on": "strap on",
	"transgender": "trans",
	"thruple": "threesome",
	"celeb": "celebrity",
	"babysitter (18+)": "babysitter",
	"college (18+)": "college",
	"school (18+)": "school 18",
	"old/young (18+)": "old young",
	"solo female": "solo female",
	"solo male": "solo male",
	"hd porn": "hd",
	"18-25": "18-25"
};
function fetishSearchQuery(tag) {
	const clean = tag.trim().toLowerCase();
	return FETISH_SEARCH_ALIASES[clean] ?? clean;
}
/** High-signal fetish / engagement tokens that should rise in Adult tag + rec ranking. */
var ADULT_EXTREME_RANK_TAGS = uniqueLower([
	"extreme",
	"fisting",
	"bondage",
	"bdsm",
	"gangbang",
	"double penetration",
	"dp",
	"anal",
	"rough sex",
	"rough",
	"femdom",
	"pegging",
	"bukkake",
	"creampie",
	"cuckold",
	"taboo",
	"threesome",
	"orgy",
	"hardcore",
	"bbc"
]);
var EXTREME_SET = new Set(ADULT_EXTREME_RANK_TAGS);
/** Extra rank points for extreme / high-signal Adult tags (0 when not a hit). */
var rankBoostCache = /* @__PURE__ */ new Map();
var FEATURED_SET = new Set(ADULT_FEATURED_FETISH_TAGS);
function adultTagRankBoost(tag) {
	const cached = rankBoostCache.get(tag);
	if (cached !== void 0) return cached;
	const raw = tag.trim().toLowerCase();
	const bare = raw.replace(/^fetish-/, "").replace(/^source-/, "").replace(/^creator-/, "").replace(/-/g, " ");
	const boost = EXTREME_SET.has(raw) || EXTREME_SET.has(bare) || raw.includes("extreme") || bare.includes("extreme") ? 10 : FEATURED_SET.has(raw) || FEATURED_SET.has(bare) ? 3 : 0;
	if (rankBoostCache.size >= 8192) rankBoostCache.delete(rankBoostCache.keys().next().value);
	rankBoostCache.set(tag, boost);
	return boost;
}
var RULES = [
	{
		genre: "genre-amateur",
		meta: "meta-production-amateur",
		aliases: [
			"amateur",
			"verified amateurs",
			"reality",
			"casting"
		]
	},
	{
		genre: "genre-performer",
		meta: "meta-performer",
		aliases: [
			"pornstar",
			"celebrity",
			"celeb",
			"verified models"
		]
	},
	{
		genre: "genre-fantasy",
		meta: "meta-roleplay",
		aliases: [
			"role play",
			"roleplay",
			"cosplay",
			"parody",
			"step fantasy",
			"taboo"
		]
	},
	{
		genre: "genre-fetish",
		meta: "meta-fetish",
		aliases: [
			"fetish",
			"feet",
			"bondage",
			"bdsm",
			"femdom",
			"toys",
			"vr",
			"virtual reality"
		]
	},
	{
		genre: "genre-group",
		meta: "meta-group",
		aliases: [
			"threesome",
			"group",
			"party",
			"orgy",
			"gangbang",
			"thruple"
		]
	},
	{
		genre: "genre-couples",
		meta: "meta-couples",
		aliases: [
			"couples",
			"verified couples",
			"romantic",
			"cuckold"
		]
	},
	{
		genre: "genre-solo",
		meta: "meta-solo",
		aliases: [
			"solo female",
			"solo male",
			"masturbation",
			"striptease"
		]
	},
	{
		genre: "genre-live",
		meta: "meta-live",
		aliases: [
			"webcam",
			"live",
			"interactive"
		]
	},
	{
		genre: "genre-animation",
		meta: "meta-animation",
		aliases: [
			"hentai",
			"cartoon",
			"manhwa",
			"jav"
		]
	},
	{
		genre: "genre-pov",
		meta: "meta-camera-style",
		aliases: [
			"pov",
			"compilation",
			"behind the scenes"
		]
	},
	{
		genre: "genre-vintage",
		meta: "meta-era",
		aliases: [
			"vintage",
			"classic",
			"retro"
		]
	},
	{
		genre: "genre-regional",
		meta: "meta-region",
		aliases: [
			"latina",
			"asian",
			"ebony",
			"arab",
			"brazilian",
			"euro",
			"japanese",
			"korean",
			"indian",
			"czech",
			"russian"
		]
	}
];
function clean(value) {
	return value.trim().toLowerCase().replace(/^fetish-/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ");
}
var taxonomyCache = /* @__PURE__ */ new Map();
function adultTaxonomyTags(value) {
	const cached = taxonomyCache.get(value);
	if (cached) return cached;
	const key = clean(value);
	if (!key || /https?|\bwww\b|redgifs|eporner|redtube/.test(key)) return [];
	const result = [...new Set(RULES.filter((rule) => rule.aliases.some((alias) => key === alias || key.includes(alias))).flatMap((rule) => [rule.genre, rule.meta]))];
	if (taxonomyCache.size >= 8192) taxonomyCache.delete(taxonomyCache.keys().next().value);
	taxonomyCache.set(value, result);
	return result;
}
function isAdultGenreTag(tag) {
	return tag.startsWith("genre-");
}
function isAdultMetaTaxonomyTag(tag) {
	return tag.startsWith("meta-");
}
function adultTaxonomyLabel(tag) {
	return tag.replace(/^(?:genre|meta)-/, "").replace(/-/g, " ");
}
var expandedTagCache = /* @__PURE__ */ new WeakMap();
function expandedAdultTags(tags) {
	const cached = expandedTagCache.get(tags);
	if (cached) return cached;
	const expanded = new Set(tags);
	for (const tag of tags) for (const derived of adultTaxonomyTags(tag)) expanded.add(derived);
	expandedTagCache.set(tags, expanded);
	return expanded;
}
/** Curated 18+ Reddit subs for Adult Atom RSS pulls.
* Merged from: reddit-nsfw-top300.txt, reddit-extra-from-porndude.txt,
* Postpone list page scrape, and prior fetish catalog.
* ListOfSubreddits ultimate thread unavailable unauthenticated (login/429).
* Rotated in batches — do not fetch all at once.
*/
/** High-signal media-heavy communities sampled first in curated rotation. */
var ADULT_REDDIT_PRIORITY_SUBS = [
	"rule34",
	"nsfw",
	"realgirls",
	"gonewild",
	"nsfw_gif",
	"porninfifteenseconds",
	"asiansgonewild",
	"amateur",
	"cumsluts",
	"collegesluts",
	"breddit",
	"anal",
	"boobs",
	"ass",
	"milf",
	"petitegonewild",
	"godasshole",
	"pawg",
	"latinas",
	"indiansgonewild"
];
var ADULT_REDDIT_SUBS = [
	"18_22",
	"2busty2hide",
	"40plusgonewild",
	"60fpsporn",
	"abelladanger",
	"actuallesbians",
	"adorablenudes",
	"adorableporn",
	"adrianachechik",
	"ahegaogirls",
	"altgonewild",
	"amateur",
	"amateur_milfs",
	"amateurcumsluts",
	"amateurporn",
	"amihot",
	"anal",
	"analgonewild",
	"analgw",
	"angelawhite",
	"anriokita",
	"asiancumsluts",
	"asiancuties",
	"asianfetish",
	"asiangirlswhitecocks",
	"asianhotties",
	"asiannsfw",
	"asianpornx",
	"asiansgonewild",
	"ass",
	"asshole",
	"assholebehindthong",
	"assholegonewild",
	"assmasterpiece",
	"asstastic",
	"athleticbabes",
	"backview",
	"baddragon",
	"bbcparadise",
	"bbw",
	"bdsm",
	"bdsmgw",
	"bigareolas",
	"bigass",
	"bigassaltgirls",
	"bigasses",
	"bigboobsgw",
	"bigbootygothiccgf",
	"bigbootyporn",
	"bigdickgirl",
	"biggerthanherhead",
	"biggerthanyouthought",
	"bigtiddygothgf",
	"bigtitsinbikinis",
	"bimbofetish",
	"blackchickswhitedicks",
	"blackgirlsgw",
	"blowjob",
	"blowjobgirls",
	"blowjobs",
	"blowjobsandwich",
	"bodyperfection",
	"boltedontits",
	"bondage",
	"boobbounce",
	"boobies",
	"boobs",
	"booty",
	"booty_queens",
	"bootypetite",
	"borntobefucked",
	"braless",
	"breedingmaterial",
	"breedmedaddy",
	"brownhotties",
	"brunette",
	"bubblebutts",
	"burstout",
	"bustyasians",
	"bustynaturals",
	"bustypetite",
	"buttplug",
	"buttsandbarefeet",
	"buttsharpies",
	"camgirls",
	"cartoonporn",
	"casualjiggles",
	"celebnsfw",
	"celebritybutts",
	"celebs",
	"centaurgirls",
	"cfnm",
	"cheatingpov",
	"cheatingwives",
	"chickflixxx",
	"chubby",
	"classysexy",
	"cleavage",
	"clothedtitfuck",
	"collegeamateurs",
	"collegesluts",
	"cosplaybabes",
	"cosplaygirls",
	"cosplaypornvideos",
	"cougarsforcubs",
	"countrygirls",
	"couplesgonewild",
	"couplesporn",
	"creampies",
	"crossdressing",
	"cuckold",
	"cuckoldcaptions",
	"cuckquean",
	"cumdumpsters",
	"cumfetish",
	"cumhaters",
	"cumhentai",
	"cuminsideme",
	"cumonclothes",
	"cumshots",
	"cumsluts",
	"cunnilingus",
	"curvy",
	"cutelittlebutts",
	"cutemodeslutmode",
	"dadwouldbeproud",
	"damngoodinterracial",
	"darkangels",
	"datgap",
	"daughtertraining",
	"deathbysnusnu",
	"deepthroat",
	"degradingholes",
	"description",
	"dirtyr4r",
	"dirtysmall",
	"distension",
	"doggystyle_nsfw",
	"downblouse",
	"draculabiscuits",
	"dykesgonewild",
	"ebony",
	"ebonyhomemade",
	"ebonythroatqueens",
	"ecchi",
	"ediblebuttholes",
	"egirls",
	"elsajean",
	"emogirls",
	"emogirlsfuck",
	"engorgedveinybreasts",
	"erasernipples",
	"erinashford",
	"exhibitionistfun",
	"exposedinpublic",
	"extramile",
	"extrasmal",
	"facedownassup",
	"facefuck",
	"facials",
	"fantasticbreasts",
	"fantasygirls",
	"fatpussyinpanties",
	"fatpussylovers",
	"feet",
	"feet_nsfw",
	"femaleorgasmdenial",
	"femboys",
	"femdom",
	"femyiff",
	"fingering",
	"fitgirls",
	"fitnakedgirls",
	"flashingandflaunting",
	"flashinggirls",
	"forcedcreampie",
	"freeuse",
	"fuckdoll",
	"fuckinglikecrazy",
	"funsized",
	"funwithfriends",
	"futanari",
	"gabbiecarter",
	"gangbang",
	"gaybrosgonewild",
	"gentlefemdom",
	"gettingherselfoff",
	"ghostnipples",
	"gifsgonewild",
	"girlsfinishingthejob",
	"girlsinyogapants",
	"girlskissing",
	"girlsmasturbating",
	"girlsshowering",
	"girlswhoride",
	"girlswithglasses",
	"girlswithneonhair",
	"godasshole",
	"goddesses",
	"godpussy",
	"goneerotic",
	"gonewild",
	"gonewild30plus",
	"gonewildaudio",
	"gonewildcd",
	"gonewildplus",
	"gonewildstories",
	"gooned",
	"gothgirlsgonewild",
	"gothsluts",
	"grool",
	"gwcouples",
	"gwpublic",
	"gymgirlsnsfw",
	"hairypussy",
	"happyembarrassedgirls",
	"hardcorensfw",
	"hentai",
	"hentai_gif",
	"hentai_irl",
	"hentaimemes",
	"highresnsfw",
	"holdthemoan",
	"holewreckers",
	"home",
	"homegrowntits",
	"homemadensfw",
	"homemadexxx",
	"hornyamateurgirls",
	"hotchickswithtattoos",
	"hotmoms",
	"hotwife",
	"hugeboobs",
	"hungrybutts",
	"iama",
	"id6741810251",
	"indiansgonewild",
	"influencernsfw_global",
	"innie",
	"innocentlynaughty",
	"iwanttobeher",
	"iwanttosuckcock",
	"japaneseporn2",
	"jav",
	"jizzedtothis",
	"joi",
	"juicyasians",
	"just18",
	"justfriendshavingfun",
	"justhotwomen",
	"keywords",
	"kpopfap",
	"labiagw",
	"lactation",
	"lanarhoades",
	"largemilkers",
	"latinas",
	"latinascuties",
	"lesbian_gifs",
	"lesbians",
	"lightskinbeauties",
	"lingeriegw",
	"lipsthatgrip",
	"long_porn",
	"massivecock",
	"massivetitsnass",
	"masturbationgonewild",
	"maturemilf",
	"mexicana",
	"miakhalifa",
	"milf",
	"milfie",
	"militarygonewild",
	"models",
	"mombod",
	"monsterdicks",
	"nakedadventures",
	"natalee",
	"naturaltitties",
	"naughtychicks",
	"naughtywives",
	"needysluts",
	"nintendowaifus",
	"nipples",
	"normalnudes",
	"notsafefornature",
	"nsfw",
	"nsfw2",
	"nsfw_gif",
	"nsfw_gifs",
	"nsfw_html5",
	"nsfw_japan",
	"nsfw_plowcam",
	"nsfw_social",
	"nsfw_videos",
	"nsfwcosplay",
	"nsfwcostumes",
	"nsfwfashion",
	"nsfwhardcore",
	"nsfwverifiedamateurs",
	"ntrhentaigonewildcd",
	"nude_selfie",
	"nudecelebsonly",
	"nudenonnude",
	"nudes",
	"obsf",
	"oilporn",
	"onepiecevixens",
	"onlyfans101",
	"onlyfansasstastic",
	"onlyfansbrunette",
	"onlyfanspetite",
	"onlyifshespackin",
	"onoff",
	"orgasms",
	"outdoorrecreation",
	"overwatch_porn",
	"paag",
	"page3glamour",
	"palegirls",
	"pantypeel",
	"passionx",
	"pawg",
	"pawglove",
	"pegging",
	"perfectbody",
	"perfecttits",
	"petite",
	"petitegonewild",
	"phatasswhitegirls",
	"phgonewild",
	"piercednipples",
	"plastt",
	"playboy",
	"pokeporn",
	"porn",
	"porn_gifs",
	"pornhub",
	"porninfifteenseconds",
	"pornism",
	"pornstarhq",
	"preggoporn",
	"premiumcheeks",
	"prettyaltgirls",
	"prettylittlecumsluts",
	"pronebone",
	"public",
	"publicflashing",
	"publicnudity",
	"publicsex",
	"publicsexporn",
	"punkgirls",
	"pussy",
	"pussy_perfection",
	"quiver",
	"ratemyboobs",
	"ratemypussy",
	"ratemyrack",
	"realahegao",
	"realgirls",
	"realhomeporn",
	"realmoms",
	"realmomsgonewild",
	"realpublicnudity",
	"realsexyselfies",
	"rearpussy",
	"redheads",
	"ridingxxx",
	"rileyreid",
	"riskyporn",
	"robots",
	"roughporn",
	"rule34",
	"sabrinanichole",
	"sashagrey",
	"schoolgirlsxxx",
	"scissoring",
	"scrubsgonewild",
	"sexcomics",
	"sextrophies",
	"sexyfrex",
	"sexygirls",
	"shavedpussies",
	"shefuckshim",
	"shelikesitrough",
	"shemales",
	"short_porn",
	"shorthairchicks",
	"sissies",
	"sissyhypno",
	"slimthick",
	"slut",
	"sluts",
	"slutsofsnapchat",
	"sluttyconfessions",
	"slutwife",
	"smallboobs",
	"smallcutie",
	"smalldickgirls",
	"smoltiddygothgf",
	"snowwhites",
	"solomasturbation",
	"spreadeagle",
	"spreadem",
	"spreading",
	"squirting",
	"stacked",
	"starwarsnsfw",
	"step_fantasy_gifs",
	"stockings",
	"stories",
	"straightgirlsplaying",
	"straighttosissy",
	"stripgirls",
	"styles",
	"suctiondildos",
	"swingers",
	"swingersgw",
	"taboo",
	"tadami",
	"tbulges",
	"tentai",
	"tgifs",
	"themilfnextdoor",
	"theunderbun",
	"thick",
	"thickloads",
	"thickthighs",
	"thickwhitegirls",
	"thighdeology",
	"thighhighs",
	"thong",
	"threesome",
	"tightdresses",
	"tightsqueeze",
	"tiktoknsfw",
	"tiktokporn",
	"tiktokthots",
	"tinytits",
	"tits",
	"titsonastick",
	"titstouchingtits",
	"titties",
	"tittydrop",
	"toocuteforporn",
	"totalbabes",
	"transgoddesses",
	"transporn",
	"traphentai",
	"traps",
	"twerking",
	"twingirls",
	"uncommonposes",
	"underweargw",
	"upherbutt",
	"upskirt",
	"vagina",
	"viewport",
	"voyeurflash",
	"watchitfortheplot",
	"wetpussys",
	"wife_wants_to_be_seen",
	"wifesharing",
	"womenbendingover",
	"womenofcolor",
	"workgonewild",
	"wouldyoufuckmywife",
	"wtss",
	"xsmallgirls",
	"yiff",
	"yogapants",
	"yuri"
];
/** Outbound adult destinations. Non-embeddable sites belong in milestones. */
/**
* Primary adult category / directory hub. Open ThePornDude for browsing categories,
* then return here for in-app Eporner / RedTube pulls.
*/
var ADULT_CATEGORY_HUB = {
	name: "ThePornDude",
	href: "https://theporndude.com/",
	copy: "Main adult category directory — browse tubes, cams, anime, games, and niche lists on ThePornDude.",
	group: "hub",
	sourceId: "theporndude"
};
/**
* Sites with no official unauthenticated discovery/embed path used by Realhub.
* Shown in the Adult milestones section (link-out only). Source ids still appear
* as labeled source-tag chips so users can jump out by site.
*/
var ADULT_MILESTONE_LINKS = [
	ADULT_CATEGORY_HUB,
	{
		name: "Pornhub Shorties",
		href: "https://www.pornhub.com/shorties/68f193dfebe67",
		copy: "Pornhub short-form shelf — open externally.",
		group: "short",
		sourceId: "pornhub-shorties"
	},
	{
		name: "Tik.Porn",
		href: "https://tik.porn/",
		copy: "Short-form adult feed — open externally.",
		group: "short",
		sourceId: "tikporn"
	},
	{
		name: "FikFap",
		href: "https://fikfap.com/",
		copy: "Short-form adult clips — open externally.",
		group: "short",
		sourceId: "fikfap"
	},
	{
		name: "FYPTT",
		href: "https://fyptt.to/",
		copy: "Short-form adult destination — open externally.",
		group: "short",
		sourceId: "fyptt"
	},
	{
		name: "Kwiky",
		href: "https://kwiky.com/",
		copy: "Short-form adult destination — open externally.",
		group: "short",
		sourceId: "kwiky"
	},
	{
		name: "Pornhub",
		href: "https://www.pornhub.com/",
		copy: "Major tube site — no stable public search API; open externally.",
		group: "tube",
		sourceId: "pornhub"
	},
	{
		name: "XVideos",
		href: "https://www.xvideos.com/",
		copy: "Large tube catalog — link-out (no official public search API used).",
		group: "tube",
		sourceId: "xvideos"
	},
	{
		name: "xHamster",
		href: "https://xhamster.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "xhamster"
	},
	{
		name: "XNXX",
		href: "https://www.xnxx.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "xnxx"
	},
	{
		name: "HQporner",
		href: "https://hqporner.com/",
		copy: "HD tube destination — open externally (no public API).",
		group: "tube",
		sourceId: "hqporner"
	},
	{
		name: "Beeg",
		href: "https://beeg.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "beeg"
	},
	{
		name: "YourPorn",
		href: "https://sxyprn.com/",
		copy: "YourPorn / sxyprn destination — open externally.",
		group: "tube",
		sourceId: "yourporn"
	},
	{
		name: "SpankBang",
		href: "https://spankbang.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "spankbang"
	},
	{
		name: "XMoviesForYou",
		href: "https://xmoviesforyou.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "xmoviesforyou"
	},
	{
		name: "PornTrex",
		href: "https://www.porntrex.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "porntrex"
	},
	{
		name: "YouJizz",
		href: "https://www.youjizz.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "youjizz"
	},
	{
		name: "YouPorn",
		href: "https://www.youporn.com/",
		copy: "Tube destination — former HubTraffic API retired; open externally.",
		group: "tube",
		sourceId: "youporn"
	},
	{
		name: "PornOne",
		href: "https://pornone.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "pornone"
	},
	{
		name: "3Movs",
		href: "https://www.3movs.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "3movs"
	},
	{
		name: "Tube8",
		href: "https://www.tube8.com/",
		copy: "Tube destination — former HubTraffic API retired; open externally.",
		group: "tube",
		sourceId: "tube8"
	},
	{
		name: "PornDig",
		href: "https://www.porndig.com/",
		copy: "Tube / index destination — open externally.",
		group: "tube",
		sourceId: "porndig"
	},
	{
		name: "CumLouder",
		href: "https://www.cumlouder.com/",
		copy: "Studio / tube destination — open externally.",
		group: "tube",
		sourceId: "cumlouder"
	},
	{
		name: "TXXX",
		href: "https://txxx.com/",
		copy: "Tube destination — undocumented JSON only; no safe public embed path. Open externally.",
		group: "tube",
		sourceId: "txxx"
	},
	{
		name: "PornDoe",
		href: "https://porndoe.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "porndoe"
	},
	{
		name: "PornHat",
		href: "https://www.pornhat.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "pornhat"
	},
	{
		name: "OK.xxx",
		href: "https://ok.xxx/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "okxxx"
	},
	{
		name: "Porn00",
		href: "https://www.porn00.org/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "porn00"
	},
	{
		name: "PornHoarder",
		href: "https://pornhoarder.tv/",
		copy: "Index destination — open externally.",
		group: "tube",
		sourceId: "pornhoarder"
	},
	{
		name: "YesPornVip",
		href: "https://www.yesporn.vip/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "yespornvip"
	},
	{
		name: "JustPorn",
		href: "https://justporn.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "justporn"
	},
	{
		name: "PornGo",
		href: "https://www.porngo.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "porngo"
	},
	{
		name: "WhoresHub",
		href: "https://www.whoreshub.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "whoreshub"
	},
	{
		name: "PornHD3x",
		href: "https://www.pornhd3x.tv/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "pornhd3x"
	},
	{
		name: "XXXFiles",
		href: "https://www.xxxfiles.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "xxxfiles"
	},
	{
		name: "TNAflix",
		href: "https://www.tnaflix.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "tnaflix"
	},
	{
		name: "PussySpace",
		href: "https://www.pussyspace.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "pussyspace"
	},
	{
		name: "PornDish",
		href: "https://www.porndish.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "porndish"
	},
	{
		name: "FullPorner",
		href: "https://fullporner.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "fullporner"
	},
	{
		name: "Porn4Days",
		href: "https://porn4days.biz/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "porn4days"
	},
	{
		name: "KRX18",
		href: "https://krx18.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "krx18"
	},
	{
		name: "ParadiseHill",
		href: "https://en.paradisehill.cc/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "paradisehill"
	},
	{
		name: "TrendyPorn",
		href: "https://www.trendyporn.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "trendyporn"
	},
	{
		name: "PornHD8k",
		href: "https://www.pornhd8k.net/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "pornhd8k"
	},
	{
		name: "MilfNut",
		href: "https://milfnut.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "milfnut"
	},
	{
		name: "TabooTube",
		href: "https://www.tabootube.xxx/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "tabootube"
	},
	{
		name: "FamilyPornHD",
		href: "https://familypornhd.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "familypornhd"
	},
	{
		name: "FamilyPorner",
		href: "https://familyporner.com/",
		copy: "Tube destination — open externally.",
		group: "tube",
		sourceId: "familyporner"
	},
	{
		name: "Banned Sex Tapes",
		href: "https://www.bannedsextapes.com/tube_tour2/index.html?nats=NzAuNC4zLjguMC4wLjAuMC4w",
		copy: "Tube / tour destination — open externally.",
		group: "tube",
		sourceId: "bannedsextapes"
	},
	{
		name: "MissAV",
		href: "https://missav.ws/dm265/en",
		copy: "JAV index — open externally.",
		group: "tube",
		sourceId: "missav"
	},
	{
		name: "SupJAV",
		href: "https://supjav.com/",
		copy: "JAV destination — open externally.",
		group: "tube",
		sourceId: "supjav"
	},
	{
		name: "VJAV",
		href: "https://vjav.com/?promo=10718",
		copy: "JAV destination — open externally.",
		group: "tube",
		sourceId: "vjav"
	},
	{
		name: "Zenra",
		href: "https://www.zenra.net/",
		copy: "Japanese adult video index — open externally.",
		group: "anime",
		sourceId: "zenra"
	},
	{
		name: "Rule34.xxx",
		href: "https://rule34.xxx/",
		copy: "Imageboard — open externally.",
		group: "comic",
		sourceId: "rule34"
	},
	{
		name: "Rule34Video (via ThePornDude)",
		href: "https://theporndude.com/5289/rule34video",
		copy: "ThePornDude directory entry for Rule34Video.",
		group: "directory",
		sourceId: "rule34video"
	},
	{
		name: "Pawchive",
		href: "https://pawchive.pw/",
		copy: "Archive destination — open externally.",
		group: "comic",
		sourceId: "pawchive"
	},
	{
		name: "Kemono",
		href: "https://kemono.cr/",
		copy: "Creator archive — open externally.",
		group: "comic",
		sourceId: "kemono"
	},
	{
		name: "E-Hentai",
		href: "https://e-hentai.org/",
		copy: "Doujin / gallery index — open externally.",
		group: "comic",
		sourceId: "ehentai"
	},
	{
		name: "MultPorn",
		href: "https://multporn.net/",
		copy: "Comics / animation index — open externally.",
		group: "comic",
		sourceId: "multporn"
	},
	{
		name: "AllPornComic",
		href: "https://allporncomic.com/",
		copy: "Adult comics — open externally.",
		group: "comic",
		sourceId: "allporncomic"
	},
	{
		name: "8muses",
		href: "https://8muses.io/",
		copy: "Adult comics — open externally.",
		group: "comic",
		sourceId: "8muses"
	},
	{
		name: "Hanime",
		href: "https://hanime.tv/",
		copy: "Hentai streaming destination — open externally.",
		group: "anime",
		sourceId: "hanime"
	},
	{
		name: "HentaiHaven",
		href: "https://hentaihaven.xxx/",
		copy: "Anime / hentai destination — open on their site.",
		group: "anime",
		sourceId: "hentaihaven"
	},
	{
		name: "Xanimu",
		href: "https://xanimu.com/",
		copy: "Anime adult destination — open externally.",
		group: "anime",
		sourceId: "xanimu"
	},
	{
		name: "Fakku",
		href: "https://www.fakku.net/",
		copy: "Hentai / doujin storefront — accounts and paywalls stay on Fakku.",
		group: "anime",
		sourceId: "fakku"
	},
	{
		name: "Nutaku",
		href: "https://www.nutaku.net/home/",
		copy: "Adult games platform — open externally.",
		group: "games",
		sourceId: "nutaku"
	},
	{
		name: "F95zone",
		href: "https://f95zone.to/",
		copy: "Adult games forum / index — open externally.",
		group: "games",
		sourceId: "f95zone"
	},
	{
		name: "PornGamesHub",
		href: "https://porngameshub.com/",
		copy: "Adult games hub — open externally.",
		group: "games",
		sourceId: "porngameshub"
	},
	{
		name: "GamCore",
		href: "https://gamcore.com/",
		copy: "Adult games — open externally.",
		group: "games",
		sourceId: "gamcore"
	},
	{
		name: "Fap-Nation",
		href: "https://fap-nation.com/",
		copy: "Adult games index — open externally.",
		group: "games",
		sourceId: "fapnation"
	},
	{
		name: "LewdZone",
		href: "https://lewdzone.com/",
		copy: "Adult games index — open externally.",
		group: "games",
		sourceId: "lewdzone"
	},
	{
		name: "itch.io NSFW free",
		href: "https://itch.io/games/free/nsfw",
		copy: "Free NSFW games on itch.io — open externally.",
		group: "games",
		sourceId: "itch-nsfw"
	},
	{
		name: "VRPorn",
		href: "https://vrporn.com/",
		copy: "VR adult catalog — open externally.",
		group: "vr",
		sourceId: "vrporn"
	},
	{
		name: "VRBangers",
		href: "https://vrbangers.com/",
		copy: "VR studio site — open externally.",
		group: "vr",
		sourceId: "vrbangers"
	},
	{
		name: "Emerald Chat",
		href: "https://emeraldchat.com/",
		copy: "Cam / chat — open Emerald Chat.",
		group: "cam",
		sourceId: "emeraldchat"
	},
	{
		name: "Stripchat",
		href: "https://stripchat.com/",
		copy: "Live rooms — official embed path is not playable in-app, so this stays a live deep-link.",
		group: "cam",
		sourceId: "stripchat"
	},
	{
		name: "BongaCams",
		href: "https://bongacams.com/",
		copy: "Live cam directory — no public room-list API we can play, open the live grid.",
		group: "cam",
		sourceId: "bongacams"
	},
	{
		name: "Cam4",
		href: "https://www.cam4.com/",
		copy: "Live cam directory — public HTML listing only, open the live grid.",
		group: "cam",
		sourceId: "cam4"
	},
	{
		name: "Flirt4Free",
		href: "https://www.flirt4free.com/",
		copy: "Live cam destination — no stable public JSON, open the live grid.",
		group: "cam",
		sourceId: "flirt4free"
	},
	{
		name: "Streamate",
		href: "https://www.streamate.com/",
		copy: "Live cam destination — no unauthenticated room API, open the live grid.",
		group: "cam",
		sourceId: "streamate"
	},
	{
		name: "LiveJasmin",
		href: "https://www.livejasmin.com/",
		copy: "Live cam destination — no public model list, open the live grid.",
		group: "cam",
		sourceId: "livejasmin"
	},
	{
		name: "Adult DVD Talk",
		href: "https://forum.adultdvdtalk.com/",
		copy: "Community forum — open externally.",
		group: "community",
		sourceId: "adultdvdtalk"
	},
	{
		name: "WikiFeet (via ThePornDude)",
		href: "https://theporndude.com/4397/wikifeet",
		copy: "ThePornDude directory entry for WikiFeet.",
		group: "directory",
		sourceId: "wikifeet"
	},
	{
		name: "MrSkin (via ThePornDude)",
		href: "https://theporndude.com/578/mrskin",
		copy: "ThePornDude directory entry for MrSkin.",
		group: "directory",
		sourceId: "mrskin"
	},
	...ADULT_EXTRA_MILESTONES,
	...ADULT_NICHE_MILESTONES
];
/**
* Destinations with an official public embed/API path Realhub actually uses.
* - Eporner API v2 + iframe embeds: https://www.eporner.com/api/v2/
* - RedTube webmaster API + embed.redtube.com: https://api.redtube.com/
* - Chaturbate public affiliate rooms JSON + /embed/{user}/
* - MyFreeCams public php/online_models.php + #username room deep-links
* - Reddit public Atom RSS (.json is 403 unauthenticated) for curated 18+ subs
*/
var ADULT_EMBED_LINKS = [
	{
		name: "Eporner",
		href: "https://www.eporner.com/",
		copy: "Official public API + iframe embeds power in-app adult discovery at YouTube/Twitch scale.",
		embeds: true,
		group: "tube",
		sourceId: "eporner"
	},
	{
		name: "RedTube",
		href: "https://www.redtube.com/",
		copy: "Official webmaster API (search, tags, categories) + public embeds for in-app playback.",
		embeds: true,
		group: "tube",
		sourceId: "redtube"
	},
	{
		name: "Chaturbate",
		href: "https://chaturbate.com/",
		copy: "Public affiliate rooms API + official embed path — live backup when tube APIs fail.",
		embeds: true,
		group: "cam",
		sourceId: "chaturbate"
	},
	{
		name: "MyFreeCams",
		href: "https://www.myfreecams.com/#Homepage",
		copy: "Public online-model list + #username room links. No official iframe player, so cards open MFC live.",
		embeds: true,
		group: "cam",
		sourceId: "myfreecams"
	},
	{
		name: "Reddit (18+)",
		href: "https://www.reddit.com/r/nsfw/",
		copy: "Public Atom RSS previews from curated 18+ subs. Unauthenticated .json is blocked; posts open on Reddit.",
		embeds: true,
		group: "community",
		sourceId: "reddit"
	},
	{
		name: "Rule34 / Booru image pulls",
		href: "https://rule34.xxx/index.php?page=post&s=list&tags=all",
		copy: "Public 18+ image APIs. Rule34 (JSON primary + HTML backup), Gelbooru, Realbooru, XBooru, TBIB, Hypnohub, and e621 each receive a share of a pull; cards retain sample thumbnails and download the original image on demand.",
		embeds: true,
		group: "comic",
		sourceId: "booru"
	},
	{
		name: "Redgifs",
		href: "https://www.redgifs.com/",
		copy: "Official Redgifs temporary-token search API (posters + HD/SD files) as primary. AdultDataLink remains an optional secondary when ADULTDATALINK_API_KEY / ADL_API_KEY is set.",
		embeds: true,
		group: "short",
		sourceId: "redgifs"
	}
];
/** Deduplicate by href while preserving first-seen order. */
function dedupeLinks(links) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const link of links) {
		const key = link.href.replace(/\/+$/, "").toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(link);
	}
	return out;
}
dedupeLinks([...ADULT_EMBED_LINKS, ...ADULT_MILESTONE_LINKS]);
/** Source-tag chips for Adult UI (pull sources first, then milestones). */
var ADULT_SOURCE_OPTIONS = dedupeLinks([...ADULT_EMBED_LINKS, ...ADULT_MILESTONE_LINKS]).filter((link) => Boolean(link.sourceId)).map((link) => ({
	id: link.sourceId,
	label: link.name,
	href: link.href,
	pull: Boolean(link.embeds)
}));
/** Retired sources are excluded from all restored catalog views and never fetched. */
var RETIRED_ADULT_SOURCE_IDS = ["camsoda"];
var EPORNER_FOLDER_ID = "eporner:discover";
var REDTUBE_FOLDER_ID = "redtube:discover";
var CHATURBATE_FOLDER_ID = "chaturbate:discover";
var MYFREECAMS_FOLDER_ID = "myfreecams:discover";
var REDDIT_FOLDER_ID = "reddit:discover";
var BOORU_FOLDER_ID = "booru:discover";
var REDGIFS_FOLDER_ID = "redgifs:discover";
var ADULT_FOLDER_BY_PROVIDER = {
	eporner: {
		id: EPORNER_FOLDER_ID,
		name: "Eporner",
		kind: "eporner",
		videoCount: 0,
		adult: true
	},
	redtube: {
		id: REDTUBE_FOLDER_ID,
		name: "RedTube",
		kind: "redtube",
		videoCount: 0,
		adult: true
	},
	chaturbate: {
		id: CHATURBATE_FOLDER_ID,
		name: "Chaturbate",
		kind: "chaturbate",
		videoCount: 0,
		adult: true
	},
	myfreecams: {
		id: MYFREECAMS_FOLDER_ID,
		name: "MyFreeCams",
		kind: "myfreecams",
		videoCount: 0,
		adult: true
	},
	reddit: {
		id: REDDIT_FOLDER_ID,
		name: "Reddit (18+)",
		kind: "reddit",
		videoCount: 0,
		adult: true
	},
	booru: {
		id: BOORU_FOLDER_ID,
		name: "Booru (18+)",
		kind: "booru",
		videoCount: 0,
		adult: true
	},
	redgifs: {
		id: REDGIFS_FOLDER_ID,
		name: "Redgifs",
		kind: "redgifs",
		videoCount: 0,
		adult: true
	}
};
var ADULT_FOLDER_IDS = [
	EPORNER_FOLDER_ID,
	REDTUBE_FOLDER_ID,
	CHATURBATE_FOLDER_ID,
	MYFREECAMS_FOLDER_ID,
	REDDIT_FOLDER_ID,
	BOORU_FOLDER_ID,
	REDGIFS_FOLDER_ID
];
function adultRemoteLabel(kind) {
	switch (kind) {
		case "eporner": return "Eporner";
		case "redtube": return "RedTube";
		case "chaturbate": return "Chaturbate";
		case "myfreecams": return "MyFreeCams";
		case "reddit": return "Reddit";
		case "booru": return "Booru";
		case "redgifs": return "Redgifs";
		case "youtube": return "YouTube";
		case "twitch": return "Twitch";
		default: return "Adult";
	}
}
function isAdultPullKind(kind) {
	return kind === "eporner" || kind === "redtube" || kind === "chaturbate" || kind === "myfreecams" || kind === "reddit" || kind === "booru" || kind === "redgifs";
}
function adultSourceTag(provider) {
	const slug = provider.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
	return slug ? `source-${slug}` : "source-adult";
}
/** Provider brand labels that should not become creator-* tags. */
var ADULT_PROVIDER_BRANDS = /* @__PURE__ */ new Set([
	"eporner",
	"redtube",
	"chaturbate",
	"myfreecams",
	"reddit",
	"booru",
	"rule34",
	"gelbooru",
	"realbooru",
	"e621",
	"xbooru",
	"tbib",
	"hypnohub",
	"redgifs",
	"adultdatalink",
	"pornhub",
	"faphouse"
]);
/** Stable creator / pornstar / username / channel tag. Returns null for brands or junk. */
function adultCreatorTag(name) {
	if (!name) return null;
	const slug = name.trim().replace(/^\/?(?:u|user|r)\//i, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
	if (!slug || slug.length < 2 || slug.length > 48) return null;
	if (ADULT_PROVIDER_BRANDS.has(slug)) return null;
	if (/^(https?|www|null|undefined|unknown|anonymous|guest)$/i.test(slug)) return null;
	return `creator-${slug}`;
}
/** Split provider keyword / fetish strings into stable local tags for browse/filter. */
function adultKeywordTags(keywords, limit = 24) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const part of keywords.split(/[,|;/]+/)) {
		const tag = part.trim().toLowerCase().replace(/\s+/g, " ");
		if (tag.length < 2 || tag.length > 48) continue;
		if (/https?|\bwww\b|\.com\b|\/(?:watch|videos?)\b/.test(tag)) continue;
		if (seen.has(tag)) continue;
		seen.add(tag);
		out.push(tag);
		if (out.length >= limit) break;
	}
	return out;
}
/** Normalize RedTube / Eporner fetish labels into fetish-* tags plus raw keywords. */
function adultFetishTags(labels, limit = 36) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const raw of labels) {
		const base = raw.trim().toLowerCase().replace(/\s+/g, " ");
		if (base.length < 2 || base.length > 48) continue;
		const slug = base.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
		if (!slug || seen.has(slug)) continue;
		seen.add(slug);
		out.push(base);
		out.push(`fetish-${slug}`);
		for (const taxonomy of adultTaxonomyTags(base)) out.push(taxonomy);
		if (out.length >= limit) break;
	}
	return out;
}
/** Match curated fetish/category tokens inside title + description (no junk spam). */
function adultTextFetishTags(text, limit = 24) {
	const hay = text.toLowerCase();
	if (!hay.trim()) return [];
	const tokens = [...ADULT_CURATED_FETISH_TAGS].sort((a, b) => b.length - a.length);
	const hits = [];
	const seen = /* @__PURE__ */ new Set();
	for (const token of tokens) {
		const needle = token.toLowerCase();
		if (needle.length < 2) continue;
		const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		if (!(needle.length <= 3 ? new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`) : new RegExp(escaped)).test(hay)) continue;
		if (seen.has(needle)) continue;
		seen.add(needle);
		hits.push(token);
		if (hits.length >= limit) break;
	}
	return adultFetishTags(hits, limit * 2).slice(0, limit);
}
/** Build the full adult ingest tag set for one pulled title. Always includes source-*. */
function adultIngestTags(input) {
	const limit = input.limit ?? 64;
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	const push = (tag) => {
		if (!tag) return;
		const clean = tag.trim().toLowerCase();
		if (!clean || seen.has(clean)) return;
		seen.add(clean);
		out.push(clean);
	};
	push(adultSourceTag(input.source));
	for (const extra of input.extraSources ?? []) push(adultSourceTag(extra));
	for (const name of input.creatorNames ?? []) push(adultCreatorTag(name));
	const evidence = `${input.title ?? ""} ${input.description ?? ""} ${input.extraText ?? ""}`.toLowerCase();
	const api = adultKeywordTags(input.apiKeywords ?? "", 32).filter((tag) => tag.length <= 4 || evidence.includes(tag.toLowerCase()));
	for (const tag of api) push(tag);
	for (const tag of adultFetishTags(api, 36)) push(tag);
	if (input.flair) {
		push(input.flair);
		for (const tag of adultFetishTags([input.flair], 6)) push(tag);
	}
	for (const tag of input.extraTags ?? []) push(tag);
	const textTags = adultTextFetishTags(`${input.title ?? ""} ${input.description ?? ""} ${input.apiKeywords ?? ""} ${input.extraText ?? ""} ${input.flair ?? ""}`, 24);
	for (const tag of textTags) push(tag);
	return out.slice(0, limit);
}
function isAdultImageKind(kind, mime, extension) {
	if (kind === "booru") return true;
	if (mime?.startsWith("image/")) return true;
	if (extension === "image") return true;
	return false;
}
/** Exact removal notices, rather than ordinary titles discussing moderation. */
function isRedditRemovalText(value) {
	const text = value.replace(/&(?:lt|gt);/g, " ").replace(/<[^>]*>/g, " ").replace(/&#(?:32|160);|&nbsp;/g, " ").trim();
	return /^\[(?:removed|deleted)\]$/i.test(text) || /\[\s*removed by reddit\s*\]/i.test(text) || /<svg\b/i.test(value) && /\bremoved by reddit\b/i.test(text) || /^\s*(?:#\s*)?\[?\s*removed by reddit\s*\]?(?:\s|$)/i.test(text) || /this post was removed because it violated\s+(?:reddit\s+)?rule\s*8\b/i.test(text) || /this (?:post|content) (?:has been|was) removed by reddit/i.test(text);
}
function isRedditRemovalUrl(value) {
	if (!value) return false;
	try {
		const url = new URL(value);
		return /^(?:i|preview|external-preview)\.redd\.it$/.test(url.hostname) && /(?:\/(?:removed|deleted|unavailable)(?:[._/-]|$)|\.svg$)/i.test(url.pathname);
	} catch {
		return false;
	}
}
function isRemovedRedditVideo(video) {
	if (video.remote?.kind !== "reddit" && !video.remote?.sourceKinds?.includes("reddit")) return false;
	return isRedditRemovalText(video.name) || isRedditRemovalText(video.description ?? video.tagline ?? "") || [
		video.src,
		video.poster,
		video.remote?.embedUrl,
		video.remote?.previewUrl
	].some(isRedditRemovalUrl);
}
/** Re-evaluated at each network batch, so discovery cannot hold up a creator
* whose next live check became due during a slow response. Reserve discovery
* slots even when live deadlines are overdue. Successful timestamps persist
* the rotation; a turn's attempted set prevents retrying a failed prefix. */
function selectDueLiveRefreshChannels(channels, kind, limit, knownLiveMs, discoveryMs, now = Date.now()) {
	const due = selectLiveRefreshChannels(channels, kind, channels.length, now).filter((channel) => !channel.liveCheckedAt || now - channel.liveCheckedAt >= (channel.live ? knownLiveMs : discoveryMs));
	const live = due.filter((channel) => channel.live), discovery = due.filter((channel) => !channel.live);
	const count = Math.max(0, Math.floor(limit));
	const urgent = live.some((channel) => now - (channel.liveCheckedAt ?? 0) >= knownLiveMs * 1.5);
	const discoveryBacklog = discovery.length >= count * 4;
	const liveSlots = Math.min(live.length, Math.ceil(count * (discoveryBacklog ? .25 : urgent ? .75 : .5)));
	return [
		...live.slice(0, liveSlots),
		...discovery.slice(0, count - liveSlots),
		...live.slice(liveSlots, liveSlots + Math.max(0, count - liveSlots - discovery.length))
	];
}
/** Live checks have their own health and least-recently-checked order. Archive
* failures/cursors must neither starve new broadcasts nor retire known ones. */
function selectLiveRefreshChannels(channels, kind, limit = channels.length, now = Date.now()) {
	const eligible = channels.filter((channel) => (!kind || channel.kind === kind) && (channel.kind === "twitch" ? (channel.twitchLiveRetry?.retryAt ?? 0) <= now : !channel.importNeedsReview && !channel.id.startsWith("ytpl:") && Boolean(channel.channelId || /^yt:UC[\w-]{20,}$/.test(channel.id)) && (channel.lastLiveFailure?.at === void 0 || channel.lastLiveFailure.at >= (channel.liveCheckedAt ?? 0) ? channel.lastLiveFailure?.retryAt ?? 0 : 0) <= now)).sort((a, b) => (a.liveCheckedAt ?? 0) - (b.liveCheckedAt ?? 0) || a.id.localeCompare(b.id));
	const count = Math.max(0, Math.floor(limit)), active = eligible.filter((channel) => channel.live), discovery = eligible.filter((channel) => !channel.live);
	const activeSlots = Math.min(active.length, Math.ceil(count / 2));
	const result = [...active.slice(0, activeSlots), ...discovery.slice(0, count - activeSlots)];
	if (result.length < count) result.push(...active.slice(activeSlots, activeSlots + count - result.length));
	return result;
}
var YOUTUBE_QUICK_LIVE = {
	requestChannels: 24,
	firstRequestChannels: 8,
	scheduledRequestChannels: 24,
	pipelineChannels: 8,
	pipelineRequests: 3,
	activeSweep: 192,
	quietSweep: 24,
	tickMs: 2e3,
	knownLiveMs: 6e4,
	discoveryMs: 3e5
};
/** Known-live deadlines and oldest-first discovery share each batch. */
function selectYoutubeQuickLiveChannels(channels, limit, scheduled = false, now = Date.now()) {
	if (!scheduled) return selectLiveRefreshChannels(channels, "youtube", channels.length, now).slice(0, Math.max(0, limit));
	return selectDueLiveRefreshChannels(channels, "youtube", limit, YOUTUBE_QUICK_LIVE.knownLiveMs, YOUTUBE_QUICK_LIVE.discoveryMs, now);
}
/** Live failures are independent of archive health and successful observations.
* A failing creator backs off durably without consuming each discovery turn. */
function youtubeLiveFailure(previous, failure) {
	const count = previous.lastLiveFailure?.attempts ?? 0;
	const attempts = Math.min(8, (Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0) + 1);
	const base = failure.kind === "unavailable" ? 3e5 : 3e4;
	const retryAt = failure.cooldownScope && failure.retryAt && failure.retryAt > failure.at ? failure.retryAt : Math.max(failure.retryAt ?? 0, failure.at + Math.min(9e5, base * 2 ** (attempts - 1)));
	return {
		...failure,
		attempts,
		retryAt,
		recovery: failure.cooldownScope ? "Live checks wait for the provider cooldown. Your last successful status and the archive are preserved." : `This creator will retry after a short backoff. Other creators keep checking; saved videos and the last successful live status are preserved.`
	};
}
function uniqueYoutubeLiveCreators(channels) {
	const unique = /* @__PURE__ */ new Map();
	for (const channel of channels) {
		if (!verifiedYoutubeSource(channel) || channel.id.startsWith("ytpl:")) continue;
		const key = channel.channelId || channel.id.slice(3), previous = unique.get(key);
		if (!previous) {
			unique.set(key, channel);
			continue;
		}
		const attempt = (c) => Math.max(c.liveCheckedAt ?? 0, c.lastLiveFailure?.at ?? 0, c.youtubeLiveEvidence?.at ?? 0);
		const latest = attempt(channel) > attempt(previous) ? channel : previous;
		const checked = Math.max(previous.liveCheckedAt ?? 0, channel.liveCheckedAt ?? 0) || void 0;
		const failure = (channel.lastLiveFailure?.at ?? 0) > (previous.lastLiveFailure?.at ?? 0) ? channel.lastLiveFailure : previous.lastLiveFailure;
		unique.set(key, {
			...latest,
			id: previous.id,
			liveCheckedAt: checked,
			lastLiveFailure: failure && failure.at >= (checked ?? 0) ? failure : void 0
		});
	}
	return [...unique.values()].map((channel) => channel.lastLiveFailure && channel.lastLiveFailure.at < (channel.liveCheckedAt ?? 0) ? {
		...channel,
		lastLiveFailure: void 0
	} : channel);
}
function youtubeLiveCoverage(channels, now = Date.now()) {
	let total = 0, recent = 0, failed = 0, unchecked = 0, cooling = 0;
	let nextRetryAt;
	const failures = [];
	const creators = uniqueYoutubeLiveCreators(channels), queue = [];
	for (const channel of creators) {
		if (!verifiedYoutubeSource(channel) || channel.id.startsWith("ytpl:")) continue;
		total++;
		const checked = channel.liveCheckedAt ?? 0, failure = channel.lastLiveFailure;
		const hasSuccess = checked > 0 && (!failure || checked !== failure.at);
		if (!hasSuccess) unchecked++;
		const latestFailed = Boolean(failure && (!Number.isFinite(failure.at) || failure.at >= checked));
		if (hasSuccess && !latestFailed && now >= checked && now - checked < 3e5) recent++;
		if (latestFailed) {
			failed++;
			failures.push(channel);
		}
		if (latestFailed && failure?.retryAt && failure.retryAt > now) {
			cooling++;
			nextRetryAt = Math.min(nextRetryAt ?? Infinity, failure.retryAt);
		}
		const nextAt = Math.max(checked > 0 ? checked + (channel.live ? YOUTUBE_QUICK_LIVE.knownLiveMs : YOUTUBE_QUICK_LIVE.discoveryMs) : 0, latestFailed ? failure?.retryAt ?? 0 : 0);
		queue.push({
			channel,
			status: latestFailed && (failure?.retryAt ?? 0) > now ? "waiting" : nextAt <= now ? "due" : "fresh",
			lastSuccessAt: hasSuccess ? checked : void 0,
			lastAttemptAt: Math.max(checked, failure?.at ?? 0, channel.youtubeLiveEvidence?.at ?? 0) || void 0,
			nextAt,
			failed: latestFailed,
			neverChecked: !hasSuccess
		});
	}
	const due = selectYoutubeQuickLiveChannels(creators, creators.length, true, now);
	const dueSet = new Set(due.map((c) => c.id));
	for (const row of queue) if (row.status !== "waiting") row.status = dueSet.has(row.channel.id) ? "due" : "fresh";
	failures.sort((a, b) => (b.lastLiveFailure?.at ?? 0) - (a.lastLiveFailure?.at ?? 0) || a.id.localeCompare(b.id));
	return {
		total,
		recent,
		failed,
		unchecked,
		due: due.length,
		dueIds: due.map((channel) => channel.id),
		cooling,
		nextRetryAt,
		failures: failures.slice(0, 8),
		queue
	};
}
/** Recover the provider live deadline from the existing durable follow ledger,
* without another storage write or trusting archive-only failures. */
function youtubeLiveCooldown(channels, now = Date.now()) {
	let latest;
	for (const channel of channels) {
		const failure = channel.kind === "youtube" ? channel.lastLiveFailure : void 0;
		if (failure && (failure.cooldownScope === "live" || failure.cooldownScope === "all") && (failure.retryAt ?? 0) > Math.max(now, latest?.retryAt ?? 0)) latest = failure;
	}
	return latest;
}
/**
* Session-scoped Adult thumb memory: failed-URL blacklist, known-good URLs,
* and host success scores so rails do not re-hit the same dead CDN path.
*/
var MAX_FAILED = 600;
var MAX_GOOD = 400;
var MAX_BY_VIDEO = 280;
var MAX_HEALTH = 560;
var failedUrls = /* @__PURE__ */ new Set();
var goodUrls = /* @__PURE__ */ new Set();
var goodByVideo = /* @__PURE__ */ new Map();
var healthByVideo = /* @__PURE__ */ new Map();
var hostFail = /* @__PURE__ */ new Map();
var hostOk = /* @__PURE__ */ new Map();
function markHealth(id, next) {
	const previous = healthByVideo.get(id);
	if (previous === next || previous === "loaded" && next === "failed") return;
	healthByVideo.delete(id);
	healthByVideo.set(id, next);
	if (healthByVideo.size > MAX_HEALTH) healthByVideo.delete(healthByVideo.keys().next().value);
	if (typeof window !== "undefined") window.dispatchEvent(new Event("reelcase:preview-health"));
}
function hostOf(url) {
	try {
		return new URL(url).hostname.toLowerCase();
	} catch {
		return "";
	}
}
function trimSet(set, max) {
	if (set.size <= max) return;
	const drop = set.size - max;
	let i = 0;
	for (const key of set) {
		set.delete(key);
		if (++i >= drop) break;
	}
}
function trimHostMap(map, max) {
	if (map.size <= max) return;
	const drop = map.size - max;
	let i = 0;
	for (const key of map.keys()) {
		map.delete(key);
		if (++i >= drop) break;
	}
}
/** Prefer hosts that historically serve RedTube/Eporner strips; demote flaky ones. */
var PREFERRED_HOSTS = {
	"ei-ph.rdtcdn.com": 8,
	"di-ph.rdtcdn.com": 5,
	"ei.rdtcdn.com": 4,
	"cdn.eporner.com": 6,
	"static-cdn-v4.eporner.com": 5,
	"woofcdn.com": 3,
	"thumbs2.redgifs.com": 7,
	"thumbs1.redgifs.com": 4,
	"media.redgifs.com": 3
};
function markAdultThumbFailed(url, videoId) {
	if (!url) return;
	if (videoId) markHealth(videoId, "failed");
	failedUrls.add(url);
	goodUrls.delete(url);
	trimSet(failedUrls, MAX_FAILED);
	const host = hostOf(url);
	if (host) {
		hostFail.set(host, (hostFail.get(host) ?? 0) + 1);
		trimHostMap(hostFail, 96);
	}
}
function markAdultThumbGood(url, videoId) {
	if (!url || failedUrls.has(url)) return;
	goodUrls.add(url);
	trimSet(goodUrls, MAX_GOOD);
	const host = hostOf(url);
	if (host) {
		hostOk.set(host, (hostOk.get(host) ?? 0) + 1);
		trimHostMap(hostOk, 96);
	}
	if (videoId) {
		markHealth(videoId, "loaded");
		goodByVideo.set(videoId, url);
		if (goodByVideo.size > MAX_BY_VIDEO) {
			const first = goodByVideo.keys().next().value;
			if (first) goodByVideo.delete(first);
		}
	}
}
/** Actual decoded artwork observations from cards mounted in this session. */
function getAdultPreviewHealth() {
	let loaded = 0;
	let failed = 0;
	for (const status of healthByVideo.values()) status === "loaded" ? loaded++ : failed++;
	return {
		loaded,
		failed,
		tested: loaded + failed,
		share: loaded / Math.max(1, loaded + failed)
	};
}
function isAdultThumbBlacklisted(url) {
	return Boolean(url) && failedUrls.has(url);
}
function recallSessionGoodThumb(videoId) {
	return goodByVideo.get(videoId);
}
function adultThumbHostScore(url) {
	const host = hostOf(url);
	if (!host) return 0;
	const base = PREFERRED_HOSTS[host] ?? 1;
	const session = (hostOk.get(host) ?? 0) - (hostFail.get(host) ?? 0) * 2;
	return base + Math.max(-6, Math.min(6, session));
}
/** Drop blacklisted URLs and prefer known-good / healthier hosts. */
function filterAndRankAdultThumbs(urls) {
	const seen = /* @__PURE__ */ new Set();
	const ranked = [];
	for (let i = 0; i < urls.length; i++) {
		const url = urls[i];
		if (!url || seen.has(url) || failedUrls.has(url)) continue;
		seen.add(url);
		let score = adultThumbHostScore(url) * 10 - i;
		if (goodUrls.has(url)) score += 100;
		ranked.push({
			url,
			score,
			idx: i
		});
	}
	ranked.sort((a, b) => b.score - a.score || a.idx - b.idx);
	return ranked.map((row) => row.url);
}
function asUrl(value) {
	if (typeof value === "string") return value.trim();
	if (value && typeof value === "object" && "src" in value) {
		const src = value.src;
		if (typeof src === "string") return src.trim();
	}
	return "";
}
function thumbSizeRank(value) {
	if (!value || typeof value !== "object") return 0;
	const size = String(value.size ?? "").toLowerCase();
	if (size === "big" || size === "large" || size === "640x360") return 3;
	if (size === "medium" || size === "320x180") return 2;
	if (size === "small" || size === "tiny") return 1;
	return 0;
}
function isUsableAdultThumb(url) {
	if (!url || !/^https:\/\//i.test(url)) return false;
	if (/\/videos\/\/original\//i.test(url)) return false;
	if (/\/videos\/original\//i.test(url) && !/\/videos\/\d{4}\/\d{2}\//i.test(url)) return false;
	if (/\/null\/|\/undefined\/|\/NaN\//i.test(url)) return false;
	if (/\/videos\/\d{4}\/\d{2}\/\//i.test(url)) return false;
	if (/\/(?:default|no[_-]?thumb|placeholder|missing)[_-]?(?:thumb)?\.(?:jpg|jpeg|png|webp)/i.test(url)) return false;
	if (/\/(?:promo|affiliate|ads?|blank|spacer|pixel)[_-]?(?:thumb|image)?\.(?:jpg|jpeg|png|gif|webp)/i.test(url)) return false;
	if (/(?:1x1|blank)\.(?:jpg|jpeg|png|gif|webp)(?:\?|$)/i.test(url)) return false;
	if (/\/(?:favicon|logo[_-]?small|icon[_-]?\d{1,3})\./i.test(url)) return false;
	return true;
}
/**
* After decode: reject 1×1 / tiny CDN placeholders that still fire onLoad.
* Call from <img onLoad> before treating the URL as a success.
*/
function isDecodedAdultThumbLikelyReal(img) {
	const w = img.naturalWidth || 0;
	const h = img.naturalHeight || 0;
	if (w < 48 || h < 48) return false;
	const ratio = w / Math.max(h, 1);
	if (ratio > 4.2 || ratio < .35) return false;
	return true;
}
/** Short host/size fallbacks for tube posters — keep primary URL first, avoid long speculative chains. */
function expandAdultThumbFallbacks(url) {
	if (!isUsableAdultThumb(url)) return [];
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	const push = (candidate) => {
		if (!candidate || seen.has(candidate) || !isUsableAdultThumb(candidate)) return;
		if (isAdultThumbBlacklisted(candidate)) return;
		seen.add(candidate);
		out.push(candidate);
	};
	push(url);
	const hostSwap = (host) => url.replace(/https:\/\/[a-z0-9.-]+\//i, `https://${host}/`);
	if (/rdtcdn\.com|phncdn\.com|rtcdn\.com/i.test(url)) {
		for (const host of ["ei-ph.rdtcdn.com", "di-ph.rdtcdn.com"]) push(hostSwap(host));
		push(url.replace(/\/original\//i, "/320x180/"));
		push(url.replace(/\/\d+x\d+\//i, "/320x180/"));
		push(url.replace(/\?.*$/, ""));
	}
	if (/eporner\.com|woofcdn|cdn\.eporner/i.test(url)) {
		push(url.replace(/\/\d+x\d+\//i, "/320x180/"));
		push(url.replace(/\/\d+x\d+\//i, "/640x360/"));
	}
	return filterAndRankAdultThumbs(out).slice(0, 5);
}
function collectRedtubeThumbCandidates(row) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	const push = (raw) => {
		const url = asUrl(raw);
		if (!url || seen.has(url) || !isUsableAdultThumb(url) || isAdultThumbBlacklisted(url)) return;
		seen.add(url);
		out.push(url);
	};
	push(row.default_thumb);
	push(row.thumb);
	if (Array.isArray(row.thumbs)) {
		const ranked = [...row.thumbs].sort((a, b) => thumbSizeRank(b) - thumbSizeRank(a));
		let taken = 0;
		for (const item of ranked) {
			if (thumbSizeRank(item) < 2) continue;
			push(item);
			if (++taken >= 2) break;
		}
		if (taken === 0 && ranked[0]) push(ranked[0]);
	} else if (row.thumbs && typeof row.thumbs === "object") for (const item of Object.values(row.thumbs).slice(0, 4)) push(item);
	const id = String(row.video_id ?? "").trim();
	if (/^\d{5,}$/.test(id)) {
		const path = `videos/${id.slice(0, 4)}/${id.slice(4, 6)}/${id}`;
		for (const host of [
			"ei-ph.rdtcdn.com",
			"di-ph.rdtcdn.com",
			"ei.rdtcdn.com"
		]) push(`https://${host}/${path}/${id}_320x180.jpg`);
	}
	return out;
}
function pickRedtubeThumb(row) {
	const urls = collectRedtubeThumbCandidates(row);
	if (!urls.length) return {};
	const primary = urls[0];
	const unique = filterAndRankAdultThumbs([...expandAdultThumbFallbacks(primary), ...urls.slice(1)]);
	return {
		poster: unique[0],
		previewUrl: unique[0],
		thumbFallbacks: unique.slice(0, 6)
	};
}
function redgifsPosterCandidates(video) {
	if (video.remote?.kind !== "redgifs" && !video.remote?.sourceKinds?.includes("redgifs")) return [];
	const id = String(video.remote?.videoId ?? "").trim();
	if (!/^[a-z0-9_-]{2,128}$/i.test(id)) return [];
	return [
		`https://thumbs2.redgifs.com/${encodeURIComponent(id)}-mobile.jpg`,
		`https://thumbs2.redgifs.com/${encodeURIComponent(id)}-poster.jpg`,
		`https://thumbs2.redgifs.com/${encodeURIComponent(id)}-thumb.jpg`,
		`https://thumbs1.redgifs.com/${encodeURIComponent(id)}-mobile.jpg`,
		`https://thumbs1.redgifs.com/${encodeURIComponent(id)}-poster.jpg`
	];
}
/** Ordered poster candidates for any adult (or remote) library card. */
function hasAdultThumb(video) {
	const usable = (url) => Boolean(url && isUsableAdultThumb(url) && !isAdultThumbBlacklisted(url));
	return usable(recallSessionGoodThumb(video.id)) || usable(video.poster) || usable(video.remote?.previewUrl) || Boolean(video.remote?.thumbFallbacks?.some(usable)) || adultThumbCandidatesForVideo(video).length > 0;
}
function adultThumbCandidatesForVideo(video) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	const pushExact = (raw) => {
		if (!raw || seen.has(raw) || !isUsableAdultThumb(raw) || isAdultThumbBlacklisted(raw)) return;
		seen.add(raw);
		out.push(raw);
	};
	const pushExpanded = (raw) => {
		if (!raw) return;
		for (const url of expandAdultThumbFallbacks(raw)) {
			if (seen.has(url) || isAdultThumbBlacklisted(url)) continue;
			seen.add(url);
			out.push(url);
		}
	};
	pushExact(recallSessionGoodThumb(video.id));
	pushExact(video.poster);
	pushExact(video.remote?.previewUrl);
	for (const url of video.remote?.thumbFallbacks ?? []) pushExact(url);
	for (const url of redgifsPosterCandidates(video)) pushExact(url);
	pushExpanded(video.poster);
	pushExpanded(video.remote?.previewUrl);
	if (!out.length && video.remote?.kind === "redtube" && video.remote.videoId) for (const url of collectRedtubeThumbCandidates({ video_id: video.remote.videoId })) pushExact(url);
	return filterAndRankAdultThumbs(out).slice(0, 12);
}
function redtubeStarNames(stars) {
	if (!Array.isArray(stars)) return [];
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const row of stars) {
		let name = "";
		if (typeof row === "string") name = row;
		else if (row && typeof row === "object") {
			const rec = row;
			if (typeof rec.star_name === "string") name = rec.star_name;
			else if (typeof rec.star === "string") name = rec.star;
			else if (rec.star && typeof rec.star === "object") {
				const inner = rec.star;
				if (typeof inner.star_name === "string") name = inner.star_name;
				else if (typeof inner.star === "string") name = inner.star;
			}
		}
		const clean = name.trim();
		const key = clean.toLowerCase();
		if (!clean || seen.has(key)) continue;
		seen.add(key);
		out.push(clean);
	}
	return out;
}
/**
* Reddit-native signals for Adult tag ingest + ranking.
* Subreddit, flair, title tokens, and comment fetish hits — not just tube keywords.
*/
var STOP = /* @__PURE__ */ new Set([
	"the",
	"and",
	"for",
	"with",
	"this",
	"that",
	"from",
	"your",
	"have",
	"just",
	"like",
	"what",
	"when",
	"here",
	"some",
	"more",
	"they",
	"them",
	"then",
	"than",
	"into",
	"over",
	"under",
	"about",
	"after",
	"before",
	"would",
	"could",
	"should",
	"really",
	"very",
	"also",
	"been",
	"were",
	"will",
	"dont",
	"it's",
	"im",
	"ive",
	"you",
	"are",
	"was",
	"but",
	"not",
	"all",
	"any",
	"can",
	"out",
	"our",
	"how",
	"who",
	"why",
	"her",
	"his",
	"she",
	"him",
	"its",
	"one",
	"two",
	"new",
	"old",
	"get",
	"got",
	"has",
	"had",
	"did",
	"too",
	"via",
	"http",
	"https",
	"www",
	"reddit",
	"comment",
	"comments",
	"post",
	"deleted",
	"removed",
	"nsfw",
	"sfw"
]);
function decode(value) {
	return value.replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#32;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&apos;/g, "'");
}
/** Flair / Atom category that is not a generic NSFW stamp. */
function extractRedditFlair(entryXml, contentHtml = "") {
	const blob = `${entryXml}\n${contentHtml}`;
	const terms = [];
	for (const match of blob.matchAll(/<category[^>]+term="([^"]+)"/gi)) terms.push(decode(match[1]).trim());
	for (const match of blob.matchAll(/flair[^>]*>([^<]+)</gi)) terms.push(decode(match[1]).trim());
	for (const match of blob.matchAll(/link_flair_text["']?\s*[:=]\s*["']([^"']+)/gi)) terms.push(decode(match[1]).trim());
	return terms.find((term) => {
		const clean = term.toLowerCase();
		return clean.length >= 2 && clean.length <= 48 && !/^(nsfw|adult|18\+|reddit|spoiler)$/i.test(clean);
	}) ?? "";
}
function redditTitleTokens(title, limit = 12) {
	const words = title.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter((word) => word.length >= 3 && word.length <= 28 && !STOP.has(word) && !/^\d+$/.test(word));
	return [...new Set(words)].slice(0, limit);
}
function redditSubTags(subreddit) {
	const raw = subreddit.trim();
	if (!raw) return [];
	const slug = raw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
	const words = raw.replace(/[_-]+/g, " ");
	const out = [`source-reddit-${slug}`, `sub-${slug}`];
	out.push(...adultTextFetishTags(words, 8));
	return out;
}
function mineRedditCommentTags(blob, limit = 24) {
	const fetish = adultTextFetishTags(blob, limit);
	const tokens = redditTitleTokens(blob, 8);
	const merged = [...fetish];
	const seen = new Set(fetish);
	for (const token of tokens) {
		if (seen.has(token)) continue;
		seen.add(token);
		merged.push(token);
		if (merged.length >= limit) break;
	}
	return merged;
}
/** Extra ingest tags for one Reddit card (sub, flair, title, media kind). */
function redditIngestExtras(input) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	const push = (tag) => {
		const clean = tag?.trim().toLowerCase();
		if (!clean || seen.has(clean)) return;
		seen.add(clean);
		out.push(clean);
	};
	for (const tag of redditSubTags(input.subreddit ?? "")) push(tag);
	if (input.flair) {
		push(input.flair);
		for (const tag of adultFetishTags([input.flair], 6)) push(tag);
	}
	for (const token of redditTitleTokens(input.title ?? "", 10)) push(token);
	if (input.mediaKind === "image") push("reddit-photo");
	if (input.mediaKind === "video") push("reddit-video");
	for (const tag of adultTextFetishTags(`${input.title ?? ""} ${input.flair ?? ""} ${input.extraText ?? ""}`, 16)) push(tag);
	return out.slice(0, 36);
}
function liveRoomRequest(raw) {
	const data = raw && typeof raw === "object" ? raw : {};
	if (data.provider !== "chaturbate" && data.provider !== "myfreecams") throw new Error("Choose Chaturbate or MyFreeCams.");
	const offset = Number(data.offset ?? 0), limit = Number(data.limit ?? 24);
	if (!Number.isFinite(offset) || !Number.isFinite(limit)) throw new Error("Invalid live directory page.");
	return {
		provider: data.provider,
		offset: Math.max(0, Math.min(1e5, Math.floor(offset))),
		limit: Math.max(1, Math.min(48, Math.floor(limit)))
	};
}
//#endregion
export { extractRedditFlair as $, twitchContentEvidence as $t, adultTaxonomyTags as A, patchSparseRecord as At, confirmedYoutubeChannelId as B, repairYoutubeImport as Bt, YoutubeLiveEvidenceError as C, mineRedditCommentTags as Ct, adultSourceTag as D, normalizeTwitchRetry as Dt, adultRemoteLabel as E, normalizeTwitchPullPolicy as Et, bindYoutubeCorrection as F, redditIngestExtras as Ft, decodeTwitchClipCursor as G, selectDueLiveRefreshChannels as Gt, copyCatalogRecord as H, retainTwitchContent as Ht, canonicalFollowHandle as I, redditTitleTokens as It, encodeTwitchArchiveCursor as J, selectYoutubeQuickLiveChannels as Jt, dedupeFollows as K, selectLiveRefreshChannels as Kt, classifyTwitchFailure as L, redtubeStarNames as Lt, adultThumbCandidatesForVideo as M, recentPullFailure as Mt, advanceTwitchArchiveCursor as N, recentPullReady as Nt, adultTagRankBoost as O, normalizeYoutubeLiveEvidence as Ot, aggregateProviderCache as P, recentPullSuccess as Pt, expandedAdultTags as Q, sparseRecordScan as Qt, collectCatalogRows as R, removeSparseRecordKeys as Rt, YOUTUBE_QUICK_LIVE as S, mergeResolvedFollow as St, adultIngestTags as T, normalizeRecentPull as Tt, decodeSparseRecord as U, retainTwitchPullPolicy as Ut, copyCatalogArray as V, resolvedFollowQueries as Vt, decodeTwitchArchiveCursor as W, reviewYoutubeImport as Wt, estimateProviderPayload as X, sparseRecordBuilder as Xt, encodeTwitchClipCursor as Y, sortCatalogRows as Yt, expandAdultThumbFallbacks as Z, sparseRecordOrderedParts as Zt, REDDIT_FOLDER_ID as _, youtubePublishedTime as _n, knownTwitchContent as _t, ADULT_FOLDER_BY_PROVIDER as a, twitchPullPolicySummary as an, importedFollowStub as at, RETIRED_ADULT_SOURCE_IDS as b, markAdultThumbGood as bt, ADULT_PULL_PROVIDERS as c, verifiedYoutubeSource as cn, isAdultMetaTaxonomyTag as ct, ADULT_SOURCE_OPTIONS as d, youtubeEvidenceExplanation as dn, isDecodedAdultThumbLikelyReal as dt, twitchContentKind as en, fetishSearchQuery as et, BOORU_FOLDER_ID as f, youtubeFollowHealth as fn, isRedditRemovalText as ft, MYFREECAMS_FOLDER_ID as g, youtubeLiveFailure as gn, isYoutubeStreamsTab as gt, EPORNER_FOLDER_ID as h, youtubeLiveCoverage as hn, isUsableAdultThumb as ht, ADULT_FEATURED_FETISH_TAGS as i, twitchPullPolicy as in, hasAdultThumb as it, adultTextFetishTags as j, pickRedtubeThumb as jt, adultTaxonomyLabel as k, parseFollowImport as kt, ADULT_REDDIT_PRIORITY_SUBS as l, yieldCatalogTask as ln, isAdultPullKind as lt, DEFAULT_TWITCH_PULL_POLICY as m, youtubeLiveCooldown as mn, isRemovedRedditVideo as mt, ADULT_CURATED_FETISH_TAGS as n, twitchContentReport as nn, forEachCatalogSlice as nt, ADULT_FOLDER_IDS as o, twitchRetryPatch as on, isAdultGenreTag as ot, CHATURBATE_FOLDER_ID as p, youtubeHtmlLiveEvidence as pn, isRedditRemovalUrl as pt, encodeSparseRecord as q, selectRecentPullChannels as qt, ADULT_EMBED_LINKS as r, twitchPolicyAllows as rn, getAdultPreviewHealth as rt, ADULT_MILESTONE_LINKS as s, uniqueYoutubePage as sn, isAdultImageKind as st, ADULT_CATEGORY_HUB as t, twitchContentLabel as tn, forEachCatalogEntry as tt, ADULT_REDDIT_SUBS as u, youtubeCatalogLiveEvidence as un, isAdultThumbBlacklisted as ut, REDGIFS_FOLDER_ID as v, liveRoomRequest as vt, adultFolderIds as w, normalizeProviderCache as wt, TWITCH_CONTENT_OPTIONS as x, matchesTwitchContent as xt, REDTUBE_FOLDER_ID as y, markAdultThumbFailed as yt, completeKnownYoutubeEvidence as z, repairLegacyYoutubeDate as zt };
