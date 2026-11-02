import { r as __exportAll$1 } from "../_runtime.mjs";
import { i as validateYoutubeLiveContent } from "./youtube-contract-DMSANo43.mjs";
import { a as exactYoutubePublished, c as repairYoutubePublication, n as ProviderBudgetError, o as parseProviderJson } from "./provider-json-sZboGRL6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rolldown-runtime-D7D4PA-g.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/twitch-retry-D5SsgGzE.js
var twitch_retry_D5SsgGzE_exports = /* @__PURE__ */ __exportAll$1({
	$: () => retainTwitchIdentity,
	A: () => isYoutubeStreamsTab,
	At: () => twitchUserId,
	B: () => twitchContentKind,
	Bt: () => yieldCatalogTask,
	C: () => normalizePlaylistWalk,
	Ct: () => assertTwitchContinuity,
	D: () => normalizeProviderCache,
	Dt: () => separateTwitchIdentity,
	E: () => estimateProviderPayload,
	Et: () => retainTwitchSourceIdentity,
	F: () => TWITCH_CONTENT_OPTIONS,
	Ft: () => copyCatalogArray,
	G: () => youtubePublishedTime,
	Gt: () => sparseRecordBuilder,
	H: () => twitchContentReport,
	Ht: () => encodeSparseRecord,
	I: () => knownTwitchContent,
	It: () => copyCatalogRecord,
	J: () => adultEmbedUrl,
	K: () => ADULT_PROVIDER_ADAPTERS,
	Kt: () => sparseRecordOrderedParts,
	L: () => matchesTwitchContent,
	Lt: () => forEachCatalogEntry,
	M: () => youtubeCatalogLiveEvidence,
	Mt: () => videoCreatorSignal,
	N: () => youtubeEvidenceExplanation,
	Nt: () => setHiddenPrivateSources,
	O: () => YoutubeLiveEvidenceError,
	Ot: () => twitchCreatorSignal,
	P: () => youtubeHtmlLiveEvidence,
	Pt: () => collectCatalogRows,
	Q: () => adultFolderIds,
	R: () => retainTwitchContent,
	Rt: () => forEachCatalogSlice,
	S: () => markPlaylistWalk,
	St: () => applyTwitchAlias,
	T: () => aggregateProviderCache,
	Tt: () => parseTwitchAliasResponse,
	U: () => repairLegacyYoutubeDate,
	Ut: () => patchSparseRecord,
	V: () => twitchContentLabel,
	Vt: () => decodeSparseRecord,
	W: () => uniqueYoutubePage,
	Wt: () => removeSparseRecordKeys,
	X: () => canPullAdult,
	Y: () => adultSelectionCapabilities,
	Z: () => ADULT_PULL_PROVIDERS,
	_: () => advanceYoutubeEvents,
	_t: () => normalizeTwitchPullPolicy,
	a: () => recentPullFailure,
	at: () => importedFollowStub,
	b: () => youtubeLiveInterval,
	bt: () => twitchPullPolicy,
	c: () => selectRecentPullChannels,
	ct: () => resolvedFollowQueries,
	d: () => normalizeYoutubeFeedGap,
	dt: () => youtubeFollowHealth,
	et: () => twitchIdentity,
	f: () => decodeTwitchClipCursor,
	ft: () => canonicalFollowHandle,
	g: () => encodeTwitchArchiveCursor,
	gt: () => DEFAULT_TWITCH_PULL_POLICY,
	h: () => decodeTwitchArchiveCursor,
	ht: () => mergeResolvedFollow,
	i: () => normalizeRecentPull,
	it: () => bindYoutubeCorrection,
	j: () => normalizeYoutubeLiveEvidence,
	jt: () => validTwitchAlias,
	k: () => completeKnownYoutubeEvidence,
	kt: () => twitchObservationCurrent,
	l: () => advanceYoutubeFeedGap,
	lt: () => reviewYoutubeImport,
	m: () => advanceTwitchArchiveCursor,
	mt: () => dedupeFollows,
	n: () => normalizeTwitchRetry,
	nt: () => twitchUrlIdentity,
	o: () => recentPullReady,
	ot: () => parseFollowImport,
	p: () => encodeTwitchClipCursor,
	pt: () => confirmedYoutubeChannelId,
	q: () => adultAdapter,
	qt: () => sparseRecordScan,
	r: () => twitchRetryPatch,
	rt: () => twitch_identity_exports,
	s: () => recentPullSuccess,
	st: () => repairYoutubeImport,
	t: () => classifyTwitchFailure,
	tt: () => twitchIdentityKeys,
	u: () => detectYoutubeFeedGap,
	ut: () => verifiedYoutubeSource,
	v: () => normalizeYoutubeEvents,
	vt: () => retainTwitchPullPolicy,
	w: () => reconcilePlaylistWalks,
	wt: () => bindTwitchSource,
	x: () => youtubeNearStart,
	xt: () => twitchPullPolicySummary,
	y: () => youtubeEventNotices,
	yt: () => twitchPolicyAllows,
	z: () => twitchContentEvidence,
	zt: () => sortCatalogRows
});
var snapshots$1 = /* @__PURE__ */ new WeakMap();
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
	return snapshots$1.get(source) ?? {
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
	snapshots$1.set(proxy, snapshot);
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
	const snapshot = snapshots$1.get(record);
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
	const snapshot = snapshots$1.get(record), base = snapshot?.base ?? record;
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
	const snapshot = snapshots$1.get(record);
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
var current = {
	revision: 0,
	ids: /* @__PURE__ */ new Set()
};
/** Hidden folders still define privacy for retained history and saved marks. */
function hiddenSourcePrivacy() {
	return current;
}
function setHiddenPrivateSources(ids) {
	const next = new Set(ids);
	if (next.size === current.ids.size && [...next].every((id) => current.ids.has(id))) return;
	current = {
		revision: current.revision + 1,
		ids: next
	};
}
var login = (v) => typeof v === "string" && /^[a-z0-9_]{1,25}$/.test(v);
var twitchUserId = (v) => typeof v === "string" && /^\d{1,40}$/.test(v);
function validTwitchAlias(raw) {
	const r = raw;
	return !!r && r.version === 1 && twitchUserId(r.userId) && login(r.from) && login(r.to) && r.from !== r.to && Number.isSafeInteger(r.checkedAt) && r.checkedAt > 0;
}
function assertTwitchContinuity(previous, incoming) {
	if (twitchUserId(previous.channelId) && incoming.channelId !== previous.channelId) throw Error("Twitch identity changed for this login. Saved media and settings were kept. Review this creator’s current login before pulling again.");
}
/** Canonical IDs are never login-renamed: title signals and old source references stay intact. */
function applyTwitchAlias(channel, evidence) {
	if (channel.kind !== "twitch" || !validTwitchAlias(evidence) || channel.channelId !== evidence.userId || channel.handle.toLowerCase() !== evidence.from || Date.now() - evidence.checkedAt > 3e5 || evidence.checkedAt > Date.now() + 5e3) throw Error("The Twitch identity review expired or the creator changed. Check again.");
	if ((channel.twitchAliasRevision ?? 0) >= Number.MAX_SAFE_INTEGER) throw Error("Twitch identity revision exhausted. Existing identity was retained.");
	const aliases = [.../* @__PURE__ */ new Set([...channel.twitchAliases ?? [], evidence.from])].filter((v) => v !== evidence.to);
	if (aliases.length > 16) throw Error("This creator has reached its 16 saved aliases. Existing aliases were retained.");
	return {
		...channel,
		handle: evidence.to,
		twitchCreatorKey: channel.twitchCreatorKey ?? channel.title.trim().toLowerCase(),
		twitchAliases: aliases,
		twitchAliasRevision: (channel.twitchAliasRevision ?? 0) + 1,
		importQuery: evidence.to,
		lastProviderFailure: void 0,
		lastLiveFailure: void 0,
		lastClipFailure: void 0,
		twitchLiveRetry: void 0,
		twitchArchiveRetry: void 0,
		twitchClipRetry: void 0,
		twitchClipRecentRetry: void 0,
		recentPull: void 0
	};
}
/** Recycled names receive a separate source key. Proven distinct users never dedupe by login. */
function separateTwitchIdentity(rows, incoming) {
	if (incoming.kind !== "twitch" || !twitchUserId(incoming.channelId)) return incoming;
	return rows.find((r) => r.kind === "twitch" && r.id === incoming.id && twitchUserId(r.channelId) && r.channelId !== incoming.channelId) ? {
		...incoming,
		id: "tw:user:" + incoming.channelId,
		twitchCreatorKey: "twitch-user:" + incoming.channelId,
		twitchPullPolicy: void 0
	} : incoming;
}
/** Public metadata can refresh; the reviewed source key/login and personal policy belong to the saved identity. */
function retainTwitchSourceIdentity(owner, incoming) {
	assertTwitchContinuity(owner, incoming);
	return {
		...incoming,
		id: owner.id,
		handle: owner.handle,
		twitchAliases: owner.twitchAliases,
		twitchAliasRevision: owner.twitchAliasRevision,
		twitchCreatorKey: owner.twitchCreatorKey,
		twitchPullPolicy: owner.twitchPullPolicy
	};
}
/** A late request started before an alias review cannot put the old login back. */
function twitchObservationCurrent(current, incoming) {
	return current.kind !== "twitch" || incoming.kind !== "twitch" || !(twitchUserId(current.channelId) && twitchUserId(incoming.channelId) && current.channelId !== incoming.channelId) && (incoming.twitchAliasRevision ?? 0) >= (current.twitchAliasRevision ?? 0);
}
function bindTwitchSource(video, channel) {
	if (video.remote?.kind !== "twitch") return video;
	const live = video.extension === "live";
	return {
		...video,
		folderId: channel.id,
		...live ? { id: channel.id + (video.remote.live ? ":live" : ":channel") } : {},
		remote: {
			...video.remote,
			twitchCreatorKey: channel.twitchCreatorKey,
			channelId: channel.channelId,
			sourceIds: [.../* @__PURE__ */ new Set([...video.remote.sourceIds ?? [], channel.id])]
		}
	};
}
function parseTwitchAliasResponse(raw, userId, from) {
	const r = raw;
	if (r?.errors?.length || !r?.data || !Object.hasOwn(r.data, "user")) throw Error("Twitch identity response was incomplete. No alias was changed.");
	const user = r.data.user;
	if (!user) throw Error("The saved Twitch user could not be resolved. No alias was changed.");
	if (user.id !== userId || !login(user.login)) throw Error("Twitch returned mismatched identity evidence.");
	return user.login === from ? void 0 : {
		version: 1,
		userId,
		from,
		to: user.login,
		checkedAt: Date.now()
	};
}
var twitchCreatorSignal = (channel) => channel.kind === "twitch" ? channel.twitchCreatorKey ?? channel.title.trim().toLowerCase() : channel.title.trim().toLowerCase();
var videoCreatorSignal = (video) => video.remote?.kind === "twitch" ? video.remote.twitchCreatorKey ?? video.remote.channelName ?? "" : video.remote?.channelName ?? "";
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
		const channel = row.kind === "twitch" && twitchUserId(row.channelId) ? "twitch:" + row.channelId : confirmedYoutubeChannelId(row) ?? "";
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
	resolved = separateTwitchIdentity(rows, resolved);
	if (resolved.kind === "twitch" && twitchUserId(resolved.channelId)) {
		const owner = rows.find((r) => r.kind === "twitch" && r.channelId === resolved.channelId);
		if (owner && canonicalFollowHandle("twitch", owner.handle) !== canonicalFollowHandle("twitch", resolved.handle)) return rows;
		if (owner) resolved = retainTwitchSourceIdentity(owner, resolved);
	}
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
	const twitchColumn = kind === "twitch" ? header.findIndex((value) => [
		"login",
		"user_login",
		"username",
		"channel login",
		"channel url"
	].includes(value)) : -1;
	const queries = (twitchColumn >= 0 ? rows.slice(1).map((row) => row[twitchColumn] || "") : kind === "youtube" && (urlColumn >= 0 || idColumn >= 0) ? rows.slice(1).map((row) => row[urlColumn] || row[idColumn] || "") : fields).flatMap((raw) => {
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
		if (channel.kind !== kind || channel.importNeedsReview || !(kind === "twitch" ? /^\d{1,40}$/.test(channel.channelId ?? "") || channel.lastCheckedAt && !channel.lastProviderFailure : verifiedYoutubeSource(channel))) continue;
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
var twitch_identity_exports = /* @__PURE__ */ __exportAll({
	retainTwitchIdentity: () => retainTwitchIdentity,
	twitchIdentity: () => twitchIdentity,
	twitchIdentityKeys: () => twitchIdentityKeys,
	twitchUrlIdentity: () => twitchUrlIdentity
});
var slug = /^[A-Za-z0-9_-]{1,160}$/;
var number = /^\d{1,40}$/;
var channel = /^[A-Za-z0-9_]{1,25}$/;
/** Public routes only. Tracking, offsets, titles and display names never establish identity. */
function twitchUrlIdentity(raw) {
	if (typeof raw !== "string" || raw.length > 2048) return;
	try {
		const url = new URL(raw);
		if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.port) return;
		const host = url.hostname.toLowerCase(), path = url.pathname.replace(/\/$/, "");
		let value;
		if (host === "clips.twitch.tv") {
			value = path === "/embed" ? url.searchParams.get("clip") : path.slice(1);
			if (value && slug.test(value)) return {
				kind: "clip",
				value
			};
		}
		if ([
			"twitch.tv",
			"www.twitch.tv",
			"m.twitch.tv"
		].includes(host)) {
			value = path.match(/^\/[\w]{1,25}\/clip\/([\w-]+)$/)?.[1];
			if (value && slug.test(value)) return {
				kind: "clip",
				value
			};
			value = path.match(/^\/videos\/(\d+)$/)?.[1];
			if (value && number.test(value)) return {
				kind: "vod",
				value
			};
			value = path.match(/^\/([\w]+)$/)?.[1];
			if (value && channel.test(value) && ![
				"directory",
				"downloads",
				"videos",
				"settings",
				"clip",
				"embed"
			].includes(value.toLowerCase())) return {
				kind: "live",
				value: value.toLowerCase()
			};
		}
		if (host === "player.twitch.tv" && !path) {
			value = url.searchParams.get("video")?.replace(/^v/, "");
			if (value && number.test(value)) return {
				kind: "vod",
				value
			};
			value = url.searchParams.get("channel");
			if (value && channel.test(value)) return {
				kind: "live",
				value: value.toLowerCase()
			};
		}
	} catch {}
}
function twitchIdentity(remote, extension) {
	const routes = [remote.watchUrl, remote.embedUrl].map(twitchUrlIdentity).filter((v) => !!v);
	if (routes.length) {
		if (routes.some((row) => row.kind !== routes[0].kind || row.value !== routes[0].value)) return;
		return routes[0];
	}
	if (remote.live) {
		if (remote.channelName && channel.test(remote.channelName)) return {
			kind: "live",
			value: remote.channelName.toLowerCase()
		};
		return;
	}
	const value = remote.videoId;
	const verified = remote.twitchClipIdentity;
	if (verified?.version === 1 && slug.test(verified.slug) && (!value || value === verified.id || value === verified.slug)) return {
		kind: "clip",
		value: verified.slug
	};
	if (value && /^v?\d{1,40}$/.test(value) && extension !== "clip") return {
		kind: "vod",
		value: value.replace(/^v/, "")
	};
	if (value && slug.test(value) && (extension === "clip" || !number.test(value))) return {
		kind: "clip",
		value
	};
}
function twitchIdentityKeys(video) {
	if (video.remote?.kind !== "twitch") return [];
	const identity = twitchIdentity(video.remote, video.extension);
	if (!identity) return [];
	const keys = [`twitch:${identity.kind}:${identity.value}`];
	const pair = video.remote.twitchClipIdentity;
	if (identity.kind === "clip" && pair?.version === 1 && pair.slug === identity.value && pair.id && number.test(pair.id)) keys.push(`twitch:clip-id:${pair.id}`);
	if (identity.kind === "clip" && number.test(identity.value) && ![video.remote.watchUrl, video.remote.embedUrl].some(twitchUrlIdentity)) return [`twitch:clip-id:${identity.value}`];
	return keys;
}
function normalized(video, known) {
	if (video.remote?.kind !== "twitch") return video;
	let identity = twitchIdentity(video.remote, video.extension);
	const pair = video.remote.twitchClipIdentity ?? known;
	if (identity?.kind === "clip" && pair?.version === 1 && pair.id === identity.value && slug.test(pair.slug) && ![video.remote.watchUrl, video.remote.embedUrl].some(twitchUrlIdentity)) identity = {
		kind: "clip",
		value: pair.slug
	};
	if (!identity || identity.kind === "live") return video;
	if (identity.kind === "clip" && number.test(identity.value) && ![video.remote.watchUrl, video.remote.embedUrl].some(twitchUrlIdentity) && !(pair?.version === 1 && pair.slug === identity.value)) return video;
	const watchUrl = identity.kind === "clip" ? "https://clips.twitch.tv/" + identity.value : "https://www.twitch.tv/videos/" + identity.value;
	const embedUrl = identity.kind === "clip" ? "https://clips.twitch.tv/embed?clip=" + identity.value : "https://player.twitch.tv/?video=v" + identity.value;
	if (video.remote.videoId === identity.value && video.remote.watchUrl === watchUrl && video.remote.embedUrl === embedUrl) return video;
	return {
		...video,
		remote: {
			...video.remote,
			videoId: identity.value,
			watchUrl,
			embedUrl,
			...pair ? { twitchClipIdentity: pair } : {}
		}
	};
}
function retainTwitchIdentity(previous, incoming) {
	const keys = twitchIdentityKeys(incoming);
	if (!previous || !keys.length || !twitchIdentityKeys(previous).some((key) => keys.includes(key))) return normalized(incoming);
	incoming = normalized(incoming, previous.remote?.twitchClipIdentity);
	const sources = [.../* @__PURE__ */ new Set([
		previous.folderId,
		...previous.remote?.sourceIds ?? [],
		incoming.folderId,
		...incoming.remote?.sourceIds ?? []
	])];
	return {
		...incoming,
		id: previous.id,
		folderId: previous.folderId,
		remote: {
			...incoming.remote,
			sourceIds: sources,
			twitchClipIdentity: incoming.remote?.twitchClipIdentity ?? previous.remote?.twitchClipIdentity
		}
	};
}
var ADULT_PULL_PROVIDERS = [
	"eporner",
	"redtube",
	"chaturbate",
	"myfreecams",
	"reddit",
	"booru",
	"redgifs"
];
var snapshots = /* @__PURE__ */ new WeakMap();
var latest;
/** Built-in provider privacy does not depend on a legacy folder flag. */
function adultFolderIds(folders) {
	const hidden = hiddenSourcePrivacy(), cached = snapshots.get(folders);
	if (cached?.revision === hidden.revision) return cached.ids;
	const ids = /* @__PURE__ */ new Set([
		...ADULT_PULL_PROVIDERS.map((provider) => `${provider}:discover`),
		...folders.filter((folder) => folder.adult).map((folder) => folder.id),
		...hidden.ids
	]);
	const result = latest && latest.size === ids.size && [...ids].every((id) => latest.has(id)) ? latest : ids;
	latest = result;
	snapshots.set(folders, {
		revision: hidden.revision,
		ids: result
	});
	return result;
}
/**
* Extension point for Adult discovery providers. An adapter must use a
* documented public API, Atom/RSS feed, or an explicitly permitted embed.
* It deliberately has no generic page scraper: unsupported sites remain
* link-out destinations until a stable, lawful integration is added here.
*/
var ADULT_PROVIDER_ADAPTERS = [
	{
		id: "eporner",
		label: "Eporner",
		transport: "public-api",
		status: "active",
		capabilities: [
			"catalog",
			"search",
			"archive",
			"poster",
			"playback"
		],
		media: ["video"],
		query: "remote-search",
		paging: "archive",
		player: "embed",
		tags: true,
		customOrder: true,
		home: "https://www.eporner.com/",
		note: "Existing search API and provider embed. Provider restrictions can still prevent playback."
	},
	{
		id: "redtube",
		label: "RedTube",
		transport: "public-api",
		status: "active",
		capabilities: [
			"catalog",
			"search",
			"archive",
			"poster",
			"playback"
		],
		media: ["video"],
		query: "remote-search",
		paging: "archive",
		player: "embed",
		tags: true,
		customOrder: true,
		home: "https://www.redtube.com/",
		note: "Existing webmaster search and embed. Creator search is specific to this source."
	},
	{
		id: "chaturbate",
		label: "Chaturbate",
		transport: "public-api",
		status: "active",
		capabilities: [
			"catalog",
			"poster",
			"playback"
		],
		media: ["live"],
		query: "directory-filter",
		paging: "directory",
		player: "embed",
		tags: true,
		customOrder: false,
		home: "https://chaturbate.com/",
		note: "Filters the fetched public room directory; this is not a full-site search. Live has separate directory paging."
	},
	{
		id: "myfreecams",
		label: "MyFreeCams",
		transport: "public-api",
		status: "active",
		capabilities: ["catalog", "poster"],
		media: ["live"],
		query: "directory-filter",
		paging: "directory",
		player: "external",
		tags: false,
		customOrder: false,
		pageView: true,
		home: "https://app.myfreecams.com/",
		note: "Public roster and official room links. No in-app video-player integration; the optional whole website is a page view and can reject login or subpanels."
	},
	{
		id: "reddit",
		label: "Reddit",
		transport: "atom-rss",
		status: "active",
		capabilities: [
			"catalog",
			"search",
			"archive",
			"poster"
		],
		media: ["photo", "video"],
		query: "feed-filter",
		paging: "rotation",
		player: "mixed",
		tags: true,
		customOrder: false,
		home: "https://www.reddit.com/",
		note: "Filters the fetched public Atom community window. Media may be a direct file or a supported attached embed; deleted or restricted posts stay unavailable."
	},
	{
		id: "booru",
		label: "Booru + Rule34 + Gelbooru + e621",
		transport: "public-api",
		status: "active",
		capabilities: [
			"catalog",
			"search",
			"poster"
		],
		media: ["photo"],
		query: "tag-search",
		paging: "archive",
		player: "image",
		tags: true,
		customOrder: false,
		home: "https://rule34.xxx/",
		note: "Existing host-specific image adapters and tag queries. No iframe or live player. Existing fallbacks are unchanged; no new host is enabled."
	},
	{
		id: "redgifs",
		label: "Redgifs",
		transport: "public-api",
		status: "active",
		capabilities: [
			"catalog",
			"search",
			"poster",
			"playback"
		],
		media: ["video"],
		query: "remote-search",
		paging: "archive",
		player: "embed",
		tags: true,
		customOrder: false,
		home: "https://www.redgifs.com/",
		note: "Existing search uses provider trending order and temporary server-side authentication; optional configured fallback stays server-side."
	}
];
var byId = new Map(ADULT_PROVIDER_ADAPTERS.map((row) => [row.id, row]));
function adultAdapter(id) {
	return typeof id === "string" ? byId.get(id) : void 0;
}
function canPullAdult(id) {
	const row = adultAdapter(id);
	return !!row && row.status === "active" && row.capabilities.includes("catalog") && ADULT_PULL_PROVIDERS.includes(row.id);
}
function adultSelection(providers) {
	return (providers === "all" ? ADULT_PULL_PROVIDERS : providers).map(adultAdapter).filter((row) => !!row && canPullAdult(row.id));
}
function adultSelectionCapabilities(providers) {
	const rows = adultSelection(providers);
	return {
		rows,
		archive: rows.some((r) => r.paging !== "directory"),
		order: rows.some((r) => r.customOrder),
		directoryOnly: rows.length > 0 && rows.every((r) => r.paging === "directory"),
		query: rows.length === 1 ? rows[0].query : "mixed"
	};
}
/** A registry change cannot alter the independent built-in privacy classifier. */
function adultEmbedUrl(kind, value) {
	const row = adultAdapter(kind);
	if (!row || !["embed", "mixed"].includes(row.player) || typeof value !== "string") return void 0;
	try {
		const url = new URL(value);
		if (url.protocol !== "https:" || url.username || url.password || url.port) return void 0;
		const host = url.hostname.toLowerCase(), p = url.pathname;
		return (kind === "eporner" ? (host === "www.eporner.com" || host === "eporner.com") && /^\/embed\/[a-z0-9]+\/?$/i.test(p) : kind === "redtube" ? host === "embed.redtube.com" && (/^\/[0-9]+\/?$/.test(p) || p === "/" && /^\d+$/.test(url.searchParams.get("id") ?? "")) : kind === "chaturbate" ? host === "chaturbate.com" && /^\/embed\/[a-z0-9_]+\/?$/i.test(p) : kind === "redgifs" ? (host === "www.redgifs.com" || host === "redgifs.com") && /^\/ifr\/[a-z0-9_-]+\/?$/i.test(p) : kind === "reddit" ? (host === "www.redditmedia.com" || host === "redditmedia.com") && (/^\/mediaembed\/[a-z0-9]+\/?$/i.test(p) || /^\/r\/[a-z0-9_]+\/comments\/[a-z0-9]+\/?$/i.test(p)) || (host === "www.redgifs.com" || host === "redgifs.com") && /^\/ifr\/[a-z0-9_-]+\/?$/i.test(p) : false) ? url.href : void 0;
	} catch {
		return;
	}
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
function identity$1(video) {
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
	const family = identity$1(video);
	if (family === "clip" && raw.kind !== "clip" || family === "video" && raw.kind === "clip") return;
	return raw;
}
function twitchContentKind(video) {
	if (video.remote?.kind !== "twitch") return "unknown";
	if (video.remote.live) return "live";
	const evidence = knownTwitchContent(video);
	if (evidence) return evidence.kind;
	return identity$1(video) === "clip" ? "clip" : "unknown";
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
			return parseProviderJson(html.slice(start, i + 1));
		} catch (error) {
			if (error instanceof ProviderBudgetError) throw error;
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
/** Only explicit upcoming metadata is accepted; relative labels and waiting
* counts are not a schedule or concurrent audience. */
function youtubeUpcomingData(initial, channelId) {
	if (initial?.metadata?.channelMetadataRenderer?.externalId !== channelId) return [];
	const stack = [(initial.contents?.twoColumnBrowseResultsRenderer?.tabs?.find((row) => row.tabRenderer?.selected)?.tabRenderer)?.content], rows = /* @__PURE__ */ new Map();
	while (stack.length) {
		const node = stack.pop();
		if (!node || typeof node !== "object") continue;
		const r = node.videoRenderer ?? node.gridVideoRenderer;
		const lockup = node.lockupViewModel;
		if (r && /^[\w-]{11}$/.test(r.videoId ?? "")) {
			const upcoming = !!r.upcomingEventData || r.thumbnailOverlays?.some((o) => o.thumbnailOverlayTimeStatusRenderer?.style === "UPCOMING") || r.badges?.some((b) => b.metadataBadgeRenderer?.style === "BADGE_STYLE_TYPE_UPCOMING_EVENT");
			const owner = (r.ownerText ?? r.shortBylineText ?? r.longBylineText)?.runs?.find((x) => x.navigationEndpoint?.browseEndpoint?.browseId)?.navigationEndpoint?.browseEndpoint?.browseId;
			if (upcoming && (!owner || owner === channelId)) {
				const raw = r.upcomingEventData?.startTime;
				const scheduledAt = (typeof raw === "string" && /^\d{9,12}$/.test(raw) ? Number(raw) : NaN) * 1e3;
				rows.set(r.videoId, {
					id: r.videoId,
					title: label(r.title),
					...Number.isSafeInteger(scheduledAt) && scheduledAt >= Date.UTC(2e3, 0, 1) && scheduledAt < Date.UTC(2200, 0, 1) ? { scheduledAt } : {}
				});
			}
		}
		if (lockup && /^[\w-]{11}$/.test(lockup.contentId ?? "") && lockup.contentImage?.thumbnailViewModel?.overlays?.some((o) => o.thumbnailBottomOverlayViewModel?.badges?.some((b) => b.thumbnailBadgeViewModel?.badgeStyle === "THUMBNAIL_OVERLAY_BADGE_STYLE_UPCOMING"))) rows.set(lockup.contentId, {
			id: lockup.contentId,
			title: label(lockup.metadata?.lockupMetadataViewModel?.title)
		});
		for (const value of Object.values(node)) if (value && typeof value === "object") stack.push(value);
	}
	return [...rows.values()].slice(0, 64);
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
			const live = viewers !== void 0 || overlays.some((overlay) => overlay.thumbnailBottomOverlayViewModel?.badges?.some((badge) => badge.thumbnailBadgeViewModel?.badgeStyle === "THUMBNAIL_OVERLAY_BADGE_STYLE_LIVE"));
			const upcoming = overlays.some((overlay) => overlay.thumbnailBottomOverlayViewModel?.badges?.some((badge) => badge.thumbnailBadgeViewModel?.badgeStyle === "THUMBNAIL_OVERLAY_BADGE_STYLE_UPCOMING"));
			if (live && !upcoming && !seen.has(lockup.contentId)) {
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
			const upcoming = renderer.upcomingEventData || renderer.thumbnailOverlays?.some((o) => o.thumbnailOverlayTimeStatusRenderer?.style === "UPCOMING") || renderer.badges?.some((b) => b.metadataBadgeRenderer?.style === "BADGE_STYLE_TYPE_UPCOMING_EVENT");
			if (live && !upcoming && (!rowOwner || rowOwner === channelId) && !seen.has(renderer.videoId)) {
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
	const upcoming = youtubeUpcomingData(page, channelId);
	const streams = isYoutubeStreamsTab(selected);
	const complete = streams && !hasContinuation(selected.content) && observations.length < 64;
	return {
		observations,
		...upcoming.length ? { upcoming } : {},
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
		...result,
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
function normalizePlaylistWalk(raw) {
	if (!raw || typeof raw !== "object") return;
	const r = raw;
	if (r.version !== 1 || typeof r.id !== "string" || !/^[\w-]{1,100}$/.test(r.id) || ![r.startedAt, r.at].every((n) => Number.isFinite(n) && n > 0) || r.at < r.startedAt || !Number.isSafeInteger(r.count) || r.count < 0 || r.count > 1e6 || typeof r.fromStart !== "boolean" || typeof r.completed !== "boolean" || !["provisional", "confirmed"].includes(r.membership) || r.nextCursor !== void 0 && (typeof r.nextCursor !== "string" || !r.nextCursor.length || r.nextCursor.length > 16384)) return;
	return {
		version: 1,
		id: r.id,
		startedAt: r.startedAt,
		at: r.at,
		count: r.count,
		fromStart: r.fromStart,
		completed: r.completed,
		nextCursor: r.nextCursor,
		membership: r.completed && r.fromStart ? r.membership : "provisional"
	};
}
/** A suffix without its matching root checkpoint cannot prove membership. */
function markPlaylistWalk(channel, videos, cursor, completed, previous, resume, at = Date.now()) {
	const saved = normalizePlaylistWalk(previous);
	const start = !!resume && saved?.nextCursor === resume && !saved.completed ? saved : void 0;
	const walk = {
		version: 1,
		id: start?.id ?? `${at.toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
		startedAt: start?.startedAt ?? at,
		at,
		count: (start?.count ?? 0) + videos.length,
		fromStart: !resume || !!start?.fromStart,
		completed,
		nextCursor: cursor,
		membership: "provisional"
	};
	return {
		channel: {
			...channel,
			catalogCursor: cursor,
			catalogCheckedAt: at,
			catalogExhaustedAt: completed ? at : void 0,
			playlistWalk: walk
		},
		videos: videos.map((video, index) => ({
			...video,
			remote: {
				...video.remote,
				playlistMemberships: {
					...video.remote?.playlistMemberships,
					[channel.id]: {
						walk: walk.id,
						order: (start?.count ?? 0) + index,
						at
					}
				}
			}
		}))
	};
}
/** Only a complete root walk with every distinct row admitted may remove an
* edge. Never delete the canonical card, its id, or personal feedback. Work
* cooperatively and rebase at the store boundary if the snapshot changed. */
async function reconcilePlaylistWalks(videos, channels) {
	const candidates = channels.filter((c) => c.id.startsWith("ytpl:") && c.playlistWalk?.completed && c.playlistWalk.fromStart && c.playlistWalk.membership === "provisional");
	if (!candidates.length) return {
		videos,
		channels,
		changed: []
	};
	const counts = new Map(candidates.map((c) => [c.id, 0])), byId = new Map(candidates.map((c) => [c.id, c.playlistWalk]));
	await forEachCatalogSlice(videos, (v) => {
		for (const [id, edge] of Object.entries(v.remote?.playlistMemberships ?? {})) if (edge.walk === byId.get(id)?.id) counts.set(id, (counts.get(id) ?? 0) + 1);
	}, yieldCatalogTask);
	const confirmed = new Set(candidates.filter((c) => counts.get(c.id) === c.playlistWalk.count).map((c) => c.id));
	if (!confirmed.size) return {
		videos,
		channels,
		changed: []
	};
	const changed = [], out = [], folderDeltas = /* @__PURE__ */ new Map();
	await forEachCatalogSlice(videos, (video) => {
		if (video.remote?.kind !== "youtube") {
			out.push(video);
			return;
		}
		const sources = /* @__PURE__ */ new Set([video.folderId, ...video.remote.sourceIds ?? []]);
		const removed = [...sources].filter((id) => confirmed.has(id) && video.remote.playlistMemberships?.[id]?.walk !== byId.get(id).id);
		if (!removed.length) {
			out.push(video);
			return;
		}
		const memberships = { ...video.remote.playlistMemberships };
		for (const id of removed) {
			sources.delete(id);
			delete memberships[id];
		}
		const folderId = sources.has(video.folderId) ? video.folderId : [...sources][0] ?? "youtube:retained";
		sources.add(folderId);
		const next = {
			...video,
			folderId,
			remote: {
				...video.remote,
				sourceIds: [...sources],
				playlistMemberships: memberships
			}
		};
		out.push(next);
		changed.push(next);
		if (folderId !== video.folderId) {
			folderDeltas.set(video.folderId, (folderDeltas.get(video.folderId) ?? 0) - 1);
			folderDeltas.set(folderId, (folderDeltas.get(folderId) ?? 0) + 1);
		}
	}, yieldCatalogTask);
	return {
		videos: changed.length ? out : videos,
		changed,
		folderDeltas,
		channels: channels.map((c) => confirmed.has(c.id) ? {
			...c,
			playlistWalk: {
				...c.playlistWalk,
				membership: "confirmed"
			}
		} : c)
	};
}
function normalizeYoutubeEvents(raw) {
	if (!Array.isArray(raw)) return;
	const seen = /* @__PURE__ */ new Set();
	return raw.slice(0, 64).flatMap((r) => {
		if (!r || !/^[\w-]{11}$/.test(r.id) || seen.has(r.id) || typeof r.title !== "string" || ![
			"upcoming",
			"live",
			"completed",
			"uncertain"
		].includes(r.state) || !Number.isFinite(r.observedAt) || r.observedAt <= 0) return [];
		seen.add(r.id);
		const event = {
			id: r.id,
			title: r.title.slice(0, 512),
			state: r.state,
			observedAt: r.observedAt
		};
		for (const field of [
			"checkedAt",
			"scheduledAt",
			"previousScheduledAt",
			"wasLiveAt",
			"missingSince",
			"announcedAt"
		]) if (typeof r[field] === "number" && Number.isFinite(r[field]) && r[field] > 0) event[field] = r[field];
		return [event];
	});
}
/** A clock crossing is never a state transition. Only provider observations
* make a broadcast live; complete absence after the existing ten-minute hold
* completes a previously observed live event. Pre-live disappearance is uncertain. */
function advanceYoutubeEvents(previous, upcoming, live, complete, at) {
	const map = new Map((normalizeYoutubeEvents(previous) ?? []).map((e) => [e.id, e]));
	const observed = /* @__PURE__ */ new Set();
	for (const row of upcoming.slice(0, 64)) {
		observed.add(row.id);
		const old = map.get(row.id);
		map.set(row.id, {
			...old,
			id: row.id,
			title: row.title || old?.title || row.id,
			state: old?.wasLiveAt ? "uncertain" : "upcoming",
			observedAt: at,
			checkedAt: at,
			scheduledAt: row.scheduledAt ?? old?.scheduledAt,
			previousScheduledAt: row.scheduledAt && old?.scheduledAt && row.scheduledAt !== old.scheduledAt ? old.scheduledAt : old?.previousScheduledAt,
			missingSince: void 0
		});
	}
	for (const row of live.slice(0, 64)) {
		observed.add(row.id);
		const old = map.get(row.id);
		map.set(row.id, {
			...old,
			id: row.id,
			title: row.title || old?.title || row.id,
			state: "live",
			observedAt: at,
			checkedAt: at,
			wasLiveAt: old?.wasLiveAt ?? at,
			missingSince: void 0,
			announcedAt: old?.announcedAt ?? at
		});
	}
	for (const [id, old] of map) if (!observed.has(id) && old.state !== "completed") {
		const missingSince = complete ? old.missingSince ?? at : void 0;
		map.set(id, {
			...old,
			state: complete && old.wasLiveAt && missingSince !== void 0 && at - missingSince >= 6e5 ? "completed" : "uncertain",
			checkedAt: at,
			missingSince
		});
	}
	return [...map.values()].sort((a, b) => b.observedAt - a.observedAt || a.id.localeCompare(b.id)).slice(0, 64);
}
function youtubeNearStart(channel, now) {
	return channel.youtubeEvents?.some((e) => (e.state === "upcoming" || e.state === "uncertain") && !e.wasLiveAt && e.scheduledAt !== void 0 && e.scheduledAt - now <= 9e5 && e.scheduledAt - now >= -18e5) ?? false;
}
function youtubeLiveInterval(channel, now, liveMs, discoveryMs) {
	return channel.live || youtubeNearStart(channel, now) ? liveMs : discoveryMs;
}
/** The canonical card carries the receipt across channel renames, retries and
* notification dismissal. This creates in-app alerts only when enabled. */
function youtubeEventNotices(oldVideo, incoming, notices, enabled) {
	if (!enabled) return notices;
	const seen = new Set(notices.map((n) => n.id)), added = [];
	for (const video of incoming) {
		const e = video.remote?.youtubeEvent;
		if (!e || e.state !== "live" || !e.announcedAt || oldVideo(video)?.remote?.youtubeEvent?.announcedAt || seen.has("youtube-live:" + e.id)) continue;
		seen.add("youtube-live:" + e.id);
		added.push({
			id: "youtube-live:" + e.id,
			at: e.announcedAt,
			read: false,
			kind: "youtube",
			title: (video.remote?.channelName || "YouTube creator") + " is live",
			body: e.title,
			videoId: video.id
		});
	}
	return added.length ? [...added, ...notices].slice(0, 40) : notices;
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
var identity = (v) => typeof v === "string" && /^[A-Za-z0-9_-]{11}$/.test(v);
function normalizeYoutubeFeedGap(raw) {
	const v = raw;
	if (!v || !identity(v.anchor) || !Number.isFinite(v.detectedAt) || v.detectedAt <= 0 || ![
		"detected",
		"partial",
		"unresolved",
		"resolved"
	].includes(v.status) || !Number.isSafeInteger(v.recovered) || v.recovered < 0 || v.recovered > 1e6) return;
	return {
		anchor: v.anchor,
		detectedAt: v.detectedAt,
		status: v.status,
		recovered: v.recovered,
		...typeof v.cursor === "string" && v.cursor.length <= 16384 ? { cursor: v.cursor } : {},
		...Number.isFinite(v.checkedAt) && v.checkedAt > 0 ? { checkedAt: v.checkedAt } : {},
		...typeof v.error === "string" ? { error: v.error.slice(0, 240) } : {}
	};
}
/** Missing from a full RSS window means a possible gap, never a deletion. */
function detectYoutubeFeedGap(ids, anchor, now = Date.now()) {
	return identity(anchor) && ids.length >= 15 && !ids.includes(anchor) ? {
		anchor,
		detectedAt: now,
		status: "detected",
		recovered: 0
	} : void 0;
}
function advanceYoutubeFeedGap(gap, ids, cursor, complete, error, now = Date.now()) {
	const found = ids.includes(gap.anchor);
	return {
		...gap,
		status: found ? "resolved" : error ? "partial" : complete ? "unresolved" : "partial",
		checkedAt: now,
		recovered: Math.min(1e6, gap.recovered + new Set(ids.slice(0, found ? ids.indexOf(gap.anchor) : ids.length)).size),
		cursor: found || complete ? void 0 : cursor ?? gap.cursor,
		error: error?.slice(0, 240)
	};
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
		...normalizeYoutubeFeedGap(row.gap) ? { gap: normalizeYoutubeFeedGap(row.gap) } : {},
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
		...previous?.gap && previous.gap.status !== "resolved" ? { gap: previous.gap } : observation.recentPull?.gap ? { gap: observation.recentPull.gap } : previous?.gap ? { gap: previous.gap } : {},
		failures: 0,
		...observation.newestVideoId || previous?.newestVideoId ? { newestVideoId: observation.newestVideoId || previous?.newestVideoId } : {}
	};
}
function recentPullReady(channel, now = Date.now()) {
	if ((channel.recentPull?.retryAt ?? 0) > now && ![
		"catalog",
		"page",
		"details",
		"live"
	].includes(channel.recentPull?.failure?.cooldownScope ?? "")) return false;
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
//#endregion
export { patchSparseRecord as $, detectYoutubeFeedGap as A, twitchPullPolicySummary as At, markPlaylistWalk as B, youtubeCatalogLiveEvidence as Bt, confirmedYoutubeChannelId as C, twitchContentReport as Ct, decodeTwitchArchiveCursor as D, twitchObservationCurrent as Dt, decodeSparseRecord as E, twitchIdentityKeys as Et, forEachCatalogEntry as F, uniqueYoutubePage as Ft, normalizeRecentPull as G, youtubeLiveInterval as Gt, mergeResolvedFollow as H, youtubeEvidenceExplanation as Ht, forEachCatalogSlice as I, validTwitchAlias as It, normalizeYoutubeEvents as J, __exportAll as Jt, normalizeTwitchPullPolicy as K, youtubeNearStart as Kt, importedFollowStub as L, verifiedYoutubeSource as Lt, encodeTwitchArchiveCursor as M, twitchUrlIdentity as Mt, encodeTwitchClipCursor as N, twitchUserId as Nt, decodeTwitchClipCursor as O, twitchPolicyAllows as Ot, estimateProviderPayload as P, twitch_retry_D5SsgGzE_exports as Pt, parseTwitchAliasResponse as Q, isYoutubeStreamsTab as R, videoCreatorSignal as Rt, completeKnownYoutubeEvidence as S, twitchContentLabel as St, copyCatalogRecord as T, twitchIdentity as Tt, normalizePlaylistWalk as U, youtubeFollowHealth as Ut, matchesTwitchContent as V, youtubeEventNotices as Vt, normalizeProviderCache as W, youtubeHtmlLiveEvidence as Wt, normalizeYoutubeLiveEvidence as X, normalizeYoutubeFeedGap as Y, parseFollowImport as Z, bindYoutubeCorrection as _, sparseRecordBuilder as _t, YoutubeLiveEvidenceError as a, repairLegacyYoutubeDate as at, classifyTwitchFailure as b, twitchContentEvidence as bt, adultFolderIds as c, retainTwitchContent as ct, advanceYoutubeEvents as d, retainTwitchSourceIdentity as dt, recentPullFailure as et, advanceYoutubeFeedGap as f, reviewYoutubeImport as ft, bindTwitchSource as g, sortCatalogRows as gt, assertTwitchContinuity as h, setHiddenPrivateSources as ht, TWITCH_CONTENT_OPTIONS as i, removeSparseRecordKeys as it, encodeSparseRecord as j, twitchRetryPatch as jt, dedupeFollows as k, twitchPullPolicy as kt, adultSelectionCapabilities as l, retainTwitchIdentity as lt, applyTwitchAlias as m, separateTwitchIdentity as mt, ADULT_PULL_PROVIDERS as n, recentPullSuccess as nt, adultAdapter as o, repairYoutubeImport as ot, aggregateProviderCache as p, selectRecentPullChannels as pt, normalizeTwitchRetry as q, youtubePublishedTime as qt, DEFAULT_TWITCH_PULL_POLICY as r, reconcilePlaylistWalks as rt, adultEmbedUrl as s, resolvedFollowQueries as st, ADULT_PROVIDER_ADAPTERS as t, recentPullReady as tt, advanceTwitchArchiveCursor as u, retainTwitchPullPolicy as ut, canPullAdult as v, sparseRecordOrderedParts as vt, copyCatalogArray as w, twitchCreatorSignal as wt, collectCatalogRows as x, twitchContentKind as xt, canonicalFollowHandle as y, sparseRecordScan as yt, knownTwitchContent as z, yieldCatalogTask as zt };
