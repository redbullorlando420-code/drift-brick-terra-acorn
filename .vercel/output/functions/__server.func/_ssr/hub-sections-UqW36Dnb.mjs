import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { $ as Lightbulb, A as Play, At as ChevronRight, B as MonitorPlay, C as Settings2, Ct as Download, D as RefreshCw, Dt as Clapperboard, E as Rocket, Ft as Box, G as Maximize, Ht as ArrowDown, It as Bot, K as Maximize2, L as PackageSearch, O as Radio, P as Pause, Pt as ChartColumn, R as Music2, S as ShieldCheck, Tt as Copy, U as MessageCircle, _ as Smartphone, a as Volume2, at as ImagePlus, b as Shuffle, bt as EyeOff, c as Upload, ct as Heart, dt as Gamepad2, h as Star, i as VolumeX, jt as ChevronLeft, k as QrCode, n as X, nt as Laptop, r as Wifi, rt as Images, s as Users, w as Search, x as ShoppingBag, xt as ExternalLink, yt as Eye, zt as ArrowUp } from "../_libs/lucide-react.mjs";
import { s as __exportAll } from "./router-BLYzkwof.mjs";
import { J as isAdultPullKind, M as aggregateProviderCache, U as getAdultPreviewHealth } from "./adult-reddit-tags-DvmR8YRa.mjs";
import { $ as allowCardArtwork, A as registerPeriodicTask, An as subscribePullControl, At as getFirstShelfTrace, Bn as topicEvidence, Bt as getPullSettings, C as importLibraryPackZip, Dn as setRating, E as openTopic, En as setPullsPaused, Et as getCompanionMemorySnapshot, F as useTextFirstArtwork, Ft as getPerformanceMode, G as Button, Gn as useLibrary, Gt as getYoutubeFirstClickTrace, Hn as topicPreferenceScore, Ht as getSourceMemorySnapshot, I as useThumbs, In as tagIsLiked, It as getPerformanceProfile, J as DEFAULT_PULL_SETTINGS, Jn as watchTimeScore, Jt as idleEnrichment, K as Input, Kn as useSourceAssets, Kt as getYoutubeTraceRevision, Lt as getPersistenceMemorySnapshot, M as useBrowseLibrary, Mn as subscribePullSettings, Mt as getInteractionBudgetSnapshot, Nn as subscribeStartupTrace, Nt as getInteractionPriorityDelay, On as sortCatalogRows, Ot as getFeedbackDiagnostics, P as usePerformanceProfile, Pn as subscribeYoutubeTrace, Qt as linksFromHistoryAndResume, S as getThumbDiagnostics, St as exportFeedback, T as listNetworkDevices, Tn as setPerformanceMode, Tt as forEachCatalogSlice, Un as topicsForVideo, Ut as getStartupTraceRevision, V as useSessionPhase, Vn as topicEvidenceForScan, Vt as getRating, Wn as updatePullSettings, Wt as getWatchTime, Xn as yieldCatalogTask, Xt as isAdultVideo, Y as NATIVE_PLAYABLE, _ as downloadLibraryPackZip, _n as restoreDurablePhotos, at as companionAckJobs, b as getPeriodicWorkSnapshot, bn as scheduleBackgroundWork, c as VideoCard, ct as companionHealth, dt as companionListPrints, et as cacheMetrics, f as buildLibraryPackFiles, ft as companionReadPrint, gn as resolvePlayUrl, h as createSettledInput, hn as resolveCreatorCoverage, ht as companionSteamEpicGames, in as measureInteraction, it as cleanupPolicy, j as setTextFirstArtwork, jn as subscribePullQueue, kn as sparseRecordScan, kt as getFeedbackRevision, l as VirtualVideoGrid, ln as ratingPreference, lt as companionImportLibraryPack, m as catalogTurn, mt as companionSetAutostart, nn as lookupVideo, nt as canonicalTopic, on as pinPlayUrl, ot as companionArtworkAudit, p as cardVisibility, pn as remoteEntryCounts, pt as companionSavePrint, q as CLEANUP_GROUPS, qn as viewerDetails, rt as cleanupLabel, s as RankingPanel, sn as pullsPaused, st as companionExportLibraryPack, tn as loadDurablePhotosSync, tt as cancelQueuedPulls, u as applyLibraryPackFiles, ut as companionInspectMedia, v as exportAdultStats, vn as resumeForVideo, vt as createLocalId, wt as forEachCatalogEntry, x as getRenderBudgetSnapshot, y as getNetworkDeviceId, yn as saveDurablePhotos, yt as createShortLocalId, z as scheduleNavigationWork, zn as toggleTagLike, zt as getPullQueueSnapshot } from "./library-app-BzjHGYQD.mjs";
import { t as PROVIDER_BUDGETS } from "./provider-budgets-BBlQ03if.mjs";
import { r as twitchEmbedUrl, t as AdultComments } from "./adult-comments-BTeAZQq9.mjs";
import { t as qrcode } from "../_libs/qrcode-generator.mjs";
import { a as Bar, c as ResponsiveContainer, i as XAxis, l as Tooltip, n as BarChart, o as Pie, r as YAxis, s as Cell, t as PieChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hub-sections-UqW36Dnb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** One short-lived completed snapshot. Scope fields are weak references so
* caching a result cannot keep a superseded complete library/ledger alive. */
function createWeakSnapshotCache(ttlMs, options = {}) {
	const now = options.now ?? Date.now;
	const setTimer = options.setTimer ?? ((work, ms) => setTimeout(work, ms));
	const clearTimer = options.clearTimer ?? ((timer) => clearTimeout(timer));
	let entry;
	let timer;
	const clear = () => {
		entry = void 0;
		if (timer !== void 0) clearTimer(timer);
		timer = void 0;
	};
	return {
		get(scope, version) {
			if (!entry) return;
			if (entry.expires <= now()) {
				clear();
				return;
			}
			if (entry.version !== version || Object.keys(scope).length !== entry.fields.length || entry.fields.some(([key, reference]) => reference.deref() !== scope[key])) return;
			return entry.result;
		},
		put(scope, version, result) {
			clear();
			entry = {
				fields: Object.keys(scope).map((key) => [key, new WeakRef(scope[key])]),
				version,
				result,
				expires: now() + ttlMs
			};
			timer = setTimer(clear, ttlMs);
		},
		clear
	};
}
var VIDEO_FIELDS = [
	"duration",
	"isSample",
	"src",
	"genre",
	"tagline",
	"description",
	"poster"
];
var REMOTE_FIELDS = [
	"sourceKinds",
	"sourceIds",
	"videoId",
	"channelId",
	"channelName",
	"live",
	"embedUrl",
	"watchUrl",
	"previewUrl",
	"thumbFallbacks"
];
function copyDefined(target, source, fields) {
	for (const field of fields) {
		const value = source[field];
		if (value !== void 0) target[field] = value;
	}
}
/** Worker projection: retain count, topic, source, dedupe and resume evidence.
* Never clone playback transcripts, blobs or unrelated provider fields. Saved
* catalog records remain intact; review actions resolve the original by ID. */
function statsVideo(video) {
	const remote = video.remote;
	const result = {
		id: video.id,
		folderId: video.folderId,
		name: video.name,
		path: video.path,
		extension: video.extension,
		mime: video.mime,
		size: video.size,
		addedAt: video.addedAt
	};
	copyDefined(result, video, VIDEO_FIELDS);
	if (remote) {
		const reference = { kind: remote.kind };
		copyDefined(reference, remote, REMOTE_FIELDS);
		result.remote = reference;
	}
	return result;
}
var completedStats = createWeakSnapshotCache(6e4);
/** Snapshot results stay small; full records exist only in a disposable worker.
* Replaced jobs, hidden tabs, playback and navigation release that worker. */
function useLibraryStats(input, revision) {
	const [settled, setSettled] = (0, import_react.useState)({
		input,
		revision
	});
	const coalescer = (0, import_react.useMemo)(() => createSettledInput(setSettled, {
		quietMs: 800,
		maxWaitMs: 5e3
	}), []);
	(0, import_react.useEffect)(() => {
		if (input !== settled.input || revision !== settled.revision) coalescer.push({
			input,
			revision
		});
	}, [
		input,
		revision,
		coalescer
	]);
	(0, import_react.useEffect)(() => () => coalescer.cancel(), [coalescer]);
	const [snapshot, setSnapshot] = (0, import_react.useState)(() => {
		const data = completedStats.get(input, getFeedbackRevision());
		return {
			data,
			pending: !data,
			error: false
		};
	});
	const viewer = useLibrary((state) => Boolean(state.activeId || state.previewId));
	const [visible, setVisible] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const update = () => setVisible(!document.hidden);
		update();
		document.addEventListener("visibilitychange", update);
		return () => document.removeEventListener("visibilitychange", update);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!visible || viewer) return;
		const input = settled.input;
		const cached = completedStats.get(input, getFeedbackRevision());
		if (cached) {
			setSnapshot({
				data: cached,
				pending: false,
				error: false
			});
			return;
		}
		const controller = new AbortController();
		let worker, cancelTurn = () => {}, rejectTurn;
		let ack;
		let watchdog;
		let feedbackRevision;
		const stop = () => {
			worker?.terminate();
			worker = void 0;
			clearTimeout(watchdog);
		};
		const failed = () => {
			stop();
			controller.abort();
			cancelTurn();
			ack?.();
			setSnapshot((previous) => ({
				...previous,
				pending: false,
				error: true
			}));
		};
		const turn = async () => {
			controller.signal.throwIfAborted();
			await yieldCatalogTask();
			if (getInteractionPriorityDelay() > 0) await new Promise((resolve, reject) => {
				rejectTurn = reject;
				cancelTurn = scheduleBackgroundWork(() => {
					rejectTurn = void 0;
					resolve();
				});
			});
			controller.signal.throwIfAborted();
		};
		const send = (field, rows) => new Promise((resolve) => {
			controller.signal.throwIfAborted();
			ack = resolve;
			watchdog = setTimeout(failed, 3e4);
			worker.postMessage({
				field,
				rows
			});
		});
		const timer = setTimeout(() => {
			cancelTurn = scheduleBackgroundWork(() => {
				setSnapshot((previous) => ({
					...previous,
					pending: true,
					error: false
				}));
				try {
					worker = new Worker(new URL("../../lib/videos/library-stats.worker.ts", import.meta.url), { type: "module" });
				} catch {
					failed();
					return;
				}
				worker.onerror = failed;
				worker.onmessageerror = failed;
				worker.onmessage = ({ data }) => {
					clearTimeout(watchdog);
					if (data.next) {
						const done = ack;
						ack = void 0;
						done?.();
						return;
					}
					if (data.error) {
						failed();
						return;
					}
					stop();
					if (!controller.signal.aborted) {
						if (feedbackRevision === getFeedbackRevision()) completedStats.put(input, feedbackRevision, data.data);
						setSnapshot({
							data: data.data,
							pending: false,
							error: false
						});
					}
				};
				(async () => {
					const feedback = exportFeedback();
					feedbackRevision = getFeedbackRevision();
					const records = {
						...input,
						tagLikes: feedback.tagLikes,
						watchTime: feedback.watchTime
					};
					for (const field of Object.keys(records)) {
						let batch = [];
						const flush = async () => {
							await turn();
							if (batch.length) {
								const rows = batch;
								batch = [];
								await send(field, rows);
							}
						};
						if (field === "videos") {
							await forEachCatalogSlice(input.videos, (video) => {
								batch.push(statsVideo(video));
							}, flush, 256);
							await flush();
							batch = [];
							await forEachCatalogSlice(input.videos, (video) => {
								const rating = getRating(video.id);
								if (rating) batch.push([video.id, rating]);
							}, async () => {
								await turn();
								if (batch.length) {
									const rows = batch;
									batch = [];
									await send("ratings", rows);
								}
							}, 256);
							if (batch.length) await send("ratings", batch);
						} else {
							const value = records[field];
							if (Array.isArray(value)) await forEachCatalogSlice(value, (row) => {
								batch.push(row);
							}, flush, 256);
							else await forEachCatalogEntry(sparseRecordScan(value), (row) => {
								if (row) batch.push(row);
							}, flush);
							await flush();
						}
					}
					controller.signal.throwIfAborted();
					watchdog = setTimeout(failed, 6e4);
					worker.postMessage({ done: true });
				})().catch(() => {
					if (!controller.signal.aborted) failed();
				});
			});
		}, 180);
		return () => {
			clearTimeout(timer);
			controller.abort();
			cancelTurn();
			rejectTurn?.(/* @__PURE__ */ new Error("Stats replaced"));
			ack?.();
			stop();
		};
	}, [
		settled,
		viewer,
		visible
	]);
	return {
		...snapshot,
		pending: snapshot.pending || input !== settled.input || revision !== settled.revision
	};
}
function emptyAudit() {
	return {
		smartTagStatus: {
			local: 0,
			tagged: 0,
			waiting: 0
		},
		metadataTailCoverage: [],
		creatorCoverage: {
			total: 0,
			present: 0,
			repairable: 0,
			unresolved: 0,
			ambiguous: []
		},
		companionInspectionCandidates: [],
		vision: {
			processed: 0,
			waiting: 0,
			eligible: false
		},
		hiddenTitles: []
	};
}
var EMPTY = emptyAudit();
/** Settings controls paint before diagnostics. One disposable pass replaces
* repeated catalog filters on mount and every preference/button update. */
function useSettingsAudit(videos, tags, metadata, follows, hidden) {
	const [completed, setCompleted] = (0, import_react.useState)();
	(0, import_react.useEffect)(() => {
		let stopped = false, offset = 0, cancel = () => {};
		const audit = emptyAudit();
		const coverage = /* @__PURE__ */ new Map();
		const hiddenNames = /* @__PURE__ */ new Map();
		const run = () => {
			if (stopped) return;
			const started = performance.now(), end = Math.min(videos.length, offset + 512);
			while (offset < end && performance.now() - started < 4) {
				const video = videos[offset++], rowTags = tags[video.id] ?? [];
				if (hidden[video.id]) hiddenNames.set(video.id, video.name);
				const locked = metadata[video.id]?.lockedFields?.includes("tags");
				const source = video.remote?.kind ?? "local";
				const row = coverage.get(source) ?? {
					source,
					total: 0,
					tagged: 0,
					waiting: 0,
					locked: 0
				};
				row.total++;
				if (rowTags.length) row.tagged++;
				else if (locked) row.locked++;
				else row.waiting++;
				coverage.set(source, row);
				if (!video.remote) {
					audit.smartTagStatus.local++;
					if (rowTags.some((tag) => /^(?:year-|month-|type-|source-)/.test(tag))) audit.smartTagStatus.tagged++;
					if (rowTags.some((tag) => tag.startsWith("vision-"))) audit.vision.processed++;
					else audit.vision.waiting++;
					if (!locked) audit.vision.eligible = true;
					if (audit.companionInspectionCandidates.length < 12 && /^(?:[a-z]:[\\/]|\\\\[^\\]+\\[^\\]+[\\/]|\/)/i.test(video.path)) audit.companionInspectionCandidates.push(video);
				} else if (video.remote.kind === "youtube" || video.remote.kind === "twitch") {
					audit.creatorCoverage.total++;
					const resolution = resolveCreatorCoverage(video, follows);
					if (resolution.status === "present") audit.creatorCoverage.present++;
					else if (resolution.status === "resolved") audit.creatorCoverage.repairable++;
					else if (resolution.status === "unresolved") audit.creatorCoverage.unresolved++;
					else if (resolution.status === "ambiguous" && audit.creatorCoverage.ambiguous.length < 48) audit.creatorCoverage.ambiguous.push({
						id: video.id,
						name: video.name,
						candidates: resolution.candidates
					});
				}
			}
			if (offset < videos.length) {
				cancel = scheduleBackgroundWork(run);
				return;
			}
			audit.smartTagStatus.waiting = audit.smartTagStatus.local - audit.smartTagStatus.tagged;
			audit.metadataTailCoverage = [...coverage.values()].sort((a, b) => b.waiting - a.waiting || b.total - a.total || a.source.localeCompare(b.source));
			audit.hiddenTitles = Object.keys(hidden).map((id) => ({
				id,
				name: hiddenNames.get(id) ?? id
			}));
			setCompleted({
				videos,
				tags,
				metadata,
				follows,
				hidden,
				audit
			});
		};
		cancel = scheduleBackgroundWork(run);
		return () => {
			stopped = true;
			cancel();
		};
	}, [
		videos,
		tags,
		metadata,
		follows,
		hidden
	]);
	const ready = completed?.videos === videos && completed.tags === tags && completed.metadata === metadata && completed.follows === follows && completed.hidden === hidden;
	return {
		...completed?.audit ?? EMPTY,
		ready
	};
}
/** A small queue readout subscribes independently of catalog diagnostics. */
function EnrichmentStatus() {
	const queue = (0, import_react.useSyncExternalStore)(idleEnrichment.subscribe, idleEnrichment.getSnapshot, idleEnrichment.getSnapshot);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Background metadata work",
		className: "mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
					children: "Background metadata work"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-2xl text-fg",
					children: "Enrichment yields to you."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => idleEnrichment.setPaused(!queue.paused),
						children: queue.paused ? "Resume enrichment" : "Pause enrichment"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						disabled: queue.jobs.some((job) => job.id === "cached-tags"),
						onClick: () => useLibrary.getState().repairCachedMetadata(),
						children: "Recheck cached tags"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-2xl text-sm leading-6 text-muted",
				children: "Cached tag repair and smart tags share one queue. Each completed batch saves locally. Input, scrolling, a hidden tab, an active search, and an open preview or player interrupt unfinished work. Clear search or close the viewer to resume."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 text-xs leading-5 text-accent",
				role: "status",
				children: queue.error ? `Save failed · ${queue.error} Retry the metadata action to continue.` : queue.paused ? "Enrichment paused. Completed batches are saved." : !queue.jobs.length ? "No metadata work queued." : queue.state === "waiting" ? "Waiting for the library to be available." : "Working in short idle slices."
			}),
			queue.jobs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-2 text-xs text-muted",
				children: queue.jobs.map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-fg",
						children: job.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: job.progress.total ? `${job.progress.scanned.toLocaleString()} / ${job.progress.total.toLocaleString()} checked · ${job.progress.changed.toLocaleString()} changed · ${job.progress.batches.toLocaleString()} saved batches` : "Queued · awaiting first slice" })]
				}, job.id))
			}),
			queue.completed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs text-muted",
				children: [
					"Last completed · ",
					queue.completed.label,
					" · ",
					queue.completed.progress.scanned.toLocaleString(),
					" checked · ",
					queue.completed.progress.changed.toLocaleString(),
					" changed · ",
					queue.completed.progress.batches.toLocaleString(),
					" saved batches"
				]
			})
		]
	});
}
function publicTitle(input) {
	const privateFolders = new Set(input.folders.filter((folder) => folder.adult).map((folder) => folder.id));
	const knownFolders = new Set(input.folders.map((folder) => folder.id));
	return (video) => !privateFolders.has(video.folderId) && !isAdultPullKind(video.remote?.kind) && !input.unavailable[video.id] && !input.hiddenVideos[video.id] && !(input.hideDemo && video.isSample) && Boolean(knownFolders.has(video.folderId) || video.remote || video.isSample);
}
/** Only small aggregates survive the scan; no second catalog of row/topic objects. */
async function summarizeTopicCatalog(input, taste, turn) {
	const allowed = publicTitle(input), counts = /* @__PURE__ */ new Map();
	const sources = /* @__PURE__ */ new Map(), genres = /* @__PURE__ */ new Set();
	let total = 0, saved = 0, linked = 0;
	await forEachCatalogSlice(input.videos, (video) => {
		if (!allowed(video)) return;
		total++;
		const links = topicEvidenceForScan(video, input.tags[video.id]);
		const source = sources.get(video.folderId) ?? {
			total: 0,
			linked: 0
		};
		source.total++;
		source.linked += Number(links.length > 0);
		sources.set(video.folderId, source);
		if (links.length) linked++;
		if (links.some((link) => link.saved)) saved++;
		if (video.genre) genres.add(video.genre);
		const score = links.length ? taste.score(video.id) : 0;
		for (const link of links) {
			const entry = counts.get(link.topic) ?? {
				count: 0,
				providers: /* @__PURE__ */ new Set(),
				ratingTotal: 0,
				saved: 0
			};
			entry.count++;
			entry.ratingTotal += score;
			entry.saved += Number(link.saved);
			entry.providers.add(video.remote?.kind ?? "local");
			counts.set(link.topic, entry);
		}
	}, turn, 256);
	const gaps = [];
	await forEachCatalogEntry(sources, ([id, source]) => {
		gaps.push({
			id,
			...source
		});
		gaps.sort((a, b) => b.total - b.linked - (a.total - a.linked));
		if (gaps.length > 8) gaps.pop();
	}, turn);
	const genreRows = [];
	await forEachCatalogEntry(genres, (genre) => {
		genreRows.push(genre);
	}, turn);
	const sortedGenres = await sortCatalogRows(genreRows, (a, b) => a.localeCompare(b), turn);
	await turn();
	return {
		total,
		saved,
		linked,
		gaps,
		genres: sortedGenres,
		counts: [...counts].sort((a, b) => Number(taste.liked(b[0])) - Number(taste.liked(a[0])) || b[1].ratingTotal / b[1].count - a[1].ratingTotal / a[1].count || b[1].count - a[1].count || a[0].localeCompare(b[0]))
	};
}
/** Preserve catalog order and complete results; only the visible grid mounts cards. */
async function selectTopicCatalog(input, selected, genre, provider, taste, turn) {
	const allowed = publicTitle(input), videos = [];
	const related = /* @__PURE__ */ new Map();
	await forEachCatalogSlice(input.videos, (video) => {
		if (!allowed(video) || genre && video.genre !== genre || provider !== "all" && (video.remote?.kind ?? "local") !== provider) return;
		const links = selected ? topicEvidenceForScan(video, input.tags[video.id]) : [];
		if (selected && !links.some((link) => link.topic === selected)) return;
		videos.push(video);
		if (!selected) return;
		const score = taste.score(video.id);
		for (const { topic } of links) if (topic !== selected) {
			const entry = related.get(topic) ?? {
				shared: 0,
				ratingTotal: 0
			};
			entry.shared++;
			entry.ratingTotal += score;
			related.set(topic, entry);
		}
	}, turn, 256);
	await turn();
	return {
		videos,
		related: [...related].sort((a, b) => b[1].ratingTotal / b[1].shared - a[1].ratingTotal / a[1].shared || b[1].shared - a[1].shared || a[0].localeCompare(b[0])).slice(0, 12)
	};
}
/** Saved/inferred counts were accumulated once, so export is independent of library size. */
function topicConnectionsCsv(summary) {
	return [[
		"topic",
		"public_titles",
		"taste_score_points",
		"taste_total",
		"providers",
		"saved_tag_titles",
		"inferred_only_titles"
	], ...summary.counts.map(([topic, data]) => [
		topic,
		data.count,
		Math.round(data.ratingTotal / data.count * 1e3),
		data.ratingTotal.toFixed(1),
		[...data.providers].join(" + "),
		data.saved,
		data.count - data.saved
	])].map((row) => row.map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`).join(",")).join("\n");
}
var taste = {
	liked: tagIsLiked,
	score: (id) => {
		const rating = getRating(id);
		return ratingPreference(rating) + (rating === 1 ? 0 : watchTimeScore(getWatchTime(id)) / 12);
	}
};
var EMPTY_SELECTION = {
	videos: [],
	related: []
};
var EMPTY_SUMMARY = {
	total: 0,
	linked: 0,
	saved: 0,
	counts: [],
	genres: [],
	gaps: []
};
function useTopicCatalog(input, revision, selected, genre, provider, explorer) {
	const phase = useSessionPhase(), viewer = useLibrary((state) => Boolean(state.activeId || state.previewId));
	const [settled, setSettled] = (0, import_react.useState)({
		input,
		revision
	});
	const coalescer = (0, import_react.useMemo)(() => createSettledInput(setSettled, {
		quietMs: 600,
		maxWaitMs: 4e3
	}), []);
	(0, import_react.useEffect)(() => {
		if (settled.input !== input || settled.revision !== revision) coalescer.push({
			input,
			revision
		});
	}, [
		input,
		revision,
		coalescer
	]);
	(0, import_react.useEffect)(() => () => coalescer.cancel(), [coalescer]);
	const [summary, setSummary] = (0, import_react.useState)();
	const [selection, setSelection] = (0, import_react.useState)();
	const [failed, setFailed] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (phase !== "active" || viewer || summary?.input === settled.input && summary.revision === settled.revision) return;
		const controller = new AbortController();
		setFailed(false);
		summarizeTopicCatalog(settled.input, taste, catalogTurn(controller.signal)).then((data) => {
			if (!controller.signal.aborted) (0, import_react.startTransition)(() => setSummary({
				...settled,
				data
			}));
		}).catch(() => {
			if (!controller.signal.aborted) setFailed(true);
		});
		return () => controller.abort();
	}, [
		settled,
		phase,
		viewer
	]);
	(0, import_react.useEffect)(() => {
		if (!explorer || phase !== "active" || viewer || summary?.input !== settled.input || summary.revision !== settled.revision) return;
		if (selection?.input === settled.input && selection.revision === settled.revision && selection.selected === selected && selection.genre === genre && selection.provider === provider) return;
		const controller = new AbortController();
		setFailed(false);
		selectTopicCatalog(settled.input, selected, genre, provider, taste, catalogTurn(controller.signal)).then((data) => {
			if (!controller.signal.aborted) (0, import_react.startTransition)(() => setSelection({
				...settled,
				selected,
				genre,
				provider,
				data
			}));
		}).catch(() => {
			if (!controller.signal.aborted) setFailed(true);
		});
		return () => controller.abort();
	}, [
		settled,
		summary,
		selected,
		genre,
		provider,
		explorer,
		phase,
		viewer
	]);
	const summaryReady = summary?.input === input && summary.revision === revision;
	const selectionReady = selection?.input === input && selection.revision === revision && selection.selected === selected && selection.genre === genre && selection.provider === provider;
	const sameVisibility = (previous) => previous.folders === input.folders && previous.unavailable === input.unavailable && previous.hiddenVideos === input.hiddenVideos && previous.hideDemo === input.hideDemo;
	const matchesReady = Boolean(selection && sameVisibility(selection.input) && selection.selected === selected && selection.genre === genre && selection.provider === provider);
	return {
		summary: summary && sameVisibility(summary.input) ? summary.data : EMPTY_SUMMARY,
		selection: matchesReady ? selection.data : EMPTY_SELECTION,
		matchesReady,
		pending: !failed && (!summaryReady || explorer && !selectionReady),
		failed,
		ready: summaryReady
	};
}
function TopicLinks({ explorer = false }) {
	const videos = useBrowseLibrary((s) => s.videos), tags = useBrowseLibrary((s) => s.tags);
	const folders = useBrowseLibrary((s) => s.folders), unavailable = useBrowseLibrary((s) => s.unavailable);
	const hiddenVideos = useBrowseLibrary((s) => s.hiddenVideos), hideDemo = useBrowseLibrary((s) => s.hideDemo);
	const query = useLibrary((s) => s.query);
	const [provider, setProvider] = (0, import_react.useState)("all"), [genrePage, setGenrePage] = (0, import_react.useState)(0);
	const [genresOpen, setGenresOpen] = (0, import_react.useState)(false);
	const [favoriteRevision, setFavoriteRevision] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const refresh = () => setFavoriteRevision((value) => value + 1);
		window.addEventListener("reelcase:rating-change", refresh);
		return () => window.removeEventListener("reelcase:rating-change", refresh);
	}, []);
	const selected = explorer ? canonicalTopic(query) : void 0;
	const selectedGenre = explorer && query.startsWith("genre:") ? query.slice(6) : void 0;
	const { summary: index, selection, pending, failed, ready, matchesReady } = useTopicCatalog((0, import_react.useMemo)(() => ({
		videos,
		tags,
		folders,
		unavailable,
		hiddenVideos,
		hideDemo
	}), [
		videos,
		tags,
		folders,
		unavailable,
		hiddenVideos,
		hideDemo
	]), favoriteRevision, selected, selectedGenre, provider, explorer);
	const { videos: matching, related } = selection, genres = index.genres;
	const genreOffset = Math.min(genrePage * 48, Math.max(0, Math.ceil(genres.length / 48) - 1) * 48);
	const choose = (topic) => {
		setProvider("all");
		openTopic(topic);
	};
	const caption = (0, import_react.useCallback)((video) => selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 text-xs text-muted",
		children: topicEvidence(video, tags[video.id]).find((link) => link.topic === selected)?.reason
	}) : null, [selected, tags]);
	const exportLinks = () => {
		const url = URL.createObjectURL(new Blob([topicConnectionsCsv(index)], { type: "text/csv;charset=utf-8" }));
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = `reelcase-topic-links-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
		anchor.click();
		setTimeout(() => URL.revokeObjectURL(url), 1e3);
	};
	const selectedScore = selected ? index.counts.find(([topic]) => topic === selected)?.[1] : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-topic-catalog": true,
		"data-topic-pending": pending,
		"aria-busy": pending,
		className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
				children: "Connected topics"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 font-display text-2xl text-fg",
				children: selected || selectedGenre ? `Explore ${selected ?? selectedGenre}` : "Follow an idea across your library."
			}),
			pending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-2 text-sm text-muted",
				children: "Updating topic connections…"
			}),
			failed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "alert",
				className: "mt-2 flex flex-wrap items-center gap-2 text-sm text-muted",
				children: ["Topic connections could not finish.", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					onClick: () => setFavoriteRevision((value) => value + 1),
					children: "Retry topic connections"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-muted",
				children: [
					index.linked.toLocaleString(),
					" of ",
					index.total.toLocaleString(),
					" public titles linked · ",
					index.saved.toLocaleString(),
					" with saved topics · ",
					(index.linked - index.saved).toLocaleString(),
					" connected by title or category evidence. Saved tags are unchanged."
				]
			}),
			selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center gap-2 rounded-md border border-border bg-bg/45 px-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-sm text-fg",
						children: ["#", selected]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: tagIsLiked(selected) ? "default" : "secondary",
						onClick: () => toggleTagLike(selected),
						children: tagIsLiked(selected) ? "★ Favorite topic" : "☆ Favorite topic"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted",
						children: "Favorite topics stay at the start of Topics and Stats."
					}),
					selectedScore && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted",
						children: [
							"taste score ",
							Math.round(selectedScore.ratingTotal / selectedScore.count * 1e3).toLocaleString(),
							" points from ",
							selectedScore.count.toLocaleString(),
							" linked titles"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: index.counts.map(([topic, data]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: selected === topic ? "default" : "secondary",
					onClick: () => choose(topic),
					title: [...data.providers].join(" + "),
					children: [
						tagIsLiked(topic) ? "★ " : "",
						"#",
						topic,
						" · ",
						data.count.toLocaleString(),
						" · score ",
						Math.round(data.ratingTotal / data.count * 1e3).toLocaleString(),
						data.providers.size > 1 ? " · ↔" : ""
					]
				}, topic))
			}),
			!pending && !failed && !index.counts.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: "No supported topics yet. Add descriptive titles or saved topic tags to connect your media."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4",
				size: "sm",
				variant: "secondary",
				disabled: !ready,
				onClick: exportLinks,
				children: "Export topic connections"
			}),
			explorer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				genres.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
					className: "mt-4 text-sm text-muted",
					onToggle: (event) => setGenresOpen(event.currentTarget.open),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
						className: "cursor-pointer",
						children: ["Media genres and Twitch categories · ", genres.length]
					}), genresOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: genres.slice(genreOffset, genreOffset + 48).map((genre) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: selectedGenre === genre ? "default" : "secondary",
							onClick: () => choose(`genre:${genre}`),
							children: genre
						}, genre))
					}), genres.length > 48 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: genreOffset === 0,
								onClick: () => setGenrePage(Math.max(0, genreOffset / 48 - 1)),
								children: "Previous categories"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted",
								children: [
									genreOffset + 1,
									"–",
									Math.min(genreOffset + 48, genres.length),
									" of ",
									genres.length
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: genreOffset + 48 >= genres.length,
								onClick: () => setGenrePage(genreOffset / 48 + 1),
								children: "Next 48 categories"
							})
						]
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => {
							setProvider("all");
							useLibrary.getState().setQuery("");
						},
						children: "All topics"
					}), [
						"all",
						"local",
						"youtube",
						"twitch"
					].map((kind) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: provider === kind ? "default" : "secondary",
						onClick: () => setProvider(kind),
						children: kind === "all" ? "All sources" : kind
					}, kind))]
				}),
				related.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Related through titles in this view"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: related.map(([topic, data]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => choose(topic),
							children: [
								"#",
								topic,
								" · ",
								data.shared,
								" shared · score ",
								Math.round(data.ratingTotal / data.shared * 1e3).toLocaleString()
							]
						}, topic))
					})]
				}),
				matchesReady && !failed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					"data-topic-matches": matching.length,
					className: "mt-4 text-sm text-muted",
					children: [
						matching.length.toLocaleString(),
						" matching ",
						matching.length === 1 ? "title" : "titles"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VirtualVideoGrid, {
						videos: matching,
						variant: "grid",
						pageSize: 48,
						caption
					}, `${selected ?? ""}:${selectedGenre ?? ""}:${provider}`)
				})] })
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-medium text-fg",
						children: "Where topic coverage needs work"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: "Public sources ranked by titles without a supported topic. Counts refresh with your catalog."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 space-y-2",
						children: index.gaps.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap justify-between gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "text-fg hover:text-accent",
								onClick: () => {
									useLibrary.getState().setQuery("");
									useLibrary.getState().setSource(s.id);
								},
								children: folders.find((f) => f.id === s.id)?.name ?? "Unavailable source"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted",
								children: [
									s.total - s.linked,
									" unlinked · ",
									Math.round(s.linked / s.total * 100),
									"% connected"
								]
							})]
						}, s.id))
					})
				]
			})
		]
	});
}
function ArtworkAuditPanel() {
	const [report, setReport] = (0, import_react.useState)();
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg bg-elevated p-5 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl text-fg",
				children: "Artwork disk cache"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-muted",
				children: "Inspect disk usage by source before changing retention. This reads cache file sizes without loading the images."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4",
				variant: "secondary",
				disabled: busy,
				onClick: () => void (async () => {
					setBusy(true);
					try {
						setReport(await companionArtworkAudit());
					} finally {
						setBusy(false);
					}
				})(),
				children: busy ? "Inspecting cache…" : "Audit artwork cache"
			}),
			report && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 text-sm",
				role: "status",
				children: !report.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: report.error
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-muted",
						children: [
							"Disk reads measured since ",
							new Date(report.startedAt).toLocaleString(),
							". “No reads” means no hit-rate sample yet. Source groups use cache ID prefixes; unrecognized entries remain local or unknown."
						]
					}),
					report.truncated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-accent",
						children: "Partial inventory: the scan reached its time or entry budget. Sizes below are lower bounds."
					}),
					Boolean(report.skipped) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-muted",
						children: [report.skipped, " entries could not be inspected."]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 space-y-3",
						children: report.sources?.length ? report.sources.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md bg-bg/50 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium text-fg",
									children: row.source
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 tabular-nums text-muted",
									children: [
										row.files.toLocaleString(),
										" files · ",
										(row.bytes / 1048576).toFixed(2),
										" MiB · ",
										row.hits + row.misses ? `${Math.round(100 * row.hits / (row.hits + row.misses))}% hits (${row.hits} hit / ${row.misses} miss)` : "No reads"
									]
								}),
								row.oldestAt !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-muted",
									children: ["Oldest file updated ", new Date(row.oldestAt).toLocaleDateString()]
								})
							]
						}, row.source)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted",
							children: "The cache is empty and has no recorded reads."
						})
					})
				] })
			})
		]
	});
}
var MISSION_PLAN_REVISION_KEY = "reelcase.mission-plan.revision";
/** Apply newly verified defaults once, without resetting later manual status changes. */
function mergeMissionPlan(saved, defaults, previousRevision) {
	if (!saved) return defaults;
	const defaultsById = new Map(defaults.map((mission) => [mission.id, mission]));
	const savedIds = new Set(saved.map((mission) => mission.id));
	const migrateOriginalCompletions = previousRevision < 2;
	const migrateHydrationCompletion = previousRevision < 3;
	const migrateYoutubeTraceCompletion = previousRevision < 4;
	const migrateYoutubeArtworkCompletion = previousRevision < 5;
	const migrateViewerDetailsCompletion = previousRevision < 6;
	const migrateSearchBudgetCompletion = previousRevision < 7;
	const migrateTimerCompletion = previousRevision < 9;
	const migrateNavigationCompletion = previousRevision < 10;
	const migrateEnrichmentCompletion = previousRevision < 12;
	const migrateVirtualizationCompletion = previousRevision < 13;
	const migrateStartupCompletion = previousRevision < 14;
	const migrateSlowDeviceCompletion = previousRevision < 15;
	const migrateRenderAuditCompletion = previousRevision < 16;
	const migrateMobileBudgetCompletion = previousRevision < 17;
	const migrateAccessibleBrowsingCompletion = previousRevision < 18;
	const migrateDiagnosticsCompletion = previousRevision < 19;
	const migrateTwitchCheckpointCompletion = previousRevision < 20;
	const migrateTwitchSearchCompletion = previousRevision < 21;
	const migrateProviderBudgetCompletion = previousRevision < 22;
	const migrateYoutubeMetadataCompletion = previousRevision < 23;
	const migrateTwitchQueueCompletion = previousRevision < 24;
	return [...saved.map((item) => {
		const current = defaultsById.get(item.id);
		if (!current) return item;
		const promoted = current.done && (migrateOriginalCompletions || migrateHydrationCompletion && item.id === "recent-saved-library-hydration" || migrateYoutubeTraceCompletion && item.id === "youtube-upgrade-03" || migrateYoutubeArtworkCompletion && item.id === "youtube-upgrade-05" || migrateViewerDetailsCompletion && (item.id === "viewer-detail-isolation" || item.id === "viewer-detail-memory-budget") || migrateSearchBudgetCompletion && item.id === "recent-search-result-budget" || migrateTimerCompletion && item.id === "smooth-09" || migrateNavigationCompletion && item.id === "smooth-01" || migrateEnrichmentCompletion && item.id === "speed-06" || migrateVirtualizationCompletion && item.id === "smooth-02" || migrateStartupCompletion && (item.id === "speed-01" || item.id === "recent-cold-home-readiness") || migrateSlowDeviceCompletion && item.id === "smooth-10" || migrateRenderAuditCompletion && item.id === "speed-03" || migrateMobileBudgetCompletion && item.id === "speed-09" || migrateAccessibleBrowsingCompletion && item.id === "smooth-11" || migrateDiagnosticsCompletion && [
			"speed-08",
			"speed-10",
			"smooth-12"
		].includes(item.id) || migrateTwitchCheckpointCompletion && [
			"twitch-upgrade-01",
			"twitch-upgrade-03",
			"twitch-upgrade-09"
		].includes(item.id) || migrateTwitchSearchCompletion && [
			"twitch-upgrade-16",
			"twitch-upgrade-17",
			"twitch-upgrade-20"
		].includes(item.id) || migrateProviderBudgetCompletion && item.id === "speed-02" || migrateYoutubeMetadataCompletion && [
			"youtube-upgrade-07",
			"youtube-upgrade-08",
			"youtube-upgrade-20"
		].includes(item.id) || migrateTwitchQueueCompletion && [
			"twitch-upgrade-02",
			"twitch-upgrade-08",
			"twitch-upgrade-10",
			"twitch-upgrade-18"
		].includes(item.id));
		const done = Boolean(item.done || promoted);
		const savedStatus = item.status === "planned" || item.status === "in-progress" || item.status === "blocked" ? item.status : void 0;
		const startedTimerAudit = previousRevision < 8 && item.id === "smooth-09" && savedStatus !== "blocked";
		const startedEnrichmentAudit = previousRevision < 11 && item.id === "speed-06" && savedStatus !== "blocked";
		return {
			...current,
			...item,
			title: current.title,
			detail: current.detail,
			done,
			status: done ? "complete" : startedTimerAudit || startedEnrichmentAudit ? "in-progress" : savedStatus ?? current.status ?? "planned"
		};
	}), ...defaults.filter((mission) => !savedIds.has(mission.id))];
}
var entryFields = [
	[
		"remoteMaxEntries",
		"All remote entries",
		"total"
	],
	[
		"youtubeMaxEntries",
		"YouTube",
		"youtube"
	],
	[
		"twitchMaxEntries",
		"Twitch",
		"twitch"
	],
	[
		"adultMaxEntries",
		"Adults (including booru and live)",
		"adult"
	],
	[
		"otherMaxEntries",
		"Other remote providers",
		"other"
	]
];
var fields = [
	[
		"requestGapMs",
		"Minimum gap between pull jobs (ms)",
		250,
		6e4,
		250
	],
	[
		"youtubeRequestGapMs",
		"YouTube gap between archive requests (ms)",
		0,
		6e4,
		10
	],
	[
		"concurrentRequests",
		"Concurrent catalog requests",
		1,
		3,
		1
	],
	[
		"youtubeBatchVideos",
		"YouTube entries per creator batch (target)",
		30,
		500,
		10
	],
	[
		"youtubeSourcesPerSweep",
		"YouTube sources per archive sweep",
		1,
		1024,
		1
	],
	[
		"youtubeIntervalSeconds",
		"YouTube automatic sweep interval (seconds)",
		60,
		3600,
		30
	],
	[
		"adultBatchVideos",
		"Adult entries per pull, across selected providers",
		20,
		1e4,
		100
	],
	[
		"adultIntervalSeconds",
		"Adult automatic pull interval (seconds)",
		30,
		3600,
		30
	],
	[
		"adultCatalogTarget",
		"Adult automatic catalog target",
		1e3,
		1e6,
		1e3
	]
];
function PullSettingsPanel() {
	const settings = (0, import_react.useSyncExternalStore)(subscribePullSettings, getPullSettings, () => DEFAULT_PULL_SETTINGS);
	const queue = (0, import_react.useSyncExternalStore)(subscribePullQueue, getPullQueueSnapshot, getPullQueueSnapshot);
	const paused = (0, import_react.useSyncExternalStore)(subscribePullControl, pullsPaused, () => false);
	const processing = useLibrary((state) => state.remoteBusy || state.refreshing);
	(0, import_react.useEffect)(() => {
		try {
			if (sessionStorage.getItem("reelcase.settings-section") !== "youtube-cleanup") return;
			sessionStorage.removeItem("reelcase.settings-section");
			const frame = requestAnimationFrame(() => document.querySelector("[data-youtube-cleanup]")?.scrollIntoView({ block: "start" }));
			return () => cancelAnimationFrame(frame);
		} catch {}
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6 rounded-xl border border-border bg-elevated p-5 shadow-border",
		"aria-labelledby": "pull-settings-title",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
				children: "Pull management"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "pull-settings-title",
				className: "mt-2 font-display text-2xl text-fg",
				children: "Control the pace of your catalog."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-3xl text-sm leading-6 text-muted",
				children: "Larger pulls walk saved archive pages through small requests. YouTube page pacing is separate from the gap between pull jobs and defaults to 80ms. Set it to zero for no added wait between completed requests, or raise it when you want slower pulling. Adult pulls default to 2,000 entries and can target up to 10,000. Provider availability and duplicate results can reduce the number of new entries."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => setPullsPaused(!paused),
						children: paused ? "Resume pulling" : "Pause pulling"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						disabled: !processing && !queue.active && !queue.waiting,
						onClick: cancelQueuedPulls,
						children: "Cancel current pull queue"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted",
						role: "status",
						children: [
							queue.active,
							" active · ",
							queue.waiting,
							" queued",
							queue.held ? " · waiting for browsing to settle" : processing && !queue.active && !queue.waiting ? " · preparing catalog batch" : ""
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EntryLimitSettings, { settings }),
			CLEANUP_GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YoutubeCleanupSettings, {
				settings,
				group
			}, group)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: fields.map(([key, label, min, max, step]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-xs leading-5 text-muted",
					htmlFor: `pull-${key}`,
					children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: `pull-${key}`,
						className: "mt-2 min-h-11",
						type: "number",
						min,
						max,
						step,
						defaultValue: String(settings[key]),
						onBlur: (event) => {
							if (event.target.value.trim()) updatePullSettings({ [key]: Number(event.target.value) });
						},
						onKeyDown: (event) => {
							if (event.key === "Enter") event.currentTarget.blur();
						}
					}, `${key}:${settings[key]}`)]
				}, key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-wrap gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => updatePullSettings({ adultBatchVideos: 2e3 }),
						children: "Adult pulls: 2,000"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => updatePullSettings({ adultBatchVideos: 1e4 }),
						children: "Adult pulls: 10,000"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 items-center gap-2 text-sm text-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: settings.automaticPulls,
							onChange: (event) => updatePullSettings({ automaticPulls: event.target.checked })
						}), "Automatic catalog pulls"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 items-center gap-2 text-sm text-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: settings.pauseWhileWatching,
							onChange: (event) => updatePullSettings({ pauseWhileWatching: event.target.checked })
						}), "Hold catalog pulls while a preview or player is open"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs leading-5 text-muted",
				children: "YouTube finishes a provider page before saving its next cursor, so a batch may round up by one page. Adult limits cover all selected providers. Hidden tabs hold catalog work. Cancel stops later batches and discards outstanding responses; a provider request already sent may finish. Preview recommendations use at most 4,096 entries, with descriptions and comments loaded for the selected video."
			})
		]
	});
}
function EntryLimitSettings({ settings }) {
	const videos = useLibrary((state) => state.videos);
	const [usage, setUsage] = (0, import_react.useState)(null);
	const [saved, setSaved] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		let active = true;
		remoteEntryCounts(videos).then((counts) => {
			if (active) setUsage({
				videos,
				counts
			});
		});
		return () => {
			active = false;
		};
	}, [videos]);
	const counts = usage?.videos === videos ? usage.counts : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 border-y border-border py-5",
		"aria-labelledby": "entry-limits-title",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				id: "entry-limits-title",
				className: "text-lg font-medium text-fg",
				children: "Saved entry limits"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-3xl text-sm leading-6 text-muted",
				children: "New entries stay within the source and combined caps. YouTube, Twitch and Adults replace small batches of eligible old entries. Successful pulls recover lowered caps gradually and keep rejected pages queued. Zero holds new entries for that source. Protected videos and local files stay."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-3 flex min-h-11 items-center gap-2 text-sm text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: settings.sharedCapCleanup,
					onChange: (event) => updatePullSettings({ sharedCapCleanup: event.target.checked })
				}), "Allow shared-cap replacement across enabled sources"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-3xl text-xs leading-5 text-muted",
				children: "When the combined cap blocks a pull, another enabled cache can donate eligible slots using its own remaining replacement budget. This never bypasses the incoming source's cap or deletes entries from a source with cleanup switched off."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
				children: entryFields.map(([key, label, group]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					htmlFor: `pull-${key}`,
					className: "min-w-0 text-xs leading-5 text-muted",
					children: [
						label,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: `pull-${key}`,
							className: "mt-2 min-h-11",
							type: "number",
							min: 0,
							max: 1e6,
							step: 1e3,
							defaultValue: settings[key],
							onBlur: (event) => {
								if (!event.target.value.trim() || !Number.isFinite(Number(event.target.value))) return;
								updatePullSettings({ [key]: Number(event.target.value) });
								setSaved(`${label} limit saved.`);
							},
							onKeyDown: (event) => {
								if (event.key === "Enter") event.currentTarget.blur();
							}
						}, `${key}:${settings[key]}`),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block",
							children: counts ? `${counts[group].toLocaleString()} stored / ${settings[key].toLocaleString()} max${counts[group] >= settings[key] ? settings.remoteMaxEntries > 0 && CLEANUP_GROUPS.some((source) => (group === source || group === "total") && settings[`${source}MaxEntries`] > 0 && cleanupPolicy(settings, source).enabled) ? " · eligible old entries can be replaced" : " · new entries held" : ""}` : "Counting stored entries..."
						})
					]
				}, key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs leading-5 text-muted",
				children: "Includes saved, hidden, and live remote entries. Local files are excluded. Limits control catalog growth, rather than a fixed number of memory bytes."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 min-h-5 text-xs text-accent",
				role: "status",
				children: saved
			})
		]
	});
}
function YoutubeCleanupSettings({ settings, group }) {
	const cleanup = useLibrary((s) => s.cleanupRemoteCache), journal = useLibrary((s) => s.youtubeCleanup);
	const note = useLibrary((s) => s.cleanupNotes[group] ?? ""), processing = useLibrary((s) => s.remoteBusy || s.refreshing);
	const [error, setError] = (0, import_react.useState)("");
	const label = cleanupLabel(group), policy = cleanupPolicy(settings, group);
	const stats = journal.groups?.[group];
	const earlierCount = Math.max(0, journal.removedCount - CLEANUP_GROUPS.reduce((sum, source) => sum + (journal.groups?.[source]?.removedCount ?? 0), 0));
	const batchKey = `${group}CleanupBatch`, ageKey = `${group}CleanupMinAgeDays`;
	const run = async () => {
		setError("");
		try {
			await cleanup(group);
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Cleanup could not be completed.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		[`data-${group}-cleanup`]: "",
		className: "mt-5 scroll-mt-6 rounded-lg border border-border bg-bg/40 p-4",
		"aria-labelledby": `${group}-cleanup-title`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				id: `${group}-cleanup-title`,
				className: "text-lg font-medium text-fg",
				children: [label, " cache cleanup"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-3xl text-sm leading-6 text-muted",
				children: "At the cap, replace unrated and 1–2-star videos, oldest first within each group. Likes, favorites, 3–5-star ratings, live/upcoming and open videos stay. Keeps watch history, saved links, archive positions, custom metadata and a video from each source."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-3 flex min-h-11 items-center gap-2 text-sm text-fg",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: policy.enabled,
						onChange: (event) => updatePullSettings({ [`${group}AutoCleanup`]: event.target.checked })
					}),
					"Automatically make room for new ",
					label,
					" pulls"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-xs leading-5 text-muted",
					htmlFor: `pull-${batchKey}`,
					children: ["Maximum entries replaced per pull", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: `pull-${batchKey}`,
						className: "mt-2",
						type: "number",
						min: 1,
						max: 1e3,
						defaultValue: policy.batch,
						onBlur: (event) => {
							if (event.target.value.trim()) updatePullSettings({ [batchKey]: Number(event.target.value) });
						},
						onKeyDown: (event) => {
							if (event.key === "Enter") event.currentTarget.blur();
						}
					}, policy.batch)]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-xs leading-5 text-muted",
					htmlFor: `pull-${ageKey}`,
					children: [
						"Minimum ",
						group === "youtube" ? "publication" : "entry",
						" age (days)",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: `pull-${ageKey}`,
							className: "mt-2",
							type: "number",
							min: 0,
							max: 3650,
							defaultValue: policy.minAgeDays,
							onBlur: (event) => {
								if (event.target.value.trim()) updatePullSettings({ [ageKey]: Number(event.target.value) });
							},
							onKeyDown: (event) => {
								if (event.key === "Enter") event.currentTarget.blur();
							}
						}, policy.minAgeDays)
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs leading-5 text-muted",
				children: "Automatic cleanup runs only after new entries arrive. Failed or duplicate-only pulls remove nothing. Unknown dates stay. This source's budget covers the entire pull, including any slots donated to another enabled source. Partially accepted pages keep their resume position. If too few entries qualify, pulls hold at the cap. An age of 0 allows recent unrated and low-rated entries to rotate; saved-video protections still apply."
			}),
			group === "adult" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: "Automatic Adult discovery also rotates at its catalog target, even when the source entry limit is higher. Manual pulls use the full source limit."
			}),
			group !== "youtube" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: "Entry age uses the provider's publication date when available, otherwise the date the entry was cached."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					className: "h-auto min-h-11 max-w-full whitespace-normal py-2",
					disabled: processing,
					onClick: () => void run(),
					children: [
						"Free up to ",
						policy.batch.toLocaleString(),
						" ",
						label,
						" slots now"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-muted",
					children: [
						(stats?.removedCount ?? 0).toLocaleString(),
						" entries removed",
						stats?.lastAt ? ` · last cleanup: ${new Date(stats.lastAt).toLocaleString()}` : ""
					]
				})]
			}),
			earlierCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-muted",
				children: [
					"Earlier shared cleanup history: ",
					earlierCount.toLocaleString(),
					" removals. New cleanups are counted separately for each source."
				]
			}),
			(error || note) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: error ? "alert" : "status",
				className: "mt-3 text-sm leading-6 text-muted",
				children: error || note
			})
		]
	});
}
/** Local IndexedDB store for 3D print file bytes (viewer only). Metadata stays in localStorage. */
var DB_NAME = "reelcase-prints";
var DB_VERSION = 1;
var STORE = "blobs";
var MAX_BLOBS = 32;
var MAX_BYTES = 50331648;
var MAX_TOTAL_BYTES = 201326592;
function openDb() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error ?? /* @__PURE__ */ new Error("prints IndexedDB open failed"));
	});
}
function printFileId(file) {
	return `print:${file.name.normalize("NFKC").toLowerCase()}:${file.size}:${file.lastModified}`;
}
function isViewablePrintName(name) {
	return /\.(stl|obj|glb|gltf|3mf)$/i.test(name);
}
async function savePrintBlob(file, id = printFileId(file)) {
	if (!isViewablePrintName(file.name)) return null;
	if (file.size <= 0 || file.size > MAX_BYTES) return null;
	const record = {
		id,
		name: file.name,
		path: file.webkitRelativePath || file.name,
		mime: file.type || "application/octet-stream",
		size: file.size,
		addedAt: Date.now(),
		blob: file
	};
	const db = await openDb();
	try {
		await new Promise((resolve, reject) => {
			const tx = db.transaction(STORE, "readwrite");
			tx.objectStore(STORE).put(record);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	} finally {
		db.close();
	}
	await prunePrintBlobs();
	return id;
}
async function loadPrintBlob(id) {
	try {
		const db = await openDb();
		try {
			return await new Promise((resolve, reject) => {
				const req = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
				req.onsuccess = () => resolve(req.result);
				req.onerror = () => reject(req.error);
			});
		} finally {
			db.close();
		}
	} catch {
		return;
	}
}
async function prunePrintBlobs() {
	try {
		const db = await openDb();
		try {
			const ordered = [...await new Promise((resolve, reject) => {
				const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
				req.onsuccess = () => resolve(req.result ?? []);
				req.onerror = () => reject(req.error);
			})].sort((a, b) => a.addedAt - b.addedAt);
			let total = ordered.reduce((sum, row) => sum + (row.size || 0), 0);
			const drop = [];
			while (ordered.length - drop.length > MAX_BLOBS || total > MAX_TOTAL_BYTES) {
				const oldest = ordered[drop.length];
				if (!oldest) break;
				drop.push(oldest);
				total -= oldest.size || 0;
			}
			if (!drop.length) return;
			await new Promise((resolve, reject) => {
				const tx = db.transaction(STORE, "readwrite");
				const store = tx.objectStore(STORE);
				for (const row of drop) store.delete(row.id);
				tx.oncomplete = () => resolve();
				tx.onerror = () => reject(tx.error);
			});
		} finally {
			db.close();
		}
	} catch {}
}
/** Local cache for desktop game icons (data URLs). Kept separate from hub metadata to avoid blowing reelcase.hub.v1. */
var KEY = "reelcase.game-icons.v1";
var MAX_ENTRIES = 100;
var MAX_DATA_URL = 4e5;
function loadGameIconCache() {
	try {
		const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}");
		return raw && typeof raw === "object" ? raw : {};
	} catch {
		return {};
	}
}
function saveGameIcon(path, iconData) {
	if (!path || !iconData || iconData.length > MAX_DATA_URL) return;
	try {
		const all = loadGameIconCache();
		all[path] = iconData;
		const keys = Object.keys(all);
		if (keys.length > MAX_ENTRIES) for (const drop of keys.slice(0, keys.length - MAX_ENTRIES)) delete all[drop];
		localStorage.setItem(KEY, JSON.stringify(all));
	} catch {
		try {
			const all = loadGameIconCache();
			const keys = Object.keys(all);
			for (const drop of keys.slice(0, Math.ceil(keys.length / 2))) delete all[drop];
			all[path] = iconData;
			localStorage.setItem(KEY, JSON.stringify(all));
		} catch {}
	}
}
function readFileAsDataUrl(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result ?? ""));
		reader.onerror = () => reject(reader.error ?? /* @__PURE__ */ new Error("icon read failed"));
		reader.readAsDataURL(file);
	});
}
/** Match launcher files to sibling .ico/.png/.jpg in a folder FileList. */
async function iconsFromFolderFiles(files) {
	const out = /* @__PURE__ */ new Map();
	const byStem = /* @__PURE__ */ new Map();
	const byDirStem = /* @__PURE__ */ new Map();
	for (const file of files) {
		if (!/\.(png|ico|jpe?g|webp)$/i.test(file.name)) continue;
		const rel = (file.webkitRelativePath || file.name).replace(/\\/g, "/");
		const stem = file.name.replace(/\.[^.]+$/, "").toLowerCase();
		const dir = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "";
		byStem.set(stem, file);
		byDirStem.set(`${dir}::${stem}`, file);
		if (/^(icon|game|header|cover|logo)$/i.test(stem)) byDirStem.set(`${dir}::__folder__`, file);
	}
	for (const file of files) {
		if (!/\.(exe|lnk|url|appref-ms)$/i.test(file.name)) continue;
		const rel = (file.webkitRelativePath || file.name).replace(/\\/g, "/");
		const stem = file.name.replace(/\.[^.]+$/, "").toLowerCase();
		const dir = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "";
		const iconFile = byDirStem.get(`${dir}::${stem}`) || byStem.get(stem) || byDirStem.get(`${dir}::__folder__`);
		if (!iconFile || iconFile.size > 12e5) continue;
		try {
			const data = await readFileAsDataUrl(iconFile);
			if (data.startsWith("data:image")) out.set(rel || file.name, data);
		} catch {}
	}
	return out;
}
async function fetchCompanionIcons(paths) {
	const out = /* @__PURE__ */ new Map();
	const pending = paths.filter(Boolean).slice(0, 40);
	if (!pending.length) return out;
	try {
		const result = await (await fetch("http://127.0.0.1:43123/shortcut-icons", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ paths: pending })
		})).json();
		if (!result.ok || !result.icons) return out;
		for (const row of result.icons) if (row.iconData?.startsWith("data:image")) {
			out.set(row.path, row.iconData);
			saveGameIcon(row.path, row.iconData);
		}
	} catch {}
	return out;
}
/**
* Full-mesh WebRTC rooms: one RTCPeerConnection per remote peer, signaled
* through /api/rtc (see signaling.server.ts), game data flowing directly
* browser-to-browser afterwards. Client-authoritative by construction — see
* the multiplayer-p2p skill for when NOT to use this.
*
* Negotiation follows the "perfect negotiation" pattern: on a glare (both
* sides offering at once) the polite peer — the lexicographically smaller id —
* rolls back and accepts, so pairs converge without wedging.
*/
var FAST_POLL_MS = 400;
var IDLE_POLL_MS = 2e3;
var PING_INTERVAL_MS = 2e3;
var STALL_MS = 1e4;
var MAX_RECOVERY_ATTEMPTS = 3;
var SIGNAL_RETRY_DELAYS_MS = [250, 750];
function defaultIceServers() {
	return [{ urls: ["stun:stun.l.google.com:19302", "stun:stun.cloudflare.com:3478"] }];
}
var P2PRoom = class {
	opts;
	peers = /* @__PURE__ */ new Map();
	/** Per-remote-peer signal delivery chains (order-preserving). */
	signalQueues = /* @__PURE__ */ new Map();
	cursor = 0;
	pollTimer = null;
	stopPing = null;
	closed = false;
	mediaStream = null;
	everPolled = false;
	lastPeersFingerprint = "";
	lastRosterCount = -1;
	/** Same-origin tabs get a zero-config reliable fallback while WebRTC negotiates. */
	localRelay = null;
	onPageHide = () => {
		if (this.closed) return;
		const body = JSON.stringify({
			op: "leave",
			room: this.opts.room,
			peer: this.opts.selfId
		});
		navigator.sendBeacon?.("/api/rtc", new Blob([body], { type: "application/json" }));
	};
	debug(event) {
		this.opts.onDebug?.(`${(/* @__PURE__ */ new Date()).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit"
		})} · ${event}`);
	}
	constructor(opts) {
		this.opts = opts;
	}
	/**
	* The first poll IS the join: it registers this peer and returns the
	* roster. A failed first poll (cold DB, offline tab) must not strand the
	* room: the loop and timers start regardless and the next poll retries.
	*/
	async join() {
		window.addEventListener("pagehide", this.onPageHide);
		if (typeof BroadcastChannel !== "undefined" && this.opts.iceTransportPolicy !== "relay") {
			this.localRelay = new BroadcastChannel(`reelcase-watch:${this.opts.room}`);
			this.localRelay.onmessage = (event) => {
				const message = event.data;
				if (!message || message.from === this.opts.selfId || message.to && message.to !== this.opts.selfId) return;
				this.debug("Local tab relay delivered a room message");
				this.opts.onMessage?.(message.from ?? "local-guest", message.data, "reliable");
			};
			this.debug("Local tab relay ready");
		}
		try {
			await this.pollOnce();
			this.debug("Signaling registered");
		} catch {
			this.debug("Signaling retry scheduled");
		}
		if (this.closed) return;
		this.schedulePoll(this.anyPairConnecting() ? FAST_POLL_MS : IDLE_POLL_MS);
		this.stopPing = registerPeriodicTask({
			name: "Room transport health",
			mode: "always",
			background: false,
			everyMs: PING_INTERVAL_MS,
			work: () => {
				this.pingAll();
				this.watchdog();
			}
		}).cancel;
	}
	close() {
		this.closed = true;
		window.removeEventListener("pagehide", this.onPageHide);
		if (this.pollTimer) clearTimeout(this.pollTimer);
		this.stopPing?.();
		this.stopPing = null;
		this.localRelay?.close();
		this.localRelay = null;
		for (const slot of this.peers.values()) slot.pc.close();
		this.peers.clear();
		this.mediaStream = null;
		fetch("/api/rtc", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				op: "leave",
				room: this.opts.room,
				peer: this.opts.selfId
			}),
			keepalive: true
		}).catch(() => {});
	}
	/** Send on the unreliable game-state channel (drops stale packets). */
	broadcast(data) {
		const wire = JSON.stringify({
			t: "d",
			d: data
		});
		for (const slot of this.peers.values()) if (slot.state?.readyState === "open") slot.state.send(wire);
	}
	/** Send reliably (ordered) to one peer, or to all when peerId is omitted. */
	send(data, peerId) {
		const wire = JSON.stringify({
			t: "d",
			d: data
		});
		const targets = peerId ? [this.peers.get(peerId)] : [...this.peers.values()];
		let delivered = false;
		for (const slot of targets) {
			if (slot?.reliable?.readyState === "open") delivered = true;
			if (slot?.reliable?.readyState === "open") slot.reliable.send(wire);
		}
		if (!delivered) this.localRelay?.postMessage({
			from: this.opts.selfId,
			to: peerId,
			data
		});
	}
	peerList() {
		return [...this.peers.values()].map((s) => ({ ...s.info }));
	}
	/** Replace the local-player stream for existing and subsequently joined peers. */
	setMediaStream(stream) {
		if (this.closed) return;
		this.mediaStream = stream;
		for (const slot of this.peers.values()) this.attachMedia(slot);
	}
	attachMedia(slot) {
		const tracks = this.mediaStream?.getTracks().filter((track) => track.readyState === "live") ?? [];
		for (const sender of slot.pc.getSenders()) if (sender.track && !tracks.includes(sender.track)) slot.pc.removeTrack(sender);
		for (const track of tracks) {
			if (slot.pc.getSenders().some((sender) => sender.track === track)) continue;
			const sender = slot.pc.addTrack(track, this.mediaStream);
			if (track.kind === "video") {
				const parameters = sender.getParameters();
				parameters.encodings = parameters.encodings?.length ? parameters.encodings : [{}];
				parameters.encodings[0].maxBitrate = 25e5;
				sender.setParameters(parameters).catch(() => {});
			}
		}
	}
	schedulePoll(delay) {
		if (this.closed) return;
		if (this.pollTimer) clearTimeout(this.pollTimer);
		this.pollTimer = setTimeout(() => void this.poll(), delay);
	}
	anyPairConnecting() {
		for (const s of this.peers.values()) {
			if (s.terminal) continue;
			if (s.info.connectionState !== "connected") return true;
		}
		return false;
	}
	async pollOnce() {
		const params = new URLSearchParams({
			room: this.opts.room,
			peer: this.opts.selfId,
			name: this.opts.name ?? "",
			since: String(this.cursor)
		});
		const res = await fetch(`/api/rtc?${params}`);
		if (this.closed) return;
		if (!res.ok) throw new Error(`signaling poll failed: ${res.status}`);
		const body = await res.json();
		if (this.closed) return;
		if (!this.everPolled) {
			this.everPolled = true;
			this.opts.onConnected?.();
		}
		this.reconcileRoster(body.peers);
		const otherPeers = Math.max(0, body.peers.length - 1);
		if (otherPeers !== this.lastRosterCount) {
			this.lastRosterCount = otherPeers;
			this.debug(`Roster visible: ${otherPeers} other peer${otherPeers === 1 ? "" : "s"}`);
		}
		const roster = new Set(body.peers.map((p) => p.id));
		for (const sig of body.signals) {
			this.cursor = Math.max(this.cursor, sig.id);
			await this.onSignal(sig.from, sig.kind, sig.payload, roster);
			if (this.closed) return;
		}
	}
	async poll() {
		if (this.closed) return;
		try {
			await this.pollOnce();
		} catch {}
		this.schedulePoll(this.anyPairConnecting() ? FAST_POLL_MS : IDLE_POLL_MS);
	}
	reconcileRoster(peers) {
		const alive = new Set(peers.map((p) => p.id));
		for (const p of peers) {
			if (p.id === this.opts.selfId) continue;
			const existing = this.peers.get(p.id);
			if (existing) existing.info.name = p.name;
			else this.connectTo(p.id, p.name, this.opts.selfId > p.id);
		}
		for (const [id, slot] of this.peers) if (!alive.has(id)) {
			slot.pc.close();
			this.peers.delete(id);
		}
		this.emitPeers();
	}
	connectTo(peerId, name, initiator) {
		if (this.closed) return null;
		const pc = new RTCPeerConnection({
			iceTransportPolicy: this.opts.iceTransportPolicy ?? "all",
			iceServers: this.opts.iceServers ?? defaultIceServers()
		});
		const slot = {
			pc,
			makingOffer: false,
			ignoreOffer: false,
			pendingCandidates: [],
			lastProgressAt: Date.now(),
			recoveryAttempts: 0,
			info: {
				id: peerId,
				name,
				connectionState: pc.connectionState,
				candidateType: null,
				rttMs: null
			}
		};
		this.peers.set(peerId, slot);
		pc.onicecandidate = (e) => {
			if (e.candidate) this.sendSignal(peerId, "ice", e.candidate.toJSON());
		};
		pc.onconnectionstatechange = () => {
			slot.info.connectionState = pc.connectionState;
			if (pc.connectionState === "connecting" || pc.connectionState === "connected") slot.lastProgressAt = Date.now();
			if (pc.connectionState === "connected") {
				slot.recoveryAttempts = 0;
				slot.terminal = false;
				this.readCandidateType(slot);
			}
			this.emitPeers();
			if (pc.connectionState === "failed") pc.restartIce();
			if (pc.connectionState === "failed" || pc.connectionState === "disconnected") this.schedulePoll(FAST_POLL_MS);
		};
		pc.onnegotiationneeded = async () => {
			try {
				slot.makingOffer = true;
				await pc.setLocalDescription();
				await this.sendSignal(peerId, "offer", pc.localDescription.toJSON());
			} catch {} finally {
				slot.makingOffer = false;
			}
		};
		pc.ondatachannel = (e) => this.attachChannel(slot, e.channel);
		pc.ontrack = (event) => {
			const stream = event.streams[0];
			if (stream) this.opts.onMediaStream?.(peerId, stream);
		};
		this.attachMedia(slot);
		if (initiator) {
			this.debug(`Negotiating peer channel with ${name || "guest"}`);
			this.attachChannel(slot, pc.createDataChannel("state", {
				ordered: false,
				maxRetransmits: 0
			}));
			this.attachChannel(slot, pc.createDataChannel("reliable", { ordered: true }));
		}
		return slot;
	}
	attachChannel(slot, channel) {
		if (channel.label === "state") slot.state = channel;
		else slot.reliable = channel;
		channel.onopen = () => {
			slot.lastProgressAt = Date.now();
			this.debug(`Peer ${channel.label} channel open with ${slot.info.name || "guest"}`);
			if (channel.label === "reliable") this.opts.onPeerReady?.(slot.info.id);
		};
		channel.onmessage = (e) => {
			let msg;
			try {
				msg = JSON.parse(e.data);
			} catch {
				return;
			}
			if (msg.t === "ping") {
				if (slot.state?.readyState === "open") slot.state.send(JSON.stringify({ t: "pong" }));
			} else if (msg.t === "pong") {
				if (slot.pingSentAt) {
					slot.info.rttMs = Math.round(performance.now() - slot.pingSentAt);
					slot.pingSentAt = void 0;
					this.emitPeers();
				}
			} else this.opts.onMessage?.(slot.info.id, msg.d, channel.label === "state" ? "state" : "reliable");
		};
	}
	/** Apply buffered ICE candidates once a remote description is in place. */
	async flushPendingCandidates(slot) {
		while (slot.pendingCandidates.length > 0) {
			const candidate = slot.pendingCandidates.shift();
			try {
				await slot.pc.addIceCandidate(candidate);
			} catch (err) {
				if (!slot.ignoreOffer) console.warn("[p2p] addIceCandidate failed:", err);
			}
			if (this.closed) return;
		}
	}
	async onSignal(from, kind, payload, roster) {
		if (this.closed) return;
		let slot = this.peers.get(from);
		if (!slot) {
			if (!roster.has(from)) return;
			const created = this.connectTo(from, "", false);
			if (!created) return;
			slot = created;
		}
		const polite = this.opts.selfId < from;
		try {
			if (kind === "offer" || kind === "answer") {
				const description = payload;
				const collision = kind === "offer" && (slot.makingOffer || slot.pc.signalingState !== "stable");
				slot.ignoreOffer = !polite && collision;
				if (slot.ignoreOffer) return;
				try {
					await slot.pc.setRemoteDescription(description);
				} catch (err) {
					if (kind !== "offer" || slot.recreatedForOffer) throw err;
					const attempts = slot.recoveryAttempts;
					const name = slot.info.name;
					slot.pc.close();
					this.peers.delete(from);
					const fresh = this.connectTo(from, name, false);
					if (!fresh) return;
					fresh.recoveryAttempts = attempts;
					fresh.recreatedForOffer = true;
					slot = fresh;
					await slot.pc.setRemoteDescription(description);
				}
				if (this.closed) return;
				await this.flushPendingCandidates(slot);
				if (this.closed) return;
				if (kind === "offer") {
					await slot.pc.setLocalDescription();
					if (this.closed) return;
					await this.sendSignal(from, "answer", slot.pc.localDescription.toJSON());
				}
			} else if (kind === "ice") {
				const candidate = payload;
				if (!slot.pc.remoteDescription) {
					slot.pendingCandidates.push(candidate);
					return;
				}
				try {
					await slot.pc.addIceCandidate(candidate);
				} catch (err) {
					if (!slot.ignoreOffer) console.warn("[p2p] addIceCandidate failed:", err);
				}
			}
		} catch {}
	}
	/**
	* Signals are serialized per remote peer (a candidate must never overtake
	* its SDP into the DB) and retried on failure with short backoff.
	*/
	sendSignal(to, kind, payload) {
		const next = (this.signalQueues.get(to) ?? Promise.resolve()).then(() => this.postSignal(to, kind, payload));
		this.signalQueues.set(to, next.catch(() => {}));
		return next;
	}
	async postSignal(to, kind, payload) {
		for (let attempt = 0;; attempt++) {
			if (this.closed) return;
			try {
				const res = await fetch("/api/rtc", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						op: "signal",
						room: this.opts.room,
						from: this.opts.selfId,
						to,
						kind,
						payload
					})
				});
				if (res.ok) return;
				throw new Error(`signal POST failed: ${res.status}`);
			} catch (err) {
				if (attempt >= SIGNAL_RETRY_DELAYS_MS.length) {
					console.warn(`[p2p] signal ${kind} to ${to} failed after retries`, err);
					this.debug(`Could not deliver ${kind} signal`);
					return;
				}
				await new Promise((r) => setTimeout(r, SIGNAL_RETRY_DELAYS_MS[attempt]));
			}
		}
	}
	pingAll() {
		const wire = JSON.stringify({ t: "ping" });
		for (const slot of this.peers.values()) {
			if (slot.state?.readyState !== "open") continue;
			const stale = slot.pingSentAt !== void 0 && performance.now() - slot.pingSentAt > 2 * PING_INTERVAL_MS;
			if (slot.pingSentAt === void 0 || stale) {
				slot.pingSentAt = performance.now();
				slot.state.send(wire);
			}
			if (!slot.info.candidateType && slot.pc.connectionState === "connected") this.readCandidateType(slot);
		}
	}
	/**
	* Stuck-pair recovery, piggybacked on the ping interval. A pair that has
	* made no progress for STALL_MS gets rebuilt by the dialer with a FRESH
	* RTCPeerConnection (new DTLS identity — fixes the suspend/resume
	* fingerprint wedge). After MAX_RECOVERY_ATTEMPTS the pair is terminal:
	* visible to the app as its last connectionState, ignored by fast-poll.
	*/
	watchdog() {
		if (this.closed) return;
		const now = Date.now();
		for (const [peerId, slot] of this.peers) {
			const live = slot.pc.connectionState;
			if (live !== slot.info.connectionState) {
				slot.info.connectionState = live;
				if (live === "connecting" || live === "connected") slot.lastProgressAt = now;
				this.emitPeers();
			}
			if (slot.terminal || live === "connected") continue;
			if (now - slot.lastProgressAt <= STALL_MS) continue;
			if (slot.recoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
				slot.terminal = true;
				this.emitPeers();
				continue;
			}
			slot.recoveryAttempts += 1;
			slot.lastProgressAt = now;
			if (this.opts.selfId > peerId) {
				const { name } = slot.info;
				const attempts = slot.recoveryAttempts;
				slot.pc.close();
				this.peers.delete(peerId);
				const fresh = this.connectTo(peerId, name, true);
				if (fresh) fresh.recoveryAttempts = attempts;
				this.schedulePoll(FAST_POLL_MS);
			}
		}
	}
	async readCandidateType(slot) {
		try {
			const stats = await slot.pc.getStats();
			let selected;
			let selectedPairId;
			stats.forEach((s) => {
				if (s.type === "transport") selectedPairId = s.selectedCandidatePairId;
			});
			if (selectedPairId) selected = stats.get(selectedPairId);
			if (!selected) stats.forEach((s) => {
				if (s.type === "candidate-pair" && s.nominated && s.state === "succeeded") selected = s;
			});
			const localId = selected?.localCandidateId;
			if (localId && this.peers.get(slot.info.id) === slot) {
				const local = stats.get(localId);
				slot.info.candidateType = local?.candidateType ?? null;
				this.emitPeers();
			}
		} catch {}
	}
	emitPeers() {
		const list = this.peerList();
		const fingerprint = JSON.stringify(list.map((p) => [
			p.id,
			p.name,
			p.connectionState,
			p.candidateType,
			p.rttMs
		]));
		if (fingerprint === this.lastPeersFingerprint) return;
		this.lastPeersFingerprint = fingerprint;
		this.opts.onPeersChanged?.(list);
	}
};
function useP2PRoom(room, name, relay) {
	const [selfId] = (0, import_react.useState)(() => createShortLocalId("p-"));
	const [peers, setPeers] = (0, import_react.useState)([]);
	const [joined, setJoined] = (0, import_react.useState)(false);
	const [events, setEvents] = (0, import_react.useState)([]);
	const [mediaStreams, setMediaStreams] = (0, import_react.useState)({});
	const [readyRevision, setReadyRevision] = (0, import_react.useState)(0);
	const outboundMedia = (0, import_react.useRef)(null);
	const ref = (0, import_react.useRef)(null);
	const listeners = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		setMediaStreams({});
		if (!room.trim()) {
			setJoined(false);
			setPeers([]);
			setEvents([]);
			ref.current = null;
			return;
		}
		setEvents(["Preparing room connection…"]);
		setJoined(false);
		setPeers([]);
		const p2p = new P2PRoom({
			room,
			selfId,
			name,
			iceServers: relay ? [...defaultIceServers(), ...relay.iceServers] : void 0,
			iceTransportPolicy: relay?.iceTransportPolicy,
			onPeersChanged: (next) => {
				setPeers(next);
				setMediaStreams((current) => Object.fromEntries(Object.entries(current).filter(([id]) => next.some((peer) => peer.id === id))));
			},
			onMediaStream: (from, stream) => setMediaStreams((current) => ({
				...current,
				[from]: stream
			})),
			onPeerReady: () => setReadyRevision((value) => value + 1),
			onConnected: () => setJoined(true),
			onDebug: (event) => setEvents((items) => [event, ...items].slice(0, 16)),
			onMessage: (from, data, channel) => listeners.current.forEach((fn) => fn(from, data, channel))
		});
		p2p.setMediaStream(outboundMedia.current);
		ref.current = p2p;
		p2p.join();
		return () => {
			ref.current = null;
			p2p.close();
		};
	}, [
		room,
		selfId,
		name,
		relay
	]);
	const send = (0, import_react.useCallback)((data, peer) => ref.current?.send(data, peer), []);
	const setMediaStream = (0, import_react.useCallback)((stream) => {
		outboundMedia.current = stream;
		ref.current?.setMediaStream(stream);
	}, []);
	return {
		selfId,
		peers,
		joined,
		events,
		send,
		onMessage: (0, import_react.useCallback)((fn) => {
			listeners.current.add(fn);
			return () => {
				listeners.current.delete(fn);
			};
		}, []),
		mediaStreams,
		setMediaStream,
		readyRevision
	};
}
/** The provider epoch already includes the starting position; do not add it again. */
function estimatedProviderPosition(lastPosition, playbackPosition, startedAt, now) {
	const elapsedPosition = startedAt === null ? 0 : Math.max(0, (now - startedAt) / 1e3);
	return Math.max(0, lastPosition, playbackPosition, elapsedPosition);
}
/** Keep a seek inside a known VOD; unknown and live streams retain a safety cap. */
function clampRoomPosition(seconds, duration) {
	return Math.max(0, Math.min(typeof duration === "number" && Number.isFinite(duration) && duration > 0 ? Math.min(duration, 43200) : 43200, Number.isFinite(seconds) ? seconds : 0));
}
/** Guest adjustments are device-local seconds, bounded and snapped to 250 ms. */
function normalizeGuestOffset(seconds) {
	return Math.round(Math.max(-30, Math.min(30, Number.isFinite(seconds) ? seconds : 0)) * 4) / 4;
}
function guestPlaybackPosition(hostPosition, offset, duration) {
	return clampRoomPosition(hostPosition + normalizeGuestOffset(offset), duration);
}
/** Provider controls report the adjusted device clock; room requests must not. */
function hostPlaybackPosition(devicePosition, offset, duration) {
	return clampRoomPosition(devicePosition - normalizeGuestOffset(offset), duration);
}
var PROVIDER_HOSTS = {
	youtube: /* @__PURE__ */ new Set([
		"youtube.com",
		"www.youtube.com",
		"m.youtube.com",
		"music.youtube.com",
		"youtube-nocookie.com",
		"www.youtube-nocookie.com",
		"youtu.be"
	]),
	twitch: /* @__PURE__ */ new Set([
		"twitch.tv",
		"www.twitch.tv",
		"m.twitch.tv",
		"player.twitch.tv",
		"clips.twitch.tv"
	])
};
function safeProviderUrl(value, kind) {
	if (typeof value !== "string" || value.length > 2048) return void 0;
	try {
		const url = new URL(value);
		return url.protocol === "https:" && PROVIDER_HOSTS[kind].has(url.hostname.toLowerCase()) ? url.toString() : void 0;
	} catch {
		return;
	}
}
function safePoster(value) {
	if (typeof value !== "string" || value.length > 2048) return void 0;
	try {
		const url = new URL(value);
		return url.protocol === "https:" && /(^|\.)(ytimg\.com|jtvnw\.net|ttvnw\.net)$/.test(url.hostname) ? url.toString() : void 0;
	} catch {
		return;
	}
}
/** Older cached cards may have only a public watch URL or provider ID.
* Rebuild provider routes so a room does not depend on another device's cache. */
function providerFields(kind, item) {
	const urls = [safeProviderUrl(item.embedUrl, kind), safeProviderUrl(item.watchUrl, kind)].filter((value) => Boolean(value)).map((value) => new URL(value));
	const identifier = typeof item.videoId === "string" && /^[a-zA-Z0-9_-]{1,160}$/.test(item.videoId) ? item.videoId : void 0;
	if (kind === "youtube") {
		const videoId = urls.map((url) => url.searchParams.get("v") || url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/)?.[1] || (url.hostname === "youtu.be" ? url.pathname.slice(1).split("/")[0] : void 0)).find((id) => id && /^[\w-]{1,160}$/.test(id)) ?? identifier;
		if (!videoId) return null;
		return {
			videoId,
			embedUrl: `https://www.youtube.com/embed/${videoId}`,
			watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
			live: Boolean(item.live)
		};
	}
	const clip = urls.map((url) => url.searchParams.get("clip") || url.pathname.match(/\/clip\/([\w-]+)/)?.[1] || (url.hostname === "clips.twitch.tv" && url.pathname !== "/embed" ? url.pathname.slice(1) : void 0)).find((id) => id && /^[\w-]{1,160}$/.test(id));
	const vod = urls.map((url) => url.searchParams.get("video")?.replace(/^v/, "") || url.pathname.match(/^\/videos\/(\d+)/)?.[1]).find((id) => id && /^\d+$/.test(id)) ?? (identifier && /^v?\d+$/.test(identifier) ? identifier.replace(/^v/, "") : void 0);
	const channel = urls.map((url) => url.searchParams.get("channel") || (/^(?:www\.|m\.)?twitch\.tv$/.test(url.hostname) && !/^\/(?:videos|directory|clip)\b/.test(url.pathname) ? url.pathname.split("/")[1] : void 0)).find((id) => id && /^[\w]{1,25}$/.test(id)) ?? (item.live && typeof item.channelName === "string" && /^[\w]{1,25}$/.test(item.channelName) ? item.channelName : void 0);
	if (item.live && channel || !clip && !vod && channel) return {
		live: true,
		channelName: channel,
		embedUrl: `https://player.twitch.tv/?channel=${channel}`,
		watchUrl: `https://www.twitch.tv/${channel}`
	};
	if (clip || identifier && !vod && !item.live) {
		const videoId = clip ?? identifier;
		return {
			live: false,
			videoId,
			embedUrl: `https://clips.twitch.tv/embed?clip=${videoId}`,
			watchUrl: `https://clips.twitch.tv/${videoId}`
		};
	}
	return vod ? {
		live: false,
		videoId: vod,
		embedUrl: `https://player.twitch.tv/?video=v${vod}`,
		watchUrl: `https://www.twitch.tv/videos/${vod}`
	} : null;
}
function normalizeRoomVideo(video) {
	if (!video.remote || !["youtube", "twitch"].includes(video.remote.kind)) return video;
	const fields = providerFields(video.remote.kind, video.remote);
	return fields ? {
		...video,
		remote: {
			...video.remote,
			...fields
		}
	} : video;
}
/** Catalog IDs differ between devices; provider identity describes the actual title. */
function roomMediaKey(video) {
	if (!video.remote) return `local:${video.id}`;
	const kind = video.remote.kind;
	if (kind !== "youtube" && kind !== "twitch") return `entry:${video.id}`;
	const fields = providerFields(kind, video.remote);
	if (!fields) return `entry:${video.id}`;
	if (kind === "youtube") return `youtube:${fields.videoId}`;
	if (fields.live) return `twitch:live:${fields.channelName?.toLowerCase()}`;
	return `${fields.embedUrl.includes("clips.twitch.tv") ? "twitch:clip" : "twitch:vod"}:${fields.videoId}`;
}
function roomVideoFromUrl(value) {
	const input = value.trim();
	let publicUrl;
	try {
		const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
		if (!["http:", "https:"].includes(url.protocol)) return null;
		url.protocol = "https:";
		publicUrl = url.toString();
	} catch {
		return null;
	}
	for (const kind of ["youtube", "twitch"]) {
		const watchUrl = safeProviderUrl(publicUrl, kind);
		if (!watchUrl) continue;
		const fields = providerFields(kind, { watchUrl });
		if (!fields) continue;
		const key = "videoId" in fields ? fields.videoId : fields.channelName;
		return resolveRoomMedia({
			id: `room:${kind}:${key}`,
			name: `${kind === "youtube" ? "YouTube" : "Twitch"} · ${key}`,
			kind,
			...fields
		})?.video ?? null;
	}
	return null;
}
/** Bounded paste parsing never reads a catalog or fetches provider data. */
function parseRoomLinks(value) {
	const input = value.slice(0, 32768);
	const rows = input.split(/\r?\n/).map((row) => row.trim()).filter(Boolean);
	const videos = [];
	const seen = /* @__PURE__ */ new Set();
	let invalid = 0, duplicates = 0;
	for (const row of rows.slice(0, 48)) {
		const video = roomVideoFromUrl(row);
		if (!video) {
			invalid++;
			continue;
		}
		const key = roomMediaKey(video);
		if (seen.has(key)) {
			duplicates++;
			continue;
		}
		seen.add(key);
		videos.push(video);
	}
	return {
		videos,
		invalid,
		duplicates,
		truncated: rows.length > 48 || input.length < value.length
	};
}
/** Small, provider-only metadata lets a guest play a title without its own follows/catalog. */
function describeRoomMedia(video, local) {
	if (!video) return local ? {
		id: `local:${local.fingerprint}`,
		name: local.name.slice(0, 300),
		kind: "local",
		local
	} : null;
	if (video.id.startsWith("local:") && local?.fingerprint === video.id.slice(6)) return {
		id: video.id,
		name: local.name.slice(0, 300),
		kind: "local",
		local
	};
	const remote = video.remote;
	const kind = remote?.kind;
	if (!remote || kind !== "youtube" && kind !== "twitch") {
		if (!remote && local) return {
			id: `local:${local.fingerprint}`,
			name: local.name.slice(0, 300),
			kind: "local",
			local
		};
		return !remote ? {
			id: video.id,
			name: video.name.slice(0, 300),
			kind: "local",
			duration: video.duration,
			size: video.size
		} : null;
	}
	const fields = providerFields(kind, remote);
	if (!fields) return null;
	return {
		id: video.id.slice(0, 300),
		name: video.name.slice(0, 300),
		kind,
		videoId: typeof remote.videoId === "string" ? remote.videoId.slice(0, 160) : void 0,
		channelId: typeof remote.channelId === "string" ? remote.channelId.slice(0, 160) : void 0,
		channelName: typeof remote.channelName === "string" ? remote.channelName.slice(0, 200) : void 0,
		...fields,
		poster: safePoster(video.poster),
		duration: typeof video.duration === "number" && Number.isFinite(video.duration) && video.duration > 0 ? video.duration : void 0
	};
}
/** Validate a peer-supplied descriptor before using it as an iframe source. */
function resolveRoomMedia(value) {
	if (!value || typeof value !== "object") return null;
	const item = value;
	if (typeof item.id !== "string" || !item.id || typeof item.name !== "string" || !item.name) return null;
	if (item.kind === "local") {
		const local = item.local;
		if (item.id.length > 600 || local && (typeof local.name !== "string" || typeof local.fingerprint !== "string" || !local.fingerprint || local.fingerprint.length > 500 || item.id !== `local:${local.fingerprint}` || !Number.isFinite(local.size) || !Number.isFinite(local.modified))) return null;
		const descriptor = {
			id: item.id,
			name: item.name.slice(0, 300),
			kind: "local",
			size: typeof item.size === "number" && Number.isSafeInteger(item.size) && item.size >= 0 ? item.size : void 0,
			streamId: typeof item.streamId === "string" && item.streamId.length <= 160 ? item.streamId : void 0,
			duration: typeof item.duration === "number" && Number.isFinite(item.duration) && item.duration > 0 ? item.duration : void 0,
			local: local ? {
				name: local.name.slice(0, 300),
				fingerprint: local.fingerprint,
				size: Math.max(0, local.size),
				modified: Math.max(0, local.modified)
			} : void 0
		};
		return {
			descriptor,
			video: {
				id: descriptor.id,
				name: descriptor.name,
				folderId: "room:local",
				path: "",
				mime: "video/mp4",
				extension: "mp4",
				size: local?.size ?? descriptor.size ?? 0,
				duration: descriptor.duration,
				addedAt: 0
			}
		};
	}
	if (item.kind !== "youtube" && item.kind !== "twitch") return null;
	const kind = item.kind;
	if (item.embedUrl && !safeProviderUrl(item.embedUrl, kind) || item.watchUrl && !safeProviderUrl(item.watchUrl, kind)) return null;
	const fields = providerFields(kind, item);
	if (!fields) return null;
	const descriptor = {
		id: item.id.slice(0, 300),
		name: item.name.slice(0, 300),
		kind,
		videoId: typeof item.videoId === "string" ? item.videoId.slice(0, 160) : void 0,
		channelId: typeof item.channelId === "string" ? item.channelId.slice(0, 160) : void 0,
		channelName: typeof item.channelName === "string" ? item.channelName.slice(0, 200) : void 0,
		...fields,
		poster: safePoster(item.poster),
		duration: typeof item.duration === "number" && Number.isFinite(item.duration) && item.duration > 0 ? item.duration : void 0
	};
	const remote = {
		kind,
		videoId: descriptor.videoId,
		channelId: descriptor.channelId,
		channelName: descriptor.channelName,
		live: descriptor.live,
		embedUrl: descriptor.embedUrl,
		watchUrl: descriptor.watchUrl
	};
	return {
		descriptor,
		video: {
			id: descriptor.id,
			folderId: `room:${kind}`,
			path: descriptor.id,
			name: descriptor.name,
			extension: kind === "youtube" ? "yt" : "twitch",
			mime: `video/${kind}`,
			size: 0,
			duration: descriptor.duration,
			addedAt: 0,
			poster: descriptor.poster,
			remote
		}
	};
}
/** A device's catalog ID is not proof of media identity. Resolve public titles
* by provider key, and only accept local requests matching host metadata. */
function resolveRoomRequest(id, value, lookup, activeIds) {
	const resolved = resolveRoomMedia(value);
	if (!resolved?.video || resolved.descriptor.id !== id) return void 0;
	const known = lookup(id);
	if (!resolved.video.remote) {
		if (!known || known.remote || known.name.slice(0, 300) !== resolved.video.name || known.size !== resolved.video.size) return void 0;
		return known;
	}
	const key = roomMediaKey(resolved.video);
	if (known?.remote && roomMediaKey(known) === key) return known;
	for (const activeId of activeIds.slice(0, 49)) {
		const active = lookup(activeId);
		if (active?.remote && roomMediaKey(active) === key) return active;
	}
	if (!known) return resolved.video;
	const canonicalId = `room:${key}`;
	const canonical = lookup(canonicalId);
	if (canonical) return canonical.remote && roomMediaKey(canonical) === key ? canonical : void 0;
	return {
		...resolved.video,
		id: canonicalId,
		path: canonicalId
	};
}
/** Room metadata is session-only and bounded to the current title plus its queue. */
function mergeRoomMedia(current, values, ids) {
	const next = { ...current };
	for (const value of values.slice(0, 49)) {
		const resolved = resolveRoomMedia(value);
		if (resolved?.video && JSON.stringify(current[resolved.descriptor.id]) !== JSON.stringify(resolved.video)) next[resolved.descriptor.id] = resolved.video;
	}
	const bounded = Object.fromEntries([...new Set(ids)].slice(0, 49).flatMap((id) => next[id] ? [[id, next[id]]] : []));
	return Object.keys(current).length === Object.keys(bounded).length && Object.entries(bounded).every(([id, video]) => current[id] === video) ? current : bounded;
}
function normalizeRoomQueue(value) {
	if (!Array.isArray(value)) return [];
	return [...new Set(value.filter((id) => typeof id === "string" && id.trim().length > 0 && id.length <= 600).map((id) => id.trim()))].slice(0, 48);
}
function distinctRoomQueue(ids, mediaKey, currentKey) {
	const seen = new Set(currentKey ? [currentKey] : []);
	return normalizeRoomQueue(ids).filter((id) => {
		const key = mediaKey(id);
		if (!key || seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}
function parseRoomQueueAction(value) {
	if (!value || typeof value !== "object") return null;
	const item = value;
	if (![
		"add",
		"remove",
		"move",
		"next",
		"up",
		"down"
	].includes(item.kind ?? "") || typeof item.id !== "string" || !item.id.trim() || item.id.length > 600) return null;
	if (item.before !== void 0 && (typeof item.before !== "string" || item.before.length > 600)) return null;
	return {
		kind: item.kind,
		id: item.id.trim(),
		before: item.before?.trim() || void 0
	};
}
/** Apply a single intention to the latest host order. Concurrent guest edits
* cannot overwrite unrelated additions with an older whole-queue snapshot. */
function applyRoomQueueAction(current, action) {
	const rows = normalizeRoomQueue(current);
	if (action.kind === "remove") return rows.filter((id) => id !== action.id);
	if (action.kind === "up" || action.kind === "down") {
		const index = rows.indexOf(action.id);
		const destination = index + (action.kind === "up" ? -1 : 1);
		if (index < 0 || destination < 0 || destination >= rows.length) return rows;
		[rows[index], rows[destination]] = [rows[destination], rows[index]];
		return rows;
	}
	if (action.kind === "next") {
		if (!rows.includes(action.id) && rows.length >= 48) return rows;
		return [action.id, ...rows.filter((id) => id !== action.id)];
	}
	if (action.kind === "move" && !rows.includes(action.id)) return rows;
	if (action.kind === "add" && rows.includes(action.id)) return rows;
	if (action.kind === "add" && rows.length >= 48) return rows;
	if (action.before === action.id) return rows;
	const next = rows.filter((id) => id !== action.id);
	const position = action.before ? next.indexOf(action.before) : -1;
	next.splice(position < 0 ? next.length : position, 0, action.id);
	return next;
}
/** Shuffle the host's current bounded order, preserving every title once. */
function shuffleRoomQueue(current, random = Math.random) {
	const rows = normalizeRoomQueue(current);
	const original = [...rows];
	for (let i = rows.length - 1; i > 0; i--) {
		const draw = random();
		const j = Math.floor(Math.max(0, Math.min(.999999999999, Number.isFinite(draw) ? draw : 0)) * (i + 1));
		[rows[i], rows[j]] = [rows[j], rows[i]];
	}
	if (rows.length > 1 && rows.every((id, i) => id === original[i])) rows.push(rows.shift());
	return rows;
}
/** A loopback URL opens only on the device that created it. */
function shareableRoomInvite(origin, pathname, room) {
	try {
		const url = new URL(pathname, origin);
		if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || /^(?:localhost|.*\.localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0|\[?::1\]?)$/i.test(url.hostname) || !/^RC[A-Z0-9]{4,12}$/.test(room)) return null;
		url.search = "";
		url.hash = "";
		url.searchParams.set("room", room);
		url.searchParams.set("theater", "1");
		return url.toString();
	} catch {
		return null;
	}
}
function useRoomInvitation(room) {
	const current = window.location.origin;
	const reachable = Boolean(shareableRoomInvite(current, window.location.pathname, room));
	const [origin, setOrigin] = (0, import_react.useState)(() => reachable ? current : localStorage.getItem("reelcase.watch-room.invite-origin.v1") ?? "");
	const [origins, setOrigins] = (0, import_react.useState)([]);
	const [checking, setChecking] = (0, import_react.useState)(!reachable);
	(0, import_react.useEffect)(() => {
		if (reachable) return;
		const controller = new AbortController();
		fetch("/api/lan-origin", { signal: controller.signal }).then((response) => response.ok ? response.json() : { origins: [] }).then((data) => {
			if (controller.signal.aborted) return;
			const rows = (Array.isArray(data.origins) ? data.origins : []).filter((value) => typeof value === "string" && Boolean(shareableRoomInvite(value, "/", room))).slice(0, 4);
			setOrigins(rows);
			setOrigin((previous) => previous || rows[0] || "");
		}).catch(() => {}).finally(() => {
			if (!controller.signal.aborted) setChecking(false);
		});
		return () => controller.abort();
	}, [reachable]);
	const url = shareableRoomInvite(origin.trim(), window.location.pathname, room);
	const chooseOrigin = (0, import_react.useCallback)((value) => {
		setOrigin(value);
		try {
			localStorage.setItem("reelcase.watch-room.invite-origin.v1", value);
		} catch {}
	}, []);
	return (0, import_react.useMemo)(() => ({
		url,
		origin,
		origins,
		checking,
		chooseOrigin
	}), [
		url,
		origin,
		origins,
		checking,
		chooseOrigin
	]);
}
var RoomInvitation = (0, import_react.memo)(function RoomInvitation({ invitation, started, onNotice }) {
	const { url, origin, origins, checking, chooseOrigin } = invitation;
	const image = (0, import_react.useMemo)(() => {
		if (!url || url.length > 2e3) return "";
		const qr = qrcode(0, "M");
		qr.addData(url);
		qr.make();
		return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qr.createSvgTag({
			cellSize: 5,
			margin: 20,
			scalable: true
		}))}`;
	}, [url]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Join room by QR",
		className: "mt-4 rounded-lg border border-border bg-surface p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-sm font-medium text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "size-4 text-accent" }), "Join on your phone"]
			}),
			started && image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: url,
				target: "_blank",
				rel: "noreferrer",
				className: "mt-3 block w-56 max-w-full",
				"aria-label": "Open guest invitation",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: image,
					alt: "Scan to join this Watch Room",
					className: "aspect-square w-full rounded-sm"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs leading-5 text-muted",
				children: [
					started ? "Scan with your camera to open this room’s guest view. Keep the host player open." : "Start the room to show its QR code.",
					" ",
					"Guests receive the current video and queue without importing your library."
				]
			}),
			origins.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				"aria-label": "Phone invitation address",
				value: origins.includes(origin) ? origin : "",
				onChange: (event) => chooseOrigin(event.target.value),
				className: "mt-3 min-h-11 w-full rounded-sm bg-elevated px-3 text-xs text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "",
					disabled: true,
					children: "Choose a network address"
				}), origins.map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: value }, value))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "mt-3 text-xs text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
						className: "cursor-pointer",
						children: ["Phone address", checking ? " · checking home network…" : ""]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-2",
						"aria-label": "Room invitation base URL",
						value: origin,
						onChange: (event) => chooseOrigin(event.target.value),
						placeholder: "https://your-shared-app-address"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 leading-5",
						children: "Use the app’s home-network or public address. On home Wi‑Fi, join the same household network."
					})
				]
			}),
			url ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: url,
				target: "_blank",
				rel: "noreferrer",
				className: "mt-3 block break-all text-xs text-accent",
				"data-room-invite-url": true,
				children: url
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "secondary",
				className: "mt-3 min-h-11",
				onClick: () => {
					if (!navigator.clipboard) {
						onNotice("Copy the invitation address shown above.");
						return;
					}
					navigator.clipboard.writeText(url).then(() => onNotice("Theater invitation link copied."), () => onNotice("Copy the invitation address shown above."));
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), "Copy theater invitation link"]
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-3 text-xs text-muted",
				children: checking ? "Finding a phone-reachable address…" : "Enter the app’s network address above to create a scannable invitation."
			})
		]
	});
});
var RoomQueuePanel = (0, import_react.memo)(function RoomQueuePanel({ onSearch, results, queue, currentId, currentMediaKey, guest, notice, pending = 0, autoAdvance, onAutoAdvance, onSelect, onAdd, onChange, onClear, onNext, onShuffle, onLink, catalogPending = false, searching = false }) {
	const [link, setLink] = (0, import_react.useState)("");
	const [search, setSearch] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const timer = window.setTimeout(() => onSearch(search), 160);
		return () => window.clearTimeout(timer);
	}, [onSearch, search]);
	const queuedKeys = new Set(queue.flatMap((row) => row.video ? [roomMediaKey(row.video)] : []));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg border border-border bg-elevated p-4 shadow-border",
		"aria-label": "Room query and queue",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-widest text-accent uppercase",
					children: "Find & queue"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-1 font-display text-xl text-fg",
					children: "Choose what plays next"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "rounded-full bg-accent/15 px-2 py-1 text-xs text-accent",
					children: [
						queue.length,
						" / ",
						48,
						" queued"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 space-y-2",
				onSubmit: (event) => {
					event.preventDefault();
					if (onLink(link) && !guest) setLink("");
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						"aria-label": "Public video link",
						placeholder: "Paste YouTube or Twitch links, one per line",
						rows: 2,
						maxLength: 32768,
						className: "min-h-20 w-full resize-y rounded-sm border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
						value: link,
						onChange: (event) => setLink(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "sm",
						variant: "secondary",
						className: "min-h-11",
						disabled: !link.trim() || queue.length >= 48,
						children: "Add link to queue"
					}),
					guest && link && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "sm",
						variant: "ghost",
						className: "ml-2 min-h-11",
						onClick: () => setLink(""),
						children: "Clear pasted links"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs leading-5 text-muted",
						children: ["Paste up to 48 links in one batch, even with an empty library. Local files play from the host.", guest && " Your pasted links stay here until you clear them."]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "mt-3",
				value: search,
				onChange: (event) => setSearch(event.target.value),
				placeholder: "Search playable titles or creators",
				"aria-label": "Search room videos"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 max-h-72 space-y-2 overflow-y-auto",
				children: [
					(catalogPending || searching) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						"aria-live": "polite",
						className: "text-xs text-muted",
						children: catalogPending ? "Preparing playable videos in the background…" : "Searching the room catalog…"
					}),
					results.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-2 rounded-md bg-bg/50 p-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 min-w-0 flex-1 truncate text-left text-xs text-fg hover:text-accent",
							title: video.name,
							onClick: () => onSelect(video),
							children: video.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							className: "min-h-11",
							disabled: queue.some((row) => row.id === video.id) || video.id === currentId || queuedKeys.has(roomMediaKey(video)) || roomMediaKey(video) === currentMediaKey || queue.length >= 48,
							onClick: () => onAdd(video),
							children: "Queue"
						})]
					}, video.id)),
					!results.length && !catalogPending && !searching && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "No playable videos match this search."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 border-t border-border pt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs font-medium text-fg",
							children: ["Up next · ", guest ? "host confirms changes" : "shared order"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "secondary",
									className: "min-h-11",
									disabled: !queue.length,
									onClick: onNext,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3" }), guest ? "Request next" : "Play next"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "ghost",
									className: "min-h-11",
									disabled: queue.length < 2,
									onClick: onShuffle,
									"aria-label": guest ? "Request queue shuffle" : "Shuffle queue",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-3" }), "Shuffle"]
								}),
								!guest && queue.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: onClear,
									children: "Clear queue"
								})
							]
						})]
					}),
					!guest && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-3 flex min-h-11 items-center gap-2 text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: autoAdvance,
							onChange: (event) => onAutoAdvance(event.target.checked),
							"aria-label": "Automatically play next queued title"
						}), "Automatically play next when this video ends"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						role: "status",
						"aria-live": "polite",
						className: "mt-2 text-xs text-accent",
						children: [pending > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mb-1 block",
							children: [
								pending,
								" change",
								pending === 1 ? "" : "s",
								" awaiting host confirmation · retrying automatically"
							]
						}), notice || (guest ? "Queue changes go to the host; everyone sees the confirmed order." : "Queue order is shared with every guest.")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						"aria-label": "Shared upcoming titles",
						className: "mt-3 max-h-96 space-y-2 overflow-y-auto",
						children: queue.map(({ id, video }, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							"data-room-queue-id": id,
							className: "rounded-md bg-bg/45 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex min-w-0 items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-accent",
										children: index + 1
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "min-w-0 flex-1 truncate text-sm text-fg",
										children: video?.name ?? "Waiting for title details…"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted",
									children: video?.remote?.kind === "youtube" ? "YouTube · shared link" : video?.remote?.kind === "twitch" ? "Twitch · shared link" : "Local · streamed from the host"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex flex-wrap gap-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "secondary",
											className: "min-h-11",
											disabled: !video,
											onClick: () => video && onSelect(video),
											"aria-label": `${guest ? "Request playback of" : "Play"} ${video?.name ?? id}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3" }), guest ? "Request play" : "Play"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "ghost",
											className: "min-h-11",
											disabled: index === 0,
											"aria-label": `Queue ${video?.name ?? id} next`,
											onClick: () => onChange({
												kind: "next",
												id
											}),
											children: "Next"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "icon",
											variant: "ghost",
											className: "min-h-11 min-w-11",
											disabled: index === 0,
											"aria-label": `Move ${video?.name ?? id} up`,
											onClick: () => onChange({
												kind: "up",
												id
											}),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "icon",
											variant: "ghost",
											className: "min-h-11 min-w-11",
											disabled: index === queue.length - 1,
											"aria-label": `Move ${video?.name ?? id} down`,
											onClick: () => onChange({
												kind: "down",
												id
											}),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "size-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "icon",
											variant: "ghost",
											className: "min-h-11 min-w-11",
											"aria-label": `Remove ${video?.name ?? id} from queue`,
											onClick: () => onChange({
												kind: "remove",
												id
											}),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
										})
									]
								})
							]
						}, id))
					}),
					!queue.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-muted",
						children: "Search above and add a title. YouTube and Twitch entries carry their own playback details."
					})
				]
			})
		]
	});
});
function poster(video) {
	if (video.remote?.kind === "youtube" && video.remote.videoId) return video.poster || `https://i.ytimg.com/vi/${video.remote.videoId}/hqdefault.jpg`;
	return video.poster;
}
function RoomRecommendationsView({ videos, youtubeVideos, currentId, visibleCount, pending, onSelect, onMix, onLoadMore }) {
	const [youtubeLimit, setYoutubeLimit] = (0, import_react.useState)(24);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "ghost",
				onClick: onMix,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-3.5" }), " Mix playable picks"]
			}), videos.length > visibleCount && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "ghost",
				onClick: onLoadMore,
				children: "Load 18 more playable videos"
			})]
		}),
		pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "status",
			"aria-live": "polite",
			className: "mt-3 text-xs text-muted",
			children: "Preparing your playable videos in small background slices… You can keep using the room while they load."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 flex gap-2 overflow-x-auto pb-2",
			children: videos.slice(0, visibleCount).map((video) => {
				const image = poster(video);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onSelect(video),
					className: `w-36 shrink-0 overflow-hidden rounded-sm text-left shadow-border ${video.id === currentId ? "bg-accent text-accent-fg" : "bg-bg/45 text-fg"}`,
					children: [image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: image,
						alt: "",
						loading: "lazy",
						decoding: "async",
						className: "aspect-video w-full object-cover",
						onError: (event) => {
							const fallback = video.remote?.kind === "youtube" && video.remote.videoId ? `https://i.ytimg.com/vi/${video.remote.videoId}/mqdefault.jpg` : "";
							if (fallback && event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
							else event.currentTarget.style.display = "none";
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block truncate px-2 py-2 text-xs",
						children: video.name
					})]
				}, video.id);
			})
		}),
		youtubeVideos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-4",
			"aria-label": "YouTube recommendations",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold text-fg",
					children: "More from YouTube"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [youtubeVideos.length, " playable titles in your library"]
				})] }), youtubeVideos.length > youtubeLimit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					onClick: () => setYoutubeLimit((limit) => Math.min(youtubeVideos.length, limit + 24)),
					children: "Show 24 more YouTube videos"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex gap-2 overflow-x-auto pb-2",
				children: youtubeVideos.slice(0, youtubeLimit).map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onSelect(video),
					className: `w-36 shrink-0 overflow-hidden rounded-sm text-left shadow-border ${video.id === currentId ? "bg-accent text-accent-fg" : "bg-bg/45 text-fg"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: poster(video) || `https://i.ytimg.com/vi/${video.remote?.videoId}/mqdefault.jpg`,
						alt: "",
						loading: "lazy",
						decoding: "async",
						className: "aspect-video w-full object-cover",
						onError: (event) => {
							const fallback = `https://i.ytimg.com/vi/${video.remote?.videoId}/mqdefault.jpg`;
							if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
							else event.currentTarget.style.display = "none";
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block truncate px-2 py-2 text-xs",
						children: video.name
					})]
				}, video.id))
			})]
		})
	] });
}
var RoomRecommendations = (0, import_react.memo)(RoomRecommendationsView);
var RETRY_MS = 3e3;
var TIMEOUT_MS = 12e3;
/** Session-only delivery state. Retries keep their original identity so a lost
* confirmation cannot apply a relative move or shuffle twice. */
var RoomQueueDelivery = class {
	pending = /* @__PURE__ */ new Map();
	receipts = /* @__PURE__ */ new Map();
	get size() {
		return this.pending.size;
	}
	enqueue(packet, now) {
		if (this.pending.size >= 16 || this.pending.has(packet.requestId)) return false;
		this.pending.set(packet.requestId, {
			packet,
			started: now,
			sent: now
		});
		return true;
	}
	acknowledge(id) {
		return this.pending.delete(id);
	}
	tick(now) {
		const resend = [], expired = [];
		for (const [id, entry] of this.pending) if (now - entry.started >= TIMEOUT_MS) {
			this.pending.delete(id);
			expired.push(id);
		} else if (now - entry.sent >= RETRY_MS) {
			entry.sent = now;
			resend.push(entry.packet);
		}
		return {
			resend,
			expired
		};
	}
	prune(now) {
		for (const [key, entry] of this.receipts) if (now - entry.at >= 3e4) this.receipts.delete(key);
	}
	receiptFor(peer, id, now) {
		this.prune(now);
		return this.receipts.get(JSON.stringify([peer, id]))?.receipt;
	}
	canConfirm(now) {
		this.prune(now);
		return this.receipts.size < 128;
	}
	confirm(peer, id, text, now) {
		const receipt = {
			type: "queue-result",
			requestId: id,
			text: text.slice(0, 300)
		};
		this.receipts.set(JSON.stringify([peer, id]), {
			receipt,
			at: now
		});
		return receipt;
	}
	clear() {
		this.pending.clear();
		this.receipts.clear();
	}
};
function useRoomQueueDelivery(room, guest, host, send, notice) {
	const delivery = (0, import_react.useRef)(new RoomQueueDelivery());
	const [pending, setPending] = (0, import_react.useState)(0);
	const hostRef = (0, import_react.useRef)(host);
	hostRef.current = host;
	(0, import_react.useEffect)(() => {
		delivery.current.clear();
		setPending(0);
	}, [room, guest]);
	(0, import_react.useEffect)(() => {
		if (!guest || !pending || !room) return;
		const timer = window.setInterval(() => {
			const result = delivery.current.tick(Date.now());
			for (const packet of result.resend) send(packet, hostRef.current || void 0);
			if (result.expired.length) {
				setPending(delivery.current.size);
				notice("The host did not confirm a queue change. Refreshing the shared order; check it before trying again.");
				send({
					type: "resync-request",
					sentAt: Date.now()
				}, hostRef.current || void 0);
			}
		}, 1e3);
		return () => window.clearInterval(timer);
	}, [
		guest,
		room,
		pending,
		send,
		notice
	]);
	return {
		request: (0, import_react.useCallback)((data, text) => {
			if (!room) {
				notice("Join a room before changing its queue.");
				return false;
			}
			const packet = {
				...data,
				requestId: createLocalId("queue-"),
				sentAt: Date.now()
			};
			if (!delivery.current.enqueue(packet, Date.now())) {
				notice("Please wait for the host to confirm your pending queue changes.");
				return false;
			}
			setPending(delivery.current.size);
			send(packet, hostRef.current || void 0);
			notice(text);
			return true;
		}, [
			room,
			send,
			notice
		]),
		replay: (0, import_react.useCallback)((peer, id) => {
			const receipt = delivery.current.receiptFor(peer, id, Date.now());
			if (receipt) {
				send(receipt, peer);
				return true;
			}
			if (!delivery.current.canConfirm(Date.now())) {
				send({
					type: "queue-result",
					requestId: id,
					text: "The host is handling many queue changes. Please wait before trying again."
				}, peer);
				return true;
			}
			return false;
		}, [send]),
		confirm: (0, import_react.useCallback)((peer, id, text) => {
			send(delivery.current.confirm(peer, id, text, Date.now()), peer);
		}, [send]),
		accept: (0, import_react.useCallback)((peer, id, text) => {
			if (hostRef.current && peer !== hostRef.current || !delivery.current.acknowledge(id)) return;
			setPending(delivery.current.size);
			notice(text.slice(0, 300) || "Queue change confirmed by the host.");
		}, [notice]),
		pending
	};
}
function useRoomLocalStream(ref, source, enabled, publish) {
	const [captured, setCaptured] = (0, import_react.useState)(null);
	const [status, setStatus] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setCaptured(null);
		setStatus("");
		const video = ref.current;
		if (!enabled || !source || !video) {
			publish(null);
			return;
		}
		const capture = video.captureStream ?? video.mozCaptureStream;
		if (!capture) {
			setStatus("This host browser cannot stream local playback. Guests can select a matching file instead.");
			return;
		}
		let stream;
		try {
			stream = capture.call(video);
		} catch {
			setStatus("Local streaming is unavailable for this file. Guests can select a matching file instead.");
			return;
		}
		const update = () => publish(stream);
		stream.addEventListener("addtrack", update);
		stream.addEventListener("removetrack", update);
		publish(stream);
		setCaptured({
			source,
			id: stream.id
		});
		setStatus("Local playback streams directly to connected guests. Keep the host player open.");
		return () => {
			stream.removeEventListener("addtrack", update);
			stream.removeEventListener("removetrack", update);
			publish(null);
			for (const track of stream.getTracks()) track.stop();
		};
	}, [
		enabled,
		publish,
		ref,
		source
	]);
	return {
		streamId: captured?.source === source ? captured.id : "",
		status
	};
}
/** Incoming RTC media stays in the browser's bounded decoder, never a file Blob. */
function RoomStreamPlayer({ stream, title, playing, position, duration, onPlayback, onSeek, onResync }) {
	const ref = (0, import_react.useRef)(null);
	const stage = (0, import_react.useRef)(null);
	const [needsPlay, setNeedsPlay] = (0, import_react.useState)(false);
	const [muted, setMuted] = (0, import_react.useState)(false);
	const [waiting, setWaiting] = (0, import_react.useState)(false);
	const [notice, setNotice] = (0, import_react.useState)("");
	const [draft, setDraft] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const video = ref.current;
		if (!video) return;
		video.srcObject = stream;
		setWaiting(false);
		setNotice("");
		setNeedsPlay(false);
		setDraft(null);
		return () => {
			video.pause();
			video.srcObject = null;
		};
	}, [stream]);
	(0, import_react.useEffect)(() => {
		const video = ref.current;
		if (!video) return;
		let active = true;
		if (playing) video.play().catch(() => {
			if (active) setNeedsPlay(true);
		});
		else {
			video.pause();
			setNeedsPlay(false);
		}
		return () => {
			active = false;
		};
	}, [stream, playing]);
	const clock = (seconds) => {
		const time = Math.floor(Math.max(0, Number.isFinite(seconds) ? seconds : 0));
		return `${Math.floor(time / 60)}:${String(time % 60).padStart(2, "0")}`;
	};
	const seconds = typeof duration === "number" && Number.isFinite(duration) && duration > 0 ? duration : void 0;
	const seek = (value) => {
		setDraft(null);
		onSeek(Math.max(0, Math.min(seconds ?? 43200, value)));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		ref: stage,
		"aria-label": "Shared local playback",
		className: "flex w-full flex-col bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref,
				"aria-label": `Shared local video: ${title}`,
				"data-room-stream": true,
				playsInline: true,
				className: "aspect-video w-full bg-bg",
				onPlaying: () => {
					setNeedsPlay(false);
					setWaiting(false);
				},
				onWaiting: () => setWaiting(true),
				onStalled: () => setWaiting(true),
				onError: () => setNotice("This device could not play the host stream. Request resync to try again."),
				onVolumeChange: () => setMuted(Boolean(ref.current?.muted))
			}), needsPlay && playing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "absolute bottom-4 left-4 min-h-11",
				onClick: () => {
					ref.current?.play().catch(() => setNeedsPlay(true));
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Play on this device"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2 border-t border-border bg-surface p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							size: "sm",
							className: "min-h-11",
							onClick: () => onPlayback(!playing),
							children: [playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), playing ? "Pause together" : "Resume together"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted",
							"aria-label": "Shared playback time",
							children: [clock(position), seconds ? ` / ${clock(seconds)}` : ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "min-h-11 min-w-11",
							"aria-label": muted ? "Unmute this device" : "Mute this device",
							onClick: () => {
								const video = ref.current;
								if (video) video.muted = !muted;
							},
							children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "min-h-11 min-w-11",
							"aria-label": "Fullscreen shared video",
							onClick: () => {
								if (stage.current?.requestFullscreen) stage.current.requestFullscreen().catch(() => setNotice("Fullscreen is unavailable on this device."));
								else setNotice("Fullscreen is unavailable on this device.");
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							className: "min-h-11",
							onClick: onResync,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3" }), "Resync video"]
						})
					]
				}),
				seconds && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "range",
					min: 0,
					max: seconds,
					step: .25,
					value: Math.min(seconds, draft ?? position),
					"aria-label": "Seek shared video",
					"aria-valuetext": clock(draft ?? position),
					className: "min-h-11 w-full accent-accent",
					onChange: (event) => setDraft(event.currentTarget.valueAsNumber),
					onPointerUp: (event) => seek(event.currentTarget.valueAsNumber),
					onPointerCancel: () => setDraft(null),
					onKeyUp: (event) => {
						if ([
							"ArrowLeft",
							"ArrowRight",
							"ArrowUp",
							"ArrowDown",
							"Home",
							"End",
							"PageUp",
							"PageDown"
						].includes(event.key)) seek(event.currentTarget.valueAsNumber);
					},
					onBlur: (event) => {
						if (draft !== null) seek(event.currentTarget.valueAsNumber);
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-5 text-muted",
					children: "Play, pause and seek affect the room. Sound and fullscreen affect only this device."
				}),
				(notice || waiting && playing) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "text-xs text-accent",
					children: notice || "Waiting for the host’s video frames…"
				})
			]
		})]
	});
}
function RoomGuestTiming({ offset, position, adjustsPlayback, onChange }) {
	const [draft, setDraft] = (0, import_react.useState)(String(offset));
	(0, import_react.useEffect)(() => setDraft(String(offset)), [offset]);
	const apply = () => {
		if (!draft.trim() || !Number.isFinite(Number(draft))) return;
		const value = normalizeGuestOffset(Number(draft));
		setDraft(String(value));
		onChange(value);
	};
	const valid = draft.trim() !== "" && Number.isFinite(Number(draft));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "My playback timing",
		className: "mt-4 rounded-md border border-border bg-bg/45 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-medium text-fg",
					children: "My playback timing"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-accent",
					"data-guest-offset": offset,
					children: [
						offset > 0 ? "+" : "",
						offset.toFixed(2),
						"s · this device"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: "Behind the host? Move ahead. Ahead of the host? Move behind. Saved on this device; other viewers keep their timing."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-3 flex flex-wrap items-end gap-2",
				onSubmit: (event) => {
					event.preventDefault();
					apply();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "min-w-0 flex-1 text-xs text-muted",
					children: ["Offset in seconds", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						min: -30,
						max: 30,
						step: .25,
						"aria-label": "My timing offset in seconds",
						className: "mt-1 min-h-11",
						value: draft,
						onChange: (event) => setDraft(event.target.value)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "secondary",
					size: "sm",
					className: "min-h-11",
					disabled: !valid,
					children: "Apply timing"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						className: "min-h-11",
						disabled: offset <= -30,
						onClick: () => onChange(offset - .25),
						children: "Behind 0.25s"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						className: "min-h-11",
						disabled: offset >= 30,
						onClick: () => onChange(offset + .25),
						children: "Ahead 0.25s"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						className: "min-h-11",
						disabled: offset === 0,
						onClick: () => onChange(0),
						children: "Reset timing"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-fg",
				"aria-label": "My adjusted timer",
				children: [
					"Your timer ",
					Math.floor(position / 60),
					":",
					String(Math.floor(position % 60)).padStart(2, "0")
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs leading-5 text-muted",
				children: adjustsPlayback ? "Adjusts your video and timer. Shared play, pause and seek still control the room." : "Timer correction only for host streams, live feeds and clips. Streamed frames cannot be seeked independently; a matching local copy supports video adjustment."
			})
		]
	});
}
/** Visit-only credentials: never persist this object or include it in diagnostics. */
function roomRelayConfig(urls, username, credential, relayOnly) {
	const entries = [...new Set(urls.split(/[\s,]+/).filter(Boolean))];
	if (!entries.length || entries.length > 4) throw new Error("Enter one to four TURN server URLs.");
	for (const entry of entries) {
		const match = /^(turns?):(?:[a-z0-9.-]+|\[[a-f0-9:]+\])(?::(\d{1,5}))?(?:\?transport=(udp|tcp))?$/i.exec(entry);
		if (!match || entry.length > 512 || match[2] && (+match[2] < 1 || +match[2] > 65535)) throw new Error("Use a valid turn: or turns: URL, with an optional port and transport=udp or tcp.");
	}
	if (!username.trim() || !credential.trim() || username.length > 1024 || credential.length > 4096) throw new Error("Enter the temporary relay username and credential.");
	return {
		iceServers: [{
			urls: entries,
			username: username.trim(),
			credential
		}],
		iceTransportPolicy: relayOnly ? "relay" : "all"
	};
}
function RoomRelaySettings({ config, onChange }) {
	const [urls, setUrls] = (0, import_react.useState)("");
	const [username, setUsername] = (0, import_react.useState)("");
	const [credential, setCredential] = (0, import_react.useState)("");
	const [relayOnly, setRelayOnly] = (0, import_react.useState)(false);
	const [notice, setNotice] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		className: "mt-3 rounded-sm border border-border p-3 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
				className: "cursor-pointer text-fg",
				children: ["Connection recovery · ", config ? config.iceTransportPolicy === "relay" ? "relay test mode" : "relay available" : "direct connections"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "my-3 text-xs text-muted",
				children: "For networks that block direct connections, enter temporary credentials from your TURN service on each device. They stay in memory for this visit and are excluded from diagnostics. Applying reconnects the room."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-2",
				onSubmit: (event) => {
					event.preventDefault();
					try {
						onChange(roomRelayConfig(urls, username, credential, relayOnly));
						setCredential("");
						setNotice("Configuration applied. A connected peer showing a relay path confirms the service works.");
					} catch (error) {
						setNotice(error instanceof Error ? error.message : "Invalid relay settings.");
					}
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"aria-label": "TURN server URLs",
						placeholder: "turns:relay.example.com:5349?transport=tcp",
						value: urls,
						onChange: (event) => setUrls(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"aria-label": "TURN username",
						placeholder: "Temporary username",
						autoComplete: "off",
						value: username,
						onChange: (event) => setUsername(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"aria-label": "TURN credential",
						placeholder: "Temporary credential",
						type: "password",
						autoComplete: "off",
						value: credential,
						onChange: (event) => setCredential(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: relayOnly,
							onChange: (event) => setRelayOnly(event.target.checked)
						}), "Test relay only (disables same-browser fallback)"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							type: "submit",
							children: "Apply relay"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							type: "button",
							onClick: () => {
								onChange(void 0);
								setCredential("");
								setNotice("Relay credentials removed. Direct connections restored.");
							},
							children: "Clear relay"
						})]
					}),
					notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						className: "text-xs text-muted",
						children: notice
					})
				]
			})
		]
	});
}
var timingHealth = (ms, good, bad) => ms <= good ? "healthy" : ms <= bad ? "watch" : "attention";
function buildPerformanceScorecard(input) {
	const recentInputs = Object.values(input.interactions).filter((row) => row.count > 0 && input.now - row.at <= 6e4 && row.at <= input.now);
	const inputMs = recentInputs.length ? Math.max(...recentInputs.map((row) => row.lastMs)) : void 0;
	const frameRatio = input.frames.sampledFrames >= 30 && input.now - input.frames.sampledAt <= 6e4 ? input.frames.recentLongFrames / input.frames.sampledFrames : void 0;
	const memoryRatio = Math.max(input.artwork.bytes / Math.max(1, input.artwork.byteLimit), input.artwork.entries / Math.max(1, input.artwork.entryLimit), input.viewer.estimatedBytes / Math.max(1, input.viewer.maxBytes));
	const cards = Math.max(input.frames.mountedCards, input.frames.lastActiveCards);
	const cardLimit = input.lowMemory ? 96 : 256;
	const checks = [
		{
			id: "startup",
			label: "Home controls",
			health: input.homeReadyMs === void 0 ? "unmeasured" : timingHealth(input.homeReadyMs, 3e3, 5e3),
			detail: input.homeReadyMs === void 0 ? "Startup has not reported readiness." : `${input.homeReadyMs} ms from page load; catalog hydration is separate.`
		},
		{
			id: "input",
			label: "Input to next paint",
			health: inputMs === void 0 ? "unmeasured" : timingHealth(inputMs, 100, 200),
			detail: inputMs === void 0 ? "Navigate, search, or rate a title, then refresh within a minute." : `${inputMs} ms slowest latest interaction in the last minute.`
		},
		{
			id: "frames",
			label: "Frame pressure",
			health: frameRatio === void 0 ? "unmeasured" : timingHealth(frameRatio, .05, .15),
			detail: frameRatio === void 0 ? "Browse a shelf with diagnostics enabled, then return within a minute." : `${Math.round(frameRatio * 100)}% of ${input.frames.sampledFrames} recent visible frames exceeded 34 ms; worst ${input.frames.recentWorstFrameMs} ms.`
		},
		{
			id: "memory",
			label: "Bounded media caches",
			health: memoryRatio > 1 ? "attention" : memoryRatio >= .85 ? "watch" : "healthy",
			detail: `${Math.round(memoryRatio * 100)}% of the busiest artwork or viewer cache budget. This is not total browser RAM.`
		},
		{
			id: "cards",
			label: "Mounted cards",
			health: cards === 0 ? "unmeasured" : cards > cardLimit ? "attention" : "healthy",
			detail: `${input.frames.mountedCards} now · ${input.frames.lastActiveCards} last sampled on a shelf · ${cardLimit} whole-page review budget.`
		},
		{
			id: "storage",
			label: "Thumbnail disk reads",
			health: input.diskErrors ? "watch" : "healthy",
			detail: `${input.diskErrors} read errors since this page loaded. Cache misses are normal.`
		}
	];
	const measured = checks.filter((row) => row.health !== "unmeasured");
	const health = measured.some((row) => row.health === "attention") ? "attention" : measured.some((row) => row.health === "watch") ? "watch" : checks.some((row) => row.health === "unmeasured") ? "unmeasured" : "healthy";
	const failing = (id) => checks.some((row) => row.id === id && (row.health === "watch" || row.health === "attention"));
	return {
		health,
		checks,
		next: failing("memory") ? input.lowMemory ? "Keep Low-memory mode on; close unused previews and retest after browsing." : "Try Low-memory mode in Settings, then browse the same shelf again." : failing("input") ? input.pullsPaused ? "Pulling is paused. Repeat the slow click or search and refresh; try Low-memory mode if input remains slow." : "Pause pulling, repeat the slow click or search, and refresh to compare the latest input time." : failing("frames") || failing("cards") ? "Try Text-first artwork and a smaller grid page size, then scroll the same shelf again." : failing("storage") ? "Check browser storage availability; repeated disk failures can cause artwork to be fetched again." : failing("startup") ? "Compare a fresh Home load with pulling paused; capture the startup phases below." : health === "unmeasured" ? "Browse and search with diagnostics enabled, then return here and refresh. Missing measurements do not pass a check." : "No immediate change suggested by these samples. Long sessions and real-provider pulls still need separate verification."
	};
}
var phases = [
	["preferences", "Saved preferences"],
	["remoteRead", "Provider catalog from disk"],
	["remotePrepare", "Provider catalog preparation"],
	["localRead", "Local catalog from disk"],
	["localPrepare", "Local catalog preparation"]
];
function StartupStatus() {
	(0, import_react.useSyncExternalStore)(subscribeStartupTrace, getStartupTraceRevision, () => 0);
	const trace = getFirstShelfTrace();
	const duration = (ms) => ms === void 0 ? "pending" : `${ms.toLocaleString()} ms`;
	const firstPaint = typeof performance === "undefined" ? void 0 : performance.getEntriesByName("first-contentful-paint")[0]?.startTime;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Startup timing",
		className: "mt-3 rounded-sm bg-bg/45 p-3 text-xs leading-5 text-muted",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium text-fg",
				children: "Startup timing"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"First contentful paint · ",
				duration(firstPaint === void 0 ? void 0 : Math.round(firstPaint)),
				" from navigation"
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Home controls ready · ",
				duration(trace.homeReadyMs),
				" from navigation"
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Saved catalogs ready · ",
				duration(trace.catalogReadyMs),
				" from navigation"
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "mt-2 grid gap-1",
				children: phases.map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap justify-between gap-x-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						"data-startup-phase": id,
						children: [
							duration(trace.phases[id]?.elapsedMs),
							trace.phases[id]?.rows !== void 0 ? ` · ${trace.phases[id].rows.toLocaleString()} rows` : "",
							trace.phases[id]?.failed ? " · storage unavailable" : ""
						]
					})]
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2",
				children: [
					"First usable shelf · ",
					duration(trace.elapsedMs),
					" from navigation",
					trace.route ? ` · ${duration(trace.routeElapsedMs)} after opening ${trace.route}` : "",
					trace.cards ? ` · ${trace.cards} mounted cards` : ""
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"First shelf artwork · ",
				trace.artwork,
				trace.artworkWaitMs === void 0 ? "" : ` · ${duration(trace.artworkWaitMs)} after text was ready`
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-subtle",
				children: "Home opens independently of catalog restoration. Landing page prepares its full recommendations on demand. Preparation yields after at most 512 records or about 4 ms; this is a work budget, not a guaranteed frame time. Disk and preparation durations include time yielded to input; YouTube selector, artwork and provider overlap appear below."
			})
		]
	});
}
var labels = {
	healthy: "Within budget",
	watch: "Worth checking",
	attention: "Needs attention",
	unmeasured: "More samples needed"
};
var bytes$1 = (n) => `${(n / 1048576).toFixed(2)} MiB`;
var age = (n) => n === void 0 ? "No sample" : n < 6e4 ? `${Math.floor(n / 1e3)}s` : n < 36e5 ? `${Math.floor(n / 6e4)}m` : `${Math.floor(n / 36e5)}h`;
var rate = (hits, misses) => hits + misses ? `${Math.round(hits / (hits + misses) * 100)}% hit · ${hits.toLocaleString()} hits / ${misses.toLocaleString()} misses` : "No requests observed";
function capture() {
	const now = Date.now(), catalog = useLibrary.getState(), counters = cacheMetrics.snapshot();
	const snapshot = {
		version: 1,
		capturedAt: now,
		catalogEntries: catalog.videos.length,
		sourceCount: catalog.folders.length,
		lowMemory: getPerformanceProfile().lowMemory,
		pullsPaused: pullsPaused(),
		frames: getRenderBudgetSnapshot(),
		interactions: getInteractionBudgetSnapshot(),
		startup: getFirstShelfTrace(),
		artwork: getThumbDiagnostics(),
		viewer: viewerDetails.diagnostics(),
		counters,
		providers: aggregateProviderCache(catalog.follows, now),
		providerBudgets: PROVIDER_BUDGETS,
		writes: getPersistenceMemorySnapshot(),
		recurring: getPeriodicWorkSnapshot(),
		sources: getSourceMemorySnapshot(),
		feedback: getFeedbackDiagnostics(),
		companion: getCompanionMemorySnapshot()
	};
	return {
		...snapshot,
		scorecard: buildPerformanceScorecard({
			...snapshot,
			now,
			homeReadyMs: snapshot.startup.homeReadyMs,
			diskErrors: counters["thumbnail-disk"].errors
		})
	};
}
function PerformanceScorecard() {
	const [snapshot, setSnapshot] = (0, import_react.useState)(capture);
	const { scorecard, artwork, viewer, frames, counters, recurring, writes } = snapshot;
	const exportSnapshot = () => {
		const url = URL.createObjectURL(new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" }));
		const link = document.createElement("a");
		link.href = url;
		link.download = "reelcase-performance-scorecard.json";
		link.click();
		setTimeout(() => URL.revokeObjectURL(url), 1e3);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-5 min-w-0 border-t border-white/10 pt-5",
		"aria-label": "Performance scorecard",
		"data-performance-scorecard": true,
		"data-health": scorecard.health,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-semibold text-fg",
					children: "Performance scorecard"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-accent",
					role: "status",
					children: labels[scorecard.health]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "min-h-11",
						onClick: () => setSnapshot(capture()),
						children: "Refresh scorecard"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "min-h-11",
						onClick: exportSnapshot,
						children: "Export measurements"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs leading-5 text-muted",
				children: [
					"Captured ",
					new Date(snapshot.capturedAt).toLocaleTimeString(),
					" · ",
					snapshot.catalogEntries.toLocaleString(),
					" entries · ",
					snapshot.lowMemory ? "Low-memory" : "Adaptive",
					" mode · pulling ",
					snapshot.pullsPaused ? "paused" : "enabled",
					". Refresh on demand; no catalog scan or automatic Settings refresh. Samples stay on this device."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3",
				children: scorecard.checks.map((check) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 rounded-md bg-bg/45 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "text-sm font-medium text-fg",
							children: check.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `text-xs ${check.health === "attention" || check.health === "watch" ? "text-accent" : "text-muted"}`,
							children: labels[check.health]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs leading-5 text-muted",
						children: check.detail
					})]
				}, check.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 rounded-md border border-accent/20 p-3 text-sm leading-6 text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Next step: " }), scorecard.next]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-6 font-semibold text-fg",
				children: "Cache health"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-3 grid gap-3 md:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheRow, {
						title: "Catalog selectors",
						detail: rate(counters["catalog-selectors"].hits, counters["catalog-selectors"].misses),
						note: `Immutable-input reuse since page load · last lookup ${age(counters["catalog-selectors"].lastAccessAt === void 0 ? void 0 : snapshot.capturedAt - counters["catalog-selectors"].lastAccessAt)} ago. Results share catalog references; heap size is not measured.`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheRow, {
						title: "Artwork memory",
						detail: rate(artwork.hits, artwork.misses),
						note: `${artwork.entries} / ${artwork.entryLimit} entries · ${bytes$1(artwork.bytes)} / ${bytes$1(artwork.byteLimit)} · ${artwork.evictions} evictions · ${artwork.active} decoding / ${artwork.queued} queued. Session reuse includes disk recall.`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheRow, {
						title: "Thumbnail disk recall",
						detail: rate(counters["thumbnail-disk"].hits, counters["thumbnail-disk"].misses),
						note: `${counters["thumbnail-disk"].errors} errors · last recalled item ${counters["thumbnail-disk"].lastEntryBytes === void 0 ? "unmeasured" : bytes$1(counters["thumbnail-disk"].lastEntryBytes)} · oldest observed item ${age(counters["thumbnail-disk"].oldestObservedEntryAt === void 0 ? void 0 : snapshot.capturedAt - counters["thumbnail-disk"].oldestObservedEntryAt)}. Observed reads only; no full disk inventory.`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheRow, {
						title: "Viewer details",
						detail: `${viewer.entries} / ${viewer.maxEntries} entries · ${bytes$1(viewer.estimatedBytes)} / ${bytes$1(viewer.maxBytes)} estimated`,
						note: `${viewer.pending} disk reads · ${viewer.activeTranscripts} active transcript. Details leave memory when their bounded cache evicts them.`
					}),
					snapshot.providers.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheRow, {
						title: `${provider.kind === "youtube" ? "YouTube" : "Twitch"} provider snapshots`,
						detail: rate(provider.hits, provider.misses),
						note: `${provider.samples} saved creator samples · ${provider.uncached} unretained responses · ${provider.entries.toLocaleString()} retained entries in snapshots · ${provider.sizedSamples ? `${bytes$1(provider.estimatedBytes)} estimated across ${provider.sizedSamples} sized samples` : "size unavailable until the next provider response"} · oldest sample ${age(provider.oldestAgeMs)}.`
					}, provider.kind))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs leading-5 text-subtle",
				children: "Provider rows are the latest saved observations per creator, which may be stale or evicted. Counters reset with the server cache; totals are not the current server inventory. Payload estimates exclude object overhead. Exports contain counts and timings, without media, titles, channel names, or URLs."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "mt-4 rounded-md border border-border p-3",
				"aria-label": "Provider metadata safeguards",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "min-h-11 cursor-pointer py-3 text-sm font-medium text-fg",
						children: "Provider metadata safeguards"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs leading-5 text-muted",
						children: [
							"Each upstream metadata page has an ",
							bytes$1(PROVIDER_BUDGETS.responseBytes),
							" response ceiling and a ",
							PROVIDER_BUDGETS.bodyTimeoutMs / 1e3,
							"s body-read deadline. Oversized or interrupted pages hold their saved position; accepted pages stay available. Archive totals can keep growing through complete pages. Your pulling rates and entry limits remain in Pull settings."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-3 grid gap-3 md:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheRow, {
								title: "YouTube transfers",
								detail: `${PROVIDER_BUDGETS.youtubeTransfers} active · ${PROVIDER_BUDGETS.queuedRequests} waiting maximum`,
								note: `User-selected pacing and explicit retry apply. Warm cache: ${bytes$1(PROVIDER_BUDGETS.youtubeCacheBytes)} estimated total; up to ${PROVIDER_BUDGETS.warmCacheRows} rows per entry.`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheRow, {
								title: "Twitch transfers",
								detail: `${PROVIDER_BUDGETS.twitchTransfers} active · ${PROVIDER_BUDGETS.queuedRequests} waiting maximum`,
								note: `Whole transfers share the lane across jobs. Warm cache: ${bytes$1(PROVIDER_BUDGETS.twitchCacheBytes)} estimated total; deep results above ${PROVIDER_BUDGETS.warmCacheRows} rows go to the durable library without a second server graph.`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheRow, {
								title: "Adult transfers",
								detail: `${PROVIDER_BUDGETS.adultTransfers} active · ${PROVIDER_BUDGETS.queuedRequests} waiting maximum`,
								note: `Readable response cache: ${bytes$1(PROVIDER_BUDGETS.adultCacheBytes)} estimated total. Response bytes are checked before decoding and caching.`
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs leading-5 text-subtle",
						children: [
							"Recent refresh jobs use up to ",
							PROVIDER_BUDGETS.refreshWorkers,
							" workers; live checks use ",
							PROVIDER_BUDGETS.liveWorkers,
							"; YouTube archive batches use ",
							PROVIDER_BUDGETS.archiveWorkers,
							". Imports use ",
							PROVIDER_BUDGETS.importWorkers,
							" workers and at most ",
							PROVIDER_BUDGETS.importAttempts,
							" attempts per source, with no immediate repeat of an oversized response. These are metadata safeguards; playback and media downloads keep their own paths. Cache sizes estimate retained payload, excluding JavaScript object overhead."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-xs leading-5 text-muted",
				"aria-label": "Recurring work",
				children: [
					"Recurring work · ",
					recurring.tasks,
					" tasks · ",
					recurring.timerCount,
					" shared timer · ",
					recurring.running,
					" running · ",
					recurring.paused,
					" paused. Storage · ",
					writes.artwork.pending,
					" artwork writes (",
					bytes$1(writes.artwork.pendingWeight),
					") · ",
					writes.activity.pending,
					" activity snapshots · ",
					snapshot.sources.objectUrls,
					" temporary media URLs. Frame sampling ",
					frames.monitoring ? "enabled" : "disabled",
					"; retains at most 240 durations while visible shelves are mounted."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StartupStatus, {})
		]
	});
}
function CacheRow({ title, detail, note }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 rounded-md bg-bg/45 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
				className: "text-sm font-medium text-fg",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
				className: "mt-1 text-xs leading-5 text-accent",
				children: detail
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
				className: "mt-1 text-xs leading-5 text-muted",
				children: note
			})
		]
	});
}
var DEMO_TITLE = /\b(blender|big buck bunny|cosmos laundromat|tears of steel|elephants dream|sintel|night rain|empty house|golden coast|tungsten reel)\b/i;
/** Prepare the room's randomized catalog in interruptible slices. A million
* item room should not hold the main thread while the queue panel opens. */
async function prepareRoomCandidates(options, turn = yieldCatalogTask) {
	let catalog;
	if (options.guest) catalog = await roomCatalogCandidatesAsync(options.videos, options.shared, turn);
	else {
		const ids = /* @__PURE__ */ new Set();
		await forEachCatalogSlice(options.videos, (video) => ids.add(video.id), turn);
		const sharedOnly = [];
		await forEachCatalogSlice(Object.values(options.shared), (video) => {
			if (!ids.has(video.id)) sharedOnly.push(video);
		}, turn);
		catalog = sharedOnly.length ? options.videos.concat(sharedOnly) : options.videos;
	}
	const played = /* @__PURE__ */ new Set();
	await forEachCatalogSlice(options.history, (entry) => played.add(entry.id), turn);
	const videos = [];
	const ranks = [];
	const order = [];
	await forEachCatalogSlice(catalog, (video) => {
		if (video.isSample || DEMO_TITLE.test(`${video.name} ${video.remote?.channelName ?? ""} ${video.tagline ?? ""}`) || options.unavailable[video.id] || options.hidden[video.id] || !options.canStage(video)) return;
		const index = videos.length;
		videos.push(video);
		ranks.push(options.rank(`${video.id}:${options.seed}`, options.seed) / 4294967295 + (options.favorites[video.id] ? .18 : 0) - (played.has(video.id) ? .32 : 0));
		order.push(index);
	}, turn);
	const sorted = await sortCatalogRows(order, (a, b) => ranks[b] - ranks[a], turn);
	const result = new Array(videos.length);
	await forEachCatalogSlice(sorted, (index, position) => {
		result[position] = videos[index];
	}, turn);
	return result;
}
/** Queue search stops as soon as the visible result budget is full. Long or
* rare queries yield between slices so keyboard input stays responsive. */
async function searchRoomCandidates(videos, query, limit = 20, turn = yieldCatalogTask) {
	const needle = query.trim().toLowerCase();
	const result = [];
	if (!needle) return videos.slice(0, Math.min(limit, videos.length));
	for (let offset = 0; offset < videos.length && result.length < limit;) {
		await turn();
		const started = performance.now();
		const end = Math.min(videos.length, offset + 512);
		for (; offset < end && result.length < limit; offset++) {
			const video = videos[offset];
			if (`${video.name} ${video.remote?.channelName ?? ""}`.toLowerCase().includes(needle)) result.push(video);
			if (performance.now() - started >= 4) {
				offset++;
				break;
			}
		}
	}
	return result;
}
async function roomCatalogCandidatesAsync(videos, shared, turn) {
	const output = [];
	const seenKeys = /* @__PURE__ */ new Set();
	const seenIds = /* @__PURE__ */ new Set();
	const append = (video) => {
		let item = video;
		const key = roomMediaKey(video);
		if (seenKeys.has(key)) return;
		if (seenIds.has(video.id)) item = {
			...video,
			id: `room:${key}:candidate-${output.length}`
		};
		seenKeys.add(key);
		seenIds.add(item.id);
		output.push(item);
	};
	await forEachCatalogSlice(videos, (video) => {
		const session = shared[video.id];
		if (!session) {
			append(video);
			return;
		}
		if (roomMediaKey(session) !== roomMediaKey(video)) append({
			...video,
			id: `room:${roomMediaKey(video)}`
		});
		else append(session);
	}, turn);
	const sessions = Object.values(shared);
	await forEachCatalogSlice(sessions, append, turn);
	return output;
}
var VISION_MODELS = {
	semantic: {
		name: "CLIP open-vocabulary",
		purpose: "Accurate review tags",
		model: "Xenova/clip-vit-base-patch32",
		revision: "d15189d7028b43f1d3e65039190477f6af591c2a"
	},
	semanticPlus: {
		name: "SigLIP semantic+",
		purpose: "Stronger semantic photo review",
		model: "Xenova/siglip-base-patch16-224",
		revision: "4649052"
	},
	semanticPro: {
		name: "SigLIP large+",
		purpose: "Highest-detail browser semantic review",
		model: "Xenova/siglip-large-patch16-256",
		revision: "main"
	}
};
var SEMANTIC_TOPICS = [
	"a person",
	"a portrait",
	"a selfie",
	"a group of people",
	"a baby",
	"a child",
	"a pet",
	"a dog",
	"a cat",
	"a bird",
	"a horse",
	"wildlife",
	"food",
	"a meal",
	"dessert",
	"a drink",
	"a restaurant",
	"a kitchen",
	"a recipe",
	"travel",
	"a vacation",
	"a hotel",
	"an airport",
	"a beach",
	"an ocean",
	"a lake",
	"a mountain",
	"a forest",
	"a sunset",
	"a sunrise",
	"a landscape",
	"nature",
	"a garden",
	"a flower",
	"a tree",
	"a vehicle",
	"a car",
	"a truck",
	"a motorcycle",
	"a bicycle",
	"a boat",
	"an airplane",
	"a train",
	"a building",
	"a house",
	"an apartment",
	"a city",
	"a street",
	"architecture",
	"a landmark",
	"a bridge",
	"a pool",
	"a party",
	"a wedding",
	"a birthday",
	"a concert",
	"a festival",
	"a sport",
	"a game",
	"fitness",
	"a team",
	"a trophy",
	"a stage",
	"a crowd",
	"a document",
	"a receipt",
	"an invoice",
	"a form",
	"a book",
	"a screen",
	"a screenshot",
	"a computer",
	"a phone",
	"a television",
	"a video game",
	"a chart",
	"a map",
	"a product",
	"clothing",
	"shoes",
	"jewelry",
	"furniture",
	"a toy",
	"art",
	"a drawing",
	"a painting",
	"a meme",
	"an indoor scene",
	"an outdoor scene",
	"night",
	"low light",
	"snow",
	"rain",
	"autumn",
	"spring",
	"summer",
	"winter",
	"black and white photo",
	"close-up photo"
];
var classifiers = /* @__PURE__ */ new Map();
var activeClassifiers = /* @__PURE__ */ new Map();
function cleanLabel(label) {
	return label.toLowerCase().split(",")[0].replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function device() {
	return typeof navigator !== "undefined" && "gpu" in navigator ? "webgpu" : "wasm";
}
async function classifierFor(model, onStatus) {
	let classifier = classifiers.get(model);
	if (!classifier) {
		classifier = (async () => {
			const { pipeline } = await import("../_libs/@huggingface/transformers+[...].mjs").then((n) => n.t);
			const definition = VISION_MODELS[model];
			const task = "zero-shot-image-classification";
			const options = {
				progress_callback: onStatus,
				..."revision" in definition ? { revision: definition.revision } : {}
			};
			try {
				return await pipeline(task, definition.model, {
					device: device(),
					...options
				});
			} catch (error) {
				if (device() !== "webgpu") throw error;
				onStatus?.({ status: "WebGPU unavailable; retrying locally with WASM" });
				return pipeline(task, definition.model, {
					device: "wasm",
					...options
				});
			}
		})();
		classifiers.set(model, classifier);
	}
	try {
		return await classifier;
	} catch (error) {
		classifiers.delete(model);
		throw error;
	}
}
/**
* Optional, user-initiated image classification. The model executes in the
* browser (WebGPU when available, otherwise WASM); photo bytes stay local.
* The model download is cached by the browser for later passes.
*/
async function classifyImagesLocally(urls, onProgress, model = "semanticPlus", onModelStatus) {
	if (!urls.length) return [];
	const classifier = await classifierFor(model, onModelStatus);
	activeClassifiers.set(model, (activeClassifiers.get(model) ?? 0) + 1);
	const results = Array.from({ length: urls.length }, () => []);
	let cursor = 0;
	let completed = 0;
	const workerCount = device() === "webgpu" ? 2 : 1;
	const workers = Array.from({ length: Math.min(workerCount, urls.length) }, async () => {
		while (true) {
			const index = cursor++;
			if (index >= urls.length) return;
			const labels = await classifier(urls[index], SEMANTIC_TOPICS);
			const seen = /* @__PURE__ */ new Set();
			results[index] = labels.map((item) => ({
				label: cleanLabel(item.label),
				score: item.score
			})).filter((item) => item.score >= .018 && item.label.length >= 3 && !seen.has(item.label) && Boolean(seen.add(item.label))).slice(0, 5);
			completed += 1;
			onProgress?.(completed, urls.length);
		}
	});
	try {
		await Promise.all(workers);
		return results;
	} finally {
		await Promise.allSettled(workers);
		const remaining = (activeClassifiers.get(model) ?? 1) - 1;
		if (remaining) activeClassifiers.set(model, remaining);
		else {
			activeClassifiers.delete(model);
			classifiers.delete(model);
			await classifier.dispose().catch(() => void 0);
		}
	}
}
/** Measures preparation and inference on the same local sample; it never changes defaults. */
async function benchmarkVisionModelsLocally(urls, onProgress, onModelStatus) {
	const run = async (model) => {
		const started = performance.now();
		onModelStatus?.(model, { status: `Preparing ${VISION_MODELS[model].name}` });
		return {
			model,
			labels: await classifyImagesLocally(urls, (done, total) => onProgress?.(model, done, total), model, (status) => onModelStatus?.(model, status)),
			elapsedMs: performance.now() - started
		};
	};
	return {
		sampleSize: urls.length,
		semantic: await run("semantic"),
		semanticPlus: await run("semanticPlus"),
		semanticPro: await run("semanticPro")
	};
}
var LOCAL_UPSCALER = {
	name: "Swin2SR x2 beta",
	model: "Xenova/swin2SR-classical-sr-x2-64",
	revision: "93dfc9089abda257351d3a58d5771e2c1ff69442",
	sha256: "49ffa7b96532edb9553c74be11b623dafa26db1645611096a208449451a960df",
	artifactUrl: "https://huggingface.co/Xenova/swin2SR-classical-sr-x2-64/resolve/93dfc9089abda257351d3a58d5771e2c1ff69442/onnx/model_q4f16.onnx",
	shippedArtifactUrl: "/models/swin2sr-x2-q4f16.onnx",
	cacheKey: "/reelcase-local-models/upscaler.onnx"
};
/** Keep chart dimensions and surrounding controls stable, while releasing SVG,
* tooltip and resize work outside the viewport or during playback. Use the
* shared visibility observers rather than one pair per chart. */
function ViewportChart({ height, children }) {
	const element = (0, import_react.useRef)(null);
	const [visibility, setVisibility] = (0, import_react.useState)({
		near: false,
		visible: false
	});
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const phase = useSessionPhase();
	const viewer = useLibrary((state) => Boolean(state.activeId || state.previewId));
	(0, import_react.useEffect)(() => {
		if (element.current) return cardVisibility.observe(element.current, setVisibility);
	}, []);
	const allowed = allowCardArtwork(phase, visibility.near, visibility.visible) && !viewer;
	(0, import_react.useEffect)(() => {
		if (!allowed) {
			setMounted(false);
			return;
		}
		if (!mounted) return scheduleNavigationWork(() => setMounted(true));
	}, [allowed, mounted]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: element,
		style: {
			height,
			width: "100%",
			minWidth: 0
		},
		"data-viewport-chart": true,
		"data-chart-mounted": mounted,
		children: mounted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-hidden": "true",
			className: "h-full w-full rounded-md bg-bg/20"
		})
	});
}
var widgetScript;
function loadWidgets() {
	return widgetScript ??= new Promise((resolve, reject) => {
		const existing = window.twttr;
		if (existing?.widgets) {
			resolve(existing);
			return;
		}
		const script = document.createElement("script");
		script.src = "https://platform.twitter.com/widgets.js";
		script.async = true;
		const timeout = window.setTimeout(() => {
			script.remove();
			reject(/* @__PURE__ */ new Error("X did not respond"));
		}, 12e3);
		script.onload = () => {
			clearTimeout(timeout);
			const api = window.twttr;
			api?.widgets ? resolve(api) : reject(/* @__PURE__ */ new Error("X unavailable"));
		};
		script.onerror = () => {
			clearTimeout(timeout);
			script.remove();
			reject(/* @__PURE__ */ new Error("X unavailable"));
		};
		document.head.append(script);
	}).catch((error) => {
		widgetScript = void 0;
		throw error;
	});
}
function XTimeline({ account, topic }) {
	const container = (0, import_react.useRef)(null);
	const [attempt, setAttempt] = (0, import_react.useState)(0);
	const [phase, setPhase] = (0, import_react.useState)("loading");
	const [status, setStatus] = (0, import_react.useState)("Loading public posts…");
	const deskKey = `reelcase.x-desk.${topic ? `topic:${topic.query}` : `account:${account ?? "public"}`}`;
	const [lastReadAt, setLastReadAt] = (0, import_react.useState)(() => typeof window === "undefined" ? 0 : Number(localStorage.getItem(deskKey) ?? 0));
	(0, import_react.useEffect)(() => {
		const element = container.current;
		if (!element) return;
		let cancelled = false;
		setPhase("loading");
		setStatus("Loading public posts…");
		element.replaceChildren();
		const timelineUrl = topic ? `https://twitter.com/search?q=${encodeURIComponent(topic.query)}&src=typed_query&f=live` : `https://twitter.com/${account}`;
		const timeout = window.setTimeout(() => {
			if (!cancelled) {
				setPhase("unavailable");
				setStatus("X hasn’t supplied a timeline. Open the profile to view posts, or retry.");
			}
		}, 15e3);
		const observer = new MutationObserver(() => {
			const frame = element.querySelector("iframe");
			if (frame) frame.addEventListener("load", () => {
				if (!cancelled) {
					clearTimeout(timeout);
					const now = Date.now();
					localStorage.setItem(deskKey, String(now));
					setLastReadAt(now);
					setPhase("ready");
					setStatus("X embed loaded. If posts are blank, open the profile.");
				}
			}, { once: true });
		});
		observer.observe(element, {
			childList: true,
			subtree: true
		});
		loadWidgets().then(async (api) => {
			if (cancelled) return;
			const options = {
				height: 640,
				theme: document.documentElement.dataset.theme === "day" ? "light" : "dark",
				dnt: true,
				chrome: "noheader nofooter"
			};
			if (api.widgets.createTimeline) {
				await api.widgets.createTimeline(topic ? {
					sourceType: "url",
					url: timelineUrl
				} : {
					sourceType: "profile",
					screenName: account ?? ""
				}, element, options);
				return;
			}
			const link = document.createElement("a");
			link.className = "twitter-timeline";
			link.href = timelineUrl;
			link.dataset.height = "640";
			link.dataset.theme = options.theme;
			link.dataset.dnt = "true";
			link.textContent = topic ? `Public posts about ${topic.label}` : `Public posts by @${account}`;
			element.append(link);
			return api.widgets.load(element);
		}).catch(() => {
			if (!cancelled) {
				clearTimeout(timeout);
				setPhase("unavailable");
				setStatus("X is unavailable here. Your saved accounts are still ready to open.");
			}
		});
		return () => {
			cancelled = true;
			clearTimeout(timeout);
			observer.disconnect();
			element.replaceChildren();
		};
	}, [
		account,
		attempt,
		deskKey,
		topic
	]);
	const destination = topic ? `https://x.com/search?q=${encodeURIComponent(topic.query)}&src=typed_query&f=live` : `https://x.com/${account}`;
	const title = topic ? topic.label : `@${account}`;
	const unavailable = phase === "unavailable";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-5 rounded-lg border border-border bg-elevated p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-semibold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => setAttempt((value) => value + 1),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), "Retry"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						className: "inline-flex min-h-11 items-center gap-2 rounded-sm bg-accent px-3 text-sm font-medium text-accent-fg",
						href: destination,
						target: "_blank",
						rel: "noopener noreferrer",
						children: [topic ? "Open topic" : "Open profile", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" })]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "my-4 text-sm text-muted",
				children: status
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-xs text-subtle",
				children: lastReadAt ? `Embed last loaded ${new Date(lastReadAt).toLocaleString()}` : "No public timeline has loaded in this browser yet."
			}),
			unavailable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 grid gap-3 rounded-md bg-bg/45 p-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-2 text-sm font-medium text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 text-accent" }), "Public-reader fallback"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs leading-5 text-muted",
					children: "The official X embed did not load in this browser. Realhub does not invent posts or store credentials."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: destination,
						target: "_blank",
						rel: "noopener noreferrer",
						className: "inline-flex min-h-10 items-center rounded-sm bg-accent px-3 text-sm font-medium text-accent-fg",
						children: ["Open official view", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-2 size-4" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: topic ? `https://www.google.com/search?q=site%3Ax.com+${encodeURIComponent(topic.query)}` : `https://www.google.com/search?q=site%3Ax.com%2F${encodeURIComponent(account ?? "")}`,
						target: "_blank",
						rel: "noopener noreferrer",
						className: "inline-flex min-h-10 items-center rounded-sm bg-surface px-3 text-sm text-fg shadow-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "mr-2 size-4" }), "Search public posts"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: container,
				className: "min-h-24 overflow-hidden"
			})
		]
	});
}
/** Curated public X handles for one-time Adults / Social seeding (18+). */
var X_ADULT_SEED_HANDLES = [
	"ThePornDude",
	"Brazzers",
	"Pornhub",
	"MiaMalkova",
	"soogsx",
	"Amouranth",
	"KittyxKum",
	"RileyReid",
	"EsperanzaGomez",
	"SophieRainx",
	"AngelaWhite",
	"puppiwi",
	"belle_delphine",
	"Abella_Danger",
	"Vladislava_",
	"RealityPornKing",
	"EmarrB",
	"BaybeKimchi",
	"BrittanyaRazavi",
	"BishoujoMom",
	"TheLisaAnn",
	"BambiDoe",
	"miakhalifa",
	"TeannaTrump",
	"AndiiPoops",
	"GiselleMontesX",
	"Playboy",
	"PurpleBitch1",
	"SashaGrey",
	"JennaLynnMeowri",
	"AlinaRoseASMR",
	"WaifuMia"
].map((h) => h.replace(/^@/, "").toLowerCase()).filter((h) => /^[a-z0-9_]{1,15}$/.test(h));
var hub_sections_exports = /* @__PURE__ */ __exportAll({
	AnimeSection: () => AnimeSection,
	FindPhoneSection: () => FindPhoneSection,
	GamesSection: () => GamesSection,
	GenreSection: () => GenreSection,
	LanConnectionSection: () => LanConnectionSection,
	MissionPlanSection: () => MissionPlanSection,
	PhotosSection: () => PhotosSection,
	PrintsSection: () => PrintsSection,
	PrivateWebShortcuts: () => PrivateWebShortcuts,
	SettingsSection: () => SettingsSection,
	ShopSection: () => ShopSection,
	SocialSection: () => SocialSection,
	SpotifySection: () => SpotifySection,
	StatsSection: () => StatsSection,
	StreamingSection: () => StreamingSection,
	WatchRoomSection: () => WatchRoomSection
});
var PrintModelViewer = (0, import_react.lazy)(async () => {
	return { default: (await import("./print-model-viewer-D361T-pe.mjs")).PrintModelViewer };
});
var HUB_KEY = "reelcase.hub.v1";
function gameKind(item) {
	if (item.launchUrl) return "web-ready";
	if (/\.url$/i.test(item.name)) return "web-needs-target";
	if (/\.lnk$/i.test(item.name)) return "desktop-shortcut";
	if (/\.appref-ms$/i.test(item.name)) return "desktop-app";
	return "desktop-executable";
}
function isWebGame(item) {
	return gameKind(item).startsWith("web-");
}
function isGameHelper(item) {
	const value = `${item.name} ${item.path}`.toLowerCase();
	return /(?:uninstall|setup|installer|updater|crashpad|helper|redistributable|vcredist|python|node_modules|\\\\lib\\\\|\/lib\/)/.test(value);
}
function gameBadge(item) {
	if (item.launchUrl?.startsWith("steam:")) return "STEAM";
	if (item.launchUrl?.startsWith("epic:") || item.launchUrl?.startsWith("com.epicgames")) return "EPIC";
	if (gameKind(item) === "web-needs-target") return "LINK?";
	if (gameKind(item) === "web-ready") return "WEB";
	if (/\.appref-ms$/i.test(item.name)) return "APP";
	if (/\.lnk$/i.test(item.name)) return "LINK";
	return "GAME";
}
var PREFERENCE_GROUPS = {
	Alerts: [
		"Go-live alerts",
		"New Twitch VOD alerts",
		"New YouTube upload alerts",
		"Desktop notifications"
	],
	Playback: ["Autoplay next video", "Start muted"],
	Display: ["Day mode", "Compact live cards"],
	Performance: [
		"Use cached sources first",
		"Low-memory grids",
		"Small Home shelves"
	],
	Privacy: ["Reduce motion", "Hide demo media"]
};
var ACTIVE_PREFERENCE_DETAILS = {
	"alerts-go-live-alerts": "Active: adds an in-app notice when a tracked Twitch channel goes live after a refresh.",
	"alerts-new-twitch-vod-alerts": "Active: adds an in-app notice when a tracked Twitch channel has a newly discovered VOD or clip.",
	"alerts-new-youtube-upload-alerts": "Active: adds an in-app notice when a tracked YouTube channel has a newly discovered upload.",
	"alerts-desktop-notifications": "Active: asks the browser for permission, then mirrors enabled Realhub alerts as desktop notifications.",
	"playback-autoplay-next-video": "Active: starts the next library title when a local video ends.",
	"playback-start-muted": "Active: local video playback starts muted until you raise the player volume.",
	"display-day-mode": "Active: uses the light palette throughout this browser.",
	"display-compact-live-cards": "Active: renders six compact live cards per wide row to reduce scrolling and image work.",
	"performance-use-cached-sources-first": "Active: opens the saved catalog before asking folders or the Companion for fresh file details.",
	"performance-low-memory-grids": "Active: keeps only a smaller card batch mounted in large grids, reducing image decode pressure.",
	"performance-small-home-shelves": "Active: draws shorter Home rails first; use Show more inside a rail when you want depth.",
	"privacy-reduce-motion": "Active: reduces animation and scrolling motion across Realhub.",
	"privacy-hide-demo-media": "Active: hides bundled demonstration titles from your library shelves."
};
var PREFERENCES = Object.entries(PREFERENCE_GROUPS).flatMap(([group, labels]) => labels.map((label) => ({
	key: `${group}-${label}`.toLowerCase().replaceAll(" ", "-"),
	group,
	label,
	detail: ACTIVE_PREFERENCE_DETAILS[`${group}-${label}`.toLowerCase().replaceAll(" ", "-")],
	implemented: true
})));
function readHub() {
	const samples = [
		{
			name: "Calibration cube.stl",
			path: "Realhub samples/Calibration cube.stl",
			size: 2618,
			addedAt: 1,
			sampleSrc: "/samples/prints/calibration-cube.stl"
		},
		{
			name: "Cable clip.3mf",
			path: "Realhub samples/Cable clip.3mf",
			size: 94100,
			addedAt: 2
		},
		{
			name: "OpenSCAD phone stand.obj",
			path: "Open-source examples/OpenSCAD phone stand.obj",
			size: 318,
			addedAt: 4,
			sampleSrc: "/samples/prints/phone-stand.obj"
		},
		{
			name: "Gridfinity bin.3mf",
			path: "Open-source examples/Gridfinity bin.3mf",
			size: 784200,
			addedAt: 5
		},
		{
			name: "Benchy calibration.obj",
			path: "Open-source examples/Benchy calibration.obj",
			size: 236,
			addedAt: 6,
			sampleSrc: "/samples/prints/benchy.obj"
		},
		{
			name: "Parametric drawer label.stl",
			path: "Open-source examples/Parametric drawer label.stl",
			size: 229100,
			addedAt: 7
		},
		{
			name: "Tool tray.gcode",
			path: "Realhub samples/Tool tray.gcode",
			size: 1248e3,
			addedAt: 3
		}
	];
	try {
		const raw = localStorage.getItem(HUB_KEY);
		if (!raw) return {
			prints: samples,
			games: []
		};
		return JSON.parse(raw);
	} catch {
		return {
			prints: samples,
			games: []
		};
	}
}
function writeHub(next) {
	localStorage.setItem(HUB_KEY, JSON.stringify(next));
}
function filesToItems(files, gamesOnly = false) {
	return [...files].filter((file) => !gamesOnly || /\.(exe|lnk|url|appref-ms)$/i.test(file.name)).filter((file) => !/^(uninstall|setup|crashreporter)/i.test(file.name)).map((file) => ({
		name: file.name,
		path: file.webkitRelativePath || file.name,
		size: file.size,
		addedAt: Date.now()
	}));
}
function bytes(value) {
	if (value <= 0) return "0 B";
	return value < 1048576 ? `${Math.max(1, Math.round(value / 1024))} KB` : `${(value / 1024 / 1024).toFixed(1)} MB`;
}
function watchRoomEmbed(video) {
	const base = video.remote?.embedUrl;
	if (!base) return "";
	if (video.remote?.kind === "twitch") return twitchEmbedUrl(video.remote, window.location.hostname) ?? "";
	const url = new URL(base);
	url.searchParams.set("autoplay", "0");
	url.searchParams.set("rel", "0");
	url.searchParams.set("playsinline", "1");
	url.searchParams.set("controls", "1");
	url.searchParams.set("origin", window.location.origin);
	if (video.remote?.kind === "youtube") url.searchParams.set("enablejsapi", "1");
	return url.toString();
}
function watchRoomPoster(video) {
	if (video.remote?.kind === "youtube" && video.remote.videoId) return video.poster || `https://i.ytimg.com/vi/${video.remote.videoId}/hqdefault.jpg`;
	return video.poster;
}
function canStageRoomVideo(video) {
	return video.remote ? Boolean(describeRoomMedia(video)) : Boolean(video.src || NATIVE_PLAYABLE.has(video.extension.toLowerCase()));
}
function roomShuffleRank(id, seed) {
	let value = seed >>> 0;
	for (let index = 0; index < id.length; index += 1) value = Math.imul(value ^ id.charCodeAt(index), 73244475);
	return value >>> 0;
}
function normalizeLocalRoomQueue(value) {
	if (!Array.isArray(value)) return [];
	const seen = /* @__PURE__ */ new Set();
	return value.flatMap((item) => {
		if (!item || typeof item !== "object") return [];
		const share = item;
		if (typeof share.name !== "string" || typeof share.fingerprint !== "string" || !share.name.trim() || !share.fingerprint.trim() || seen.has(share.fingerprint)) return [];
		seen.add(share.fingerprint);
		return [{
			name: share.name,
			fingerprint: share.fingerprint,
			size: Math.max(0, Number(share.size) || 0),
			modified: Math.max(0, Number(share.modified) || 0)
		}];
	}).slice(0, 24);
}
function trustedRoomSentAt(value) {
	const sentAt = typeof value === "number" && Number.isFinite(value) ? value : 0;
	return sentAt > 0 && sentAt <= Date.now() + 6e4 ? sentAt : 0;
}
function roomTimeLabel(at) {
	return at ? new Date(at).toLocaleTimeString([], {
		hour: "numeric",
		minute: "2-digit",
		second: "2-digit"
	}) : "waiting";
}
function localRoomFingerprint(file) {
	return `${file.name.normalize("NFKC").toLowerCase()}::${file.size}::${file.lastModified}`;
}
var twitchEmbedLoader;
function loadTwitchEmbed() {
	return twitchEmbedLoader ??= new Promise((resolve, reject) => {
		const ready = window.Twitch;
		if (ready?.Player) {
			resolve(ready);
			return;
		}
		const script = document.createElement("script");
		script.src = "https://player.twitch.tv/js/embed/v1.js";
		script.async = true;
		script.onload = () => {
			const api = window.Twitch;
			if (api?.Player) resolve(api);
			else reject(/* @__PURE__ */ new Error("Twitch player API unavailable"));
		};
		script.onerror = () => reject(/* @__PURE__ */ new Error("Twitch player script failed to load"));
		document.head.append(script);
	});
}
function downloadCsv(rows, filename) {
	const quote = (value) => `"${String(value).replaceAll("\"", "\"\"")}"`;
	const body = rows.map((row) => row.map(quote).join(",")).join("\n");
	const url = URL.createObjectURL(new Blob([body], { type: "text/csv;charset=utf-8" }));
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}
function GenreSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HubShell, {
		eyebrow: "Topic explorer",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, { className: "size-4" }),
		title: "Explore ideas across sources.",
		copy: "Follow useful topics across local media, YouTube and Twitch. Each connection shows its saved tag or title evidence.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopicLinks, { explorer: true })
	});
}
function animeTitleFormat(video, tags) {
	const text = `${video.name} ${video.genre ?? ""} ${tags.join(" ")}`.toLowerCase();
	if (/\b(anime[- ]?(?:movie|film|special)|movie|film|theatrical|ova|ona|special)\b/.test(text)) return "films";
	return "series";
}
function animeSearchMatch(video, tags, value) {
	const needle = value.trim().toLowerCase();
	if (!needle) return true;
	return `${video.name} ${video.genre ?? ""} ${video.description ?? ""} ${tags.join(" ")}`.toLowerCase().includes(needle);
}
function AnimeSection() {
	const videos = useLibrary((s) => s.videos);
	const folders = useLibrary((s) => s.folders);
	const tags = useLibrary((s) => s.tags);
	const progress = useLibrary((s) => s.progress);
	const resumeProgress = useLibrary((s) => s.resumeProgress);
	const unavailable = useLibrary((s) => s.unavailable);
	const setVideoTags = useLibrary((s) => s.setVideoTags);
	const setSource = useLibrary((s) => s.setSource);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [query, setQuery] = (0, import_react.useState)("");
	const [tagQuery, setTagQuery] = (0, import_react.useState)("");
	const [limit, setLimit] = (0, import_react.useState)(36);
	const catalog = (0, import_react.useMemo)(() => videos.filter((video) => !isAdultVideo(video, folders) && !isAdultPullKind(video.remote?.kind) && !unavailable[video.id]), [
		folders,
		unavailable,
		videos
	]);
	const anime = (0, import_react.useMemo)(() => catalog.filter((video) => topicsForVideo(video, tags[video.id] ?? []).includes("anime")).sort((a, b) => b.addedAt - a.addedAt), [catalog, tags]);
	const continuing = (0, import_react.useMemo)(() => anime.filter((video) => {
		const mark = resumeForVideo({
			progress,
			resumeProgress
		}, video);
		return Boolean(mark && mark.d > 0 && mark.t >= 2 && mark.t / mark.d < .992);
	}).sort((a, b) => {
		const aMark = resumeForVideo({
			progress,
			resumeProgress
		}, a)?.at ?? 0;
		return (resumeForVideo({
			progress,
			resumeProgress
		}, b)?.at ?? 0) - aMark;
	}), [
		anime,
		progress,
		resumeProgress
	]);
	const filtered = (0, import_react.useMemo)(() => {
		return (filter === "continue" ? continuing : filter === "all" ? anime : anime.filter((video) => animeTitleFormat(video, tags[video.id] ?? []) === filter)).filter((video) => animeSearchMatch(video, tags[video.id] ?? [], query));
	}, [
		anime,
		continuing,
		filter,
		query,
		tags
	]);
	const tagMatches = (0, import_react.useMemo)(() => {
		if (!tagQuery.trim()) return [];
		return catalog.filter((video) => animeSearchMatch(video, tags[video.id] ?? [], tagQuery)).slice(0, 8);
	}, [
		catalog,
		tagQuery,
		tags
	]);
	const localCount = anime.filter((video) => !video.remote).length;
	const seriesCount = anime.filter((video) => animeTitleFormat(video, tags[video.id] ?? []) === "series").length;
	const filmCount = anime.length - seriesCount;
	const markAnime = (video) => {
		const current = tags[video.id] ?? [];
		if (!current.includes("anime")) setVideoTags(video.id, [...current, "anime"]);
	};
	const filters = [
		{
			id: "all",
			label: "All titles",
			count: anime.length
		},
		{
			id: "continue",
			label: "Continue",
			count: continuing.length
		},
		{
			id: "series",
			label: "Series",
			count: seriesCount
		},
		{
			id: "films",
			label: "Films & specials",
			count: filmCount
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Anime library",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, { className: "size-4" }),
		title: "Keep anime on its own shelf.",
		copy: "A fast, local-first view for anime already in your Realhub catalog. Saved #anime tags and clear title/category evidence keep it separate without copying or proxying third-party playback.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				"aria-label": "Anime library summary",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Anime titles",
						value: anime.length
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Continue watching",
						value: continuing.length
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Local titles",
						value: localCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Films & specials",
						value: filmCount
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-lg bg-elevated p-4 shadow-border sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Browse your shelf"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-2xl text-sm leading-6 text-muted",
						children: "Search stays inside Anime. Series and film groupings use your saved tags and straightforward title cues, so nothing is guessed from a streaming site."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => setSource("home"),
						children: "Add library media"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-col gap-3 lg:flex-row lg:items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: query,
						onChange: (event) => {
							setQuery(event.target.value);
							setLimit(36);
						},
						placeholder: "Search your anime titles and tags",
						"aria-label": "Search anime library",
						className: "lg:max-w-md"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						role: "group",
						"aria-label": "Anime shelf filters",
						children: filters.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: filter === item.id ? "default" : "secondary",
							onClick: () => {
								setFilter(item.id);
								setLimit(36);
							},
							children: [
								item.label,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1 font-mono tabular-nums opacity-70",
									children: item.count
								})
							]
						}, item.id))
					})]
				})]
			}),
			filtered.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex flex-wrap items-baseline justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: filters.find((item) => item.id === filter)?.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								filtered.length.toLocaleString(),
								" matching title",
								filtered.length === 1 ? "" : "s"
							]
						})] }), query && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => setQuery(""),
							children: "Clear search"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6",
						children: filtered.slice(0, limit).map((video, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, {
							video,
							variant: "grid",
							index
						}, video.id))
					}),
					limit < filtered.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 flex justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => setLimit((value) => value + 36),
							children: "Show 36 more"
						})
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium text-fg",
					children: "No matching anime titles yet."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-2xl text-sm leading-6 text-muted",
					children: "Add a local or authorized library source, then use the title finder below to give the right cards a saved #anime tag. Existing media, ratings, history, and resume points remain untouched."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-lg bg-elevated p-4 shadow-border sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Tag a title into Anime"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-2xl text-sm leading-6 text-muted",
						children: "Use this for filenames that do not say “anime” or “manga.” The tag is saved locally, searchable across the app, and included in your existing recovery export."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-col gap-3 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: tagQuery,
							onChange: (event) => setTagQuery(event.target.value),
							placeholder: "Find a title already in your library",
							"aria-label": "Find a library title to tag as anime",
							className: "sm:max-w-xl"
						}), tagQuery && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => setTagQuery(""),
							children: "Clear"
						})]
					}),
					tagQuery && !tagMatches.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "No catalog titles match that search."
					}),
					tagMatches.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-2",
						children: tagMatches.map((video) => {
							const alreadyAnime = topicsForVideo(video, tags[video.id] ?? []).includes("anime");
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-3 rounded-md bg-bg/45 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm font-medium text-fg",
										children: video.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-0.5 truncate text-xs text-muted",
										children: [
											video.genre || video.extension.toUpperCase(),
											" · ",
											video.remote?.channelName ?? (video.remote ? video.remote.kind : "Local library")
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: alreadyAnime ? "secondary" : "default",
									disabled: alreadyAnime,
									onClick: () => markAnime(video),
									children: alreadyAnime ? "In Anime" : "Add #anime"
								})]
							}, video.id);
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-lg border border-border bg-elevated/70 p-4 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Source boundary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-3xl text-sm leading-6 text-muted",
						children: "Realhub does not fetch, download, proxy, or embed video from unverified third-party streaming sites. The Anime desk only organizes media already added to your catalog, and sends external viewing choices through the separate Streaming desk."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						className: "mt-3",
						onClick: () => setSource("streaming"),
						children: "Open streaming destinations"
					})
				]
			})
		]
	});
}
function StatsSection() {
	const videos = useLibrary((s) => s.videos);
	const folders = useLibrary((s) => s.folders);
	const tags = useLibrary((s) => s.tags);
	const favorites = useLibrary((s) => s.favorites);
	const likes = useLibrary((s) => s.likes);
	const history = useLibrary((s) => s.history);
	const cameCounts = useLibrary((s) => s.cameCounts);
	const unavailable = useLibrary((s) => s.unavailable);
	const progress = useLibrary((s) => s.progress);
	const resumeProgress = useLibrary((s) => s.resumeProgress);
	const viewCounts = useLibrary((s) => s.viewCounts);
	const pullHistory = useLibrary((s) => s.pullHistory);
	const [remediationView, setRemediationView] = (0, import_react.useState)("");
	const [favoriteRevision, setFavoriteRevision] = (0, import_react.useState)(0);
	const [previewHealthRevision, setPreviewHealthRevision] = (0, import_react.useState)(0);
	const [recoveryNote, setRecoveryNote] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const refresh = () => setFavoriteRevision((value) => value + 1);
		window.addEventListener("reelcase:rating-change", refresh);
		return () => window.removeEventListener("reelcase:rating-change", refresh);
	}, []);
	(0, import_react.useEffect)(() => {
		const refresh = () => setPreviewHealthRevision((value) => value + 1);
		window.addEventListener("reelcase:preview-health", refresh);
		return () => window.removeEventListener("reelcase:preview-health", refresh);
	}, []);
	const observedPreviewHealth = (0, import_react.useMemo)(() => getAdultPreviewHealth(), [previewHealthRevision]);
	const stats = useLibraryStats((0, import_react.useMemo)(() => ({
		videos,
		folders,
		tags,
		favorites,
		likes,
		unavailable,
		history,
		cameCounts,
		progress,
		resumeProgress,
		viewCounts,
		pullHistory
	}), [
		videos,
		folders,
		tags,
		favorites,
		likes,
		unavailable,
		history,
		cameCounts,
		progress,
		resumeProgress,
		viewCounts,
		pullHistory
	]), favoriteRevision);
	const [showTopicLinks, setShowTopicLinks] = (0, import_react.useState)(false);
	if (!stats.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Library intelligence",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-4" }),
		title: "Know what your library needs next.",
		copy: "Counts are calculated locally while the rest of the app stays responsive.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "status",
			className: "mt-6 text-sm text-muted",
			children: stats.error ? "Statistics could not be calculated." : "Calculating library statistics…"
		}), stats.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: () => setFavoriteRevision((value) => value + 1),
			children: "Retry statistics"
		})]
	});
	const { watchScores, summary, youtubeHealth, youtubeMappedCounts, folderRows, topicReviewQueue, adultTagStats, favoriteHealth, sourceHealth, pullTotals, unavailableCount = 0, adultSnapshot, markedTitles, totalMarks, markedRows } = stats.data;
	const exportStats = () => {
		const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		const feedback = exportFeedback();
		downloadCsv([
			["metric", "value"],
			["catalog_titles", videos.length],
			["topic_tags_per_title", summary.tagDensity.toFixed(3)],
			["remote_catalog_percent", Math.round(summary.remoteShare * 100)],
			["local_storage_bytes_per_local_title", Math.round(summary.totalBytes / Math.max(summary.localTitles, 1))],
			["local_storage_bytes", summary.totalBytes],
			["topic_tag_assignments", summary.tagAssignments],
			["favorites", favoriteHealth.saved],
			["pull_runs_retained", pullTotals.runs],
			["pull_successful_runs", pullTotals.successful],
			["pull_partial_runs", pullTotals.partial],
			["pull_failed_runs", pullTotals.failed],
			["pull_creators_checked", pullTotals.checked],
			["pull_videos_returned", pullTotals.returned],
			["pull_new_videos", pullTotals.added],
			["local_titles", summary.localTitles],
			["remote_titles", summary.remoteTitles],
			["untagged_titles", summary.untaggedTitles],
			["fresh_remote_titles_7d", summary.freshRemoteTitles],
			["youtube_titles", summary.youtubeTitles],
			["twitch_titles", summary.twitchTitles],
			["live_titles", summary.liveTitles],
			["poster_ready_titles", summary.thumbReady],
			["unavailable_titles", unavailableCount],
			["history_events", history.length],
			["topic_tag_coverage_percent", Math.round((summary.publicTopicTitles - summary.untaggedTitles) / Math.max(summary.publicTopicTitles, 1) * 100)],
			["public_topic_titles", summary.publicTopicTitles],
			["saved_topic_titles", summary.savedTopicTitles],
			["derived_only_topic_titles", summary.publicTopicTitles - summary.untaggedTitles - summary.savedTopicTitles],
			["youtube_distinct_video_ids", youtubeHealth.distinctVideos],
			["youtube_duplicate_cached_rows", youtubeHealth.duplicateRows],
			["largest_source_percent", sourceHealth.concentration],
			["duplicate_source_names", sourceHealth.duplicateNames.length],
			["metadata_tagged_titles", summary.metadataTaggedTitles],
			["metadata_tag_coverage_percent", Math.round(summary.metadataTaggedTitles / Math.max(videos.length, 1) * 100)],
			["creator_tagged_titles", summary.creatorTaggedTitles],
			["titles_with_description", summary.descriptionTaggedTitles],
			["multi_topic_titles", summary.multiTopicTitles],
			["cross_source_bridge_topics", summary.bridgeTopics],
			["operational_tag_assignments", summary.operationalTagAssignments],
			["useful_topic_share_percent", Math.round((summary.publicTopicTitles - summary.untaggedTitles) / Math.max(summary.publicTopicTitles, 1) * 100)],
			["favorites_saved", favoriteHealth.saved],
			["favorites_resolved", favoriteHealth.resolved],
			["favorites_waiting_for_source", favoriteHealth.missing],
			["video_ratings_saved", Object.keys(feedback.ratings).length],
			["creator_ratings_saved", Object.keys(feedback.creatorRatings).length],
			["creator_likes_saved", Object.keys(feedback.creatorLikes).length],
			["notes_saved", Object.keys(feedback.notes).length],
			["known_duration_titles", summary.durationTitles],
			["known_duration_hours", Math.round(summary.knownDuration / 3600)],
			["resume_marks", summary.resumedTitles],
			["local_view_events", summary.totalViews],
			...summary.genreRows.map(([name, count]) => [`genre:${name}`, count]),
			...summary.topTags.map(([name, count]) => [`topic_tag:${name}`, count]),
			...sourceHealth.duplicateNames.map(({ name, count }) => [`duplicate_source:${name}`, count])
		], `reelcase-library-insights-${stamp}.csv`);
	};
	const exportSources = () => downloadCsv([[
		"source",
		"kind",
		"mapped_titles",
		"local_storage_bytes",
		"last_checked",
		"source_id",
		"primary_folder_titles"
	], ...folderRows.map(({ folder, videos: mapped, bytes: mappedBytes }) => [
		folder.name,
		folder.kind,
		mapped,
		mappedBytes,
		folder.lastCheckedAt ? new Date(folder.lastCheckedAt).toISOString() : "",
		folder.id,
		summary.byFolder.get(folder.id)?.videos ?? 0
	])], `reelcase-source-map-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`);
	const exportRemediation = () => downloadCsv([
		[
			"queue",
			"priority",
			"title_or_source",
			"reason",
			"suggested_safe_action"
		],
		...topicReviewQueue.map((video, index) => [
			"topic-coverage",
			index + 1,
			video.name,
			"No saved or inferred public topic",
			"Review in preview or apply explainable smart tags"
		]),
		...sourceHealth.duplicateNames.flatMap(({ name, count }) => [[
			"source-hygiene",
			1,
			name,
			`${count} identical source labels`,
			"Open source map and rename only after review"
		]]),
		...sourceHealth.largest ? [[
			"storage-concentration",
			1,
			sourceHealth.largest.folder.name,
			`${sourceHealth.concentration}% of mapped local bytes`,
			"Review source contents; no files are changed automatically"
		]] : []
	], `reelcase-remediation-plan-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`);
	const importRecoveryPack = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".zip,.json,.csv,application/zip,application/json,text/csv";
		input.onchange = () => {
			const file = input.files?.[0];
			if (!file) return;
			if (!window.confirm("Merge this Realhub recovery pack? Current catalog and activity stay intact.")) return;
			importLibraryPackZip(file, {
				getFollows: () => useLibrary.getState().follows,
				setFollows: (follows) => useLibrary.setState({ follows }),
				getHistory: () => useLibrary.getState().history,
				setHistory: (history) => useLibrary.setState({ history }),
				getViewCounts: () => useLibrary.getState().viewCounts,
				getCameCounts: () => useLibrary.getState().cameCounts,
				setMarks: (viewCounts, cameCounts) => useLibrary.setState({
					viewCounts,
					cameCounts
				}),
				getFavorites: () => Object.keys(useLibrary.getState().favorites),
				getLikes: () => Object.keys(useLibrary.getState().likes),
				setShelves: (favorites, likes) => useLibrary.setState({
					favorites: Object.fromEntries(favorites.map((id) => [id, true])),
					likes: Object.fromEntries(likes.map((id) => [id, true]))
				}),
				getProgress: () => useLibrary.getState().progress,
				getResumeProgress: () => useLibrary.getState().resumeProgress,
				setResume: (progress, resumeProgress) => useLibrary.setState({
					progress,
					resumeProgress
				}),
				getLinks: () => linksFromHistoryAndResume(useLibrary.getState().history, useLibrary.getState().resumeProgress),
				setLinks: () => {}
			}).then((result) => setRecoveryNote(`Recovered +${result.historyMerged} activity entries · +${result.followsAdded} follows · +${result.linksMerged} saved links${result.feedbackMerged ? " · ratings and hearts merged" : ""}${result.warnings.length ? ` · ${result.warnings[0]}` : ""}.`)).catch((error) => setRecoveryNote(error instanceof Error ? error.message : "Recovery import failed."));
		};
		input.click();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Library intelligence",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-4" }),
		title: "Know what your library needs next.",
		copy: "These local-only counts help identify coverage gaps, oversized source folders, and the tags that are driving discovery.",
		children: [
			stats.pending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-3 text-xs text-muted",
				children: "Updating statistics…"
			}),
			stats.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-3 text-xs text-muted",
				children: "Statistics could not update. Showing the last completed snapshot."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RankingPanel, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-2 rounded-xl border border-border bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "How your ratings work"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "Your choices steer discovery"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-6 text-muted",
						children: "1 star lowers a video and its related topics. 2 stars is neutral. 3 to 5 stars raise recommendations progressively. Favorites and likes add separate positive signals. Watch time is a smaller secondary score: preview and full player time count separately, while seeking adds nothing. Local playback is measured directly; visible YouTube and Twitch embeds contribute a lower-weight estimate."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 rounded-lg bg-bg/50 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium text-fg",
								children: "Most watched videos"
							}), watchScores.videos.length ? watchScores.videos.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 truncate text-xs text-muted",
								title: row.video.name,
								children: [
									row.video.name,
									" · preview ",
									Math.floor(row.preview / 60),
									"m · player ",
									Math.floor(row.fullscreen / 60),
									"m",
									row.previewEstimated || row.fullscreenEstimated ? ` · embed estimate ${Math.floor(((row.previewEstimated ?? 0) + (row.fullscreenEstimated ?? 0)) / 60)}m` : "",
									" · +",
									row.score
								]
							}, row.video.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted",
								children: "Watch time will appear after playback."
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 rounded-lg bg-bg/50 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium text-fg",
								children: "Most watched tags"
							}), watchScores.tags.length ? watchScores.tags.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 truncate text-xs text-muted",
								children: [
									"#",
									row.tag,
									" · preview ",
									Math.floor(row.preview / 60),
									"m · player ",
									Math.floor(row.fullscreen / 60),
									"m",
									row.previewEstimated || row.fullscreenEstimated ? ` · embed estimate ${Math.floor((row.previewEstimated + row.fullscreenEstimated) / 60)}m` : "",
									" · +",
									row.score
								]
							}, row.tag)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted",
								children: "Tags inherit watch time from videos you play."
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-xl border border-border bg-surface p-5 shadow-border",
				"aria-label": "Pull success statistics",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Pull success"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 font-display text-2xl text-fg",
								children: "Know what updated—and what didn’t."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-2xl text-sm text-muted",
								children: "Recent refresh, archive, import, and creator-pull results are saved locally. A returned count can include already-cached videos; “new” counts only additions."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "rounded-full bg-bg/55 px-3 py-1 text-xs text-muted",
							children: [pullTotals.runs, " recent runs retained"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-elevated p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "Clean-run rate"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-display text-2xl tabular-nums text-fg",
									children: pullTotals.runs ? `${Math.round(pullTotals.successful / pullTotals.runs * 100)}%` : "—"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-elevated p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "Successful"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-display text-2xl tabular-nums text-fg",
									children: pullTotals.successful.toLocaleString()
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-elevated p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "Partial"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-display text-2xl tabular-nums text-fg",
									children: pullTotals.partial.toLocaleString()
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-elevated p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "Failed"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-display text-2xl tabular-nums text-fg",
									children: pullTotals.failed.toLocaleString()
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-elevated p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "Targets checked"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-display text-2xl tabular-nums text-fg",
									children: pullTotals.checked.toLocaleString()
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-elevated p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "Videos returned · new"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 font-display text-2xl tabular-nums text-fg",
									children: [
										pullTotals.returned.toLocaleString(),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-sm text-muted",
											children: ["· ", pullTotals.added.toLocaleString()]
										})
									]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 divide-y divide-border rounded-md bg-bg/35",
						children: [pullHistory.slice(0, 12).map((run) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
							className: "px-3 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
									className: "flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "min-w-24 font-medium text-fg",
											children: run.provider === "youtube" ? "YouTube" : run.provider === "twitch" ? "Twitch" : run.provider === "adult" ? "Adult sources" : run.provider === "photos" ? "Photos" : "Multiple sources"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted",
											children: run.action
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "ml-auto text-xs text-muted",
											children: [
												run.done,
												"/",
												run.total,
												" targets · ",
												run.received,
												" returned · ",
												run.added,
												" new · ",
												run.failed,
												" failed"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `rounded-full px-2 py-0.5 text-xs ${run.status === "success" ? "bg-accent/15 text-accent" : run.status === "partial" ? "bg-bg text-fg" : "bg-danger/15 text-danger"}`,
											children: run.status
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-xs text-muted",
									children: [
										new Date(run.finishedAt).toLocaleString(),
										" · ",
										run.targets.slice(0, 8).join(", "),
										run.targets.length > 8 ? ` + ${run.targets.length - 8} more` : ""
									]
								}),
								run.errors?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 space-y-1 text-xs text-danger",
									children: run.errors.map((error, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: error }, `${run.id}:${index}`))
								}) : null
							]
						}, run.id)), !pullHistory.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-3 py-4 text-sm text-muted",
							children: "Pull results will appear here after your next refresh or creator pull."
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "adult-stats",
				className: "mt-2 scroll-mt-24 rounded-xl border border-accent/35 bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Adult division"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 font-display text-3xl text-fg",
								children: "Adult tags, sources & export"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-3xl text-sm text-muted",
								children: "Pinned at the top of Stats so Adult coverage is obvious. Counts stay on this device; pull the Adults catalog if this panel is empty."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => exportAdultStats(adultSnapshot, "csv"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Adult CSV"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => exportAdultStats(adultSnapshot, "json"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Adult JSON"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									onClick: () => useLibrary.getState().setSource("adults"),
									children: "Open Adults"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-bg/45 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "Adult titles"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-lg font-medium text-fg",
									children: adultTagStats.adultTitles.toLocaleString()
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-bg/45 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: "Adult tag coverage"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-lg font-medium text-fg",
										children: [Math.round(adultTagStats.adultTagCoverage.share * 100), "%"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted",
										children: [adultTagStats.adultTagCoverage.tagged.toLocaleString(), " tagged"]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-bg/45 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "Marked (I cummed)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-lg font-medium text-fg",
									children: markedTitles.toLocaleString()
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-bg/45 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "Total marks"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-lg font-medium text-fg",
									children: totalMarks.toLocaleString()
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-bg/45 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: "Preview URLs supplied"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-lg font-medium text-fg",
										children: [Math.round(adultTagStats.previewCoverage.share * 100), "%"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted",
										children: [adultTagStats.previewCoverage.ready.toLocaleString(), " cards declare artwork; loading is measured separately"]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-bg/45 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: "Observed preview loads"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-lg font-medium text-fg",
										children: observedPreviewHealth.tested ? `${Math.round(observedPreviewHealth.share * 100)}%` : "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted",
										children: [
											observedPreviewHealth.loaded,
											" loaded · ",
											observedPreviewHealth.failed,
											" failed · ",
											observedPreviewHealth.tested,
											" tested this session"
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-bg/45 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: "Creator credit"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-lg font-medium text-fg",
										children: [Math.round(adultTagStats.creatorCoverage.share * 100), "%"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted",
										children: [adultTagStats.creatorCoverage.uniqueCreators.toLocaleString(), " normalized creators"]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-bg/45 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: "Duplicate candidates"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-lg font-medium text-fg",
										children: adultTagStats.dedupe.extraTitles.toLocaleString()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted",
										children: [
											"across ",
											adultTagStats.dedupe.candidateGroups.toLocaleString(),
											" media groups"
										]
									})
								]
							})
						]
					}),
					adultTagStats.providerMix.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Adult provider mix"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted",
								children: "Every configured Adult source is shown. Empty means the current catalog has no returned titles yet."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 flex flex-wrap gap-2",
								children: adultTagStats.providerMix.map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: `rounded-full px-3 py-1 text-xs font-medium ${source.status === "active" ? "bg-accent/15 text-accent" : "bg-bg/45 text-muted"}`,
									children: [
										source.label,
										" · ",
										source.titles.toLocaleString(),
										" · ",
										Math.round(source.share * 100),
										"%"
									]
								}, source.provider))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4",
								children: adultTagStats.providerMix.filter((source) => source.titles || source.linkedTitles).map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-md bg-bg/45 p-3 text-xs text-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-medium text-fg",
											children: [
												source.label,
												" · ",
												source.titles.toLocaleString(),
												" primary",
												source.linkedTitles ? ` · ${source.linkedTitles.toLocaleString()} linked` : ""
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1",
											children: [
												"Artwork URLs ",
												Math.round(source.previewCoverage.share * 100),
												"% · backup URLs ",
												Math.round(source.backupPreviewCoverage.share * 100),
												"%"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
											"Creator ",
											Math.round(source.creatorCoverage.share * 100),
											"% · interests ",
											Math.round(source.usefulTagCoverage.share * 100),
											"%"
										] }),
										source.duplicateCandidates > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-accent",
											children: [source.duplicateCandidates.toLocaleString(), " duplicate candidates"]
										})
									]
								}, `${source.provider}-quality`))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-5 grid gap-5 xl:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "h-72 rounded-lg bg-bg/45 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
									children: "Artwork availability by source"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted",
									children: "Declared artwork URLs by provider. Actual image loading is measured above from cards opened this session."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewportChart, {
									height: "78%",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
										data: adultTagStats.providerMix.filter((row) => row.titles > 0).map((row) => ({
											name: row.label,
											ready: Math.round(row.previewCoverage.share * 100),
											backup: Math.round(row.backupPreviewCoverage.share * 100)
										})),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
												dataKey: "name",
												stroke: "currentColor",
												fontSize: 10,
												interval: 0,
												angle: -20,
												textAnchor: "end",
												height: 54
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
												domain: [0, 100],
												stroke: "currentColor",
												fontSize: 12
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
												isAnimationActive: false,
												dataKey: "ready",
												name: "Artwork URLs supplied %",
												fill: "var(--color-accent)",
												radius: 4
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
												isAnimationActive: false,
												dataKey: "backup",
												name: "Backup paths %",
												fill: "var(--color-muted)",
												radius: 4
											})
										]
									})
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "h-72 rounded-lg bg-bg/45 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
									children: "Most applied Adult interests"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted",
									children: "Only recurring interest labels are shown; provider, creator, and parser labels are excluded."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewportChart, {
									height: "78%",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
										layout: "vertical",
										margin: { left: 16 },
										data: adultTagStats.topFetish.slice(0, 8).map(([tag, count]) => ({
											name: tag.replace(/^fetish-/, ""),
											titles: count
										})),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
												type: "number",
												stroke: "currentColor",
												fontSize: 12
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
												type: "category",
												dataKey: "name",
												width: 122,
												stroke: "currentColor",
												fontSize: 10
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
												isAnimationActive: false,
												dataKey: "titles",
												fill: "var(--color-accent)",
												radius: 4
											})
										]
									})
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-5 grid gap-5 xl:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "h-72 rounded-lg bg-bg/45 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
										children: "Adult media mix"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: "Videos, live rooms, and photos currently in the Adult catalog."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewportChart, {
										height: "78%",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
											isAnimationActive: false,
											dataKey: "value",
											nameKey: "name",
											data: [
												{
													name: "Videos",
													value: adultTagStats.kindCounts.videos
												},
												{
													name: "Live",
													value: adultTagStats.kindCounts.live
												},
												{
													name: "Photos",
													value: adultTagStats.kindCounts.photos
												}
											].filter((row) => row.value > 0),
											innerRadius: 42,
											outerRadius: 72,
											paddingAngle: 2,
											children: [
												"var(--color-accent)",
												"var(--color-muted)",
												"#7c6cff"
											].map((color, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: color }, color))
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {})] })
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "h-72 rounded-lg bg-bg/45 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
										children: "Booru host mix"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: "Rule34 is listed first so its filter chip stays accountable."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewportChart, {
										height: "78%",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
											data: adultTagStats.booruHosts.slice(0, 8).map((row) => ({
												name: row.host,
												titles: row.count
											})),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
													dataKey: "name",
													stroke: "currentColor",
													fontSize: 10,
													interval: 0,
													angle: -20,
													textAnchor: "end",
													height: 54
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
													stroke: "currentColor",
													fontSize: 12
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
													isAnimationActive: false,
													dataKey: "titles",
													fill: "var(--color-accent)",
													radius: 4
												})
											]
										})
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg bg-bg/45 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
									children: "Adult engagement table"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 overflow-x-auto",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
										className: "w-full text-left text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "text-muted",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-1 pr-3 font-medium",
												children: "Metric"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "py-1 font-medium",
												children: "Value"
											})]
										}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
											className: "text-fg",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
													className: "border-t border-border/60",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "py-1.5 pr-3",
														children: "Local view events"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: adultTagStats.adultViews.toLocaleString() })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
													className: "border-t border-border/60",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "py-1.5 pr-3",
														children: "Resume watch time"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [adultTagStats.adultWatchHours.toFixed(1), " h"] })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
													className: "border-t border-border/60",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "py-1.5 pr-3",
														children: "Rated titles"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: adultTagStats.adultRated.toLocaleString() })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
													className: "border-t border-border/60",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "py-1.5 pr-3",
														children: "History events"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: adultTagStats.historyAdult.toLocaleString() })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
													className: "border-t border-border/60",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "py-1.5 pr-3",
														children: "1-video tags ranked"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: adultTagStats.sparseTags.toLocaleString() })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
													className: "border-t border-border/60",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "py-1.5 pr-3",
														children: "Rule34 cards"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: (adultTagStats.booruHosts.find((row) => row.host === "rule34")?.count ?? 0).toLocaleString() })]
												})
											]
										})]
									})
								})]
							})
						]
					}),
					adultTagStats.booruHosts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 overflow-x-auto rounded-md bg-bg/45 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Booru hosts"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "mt-2 w-full min-w-[28rem] text-left text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1 pr-3",
										children: "Host"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1 pr-3",
										children: "Titles"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1",
										children: "Share"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: adultTagStats.booruHosts.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border/60 text-fg",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-1.5 pr-3 font-medium",
										children: row.host
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-1.5 pr-3",
										children: row.count.toLocaleString()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-1.5",
										children: adultTagStats.adultTitles ? `${Math.round(row.count / adultTagStats.adultTitles * 100)}%` : "—"
									})
								]
							}, row.host)) })]
						})]
					}),
					(adultTagStats.genres.length > 0 || adultTagStats.metaTags.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Mapped genres"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: adultTagStats.genres.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "rounded-full bg-bg/45 px-3 py-1 text-xs text-fg",
								children: [
									row.label,
									" · ",
									row.count
								]
							}, row.tag))
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Recommendation metatags"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: adultTagStats.metaTags.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "rounded-full bg-bg/45 px-3 py-1 text-xs text-fg",
								children: [
									row.tag.replace(/^meta-/, "").replace(/-/g, " "),
									" · ",
									row.count
								]
							}, row.tag))
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-md bg-bg/45 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Tag health & connections"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted",
								children: [
									adultTagStats.tagQuality.usefulTagged.toLocaleString(),
									" titles have a useful interest, averaging ",
									adultTagStats.tagQuality.averageUsefulTags.toFixed(1),
									" interests per title. ",
									adultTagStats.noisyTagAssignments ? `${adultTagStats.noisyTagAssignments.toLocaleString()} old parser-style labels are excluded from ranking.` : "No parser-style labels are influencing rankings."
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => {
									useLibrary.getState().autoTagLibrary().catch(() => void 0);
								},
								children: "Repair Adult tags"
							})]
						}), adultTagStats.tagConnections.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: adultTagStats.tagConnections.map((connection) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "rounded-full border border-border px-3 py-1 text-xs text-fg",
								children: [
									"#",
									connection.left,
									" + #",
									connection.right,
									" · ",
									connection.count,
									" · ",
									connection.lift.toFixed(1),
									"× · ",
									connection.providerCount,
									" sources"
								]
							}, `${connection.left}-${connection.right}`))
						})]
					}),
					adultTagStats.redditTags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-md bg-bg/45 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Reddit source coverage"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: "Your stored community tags are counted separately from generic Reddit labels, so favorites and source-list changes can guide future pulls."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: adultTagStats.redditTags.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "rounded-full border border-border px-3 py-1 text-xs text-fg",
									children: [
										"#",
										row.tag.replace(/^sub-/, ""),
										" · ",
										row.count
									]
								}, row.tag))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Your adult tags"
						}), adultTagStats.topFetish.length || adultTagStats.topSources.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: adultTagStats.topFetish.map(([tag, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "rounded-full bg-bg/45 px-3 py-1 text-xs text-fg",
								children: [
									"#",
									tag,
									" · ",
									count
								]
							}, tag))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: adultTagStats.topSources.map(([tag, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "rounded-full bg-bg/45 px-3 py-1 text-xs text-muted",
								children: [
									"#",
									tag,
									" · ",
									count
								]
							}, tag))
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "No adult tags yet. Open Adults and pull the catalog — source/fetish tags appear here automatically."
						})]
					}),
					markedTitles > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "I cummed to it"
						}), markedRows.map(({ id, n, name }) => {
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "block w-full rounded-sm bg-bg/45 px-3 py-2 text-left text-sm text-fg",
								onClick: () => useLibrary.getState().openPreview(id),
								children: [name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-2 text-xs text-accent",
									children: [
										"· ",
										n,
										"×"
									]
								})]
							}, id);
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => setShowTopicLinks((value) => !value),
					"aria-expanded": showTopicLinks,
					children: showTopicLinks ? "Close connected topics" : "Explore connected topics"
				}), showTopicLinks && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopicLinks, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: exportStats,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Download insight CSV"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: exportSources,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Download source-map CSV"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: exportRemediation,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Download remediation CSV"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "self-center text-xs text-muted",
						children: "Exports only local catalog metadata, useful for improving sorting and discovery rules."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg border border-border bg-elevated p-4 shadow-border",
				"aria-label": "Stats recovery import",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Recovery import"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 text-lg font-medium text-fg",
							children: "Bring back your exported signals."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 max-w-2xl text-xs leading-5 text-muted",
							children: "Import a Realhub library pack to merge exported history, resume marks, favorites, follows, ratings, Adult marks, and saved links. Insight CSV files stay read-only reports; use the pack for recovery."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: importRecoveryPack,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }), "Import recovery pack"]
					})]
				}), recoveryNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-accent",
					role: "status",
					children: recoveryNote
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Catalog titles",
						value: videos.length.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Local storage mapped",
						value: bytes(summary.totalBytes)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Saved topic assignments",
						value: summary.tagAssignments.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Favorites",
						value: favoriteHealth.saved.toLocaleString()
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Local / remote",
						value: `${summary.localTitles.toLocaleString()} / ${summary.remoteTitles.toLocaleString()}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Remote catalog share",
						value: `${Math.round(summary.remoteShare * 100)}%`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "New provider items · 7d",
						value: summary.freshRemoteTitles.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Needs useful topic",
						value: `${summary.untaggedTitles.toLocaleString()} titles`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Connected topic coverage",
						value: `${Math.round((summary.publicTopicTitles - summary.untaggedTitles) / Math.max(summary.publicTopicTitles, 1) * 100)}%`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Saved topic coverage",
						value: `${Math.round(summary.savedTopicTitles / Math.max(summary.publicTopicTitles, 1) * 100)}%`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "YouTube duplicate rows",
						value: youtubeHealth.duplicateRows.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Topic tags per title",
						value: summary.tagDensity.toFixed(2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Cross-source topic bridges",
						value: summary.bridgeTopics.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Multi-topic titles",
						value: summary.multiTopicTitles.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Operational labels",
						value: summary.operationalTagAssignments.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Any metadata coverage",
						value: `${Math.round(summary.metadataTaggedTitles / Math.max(videos.length, 1) * 100)}%`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Creator / description coverage",
						value: `${summary.creatorTaggedTitles.toLocaleString()} / ${summary.descriptionTaggedTitles.toLocaleString()}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "YouTube / Twitch",
						value: `${summary.youtubeTitles.toLocaleString()} / ${summary.twitchTitles.toLocaleString()}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Known runtime",
						value: `${Math.round(summary.knownDuration / 3600).toLocaleString()} hours`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Resume marks",
						value: summary.resumedTitles.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Local view events",
						value: summary.totalViews.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Saved live entries",
						value: summary.liveTitles.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Artwork coverage",
						value: `${Math.round(summary.thumbReady / Math.max(videos.length, 1) * 100)}%`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "History events",
						value: history.length.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Unavailable cards",
						value: unavailableCount.toLocaleString()
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg border border-border bg-surface p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Fast paths from your library"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "Use the small, useful slice first."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-3xl text-sm leading-6 text-muted",
						children: "Topic, Continue, and source views now reuse saved metadata and mount cards progressively. Favorite topics lead every topic list so the first results match what you actually want to browse."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3 md:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-elevated p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: "Favorite topics"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-lg font-medium text-fg",
										children: summary.topicRows.filter(([topic]) => tagIsLiked(topic)).length
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: "Pinned ahead of large catalog scans."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-elevated p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: "Ready to resume"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-lg font-medium text-fg",
										children: summary.resumedTitles.toLocaleString()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: "Stable resume records survive catalog refreshes."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "mt-3",
										size: "sm",
										variant: "secondary",
										onClick: () => useLibrary.getState().setSource("continue"),
										children: "Open Continue"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md bg-elevated p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: "Metadata-first catalog"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-lg font-medium text-fg",
										children: [Math.round(summary.metadataTaggedTitles / Math.max(videos.length, 1) * 100), "%"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: "Existing metadata is used before slower title-only inference."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "mt-3",
										size: "sm",
										variant: "secondary",
										onClick: () => useLibrary.getState().setSource("genres"),
										children: "Open Topics"
									})
								]
							})
						]
					}),
					summary.topicRows.filter(([topic]) => tagIsLiked(topic)).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: summary.topicRows.filter(([topic]) => tagIsLiked(topic)).slice(0, 12).map(([topic, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => openTopic(topic),
							children: [
								"★ #",
								topic,
								" · ",
								count.toLocaleString()
							]
						}, topic))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 grid gap-5 xl:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "h-[42rem] min-w-0 rounded-lg bg-elevated p-5 shadow-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl text-fg",
							children: "Provider mix"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted",
							children: "Includes local, public video providers, and the active Adult catalog sources."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewportChart, {
							height: "88%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								data: [
									{
										name: "Local",
										titles: summary.localTitles
									},
									{
										name: "YouTube",
										titles: summary.youtubeTitles
									},
									{
										name: "Twitch",
										titles: summary.twitchTitles
									},
									...adultTagStats.providerMix.filter((row) => row.titles > 0).map((row) => ({
										name: row.label,
										titles: row.titles
									}))
								],
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "name",
										stroke: "currentColor",
										fontSize: 10,
										interval: 0,
										angle: -24,
										textAnchor: "end",
										height: 50
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										stroke: "currentColor",
										fontSize: 12
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										isAnimationActive: false,
										dataKey: "titles",
										fill: "var(--color-accent)",
										radius: 4
									})
								]
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "h-[42rem] min-w-0 rounded-lg bg-elevated p-5 shadow-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl text-fg",
							children: "Most useful topics"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted",
							children: "Preference points use feedback ÷ (feedback count + 3), times 10; a heart adds 12. Titles without feedback add no votes. Up to 20 topics."
						}),
						!summary.topTags.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-8 text-sm text-muted",
							children: "Heart, like, or rate a tagged video to build your topic ranking."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewportChart, {
							height: "88%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								layout: "vertical",
								margin: { left: 16 },
								data: summary.topTags.map(([name, titles]) => ({
									name,
									titles,
									score: Number(topicPreferenceScore(summary.topicRatings.get(name)?.total ?? 0, summary.topicRatings.get(name)?.rated ?? 0, tagIsLiked(name)).toFixed(2))
								})).filter((topic) => topic.score > 0).slice(0, 20),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										type: "number",
										stroke: "currentColor",
										fontSize: 12
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										type: "category",
										dataKey: "name",
										width: 150,
										stroke: "currentColor",
										fontSize: 10
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										isAnimationActive: false,
										dataKey: "score",
										fill: "var(--color-accent)",
										radius: 4
									})
								]
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 grid gap-3 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Tagging backlog"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-display text-3xl text-fg",
								children: summary.untaggedTitles.toLocaleString()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: "titles still need a useful topic tag. Prioritize these before adding more discovery rules."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-3",
								size: "sm",
								variant: "secondary",
								onClick: () => setRemediationView(remediationView === "topics" ? "" : "topics"),
								children: "Review safe queue"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Storage concentration"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 font-display text-3xl text-fg",
								children: [sourceHealth.concentration, "%"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted",
								children: [
									"of mapped local bytes sit in ",
									sourceHealth.largest?.folder.name ?? "the largest source",
									"."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-3",
								size: "sm",
								variant: "secondary",
								onClick: () => setRemediationView(remediationView === "sources" ? "" : "sources"),
								children: "Review source queue"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Source hygiene"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-display text-3xl text-fg",
								children: sourceHealth.duplicateNames.length
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: "duplicate source labels can make refresh results harder to interpret."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-3",
								size: "sm",
								variant: "secondary",
								onClick: () => setRemediationView(remediationView === "sources" ? "" : "sources"),
								children: "Review duplicates"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Heart recovery"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 font-display text-3xl text-fg",
								children: [
									favoriteHealth.resolved,
									" / ",
									favoriteHealth.saved
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: favoriteHealth.missing ? `${favoriteHealth.missing} saved favorites are waiting for their source to return.` : "Every saved favorite resolves in the current catalog."
							})
						]
					})
				]
			}),
			remediationView === "topics" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Safe tag review queue"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "These are review candidates only—nothing is tagged or deleted by opening this queue."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => useLibrary.getState().setSource("settings"),
						children: "Open smart-tag tools"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 space-y-2",
					children: topicReviewQueue.slice(0, 12).map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "block w-full rounded-sm bg-bg/45 px-3 py-2 text-left text-sm text-fg",
						onClick: () => useLibrary.getState().openPreview(video.id),
						children: [video.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 text-xs text-muted",
							children: "· no useful topic yet"
						})]
					}, video.id))
				})]
			}),
			remediationView === "sources" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Safe source review queue"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Review signals only. Realhub will not rename, reconnect, or remove a folder from this page."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 space-y-2",
						children: [sourceHealth.largest && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "block w-full rounded-sm bg-bg/45 px-3 py-2 text-left text-sm text-fg",
							onClick: () => useLibrary.getState().setSource(sourceHealth.largest.folder.id),
							children: [
								"Largest source · ",
								sourceHealth.largest.folder.name,
								" · ",
								bytes(sourceHealth.largest.bytes)
							]
						}), sourceHealth.duplicateNames.map(({ name, count }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "rounded-sm bg-bg/45 px-3 py-2 text-sm text-fg",
							children: [
								"Duplicate label · ",
								name,
								" · ",
								count,
								" sources"
							]
						}, name))]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg bg-elevated p-5 shadow-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl text-fg",
							children: "Genre distribution"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted",
							children: "Bars compare genres with the most common genre in this list."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 space-y-3",
							children: summary.genreRows.slice(0, 18).map(([genre, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DistributionRow, {
								label: genre,
								value: count,
								total: summary.genreRows[0]?.[1] ?? 1
							}, genre)) || /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "Genres will appear as media is tagged."
							})
						})
					]
				})
			})
		]
	});
}
function LanConnectionSection() {
	const [origin, setOrigin] = (0, import_react.useState)("");
	const [localHost, setLocalHost] = (0, import_react.useState)(false);
	const [quickTunnel, setQuickTunnel] = (0, import_react.useState)({});
	const [tunnelBusy, setTunnelBusy] = (0, import_react.useState)(false);
	const [lanOrigins, setLanOrigins] = (0, import_react.useState)([]);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [companion, setCompanion] = (0, import_react.useState)("checking");
	const [devices, setDevices] = (0, import_react.useState)([]);
	const [mapStatus, setMapStatus] = (0, import_react.useState)("Checking devices…");
	const ownDeviceId = (0, import_react.useMemo)(() => getNetworkDeviceId(), []);
	const refreshDeviceMap = async (signal) => {
		try {
			const result = await listNetworkDevices();
			if (signal?.aborted) return;
			setDevices(result.devices);
			setMapStatus(result.devices.length ? `${result.devices.length} active device${result.devices.length === 1 ? "" : "s"}` : "Waiting for another device to open Realhub");
		} catch {
			if (!signal?.aborted) setMapStatus("Device map is temporarily unavailable");
		}
	};
	(0, import_react.useEffect)(() => {
		const current = window.location;
		const loopback = current.hostname === "localhost" || current.hostname === "127.0.0.1" || current.hostname === "::1";
		setLocalHost(loopback && current.port === "8080");
		let stopTunnel;
		if (loopback && current.port === "8080") stopTunnel = registerPeriodicTask({
			name: "Tunnel status",
			everyMs: 2500,
			firstMs: 0,
			work: async (signal) => {
				try {
					const data = await (await fetch("/api/quick-tunnel", { signal: AbortSignal.any([signal, AbortSignal.timeout(5e3)]) })).json();
					if (!signal.aborted) setQuickTunnel(data);
				} catch {
					if (!signal.aborted) setQuickTunnel({ error: "Tunnel status unavailable." });
				}
			}
		}).cancel;
		setOrigin(loopback ? "" : current.origin);
		if (loopback) fetch("/api/lan-origin").then((response) => response.ok ? response.json() : { origins: [] }).then((data) => setLanOrigins(Array.isArray(data.origins) ? data.origins : [])).catch(() => setLanOrigins([]));
		if (current.port === "8080" && loopback) companionHealth().then((health) => setCompanion(health?.ok ? "ready" : "offline")).catch(() => setCompanion("offline"));
		else setCompanion("offline");
		const task = registerPeriodicTask({
			name: "Device map",
			everyMs: 1e4,
			firstMs: 0,
			work: refreshDeviceMap
		});
		return () => {
			task.cancel();
			stopTunnel?.();
		};
	}, []);
	const changeTunnel = async (action) => {
		setTunnelBusy(true);
		try {
			const response = await fetch("/api/quick-tunnel", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ action })
			});
			setQuickTunnel(await response.json());
		} catch {
			setQuickTunnel({ error: "Could not reach the local tunnel controller." });
		} finally {
			setTunnelBusy(false);
		}
	};
	const copyAddress = async () => {
		if (!origin) return;
		try {
			await navigator.clipboard.writeText(origin);
			setCopied(true);
		} catch {
			setCopied(false);
		}
	};
	const visibleDevices = devices.slice(0, 12);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Home network",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-4" }),
		title: "Bring another screen into Realhub.",
		copy: "Share one address, watch the device map appear, then start a room when everyone is connected.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-elevated p-5 shadow-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Share this address"
					}), origin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 break-all font-mono text-sm text-fg",
							children: origin
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => void copyAddress(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), copied ? "Address copied" : "Copy address"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => useLibrary.getState().setSource("watch-room"),
								children: "Open Watch Room"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-xs leading-5 text-muted",
							children: "On another computer, phone, or TV browser: join the same normal home Wi‑Fi, open this exact address, and leave Realhub open. It will appear in the map below within about 25 seconds."
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-fg",
						children: "This localhost address works only on this computer."
					}), lanOrigins.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-6 text-muted",
						children: "Open Realhub through your home-network address, start a room there, then copy its invitation:"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: lanOrigins.map((candidate) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "rounded-sm bg-elevated px-3 py-2 font-mono text-xs text-accent shadow-border",
							href: candidate,
							children: candidate
						}, candidate))
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-6 text-muted",
						children: "No home-network address was found. Connect this computer to your normal home network, then reopen this guide."
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border bg-surface p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Local companion"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-2xl text-fg",
							children: companion === "ready" ? "Ready on this computer" : companion === "checking" ? "Checking…" : "Not detected"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "The companion speeds up local folders on this computer. Other devices can join the Realhub page and Watch Rooms, but do not receive its local files."
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Across networks · Cloudflare trial"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "Temporary public address"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-3xl text-sm leading-6 text-muted",
						children: "Start a Quick Tunnel on the host computer to give guests a temporary address for Realhub and Watch Room signaling. Share it only with people you invite. The address disappears when you stop the tunnel or close the host server."
					}),
					localHost ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								disabled: tunnelBusy || Boolean(quickTunnel.starting),
								onClick: () => void changeTunnel(quickTunnel.running ? "stop" : "start"),
								children: quickTunnel.running ? "Stop trial tunnel" : quickTunnel.starting ? "Starting…" : "Start trial tunnel"
							}), quickTunnel.url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								onClick: () => void navigator.clipboard.writeText(quickTunnel.url),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), "Copy public address"]
							})]
						}),
						quickTunnel.url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 break-all font-mono text-sm text-accent",
							children: quickTunnel.url
						}),
						quickTunnel.error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm text-muted",
							children: [
								quickTunnel.error,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									className: "text-accent underline",
									href: "https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/",
									target: "_blank",
									rel: "noopener noreferrer",
									children: "Cloudflare install instructions"
								})
							]
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "Open this tab on the host computer to control its trial tunnel."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs leading-5 text-subtle",
						children: "Quick Tunnels are for testing. A tunnel carries the page and room signaling; peer media may still require a TURN relay when direct connectivity fails."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg bg-elevated p-5 shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Available device map"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-2xl text-fg",
							children: mapStatus
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Devices appear only after they open Realhub. The map stores a short-lived browser label, never network addresses or files."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => void refreshDeviceMap(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), "Refresh map"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 grid gap-3 md:grid-cols-[minmax(12rem,0.75fr)_minmax(0,1.25fr)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-md border border-border bg-bg/45 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-5 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium text-fg",
								children: "Realhub host"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: origin || "Local preview"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-xs leading-5 text-muted",
							children: "This computer shares the app address and coordinates the active-device map."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
						children: [visibleDevices.map((device) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md bg-bg/45 p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [device.kind === "mobile" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-4 text-accent" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Laptop, { className: "size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "min-w-0 truncate text-sm font-medium text-fg",
										children: device.id === ownDeviceId ? "This device" : device.label
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs text-muted",
									children: device.id === ownDeviceId ? device.label : "Connected to Realhub"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[11px] text-accent",
									children: "Active now"
								})
							]
						}, device.id)), !visibleDevices.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-md border border-dashed border-border p-3 text-sm text-muted sm:col-span-2 xl:col-span-3",
							children: "Waiting for a device to open the shared address."
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Four steps to connect"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "mt-4 grid gap-4 md:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-md bg-bg/45 p-4 text-sm text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "1. Use the Ethernet address."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Use the address shown above for normal home Wi‑Fi and Ethernet. The NordLynx address is for VPN peers."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-md bg-bg/45 p-4 text-sm text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "2. Keep guests off isolated Wi‑Fi."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Guest Wi‑Fi often blocks device-to-device traffic. Join the normal household network instead."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-md bg-bg/45 p-4 text-sm text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "3. Look for the device map."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"A guest that opens Realhub shows up here automatically. Refresh the map if it has just joined."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-md bg-bg/45 p-4 text-sm text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "4. Start or join a Watch Room."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"After the guest is visible, open Watch Room and use the same invitation or room code."
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-xs leading-5 text-subtle",
						children: "If the shared page does not open, allow Realhub through the host computer’s private-network firewall and confirm the guest is on the same normal home network."
					})
				]
			})
		]
	});
}
function FindPhoneSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HubShell, {
		eyebrow: "Device recovery",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }),
		title: "Find your phone.",
		copy: "Open your device maker’s official locator. Realhub does not collect location data or keep a copy of your account credentials.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6 grid gap-4 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: "https://www.google.com/android/find/",
				target: "_blank",
				rel: "noopener noreferrer",
				className: "rounded-lg bg-elevated p-5 shadow-border transition-colors hover:bg-surface",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Android"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "Find My Device"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Open Google’s official Android device locator in a secure new tab."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: "https://www.icloud.com/find/",
				target: "_blank",
				rel: "noopener noreferrer",
				className: "rounded-lg bg-elevated p-5 shadow-border transition-colors hover:bg-surface",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "iPhone"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "Find My"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Open Apple’s official device locator in a secure new tab."
					})
				]
			})]
		})
	});
}
function DistributionRow({ label, value, total }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between gap-3 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate text-fg",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted",
			children: value
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-1 h-2 overflow-hidden rounded-full bg-bg/70",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full bg-accent",
			style: { width: `${Math.max(3, Math.round(value / Math.max(total, 1) * 100))}%` }
		})
	})] });
}
function companionTagPart(value) {
	return (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}
function companionSuggestions(inspection) {
	const tags = inspection.tags;
	const videoStream = inspection.streams?.find((stream) => stream.type === "video");
	const year = tags?.date?.match(/(?:19|20)\d{2}/)?.[0];
	return [...new Set([
		tags?.genre ? `genre-${companionTagPart(tags.genre)}` : "",
		tags?.artist ? `artist-${companionTagPart(tags.artist)}` : "",
		tags?.album ? `album-${companionTagPart(tags.album)}` : "",
		year ? `year-${year}` : "",
		videoStream?.codec ? `codec-${companionTagPart(videoStream.codec)}` : "",
		videoStream?.width && videoStream.height ? `resolution-${videoStream.width}x${videoStream.height}` : ""
	].filter(Boolean))].slice(0, 6);
}
function companionTechnicalSummary(inspection) {
	const streams = inspection.streams?.map((stream) => [stream.codec, stream.width && stream.height ? `${stream.width}×${stream.height}` : ""].filter(Boolean).join(" · ")).filter(Boolean) ?? [];
	return [Number.isFinite(inspection.duration) && inspection.duration && inspection.duration > 0 ? `${Math.round(inspection.duration)} sec` : "duration unavailable", ...streams].join(" · ");
}
function metadataSourceLabel(source) {
	if (source === "local") return "Local files";
	return source.split("-").map((part) => part ? `${part[0].toUpperCase()}${part.slice(1)}` : part).join(" ");
}
function YoutubeFirstClickDiagnostic() {
	(0, import_react.useSyncExternalStore)(subscribeYoutubeTrace, getYoutubeTraceRevision, () => 0);
	const trace = getYoutubeFirstClickTrace();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 rounded-sm bg-bg/45 p-3 text-xs leading-5 text-muted",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium text-fg",
				children: "YouTube first-click trace"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: !trace ? "Open YouTube to record a local timing sample." : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				trace.railReadyMs === void 0 ? "Waiting for the first available upload" : `${trace.railReadyMs}ms to ${trace.railCards} text-first cards`,
				` · selector ${trace.selectorMs ?? "…"}ms work / ${trace.selectorReadyMs ?? "…"}ms ready · ${trace.catalogRows ?? 0} cached rows`,
				` · artwork ${trace.artwork === "pending" ? "pending" : trace.artwork === "loaded" ? `${trace.artworkWaitMs ?? 0}ms after cards` : "deferred or unavailable"}`,
				` · provider ${trace.provider === "idle" ? "not needed" : `${trace.providerOverlapMs}ms overlap (${trace.provider})`}`
			] }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-subtle",
				children: "Local timings only; cached cards do not wait for artwork or a provider request."
			})
		]
	});
}
function SettingsSection() {
	const performanceBudget = usePerformanceProfile();
	const [performanceMode, setPerformanceModeChoice] = (0, import_react.useState)("adaptive");
	(0, import_react.useEffect)(() => setPerformanceModeChoice(getPerformanceMode()), [performanceBudget]);
	const [hub, setHub] = (0, import_react.useState)({
		prints: [],
		games: []
	});
	const [preferences, setPreferences] = (0, import_react.useState)({});
	const [preferenceGroup, setPreferenceGroup] = (0, import_react.useState)("Playback");
	const [zoom, setZoom] = (0, import_react.useState)(100);
	const [railLimit, setRailLimit] = (0, import_react.useState)(8);
	const [adultRailLimit, setAdultRailLimit] = (0, import_react.useState)(48);
	const [gridPageSize, setGridPageSize] = (0, import_react.useState)(24);
	const [thumbnailWorkers, setThumbnailWorkers] = (0, import_react.useState)(0);
	const textFirstArtwork = useTextFirstArtwork();
	const [photoWorkers, setPhotoWorkers] = (0, import_react.useState)(0);
	const [defaultVolume, setDefaultVolume] = (0, import_react.useState)(85);
	const [startMuted, setStartMuted] = (0, import_react.useState)(false);
	const [videoVisionBusy, setVideoVisionBusy] = (0, import_react.useState)(false);
	const [videoVisionNote, setVideoVisionNote] = (0, import_react.useState)("");
	const [videoVisionRows, setVideoVisionRows] = (0, import_react.useState)([]);
	const [selectedVideoVision, setSelectedVideoVision] = (0, import_react.useState)({});
	const [companionInspectionBusy, setCompanionInspectionBusy] = (0, import_react.useState)(false);
	const [companionInspectionNote, setCompanionInspectionNote] = (0, import_react.useState)("");
	const [companionInspectionRows, setCompanionInspectionRows] = (0, import_react.useState)([]);
	const [selectedCompanionInspections, setSelectedCompanionInspections] = (0, import_react.useState)({});
	const [metadataTailNote, setMetadataTailNote] = (0, import_react.useState)("");
	const [metadataTailBusy, setMetadataTailBusy] = (0, import_react.useState)(false);
	const [smartTagsBusy, setSmartTagsBusy] = (0, import_react.useState)(false);
	const [creatorCoverageNote, setCreatorCoverageNote] = (0, import_react.useState)("");
	const [twitchRefreshSeconds, setTwitchRefreshSeconds] = (0, import_react.useState)(30);
	const [liveDensity, setLiveDensity] = (0, import_react.useState)(4);
	const [sourceCacheFirst, setSourceCacheFirst] = (0, import_react.useState)(true);
	const [debugEnabled, setDebugEnabled] = (0, import_react.useState)(false);
	const [theme, setTheme] = (0, import_react.useState)("night");
	const [debugReport, setDebugReport] = (0, import_react.useState)("");
	const refreshFollows = useLibrary((s) => s.refreshFollows);
	const folders = useLibrary((s) => s.folders);
	const videos = useLibrary((s) => s.videos);
	const tags = useLibrary((s) => s.tags);
	const metadataProvenance = useLibrary((s) => s.metadataProvenance);
	const applyReviewedTags = useLibrary((s) => s.applyReviewedTags);
	const applyCompanionTags = useLibrary((s) => s.applyCompanionTags);
	const enrichMetadataTail = useLibrary((s) => s.enrichMetadataTail);
	const repairCachedMetadata = useLibrary((s) => s.repairCachedMetadata);
	const repairCreatorCoverage = useLibrary((s) => s.repairCreatorCoverage);
	const openPreview = useLibrary((s) => s.openPreview);
	const follows = useLibrary((s) => s.follows);
	const refreshSourcePhotos = useLibrary((s) => s.refreshSourcePhotos);
	const unavailableVideoCount = useLibrary((s) => Object.keys(s.unavailable).length);
	const hiddenVideos = useLibrary((s) => s.hiddenVideos);
	const unhideVideo = useLibrary((s) => s.unhideVideo);
	const remoteCheckedAt = useLibrary((s) => s.remoteCheckedAt);
	const { smartTagStatus, metadataTailCoverage, creatorCoverage, companionInspectionCandidates, vision, hiddenTitles, ready: auditReady } = useSettingsAudit(videos, tags, metadataProvenance, follows, hiddenVideos);
	const metadataTailWaiting = metadataTailCoverage.reduce((total, row) => total + row.waiting, 0);
	const runMetadataTail = async () => {
		setMetadataTailBusy(true);
		setMetadataTailNote("Queued · you can keep browsing while this batch is prepared and saved.");
		try {
			const result = await enrichMetadataTail();
			if (!result.processed) {
				setMetadataTailNote("Metadata coverage is current for every unlocked catalog title. Locked tags were left untouched.");
				return;
			}
			const sourceSummary = result.sources.filter((row) => row.processed).map((row) => `${metadataSourceLabel(row.source)} ${row.changed}/${row.processed}`).join(" · ");
			setMetadataTailNote(`Saved ${result.processed} cached title${result.processed === 1 ? "" : "s"}; ${result.changed} gained safe metadata tags${result.remaining ? ` · ${result.remaining.toLocaleString()} cached titles remain to check` : " · scan complete"}${sourceSummary ? ` · ${sourceSummary}` : ""}.`);
		} catch {
			setMetadataTailNote("This batch could not finish saving. Completed batches are retained; retry to continue.");
		} finally {
			setMetadataTailBusy(false);
		}
	};
	const runSmartTags = async () => {
		setSmartTagsBusy(true);
		setServiceNote("Smart tags queued · completed batches save as you browse.");
		try {
			const changed = await useLibrary.getState().autoTagLibrary();
			setServiceNote(changed ? `Smart-tag run saved · ${changed.toLocaleString()} catalog items updated.` : "Smart tags are already current for every loaded catalog item.");
		} catch {
			setServiceNote("Smart tags could not finish saving. Retry to continue from saved results.");
		} finally {
			setSmartTagsBusy(false);
		}
	};
	const runCreatorCoverageRepair = () => {
		const result = repairCreatorCoverage();
		if (!result.processed) {
			setCreatorCoverageNote(creatorCoverage.ambiguous.length ? "No uniquely matched cards remain. Ambiguous exact-ID matches stay below for review and were not changed." : "Creator coverage is current for every card with one exact saved provider match.");
			return;
		}
		setCreatorCoverageNote(`Repaired ${result.repaired} creator ${result.repaired === 1 ? "identity" : "identities"} from exact saved provider IDs${result.tagged ? ` · ${result.tagged} unlocked card${result.tagged === 1 ? "" : "s"} also gained its creator tag` : " · locked tag choices were left unchanged"}${result.remaining ? ` · ${result.remaining} remain in the queue` : " · queue complete"}.`);
	};
	const [serviceNote, setServiceNote] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => setHub(readHub()), []);
	(0, import_react.useEffect)(() => {
		try {
			const next = { ...JSON.parse(localStorage.getItem("reelcase.settings.v2") ?? "{}") };
			setPreferences(next);
			localStorage.setItem("reelcase.settings.v2", JSON.stringify(next));
		} catch {
			setPreferences({});
		}
	}, []);
	(0, import_react.useEffect)(() => {
		const rail = Number(localStorage.getItem("reelcase.adult-rail-limit") ?? "48");
		setAdultRailLimit([
			16,
			24,
			48,
			72
		].includes(rail) ? rail : 48);
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = Number(localStorage.getItem("reelcase.ui-zoom") ?? "100");
		const value = [
			80,
			90,
			100,
			110,
			125
		].includes(saved) ? saved : 100;
		setZoom(value);
		document.documentElement.style.fontSize = `${value}%`;
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = Number(localStorage.getItem("reelcase.home-rail-limit") ?? "8");
		setRailLimit([
			8,
			16,
			32,
			48
		].includes(saved) ? saved : 8);
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = Number(localStorage.getItem("reelcase.grid-page-size") ?? "24");
		setGridPageSize([
			24,
			48,
			96,
			144
		].includes(saved) ? saved : 24);
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = Number(localStorage.getItem("reelcase.thumbnail-workers") ?? "0");
		setThumbnailWorkers([
			1,
			2,
			3,
			4
		].includes(saved) ? saved : 0);
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = Number(localStorage.getItem("reelcase.photo-scan-workers") ?? "0");
		setPhotoWorkers([
			2,
			4,
			6,
			8,
			12
		].includes(saved) ? saved : 0);
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = Number(localStorage.getItem("reelcase.player-volume") ?? "85");
		setDefaultVolume([
			25,
			50,
			70,
			85,
			100
		].includes(saved) ? saved : 85);
		setStartMuted(localStorage.getItem("reelcase.player-start-muted") === "true");
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = Number(localStorage.getItem("reelcase.twitch-refresh-seconds") ?? "30");
		setTwitchRefreshSeconds([
			15,
			30,
			60,
			120,
			300
		].includes(saved) ? saved : 30);
	}, []);
	(0, import_react.useEffect)(() => setSourceCacheFirst(localStorage.getItem("reelcase.source-cache-first") !== "false"), []);
	(0, import_react.useEffect)(() => {
		try {
			setDebugEnabled(localStorage.getItem("reelcase.debug-panel") === "true");
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		try {
			const saved = localStorage.getItem("reelcase.theme") === "day" ? "day" : "night";
			setTheme(saved);
			document.documentElement.dataset.theme = saved;
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => setLiveDensity([
		3,
		4,
		6
	].includes(Number(localStorage.getItem("reelcase.live-columns") ?? "4")) ? Number(localStorage.getItem("reelcase.live-columns")) : 4), []);
	const setGlobalZoom = (value) => {
		setZoom(value);
		localStorage.setItem("reelcase.ui-zoom", String(value));
		document.documentElement.style.fontSize = `${value}%`;
	};
	const setColorTheme = (value) => {
		setTheme(value);
		localStorage.setItem("reelcase.theme", value);
		document.documentElement.dataset.theme = value;
	};
	const togglePreference = (key) => {
		const enabled = !preferences[key];
		const next = {
			...preferences,
			[key]: enabled
		};
		setPreferences(next);
		localStorage.setItem("reelcase.settings.v2", JSON.stringify(next));
		if (key === "privacy-reduce-motion") document.documentElement.toggleAttribute("data-reduce-motion", enabled);
		if (key === "privacy-hide-demo-media") useLibrary.getState().setHideDemo(enabled);
		if (key === "playback-start-muted") localStorage.setItem("reelcase.player-start-muted", String(enabled));
		if (key === "display-day-mode") setColorTheme(enabled ? "day" : "night");
		if (key === "display-compact-live-cards") {
			localStorage.setItem("reelcase.live-columns", enabled ? "6" : "4");
			setLiveDensity(enabled ? 6 : 4);
		}
		if (key === "performance-use-cached-sources-first") {
			localStorage.setItem("reelcase.source-cache-first", String(enabled));
			setSourceCacheFirst(enabled);
		}
		if (key === "performance-low-memory-grids") {
			localStorage.setItem("reelcase.grid-page-size", enabled ? "24" : "48");
			setGridPageSize(enabled ? 24 : 48);
		}
		if (key === "performance-small-home-shelves") {
			localStorage.setItem("reelcase.home-rail-limit", enabled ? "8" : "16");
			setRailLimit(enabled ? 8 : 16);
		}
		if (key === "alerts-desktop-notifications" && enabled) {
			if (!("Notification" in window)) {
				setServiceNote("This browser does not support desktop notifications.");
				return;
			}
			Notification.requestPermission().then((permission) => {
				if (permission !== "granted") {
					setPreferences((current) => ({
						...current,
						[key]: false
					}));
					localStorage.setItem("reelcase.settings.v2", JSON.stringify({
						...next,
						[key]: false
					}));
					setServiceNote("Desktop notifications were not granted. In-app alerts remain available.");
				} else {
					useLibrary.getState().setNotifyPush(true);
					setServiceNote("Desktop notifications are enabled for the alerts you keep switched on.");
				}
			});
		}
	};
	const exportLocal = () => {
		const state = useLibrary.getState();
		const payload = {
			exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
			note: "Realhub library metadata only. Original local files and browser permission handles are never exported.",
			library: {
				folders: state.folders,
				videos: state.videos,
				favorites: Object.keys(state.favorites),
				likes: Object.keys(state.likes),
				photoSources: state.folders.filter((f) => f.kind === "directory" || f.kind === "files").map((f) => ({
					id: f.id,
					name: f.name,
					kind: f.kind,
					...f.photoCount != null ? { photoCount: f.photoCount } : {},
					...f.lastCheckedAt != null ? { lastCheckedAt: f.lastCheckedAt } : {}
				})),
				photoMeta: loadDurablePhotosSync()?.meta,
				photoLikes: loadDurablePhotosSync()?.likes,
				tags: state.tags,
				categories: state.categories,
				progress: state.progress,
				history: state.history,
				feedback: exportFeedback(),
				follows: state.follows,
				notices: state.notices,
				sourceCompanions: {
					photoNames: useSourceAssets.getState().photos.map((asset) => asset.path),
					shortcutNames: useSourceAssets.getState().shortcuts.map((file) => file.name)
				}
			},
			hub
		};
		const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
		const link = document.createElement("a");
		link.href = url;
		link.download = `reelcase-export-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
		link.click();
		URL.revokeObjectURL(url);
	};
	const tagLocalVideoFrames = async () => {
		const candidates = videos.filter((video) => !video.remote && !metadataProvenance[video.id]?.lockedFields?.includes("tags") && !(tags[video.id] ?? []).some((tag) => tag.startsWith("vision-"))).slice(0, 12);
		if (!candidates.length) {
			setVideoVisionNote("No eligible local video frames are ready. Open a few local cards first so their cached frame artwork can warm.");
			return;
		}
		setVideoVisionBusy(true);
		setVideoVisionNote(`Warming local video frames · 0/${candidates.length}`);
		for (const video of candidates) useThumbs.getState().request(video);
		await new Promise((resolve) => window.setTimeout(resolve, 1200));
		const thumbs = useThumbs.getState().byId;
		const ready = candidates.filter((video) => Boolean(thumbs[video.id]));
		if (!ready.length) {
			setVideoVisionBusy(false);
			setVideoVisionNote("Frames are still warming. Try again in a moment; this beta never uploads local video.");
			return;
		}
		try {
			const labels = await classifyImagesLocally(ready.map((video) => thumbs[video.id]), (done, total) => setVideoVisionNote(`Classifying local video frames · ${done}/${total}`));
			const rows = ready.map((video, index) => ({
				videoId: video.id,
				name: video.name,
				labels: labels[index] ?? [],
				suggestions: (labels[index] ?? []).map((item) => `vision-${item.label}`)
			}));
			setVideoVisionRows(rows);
			setSelectedVideoVision(Object.fromEntries(rows.flatMap((row) => row.suggestions.map((tag) => [`${row.videoId}:${tag}`, true]))));
			const suggested = rows.filter((row) => row.suggestions.length > 0).length;
			setVideoVisionNote(`${suggested} local frame result${suggested === 1 ? "" : "s"} ready for review. Nothing is saved until you apply the selected labels.`);
		} catch {
			setVideoVisionNote("The local vision model could not start. File data stayed on this device; filename tags are still available.");
		} finally {
			setVideoVisionBusy(false);
		}
	};
	const applyVideoVision = () => {
		let changedFiles = 0;
		let addedTags = 0;
		for (const row of videoVisionRows) {
			const selectedTags = row.suggestions.filter((tag) => selectedVideoVision[`${row.videoId}:${tag}`]);
			if (!selectedTags.length) continue;
			const added = applyReviewedTags(row.videoId, selectedTags, "local-vision");
			if (added) {
				changedFiles += 1;
				addedTags += added;
			}
		}
		setSelectedVideoVision({});
		setVideoVisionNote(changedFiles ? `Saved ${addedTags} reviewed vision tag${addedTags === 1 ? "" : "s"} on ${changedFiles} video${changedFiles === 1 ? "" : "s"}. Manual tag locks and existing tags were preserved.` : "No new labels were saved. They may already exist, or the selected videos now have manual tag locks.");
	};
	const inspectWithCompanion = async () => {
		if (!companionInspectionCandidates.length) {
			setCompanionInspectionNote("No catalog entries have an approved full filesystem path yet. Browser-picked files keep opaque handles by design.");
			return;
		}
		setCompanionInspectionBusy(true);
		setCompanionInspectionNote(`Inspecting ${companionInspectionCandidates.length} local file${companionInspectionCandidates.length === 1 ? "" : "s"}…`);
		const result = await companionInspectMedia(companionInspectionCandidates.map((video) => video.path));
		const byPath = new Map(companionInspectionCandidates.map((video) => [video.path, video]));
		const rows = result.entries.flatMap((inspection) => {
			const video = byPath.get(inspection.requested);
			return video ? [{
				videoId: video.id,
				name: video.name,
				inspection,
				suggestions: companionSuggestions(inspection)
			}] : [];
		});
		setCompanionInspectionRows(rows);
		setSelectedCompanionInspections(Object.fromEntries(rows.filter((row) => row.inspection.inspected && row.suggestions.length > 0).map((row) => [row.videoId, true])));
		const inspected = rows.filter((row) => row.inspection.inspected).length;
		const unavailable = rows.length - inspected;
		setCompanionInspectionNote(result.ok ? `${inspected} metadata result${inspected === 1 ? "" : "s"} ready for review${unavailable ? ` · ${unavailable} could not be inspected` : ""}. Nothing is saved until you apply selected suggestions.` : result.error ?? "Companion inspection could not start.");
		setCompanionInspectionBusy(false);
	};
	const applyCompanionInspection = () => {
		const selected = companionInspectionRows.filter((row) => selectedCompanionInspections[row.videoId]);
		let changedFiles = 0;
		let addedTags = 0;
		for (const row of selected) {
			const added = applyCompanionTags(row.videoId, row.suggestions);
			if (added) {
				changedFiles += 1;
				addedTags += added;
			}
		}
		setSelectedCompanionInspections({});
		setCompanionInspectionNote(changedFiles ? `Saved ${addedTags} reviewed Companion tag${addedTags === 1 ? "" : "s"} on ${changedFiles} file${changedFiles === 1 ? "" : "s"}. Manual tag locks and existing tags were preserved.` : "No new suggestions were saved. They may already exist, or the selected files have manual tag locks.");
	};
	const downloadExport = (body, filename, type) => {
		const url = URL.createObjectURL(new Blob([body], { type }));
		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		link.click();
		URL.revokeObjectURL(url);
	};
	const exportChannels = () => {
		const follows = useLibrary.getState().follows.map((channel) => ({
			service: channel.kind,
			channel: channel.title,
			handle: channel.handle,
			channelId: channel.channelId ?? "",
			live: Boolean(channel.live)
		}));
		downloadExport(JSON.stringify({
			exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
			channels: follows
		}, null, 2), `reelcase-channels-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`, "application/json");
	};
	const exportCatalogCsv = () => {
		const state = useLibrary.getState();
		const quote = (value) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;
		const rows = [[
			"title",
			"source",
			"format",
			"tags",
			"category",
			"favorite",
			"added"
		], ...state.videos.map((video) => [
			video.name,
			state.folders.find((folder) => folder.id === video.folderId)?.name ?? video.remote?.channelName ?? "",
			video.extension,
			(state.tags[video.id] ?? []).join(" | "),
			state.categories[video.id] ?? "",
			Boolean(state.favorites[video.id]),
			new Date(video.addedAt).toISOString()
		])];
		downloadExport(rows.map((row) => row.map(quote).join(",")).join("\n"), `reelcase-catalog-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`, "text/csv");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Library control",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-4" }),
		title: "Settings & local export",
		copy: "Your Realhub library stays in this browser. Export a portable metadata backup whenever you need it.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PullSettingsPanel, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnrichmentStatus, {}),
			!auditReady && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				role: "status",
				children: "Updating catalog diagnostics in the background… Pull and performance controls are ready."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Video entries",
						value: useLibrary((s) => s.videos.length)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Saved sources · all networks",
						value: useLibrary((s) => s.follows.length)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Saved hub items",
						value: hub.prints.length + hub.games.length
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				hidden: !auditReady,
				children: [
					unavailableVideoCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-lg border border-danger/40 bg-elevated p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-medium text-fg",
							children: [
								"Playback health queue · ",
								unavailableVideoCount,
								" hidden"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs leading-5 text-muted",
							children: "These catalog entries were hidden after a browser file-permission or decode failure. Reconnect the source folder from the playback message to rebuild its live file handles."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "mt-4 rounded-lg border border-border bg-elevated p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
								className: "cursor-pointer text-sm font-medium text-fg",
								children: ["Hidden titles · ", hiddenTitles.length]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted",
								children: "Hidden videos and image cards stay out of recommendations, search, and Watch Room. Your ratings and history remain saved."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 max-h-64 space-y-2 overflow-y-auto",
								children: hiddenTitles.length ? hiddenTitles.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3 rounded-md bg-bg/50 px-3 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "min-w-0 truncate text-sm text-fg",
										children: item.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										onClick: () => unhideVideo(item.id),
										children: "Restore"
									})]
								}, item.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "Nothing hidden yet."
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-4 rounded-lg bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Smart local tags"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 font-display text-2xl text-fg",
								children: "Tag by name, date, and file type."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-2xl text-sm text-muted",
								children: "Adds private, explainable tags such as year-2026, month-september, type-mp4, and meaningful words from the filename. Existing manual tags are preserved; nothing is uploaded."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-xs text-accent",
								children: [
									smartTagStatus.tagged.toLocaleString(),
									" of ",
									smartTagStatus.local.toLocaleString(),
									" local files ready · ",
									smartTagStatus.waiting ? `${smartTagStatus.waiting.toLocaleString()} can still be enriched` : "coverage is current"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "mt-4",
								size: "sm",
								variant: "secondary",
								disabled: !smartTagStatus.local || smartTagsBusy,
								onClick: runSmartTags,
								children: [" ", smartTagsBusy ? "Smart tags queued…" : smartTagStatus.waiting ? "Apply smart tags to remaining files" : "Recheck smart-tag coverage"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-lg border border-border bg-surface p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-widest text-accent uppercase",
								children: "YouTube title & description tags"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: "Titles, content descriptions, hashtags and chapters add searchable tags and topic connections. Promotional lines are skipped. Existing videos upgrade in idle batches; manual tags and locks stay protected. Repair waits while a search or viewer is active; clear search to resume."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-4",
								size: "sm",
								variant: "secondary",
								onClick: () => {
									repairCachedMetadata();
									setServiceNote("YouTube tag repair queued. Follow Cached provider tags below; pause or resume background work while you browse.");
								},
								children: "Improve YouTube tags"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Metadata tail coverage"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 font-display text-2xl text-fg",
								children: "Finish cached catalog metadata in small batches."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-2xl text-sm leading-6 text-muted",
								children: "Uses already-cached provider titles, descriptions, channels, and local filenames. One pass scans in idle slices and saves at most 48 unlocked, untagged titles; it does not make a network request, inspect a media file, or replace a manual tag choice."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
								children: metadataTailCoverage.length ? metadataTailCoverage.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-sm bg-bg/45 p-3 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium text-fg",
										children: metadataSourceLabel(row.source)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-muted",
										children: [
											row.tagged.toLocaleString(),
											" tagged · ",
											row.waiting.toLocaleString(),
											" waiting · ",
											row.locked ? `${row.locked.toLocaleString()} locked` : "no locked gaps"
										]
									})]
								}, row.source)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "Add a local folder or provider channel to measure coverage."
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex flex-wrap items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									disabled: !auditReady || !metadataTailWaiting || metadataTailBusy,
									onClick: runMetadataTail,
									children: metadataTailBusy ? "Batch queued…" : metadataTailWaiting ? `Enrich next ${Math.min(48, metadataTailWaiting)}` : "Coverage current"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-accent",
									children: [
										metadataTailWaiting.toLocaleString(),
										" unlocked title",
										metadataTailWaiting === 1 ? "" : "s",
										" waiting"
									]
								})]
							}),
							metadataTailNote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-xs leading-5 text-accent",
								role: "status",
								children: ["Latest batch · ", metadataTailNote]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Creator coverage repair"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 font-display text-2xl text-fg",
								children: "Recover only exact creator identities."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-2xl text-sm leading-6 text-muted",
								children: "Matches a missing YouTube or Twitch display name only when the cached card and one of your saved follows share the exact public channel ID or saved source ID. It never guesses from titles, filenames, or loose handles; no provider request is made."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-sm bg-bg/45 p-3 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-medium text-fg",
											children: "Tracked cards"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-muted",
											children: [creatorCoverage.total.toLocaleString(), " YouTube/Twitch"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-sm bg-bg/45 p-3 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-medium text-fg",
											children: "Already named"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-muted",
											children: [creatorCoverage.present.toLocaleString(), " verified names"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-sm bg-bg/45 p-3 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-medium text-fg",
											children: "Exact repairs"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-muted",
											children: [creatorCoverage.repairable.toLocaleString(), " safe matches"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-sm bg-bg/45 p-3 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-medium text-fg",
											children: "Needs evidence"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-muted",
											children: [
												creatorCoverage.unresolved.toLocaleString(),
												" unmatched · ",
												creatorCoverage.ambiguous.length.toLocaleString(),
												" ambiguous"
											]
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex flex-wrap items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									disabled: !auditReady || !creatorCoverage.repairable,
									onClick: runCreatorCoverageRepair,
									children: creatorCoverage.repairable ? `Repair next ${Math.min(48, creatorCoverage.repairable)}` : "Coverage current"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-accent",
									children: [
										creatorCoverage.repairable.toLocaleString(),
										" exact match",
										creatorCoverage.repairable === 1 ? "" : "es",
										" waiting"
									]
								})]
							}),
							creatorCoverageNote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-xs leading-5 text-accent",
								role: "status",
								children: ["Latest repair · ", creatorCoverageNote]
							}),
							creatorCoverage.ambiguous.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 rounded-md border border-warning/35 bg-bg/45 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-fg",
										children: "Ambiguous exact-ID matches need review"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs leading-5 text-muted",
										children: "These cards match more than one saved display name. Nothing was written; open a card to inspect its provider details before changing follow data."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 grid gap-2",
										children: creatorCoverage.ambiguous.slice(0, 12).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center justify-between gap-3 rounded-sm bg-elevated p-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "min-w-0 flex-1 truncate text-xs text-fg",
												children: [row.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-muted",
													children: [" · ", row.candidates.join(" / ")]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => openPreview(row.id),
												children: "Review card"
											})]
										}, row.id))
									}),
									creatorCoverage.ambiguous.length > 12 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 text-xs text-muted",
										children: [
											"Showing 12 of ",
											creatorCoverage.ambiguous.length.toLocaleString(),
											" ambiguous cards."
										]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Optional Companion inspection"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 font-display text-2xl text-fg",
								children: "Review embedded local media tags."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-2xl text-sm leading-6 text-muted",
								children: "The local Companion reads technical details and a small embedded-tag set with ffprobe. It accepts only files inside its approved roots, processes at most 12 files, and never uploads media bytes or saves a suggestion automatically."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-xs text-accent",
								children: [
									companionInspectionCandidates.length,
									" eligible full-path file",
									companionInspectionCandidates.length === 1 ? "" : "s",
									" in the next bounded batch · browser-picked opaque file handles stay private and are skipped"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-4",
								size: "sm",
								variant: "secondary",
								disabled: companionInspectionBusy || !companionInspectionCandidates.length,
								onClick: () => void inspectWithCompanion(),
								children: companionInspectionBusy ? "Inspecting local metadata…" : "Inspect up to 12 local files"
							}),
							companionInspectionNote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-xs leading-5 text-accent",
								children: ["Latest inspection · ", companionInspectionNote]
							}),
							companionInspectionRows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 rounded-md border border-border bg-bg/45 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-fg",
										children: "Review suggestions before saving"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: "Embedded titles and comments stay preview-only; only the checked, compact search tags below can be saved."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										disabled: !companionInspectionRows.some((row) => selectedCompanionInspections[row.videoId]),
										onClick: applyCompanionInspection,
										children: "Apply selected suggestions"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 grid gap-2",
									children: companionInspectionRows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex gap-3 rounded-md border border-border bg-elevated p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "mt-1 size-4 accent-accent",
											type: "checkbox",
											checked: Boolean(selectedCompanionInspections[row.videoId]),
											disabled: !row.inspection.inspected || !row.suggestions.length,
											onChange: (event) => setSelectedCompanionInspections((current) => ({
												...current,
												[row.videoId]: event.target.checked
											}))
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block truncate text-sm font-medium text-fg",
												children: row.name
											}), row.inspection.inspected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "mt-1 block text-xs text-muted",
												children: [
													row.inspection.tags?.title ? `Embedded title · ${row.inspection.tags.title}` : "No embedded title",
													" · ",
													companionTechnicalSummary(row.inspection),
													row.inspection.tags?.comment ? " · embedded comment present" : ""
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-2 block text-xs text-accent",
												children: row.suggestions.length ? row.suggestions.map((tag) => `#${tag}`).join(" · ") : "No safe search-tag suggestion"
											})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "mt-1 block text-xs text-danger",
												children: ["Not inspected · ", row.inspection.reason ?? "No readable metadata"]
											})]
										})]
									}, row.videoId))
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Beta · local video vision"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 font-display text-2xl text-fg",
								children: "Review local video labels from a cached frame."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-2xl text-sm text-muted",
								children: "Uses the same on-device image model as Photos on one cached local thumbnail per video. It runs only when you start it, uses a bounded 12-video batch, and keeps frames and labels on this device until you explicitly apply the labels you want."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-xs text-accent",
								children: [
									vision.processed.toLocaleString(),
									" processed · ",
									vision.waiting.toLocaleString(),
									" waiting · ready when local frame artwork is cached"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-4",
								size: "sm",
								variant: "secondary",
								disabled: videoVisionBusy || !auditReady || !vision.eligible,
								onClick: () => void tagLocalVideoFrames(),
								children: videoVisionBusy ? videoVisionNote || "Preparing local frames…" : "Prepare next 12 local video frames"
							}),
							videoVisionNote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-xs leading-5 text-accent",
								children: ["Latest output · ", videoVisionNote]
							}),
							videoVisionRows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 rounded-md border border-border bg-bg/45 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-fg",
										children: "Review vision labels before saving"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: "Each result is local-only. Check only the labels you want to add; unselected labels are discarded when this review changes."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										disabled: !videoVisionRows.some((row) => row.suggestions.some((tag) => selectedVideoVision[`${row.videoId}:${tag}`])),
										onClick: applyVideoVision,
										children: "Apply selected labels"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 grid gap-2",
									children: videoVisionRows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-md border border-border bg-elevated p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-sm font-medium text-fg",
											children: row.name
										}), row.labels.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2 flex flex-wrap gap-2",
											children: row.labels.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "flex items-center gap-2 rounded-sm bg-bg/55 px-2 py-1 text-xs text-fg",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													className: "size-3.5 accent-accent",
													type: "checkbox",
													checked: Boolean(selectedVideoVision[`${row.videoId}:vision-${item.label}`]),
													onChange: (event) => setSelectedVideoVision((current) => ({
														...current,
														[`${row.videoId}:vision-${item.label}`]: event.target.checked
													}))
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
													"#",
													`vision-${item.label}`,
													" · ",
													Math.round(item.score * 100),
													"%"
												] })]
											}, `${row.videoId}:${item.label}`))
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-xs text-muted",
											children: "No confident local label suggested."
										})]
									}, row.videoId))
								})]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-4 rounded-lg bg-elevated p-5 shadow-border sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl text-fg",
					children: "Export local metadata"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-sm text-muted",
					children: "Downloads your catalog, favorites, likes, tags, watch history, follows, notifications, print list, and game list. Your original media and any browser file permissions remain private on this device."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: exportLocal,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Full backup"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: exportCatalogCsv,
							children: "Catalog CSV"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: exportChannels,
							children: "YouTube + Twitch"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Library pack · local folder"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "Export / import follows, history, links & marks"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 max-w-2xl text-sm text-muted",
						children: [
							"Downloads a zip that matches ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "text-fg",
								children: "public/import-templates/"
							}),
							": follows, watch history, creator collections, saved video URLs, continue-watching pointers, favorites/likes, Photos sources & likes, Adult marks, ratings & tag hearts, and stats. Import merges into durable IndexedDB stores and does not wipe unrelated data unless you confirm replace-follows."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => {
									const state = useLibrary.getState();
									downloadLibraryPackZip({
										follows: state.follows,
										history: state.history,
										links: linksFromHistoryAndResume(state.history, state.resumeProgress),
										favorites: Object.keys(state.favorites),
										likes: Object.keys(state.likes),
										viewCounts: state.viewCounts,
										cameCounts: state.cameCounts,
										progress: state.progress,
										resumeProgress: state.resumeProgress,
										adultVideos: state.videos,
										folders: state.folders,
										tags: state.tags,
										photoSources: state.folders.filter((f) => f.kind === "directory" || f.kind === "files").map((f) => ({
											id: f.id,
											name: f.name,
											kind: f.kind,
											...f.photoCount != null ? { photoCount: f.photoCount } : {},
											...f.lastCheckedAt != null ? { lastCheckedAt: f.lastCheckedAt } : {}
										})),
										photoMeta: loadDurablePhotosSync()?.meta,
										photoLikes: loadDurablePhotosSync()?.likes
									});
									setServiceNote("Library pack zip downloaded. Unzip to edit offline, or keep as backup.");
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Export library pack"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								onClick: () => {
									const input = document.createElement("input");
									input.type = "file";
									input.accept = ".zip,.json,.csv,application/zip,application/json,text/csv";
									input.onchange = () => {
										const file = input.files?.[0];
										if (!file) return;
										if (!window.confirm("Import this library pack into Realhub?\n\nData merges into durable local stores. Unrelated data is kept.")) {
											setServiceNote("Import cancelled.");
											return;
										}
										const mode = window.confirm("Also REPLACE all YouTube/Twitch follows with the file?\n\nOK = replace follows\nCancel = merge follows (recommended)") ? "replace-follows" : "merge";
										importLibraryPackZip(file, {
											getFollows: () => useLibrary.getState().follows,
											setFollows: (follows) => useLibrary.setState({ follows }),
											getHistory: () => useLibrary.getState().history,
											setHistory: (history) => useLibrary.setState({ history }),
											getViewCounts: () => useLibrary.getState().viewCounts,
											getCameCounts: () => useLibrary.getState().cameCounts,
											setMarks: (viewCounts, cameCounts) => useLibrary.setState({
												viewCounts,
												cameCounts
											}),
											getFavorites: () => Object.keys(useLibrary.getState().favorites),
											getLikes: () => Object.keys(useLibrary.getState().likes),
											setShelves: (favorites, likes) => useLibrary.setState({
												favorites: Object.fromEntries(favorites.map((id) => [id, true])),
												likes: Object.fromEntries(likes.map((id) => [id, true]))
											}),
											getPhotoSources: () => useLibrary.getState().folders.filter((f) => f.kind === "directory" || f.kind === "files").map((f) => ({
												id: f.id,
												name: f.name,
												kind: f.kind,
												photoCount: f.photoCount,
												lastCheckedAt: f.lastCheckedAt
											})),
											setPhotoSources: (sources) => useLibrary.setState((s) => {
												let folders = s.folders;
												for (const source of sources) if (folders.some((f) => f.id === source.id)) folders = folders.map((f) => f.id === source.id ? {
													...f,
													name: source.name,
													kind: source.kind,
													photoCount: source.photoCount ?? f.photoCount,
													lastCheckedAt: source.lastCheckedAt ?? f.lastCheckedAt
												} : f);
												else folders = [...folders, {
													id: source.id,
													name: source.name,
													kind: source.kind,
													videoCount: 0,
													photoCount: source.photoCount ?? 0,
													lastCheckedAt: source.lastCheckedAt,
													needsPermission: true,
													health: "permission-needed"
												}];
												return { folders };
											}),
											getProgress: () => useLibrary.getState().progress,
											getResumeProgress: () => useLibrary.getState().resumeProgress,
											setResume: (progress, resumeProgress) => useLibrary.setState({
												progress,
												resumeProgress
											}),
											getLinks: () => linksFromHistoryAndResume(useLibrary.getState().history, useLibrary.getState().resumeProgress),
											setLinks: () => {}
										}, mode).then((result) => {
											setServiceNote(`Pack import · +${result.followsAdded} follows · +${result.collectionsMerged} creator collections · +${result.historyMerged} history · +${result.linksMerged} links${result.photosMerged ? ` · photos ${result.photosMerged}` : ""}${result.feedbackMerged ? " · ratings/hearts merged" : ""}${result.warnings.length ? ` · ${result.warnings[0]}` : ""}`);
										}).catch((error) => {
											setServiceNote(error instanceof Error ? error.message : "Library pack import failed.");
										});
									};
									input.click();
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }), " Import library pack"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => {
									const state = useLibrary.getState();
									const files = buildLibraryPackFiles({
										follows: state.follows,
										history: state.history,
										links: linksFromHistoryAndResume(state.history, state.resumeProgress),
										favorites: Object.keys(state.favorites),
										likes: Object.keys(state.likes),
										viewCounts: state.viewCounts,
										cameCounts: state.cameCounts,
										progress: state.progress,
										resumeProgress: state.resumeProgress,
										adultVideos: state.videos,
										folders: state.folders,
										tags: state.tags,
										photoSources: state.folders.filter((f) => f.kind === "directory" || f.kind === "files").map((f) => ({
											id: f.id,
											name: f.name,
											kind: f.kind,
											...f.photoCount != null ? { photoCount: f.photoCount } : {},
											...f.lastCheckedAt != null ? { lastCheckedAt: f.lastCheckedAt } : {}
										})),
										photoMeta: loadDurablePhotosSync()?.meta,
										photoLikes: loadDurablePhotosSync()?.likes
									});
									companionExportLibraryPack(files).then((result) => {
										setServiceNote(result.ok ? `Wrote library pack to companion folder · ${result.written?.length ?? 0} files${result.root ? ` · ${result.root}` : ""}` : result.error || "Companion pack export failed.");
									});
								},
								children: "Save pack to companion folder"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => {
									companionImportLibraryPack().then((pack) => {
										if (!pack.ok || !pack.files || !Object.keys(pack.files).length) {
											setServiceNote(pack.error || "No library pack files in the companion folder.");
											return;
										}
										if (!window.confirm("Import the companion-folder library pack into Realhub?\n\nData merges into durable local stores.")) {
											setServiceNote("Companion import cancelled.");
											return;
										}
										const mode = window.confirm("Also REPLACE all YouTube/Twitch follows with the folder pack?\n\nOK = replace follows\nCancel = merge follows (recommended)") ? "replace-follows" : "merge";
										try {
											const result = applyLibraryPackFiles(pack.files, {
												getFollows: () => useLibrary.getState().follows,
												setFollows: (follows) => useLibrary.setState({ follows }),
												getHistory: () => useLibrary.getState().history,
												setHistory: (history) => useLibrary.setState({ history }),
												getViewCounts: () => useLibrary.getState().viewCounts,
												getCameCounts: () => useLibrary.getState().cameCounts,
												setMarks: (viewCounts, cameCounts) => useLibrary.setState({
													viewCounts,
													cameCounts
												}),
												getFavorites: () => Object.keys(useLibrary.getState().favorites),
												getLikes: () => Object.keys(useLibrary.getState().likes),
												setShelves: (favorites, likes) => useLibrary.setState({
													favorites: Object.fromEntries(favorites.map((id) => [id, true])),
													likes: Object.fromEntries(likes.map((id) => [id, true]))
												}),
												getPhotoSources: () => useLibrary.getState().folders.filter((f) => f.kind === "directory" || f.kind === "files").map((f) => ({
													id: f.id,
													name: f.name,
													kind: f.kind,
													photoCount: f.photoCount,
													lastCheckedAt: f.lastCheckedAt
												})),
												setPhotoSources: (sources) => useLibrary.setState((s) => {
													let folders = s.folders;
													for (const source of sources) if (folders.some((f) => f.id === source.id)) folders = folders.map((f) => f.id === source.id ? {
														...f,
														name: source.name,
														kind: source.kind,
														photoCount: source.photoCount ?? f.photoCount,
														lastCheckedAt: source.lastCheckedAt ?? f.lastCheckedAt
													} : f);
													else folders = [...folders, {
														id: source.id,
														name: source.name,
														kind: source.kind,
														videoCount: 0,
														photoCount: source.photoCount ?? 0,
														lastCheckedAt: source.lastCheckedAt,
														needsPermission: true,
														health: "permission-needed"
													}];
													return { folders };
												}),
												getProgress: () => useLibrary.getState().progress,
												getResumeProgress: () => useLibrary.getState().resumeProgress,
												setResume: (progress, resumeProgress) => useLibrary.setState({
													progress,
													resumeProgress
												}),
												getLinks: () => linksFromHistoryAndResume(useLibrary.getState().history, useLibrary.getState().resumeProgress),
												setLinks: () => {}
											}, mode);
											setServiceNote(`Companion pack import · +${result.followsAdded} follows · +${result.historyMerged} history · +${result.linksMerged} links${result.photosMerged ? ` · photos ${result.photosMerged}` : ""}`);
										} catch (error) {
											setServiceNote(error instanceof Error ? error.message : "Companion pack import failed.");
										}
									});
								},
								children: "Load pack from companion folder"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "inline-flex h-8 items-center rounded-md bg-bg/45 px-3 text-xs text-muted shadow-border hover:text-fg",
								href: "/import-templates/README.md",
								target: "_blank",
								rel: "noreferrer",
								children: "Open templates"
							})
						]
					}),
					serviceNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-accent",
						children: serviceNote
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Connected services"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "Independent caches, on your schedule."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Twitch and YouTube refresh together from your saved follows. Photo imports, Roku discovery, and Spotify remain independently local and refresh only when you ask."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5",
						children: [
							{
								name: "YouTube",
								detail: "Saved channels",
								checked: remoteCheckedAt,
								action: async () => {
									const result = await refreshFollows("youtube", { catalog: true });
									const status = useLibrary.getState().remoteRefreshStatus;
									setServiceNote(status?.failed === status?.checked ? "YouTube refresh failed. Check channel health." : `Refreshed YouTube catalog · ${result.newVideos.length} videos added from ${status?.refreshed ?? 0} channels.`);
								}
							},
							{
								name: "Twitch",
								detail: "Live + VOD cache",
								checked: remoteCheckedAt,
								action: async () => {
									const result = await refreshFollows("twitch");
									setServiceNote(`Refreshed Twitch catalog · ${result.newVideos.length} new videos from ${result.pull?.done ?? 0} channels.`);
								}
							},
							{
								name: "Photos",
								detail: `${folders.filter((folder) => folder.photoCount).length} source folders`,
								checked: Math.max(0, ...folders.map((folder) => folder.lastCheckedAt ?? 0)),
								action: async () => {
									const sources = folders.filter((folder) => folder.photoCount && (folder.kind === "directory" || folder.kind === "files"));
									const counts = await Promise.all(sources.map((folder) => refreshSourcePhotos(folder.id)));
									setServiceNote(`Refreshed local photo sources · ${counts.reduce((sum, count) => sum + count, 0)} photos found.`);
								}
							},
							{
								name: "Roku",
								detail: "Companion-assisted",
								checked: 0,
								action: async () => {
									try {
										const data = await (await fetch("http://127.0.0.1:43123/roku/discover")).json();
										setServiceNote(`Roku refresh complete · ${(data.devices ?? []).length} device(s) found.`);
									} catch {
										setServiceNote("Roku refresh needs the local Realhub Companion running.");
									}
								}
							},
							{
								name: "Spotify",
								detail: "Saved music shortcuts",
								checked: 0,
								action: async () => {
									setServiceNote("Spotify shortcuts are local and ready. Open Spotify from its library section to refresh provider content.");
								}
							}
						].map((service) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md bg-bg/45 p-3 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-fg",
									children: service.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted",
									children: service.detail
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[11px] text-subtle",
									children: service.checked ? `Last refreshed ${new Date(service.checked).toLocaleTimeString([], {
										hour: "numeric",
										minute: "2-digit"
									})}` : "Not refreshed this session"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									className: "mt-3",
									onClick: () => void service.action(),
									children: "Refresh"
								})
							]
						}, service.name))
					}),
					serviceNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-accent",
						children: serviceNote
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Device & performance"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "The controls that change how Realhub runs and fits your screen."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `rounded-lg bg-elevated p-5 shadow-border ${debugEnabled ? "sm:col-span-2 xl:col-span-4" : ""}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Diagnostics"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Keep a local, opt-in status panel for source, cache, and companion troubleshooting. It is off by default and sends nothing away."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
									className: "mt-3 space-y-1 text-xs leading-5 text-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-accent",
												children: "1."
											}),
											" In the main Realhub folder, double-click ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												className: "text-fg",
												children: "Start-Realhub-Companion.cmd"
											}),
											"."
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-accent",
											children: "2."
										}), " Leave the small Companion window open until it says it is listening."] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-accent",
											children: "3."
										}), " Enable diagnostics, select Check companion, then open Games to load approved shortcuts."] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs leading-5 text-subtle",
									children: "The companion is optional. It only runs on this computer and is needed for desktop shortcut launching, source checks, and TV discovery—not for browsing your media library."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: debugEnabled ? "default" : "secondary",
									className: "mt-4",
									onClick: () => {
										const next = !debugEnabled;
										setDebugEnabled(next);
										localStorage.setItem("reelcase.debug-panel", String(next));
										window.dispatchEvent(new Event("reelcase:diagnostics-settings"));
										if (!next) setDebugReport("");
									},
									children: debugEnabled ? "Disable diagnostics" : "Enable diagnostics"
								}),
								debugEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PerformanceScorecard, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										className: "mt-2",
										onClick: () => void (async () => {
											try {
												const data = await companionHealth(true);
												if (!data?.ok) throw new Error("offline");
												setDebugReport(`Companion v${data.version ?? "?"} · ${data.roots ?? 0} approved roots · Desktop ${data.desktopEnabled ? "ready" : "not available"}`);
											} catch {
												setDebugReport("Companion is not running or is unavailable to this browser.");
											}
										})(),
										children: "Check companion"
									}), debugReport && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-accent",
										children: debugReport
									})]
								})] }),
								debugEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YoutubeFirstClickDiagnostic, {})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "App zoom"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Scale the entire library interface for this browser. Your choice is remembered everywhere in Realhub."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										80,
										90,
										100,
										110,
										125
									].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: zoom === value ? "default" : "secondary",
										onClick: () => setGlobalZoom(value),
										children: [value, "%"]
									}, value))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Day & night"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Choose the palette that is easiest on your eyes. It applies to every Realhub page and stays on this device."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: theme === "night" ? "default" : "secondary",
										onClick: () => setColorTheme("night"),
										children: "Night mode"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: theme === "day" ? "default" : "secondary",
										onClick: () => setColorTheme("day"),
										children: "Day mode"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Live layout"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Choose a larger card layout or fit more live channels on screen. This changes the Live page without adding heavier media loads."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										3,
										4,
										6
									].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: liveDensity === value ? "default" : "secondary",
										onClick: () => {
											setLiveDensity(value);
											localStorage.setItem("reelcase.live-columns", String(value));
										},
										children: value === 3 ? "Large · 3 columns" : `${value} columns`
									}, value))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Home performance"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Choose how many cards each Home rail mounts. Lower counts keep huge folders smooth; the complete catalog remains searchable."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										8,
										16,
										32,
										48
									].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: railLimit === value ? "default" : "secondary",
										onClick: () => {
											setRailLimit(value);
											localStorage.setItem("reelcase.home-rail-limit", String(value));
											window.dispatchEvent(new Event("reelcase:render-settings"));
										},
										children: [value, " per shelf"]
									}, value))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: sourceCacheFirst ? "default" : "secondary",
									className: "mt-3",
									onClick: () => {
										const next = !sourceCacheFirst;
										setSourceCacheFirst(next);
										localStorage.setItem("reelcase.source-cache-first", String(next));
									},
									children: sourceCacheFirst ? "Use cached sources first" : "Rescan sources on launch"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-xs text-subtle",
									children: "Cached source catalogs load immediately. Use a source refresh when you want to check the disk again."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Adult performance"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Tune Adult rails and one catalog request separately. Smaller choices reduce decoding and keep filtering responsive."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 text-xs text-muted",
									children: "Cards per Adult rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex flex-wrap gap-2",
									children: [
										16,
										24,
										48,
										72
									].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: adultRailLimit === value ? "default" : "secondary",
										onClick: () => {
											setAdultRailLimit(value);
											localStorage.setItem("reelcase.adult-rail-limit", String(value));
											window.dispatchEvent(new Event("reelcase:adult-render-settings"));
										},
										children: [value, " cards"]
									}, value))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 text-xs text-muted",
									children: "Batch limits and automatic pacing are in Pull management above."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border sm:col-span-2",
							"data-performance-profile": true,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Performance profile"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Low memory keeps less artwork in RAM and starts less background work. Adaptive applies these limits automatically on smaller devices or with Save Data enabled."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									role: "group",
									"aria-label": "Performance profile",
									children: [["adaptive", "Adaptive"], ["low-memory", "Low memory"]].map(([mode, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										"aria-pressed": performanceMode === mode,
										variant: performanceMode === mode ? "default" : "secondary",
										onClick: () => {
											setPerformanceModeChoice(mode);
											setPerformanceMode(mode);
										},
										children: label
									}, mode))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-4 text-sm text-fg",
									role: "status",
									"aria-label": "Effective performance limits",
									children: [
										performanceBudget.lowMemory ? "Low memory active" : "Standard budgets active",
										performanceBudget.reason === "device" ? " · device capability or Save Data" : "",
										" · ",
										performanceBudget.artworkBytes / 1048576,
										" MiB artwork cache · up to ",
										performanceBudget.thumbnailWorkers,
										" thumbnail ",
										performanceBudget.thumbnailWorkers === 1 ? "worker" : "workers",
										" · ",
										performanceBudget.imageRequests,
										" image requests · ",
										performanceBudget.gridMountCap,
										" mounted cards per grid"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-xs leading-5 text-muted",
									children: [performanceBudget.lowMemory ? "Grids load 24 titles at a time, rails keep visible cards, and new photo scans use up to 2 workers. These ceilings apply over the individual settings below. " : "", "Artwork evicted from RAM can reopen from disk. Your video catalog and saved worker choices stay intact. Running requests finish within their previous budget."]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Grid memory budget"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Sets the poster grid page size. Only a window of those cards stays mounted. Low memory caps pages at 24; your selection returns when standard budgets are active."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										24,
										48,
										96,
										144
									].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: gridPageSize === value ? "default" : "secondary",
										onClick: () => {
											setGridPageSize(value);
											localStorage.setItem("reelcase.grid-page-size", String(value));
											window.dispatchEvent(new Event("reelcase:render-settings"));
										},
										children: [value, " cards"]
									}, value))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Artwork worker budget"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Controls concurrent local thumbnail extraction. Adaptive uses device cores, available memory, and foreground input pressure."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										[0, "Adaptive"],
										[1, "Text-first · 1"],
										[2, "Gentle · 2"],
										[3, "Balanced · 3"],
										[4, "Fast · 4"]
									].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: thumbnailWorkers === value ? "default" : "secondary",
										onClick: () => {
											setThumbnailWorkers(value);
											localStorage.setItem("reelcase.thumbnail-workers", String(value));
										},
										children: label
									}, value))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: textFirstArtwork ? "default" : "secondary",
									className: "mt-4",
									onClick: () => setTextFirstArtwork(!textFirstArtwork),
									children: [" ", textFirstArtwork ? "Text-first provider rows on" : "Use text-first provider rows"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Photo scan workers"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Sets background folder workers for cached photo metadata. Adaptive protects browsing; use Fast when you want a newly added photo source ready sooner."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										[0, "Adaptive"],
										[2, "Gentle · 2"],
										[4, "Balanced · 4"],
										[6, "Fast · 6"],
										[8, "Max · 8"],
										[12, "Turbo · 12"]
									].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: photoWorkers === value ? "default" : "secondary",
										onClick: () => {
											setPhotoWorkers(value);
											localStorage.setItem("reelcase.photo-scan-workers", String(value));
										},
										children: label
									}, value))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Player sound"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Sets the starting volume for local video and whether a newly opened player starts muted. Provider embeds keep their own service-level audio controls."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										25,
										50,
										70,
										85,
										100
									].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: defaultVolume === value ? "default" : "secondary",
										onClick: () => {
											setDefaultVolume(value);
											localStorage.setItem("reelcase.player-volume", String(value));
										},
										children: [value, "%"]
									}, value))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "mt-3",
									size: "sm",
									variant: startMuted ? "default" : "secondary",
									onClick: () => {
										const next = !startMuted;
										setStartMuted(next);
										localStorage.setItem("reelcase.player-start-muted", String(next));
									},
									children: startMuted ? "Start muted" : "Start with sound"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-elevated p-5 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-2xl text-fg",
									children: "Twitch live & archive refresh"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: "Checks 12 rotating channels while this tab is visible, adding up to 100 recent VODs and 24 clips sampled across recent and older time ranges. Focused pulls continue through deeper VOD and clip history with saved cursors. Earlier items stay saved if a provider response is partial. Thirty seconds is the default."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										[15, "15 sec"],
										[30, "30 sec"],
										[60, "1 min"],
										[120, "2 min"],
										[300, "5 min"]
									].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: twitchRefreshSeconds === value ? "default" : "secondary",
										onClick: () => {
											setTwitchRefreshSeconds(value);
											localStorage.setItem("reelcase.twitch-refresh-seconds", String(value));
											window.dispatchEvent(new Event("reelcase:refresh-settings"));
										},
										children: label
									}, value))
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtworkAuditPanel, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Connections, privacy & guides"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Optional services and explanations stay separate from everyday library preferences."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, { className: "size-5" }),
							title: "Local edit workspace",
							copy: "The player has reliable native playback and metadata tools today. A non-destructive OpenShot-style timeline requires a dedicated browser media engine; keep it local-first and never upload media by default."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-5" }),
							title: "AI recommendations, later",
							copy: "Your tags, likes, categories, history, and export file are the future recommendation signal. Add a server endpoint and explicit consent screen before any assistant can read it."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-5" }),
							title: "AI tools directory",
							copy: "Prepare future connectors for recommendations, metadata cleanup, captioning, and watch-list suggestions. Keep every connection opt-in and scoped to only the library data you select."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-5" }),
							title: "Privacy defaults",
							copy: "Local cataloging, tags, ratings, and history stay on this device. Export is metadata-only; no source videos, print files, game files, or browser permissions are included."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-5" }),
							title: "How Realhub works",
							copy: "Folders and files are cataloged locally; channel follows use their public pages; Watch Room sends direct peer events; and external services open only when you choose them. See PROJECT_GUIDE.md and LAN_WATCH_ROOM.md in the repository for the complete maintainer guide."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlexaLightControl, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleYouTubeConnection, {})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl text-fg",
							children: "Working preferences"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Every switch below works now, changes Realhub immediately, and is saved in this browser. Future ideas belong in the Mission plan—not in this control panel."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [Object.values(preferences).filter(Boolean).length, " enabled"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: Object.keys(PREFERENCE_GROUPS).map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: preferenceGroup === group ? "default" : "secondary",
							onClick: () => setPreferenceGroup(group),
							children: [
								group,
								" · ",
								PREFERENCE_GROUPS[group].length
							]
						}, group))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-2",
						children: PREFERENCES.filter((item) => item.group === preferenceGroup).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: !item.implemented,
							onClick: () => togglePreference(item.key),
							className: "flex min-h-16 items-center justify-between gap-4 rounded-md bg-bg/45 px-4 text-left shadow-border disabled:cursor-not-allowed disabled:opacity-60",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-sm font-medium text-fg",
								children: item.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 block text-xs text-muted",
								children: item.detail
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `flex h-6 w-11 items-center rounded-full p-0.5 transition-[background-color] duration-150 ${item.implemented && preferences[item.key] ? "bg-accent justify-end" : "bg-surface justify-start"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-5 rounded-full ${item.implemented && preferences[item.key] ? "bg-accent-fg" : "bg-muted"}` })
							})]
						}, item.key))
					})
				]
			})
		]
	});
}
function PrintsSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocalCatalog, {
		kind: "prints",
		eyebrow: "Maker shelf",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, { className: "size-4" }),
		title: "3D prints",
		copy: "Keep a lightweight catalog of print-ready files. Preview STL, OBJ, GLB/GLTF, and 3MF in an interactive orbit viewer with transform editor, lighting presets, wireframe, grid, and fullscreen; G-code stays list-only for slicers.",
		accept: ".stl,.obj,.3mf,.gcode,.glb,.gltf",
		footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 grid gap-3 sm:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceLink, {
				name: "Printables",
				href: "https://www.printables.com/",
				copy: "Browse community-shared printable models."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceLink, {
				name: "OpenSCAD",
				href: "https://openscad.org/",
				copy: "Build and customize open parametric models."
			})]
		})
	});
}
function SpotifySection() {
	const [saved, setSaved] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return "";
		try {
			return localStorage.getItem("reelcase.spotify.playlist") ?? "";
		} catch {
			return "";
		}
	});
	const [playlistUrl, setPlaylistUrl] = (0, import_react.useState)(saved);
	const [imports, setImports] = (0, import_react.useState)(() => {
		try {
			const savedImports = JSON.parse(localStorage.getItem("reelcase.spotify.imports.v1") ?? "[]");
			return Array.isArray(savedImports) ? savedImports.filter((item) => typeof item === "string") : [];
		} catch {
			return [];
		}
	});
	const importSpotifyLink = () => {
		const value = playlistUrl.trim();
		if (!/^https:\/\/open\.spotify\.com\/(playlist|album|artist)\//i.test(value)) return;
		const next = [value, ...imports.filter((item) => item !== value)].slice(0, 50);
		setImports(next);
		setSaved(value);
		localStorage.setItem("reelcase.spotify.imports.v1", JSON.stringify(next));
		localStorage.setItem("reelcase.spotify.playlist", value);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Music companion",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, { className: "size-4" }),
		title: "Spotify, beside your library.",
		copy: "Keep music separate from video playback. Connect through Spotify’s official player or save a playlist link locally for your next listening session.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: "Open Spotify"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Account sign-in and playback remain on Spotify’s official site or app. Realhub does not collect your Spotify password or tokens."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: "https://open.spotify.com/",
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg",
							children: ["Open Spotify ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-2 size-4" })]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: "Save a playlist shortcut"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-col gap-2 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: playlistUrl,
							onChange: (event) => setPlaylistUrl(event.target.value),
							placeholder: "https://open.spotify.com/playlist/...",
							"aria-label": "Spotify playlist link"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: !playlistUrl.includes("spotify.com"),
							onClick: importSpotifyLink,
							children: "Import link"
						})]
					}),
					saved && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						className: "mt-3 inline-flex text-sm text-accent hover:text-fg",
						href: saved,
						target: "_blank",
						rel: "noreferrer",
						children: ["Open saved playlist ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-1 size-4" })]
					})
				]
			}),
			imports.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: "Imported Spotify shortcuts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: "Playlist, album, and artist links are stored locally for quick return. Spotify account data remains in Spotify."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: imports.slice(0, 12).map((url) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: url,
							target: "_blank",
							rel: "noreferrer",
							className: "max-w-full truncate rounded-sm bg-bg/45 px-3 py-2 text-xs text-fg shadow-border",
							children: url.replace("https://open.spotify.com/", "Spotify · ")
						}, url))
					})
				]
			})
		]
	});
}
function AlexaLightControl() {
	const [scene, setScene] = (0, import_react.useState)("Movie night");
	const [saved, setSaved] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-elevated p-5 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-accent",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-3 font-display text-2xl text-fg",
				children: "Alexa light scenes"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-muted",
				children: "Set a preferred scene locally, then ask Alexa to run that scene. Direct device control needs an authorized Alexa Smart Home skill, which is not connected here."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					"Movie night",
					"Bright",
					"Warm",
					"Pause lights"
				].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: scene === item ? "default" : "secondary",
					onClick: () => setScene(item),
					children: item
				}, item))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				className: "mt-3",
				onClick: () => {
					localStorage.setItem("reelcase.alexa.scene", scene);
					setSaved(true);
				},
				children: "Save preferred scene"
			}),
			saved && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-accent",
				children: [
					"Saved. Say “Alexa, ",
					scene,
					".” after creating that scene in the Alexa app."
				]
			})
		]
	});
}
function GoogleYouTubeConnection() {
	const [clientId, setClientId] = (0, import_react.useState)("");
	const [token, setToken] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("Not connected");
	const videos = useLibrary((s) => s.videos);
	const setVideoTags = useLibrary((s) => s.setVideoTags);
	(0, import_react.useEffect)(() => {
		setClientId(localStorage.getItem("reelcase.google.client-id") ?? "");
		setToken(sessionStorage.getItem("reelcase.google.youtube-token") ?? "");
	}, []);
	const connect = () => {
		const id = clientId.trim();
		if (!id.endsWith(".apps.googleusercontent.com")) {
			setStatus("Enter the Google OAuth Client ID ending in .apps.googleusercontent.com.");
			return;
		}
		localStorage.setItem("reelcase.google.client-id", id);
		setStatus("Opening Google authorization…");
		const start = () => {
			const client = window.google?.accounts?.oauth2?.initTokenClient({
				client_id: id,
				scope: "https://www.googleapis.com/auth/youtube.readonly",
				callback: (response) => {
					if (response.access_token) {
						sessionStorage.setItem("reelcase.google.youtube-token", response.access_token);
						setToken(response.access_token);
						setStatus("Google connected for this browser session.");
					} else setStatus(`Google authorization failed${response.error ? `: ${response.error}` : "."}`);
				}
			});
			if (!client) {
				setStatus("Google authorization library did not load. Check the authorized JavaScript origin.");
				return;
			}
			client.requestAccessToken({ prompt: "consent" });
		};
		const existing = document.querySelector("script[data-reelcase-google=\"true\"]");
		if (existing && window.google) start();
		else {
			const script = existing ?? document.createElement("script");
			script.src = "https://accounts.google.com/gsi/client";
			script.async = true;
			script.dataset.reelcaseGoogle = "true";
			script.onload = start;
			script.onerror = () => setStatus("Google authorization library could not load.");
			if (!existing) document.head.appendChild(script);
		}
	};
	const importTags = async () => {
		if (!token) return;
		const items = videos.filter((video) => video.remote?.kind === "youtube" && video.remote.videoId).slice(0, 50);
		if (!items.length) {
			setStatus("No YouTube videos are available to enrich yet.");
			return;
		}
		setStatus("Importing available YouTube metadata…");
		try {
			const ids = items.map((video) => video.remote.videoId).join(",");
			const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${encodeURIComponent(ids)}`, { headers: { Authorization: `Bearer ${token}` } });
			if (!response.ok) throw new Error("Google did not allow the metadata request.");
			const body = await response.json();
			const byId = new Map((body.items ?? []).map((item) => [item.id, item.snippet]));
			let changed = 0;
			for (const video of items) {
				const snippet = byId.get(video.remote.videoId);
				const imported = [...new Set([
					"youtube",
					snippet?.channelTitle ?? video.remote?.channelName ?? "",
					...snippet?.tags ?? []
				].map((tag) => tag.trim()).filter(Boolean))].slice(0, 30);
				if (imported.length) {
					setVideoTags(video.id, imported);
					changed += 1;
				}
			}
			setStatus(`Imported available tags for ${changed} YouTube title${changed === 1 ? "" : "s"}.`);
		} catch (error) {
			setStatus(error instanceof Error ? error.message : "Could not import YouTube metadata.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-elevated p-5 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-accent",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-3 font-display text-2xl text-fg",
				children: "Google & YouTube access"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-muted",
				children: "Paste only the OAuth Client ID—never a secret. Google’s popup authorizes this browser session, then Realhub can read permitted YouTube metadata and available creator tags."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
				className: "mt-3 list-decimal space-y-1 pl-5 text-xs leading-5 text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "In Google Cloud, create a project and enable YouTube Data API v3." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Create an OAuth Client ID for a Web application; do not create or paste a client secret." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						"Add this exact Authorized JavaScript origin:",
						" ",
						typeof window === "undefined" ? "your app origin" : window.location.origin,
						"."
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Paste the Client ID here, select Connect Google, approve read-only YouTube access, then choose Import YouTube tags." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "mt-3",
				value: clientId,
				onChange: (event) => setClientId(event.target.value),
				placeholder: "Google OAuth Client ID",
				"aria-label": "Google OAuth Client ID"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: connect,
						children: "Connect Google"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						disabled: !token,
						onClick: () => void importTags(),
						children: "Import YouTube tags"
					}),
					token && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => {
							sessionStorage.removeItem("reelcase.google.youtube-token");
							setToken("");
							setStatus("Disconnected from this browser session.");
						},
						children: "Disconnect"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-accent",
				children: status
			})
		]
	});
}
var PHOTO_FILE_RE = /\.(avif|bmp|gif|heic|heif|jpe?g|png|tiff?|webp)$/i;
var photoSourceWarmth = /* @__PURE__ */ new Map();
var PHOTO_BACKGROUND_REFRESH_MS = 18e5;
var cachedPhotoMetadata = null;
var photoMetaHydrated = false;
function photoMetadata() {
	if (cachedPhotoMetadata) return cachedPhotoMetadata;
	const durable = loadDurablePhotosSync();
	if (durable?.meta && Object.keys(durable.meta).length) {
		cachedPhotoMetadata = durable.meta;
		return cachedPhotoMetadata;
	}
	try {
		cachedPhotoMetadata = JSON.parse(localStorage.getItem("reelcase.photo-meta.v1") ?? "{}");
	} catch {
		cachedPhotoMetadata = {};
	}
	return cachedPhotoMetadata;
}
function persistPhotoMetadata(next, sources) {
	cachedPhotoMetadata = next;
	const likes = Object.entries(next).filter(([, row]) => row.favorite).map(([id]) => id);
	saveDurablePhotos({
		meta: next,
		likes,
		...sources ? { sources } : {}
	});
}
function PhotosSection() {
	const scannedPhotoSources = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		if (photoMetaHydrated) return;
		photoMetaHydrated = true;
		restoreDurablePhotos().then((durable) => {
			cachedPhotoMetadata = {
				...cachedPhotoMetadata ?? {},
				...durable.meta
			};
			if (durable.sources.length) {}
		}).catch(() => void 0);
	}, []);
	const photoUrls = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const knownPhotoIds = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const discoverySeen = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const metadataWriteTimer = (0, import_react.useRef)(null);
	const [ratingFilter, setRatingFilter] = (0, import_react.useState)("all");
	const [ratingQueuePhotoId, setRatingQueuePhotoId] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.photos.rating-queue") ?? "";
		} catch {
			return "";
		}
	});
	const [photos, setPhotos] = (0, import_react.useState)([]);
	const [showHiddenPhotos, setShowHiddenPhotos] = (0, import_react.useState)(false);
	const [selectedPerson, setSelectedPerson] = (0, import_react.useState)("All photos");
	const [selectedAlbum, setSelectedAlbum] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.photos.source-filter") || "All albums";
		} catch {
			return "All albums";
		}
	});
	const [selectedTag, setSelectedTag] = (0, import_react.useState)("All tags");
	const [selectedPhotoIds, setSelectedPhotoIds] = (0, import_react.useState)(() => /* @__PURE__ */ new Set());
	const [photoSearch, setPhotoSearch] = (0, import_react.useState)("");
	const [discoveryFilter, setDiscoveryFilter] = (0, import_react.useState)("all");
	const [favoritesOnly, setFavoritesOnly] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.photos.favorites-only") === "true";
		} catch {
			return false;
		}
	});
	const [photoSort, setPhotoSort] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.photos.sort") || "newest";
		} catch {
			return "newest";
		}
	});
	const [showLocations, setShowLocations] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.photos.show-locations") === "true";
		} catch {
			return false;
		}
	});
	const [photoFolders, setPhotoFolders] = (0, import_react.useState)([]);
	const [slideshow, setSlideshow] = (0, import_react.useState)(false);
	const [fullScreenSlide, setFullScreenSlide] = (0, import_react.useState)(false);
	const [slideSeconds, setSlideSeconds] = (0, import_react.useState)(() => {
		try {
			const value = Number(localStorage.getItem("reelcase.photos.slide-seconds") ?? "5");
			return [
				3,
				5,
				10,
				20,
				30
			].includes(value) ? value : 5;
		} catch {
			return 5;
		}
	});
	const [slideIndex, setSlideIndex] = (0, import_react.useState)(0);
	const [helperNote, setHelperNote] = (0, import_react.useState)("");
	const [focusedPhotoId, setFocusedPhotoId] = (0, import_react.useState)(null);
	const [photoViewerLoading, setPhotoViewerLoading] = (0, import_react.useState)(false);
	const [photoSourceLoading, setPhotoSourceLoading] = (0, import_react.useState)(false);
	const [photoScanTotal, setPhotoScanTotal] = (0, import_react.useState)(0);
	const [photoScanDone, setPhotoScanDone] = (0, import_react.useState)(0);
	const [photoScanStartedAt, setPhotoScanStartedAt] = (0, import_react.useState)(0);
	const [photoScanEstimatedPhotos, setPhotoScanEstimatedPhotos] = (0, import_react.useState)(0);
	const [photoScanFoundPhotos, setPhotoScanFoundPhotos] = (0, import_react.useState)(0);
	const [photoScanAverageMs, setPhotoScanAverageMs] = (0, import_react.useState)(0);
	const [photoMetadataProgress, setPhotoMetadataProgress] = (0, import_react.useState)({
		total: 0,
		done: 0,
		startedAt: 0,
		running: false
	});
	const [photoLimit, setPhotoLimit] = (0, import_react.useState)(48);
	const [visionBusy, setVisionBusy] = (0, import_react.useState)(false);
	const [visionProgress, setVisionProgress] = (0, import_react.useState)("");
	const [photoVisionRows, setPhotoVisionRows] = (0, import_react.useState)([]);
	const [selectedPhotoVision, setSelectedPhotoVision] = (0, import_react.useState)({});
	const [visionModel, setVisionModel] = (0, import_react.useState)("semanticPlus");
	const [visionReviewOpen, setVisionReviewOpen] = (0, import_react.useState)(true);
	const [visionBenchmark, setVisionBenchmark] = (0, import_react.useState)(() => {
		try {
			const saved = JSON.parse(localStorage.getItem("reelcase.photo-vision-benchmark.v1") ?? "null");
			return saved?.semantic && saved.semanticPlus && saved.semanticPro ? saved : null;
		} catch {
			return null;
		}
	});
	const [visionBenchmarkPhotos, setVisionBenchmarkPhotos] = (0, import_react.useState)([]);
	const [visionBenchmarkBusy, setVisionBenchmarkBusy] = (0, import_react.useState)(false);
	const [visionBenchmarkProgress, setVisionBenchmarkProgress] = (0, import_react.useState)("");
	const [visionBenchmarkError, setVisionBenchmarkError] = (0, import_react.useState)("");
	const [upscalerHealth, setUpscalerHealth] = (0, import_react.useState)({
		state: "checking",
		detail: "Checking local model cache…"
	});
	const [upscalerUrl, setUpscalerUrl] = (0, import_react.useState)(LOCAL_UPSCALER.artifactUrl);
	const [upscalerChecksum, setUpscalerChecksum] = (0, import_react.useState)(LOCAL_UPSCALER.sha256);
	const [upscalerInstalling, setUpscalerInstalling] = (0, import_react.useState)(false);
	const [upscalePreview, setUpscalePreview] = (0, import_react.useState)("");
	const upscalePreviewRef = (0, import_react.useRef)("");
	const [upscaleBusy, setUpscaleBusy] = (0, import_react.useState)(false);
	const [upscaleStatus, setUpscaleStatus] = (0, import_react.useState)("");
	const [companionCache, setCompanionCache] = (0, import_react.useState)(null);
	const [companionDeltaNote, setCompanionDeltaNote] = (0, import_react.useState)("");
	const appliedCompanionChanges = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const companionDeltaTimer = (0, import_react.useRef)(null);
	const [photoCacheNotice, setPhotoCacheNotice] = (0, import_react.useState)("Preparing cached photo index…");
	const libraryFolders = useLibrary((s) => s.folders);
	const sourcePhotos = useSourceAssets((s) => s.photos);
	const refreshSourcePhotos = useLibrary((s) => s.refreshSourcePhotos);
	const sourceFolders = (0, import_react.useMemo)(() => libraryFolders.filter((folder) => folder.kind === "directory" || folder.kind === "files"), [libraryFolders]);
	const sourceFolderIds = (0, import_react.useMemo)(() => sourceFolders.map((folder) => folder.id).sort().join("|"), [sourceFolders]);
	const checkUpscalerHealth = async () => {
		try {
			const raw = localStorage.getItem("reelcase.photo-upscaler.model.v1");
			const cache = "caches" in window ? await caches.open("reelcase-local-models-v1") : null;
			const manifest = cache ? await cache.match("/reelcase-local-models/upscaler.manifest.json") : null;
			const model = raw ? JSON.parse(raw) : manifest ? await manifest.json() : null;
			if (model?.name && model.verifiedAt) {
				if (!(cache && model.cacheKey ? await cache.match(model.cacheKey) : null)) throw new Error("Cached model artifact is unavailable");
				setUpscalerHealth({
					state: "ready",
					detail: `${model.name}${model.version ? ` · ${model.version}` : ""} verified ${new Date(model.verifiedAt).toLocaleDateString()} · ${bytes(model.bytes ?? 0)} cached locally. Ready for local preview runs; originals remain untouched.`
				});
			} else if ((await fetch(LOCAL_UPSCALER.shippedArtifactUrl, { method: "HEAD" })).ok) setUpscalerHealth({
				state: "ready",
				detail: "Swin2SR x2 beta is bundled and SHA-256 verified. It is ready for local preview runs; originals remain untouched."
			});
			else setUpscalerHealth({
				state: "missing",
				detail: "No verified local super-resolution model is installed. Upscaling is disabled, so no photo is ever mislabeled as enhanced."
			});
		} catch {
			setUpscalerHealth({
				state: "missing",
				detail: "The local model record could not be verified. Upscaling remains disabled and originals are safe."
			});
		}
	};
	(0, import_react.useEffect)(() => {
		checkUpscalerHealth();
	}, []);
	const installUpscalerModel = async () => {
		const url = upscalerUrl.trim();
		const expected = upscalerChecksum.trim().toLowerCase().replace(/^sha256:/, "");
		if (!/^https:\/\//i.test(url) || !/^[a-f0-9]{64}$/.test(expected)) {
			setUpscalerHealth({
				state: "missing",
				detail: "Enter an HTTPS model URL and the publisher’s exact 64-character SHA-256 checksum. Realhub will not install an unverifiable model."
			});
			return;
		}
		setUpscalerInstalling(true);
		setUpscalerHealth({
			state: "checking",
			detail: "Downloading the model after your explicit request and verifying its SHA-256…"
		});
		try {
			const response = await fetch(url, { signal: AbortSignal.timeout(12e4) });
			if (!response.ok) throw new Error(`Download returned ${response.status}`);
			const blob = await response.blob();
			if (!blob.size || blob.size > 786432e3) throw new Error("Model size is outside the safe local cache budget");
			const digest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()))).map((part) => part.toString(16).padStart(2, "0")).join("");
			if (digest !== expected) throw new Error("Checksum mismatch — the model was not stored");
			const cacheKey = LOCAL_UPSCALER.cacheKey;
			const cache = await caches.open("reelcase-local-models-v1");
			await cache.put(cacheKey, new Response(blob, { headers: { "content-type": blob.type || "application/octet-stream" } }));
			const model = {
				name: new URL(url).pathname.split("/").pop() || "local-upscaler.onnx",
				version: "user-verified",
				verifiedAt: Date.now(),
				cacheKey,
				bytes: blob.size,
				sha256: digest,
				url
			};
			await cache.put("/reelcase-local-models/upscaler.manifest.json", new Response(JSON.stringify(model), { headers: { "content-type": "application/json" } }));
			try {
				localStorage.setItem("reelcase.photo-upscaler.model.v1", JSON.stringify(model));
			} catch {}
			await checkUpscalerHealth();
		} catch (error) {
			setUpscalerHealth({
				state: "missing",
				detail: `${error instanceof Error ? error.message : "Model install failed"}. No model was enabled and originals were not changed.`
			});
		} finally {
			setUpscalerInstalling(false);
		}
	};
	const removeUpscalerModel = async () => {
		try {
			const cache = await caches.open("reelcase-local-models-v1");
			await cache.delete("/reelcase-local-models/upscaler.onnx");
			await cache.delete("/reelcase-local-models/upscaler.manifest.json");
			localStorage.removeItem("reelcase.photo-upscaler.model.v1");
		} finally {
			await checkUpscalerHealth();
		}
	};
	(0, import_react.useEffect)(() => {
		let alive = true;
		const read = async (signal) => {
			try {
				const data = await (await fetch("http://127.0.0.1:43123/cache-status", { signal: AbortSignal.any([signal, AbortSignal.timeout(5e3)]) })).json();
				if (!alive || !data.worker) return;
				setCompanionCache({
					state: data.worker.state ?? "ready",
					photos: Number(data.worker.photos) || 0,
					videos: Number(data.worker.videos) || 0,
					scannedAt: Number(data.worker.scannedAt) || 0,
					truncated: Boolean(data.worker.truncated)
				});
				const fresh = (data.recentChanges ?? []).filter((change) => Number(change.at) > 0 && !appliedCompanionChanges.current.has(Number(change.at)));
				if (!appliedCompanionChanges.current.size) {
					fresh.forEach((change) => appliedCompanionChanges.current.add(Number(change.at)));
					return;
				}
				fresh.forEach((change) => appliedCompanionChanges.current.add(Number(change.at)));
				if (appliedCompanionChanges.current.size > 240) appliedCompanionChanges.current = new Set([...appliedCompanionChanges.current].slice(-120));
				const changedIds = new Set(sourceFolders.filter((folder) => fresh.some((change) => {
					const path = String(change.path ?? "").replaceAll("\\", "/").toLowerCase();
					return path === folder.name.toLowerCase() || path.startsWith(`${folder.name.toLowerCase()}/`);
				})).map((folder) => folder.id));
				if (changedIds.size && !companionDeltaTimer.current) companionDeltaTimer.current = window.setTimeout(() => {
					companionDeltaTimer.current = null;
					Promise.all([...changedIds].slice(0, 3).map((id) => refreshSourcePhotos(id))).then((counts) => {
						if (alive) setCompanionDeltaNote(`Companion applied ${changedIds.size} folder change${changedIds.size === 1 ? "" : "s"} · ${counts.reduce((sum, count) => sum + count, 0).toLocaleString()} cached photos checked.`);
					});
				}, 1500);
			} catch {
				if (alive) setCompanionCache(null);
			}
		};
		const task = registerPeriodicTask({
			name: "Photo companion status",
			everyMs: 3e4,
			firstMs: 0,
			enabled: () => !useLibrary.getState().activeId && !useLibrary.getState().previewId,
			work: read
		});
		return () => {
			alive = false;
			task.cancel();
			if (companionDeltaTimer.current) window.clearTimeout(companionDeltaTimer.current);
		};
	}, [refreshSourcePhotos, sourceFolderIds]);
	const addPhotos = (files, folderName = "Unsorted", paths, urls) => {
		if (!files) return;
		const remembered = photoMetadata();
		const next = Array.from(files).filter((file) => file.type.startsWith("image/") || PHOTO_FILE_RE.test(file.name)).slice(0, 600).map((file, index) => {
			const path = paths?.[index] || file.webkitRelativePath || `${folderName}/${file.name}`;
			const id = `${path}-${file.lastModified}`;
			if (knownPhotoIds.current.has(id)) return null;
			const url = urls?.[index] ?? URL.createObjectURL(file);
			if (!urls?.[index]) photoUrls.current.add(url);
			return {
				id,
				name: file.name,
				path,
				url,
				people: remembered[id]?.people ?? [],
				tags: remembered[id]?.tags ?? [],
				album: remembered[id]?.album ?? paths?.[index]?.split("/")[0] ?? folderName,
				favorite: remembered[id]?.favorite ?? false,
				hidden: remembered[id]?.hidden ?? false,
				rating: remembered[id]?.rating ?? 0,
				addedAt: file.lastModified,
				width: remembered[id]?.width,
				height: remembered[id]?.height,
				vision: remembered[id]?.vision ?? [],
				visionModel: remembered[id]?.visionModel,
				file
			};
		}).filter((photo) => photo !== null);
		if (!next.length) return;
		for (const photo of next) knownPhotoIds.current.add(photo.id);
		setPhotos((current) => current.length ? [...current, ...next] : next);
	};
	(0, import_react.useEffect)(() => {
		if (sourcePhotos.length) {
			const remembered = photoMetadata();
			const metadataKey = (asset) => `${asset.path}-${asset.file.lastModified}`;
			const hot = sourcePhotos.filter((asset) => (remembered[metadataKey(asset)]?.rating ?? 0) > 0 || remembered[metadataKey(asset)]?.favorite);
			const remaining = sourcePhotos.filter((asset) => !((remembered[metadataKey(asset)]?.rating ?? 0) > 0 || remembered[metadataKey(asset)]?.favorite));
			const prioritized = [...hot, ...remaining].slice(0, 600);
			addPhotos(prioritized.map((asset) => asset.file), "Source import", prioritized.map((asset) => asset.path), prioritized.map((asset) => asset.url));
			setPhotoCacheNotice(`Cached index ready · ${sourcePhotos.length.toLocaleString()} source photos available`);
		}
	}, [sourcePhotos]);
	(0, import_react.useEffect)(() => {
		upscalePreviewRef.current = upscalePreview;
	}, [upscalePreview]);
	(0, import_react.useEffect)(() => () => {
		for (const url of photoUrls.current) URL.revokeObjectURL(url);
		photoUrls.current.clear();
		if (upscalePreviewRef.current) {
			try {
				URL.revokeObjectURL(upscalePreviewRef.current);
			} catch {}
			upscalePreviewRef.current = "";
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (metadataWriteTimer.current) clearTimeout(metadataWriteTimer.current);
		metadataWriteTimer.current = setTimeout(() => {
			try {
				persistPhotoMetadata({
					...photoMetadata(),
					...Object.fromEntries(photos.map(({ id, path, people, tags, album, favorite, hidden, rating, width, height, vision, visionModel }) => [id, {
						path,
						people,
						tags,
						album,
						favorite,
						hidden,
						rating,
						width,
						height,
						vision,
						visionModel
					}]))
				}, useLibrary.getState().folders.filter((folder) => folder.kind === "directory" || folder.kind === "files").map((folder) => ({
					id: folder.id,
					name: folder.name,
					kind: folder.kind,
					...folder.photoCount != null ? { photoCount: folder.photoCount } : {},
					...folder.lastCheckedAt != null ? { lastCheckedAt: folder.lastCheckedAt } : {}
				})));
			} catch {}
		}, 650);
		return () => {
			if (metadataWriteTimer.current) clearTimeout(metadataWriteTimer.current);
		};
	}, [photos]);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const waiting = photos.filter((photo) => photo.file && (!photo.width || !photo.height));
		if (!waiting.length) return;
		setPhotoMetadataProgress({
			total: waiting.length,
			done: 0,
			startedAt: performance.now(),
			running: true
		});
		(async () => {
			for (let start = 0; start < waiting.length && !cancelled; start += 8) {
				const chunk = waiting.slice(start, start + 8);
				const dimensions = await Promise.all(chunk.map(async (photo) => {
					try {
						const bitmap = await createImageBitmap(photo.file);
						const result = {
							id: photo.id,
							width: bitmap.width,
							height: bitmap.height
						};
						bitmap.close();
						return result;
					} catch {
						return {
							id: photo.id,
							width: 0,
							height: 0
						};
					}
				}));
				if (cancelled) return;
				const byId = new Map(dimensions.filter((item) => item.width > 0 && item.height > 0).map((item) => [item.id, item]));
				setPhotos((items) => items.map((photo) => {
					const next = byId.get(photo.id);
					return next ? {
						...photo,
						width: next.width,
						height: next.height
					} : photo;
				}));
				setPhotoMetadataProgress((current) => ({
					...current,
					done: Math.min(current.total, start + chunk.length)
				}));
				await new Promise((resolve) => window.setTimeout(resolve, 0));
			}
			if (!cancelled) setPhotoMetadataProgress((current) => ({
				...current,
				running: false
			}));
		})();
		return () => {
			cancelled = true;
		};
	}, [photos.length]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.photos.sort", photoSort);
		} catch {}
	}, [photoSort]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.photos.favorites-only", String(favoritesOnly));
		} catch {}
	}, [favoritesOnly]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.photos.rating-queue", ratingQueuePhotoId);
		} catch {}
	}, [ratingQueuePhotoId]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.photos.show-locations", String(showLocations));
		} catch {}
	}, [showLocations]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.photos.slide-seconds", String(slideSeconds));
		} catch {}
	}, [slideSeconds]);
	(0, import_react.useEffect)(() => {
		const onFullscreen = () => setFullScreenSlide(Boolean(document.fullscreenElement));
		document.addEventListener("fullscreenchange", onFullscreen);
		return () => document.removeEventListener("fullscreenchange", onFullscreen);
	}, []);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		(async () => {
			await new Promise((resolve) => {
				const idle = window.requestIdleCallback;
				if (idle) idle(() => resolve(), { timeout: 450 });
				else window.setTimeout(resolve, 120);
			});
			if (cancelled) return;
			const toScan = sourceFolders.filter((folder) => !scannedPhotoSources.current.has(folder.id) && Date.now() - (photoSourceWarmth.get(folder.id) ?? 0) >= PHOTO_BACKGROUND_REFRESH_MS);
			if (toScan.length) {
				setPhotoSourceLoading(true);
				setPhotoScanTotal(toScan.length);
				setPhotoScanDone(0);
				setPhotoScanStartedAt(Date.now());
				setPhotoScanEstimatedPhotos(toScan.reduce((sum, folder) => sum + (folder.photoCount ?? 0), 0));
				setPhotoScanFoundPhotos(0);
				setPhotoScanAverageMs(0);
			}
			let cursor = 0;
			const adaptiveWorkers = Math.min(12, Math.max(2, Math.floor((navigator.hardwareConcurrency || 4) / 2)));
			const configuredWorkers = Number(localStorage.getItem("reelcase.photo-scan-workers") ?? "0");
			const workerCount = Math.min(toScan.length, getPerformanceProfile().photoWorkers, [
				2,
				4,
				6,
				8,
				12
			].includes(configuredWorkers) ? configuredWorkers : adaptiveWorkers);
			const workers = Array.from({ length: workerCount }, async () => {
				while (!cancelled) {
					const folder = toScan[cursor++];
					if (!folder) return;
					scannedPhotoSources.current.add(folder.id);
					const started = performance.now();
					const found = await refreshSourcePhotos(folder.id);
					const elapsed = performance.now() - started;
					photoSourceWarmth.set(folder.id, Date.now());
					if (!cancelled) {
						setPhotoScanDone((done) => done + 1);
						setPhotoScanFoundPhotos((total) => total + found);
						setPhotoScanAverageMs((mean) => mean ? mean * .65 + elapsed * .35 : elapsed);
					}
				}
			});
			await Promise.all(workers);
			if (!cancelled) setPhotoSourceLoading(false);
		})();
		return () => {
			cancelled = true;
		};
	}, [refreshSourcePhotos, sourceFolderIds]);
	const photoScanEta = photoSourceLoading && photoScanDone >= 2 && photoScanTotal > photoScanDone && photoScanAverageMs > 0 ? Math.max(1, Math.ceil(photoScanAverageMs * (photoScanTotal - photoScanDone) / 1e3)) : 0;
	const photoMetadataEta = photoMetadataProgress.running && photoMetadataProgress.done > 0 && photoMetadataProgress.done < photoMetadataProgress.total ? Math.max(1, Math.ceil((performance.now() - photoMetadataProgress.startedAt) / photoMetadataProgress.done * (photoMetadataProgress.total - photoMetadataProgress.done) / 1e3)) : 0;
	const addPhotoFolder = (files) => {
		if (!files?.length) return;
		const first = [...files].find((file) => file.webkitRelativePath)?.webkitRelativePath.split("/")[0] ?? "Photo folder";
		setPhotoFolders((folders) => folders.includes(first) ? folders : [...folders, first]);
		addPhotos(files, first);
	};
	const people = (0, import_react.useMemo)(() => [...new Set(photos.flatMap((photo) => photo.people))], [photos]);
	const albums = (0, import_react.useMemo)(() => [...new Set(photos.map((photo) => photo.album))], [photos]);
	const photoTags = (0, import_react.useMemo)(() => [...new Set(photos.flatMap((photo) => photo.tags))].sort(), [photos]);
	const visionProcessed = (0, import_react.useMemo)(() => photos.filter((photo) => photo.vision?.length || photo.tags.some((tag) => tag.startsWith("vision-"))).length, [photos]);
	const visionPending = Math.max(0, photos.length - visionProcessed);
	const visionReviewedPhotos = (0, import_react.useMemo)(() => photos.filter((photo) => photo.vision?.length || photo.tags.some((tag) => tag.startsWith("vision-"))).sort((a, b) => b.addedAt - a.addedAt), [photos]);
	const visible = (0, import_react.useMemo)(() => photos.filter((photo) => (showHiddenPhotos || !photo.hidden) && (selectedPerson === "All photos" || photo.people.includes(selectedPerson)) && (selectedAlbum === "All albums" || photo.album === selectedAlbum) && (selectedTag === "All tags" || photo.tags.includes(selectedTag)) && (!favoritesOnly || photo.favorite) && (ratingFilter === "all" || (ratingFilter === "unrated" ? !photo.rating : photo.rating >= Number(ratingFilter))) && (discoveryFilter === "all" || (discoveryFilter === "screenshots" ? /screenshot|screen[_ -]?shot/i.test(photo.name) : discoveryFilter === "camera" ? /^(img|dsc|pxl|photo)[_ -]?\d/i.test(photo.name) : /download|image|copy|edited/i.test(photo.name))) && `${photo.name} ${photo.path} ${photo.people.join(" ")} ${photo.tags.join(" ")} ${photo.album}`.toLowerCase().includes(photoSearch.toLowerCase())).sort((a, b) => {
		if (photoSort === "name") return a.name.localeCompare(b.name);
		if (photoSort === "rating") return ratingPreference(b.rating) - ratingPreference(a.rating) || b.addedAt - a.addedAt;
		if (photoSort === "favorite") return Number(b.favorite) - Number(a.favorite) || b.addedAt - a.addedAt;
		if (photoSort === "auto-tags") return b.tags.length - a.tags.length || b.addedAt - a.addedAt;
		return b.addedAt - a.addedAt;
	}), [
		discoveryFilter,
		favoritesOnly,
		photoSearch,
		photoSort,
		photos,
		ratingFilter,
		selectedAlbum,
		selectedPerson,
		selectedTag,
		showHiddenPhotos
	]);
	const renderedPhotos = visible.slice(0, photoLimit);
	(0, import_react.useEffect)(() => setPhotoLimit(80), [
		photoSearch,
		selectedPerson,
		selectedAlbum,
		selectedTag,
		favoritesOnly,
		photoSort,
		discoveryFilter,
		ratingFilter
	]);
	(0, import_react.useEffect)(() => {
		if (!slideshow || !visible.length) return;
		return registerPeriodicTask({
			name: "Photo slideshow",
			mode: "visible",
			background: false,
			everyMs: slideSeconds * 1e3,
			work: () => setSlideIndex((index) => (index + 1) % visible.length)
		}).cancel;
	}, [
		slideshow,
		slideSeconds,
		visible.length
	]);
	const featuredPhoto = visible[slideIndex % Math.max(visible.length, 1)];
	const focusedIndex = visible.findIndex((photo) => photo.id === focusedPhotoId);
	const focusedPhoto = focusedIndex >= 0 ? visible[focusedIndex] : photos.find((photo) => photo.id === focusedPhotoId);
	const moveFocus = (direction) => {
		if (!visible.length) return;
		const nextIndex = focusedIndex < 0 ? 0 : (focusedIndex + direction + visible.length) % visible.length;
		setFocusedPhotoId(visible[nextIndex].id);
	};
	const pickFreshDiscovery = () => {
		const unseen = visible.filter((photo) => !discoverySeen.current.has(photo.id));
		const pool = unseen.length ? unseen : visible;
		if (!unseen.length) discoverySeen.current.clear();
		const pick = pool[Math.floor(Math.random() * pool.length)];
		if (!pick) return;
		discoverySeen.current.add(pick.id);
		setSlideIndex(visible.findIndex((photo) => photo.id === pick.id));
		setPhotoViewerLoading(true);
		setFocusedPhotoId(pick.id);
	};
	const suggestPeopleFromNames = () => {
		let labeled = 0;
		setPhotos((items) => items.map((photo) => {
			if (photo.people.length) return photo;
			const candidate = photo.name.replace(/\.[^.]+$/, "").split(/[._\-\d]+/).map((word) => word.trim()).filter((word) => /^[A-Za-z]{3,20}$/.test(word)).find((word) => !/^(img|image|photo|picture|screenshot|copy|edited|final)$/i.test(word));
			if (!candidate) return photo;
			labeled += 1;
			return {
				...photo,
				people: [candidate[0].toUpperCase() + candidate.slice(1).toLowerCase()]
			};
		}));
		setHelperNote(labeled ? `Added ${labeled} suggested label${labeled === 1 ? "" : "s"} from file names. Review each label before relying on it.` : "No clear names were found in unlabeled file names.");
	};
	const autoTagPhotos = () => {
		let changed = 0;
		setPhotos((items) => items.map((photo) => {
			const text = `${photo.name} ${photo.path}`.toLowerCase();
			const extension = photo.name.split(".").pop()?.toLowerCase();
			const album = photo.album.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
			const suggestions = [
				/screenshot|screen[_ -]?shot/.test(text) ? "screenshot" : "",
				/^(img|dsc|pxl|photo)[_ -]?\d/i.test(photo.name) ? "camera" : "",
				/download|image|copy|edited/.test(text) ? "downloaded" : "",
				/vacation|travel|trip|beach|mountain/.test(text) ? "travel" : "",
				/birthday|wedding|party|event/.test(text) ? "event" : "",
				/pet|dog|cat/.test(text) ? "pets" : "",
				/receipt|invoice|document|scan/.test(text) ? "document" : "",
				/food|meal|restaurant|recipe/.test(text) ? "food" : "",
				/selfie|portrait|face/.test(text) ? "portrait" : "",
				extension ? `type-${extension}` : "",
				album && album !== "unsorted" && album !== "source-import" ? `album-${album}` : "",
				photo.favorite ? "favorite" : "",
				photo.rating >= 4 ? "highly-rated" : "",
				`year-${new Date(photo.addedAt).getFullYear()}`,
				`month-${new Date(photo.addedAt).toLocaleString("en-US", { month: "long" }).toLowerCase()}`
			].filter(Boolean);
			const tags = [.../* @__PURE__ */ new Set([...photo.tags, ...suggestions])];
			if (tags.length === photo.tags.length) return photo;
			changed += 1;
			return {
				...photo,
				tags
			};
		}));
		setHelperNote(changed ? `Added local filename-based auto tags to ${changed} photo${changed === 1 ? "" : "s"}. You can edit any tag on its card.` : "Everything already has the available local auto tags.");
	};
	const preparePhotoVision = async (candidates) => {
		const batchCandidates = candidates.slice(0, 48);
		if (!batchCandidates.length) {
			setHelperNote("Every loaded photo already has accepted local vision labels. Add more photos or edit tags to review them again.");
			return;
		}
		setVisionBusy(true);
		setVisionReviewOpen(true);
		setPhotoVisionRows([]);
		setSelectedPhotoVision({});
		setVisionProgress(`Preparing ${VISION_MODELS[visionModel].name} for ${batchCandidates.length.toLocaleString()} photos…`);
		const rows = [];
		try {
			for (let start = 0; start < batchCandidates.length; start += 12) {
				const batch = batchCandidates.slice(start, start + 12);
				const labels = await classifyImagesLocally(batch.map((photo) => photo.url), (done, total) => setVisionProgress(`${VISION_MODELS[visionModel].name} · ${start + done}/${batchCandidates.length} photos`), visionModel, (status) => {
					const transfer = status.total ? ` · ${Math.round((status.loaded ?? 0) / status.total * 100)}%` : "";
					setVisionProgress(`${VISION_MODELS[visionModel].name} · ${status.status ?? status.file ?? "loading"}${transfer} · ${start}/${batchCandidates.length} complete`);
				});
				rows.push(...batch.map((photo, index) => ({
					photoId: photo.id,
					name: photo.name,
					labels: labels[index] ?? [],
					model: visionModel
				})));
				await new Promise((resolve) => window.setTimeout(resolve, 0));
			}
			setPhotoVisionRows(rows);
			setSelectedPhotoVision(Object.fromEntries(rows.flatMap((row) => row.labels.map((label) => [`${row.photoId}:vision-${label.label}`, true]))));
			const suggested = rows.filter((row) => row.labels.length > 0).length;
			setHelperNote(`${VISION_MODELS[visionModel].name} prepared ${suggested} local photo result${suggested === 1 ? "" : "s"} for review. Nothing is saved until you apply selected labels.`);
		} catch (error) {
			if (rows.length) {
				setPhotoVisionRows(rows);
				setSelectedPhotoVision(Object.fromEntries(rows.flatMap((row) => row.labels.map((label) => [`${row.photoId}:vision-${label.label}`, true]))));
				setHelperNote(`${VISION_MODELS[visionModel].name} stopped after preparing ${rows.length} photo${rows.length === 1 ? "" : "s"}: ${error instanceof Error ? error.message : "unknown error"}. Review the completed labels; the remaining photos were not changed.`);
			} else setHelperNote(`${VISION_MODELS[visionModel].name} could not prepare local labels: ${error instanceof Error ? error.message : "unknown error"}. No photo tags changed.`);
		} finally {
			setVisionBusy(false);
			setVisionProgress("");
		}
	};
	const prepareNextPhotoVision = () => void preparePhotoVision(photos.filter((photo) => !photo.vision?.length && !photo.tags.some((tag) => tag.startsWith("vision-"))).slice(0, 48));
	const applyPhotoVision = () => {
		const selectedByPhoto = new Map(photoVisionRows.map((row) => [row.photoId, {
			labels: row.labels.filter((label) => selectedPhotoVision[`${row.photoId}:vision-${label.label}`]),
			model: row.model
		}]));
		let changedPhotos = 0;
		let addedTags = 0;
		const nextPhotos = photos.map((photo) => {
			const selected = selectedByPhoto.get(photo.id);
			if (!selected?.labels.length) return photo;
			const newTags = [
				"auto-tagged",
				`auto-tag-${selected.model}-v2`,
				...selected.labels.map((label) => `vision-${label.label}`)
			].filter((tag) => !photo.tags.includes(tag));
			if (!newTags.length) return photo;
			changedPhotos += 1;
			addedTags += newTags.length;
			return {
				...photo,
				tags: [...photo.tags, ...newTags],
				vision: selected.labels,
				visionModel: selected.model
			};
		});
		setPhotos(nextPhotos);
		setPhotoVisionRows([]);
		setSelectedPhotoVision({});
		setHelperNote(changedPhotos ? `Saved ${addedTags} reviewed vision tag${addedTags === 1 ? "" : "s"} on ${changedPhotos} photo${changedPhotos === 1 ? "" : "s"}. Unselected labels were discarded.` : "No new labels were saved. They may already exist, or every suggested label was unchecked.");
	};
	const discardPhotoVision = () => {
		setPhotoVisionRows([]);
		setSelectedPhotoVision({});
		setHelperNote("Prepared vision labels were discarded. No photo tags changed.");
	};
	const runVisionBenchmark = async () => {
		const sample = photos.filter((photo) => Boolean(photo.url)).slice(0, 24);
		if (!sample.length) {
			setHelperNote("Add photos first. The benchmark only uses photos already loaded in this browser.");
			return;
		}
		setVisionBenchmarkBusy(true);
		setVisionBenchmarkError("");
		setVisionBenchmarkProgress(`Preparing a ${sample.length}-photo local comparison…`);
		try {
			const benchmark = await benchmarkVisionModelsLocally(sample.map((photo) => photo.url), (model, done, total) => setVisionBenchmarkProgress(`${VISION_MODELS[model].name} · ${done}/${total}`), (model, status) => {
				const transfer = status.total ? ` · ${Math.round((status.loaded ?? 0) / status.total * 100)}%` : "";
				setVisionBenchmarkProgress(`${VISION_MODELS[model].name} · ${status.status ?? status.file ?? "loading"}${transfer}`);
			});
			setVisionBenchmark(benchmark);
			setVisionBenchmarkPhotos(sample.map((photo, index) => ({
				id: photo.id,
				name: photo.name,
				url: photo.url,
				clip: benchmark.semantic.labels[index] ?? [],
				siglipBase: benchmark.semanticPlus.labels[index] ?? [],
				siglipLarge: benchmark.semanticPro.labels[index] ?? []
			})));
			try {
				localStorage.setItem("reelcase.photo-vision-benchmark.v1", JSON.stringify(benchmark));
			} catch {}
			setHelperNote(`Vision comparison completed on ${sample.length} local photos. SigLIP large+ is ready for the highest-detail browser review tags.`);
		} catch (error) {
			const message = `${error instanceof Error ? error.message : "The semantic model could not start"}. No tags or defaults were changed.`;
			setVisionBenchmarkError(message);
			setHelperNote(message);
		} finally {
			setVisionBenchmarkBusy(false);
			setVisionBenchmarkProgress("");
		}
	};
	const downloadPhoto = (photo) => {
		const link = document.createElement("a");
		link.href = photo.url;
		link.download = photo.name;
		link.click();
	};
	const applyTagToSelected = (tag) => {
		const clean = tag.trim().toLowerCase();
		if (!clean || !selectedPhotoIds.size) return;
		setPhotos((items) => items.map((photo) => selectedPhotoIds.has(photo.id) ? {
			...photo,
			tags: [.../* @__PURE__ */ new Set([...photo.tags, clean])]
		} : photo));
		setHelperNote(`Added “${clean}” to ${selectedPhotoIds.size} selected photo${selectedPhotoIds.size === 1 ? "" : "s"}.`);
	};
	const startFullScreenSlideshow = async () => {
		const first = visible[slideIndex % Math.max(visible.length, 1)];
		if (!first) return;
		setFocusedPhotoId(first.id);
		setSlideshow(true);
		try {
			await document.documentElement.requestFullscreen?.();
		} catch {
			setHelperNote("Full-screen mode was blocked by this browser. The full-window viewer is still open.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Photo viewer",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Images, { className: "size-4" }),
		title: "Your photos. Your favorites.",
		copy: "Add photos from this device, then group them by people yourself. Nothing uploads from this browser. Google Photos remains a separate, opt-in destination.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap items-center gap-2 rounded-lg border border-border p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4 text-accent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mr-2 text-sm font-medium",
						children: "Rating quest"
					}),
					[
						["all", "All ratings"],
						["unrated", "Needs a rating"],
						["3", "3+ stars"],
						["4", "4+ stars"],
						["5", "5 stars"]
					].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: ratingFilter === value ? "default" : "secondary",
						onClick: () => setRatingFilter(value),
						children: label
					}, value)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						disabled: !photos.some((photo) => !photo.rating),
						onClick: () => {
							const choices = photos.filter((photo) => !photo.rating);
							const pick = choices[(choices.findIndex((photo) => photo.id === ratingQueuePhotoId) + 1 + choices.length) % choices.length];
							if (pick) {
								setRatingQueuePhotoId(pick.id);
								setFocusedPhotoId(pick.id);
							}
						},
						children: ratingQueuePhotoId ? "Continue rating queue" : "Rate a surprise photo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted",
						children: [
							photos.filter((photo) => photo.rating > 0).length,
							" of ",
							photos.length,
							" rated"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-3 text-xs text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [photos.filter((photo) => photo.hidden).length, " hidden photos"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => setShowHiddenPhotos((value) => !value),
						children: showHiddenPhotos ? "Hide hidden photos" : "Manage hidden photos"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Hidden photos stay saved in their albums and can be restored here." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-3 rounded-lg bg-elevated p-5 shadow-border sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-fg",
					children: "Your local photo selection"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted",
					children: "Photo folders become albums here; people labels are local notes, ready to map to XMP/IPTC subject metadata later."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "sr-only",
							type: "file",
							accept: "image/*",
							multiple: true,
							onChange: (event) => addPhotos(event.target.files)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg",
							children: "Add photos"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "sr-only",
							type: "file",
							multiple: true,
							webkitdirectory: "",
							directory: "",
							onChange: (event) => addPhotoFolder(event.target.files)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border",
							children: "Add photo folder"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "https://photos.google.com/",
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border",
							children: "Open Google Photos"
						}),
						photoSearch.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: `https://photos.google.com/search/${encodeURIComponent(photoSearch.trim())}`,
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border",
							children: "Search Google Photos"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "https://www.google.com/android/find/",
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border",
							children: "Find my phone"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-col gap-3 rounded-lg bg-elevated p-4 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: selectedPerson === "All photos" ? "default" : "secondary",
								onClick: () => setSelectedPerson("All photos"),
								children: "All photos"
							}),
							people.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: selectedPerson === name ? "default" : "secondary",
								onClick: () => setSelectedPerson(name),
								children: name
							}, name)),
							albums.map((album) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-sm bg-bg/45 px-2 py-1 text-xs text-muted",
								children: album
							}, album))
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2 border-t border-border pt-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "self-center text-xs text-muted",
								children: "Albums"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: selectedAlbum === "All albums" ? "default" : "secondary",
								onClick: () => {
									setSelectedAlbum("All albums");
									localStorage.removeItem("reelcase.photos.source-filter");
								},
								children: "All albums"
							}),
							albums.map((album) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: selectedAlbum === album ? "default" : "secondary",
								onClick: () => {
									setSelectedAlbum(album);
									localStorage.setItem("reelcase.photos.source-filter", album);
								},
								children: album
							}, album))
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "self-center text-xs text-muted",
								children: "Tags"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: selectedTag === "All tags" ? "default" : "secondary",
								onClick: () => setSelectedTag("All tags"),
								children: "All tags"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: selectedTag === "auto-tagged" ? "default" : "secondary",
								disabled: !visionProcessed,
								onClick: () => setSelectedTag("auto-tagged"),
								children: ["Auto-tagged · ", visionProcessed]
							}),
							photoTags.filter((tag) => tag !== "auto-tagged").slice(0, 16).map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: selectedTag === tag ? "default" : "secondary",
								onClick: () => setSelectedTag(tag),
								children: ["#", tag]
							}, tag))
						]
					}),
					selectedPhotoIds.size > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2 rounded-sm bg-bg/45 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm font-medium text-fg",
								children: [selectedPhotoIds.size, " selected"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => applyTagToSelected("favorite-set"),
								children: "Tag set"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => {
									photos.filter((photo) => selectedPhotoIds.has(photo.id)).forEach(downloadPhoto);
								},
								children: "Download selected"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => setSelectedPhotoIds(/* @__PURE__ */ new Set()),
								children: "Clear selection"
							})
						]
					}),
					photoFolders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: ["Sources · ", photoFolders.join(" · ")]
					}),
					sourceFolders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: ["Video sources available for photo folders · ", sourceFolders.map((folder) => folder.name).slice(0, 8).join(" · ")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 sm:flex-row",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: photoSearch,
								onChange: (event) => setPhotoSearch(event.target.value),
								placeholder: "Search names, people, albums, or file locations",
								"aria-label": "Search photos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: favoritesOnly ? "default" : "secondary",
								onClick: () => setFavoritesOnly((value) => !value),
								children: "Favorites"
							}),
							[
								"newest",
								"name",
								"rating",
								"favorite",
								"auto-tags"
							].map((sort) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: photoSort === sort ? "default" : "secondary",
								onClick: () => setPhotoSort(sort),
								children: sort === "newest" ? "Newest" : sort === "name" ? "A–Z" : sort === "rating" ? "Top rated" : sort === "favorite" ? "Favorites first" : "Auto tags"
							}, sort)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: showLocations ? "default" : "secondary",
								onClick: () => setShowLocations((value) => !value),
								children: showLocations ? "Hide locations" : "Show locations"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: slideshow ? "default" : "secondary",
								onClick: () => setSlideshow((value) => !value),
								children: slideshow ? "Stop auto-change" : "Auto-change photos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: fullScreenSlide ? "default" : "secondary",
								disabled: !visible.length,
								onClick: () => void startFullScreenSlideshow(),
								children: fullScreenSlide ? "Full screen active" : "Full-screen slideshow"
							}),
							slideshow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: slideSeconds,
								onChange: (event) => setSlideSeconds(Number(event.target.value)),
								"aria-label": "Photo slideshow interval",
								className: "h-9 rounded-sm bg-elevated px-2 text-xs text-fg shadow-border",
								children: [
									3,
									5,
									10,
									20,
									30
								].map((seconds) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: seconds,
									children: [
										"Every ",
										seconds,
										"s"
									]
								}, seconds))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: !visible.length,
								onClick: pickFreshDiscovery,
								children: "Fresh discovery"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: !photos.length,
								onClick: suggestPeopleFromNames,
								children: "Suggest people labels"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: !photos.length,
								onClick: autoTagPhotos,
								children: "Auto tag photos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: !photos.length || visionBusy,
								onClick: prepareNextPhotoVision,
								children: visionBusy ? visionProgress || "Starting local vision…" : "Prepare local vision labels · 48"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "self-center text-xs text-muted",
							children: "Local discovery"
						}), [
							"all",
							"screenshots",
							"camera",
							"downloads"
						].map((filter) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: discoveryFilter === filter ? "default" : "secondary",
							onClick: () => setDiscoveryFilter(filter),
							children: filter === "all" ? "All" : filter === "camera" ? "Camera names" : filter[0].toUpperCase() + filter.slice(1)
						}, filter))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-md border border-border bg-bg/45 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
									children: "Local vision"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-fg",
									children: [
										visionProcessed.toLocaleString(),
										" accepted · ",
										visionPending.toLocaleString(),
										" waiting · SigLIP semantic+ is the balanced fast default"
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									disabled: visionBusy || !visionPending,
									onClick: prepareNextPhotoVision,
									children: visionBusy ? visionProgress || "Starting model…" : `Prepare next ${Math.min(48, visionPending)}`
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted",
									children: "Tagging model"
								}), [
									"semanticPro",
									"semanticPlus",
									"semantic"
								].map((model) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: visionModel === model ? "default" : "ghost",
									disabled: visionBusy,
									onClick: () => setVisionModel(model),
									children: VISION_MODELS[model].name
								}, model))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs leading-5 text-muted",
								children: [VISION_MODELS[visionModel].purpose, ". Labels stay on this device until you explicitly apply checked suggestions. Each review is bounded to 48 photos so you can inspect it without a bulk automatic save; CLIP and SigLIP large+ remain available for benchmarked comparison."]
							}),
							photoVisionRows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mt-3 rounded-sm border border-border bg-elevated p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs font-medium text-fg",
										children: ["Review vision labels before saving · ", photoVisionRows.length]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: "Only checked labels are added. Unchecked labels are discarded when you apply or replace this review."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "ghost",
											onClick: discardPhotoVision,
											children: "Discard review"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											disabled: !photoVisionRows.some((row) => row.labels.some((label) => selectedPhotoVision[`${row.photoId}:vision-${label.label}`])),
											onClick: applyPhotoVision,
											children: "Apply selected labels"
										})]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 grid gap-2",
									children: photoVisionRows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-sm border border-border bg-bg/55 p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-xs font-medium text-fg",
											children: row.name
										}), row.labels.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2 flex flex-wrap gap-2",
											children: row.labels.map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "flex items-center gap-2 rounded-xs bg-elevated px-2 py-1 text-xs text-fg",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													className: "size-3.5 accent-accent",
													type: "checkbox",
													checked: Boolean(selectedPhotoVision[`${row.photoId}:vision-${label.label}`]),
													onChange: (event) => setSelectedPhotoVision((current) => ({
														...current,
														[`${row.photoId}:vision-${label.label}`]: event.target.checked
													}))
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
													"#",
													`vision-${label.label}`,
													" · ",
													Math.round(label.score * 100),
													"%"
												] })]
											}, `${row.photoId}:${label.label}`))
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-xs text-muted",
											children: "No confident local label suggested. Nothing will be saved for this photo."
										})]
									}, row.photoId))
								})]
							}),
							visionReviewedPhotos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mt-3 rounded-sm border border-border bg-elevated p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs font-medium text-fg",
											children: ["Accepted photo vision results · ", visionReviewedPhotos.length]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs text-muted",
											children: "These are labels you explicitly saved. Filter the gallery with #auto-tagged or its model-version tag."
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "ghost",
											onClick: () => setVisionReviewOpen((open) => !open),
											children: visionReviewOpen ? "Hide accepted results" : `Review ${visionReviewedPhotos.length}`
										})]
									}),
									visionReviewOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
										children: visionReviewedPhotos.slice(0, 24).map((photo) => {
											const labels = photo.vision?.length ? photo.vision : photo.tags.filter((tag) => tag.startsWith("vision-")).map((tag) => ({
												label: tag.slice(7),
												score: 0
											}));
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "overflow-hidden rounded-xs bg-bg/55 text-left",
												onClick: () => {
													setPhotoViewerLoading(true);
													setFocusedPhotoId(photo.id);
												},
												"aria-label": `Review tags for ${photo.name}`,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: photo.url,
													alt: "",
													loading: "lazy",
													decoding: "async",
													className: "aspect-square w-full object-cover"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "block p-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "block truncate text-xs font-medium text-fg",
														children: photo.name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "mt-1 flex flex-wrap gap-1",
														children: labels.length ? labels.slice(0, 3).map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "rounded-xs bg-elevated px-1.5 py-0.5 text-[11px] text-accent",
															children: [label.label, label.score ? ` · ${Math.round(label.score * 100)}%` : ""]
														}, label.label)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[11px] text-muted",
															children: "No confident label — review image"
														})
													})]
												})]
											}, photo.id);
										})
									}),
									visionReviewOpen && visionReviewedPhotos.length > 24 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 text-xs text-muted",
										children: [
											"Showing 24 of ",
											visionReviewedPhotos.length.toLocaleString(),
											" accepted photos. Use photo tags or search to narrow the gallery."
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 rounded-sm border border-border bg-elevated p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-start justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium text-fg",
											children: "Vision model benchmark"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 max-w-2xl text-xs leading-5 text-muted",
											children: "Compare CLIP, SigLIP semantic+, and SigLIP large+ on the same 24 local photos. The first run downloads optional local models; later runs reuse the browser cache."
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											disabled: visionBenchmarkBusy || !photos.length,
											onClick: () => void runVisionBenchmark(),
											children: visionBenchmarkBusy ? "Comparing…" : "Run 3-model comparison"
										})]
									}),
									visionBenchmarkBusy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 flex items-center gap-2 text-xs text-accent",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3 animate-spin" }), visionBenchmarkProgress || "Preparing local models…"]
									}),
									visionBenchmarkError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 rounded-xs bg-bg/50 px-3 py-2 text-xs text-muted",
										children: ["Benchmark stopped · ", visionBenchmarkError]
									}),
									visionBenchmark && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 grid gap-2 sm:grid-cols-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "rounded-xs bg-bg/50 p-3 text-xs",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-medium text-fg",
													children: VISION_MODELS.semantic.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 text-muted",
													children: [
														visionBenchmark.semantic.elapsedMs.toFixed(0),
														" ms · ",
														visionBenchmark.semantic.labels.flat().length,
														" labels · ",
														visionBenchmark.sampleSize,
														" photos"
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "rounded-xs bg-bg/50 p-3 text-xs",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-medium text-fg",
													children: VISION_MODELS.semanticPlus.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 text-muted",
													children: [
														visionBenchmark.semanticPlus.elapsedMs.toFixed(0),
														" ms · ",
														visionBenchmark.semanticPlus.labels.flat().length,
														" labels · ",
														visionBenchmark.sampleSize,
														" photos"
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "rounded-xs bg-bg/50 p-3 text-xs",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-medium text-fg",
													children: VISION_MODELS.semanticPro.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 text-muted",
													children: [
														visionBenchmark.semanticPro.elapsedMs.toFixed(0),
														" ms · ",
														visionBenchmark.semanticPro.labels.flat().length,
														" labels · ",
														visionBenchmark.sampleSize,
														" photos"
													]
												})]
											})
										]
									}),
									visionBenchmarkPhotos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
										className: "mt-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-medium text-fg",
												children: "Photo-by-photo tag review"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[11px] text-muted",
												children: "CLIP, SigLIP semantic+, and SigLIP large+ results on the same image"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
											children: visionBenchmarkPhotos.map((photo) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
												className: "overflow-hidden rounded-xs border border-border bg-bg/50",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: photo.url,
													alt: photo.name,
													loading: "lazy",
													decoding: "async",
													className: "aspect-video w-full object-cover"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "truncate text-xs font-medium text-fg",
														children: photo.name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "mt-2 grid gap-2",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-[11px] font-medium text-muted",
																children: "CLIP"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "mt-1 flex flex-wrap gap-1",
																children: photo.clip.length ? photo.clip.slice(0, 4).map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	className: "rounded-xs bg-elevated px-1.5 py-0.5 text-[11px] text-accent",
																	children: [
																		label.label,
																		" · ",
																		Math.round(label.score * 100),
																		"%"
																	]
																}, label.label)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-[11px] text-subtle",
																	children: "No confident label"
																})
															})] }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-[11px] font-medium text-muted",
																children: "SigLIP semantic+"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "mt-1 flex flex-wrap gap-1",
																children: photo.siglipBase.length ? photo.siglipBase.slice(0, 4).map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	className: "rounded-xs bg-elevated px-1.5 py-0.5 text-[11px] text-accent",
																	children: [
																		label.label,
																		" · ",
																		Math.round(label.score * 100),
																		"%"
																	]
																}, label.label)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-[11px] text-subtle",
																	children: "No confident label"
																})
															})] }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-[11px] font-medium text-muted",
																children: "SigLIP large+"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "mt-1 flex flex-wrap gap-1",
																children: photo.siglipLarge.length ? photo.siglipLarge.slice(0, 4).map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	className: "rounded-xs bg-elevated px-1.5 py-0.5 text-[11px] text-accent",
																	children: [
																		label.label,
																		" · ",
																		Math.round(label.score * 100),
																		"%"
																	]
																}, label.label)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-[11px] text-subtle",
																	children: "No confident label"
																})
															})] })
														]
													})]
												})]
											}, photo.id))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-[11px] leading-4 text-subtle",
										children: "The CLIP baseline is pinned to a verified revision. Results include model preparation and inference so the comparison reflects the actual browser experience."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
								className: "mt-3 rounded-sm border border-border bg-elevated p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
									className: "cursor-pointer text-xs font-medium text-fg",
									children: ["Upscaler beta · ", upscalerHealth.state === "ready" ? "verified artifact" : "not installed"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: `text-xs leading-5 ${upscalerHealth.state === "ready" ? "text-accent" : "text-muted"}`,
											children: upscalerHealth.detail
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 flex gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => void checkUpscalerHealth(),
												children: "Check"
											}), upscalerHealth.state === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => void removeUpscalerModel(),
												children: "Remove"
											})]
										}),
										upscalerHealth.state !== "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,0.7fr)_auto]",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: upscalerUrl,
													onChange: (event) => setUpscalerUrl(event.target.value),
													placeholder: "HTTPS model URL",
													"aria-label": "Upscaler model URL"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: upscalerChecksum,
													onChange: (event) => setUpscalerChecksum(event.target.value),
													placeholder: "Publisher SHA-256",
													"aria-label": "Upscaler model SHA-256 checksum"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													disabled: upscalerInstalling,
													onClick: () => void installUpscalerModel(),
													children: upscalerInstalling ? "Verifying…" : "Download + verify"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-[11px] leading-4 text-subtle",
											children: "The verified beta artifact is bundled for local preview. Originals and exports remain untouched until you explicitly save a reviewed result."
										})
									]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-5 text-muted",
						children: "Private local discovery uses file-name patterns plus an optional on-device open-source image classifier. It analyzes up to 48 queued photos at a time; photo bytes stay in this browser. A 900-photo warm URL cache and small rendered batches keep scrolling responsive while folders continue to stream."
					}),
					companionCache && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs leading-5 text-subtle",
						children: [
							"Companion cache worker · ",
							companionCache.state,
							" · ",
							companionCache.photos.toLocaleString(),
							" photo metadata hints · ",
							companionCache.videos.toLocaleString(),
							" video metadata hints",
							companionCache.truncated ? " · bounded pass reached its safe limit" : "",
							companionCache.scannedAt ? ` · checked ${new Date(companionCache.scannedAt).toLocaleTimeString([], {
								hour: "numeric",
								minute: "2-digit"
							})}` : "",
							". Media files remain on this computer."
						]
					}),
					companionDeltaNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-5 text-accent",
						children: companionDeltaNote
					}),
					(helperNote || photoSourceLoading || photoMetadataProgress.running || photoCacheNotice) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 text-xs text-accent",
						children: [(photoSourceLoading || photoMetadataProgress.running) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3 animate-spin" }), photoSourceLoading ? `Loading cached photo sources · ${photoScanDone}/${photoScanTotal} folders · ${photoScanFoundPhotos.toLocaleString()} found${photoScanEstimatedPhotos ? ` of about ${photoScanEstimatedPhotos.toLocaleString()}` : ""}${photoScanEta ? ` · about ${photoScanEta}s remaining` : " · estimating time remaining…"}` : photoMetadataProgress.running ? `Reading photo dimensions and dates · ${photoMetadataProgress.done}/${photoMetadataProgress.total} complete${photoMetadataEta ? ` · about ${photoMetadataEta}s remaining` : " · estimating time remaining…"}` : helperNote || photoCacheNotice]
					})
				]
			}),
			!photos.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-lg bg-elevated px-5 py-14 text-center shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/art/realhub-media-cards.webp",
						alt: "",
						loading: "lazy",
						className: "mx-auto h-28 w-36 object-contain"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-display text-2xl text-fg",
						children: "Start with a few favorites"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Add photos here to make private people sections without connecting an account."
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 overflow-hidden rounded-lg bg-elevated shadow-border",
					children: featuredPhoto && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-0 sm:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.5fr)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: featuredPhoto.url,
							alt: featuredPhoto.name,
							decoding: "async",
							className: "aspect-video size-full object-cover"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col justify-center p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
									children: "Now showing"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 font-display text-3xl text-fg",
									children: featuredPhoto.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-sm text-muted",
									children: [
										featuredPhoto.album,
										" · ",
										featuredPhoto.rating || 0,
										"/5 rating"
									]
								}),
								showLocations && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									title: featuredPhoto.path,
									className: "mt-2 truncate text-xs text-muted",
									children: featuredPhoto.path
								})
							]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
						children: renderedPhotos.map((photo) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative overflow-hidden rounded-md bg-elevated shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "absolute z-10 m-2 flex size-7 items-center justify-center rounded-sm bg-bg/75 text-fg",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: selectedPhotoIds.has(photo.id),
										onChange: () => setSelectedPhotoIds((current) => {
											const next = new Set(current);
											if (next.has(photo.id)) next.delete(photo.id);
											else next.add(photo.id);
											return next;
										}),
										"aria-label": `Select ${photo.name}`
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "group relative block w-full",
									onClick: () => {
										setPhotoViewerLoading(true);
										setFocusedPhotoId(photo.id);
									},
									"aria-label": `Open ${photo.name} full screen`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: photo.url,
										alt: photo.name,
										loading: "lazy",
										decoding: "async",
										className: "aspect-square w-full object-cover"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute inset-0 flex items-center justify-center bg-bg/45 opacity-0 transition-opacity group-hover:opacity-100",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "size-6 text-fg" })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "min-w-0 flex-1 truncate text-sm text-fg",
													children: photo.name
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: photo.favorite ? "default" : "secondary",
													onClick: () => setPhotos((items) => items.map((item) => item.id === photo.id ? {
														...item,
														favorite: !item.favorite
													} : item)),
													children: "♥"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "secondary",
													"aria-label": `Download ${photo.name}`,
													onClick: () => downloadPhoto(photo),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "secondary",
													"aria-label": `${photo.hidden ? "Restore" : "Hide"} ${photo.name}`,
													onClick: () => setPhotos((items) => items.map((item) => item.id === photo.id ? {
														...item,
														hidden: !item.hidden
													} : item)),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" })
												})
											]
										}),
										showLocations && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											title: photo.path,
											className: "mt-1 truncate text-xs text-muted",
											children: photo.path
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoStars, {
											name: photo.name,
											rating: photo.rating,
											onChange: (rating) => setPhotos((items) => items.map((item) => item.id === photo.id ? {
												...item,
												rating
											} : item))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "mt-2 h-9",
											placeholder: "People: Alex, Sam",
											value: photo.people.join(", "),
											onChange: (event) => {
												const names = event.target.value.split(",").map((value) => value.trim()).filter(Boolean);
												setPhotos((items) => items.map((item) => item.id === photo.id ? {
													...item,
													people: names
												} : item));
											}
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "mt-2 h-9",
											placeholder: "Tags: travel, pets, event",
											value: photo.tags.join(", "),
											onChange: (event) => {
												const tags = event.target.value.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean).slice(0, 20);
												setPhotos((items) => items.map((item) => item.id === photo.id ? {
													...item,
													tags: [...new Set(tags)]
												} : item));
											}
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "mt-2 h-9",
											placeholder: "Album, e.g. Summer 2026",
											value: photo.album,
											onChange: (event) => setPhotos((items) => items.map((item) => item.id === photo.id ? {
												...item,
												album: event.target.value || "Unsorted"
											} : item))
										})
									]
								})
							]
						}, photo.id))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-center justify-between gap-3 text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"Showing ",
							Math.min(renderedPhotos.length, visible.length),
							" of ",
							visible.length,
							" matching photos"
						] }), renderedPhotos.length < visible.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => setPhotoLimit((limit) => limit + 80),
							children: "Show 80 more"
						})]
					})]
				}),
				focusedPhoto && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					role: "dialog",
					"aria-modal": "true",
					"aria-label": `Viewing ${focusedPhoto.name}`,
					className: "fixed inset-0 z-[80] flex items-center justify-center bg-bg/95 p-4",
					onClick: () => setFocusedPhotoId(null),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex h-full w-full max-w-7xl flex-col gap-3",
						onClick: (event) => event.stopPropagation(),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3 text-fg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate font-medium",
											children: focusedPhoto.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted",
											children: [
												Math.max(1, focusedIndex + 1),
												" of ",
												visible.length || photos.length,
												" · ",
												focusedPhoto.album
											]
										}),
										showLocations && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											title: focusedPhoto.path,
											className: "truncate text-xs text-muted",
											children: focusedPhoto.path
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => setFocusedPhotoId(null),
									children: "Close"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: focusedPhoto.favorite ? "default" : "secondary",
										onClick: () => setPhotos((items) => items.map((item) => item.id === focusedPhoto.id ? {
											...item,
											favorite: !item.favorite
										} : item)),
										children: focusedPhoto.favorite ? "♥ Favorite" : "♡ Favorite"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "secondary",
										"aria-label": `Download ${focusedPhoto.name}`,
										onClick: () => downloadPhoto(focusedPhoto),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Download"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										disabled: visionBusy,
										onClick: () => {
											setFocusedPhotoId(null);
											preparePhotoVision([focusedPhoto]);
										},
										children: visionBusy ? visionProgress || "Preparing labels…" : "Prepare vision labels"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "h-8 min-w-56 flex-1",
										"aria-label": "Edit photo tags",
										value: focusedPhoto.tags.join(", "),
										placeholder: "Add tags, separated by commas",
										onChange: (event) => {
											const nextTags = [...new Set(event.target.value.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
											setPhotos((items) => items.map((item) => item.id === focusedPhoto.id ? {
												...item,
												tags: nextTags
											} : item));
										}
									}),
									focusedPhoto.tags.length ? focusedPhoto.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "rounded-xs bg-elevated px-2 py-1 text-xs text-muted",
										onClick: () => setSelectedTag(tag),
										children: ["#", tag]
									}, tag)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted",
										children: "No tags yet"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoStars, {
								name: focusedPhoto.name,
								rating: focusedPhoto.rating,
								onChange: (rating) => setPhotos((items) => items.map((item) => item.id === focusedPhoto.id ? {
									...item,
									rating
								} : item))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative min-h-0 flex-1",
								children: [
									photoViewerLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-bg/70 text-sm text-fg",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-7 animate-spin text-accent" }), "Loading full-resolution photo…"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: focusedPhoto.url,
										alt: focusedPhoto.name,
										className: "max-h-full w-full object-contain",
										decoding: "async",
										onLoad: () => setPhotoViewerLoading(false),
										onError: () => setPhotoViewerLoading(false)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										className: "absolute top-1/2 left-2 -translate-y-1/2",
										onClick: () => {
											setPhotoViewerLoading(true);
											moveFocus(-1);
										},
										"aria-label": "Previous photo",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										className: "absolute top-1/2 right-2 -translate-y-1/2",
										onClick: () => {
											setPhotoViewerLoading(true);
											moveFocus(1);
										},
										"aria-label": "Next photo",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
									})
								]
							})
						]
					})
				})
			] })
		]
	});
}
var missionStatus = (mission) => mission.done ? "complete" : mission.status ?? "planned";
var missionStatusLabel = {
	planned: "Planned",
	"in-progress": "In progress",
	blocked: "Blocked",
	complete: "Complete"
};
var missionStatusTone = {
	planned: "bg-bg/65 text-muted",
	"in-progress": "bg-accent/15 text-accent",
	blocked: "bg-danger/15 text-danger",
	complete: "bg-accent/10 text-accent"
};
function missionSteps(mission) {
	if (mission.id === "watch") return [
		"Keep host state authoritative and reject stale playback or queue messages.",
		"Run isolated desktop-host and mobile-guest browser checks for connection, chat, playback, seek, and leave.",
		"Confirm the same flows on separate home-network devices, including local-file drift and queue changes."
	];
	if (mission.id === "sprint-19") return [
		"Verify the local guest-window fallback and isolated browser sessions.",
		"Check desktop and mobile room layout, chat, playback, seek, and reconnect in a repeatable browser run.",
		"Repeat on physical home-network devices and record browser, network, drift, and queue results."
	];
	if (mission.id === "watch-room-cross-device") return [
		"Enter temporary TURN credentials on both devices and enable relay-only mode.",
		"Verify both peers report a connected relay candidate and exchange chat and playback commands.",
		"Repeat across separate networks and record the diagnostic result without credentials."
	];
	if (mission.id.startsWith("watch") || mission.id.startsWith("twitch")) return [
		"Capture the current provider or room state without replacing a healthy cached result.",
		"Exercise the focused path with a bounded request, retry, and recovery case.",
		"Record the limit and verification result before increasing any default budget."
	];
	if (mission.id.startsWith("youtube")) return [
		"Keep the first visible shelf interactive while this provider work is deferred.",
		"Verify a recent refresh, an older-item pull, and duplicate-safe merge behavior.",
		"Measure payload and render cost before raising the routine refresh budget."
	];
	if (mission.id.startsWith("speed") || mission.id.startsWith("smooth") || mission.id.startsWith("warp")) return [
		"Add a local measurement or bounded scheduler for the affected work.",
		"Check the large-library path on desktop and phone without console errors or overflow.",
		"Keep the result behind a repeatable release check so it cannot silently regress."
	];
	return [
		"Implement the smallest durable local change that preserves existing saved data.",
		"Verify the normal path plus an interrupted or restored-session path.",
		"Run the production build check and record the remaining external dependency, if any."
	];
}
var DEFAULT_MISSIONS = [
	{
		id: "index",
		title: "Durable media index",
		detail: "Catalog source health, cached metadata, persistent thumbnails, and fast search without blocking the first screen.",
		done: true
	},
	{
		id: "companion",
		title: "Desktop companion",
		detail: "Verify local files, watch selected folders, and launch approved desktop shortcuts through a local companion.",
		done: true
	},
	{
		id: "watch",
		title: "Watch room reliability",
		detail: "Host-authoritative state, stale-command rejection, revisioned queue reconciliation, LAN diagnostics, and guest-access messaging are implemented. Isolated desktop-host/mobile-guest WebRTC, chat, play/pause/seek, reload reconciliation, resync, local-file matching, queue edits, and leave checks pass. Twitch status now waits for playback. Physical-device drift and catalog queue play remain.",
		done: false,
		status: "in-progress"
	},
	{
		id: "watch-room-state-integrity",
		title: "Watch Room state integrity",
		detail: "Done · Watch Room now keeps a compact local session ledger, rejects stale or out-of-order host state, gives queue changes monotonic revisions, and routes guest playback or queue changes through host confirmation.",
		done: true
	},
	{
		id: "watch-room-browser-compatibility",
		title: "Watch Room browser compatibility",
		detail: "Done · local room and session identifiers now fall back safely when a browser exposes Web Crypto without crypto.randomUUID, preventing the room from failing before it can join.",
		done: true
	},
	{
		id: "services",
		title: "Connected services",
		detail: "Keep Twitch, YouTube, Roku, Spotify, and photo imports independently cached and refreshable.",
		done: true
	},
	{
		id: "thumb-health",
		title: "Thumbnail health queue",
		detail: "Retry failed artwork, hide unavailable remote cards, and expose a small source diagnostic instead of blank previews.",
		done: true
	},
	{
		id: "windows-explorer",
		title: "Windows explorer bridge",
		detail: "Companion-backed folder health, change events, shortcut validation, and safe launch history for local libraries.",
		done: true
	},
	{
		id: "service-status",
		title: "Service refresh status",
		detail: "Show when each connected service last refreshed, preserve partial results, and allow focused retries without reloading the whole app.",
		done: true
	},
	{
		id: "vr-theater",
		title: "VR theater reliability",
		detail: "WebXR cinema surface for local playback, controller transport controls, and clear Meta Quest recovery guidance.",
		done: true
	},
	{
		id: "companion-onboarding",
		title: "Companion onboarding",
		detail: "One-screen startup checklist: run the companion, confirm Desktop approval, load shortcuts, verify a file, then launch one game safely.",
		done: true
	},
	{
		id: "large-library-views",
		title: "Large-library views",
		detail: "Progressively render grids and keep recommendations responsive with very large catalog views.",
		done: true
	},
	{
		id: "favorites-memory",
		title: "Favorites memory",
		detail: "Preserve favorites, shelves, and resume markers in the local catalog with export and recovery checks across sessions.",
		done: true
	},
	{
		id: "recovery-import",
		title: "History & stats recovery imports",
		detail: "History and Stats now expose a merge-safe Realhub library-pack import for exported activity, resume marks, follows, shelves, ratings, Adult marks, and saved links.",
		done: true
	},
	{
		id: "anime-library-desk",
		title: "Anime library desk",
		detail: "Done · a separate Anime desk groups saved #anime media into all, continue, series, and films/specials shelves. It can tag existing catalog cards without importing, proxying, or embedding third-party streams.",
		done: true
	},
	{
		id: "tag-search-upgrade",
		title: "Tag search everywhere",
		detail: "Done · the top bar and Adults controls accept human-readable partial tags, match saved creator/source/interest labels, and keep Adult results on the current desk.",
		done: true
	},
	{
		id: "theme-accessibility",
		title: "Theme & accessibility",
		detail: "Day/night palettes, focus styling, reduced-motion support, and per-section density preferences.",
		done: true
	},
	{
		id: "preview-recovery",
		title: "Local preview recovery",
		detail: "Resolve restored file handles in previews, hide failures, and log playback health without blocking the library.",
		done: true
	},
	{
		id: "youtube-quality",
		title: "YouTube channel quality",
		detail: "Per-channel retry controls, published-date ordering, duplicate suppression, and unavailable-card recovery are available in the YouTube desk.",
		done: true
	},
	{
		id: "youtube-focused-archive-capacity",
		title: "YouTube focused archive capacity",
		detail: "Done · a focused creator pull has a 100,000-item metadata ceiling and enough bounded continuation budget to stop at that ceiling or at the public archive end. Routine and bulk pulls stay smaller.",
		done: true
	},
	{
		id: "youtube-comment-response-recovery",
		title: "YouTube comment response recovery",
		detail: "Done · on-demand comment pulls accept both current entity payloads and the durable commentRenderer response shape, with initial-page continuation fallback.",
		done: true
	},
	{
		id: "twitch-quality",
		title: "Twitch live quality",
		detail: "Live-first ordering, per-channel timestamps, VOD/clip shelves, focused refresh, retry deadlines, and an additive archive cache are active.",
		done: true
	},
	{
		id: "x-quality",
		title: "X reading desk quality",
		detail: "Public profile/topic navigation, per-view load state, retry handling, and local reading-position timestamps are available without credentials.",
		done: true
	},
	{
		id: "startup-budget",
		title: "Startup performance budget",
		detail: "Catalog hydration, deferred search-index construction, lazy thumbnails, and bounded photo rendering protect the first usable shelf.",
		done: true
	},
	{
		id: "provider-import-recovery",
		title: "Provider import recovery",
		detail: "Provider refreshes retain successful channel rows, preserve prior cache on partial failures, and use RSS/channel-page plus public Twitch GraphQL recovery paths.",
		done: true
	},
	{
		id: "adult-source-recovery",
		title: "Adult source recovery",
		detail: "Done · Booru pulls use source-aware queries plus JSON, XML, and public-listing recovery so Rule34-style, Gelbooru, and Realbooru responses no longer collapse into empty source chips.",
		done: true
	},
	{
		id: "adult-provider-diverse-recommendations",
		title: "Adult provider-diverse recommendations",
		detail: "Done · personal Adult shelves rank by private signals, then apply creator and provider round-robin guards; videos, photos, and picks each have a full-width discovery rail.",
		done: true
	},
	{
		id: "watch-room-cross-device",
		title: "Watch Room cross-device relay",
		detail: "Temporary TURN credentials and relay-only mode are implemented. Candidate diagnostics now distinguish direct from TURN paths. A real TURN service and two devices on separate networks are still required to prove relay connectivity.",
		done: false,
		status: "blocked"
	},
	{
		id: "movie-private-tag-shelves",
		title: "Movie and private tag shelves",
		detail: "Movies have source, genre, and file-type rails; private shelves retain favorites, tags, history, and rating-aware sorting locally.",
		done: true
	},
	{
		id: "sprint-01",
		title: "Alert rules",
		detail: "Per-service alert switches and the notification activity center are active locally.",
		done: true
	},
	{
		id: "sprint-02",
		title: "Preference coverage",
		detail: "Shipped preferences have concrete local controls, with status copy explaining their effects.",
		done: true
	},
	{
		id: "sprint-03",
		title: "Ratings streaks",
		detail: "Done · choose a local 3, 5, or 10-title weekly goal on Home; distinct ratings drive a local streak counter and transparent rewards.",
		done: true
	},
	{
		id: "sprint-04",
		title: "Video rating import/export",
		detail: "Include local video ratings in backup and catalog export recovery.",
		done: true
	},
	{
		id: "sprint-05",
		title: "Photo rating queue",
		detail: "Make unrated-photo review resumable across sessions.",
		done: true
	},
	{
		id: "sprint-06",
		title: "Continue recovery",
		detail: "Resume marks are durable, throttled away from the video frame loop, and recovered by path when a permitted source reconnects.",
		done: true
	},
	{
		id: "sprint-07",
		title: "History timeline",
		detail: "Limitless activity history deduplicates start bursts while retaining provider, progress, and Watch Room recovery context.",
		done: true
	},
	{
		id: "sprint-08",
		title: "X topic desk",
		detail: "Add curated public topic views alongside saved X profiles.",
		done: true
	},
	{
		id: "sprint-09",
		title: "X read tracking",
		detail: "Public profile/topic views persist their local last-loaded position and show timeout, retry, and official-view diagnostics.",
		done: true
	},
	{
		id: "sprint-10",
		title: "Twitch discovery",
		detail: "Verify recommended public channels and separate discovery from follows.",
		done: true
	},
	{
		id: "sprint-11",
		title: "YouTube discovery",
		detail: "Build a separate creator discovery shelf with follow actions.",
		done: true
	},
	{
		id: "sprint-12",
		title: "Channel recency",
		detail: "Show channel freshness and focused refresh results.",
		done: true
	},
	{
		id: "sprint-13",
		title: "Remote dedupe",
		detail: "Suppress duplicate remote cards while retaining the newest valid metadata.",
		done: true
	},
	{
		id: "sprint-14",
		title: "Artwork retry budget",
		detail: "Local frame artwork has a bounded three-attempt retry budget, source rescan recovery, and per-card failure diagnostics.",
		done: true
	},
	{
		id: "sprint-15",
		title: "File type views",
		detail: "File-type rails now extend from Games into Movies, built from the cached catalog without rescanning sources.",
		done: true
	},
	{
		id: "sprint-16",
		title: "Tag review queue",
		detail: "Smart name/date/type and vision tags remain explicit, reviewable local labels before you rely on them for browsing.",
		done: true
	},
	{
		id: "sprint-17",
		title: "Fast filters",
		detail: "Deferred search indexing, progressive grids, source-scoped selectors, and cached metadata keep large catalog filters off the first paint.",
		done: true
	},
	{
		id: "sprint-18",
		title: "Offline resilience",
		detail: "Cached source health, unavailable-card hiding, recovery views, and source diagnostics distinguish a stale cache from an unavailable file.",
		done: true
	},
	{
		id: "sprint-19",
		title: "Watch room device matrix",
		detail: "The local guest-window fallback and isolated desktop/mobile browser sessions are covered; direct WebRTC, chat, playback requests, seek, resync after reload, local-file consent/match, queue add/remove, leave, and mobile layout pass. In the isolated check, host-to-guest play and pause arrived in roughly 70 ms. Physical home-network devices and additional browser engines remain unverified.",
		done: false,
		status: "in-progress"
	},
	{
		id: "sprint-20",
		title: "Accessibility audit",
		detail: "Shared controls use visible focus states, accessible labels, responsive targets, contrast tokens, and the persisted reduced-motion preference.",
		done: true
	},
	{
		id: "metadata-provenance",
		title: "Metadata provenance and locks",
		detail: "Adopt the open-library pattern: preserve manual tags, record the source of enrichment, and never let a provider overwrite a locked user choice.",
		done: true
	},
	{
		id: "media-inspection",
		title: "Companion media inspection",
		detail: "Use the local companion for optional ffprobe/embedded-tag extraction in bounded batches, with a preview before tags are saved.",
		done: true
	},
	{
		id: "vision-tagging",
		title: "Optional local vision tagging",
		detail: "Evaluate an on-device open model for photo/video scene suggestions, keeping media bytes local and requiring review before labels are applied.",
		done: true
	},
	{
		id: "photo-model-quality",
		title: "Open-source photo tagging quality",
		detail: "On-device vision suggestions are cached by stable file fingerprint and remain review-only as vision-* tags before joining shared taxonomy.",
		done: true
	},
	{
		id: "companion-cache-workers",
		title: "Companion cache workers",
		detail: "Bounded Companion folder-delta, metadata, and thumbnail-hint workers expose their file/time budget and leave the first screen responsive.",
		done: true
	},
	{
		id: "watch-room-local-queue",
		title: "Watch Room local queue handoff",
		detail: "Guests now match approved local files by name, size, and modified time without sending file bytes; the shared handoff queue and room controls synchronize on every device. Catalog room playback is recorded in history.",
		done: true
	},
	{
		id: "photo-super-resolution",
		title: "Local photo upscaler beta",
		detail: "A user-initiated model download is checksum-verified, originals remain untouched, and cache health is reported before any export capability is enabled.",
		done: true
	},
	{
		id: "cross-source-taste-map",
		title: "Cross-source taste map",
		detail: "Stars, creator ratings, liked tags, and shared provider topics now guide cross-source shelves while filename-only terms stay weak.",
		done: true
	},
	{
		id: "companion-delta-apply",
		title: "Companion delta application",
		detail: "New Companion folder-change hints now debounce into bounded refreshes of matching, already-approved browser folders—no reconnect or broad rescan required.",
		done: true
	},
	{
		id: "local-share-compatibility",
		title: "Local share compatibility matrix",
		detail: "The local-share panel now reports exactly how many connected guests matched the staged fingerprint before the host plays it.",
		done: true
	},
	{
		id: "upscaler-model-install",
		title: "Verified upscaler model install",
		detail: "A user-initiated HTTPS download requires a publisher SHA-256, stores only a verified browser-cache artifact with a version record, and offers one-click removal. Runtime/export remain disabled until compatible execution is proven.",
		done: true
	},
	{
		id: "stats-source-remediation",
		title: "Stats-driven source remediation",
		detail: "Stats now offers safe tag and source review queues plus an exportable remediation plan. It never renames, reconnects, or removes files automatically.",
		done: true
	},
	{
		id: "youtube-deep-pagination",
		title: "YouTube deep pagination",
		detail: "Done · focused creator pulls use a bounded 100,000-item public catalog ceiling, duplicate suppression, and a short server cache to avoid repeated provider work; routine and bulk windows remain smaller.",
		done: true
	},
	{
		id: "taste-signal-audit",
		title: "Taste-signal audit",
		detail: "Stats now separates topic coverage, multi-topic depth, cross-source bridges, and operational-label volume so ranking inputs can be inspected before their weight changes.",
		done: true
	},
	{
		id: "tag-noise-budget",
		title: "Tag noise budget",
		detail: "Date, provider, format, source, creator, and keyword labels remain searchable/exportable but are excluded from taste scoring.",
		done: true
	},
	{
		id: "creator-coverage-repair",
		title: "Creator coverage repair",
		detail: "Done · Settings repairs missing YouTube/Twitch creator names in bounded 48-card batches only from exact cached channel/source IDs, retains them across shallow refreshes, preserves locked tags, and visibly leaves conflicting matches for review.",
		done: true
	},
	{
		id: "metadata-tail-coverage",
		title: "Metadata tail coverage",
		detail: "Done · cached metadata enrichment now runs in bounded 48-title batches, reports tagged/waiting/locked coverage by source, preserves manual locks, and makes no provider request.",
		done: true
	},
	{
		id: "recommendation-diversity",
		title: "Recommendation diversity guardrails",
		detail: "Done · Home and provider discovery use deduplicated creator and provider round-robin selection, preserving highly rated favorites while preventing one creator or source from occupying a rail.",
		done: true
	},
	{
		id: "activity-journal",
		title: "Independent activity journal",
		detail: "Keep History, Continue marks, and local viewing counts in an IndexedDB activity record separate from broad preference storage.",
		done: true
	},
	{
		id: "shelf-explanations",
		title: "Explainable recommendation shelves",
		detail: "Done · recommendation rails now state their plain-language reason—ratings, saved creators, freshness, progress, or follow state—without exposing transport tags.",
		done: true
	},
	{
		id: "memory-pressure-observer",
		title: "Memory-pressure observer",
		detail: "Done · local Diagnostics reports mounted-card count, decoded artwork cache entries, active/queued decode work, hit/miss/eviction counts, and frame pressure so large shelves have an observable cause.",
		done: true
	},
	{
		id: "warp-01",
		title: "First-shelf trace",
		detail: "Done · local Diagnostics records launch-to-first-mounted-shelf time, title, and visible-card count. Deeper cache/index and thumbnail splits remain separate work.",
		done: true
	},
	{
		id: "warp-02",
		title: "Route-level code splitting",
		detail: "Done · Hub workspaces plus Adult controls, the video preview/player, and the local guide load on demand. The opening Home route no longer downloads those screens before it is usable.",
		done: true
	},
	{
		id: "warp-03",
		title: "Provider delta rendering",
		detail: "Done · routine provider refreshes keep unchanged cards at their original indexes and preserve their object identity; changed/new rows alone reach shelves, while shallow responses retain on-demand comments and verified creator names.",
		done: true
	},
	{
		id: "warp-04",
		title: "Thumbnail decode governor",
		detail: "Done · visible and near-view artwork uses bounded workers, pauses during input or hidden-tab time, and retains a small queue for responsive recovery.",
		done: true
	},
	{
		id: "warp-05",
		title: "Search worker index",
		detail: "Done · full-text tokenization runs in a dedicated worker, while the search box shows an honest warming state until its local index is ready.",
		done: true
	},
	{
		id: "warp-06",
		title: "Photo metadata stream",
		detail: "Done · local photo dimensions and saved dates stream in eight-item browser chunks, yield between batches, persist each result, and show completed/remaining work with a rolling estimate.",
		done: true
	},
	{
		id: "warp-07",
		title: "Warm route cache",
		detail: "Done · one adjacent Hub desk is warmed only after a paint frame and browser idle time; it yields to active input, hidden tabs, Save-Data, slow networks, and low-memory devices.",
		done: true
	},
	{
		id: "warp-08",
		title: "Virtual rail windows",
		detail: "Done · long horizontal shelves mount only a measured card window with spacers, while arrows, Home/End, and focus bridges keep keyboard travel continuous across unmounted cards.",
		done: true
	},
	{
		id: "warp-09",
		title: "Visible-card priorities",
		detail: "Done · a short foreground lease now protects ratings, playback, card opens, and visible artwork; deferred indexing, discovery, Adult ranking, facets, and speculative images resume only after the interaction window clears.",
		done: true
	},
	{
		id: "warp-10",
		title: "Idle tag batching",
		detail: "Done · each tag edit first writes a recoverable per-title journal, then coalesces the broad preference snapshot outside the input frame.",
		done: true
	},
	{
		id: "warp-11",
		title: "Artwork disk cache audit",
		detail: "Done · Settings audits Companion disk artwork by source with file sizes, oldest update, session hit/miss counts, and explicit partial-inventory or unavailable states.",
		done: true
	},
	{
		id: "warp-12",
		title: "Provider request coalescing",
		detail: "Done · matching in-flight YouTube and Twitch pulls share one provider request across tabs and focused controls.",
		done: true
	},
	{
		id: "warp-13",
		title: "Backoff-aware provider scheduler",
		detail: "Done · provider failures use bounded exponential backoff, show the exact retry time, and retain focused refresh as an override.",
		done: true
	},
	{
		id: "warp-14",
		title: "Twitch archive depth",
		detail: "Twitch now reserves archive checks in every mixed refresh, retains up to 640 recent VOD rows on routine checks and up to 8,000 on focused pulls, and reports sparse channels directly in the Live desk.",
		done: true
	},
	{
		id: "warp-15",
		title: "YouTube freshness ledger",
		detail: "Done · each provider channel records its last successful check, newest published item, and response count.",
		done: true
	},
	{
		id: "warp-16",
		title: "Worker budget adaptation",
		detail: "Done · thumbnail workers adapt to cores, memory class, visibility, and foreground input pressure.",
		done: true
	},
	{
		id: "warp-17",
		title: "Companion warmup contract",
		detail: "Done · warmup is bounded by a visible time/file budget and reports the exact stop reason.",
		done: true
	},
	{
		id: "warp-18",
		title: "Duplicate selector memoization",
		detail: "Done · source and provider selectors share a per-state memo across Home, Stats, and Search paths.",
		done: true
	},
	{
		id: "warp-19",
		title: "Feed image expiry repair",
		detail: "Done · a failed provider image schedules a one-creator refresh while healthy sibling cards remain cached.",
		done: true
	},
	{
		id: "warp-20",
		title: "Low-bandwidth artwork mode",
		detail: "Done · settings can defer provider artwork and retain text-first, fully actionable cards.",
		done: true
	},
	{
		id: "warp-21",
		title: "Catalog hydration checkpoints",
		detail: "Done · local scans append each bounded batch to the catalog cache; the next launch hydrates that checkpoint before any optional folder rescan.",
		done: true
	},
	{
		id: "warp-22",
		title: "History append path",
		detail: "History, Continue marks, and view counts persist through the independent IndexedDB activity record; evicted provider cards retain a recoverable saved-link entry.",
		done: true
	},
	{
		id: "warp-23",
		title: "Rating feedback latency",
		detail: "Done · star input updates locally, coalesces persistence outside the input frame, and reports queue/disk timing in Diagnostics.",
		done: true
	},
	{
		id: "warp-24",
		title: "Remote catalog partitioning",
		detail: "Done · refreshes merge by provider channel; partial Twitch archive responses retain earlier VODs while fresh rows update in place.",
		done: true
	},
	{
		id: "warp-25",
		title: "Tag taxonomy compaction",
		detail: "Done · provider enrichment removes legacy wrappers, whitespace variants, duplicates, and transport-only labels when tags enter the catalog.",
		done: true
	},
	{
		id: "warp-26",
		title: "Render budget dashboard",
		detail: "Done · local Diagnostics reports mounted cards, artwork cache entries, frame pressure, and rating persistence timing.",
		done: true
	},
	{
		id: "warp-27",
		title: "Near-view prefetch",
		detail: "Done · local artwork is requested at a small intersection margin, with bounded workers and no full-library thumbnail sweep.",
		done: true
	},
	{
		id: "warp-28",
		title: "Fast resume lookup",
		detail: "Done · recovery resolves History/Continue entries through a stable provider URL or local path index before falling back to a saved-link card.",
		done: true
	},
	{
		id: "warp-29",
		title: "Vision model benchmark",
		detail: "Compare CLIP with the optional SigLIP semantic model on a broader local sample; the result records preparation plus inference for a quality-focused default.",
		done: true
	},
	{
		id: "warp-30",
		title: "Performance regression gate",
		detail: "Done · the repeatable large-library browser benchmark records startup, scroll settle, mounted cards, overflow, and console errors.",
		done: true
	}
];
var ROADMAP_EXPANSION = [
	...[
		[
			"adult-thumbnail-coverage",
			"Adult preview & playback coverage",
			"Done · Redgifs now uses its durable official iframe in both preview and full player, while direct-media providers bind their known media URL instead of opening an empty player. Existing poster fallback scoring remains in place across Reddit, Redgifs, RedTube, and other adult providers."
		],
		[
			"print-file-viewer",
			"3D print file viewer",
			"Interactive three.js orbit viewer + transform editor for STL, OBJ, GLB/GLTF, and 3MF — lighting/camera presets, wireframe, grid, explode, fullscreen; sample models plus user-added IndexedDB bytes; dispose on close."
		],
		[
			"twitch-view-modes",
			"Twitch viewing modes",
			"Done · the official Twitch player switches between theater and side-details views. Offline channel placeholders stay out of playable shelves, while useful signals rank saved VODs."
		],
		[
			"games-shortcut-curation",
			"Games shortcut curation",
			"Done · Games keeps approved launchers only, enriches companion/folder icons, and stores artwork separately in the local game-icon cache so unrelated desktop helpers cannot enter recommendations."
		]
	].map(([id, title, detail]) => ({
		id,
		title,
		detail,
		done: [
			"print-file-viewer",
			"adult-thumbnail-coverage",
			"twitch-view-modes",
			"games-shortcut-curation"
		].includes(id)
	})),
	...[
		[
			"history-01",
			"History integrity journal",
			"Add monotonic event IDs and an append-only local audit record."
		],
		[
			"history-02",
			"History replay recovery",
			"Reconcile IndexedDB activity events after an interrupted browser session."
		],
		[
			"history-03",
			"History source badges",
			"Show whether each activity came from a direct open, progress, or Watch Room."
		],
		[
			"history-04",
			"History retention controls",
			"Offer local retention windows and export before a user removes older events."
		],
		[
			"history-05",
			"History duplicate guard",
			"Collapse equivalent play bursts without hiding a separate viewing session."
		],
		[
			"history-06",
			"History timezone normalization",
			"Store epoch time and display a clear local-time conversion in every timeline."
		],
		[
			"history-07",
			"History orphan recovery",
			"Keep a saved provider URL or local fingerprint when the source card is evicted."
		],
		[
			"history-08",
			"History privacy review",
			"Expose what is stored locally and keep private/adult history behind the existing gate."
		],
		[
			"history-09",
			"History filter diagnostics",
			"Explain empty history results, source filters, and recovery-card availability."
		],
		[
			"history-10",
			"History restore benchmark",
			"Done · the repeatable isolated-history benchmark restores a 2,400-event IndexedDB snapshot plus append-only journal without duplicate events or lost source provenance."
		]
	].map(([id, title, detail]) => ({
		id,
		title,
		detail,
		done: true
	})),
	...[
		[
			"continue-01",
			"Continue stable identity",
			"Key resume records by provider URL and local fingerprint before transient card IDs."
		],
		[
			"continue-02",
			"Continue duration validation",
			"Reject impossible duration and position values before they enter the resume shelf."
		],
		[
			"continue-03",
			"Continue provider reconciliation",
			"Refresh a provider card without losing its last trustworthy resume point."
		],
		[
			"continue-04",
			"Continue local handle recovery",
			"Reconnect an approved local file handle without rewriting watch progress."
		],
		[
			"continue-05",
			"Continue completion threshold",
			"Remove finished items using a transparent, source-aware completion rule."
		],
		[
			"continue-06",
			"Continue conflict resolution",
			"Choose the newest credible mark when two tabs report different positions."
		],
		[
			"continue-07",
			"Continue shelf explanation",
			"Show why an item is resumable and the timestamp of its last durable mark."
		],
		[
			"continue-08",
			"Continue offline handoff",
			"Queue a local mark safely when storage is unavailable, then replay once."
		],
		[
			"continue-09",
			"Continue bulk repair",
			"Offer a preview-only scan for stale or invalid resume records."
		],
		[
			"continue-10",
			"Continue recovery test",
			"Done · a repeatable browser check validates local, YouTube, Twitch, and Watch Room recovery cards, including provider records no longer in the active catalog."
		]
	].map(([id, title, detail]) => ({
		id,
		title,
		detail,
		done: true
	})),
	...[
		[
			"follow-manager-01",
			"Bounded creator directory",
			"Done · YouTube and Twitch follows now use a searchable, sorted creator directory that mounts 48 channel bubbles at a time instead of expanding a thousand-channel desk."
		],
		[
			"follow-manager-02",
			"Creator bubble actions",
			"Done · each creator has a distinct provider-marked bubble and a focused control panel for creator favorite, 1–5 rating, health context, and safe manual unfollow."
		],
		[
			"follow-manager-03",
			"Follow collection actions",
			"Done · optional creator collections travel in the library pack. Bulk removal previews every affected creator and retains locally saved or watched catalog rows."
		]
	].map(([id, title, detail]) => ({
		id,
		title,
		detail,
		done: [
			"follow-manager-01",
			"follow-manager-02",
			"follow-manager-03"
		].includes(id)
	})),
	...[
		[
			"youtube-upgrade-01",
			"Feed delta cursor",
			"Done · routine checks persist the newest Atom upload identity, return only feed entries ahead of it, and fall back to a bounded recent window when YouTube has aged the cursor out."
		],
		[
			"youtube-upgrade-02",
			"Channel cache budget",
			"Done · channel health now reports response size, cache age, and session hit rate. The server retains only a short feed or ≤2,000-item focused catalog cache, while routine refreshes read the feed slice only."
		],
		[
			"youtube-upgrade-03",
			"First-click trace",
			"Done · YouTube Pull health and Settings diagnostics show local timing from opening YouTube to mounted text-first latest-upload cards, with selector work, artwork, and overlapping provider work separated. No viewing identities are recorded."
		],
		[
			"youtube-upgrade-04",
			"Rail windowing",
			"Done · long YouTube rails mount a measured card window with accessible deferred-card counts, keyboard arrows/Home/End, and focus bridges. The 80,000-video desktop/mobile check passes."
		],
		[
			"youtube-upgrade-05",
			"Artwork priority",
			"Done · on-screen cards take the high-priority image lane, near-view cards use a cancellable low-priority lane, and non-primary offscreen rails defer mounting. Source changes invalidate queued speculative images; titles and actions remain usable while artwork loads or fails."
		],
		[
			"youtube-upgrade-06",
			"Creator ambiguity review",
			"Flag channels whose handle, display name, and channel ID disagree; show a review choice rather than silently merging one creator into another."
		],
		[
			"youtube-upgrade-07",
			"Published-date repair",
			"Done · exact RSS dates win over provider dates and survive shallow/live refreshes, compact cards and disk recovery. Unknown dates stay last without freshness boosts; legacy dates are labeled Saved date. Imports and live observations never invent publication dates."
		],
		[
			"youtube-upgrade-08",
			"Live/VOD split",
			"Done · saved-format controls separate uploads, Shorts and completed streams; current live and upcoming events have their own rows. Cooperative cached groups share cards. Only a successful live check ends a stream, and completed links remain saved with local feedback."
		],
		[
			"youtube-upgrade-09",
			"Deep-pull checkpoint",
			"Done · each creator keeps its catalog continuation and last-check state across reloads. Bounded page/item budgets resume older uploads, detect terminal pages, and stop when continuation data cannot advance."
		],
		[
			"youtube-upgrade-10",
			"Provider error taxonomy",
			"Classify YouTube failures as unavailable, rate-limited, malformed, or network/offline; show the next retry time and keep cached cards untouched."
		],
		[
			"youtube-upgrade-11",
			"Subscription import staging",
			"Validate, deduplicate, and preview a pasted subscription list before network work begins; report accepted, duplicate, and unresolved handles separately."
		],
		[
			"youtube-upgrade-12",
			"Channel health matrix",
			"Show each saved channel’s last successful check, newest known upload, response count, cache age, and retry state in one compact diagnostics view."
		],
		[
			"youtube-upgrade-13",
			"Recommendation diversity",
			"Cap repeated creators and topics across adjacent YouTube rails while preserving highly rated favorites and exposing the diversity rule in shelf copy."
		],
		[
			"youtube-upgrade-14",
			"Shelf explanations",
			"Attach short, human-readable reasons to recommendation rails—rating, creator affinity, freshness, or topic—without exposing internal transport tags."
		],
		[
			"youtube-upgrade-15",
			"Background refresh budget",
			"Reserve a small bounded concurrency and payload budget for automatic YouTube refreshes so provider work cannot delay interactions or Twitch checks."
		],
		[
			"youtube-upgrade-16",
			"Search source filter",
			"Use the existing search index to restrict results to YouTube before rendering suggestion cards, including creator and provider URL matches."
		],
		[
			"youtube-upgrade-17",
			"Offline cache audit",
			"Report cached channel and artwork coverage, oldest cache age, and recoverable saved links; never call a stale cache a successful provider refresh."
		],
		[
			"youtube-upgrade-18",
			"Mobile rail gesture",
			"Validate horizontal rail scrolling, focus visibility, and card action targets on a phone viewport without accidental page scroll or gesture conflicts."
		],
		[
			"youtube-upgrade-19",
			"Refresh result diff",
			"Apply and display only changed channel/video rows after a refresh, preserving card identity, scroll position, ratings, and healthy artwork."
		],
		[
			"youtube-upgrade-20",
			"YouTube regression suite",
			"Done · actual-provider-path fixtures cover feeds, deep pages, cursors, duplicates, metadata recovery and live transitions. The 80,000-entry desktop/mobile gate checks dates, formats, previews, focus and input budgets on dev and production; a million-entry benchmark verifies cooperative shared indexes. Real-provider soaking remains separate."
		]
	].map(([id, title, detail]) => ({
		id,
		title,
		detail,
		done: [
			"youtube-upgrade-01",
			"youtube-upgrade-02",
			"youtube-upgrade-03",
			"youtube-upgrade-04",
			"youtube-upgrade-05",
			"youtube-upgrade-07",
			"youtube-upgrade-08",
			"youtube-upgrade-09",
			"youtube-upgrade-10",
			"youtube-upgrade-11",
			"youtube-upgrade-12",
			"youtube-upgrade-13",
			"youtube-upgrade-14",
			"youtube-upgrade-15",
			"youtube-upgrade-16",
			"youtube-upgrade-19",
			"youtube-upgrade-20"
		].includes(id)
	})),
	...[
		[
			"twitch-upgrade-01",
			"Archive page checkpoint",
			"Done · reloads and library packs retain archive/clip positions and the last accepted VOD. Fresh mirrors beat stale disk lists; unreadable or non-advancing pages hold their safe checkpoint."
		],
		[
			"twitch-upgrade-02",
			"Focused pull queue",
			"Verified · the focused queue holds at most eight explicit creators, runs one selected 500/2,000-VOD and 0/50/250/500-clip batch per creator, and gives shallow live checks a turn before each batch. Duplicate jobs, paused queue cancellation, in-flight stop and global cancellation are covered. Waiting work lives outside the library root and releases on exit; accepted rows and saved positions remain durable."
		],
		[
			"twitch-upgrade-03",
			"VOD cursor diagnostics",
			"Done · Archive coverage shows accepted pages, distinct VODs, repeats, saved position, last VOD and stop reason, including first-page failures. Creator diagnostics load 30 at a time with Show 100 more controls."
		],
		[
			"twitch-upgrade-04",
			"Clip separation audit",
			"Identify clip-length media independently from full VODs using duration and provider shape; correct mislabeled cards without deleting user saves."
		],
		[
			"twitch-upgrade-05",
			"Live-state clock",
			"Record the exact successful live-state observation time, expire stale live labels, and distinguish a live estimate from a confirmed current stream."
		],
		[
			"twitch-upgrade-06",
			"Provider integrity fallback",
			"When Twitch requires an integrity challenge for deeper pages, retain accepted archive data, report the limit plainly, and avoid retry loops that waste provider budget."
		],
		[
			"twitch-upgrade-07",
			"Archive coverage report",
			"Show cached VOD count, oldest/newest known dates, sparse creators, completed historical pulls, and public-provider limits for every followed channel."
		],
		[
			"twitch-upgrade-08",
			"Channel retry budget",
			"Verified · archive and live failure budgets persist independently per creator, back off 15 seconds to five minutes, and survive reload/backup import. Partial page/clip failures also receive cooldowns; healthy live checks cannot erase archive failures. Background rotation skips only the cooling scope. Explicit creator retries remain available and reset only the successful scope."
		],
		[
			"twitch-upgrade-09",
			"VOD merge proof",
			"Done · provider and real-store regression tests preserve accepted pages, older VODs, favorites, ratings, history, progress and valid duration/artwork metadata through partial, empty and failed pulls."
		],
		[
			"twitch-upgrade-10",
			"Creator archive controls",
			"Verified · creator coverage shows the last accepted depth, result, exact saved position, actionable archive/live failures and recommended retry time. Choose VOD/clip budgets, queue up to eight sparse eligible creators, retry an individual creator, open its public channel, remove waiting jobs or stop after the current batch. Budgets are captured per job. Desktop/390px mobile controls and creator paging are verified."
		],
		[
			"twitch-upgrade-11",
			"Stream title delta",
			"Update a live card’s stream title and category only when the provider reports a newer observation, preventing stale title flashes."
		],
		[
			"twitch-upgrade-12",
			"Viewer freshness",
			"Show viewer counts with an observation timestamp and remove them from ranking once they become stale."
		],
		[
			"twitch-upgrade-13",
			"Local cache compaction",
			"Compact duplicate VOD rows by stable provider video ID while retaining the newest metadata and all local feedback references."
		],
		[
			"twitch-upgrade-14",
			"Guest-ready embeds",
			"Verify Twitch Watch Room embeds receive the correct parent host, preserve the selected VOD, and surface a direct-link fallback when the player is blocked."
		],
		[
			"twitch-upgrade-15",
			"VOD duration repair",
			"Recover missing or impossible duration values from accepted provider metadata and never infer a full VOD from a short clip duration."
		],
		[
			"twitch-upgrade-16",
			"Historical search filter",
			"Done · saved archive search filters title, exact creator, inclusive dates and VOD/clip type. Cancellable scans yield between slices and retain 24 results plus one lookahead; keyset pages avoid whole-catalog sorting and preserve preview return focus."
		],
		[
			"twitch-upgrade-17",
			"Mobile live rail",
			"Done · fresh live streams lead the first phone viewport; quick creator refresh is collapsible. Rail navigation follows actual scroll position, including within overscan. Coverage adds 100 creators in small painted batches and releases cards when closed. Desktop/390px production checks cover stale-live exclusion, artwork bounds, filters, paging and preview return."
		],
		[
			"twitch-upgrade-18",
			"Provider error taxonomy",
			"Verified · integrity challenges, public page limits, unavailable creators, unreadable responses, rate limits, network delays and response budgets have bounded diagnoses and recovery actions. First-page failures and partial results preserve saved videos and positions. Global live-query errors are rejected before cached streams can be retired. Deterministic actual API/store regressions and desktop/mobile creator controls pass."
		],
		[
			"twitch-upgrade-19",
			"Twitch device regression",
			"Exercise live, VOD, clip, blocked-embed, and Watch Room handoff behavior across supported browser/device paths before release."
		],
		[
			"twitch-upgrade-20",
			"Twitch archive benchmark",
			"Done · the reproducible 384 MiB Node benchmark measures 20-page cursor walks, additive/repeat merges, serialized growth and bounded search on 100k/million-entry compact archives. The 30k Twitch desktop/phone gate measures browser storage growth, live first paint, scroll settle, input paint and mounted cards. Network throughput, transcripts, physical devices and long-session heap soak remain separate checks; default pull depth is unchanged."
		]
	].map(([id, title, detail]) => ({
		id,
		title,
		detail,
		done: [
			"twitch-upgrade-01",
			"twitch-upgrade-03",
			"twitch-upgrade-09",
			"twitch-upgrade-16",
			"twitch-upgrade-17",
			"twitch-upgrade-20",
			"twitch-upgrade-02",
			"twitch-upgrade-04",
			"twitch-upgrade-05",
			"twitch-upgrade-06",
			"twitch-upgrade-07",
			"twitch-upgrade-08",
			"twitch-upgrade-10",
			"twitch-upgrade-11",
			"twitch-upgrade-12",
			"twitch-upgrade-13",
			"twitch-upgrade-14",
			"twitch-upgrade-15",
			"twitch-upgrade-18"
		].includes(id)
	})),
	...[
		[
			"speed-01",
			"First interaction budget",
			"Verified · local diagnostics use navigation time origin and separate first contentful paint, Home controls, preferences, provider/local disk reads, cooperative preparation, catalog readiness, first mounted shelf and its artwork. YouTube selector work and provider overlap retain their own trace. Startup filtering, indexing, merging and resume linking yield after 512 records or about four milliseconds, and rebase around foreground edits. Large saved-library desktop/phone launches, early navigation, synthetic million-entry preparation, listener cleanup and production rendering checked. Catalog restoration still takes seconds; physical-device and memory soak budgets remain open."
		],
		[
			"speed-02",
			"Provider payload budget",
			"Verified · YouTube, Twitch and Adult metadata reads count decompressed stream bytes, reject incomplete pages above 8 MiB and cancel stalled bodies after 15 seconds. Shared lanes retain bounded waiting work and release cancelled transfers. Warm YouTube/Twitch caches retain at most 250 rows per result, 1 MiB per entry and 4 MiB per provider; larger focused results are delivered whole without a second cached graph. Adult warm responses retain at most 12 MiB. Routine refresh, live, archive and import workers retain explicit concurrency and retry budgets; deep pull targets, pacing settings and manual force retries stay available. Settings diagnostics disclose these safeguards and export numeric limits. Oversize, cancellation, cooldown, accepted-page recovery, focused history, desktop/phone and production checks pass. Real-provider and long-session memory soaking remain open."
		],
		[
			"speed-03",
			"Render invalidation audit",
			"Verified · card reactions subscribe to their own title, including shared preview ratings; unmounted cards release their listeners. Unchanged search grids skip parent updates and retain one published order across watch, like and rating changes. Refresh ranking applies the latest feedback on demand; query, source, hidden, unavailable, privacy and tag changes invalidate old results immediately. Transient work cancels during viewers and on navigation/idle release, and covered grids stop automatic paging. Sidebar counts and covered shelves reuse playback snapshots; comments, clocks and live expiry update only their own surfaces. A million-row result survives 10,000 feedback changes without a scan or rerank. Populated desktop/phone search pagination, preview return, keyboard focus and provider navigation checked. Long-session and physical-device memory soak remain separate milestones."
		],
		[
			"speed-04",
			"Visible artwork priority",
			"Prioritize visible and near-view images, pause offscreen decoding during input, and resume through a bounded queue once the main thread is idle."
		],
		[
			"speed-05",
			"Input latency monitor",
			"Measure interaction-to-paint time for rating, search, queue, play/pause, and source navigation on a large local and provider catalog."
		],
		[
			"speed-06",
			"Idle enrichment queue",
			"Verified · cached repair, metadata-tail batches and smart tags share one cancelable queue. Input, scrolling, hidden tabs and viewers interrupt unfinished work. Sparse immutable tag updates share unchanged entries instead of enumerating or copying full ledgers; manual edits and provider pulls use the same indexed records. Completed rows save in 64-record transactions and recover in 256-row pages, preserving manual tags and categories. Pause/resume, million-entry no-copy tests, desktop/mobile controls, saved recovery and production rendering checked. Full exports, broad preference writes and memory soak remain separate budgets."
		],
		[
			"speed-07",
			"Route warmup policy",
			"Done · one likely Hub module warms after paint and idle time, with Home recommendations given priority. Pending warmup is canceled on navigation or a hidden tab; Save-Data, slow networks, low memory, and active input defer it."
		],
		[
			"speed-08",
			"Cache hit dashboard",
			"Verified · opt-in Settings snapshots report immutable catalog-selector reuse, bounded artwork memory, thumbnail disk recall, viewer-detail retention, and saved YouTube/Twitch provider samples. Ages and payload estimates are labeled by observation scope; missing sizes remain unknown. No media, keys, channel names or URLs enter the export. Captures run on demand instead of rerendering Settings every second; provider metadata survives follow and library-pack recovery. Desktop/phone 80,000-entry and production checks pass."
		],
		[
			"speed-09",
			"Mobile memory budget",
			"Verified · a populated 172,070-entry library with 99,999 YouTube videos runs phone navigation, bounded search, paging, preview, ratings and return under Low memory. The grid starts at 24 titles, retains a 36-card mount ceiling and mounted 12 cards after paging to 48; covered grids hold paging, artwork defers during input and focus returns to the opened title. The compact editor and mobile drawer dismiss correctly without horizontal overflow. Tag inference caps text, words and its 512-card cache; sparse repairs yield to input and wait during active searches/viewers. A 384 MiB Node benchmark covers 100k/million-entry metadata and bounded viewport windows. Desktop/phone development and production checks pass. Capability hints do not emulate CPU speed; physical-device and long-session browser heap soak remain open."
		],
		[
			"speed-10",
			"Performance release gate",
			"Verified · npm run check:performance creates isolated desktop/phone profiles with 80,000 compact entries, paused pulling and Text-first artwork. It gates Home readiness, source navigation, scroll settle, input-to-paint latency, mounted-card count, overflow, console errors, scorecard refresh and private export. Missing measurements fail. Synthetic media and offline Companion responses are explicit fixtures; real-provider throughput, long-session memory and physical devices remain separate checks. Development and production runs pass."
		]
	].map(([id, title, detail]) => ({
		id,
		title,
		detail,
		done: [
			"speed-01",
			"speed-02",
			"speed-03",
			"speed-04",
			"speed-05",
			"speed-06",
			"speed-07",
			"speed-08",
			"speed-09",
			"speed-10"
		].includes(id)
	})),
	...[
		[
			"smooth-01",
			"Navigation transition budget",
			"Verified · source controls and a destination loading shell paint before catalog subscribers run. Rapid switches retain one latest destination; Home and tools can interrupt it immediately. YouTube filtering, stable date sorting, demo exclusion and creator indexing prepare in cancelable slices targeting four milliseconds and reuse exact immutable caches. Hidden preparation sleeps; viewers and unmount cancel it. Desktop/mobile navigation, preview/player return and million-entry cancellation tests checked. Broader render and slow-device audits remain separate."
		],
		[
			"smooth-02",
			"Long-list virtualization proof",
			"Verified · rails resolve only their visible card references, including End jumps; rendered card widths and gaps drive responsive windows. Grids retain bounded measured rows and mounted cards. Arrow/Home/End and bidirectional Tab entry reach unmounted titles; accessible item positions retain catalog totals. Preview return restores a stable grid's visible anchor and keyboard focus. Desktop/phone checks on a 100,000-video YouTube archive, million-entry window tests, 10,000-visit geometry benchmarks and production rendering checked. Physical-device memory soak and browser maximum scroll dimensions remain separate limits."
		],
		[
			"smooth-03",
			"Image decode pressure gauge",
			"Expose decoded-image count, pending decode work, and cache evictions in Diagnostics so memory pressure has an observable cause and recovery."
		],
		[
			"smooth-04",
			"Background-tab throttle",
			"Reduce polling, thumbnail work, and timer-driven reranks while the tab is hidden, then perform one bounded reconciliation when it returns."
		],
		[
			"smooth-05",
			"Search keystroke budget",
			"Done · suggestions debounce and token matching runs in a worker. Search filtering, ranking, sorting, and card resolution yield in cancelable slices outside render. Loading stays visible until matching and ranking both finish; changing input discards stale results. A compact query control opens an editor with Ctrl/Cmd+K or /. The editor collapses on submit, outside pointer, focus exit, Escape, selection, navigation, idle release or viewer open; it releases its catalog inputs and cancels pending drafts while closed. Active queries remain available to reopen or clear. Explicit tool-page searches open a visible result desk; provider and private tag scopes stay intact."
		],
		[
			"smooth-06",
			"Local persistence coalescing",
			"Batch preference and tag writes away from click handlers while journaling the latest operation immediately so a crash cannot lose a user action."
		],
		[
			"smooth-07",
			"Provider-card structural sharing",
			"Reuse unchanged provider card objects and artwork references across refreshes to prevent image reloads, animation resets, and avoidable React reconciliation."
		],
		[
			"smooth-08",
			"Cold-start source ordering",
			"Hydrate the saved local catalog and active source before optional folder verification, remote refresh, Companion warmup, or recommendation ranking begins."
		],
		[
			"smooth-09",
			"Timer consolidation",
			"Verified · recurring pulls, presence, clocks, discovery, diagnostics, photo status/slideshows and Watch Room updates share one lifecycle scheduler. Hidden/idle cosmetic work sleeps; visible idle YouTube archives and background room synchronization retain their policies. Slow requests never overlap or replay missed ticks. One idle deadline replaces activity polling; transport retries and input debounces keep their own deadlines. Desktop/mobile controls and production rendering checked."
		],
		[
			"smooth-10",
			"Slow-device profile",
			"Verified · Adaptive selects smaller budgets for limited device capabilities or Save Data; Low memory can be selected on any device. Artwork retains at most 72 records / 2 MiB, thumbnail work uses one worker, remote images use four slots, new photo scans use two workers, grids load 24 titles with a 36-card mount ceiling, and rails omit extra overscan. Individual settings are retained. Budget changes release cached blob URLs and wake held requests without restarting running network work. Repeated catalog pages and unchanged resume ledgers avoid full copies; large change batches stage only a small scratch map. A reproducible 384 MiB Node benchmark with two-core/two-GiB hints checks 100k/million-entry metadata and viewport windows; populated desktop/phone settings, search and preview paths checked. Capability hints do not emulate CPU speed, and physical-device/browser memory soak remains open."
		],
		[
			"smooth-11",
			"Accessibility performance audit",
			"Verified · deferred shelves mount immediately on keyboard focus and canceled release timers cannot unmount a focused card. Virtual grid and rail Home/End jumps stay bounded and preserve logical positions; page additions have a polite count announcement and keyboard instructions. One modal covers loading, preview and playback, with immediate cancel focus, contained Tab navigation, accessible titles, nested menu Escape handling and return to the opened card. Player shortcuts yield to controls and provider playback keys; local controls stay visible during keyboard focus. A populated saved catalog and 390px phone YouTube grid/preview/player handoffs pass, including artwork still deferred. Development and production desktop/phone render checks pass. Native local playback automation and physical screen-reader/device testing remain limited; long-session memory soak is tracked separately."
		],
		[
			"smooth-12",
			"Smoothness scorecard",
			"Verified · Settings diagnoses Home readiness, latest input paint, recent frame pressure, mounted cards and bounded cache use, with a practical next step that respects paused pulling. Missing/stale samples are shown explicitly. Opt-in frame monitoring follows browsing, stores at most 240 durations, ignores hidden time and releases its loop when shelves unmount or diagnostics turn off. Text-first restores at startup and skips image slots, decoding, Companion recall and timeout-driven creator repair. Automatic artwork repair honors Pause pulls. Tests plus populated desktop/phone and production checks pass."
		]
	].map(([id, title, detail]) => ({
		id,
		title,
		detail,
		done: [
			"smooth-01",
			"smooth-02",
			"smooth-03",
			"smooth-04",
			"smooth-05",
			"smooth-06",
			"smooth-07",
			"smooth-08",
			"smooth-09",
			"smooth-10",
			"smooth-11",
			"smooth-12"
		].includes(id)
	})),
	{
		id: "recent-remote-cache-pages",
		title: "Paged remote catalog recovery",
		detail: "Done · saved provider cards restore in bounded 512-row IndexedDB pages instead of one cursor callback per card. Legacy snapshot rows remain readable; an 80,000-video desktop/mobile restore passes.",
		done: true
	},
	{
		id: "recent-tag-enrichment",
		title: "Low-allocation tag recovery",
		detail: "Verified · YouTube titles, substantive descriptions, hashtags, entities and chapters add keyword tags and explainable topic connections. Promotional lines, links and catalog placeholders are excluded. Text/token/tag and 512-card inference-cache limits keep work bounded. Provider-authored keywords upgrade in idle batches, preserve manual/unknown tags and locks, and save a durable repair version so reloads skip completed work. New pulls use the same inference. Search and viewers hold optional ledger updates; Settings offers Improve YouTube tags and queue controls.",
		done: true
	},
	{
		id: "recent-resume-reconcile",
		title: "Sparse Continue recovery",
		detail: "Done · empty resume maps skip the catalog walk and watched cards resolve stable ID, provider URL, source URL, and path aliases without per-card Set allocations.",
		done: true
	},
	{
		id: "recent-youtube-sweep",
		title: "Fair YouTube archive schedule",
		detail: "Done · hourly background archive sweeps use a small rotating creator budget, recent and live checks have separate clocks, and manual pulls can walk deeper across every eligible creator or playlist. Cursor tests cover reloads and successive next-creator pulls.",
		done: true
	},
	{
		id: "recent-pull-ledger",
		title: "Cross-site pull outcomes",
		detail: "Done · active target and returned/new/failure counts appear during pulls; a bounded local result ledger feeds pull-success statistics and failure details in Stats.",
		done: true
	},
	{
		id: "recent-cold-home-readiness",
		title: "Cold Home readiness proof",
		detail: "Verified · lightweight Home mounts working destination controls before the saved catalog is ready. Home, whole-library restoration and Landing's first recommendation shelf have separate timings; returning Home does not mount recommendations or artwork. Fresh production navigation and reloads, a 172,070-entry saved development profile, and phone/desktop early navigation checked. The full Landing experience waits for usable saved rows. Large-library disk restore remains a measured delay; these checks do not claim physical-device cold storage or a long memory soak.",
		done: true
	},
	{
		id: "recent-saved-library-hydration",
		title: "Saved-library hydration integrity",
		detail: "Done · the first client snapshot now matches the server; saved pull results restore after mount. Populated desktop and phone profiles reload with the result and Mission plan intact and no hydration error.",
		done: true
	},
	{
		id: "recent-provider-soak",
		title: "Real-provider archive soak",
		detail: "Exercise large YouTube/Twitch follow lists under provider limits, confirm fair rotation and retry timing, and record catalog growth, memory pressure, and live-check latency without increasing automatic pull budgets.",
		done: false,
		status: "planned"
	},
	{
		id: "viewer-detail-isolation",
		title: "Viewer detail isolation",
		detail: "Comments update only the selected preview/player and persist one current video to disk. Closing comments performs no catalog scan, card copy, or browse notification; late responses from closed viewers are ignored.",
		done: true
	},
	{
		id: "viewer-detail-memory-budget",
		title: "Viewer detail memory budget",
		detail: "Detail reads coalesce across preview/player, reuse at most twelve records within a 512 KB estimated budget, and exclude oversized transcripts. Clearing the cache prevents old reads repopulating it; repeat-cycle tests and the Settings memory readout track retained details.",
		done: true
	},
	{
		id: "recent-search-result-budget",
		title: "Large-library search result budget",
		detail: "Done · filtering, taste scoring, full-result sorting, and card resolution run outside render in cancelable slices. Search skips covered browse shelves, scopes YouTube/Twitch results before scoring, keeps description/path matches, and counts each top tag once per video. A 100,000-match test and populated desktop/mobile interaction checks pass.",
		done: true
	}
];
var ALL_DEFAULT_MISSIONS = [...DEFAULT_MISSIONS, ...ROADMAP_EXPANSION];
function MissionPlanSection() {
	const [missions, setMissions] = (0, import_react.useState)(() => {
		try {
			const saved = JSON.parse(localStorage.getItem("reelcase.mission-plan.v1") ?? "null");
			const revision = Number(localStorage.getItem("reelcase.mission-plan.revision") ?? "0");
			return mergeMissionPlan(Array.isArray(saved) ? saved : null, ALL_DEFAULT_MISSIONS, Number.isFinite(revision) ? revision : 0);
		} catch {
			return ALL_DEFAULT_MISSIONS;
		}
	});
	const [idea, setIdea] = (0, import_react.useState)("");
	const [showArchive, setShowArchive] = (0, import_react.useState)(false);
	const [companionCheck, setCompanionCheck] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.mission-plan.v1", JSON.stringify(missions));
			localStorage.setItem(MISSION_PLAN_REVISION_KEY, String(24));
		} catch {}
	}, [missions]);
	const completed = missions.filter((mission) => missionStatus(mission) === "complete").length;
	const activeMissions = missions.filter((mission) => missionStatus(mission) !== "complete");
	const archivedMissions = missions.filter((mission) => missionStatus(mission) === "complete");
	const setMissionStatus = (id, status) => setMissions((items) => items.map((item) => item.id === id ? {
		...item,
		status,
		done: status === "complete"
	} : item));
	const exportMissions = () => downloadCsv([[
		"step",
		"title",
		"status",
		"detail"
	], ...missions.map((mission, index) => [
		index + 1,
		mission.title,
		missionStatus(mission),
		mission.detail
	])], `reelcase-mission-plan-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Mission plan",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rocket, { className: "size-4" }),
		title: "Build a private media home that scales.",
		copy: "Realhub is moving toward a fast, local-first media hub: your files load from a durable catalog, your watch room works across your home network, and connected services remain optional and easy to control.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Product mission"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-3xl text-fg",
						children: "One calm control room for a very large library."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-3xl text-sm leading-6 text-muted",
						children: "Make a million-file media collection feel immediate: cache its catalog locally, keep original files private, surface useful recommendations, and let trusted people watch together without turning the app into a cloud upload service."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex items-end justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-display text-2xl text-fg",
							children: [
								completed,
								" of ",
								missions.length,
								" milestones complete"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Every milestone includes implementation, browser verification, and a production build check."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-full bg-accent/15 px-3 py-1 text-sm text-accent",
							children: [missions.length ? Math.round(completed / missions.length * 100) : 0, "%"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 h-2 overflow-hidden rounded-full bg-bg/70",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full bg-accent transition-all",
							style: { width: `${missions.length ? completed / missions.length * 100 : 0}%` }
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-3 flex items-center justify-between gap-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Active delivery queue"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							activeMissions.length,
							" milestone",
							activeMissions.length === 1 ? "" : "s",
							" still need implementation or verification. Each status is saved locally with the plan."
						]
					})] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: activeMissions.map((mission, index) => {
						const status = missionStatus(mission);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "flex gap-4 rounded-lg bg-elevated p-4 shadow-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex shrink-0 flex-col gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "inline-flex min-h-8 items-center justify-center rounded-sm bg-bg/65 px-2 text-xs font-medium text-muted",
										children: `Step ${index + 1}`
									}),
									status === "planned" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										"aria-label": `Start ${mission.title}`,
										onClick: () => setMissionStatus(mission.id, "in-progress"),
										children: "Start"
									}),
									status === "in-progress" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										"aria-label": `Mark ${mission.title} complete`,
										onClick: () => setMissionStatus(mission.id, "complete"),
										children: "Done"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										"aria-label": `Mark ${mission.title} blocked`,
										onClick: () => setMissionStatus(mission.id, "blocked"),
										children: "Block"
									})] }),
									status === "blocked" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										"aria-label": `Resume ${mission.title}`,
										onClick: () => setMissionStatus(mission.id, "in-progress"),
										children: "Resume"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "text-sm font-medium text-fg",
											children: mission.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `rounded-full px-2 py-1 text-xs font-medium ${missionStatusTone[status]}`,
											children: missionStatusLabel[status]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: mission.detail
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
										className: "mt-3 rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
											className: "cursor-pointer font-medium text-fg",
											children: "Break this down"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
											className: "mt-2 list-decimal space-y-1 pl-4",
											children: missionSteps(mission).map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: step }, step))
										})]
									})
								]
							})]
						}, mission.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg border border-border bg-elevated/70 p-4 shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Delivery archive"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [archivedMissions.length, " completed milestones are retained for reference and export."]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => setShowArchive((value) => !value),
						children: showArchive ? "Hide completed work" : "Show completed work"
					})]
				}), showArchive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 space-y-2",
					children: archivedMissions.map((mission) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "flex gap-3 rounded-sm bg-bg/45 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							"aria-label": `Restore ${mission.title} to planned work`,
							onClick: () => setMissionStatus(mission.id, "planned"),
							children: "Done"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-medium text-muted line-through",
								children: mission.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted",
								children: mission.detail
							})]
						})]
					}, mission.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Companion onboarding"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "A safe five-minute desktop setup."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "mt-4 grid gap-3 text-sm text-muted sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-sm bg-bg/45 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "1. Start Companion"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Double-click Start-Realhub-Companion.cmd in the main Realhub folder."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-sm bg-bg/45 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "2. Confirm Desktop"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Keep its window open, then run the check below."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-sm bg-bg/45 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "3. Load shortcuts"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Open Games and choose Load approved desktop shortcuts or Steam/Epic roots."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-sm bg-bg/45 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: "4. Verify first"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Use a listed shortcut inside an approved root before launching it."
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => void (async () => {
									try {
										const data = await companionHealth(true);
										if (!data?.ok) throw new Error("offline");
										setCompanionCheck({
											ready: true,
											desktop: Boolean(data.desktopEnabled),
											detail: `v${data.version ?? "?"} · ${data.roots ?? 0} roots · badge ${data.trayBadge ?? 0}`
										});
										if ((data.trayBadge ?? 0) > 0) companionAckJobs();
									} catch {
										setCompanionCheck({
											ready: false,
											desktop: false,
											detail: "Companion not detected. Start it, leave the window open, then retry."
										});
									}
								})(),
								children: "Check Companion setup"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => void companionSetAutostart(true).then((r) => setCompanionCheck({
									ready: Boolean(r.ok),
									desktop: companionCheck?.desktop ?? false,
									detail: r.ok ? "Windows auto-start enabled for Companion." : r.error || "Auto-start failed."
								})),
								children: "Enable Windows auto-start"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => void companionSetAutostart(false).then((r) => setCompanionCheck({
									ready: companionCheck?.ready ?? false,
									desktop: companionCheck?.desktop ?? false,
									detail: r.ok ? "Windows auto-start removed." : r.error || "Could not clear auto-start."
								})),
								children: "Disable auto-start"
							})
						]
					}),
					companionCheck && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `mt-3 text-sm ${companionCheck.ready && companionCheck.desktop ? "text-accent" : "text-danger"}`,
						children: companionCheck.ready ? `Ready · Desktop ${companionCheck.desktop ? "approved" : "not approved"} · ${companionCheck.detail}` : companionCheck.detail
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted",
						children: "Offline yt-dlp jobs raise a Windows tray balloon when they finish. Loopback + origin check only — Companion never accepts LAN clients."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-5" }),
						title: "Next: home network",
						copy: "Folder watch events, Roku discovery, stable room invitations, and stronger timeline recovery."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Images, { className: "size-5" }),
						title: "Then: media intelligence",
						copy: "Background metadata, thumbnail health, faster source search, and reviewable local tags."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-5" }),
						title: "Later: optional assistants",
						copy: "Private recommendation controls, explainable picks, and only opt-in service connections."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						onClick: exportMissions,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Export mission plan"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => setMissions(ALL_DEFAULT_MISSIONS),
						children: "Reset to the current delivery queue"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "self-center text-xs text-muted",
						children: "Exports the current status, or restores the complete delivery baseline."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-5 flex flex-col gap-2 sm:flex-row",
				onSubmit: (event) => {
					event.preventDefault();
					const title = idea.trim();
					if (!title) return;
					setMissions((items) => [...items, {
						id: createLocalId("mission-"),
						title,
						detail: "New idea — break this into implementation and verification steps.",
						done: false
					}]);
					setIdea("");
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: idea,
					onChange: (event) => setIdea(event.target.value),
					placeholder: "Add a larger change idea",
					"aria-label": "New mission idea"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Add to plan"
				})]
			})
		]
	});
}
function GamesSection() {
	const [games, setGames] = (0, import_react.useState)([]);
	const [filter, setFilter] = (0, import_react.useState)("");
	const [removeGame, setRemoveGame] = (0, import_react.useState)(null);
	const [launchNotice, setLaunchNotice] = (0, import_react.useState)("");
	const [shortcutView, setShortcutView] = (0, import_react.useState)("all");
	const [fileType, setFileType] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)("name");
	const [companionLoading, setCompanionLoading] = (0, import_react.useState)(false);
	const sourceShortcuts = useSourceAssets((s) => s.shortcuts);
	const [iconPulling, setIconPulling] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const saved = readHub().games;
		const icons = loadGameIconCache();
		setGames(saved.map((game) => ({
			...game,
			iconData: game.iconData || icons[game.path]
		})));
	}, []);
	const saveGames = (next) => {
		const slim = next.map(({ iconData, ...rest }) => {
			if (iconData) saveGameIcon(rest.path, iconData);
			return rest;
		});
		setGames(next);
		writeHub({
			...readHub(),
			games: slim
		});
	};
	const mergeIcons = (current, iconMap) => current.map((game) => {
		const icon = iconMap.get(game.path);
		return icon ? {
			...game,
			iconData: icon
		} : game;
	});
	const pullMissingIcons = async (list) => {
		const missing = list.filter((game) => !game.iconData).map((game) => game.path);
		if (!missing.length) return list;
		setIconPulling(true);
		try {
			const iconMap = await fetchCompanionIcons(missing);
			if (!iconMap.size) return list;
			const next = mergeIcons(list, iconMap);
			saveGames(next);
			return next;
		} finally {
			setIconPulling(false);
		}
	};
	const add = async (files, allowWebShortcut = false) => {
		if (!files) return;
		const allFiles = Array.from(files);
		const source = allFiles.filter((file) => allowWebShortcut ? /\.(exe|lnk|url|appref-ms)$/i.test(file.name) : /\.(exe|lnk|url|appref-ms)$/i.test(file.name));
		const folderIcons = await iconsFromFolderFiles(allFiles);
		const next = await Promise.all(source.map(async (file) => {
			let launchUrl;
			if (/\.url$/i.test(file.name)) launchUrl = (await file.text()).match(/^URL\s*=\s*((?:https?|steam|epic|com\.epicgames\.launcher|xbox):\S+)/im)?.[1];
			const path = file.webkitRelativePath || file.name;
			const iconData = folderIcons.get(path.replace(/\\/g, "/")) || folderIcons.get(path);
			if (iconData) saveGameIcon(path, iconData);
			return {
				name: file.name,
				path,
				size: file.size,
				addedAt: Date.now(),
				launchUrl,
				iconData
			};
		}));
		let merged = [];
		setGames((current) => {
			merged = [...current, ...next.filter((item) => !current.some((game) => game.path === item.path))];
			writeHub({
				...readHub(),
				games: merged.map(({ iconData: _icon, ...rest }) => rest)
			});
			return merged;
		});
		pullMissingIcons(merged.length ? merged : next);
	};
	(0, import_react.useEffect)(() => {
		if (sourceShortcuts.length) add(sourceShortcuts, true);
	}, [sourceShortcuts]);
	const launchDesktop = async (game) => {
		try {
			const result = await (await fetch("http://127.0.0.1:43123/launch", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ path: game.path })
			})).json();
			setLaunchNotice(result.ok ? `Launching ${game.name} through the local companion.` : result.error ?? "The companion could not launch this item.");
		} catch {
			setLaunchNotice("Desktop launch needs the Realhub Companion running and this shortcut inside one of its approved Windows folders.");
		}
	};
	const loadApprovedShortcuts = async () => {
		setCompanionLoading(true);
		try {
			const result = await (await fetch("http://127.0.0.1:43123/shortcuts?limit=300")).json();
			if (!result.ok) throw new Error(result.error ?? "The companion could not read approved shortcuts.");
			const cachedIcons = loadGameIconCache();
			const next = (result.shortcuts ?? []).map((item) => ({
				...item,
				size: 0,
				addedAt: Date.now(),
				iconData: cachedIcons[item.path]
			}));
			let merged = [];
			setGames((current) => {
				const incoming = new Map(next.map((item) => [item.path, item]));
				merged = [...current.map((game) => {
					const refreshed = incoming.get(game.path);
					return refreshed ? {
						...game,
						...refreshed,
						iconData: game.iconData || refreshed.iconData
					} : game;
				}), ...next.filter((item) => !current.some((game) => game.path === item.path))];
				writeHub({
					...readHub(),
					games: merged.map(({ iconData: _icon, ...rest }) => rest)
				});
				return merged;
			});
			const got = (await pullMissingIcons(merged.length ? merged : next)).filter((game) => game.iconData).length;
			setLaunchNotice(next.length ? `Added ${next.length} approved desktop shortcuts · ${got} icons cached. Desktop launch still needs the companion.` : "No approved desktop shortcuts were found. Add a shortcut to Desktop or another approved companion folder.");
		} catch {
			setLaunchNotice("Companion connection unavailable. Start the local Realhub Companion, then try again.");
		} finally {
			setCompanionLoading(false);
		}
	};
	const gameTypes = [...new Set(games.map((game) => (game.name.match(/\.([^.]+)$/)?.[1] ?? "other").toLowerCase()))].sort();
	const visible = games.filter((game) => game.name.toLowerCase().includes(filter.toLowerCase()) && (shortcutView === "all" || (shortcutView === "ready" ? gameKind(game) === "web-ready" : shortcutView === "unknown" ? gameKind(game) === "web-needs-target" : !isWebGame(game))) && (fileType === "all" || game.name.toLowerCase().endsWith(`.${fileType}`))).filter((game) => shortcutView === "all" || !isGameHelper(game)).sort((a, b) => sort === "newest" ? b.addedAt - a.addedAt : sort === "type" ? a.name.split(".").pop().localeCompare(b.name.split(".").pop()) || a.name.localeCompare(b.name) : a.name.localeCompare(b.name));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Desktop game shelf",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gamepad2, { className: "size-4" }),
		title: "A clearer game drawer.",
		copy: "Choose a dedicated games folder (icons from sibling .ico/.png), load approved Desktop shortcuts through the companion (shell icons + folder art), or set a cover manually. Web shortcuts open directly; desktop launchers need the companion.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-3 sm:flex-row",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "sr-only",
						type: "file",
						multiple: true,
						accept: ".url",
						onChange: (event) => void add(event.target.files, true)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg",
						children: "Add web game shortcut"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						disabled: companionLoading,
						onClick: () => void loadApprovedShortcuts(),
						children: companionLoading ? "Reading approved shortcuts…" : "Load approved desktop shortcuts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						disabled: companionLoading,
						onClick: () => void (async () => {
							setCompanionLoading(true);
							try {
								const listed = await companionSteamEpicGames(250);
								if (!listed.length) {
									setLaunchNotice("No Steam/Epic libraries under approved roots. Add the Steam or Epic Games folder to REELCASE_ALLOWED_ROOTS.");
									return;
								}
								const next = listed.map((game) => ({
									name: game.name,
									path: game.path,
									size: 0,
									addedAt: Date.now()
								}));
								setGames((current) => {
									const merged = [...current, ...next.filter((item) => !current.some((game) => game.path === item.path))];
									writeHub({
										...readHub(),
										games: merged.map(({ iconData: _icon, ...rest }) => rest)
									});
									return merged;
								});
								setLaunchNotice(`Loaded ${listed.length} Steam/Epic title${listed.length === 1 ? "" : "s"} from known install dirs under approved roots.`);
								pullMissingIcons(next);
							} finally {
								setCompanionLoading(false);
							}
						})(),
						children: "Load Steam / Epic from approved roots"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						disabled: iconPulling || companionLoading || !games.some((game) => !game.iconData),
						onClick: () => void (async () => {
							const filled = (await pullMissingIcons(games)).filter((game) => game.iconData).length - games.filter((game) => game.iconData).length;
							setLaunchNotice(filled > 0 ? `Pulled ${filled} desktop icon${filled === 1 ? "" : "s"} via companion / folder art.` : "No new icons found. Start the companion or add .ico/.png next to launchers.");
						})(),
						children: iconPulling ? "Pulling icons…" : "Pull missing icons"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "sr-only",
						type: "file",
						multiple: true,
						webkitdirectory: "",
						directory: "",
						onChange: (event) => void add(event.target.files)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-flex min-h-10 items-center rounded-sm bg-elevated px-4 text-sm text-fg shadow-border",
						children: "Choose game folder"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: filter,
						onChange: (event) => setFilter(event.target.value),
						placeholder: "Filter your games",
						"aria-label": "Filter games"
					}),
					[
						"all",
						"ready",
						"desktop",
						"unknown"
					].map((view) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: shortcutView === view ? "default" : "secondary",
						onClick: () => setShortcutView(view),
						children: view === "all" ? "All (helpers hidden)" : view === "ready" ? "Web ready" : view === "desktop" ? "Desktop" : "Unknown URL"
					}, view))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted",
						children: "File type"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: fileType === "all" ? "default" : "secondary",
						onClick: () => setFileType("all"),
						children: "All types"
					}),
					gameTypes.map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: fileType === type ? "default" : "secondary",
						onClick: () => setFileType(type),
						children: [".", type]
					}, type)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 text-xs text-muted",
						children: "Sort"
					}),
					[
						"name",
						"newest",
						"type"
					].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: sort === value ? "default" : "secondary",
						onClick: () => setSort(value),
						children: value === "name" ? "A–Z" : value === "newest" ? "Recently added" : "File type"
					}, value))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center justify-between gap-3 rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					visible.length,
					" shown · ",
					games.filter((game) => gameKind(game) === "web-needs-target").length,
					" web shortcuts need a readable target"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: () => downloadCsv([[
						"name",
						"path",
						"kind",
						"extension",
						"launch_ready",
						"helper",
						"added_at"
					], ...games.map((game) => [
						game.name,
						game.path,
						gameKind(game),
						game.name.split(".").pop() ?? "",
						Boolean(game.launchUrl),
						isGameHelper(game),
						new Date(game.addedAt).toISOString()
					])], `reelcase-games-debug-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3" }), " Export game debug CSV"]
				})]
			}),
			visible.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid gap-3 sm:grid-cols-2",
				children: visible.map((game) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4 rounded-lg bg-elevated p-4 shadow-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-accent/10 text-center text-[10px] font-bold tracking-[0.08em] text-accent",
						children: game.iconData ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: game.iconData,
							alt: "",
							className: "size-full object-cover"
						}) : gameBadge(game)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-base font-medium text-fg",
								children: game.name.replace(/\.(exe|lnk|url|appref-ms)$/i, "")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 truncate text-xs text-muted",
								children: gameKind(game) === "web-ready" ? "Web launcher ready" : gameKind(game) === "web-needs-target" ? "Shortcut target is unknown here — open it through the Companion or refresh its target" : game.path
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										onClick: () => {
											if (game.launchUrl) {
												const link = document.createElement("a");
												link.href = game.launchUrl;
												link.target = game.launchUrl.startsWith("http") ? "_self" : "_blank";
												document.body.appendChild(link);
												link.click();
												link.remove();
												return;
											}
											if (gameKind(game) === "web-needs-target") {
												launchDesktop(game);
												return;
											}
											launchDesktop(game);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rocket, { className: "size-3" }), gameKind(game) === "web-needs-target" ? "Open .url shortcut" : isWebGame(game) ? "Open web game" : "Launch desktop game"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "inline-flex cursor-pointer items-center text-xs text-muted hover:text-fg",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "mr-1 size-3" }),
											" Set icon",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												className: "sr-only",
												type: "file",
												accept: "image/*",
												onChange: (event) => {
													const file = event.target.files?.[0];
													if (!file) return;
													const reader = new FileReader();
													reader.onload = () => {
														const iconData = String(reader.result);
														saveGameIcon(game.path, iconData);
														saveGames(games.map((item) => item.path === game.path ? {
															...item,
															iconData
														} : item));
													};
													reader.readAsDataURL(file);
												}
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										target: "_blank",
										rel: "noreferrer",
										href: `https://store.steampowered.com/search/?term=${encodeURIComponent(game.name.replace(/\..*$/, ""))}`,
										className: "inline-flex text-xs text-muted hover:text-fg",
										children: ["Store page ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-1 size-3" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "text-xs text-muted hover:text-danger",
										onClick: () => removeGame === game.path ? (saveGames(games.filter((item) => item.path !== game.path)), setRemoveGame(null)) : setRemoveGame(game.path),
										children: removeGame === game.path ? "Confirm remove" : "Remove"
									})
								]
							})
						]
					})]
				}, game.path))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-lg bg-elevated px-5 py-14 text-center shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gamepad2, { className: "mx-auto size-7 text-accent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-display text-2xl text-fg",
						children: "Build your launch list"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Add `.url` shortcuts to launch their approved web destination, or catalog desktop launchers and choose a custom cover icon."
					})
				]
			}),
			launchNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 rounded-md bg-elevated px-3 py-2 text-xs leading-5 text-muted shadow-border",
				children: launchNotice
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceLink, {
					name: "Nexus Mods",
					href: "https://www.nexusmods.com/",
					copy: "Browse mod pages and collections."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceLink, {
					name: "Vortex",
					href: "https://www.nexusmods.com/about/vortex/",
					copy: "Open the official mod manager page."
				})]
			})
		]
	});
}
var PRIVATE_SHORTCUTS_KEY = "reelcase.private-web-shortcuts.v1";
function PrivateWebShortcuts() {
	const [links, setLinks] = (0, import_react.useState)(() => {
		try {
			const saved = JSON.parse(localStorage.getItem(PRIVATE_SHORTCUTS_KEY) ?? "[]");
			return Array.isArray(saved) ? saved.filter((item) => typeof item?.name === "string" && typeof item?.url === "string") : [];
		} catch {
			return [];
		}
	});
	const [name, setName] = (0, import_react.useState)("");
	const [url, setUrl] = (0, import_react.useState)("");
	const save = (next) => {
		setLinks(next);
		localStorage.setItem(PRIVATE_SHORTCUTS_KEY, JSON.stringify(next));
	};
	const add = () => {
		try {
			const parsed = new URL(url);
			if (!/^https?:$/.test(parsed.protocol)) throw new Error("unsupported");
			save([...links, {
				id: createLocalId("link-"),
				name: name.trim() || parsed.hostname,
				url: parsed.toString()
			}]);
			setName("");
			setUrl("");
		} catch {
			setUrl("");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-6 rounded-xl bg-elevated p-5 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
				children: "Private web shortcuts"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 font-display text-2xl text-fg",
				children: "Your saved destinations"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs leading-5 text-muted",
				children: "Add only links you trust. These are saved only in this browser and open when you press Launch."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-2 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_auto]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						onChange: (event) => setName(event.target.value),
						placeholder: "Name",
						"aria-label": "Shortcut name"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: url,
						onChange: (event) => setUrl(event.target.value),
						placeholder: "https://…",
						"aria-label": "Shortcut URL"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: !url.trim(),
						onClick: add,
						children: "Save shortcut"
					})
				]
			}),
			links.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-2 sm:grid-cols-2",
				children: links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 rounded-md bg-bg/45 p-3 shadow-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-medium text-fg",
								children: link.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs text-muted",
								children: link.url
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => window.location.assign(link.url),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rocket, { className: "size-3" }), "Launch"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => save(links.filter((item) => item.id !== link.id)),
							children: "Remove"
						})
					]
				}, link.id))
			})
		]
	});
}
function LocalCatalog({ kind, eyebrow, icon, title, copy, accept, directory, footer }) {
	const [hub, setHub] = (0, import_react.useState)({
		prints: [],
		games: []
	});
	const [viewer, setViewer] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [companionNote, setCompanionNote] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => setHub(readHub()), []);
	const items = hub[kind];
	const change = async (files) => {
		if (!files?.length) return;
		if (kind === "prints") {
			setBusy(true);
			try {
				const nextItems = [];
				for (const file of [...files]) {
					const blobId = await savePrintBlob(file);
					nextItems.push({
						name: file.name,
						path: file.webkitRelativePath || file.name,
						size: file.size,
						addedAt: Date.now(),
						id: blobId ?? void 0
					});
				}
				const next = {
					...hub,
					prints: [...nextItems, ...hub.prints].slice(0, 120)
				};
				setHub(next);
				writeHub(next);
			} finally {
				setBusy(false);
			}
			return;
		}
		const next = {
			...hub,
			[kind]: filesToItems(files, kind === "games")
		};
		setHub(next);
		writeHub(next);
	};
	const canView = (item) => Boolean(item.sampleSrc || item.id && isViewablePrintName(item.name));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow,
		icon,
		title,
		copy,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-6 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-elevated/40 px-5 text-center transition-[background-color,border-color] duration-150 hover:border-fg/30 hover:bg-elevated",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-7 text-accent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-3 text-sm font-medium text-fg",
						children: directory ? "Choose Desktop games folder" : busy ? "Saving print files…" : "Add print files"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 text-xs text-muted",
						children: directory ? "Keeps only game launchers and shortcuts; folders and support files stay out." : "STL, OBJ, GLB/GLTF, and 3MF open in the in-app viewer; G-code is catalog-only."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						multiple: true,
						accept,
						className: "sr-only",
						disabled: busy,
						...directory ? {
							webkitdirectory: "",
							directory: ""
						} : {},
						onChange: (event) => {
							change(event.target.files);
							event.target.value = "";
						}
					})
				]
			}),
			kind === "prints" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						disabled: busy,
						onClick: () => void (async () => {
							setBusy(true);
							try {
								const { prints } = await companionListPrints(120);
								if (!prints.length) {
									setCompanionNote("No STL/OBJ/GLB/3MF under approved roots (or Realhub Prints). Add a prints folder to REELCASE_ALLOWED_ROOTS.");
									return;
								}
								const nextItems = [];
								for (const row of prints.slice(0, 40)) {
									if (!isViewablePrintName(row.name)) continue;
									const file = await companionReadPrint(row.path);
									if (!file.ok || !file.dataBase64) continue;
									const bytes = Uint8Array.from(atob(file.dataBase64), (c) => c.charCodeAt(0));
									const blobId = await savePrintBlob(new File([bytes], file.name || row.name, { type: "application/octet-stream" }));
									nextItems.push({
										name: row.name,
										path: row.path,
										size: row.size,
										addedAt: Date.now(),
										id: blobId ?? void 0
									});
								}
								if (!nextItems.length) {
									setCompanionNote("Companion listed prints, but none could be loaded (size/format).");
									return;
								}
								const next = {
									...hub,
									prints: [...nextItems, ...hub.prints].slice(0, 120)
								};
								setHub(next);
								writeHub(next);
								setCompanionNote(`Opened ${nextItems.length} print file${nextItems.length === 1 ? "" : "s"} from approved companion folders.`);
							} finally {
								setBusy(false);
							}
						})(),
						children: "Open prints from companion folder"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						disabled: busy || !items.some((item) => item.id),
						onClick: () => void (async () => {
							setBusy(true);
							try {
								let saved = 0;
								for (const item of items.slice(0, 20)) {
									if (!item.id || !isViewablePrintName(item.name)) continue;
									const { loadPrintBlob } = await import("./prints-blobs-Df0ZjTMe.mjs");
									const record = await loadPrintBlob(item.id);
									if (!record?.blob) continue;
									const buffer = new Uint8Array(await record.blob.arrayBuffer());
									let binary = "";
									for (let i = 0; i < buffer.length; i += 1) binary += String.fromCharCode(buffer[i]);
									if ((await companionSavePrint(item.name, btoa(binary))).ok) saved += 1;
								}
								setCompanionNote(saved ? `Saved ${saved} print file${saved === 1 ? "" : "s"} into the companion Realhub Prints folder.` : "Nothing saved — start Companion and ensure an approved prints folder exists.");
							} finally {
								setBusy(false);
							}
						})(),
						children: "Save open prints to companion"
					}),
					companionNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "w-full text-xs text-muted",
						children: companionNote
					})
				]
			}),
			items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 overflow-hidden rounded-lg shadow-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium text-fg",
						children: [
							items.length,
							" saved ",
							kind === "prints" ? "print files" : "games"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle",
						children: kind === "prints" ? "Names in localStorage · viewable bytes in IndexedDB" : "Stored as names only"
					})]
				}), items.slice(0, 80).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-4 border-b border-border/70 px-4 py-3 last:border-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm text-fg",
							children: item.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted",
							children: item.path
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 items-center gap-2",
						children: [kind === "prints" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: canView(item) ? "default" : "secondary",
							type: "button",
							disabled: !canView(item),
							title: canView(item) ? "Open viewer + editor" : /\.gcode$/i.test(item.name) ? "G-code is not a mesh preview" : "Re-add this file to enable preview",
							onClick: () => setViewer({
								name: item.name,
								path: item.path,
								size: item.size,
								sampleSrc: item.sampleSrc,
								blobId: item.id
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5" }), "View / Edit"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs text-subtle",
							children: bytes(item.size)
						})]
					})]
				}, `${item.path}:${item.addedAt}`))]
			}),
			footer,
			viewer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
				fallback: null,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrintModelViewer, {
					target: viewer,
					onClose: () => setViewer(null)
				})
			})
		]
	});
}
function ShopSection() {
	const [query, setQuery] = (0, import_react.useState)("");
	const [packages, setPackages] = (0, import_react.useState)([]);
	const [packageTitle, setPackageTitle] = (0, import_react.useState)("");
	const [carrier, setCarrier] = (0, import_react.useState)("USPS");
	const [tracking, setTracking] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		try {
			setPackages(JSON.parse(localStorage.getItem("reelcase.package-tracking.v1") ?? "[]"));
		} catch {
			setPackages([]);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.package-tracking.v1", JSON.stringify(packages));
		} catch {}
	}, [packages]);
	const encoded = encodeURIComponent(query.trim());
	const stores = (0, import_react.useMemo)(() => [
		{
			name: "Amazon",
			href: `https://www.amazon.com/s?k=${encoded}`,
			detail: "Search Amazon"
		},
		{
			name: "Walmart",
			href: `https://www.walmart.com/search?q=${encoded}`,
			detail: "Search Walmart"
		},
		{
			name: "eBay",
			href: `https://www.ebay.com/sch/i.html?_nkw=${encoded}`,
			detail: "Search eBay"
		},
		{
			name: "Etsy",
			href: `https://www.etsy.com/search?q=${encoded}`,
			detail: "Search handmade & niche shops"
		},
		{
			name: "Diipoo",
			href: `https://diipoo.com/?s=${encoded}`,
			detail: "Search Diipoo deals"
		}
	], [encoded]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Shopping shortcuts",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "size-4" }),
		title: "Find gear for your setup",
		copy: "Search major retailers from one clean starting point. Listings, prices, checkout, and account activity stay on the retailer’s site.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex flex-col gap-2 sm:flex-row",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: "Search film gear, printer parts, controllers…",
						className: "pl-9"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2",
				children: stores.map((store) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: store.href,
					target: "_blank",
					rel: "noreferrer",
					className: "group rounded-lg bg-elevated p-5 shadow-border transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-border-hover",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl text-fg",
							children: store.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: query.trim() ? `${store.detail} for “${query.trim()}”` : store.detail
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent",
							children: ["Open search ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" })]
						})
					]
				}, store.name))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-7 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 font-display text-2xl text-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageSearch, { className: "size-5 text-accent" }), "Package tracking"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "A private local list for orders you are expecting. Tracking opens the carrier lookup in a new page; no retailer account is connected."
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-2 sm:grid-cols-[1.2fr_.8fr_1fr_auto]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: packageTitle,
								onChange: (event) => setPackageTitle(event.target.value),
								placeholder: "Package or order name",
								"aria-label": "Package name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: carrier,
								onChange: (event) => setCarrier(event.target.value),
								placeholder: "Carrier",
								"aria-label": "Carrier"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: tracking,
								onChange: (event) => setTracking(event.target.value),
								placeholder: "Tracking number (optional)",
								"aria-label": "Tracking number"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => {
									if (!packageTitle.trim()) return;
									setPackages((items) => [{
										id: createLocalId("package-"),
										title: packageTitle.trim(),
										carrier: carrier.trim() || "Carrier",
										tracking: tracking.trim(),
										status: "Ordered"
									}, ...items]);
									setPackageTitle("");
									setTracking("");
								},
								children: "Add package"
							})
						]
					}),
					packages.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-2",
						children: packages.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2 rounded-md bg-bg/45 px-3 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-36 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-fg",
										children: item.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted",
										children: [item.carrier, item.tracking ? ` · ${item.tracking}` : ""]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: item.status,
									onChange: (event) => setPackages((items) => items.map((entry) => entry.id === item.id ? {
										...entry,
										status: event.target.value
									} : entry)),
									className: "h-9 rounded-sm bg-elevated px-2 text-xs text-fg shadow-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Ordered" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Shipped" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Out for delivery" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Delivered" })
									]
								}),
								item.tracking && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: `https://www.17track.net/en/track?nums=${encodeURIComponent(item.tracking)}`,
									target: "_blank",
									rel: "noreferrer",
									className: "rounded-sm bg-accent px-3 py-2 text-xs font-medium text-accent-fg",
									children: "Track"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => setPackages((items) => items.filter((entry) => entry.id !== item.id)),
									children: "Remove"
								})
							]
						}, item.id))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted",
						children: "No packages yet. Add an order to keep its delivery status beside your shopping shortcuts."
					})
				]
			})
		]
	});
}
function StreamingSection() {
	const [ratingQuery, setRatingQuery] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Movie streaming",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, { className: "size-4" }),
		title: "Streaming destinations",
		copy: "Keep watch sources separate from shopping. These official services and public collections open in their own sites.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
					children: "External rating search"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Look up a title on the source you trust. Searches open on the official site; Realhub does not copy ratings into your local catalog."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-col gap-2 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: ratingQuery,
						onChange: (event) => setRatingQuery(event.target.value),
						placeholder: "Search an anime, movie, or series",
						"aria-label": "External rating search"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							{
								label: "AniList",
								url: "https://anilist.co/search/anime?search="
							},
							{
								label: "AniDB",
								url: "https://anidb.net/anime/?adb.search="
							},
							{
								label: "Rotten Tomatoes",
								url: "https://www.rottentomatoes.com/search?search="
							}
						].map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: `${source.url}${encodeURIComponent(ratingQuery.trim())}`,
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-3 text-sm text-fg shadow-border",
							children: [source.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-2 size-3.5" })]
						}, source.label))
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
			children: [
				{
					name: "Netflix",
					href: "https://www.netflix.com/",
					copy: "Movies & series"
				},
				{
					name: "Hulu",
					href: "https://www.hulu.com/",
					copy: "TV & films"
				},
				{
					name: "Crunchyroll",
					href: "https://www.crunchyroll.com/",
					copy: "Anime streaming"
				},
				{
					name: "Kick",
					href: "https://kick.com/",
					copy: "Live streaming"
				},
				{
					name: "Vimeo",
					href: "https://vimeo.com/",
					copy: "Creator video"
				},
				{
					name: "Nebula",
					href: "https://nebula.tv/",
					copy: "Independent creators"
				},
				{
					name: "Plex",
					href: "https://www.plex.tv/",
					copy: "Personal media & streaming"
				},
				{
					name: "Internet Archive",
					href: "https://archive.org/details/feature_films",
					copy: "Open & public-domain films"
				},
				{
					name: "Old Time Movies",
					href: "https://archive.org/details/moviesandfilms",
					copy: "Classic and public-domain cinema"
				},
				{
					name: "Library of Congress",
					href: "https://www.loc.gov/film-and-videos/",
					copy: "Historic films and moving images"
				},
				{
					name: "Open Culture",
					href: "https://www.openculture.com/freemoviesonline",
					copy: "Free film collections and courses"
				},
				{
					name: "AniList",
					href: "https://anilist.co/",
					copy: "Anime discovery & ratings"
				},
				{
					name: "AniDB",
					href: "https://anidb.net/",
					copy: "Anime database"
				},
				{
					name: "Rotten Tomatoes",
					href: "https://www.rottentomatoes.com/",
					copy: "Critic & audience ratings"
				}
			].map((service) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceLink, { ...service }, service.name))
		})]
	});
}
function SocialSection() {
	const [accounts, setAccounts] = (0, import_react.useState)([]);
	const [handle, setHandle] = (0, import_react.useState)("");
	const [active, setActive] = (0, import_react.useState)("");
	const [search, setSearch] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [lastRead, setLastRead] = (0, import_react.useState)({});
	const [topic, setTopic] = (0, import_react.useState)(null);
	const defaultTopics = (0, import_react.useMemo)(() => [
		{
			label: "Movies & TV",
			query: "movies OR tv"
		},
		{
			label: "Anime",
			query: "anime"
		},
		{
			label: "Gaming",
			query: "gaming"
		},
		{
			label: "Live creators",
			query: "twitch streamer"
		}
	], []);
	(0, import_react.useEffect)(() => {
		try {
			const raw = JSON.parse(localStorage.getItem("reelcase.x-accounts") ?? "[]");
			let saved = Array.isArray(raw) ? raw.filter((value) => typeof value === "string" && /^[A-Za-z0-9_]{1,15}$/.test(value)) : [];
			const seededFlag = localStorage.getItem("reelcase.x-adult-seeded") === "1";
			if (!saved.length && !seededFlag) {
				saved = [...new Set(X_ADULT_SEED_HANDLES)].slice(0, 50);
				localStorage.setItem("reelcase.x-accounts", JSON.stringify(saved));
				localStorage.setItem("reelcase.x-adult-seeded", "1");
			} else if (!seededFlag) localStorage.setItem("reelcase.x-adult-seeded", "1");
			setAccounts(saved);
			const last = localStorage.getItem("reelcase.x-active") ?? "";
			setActive(saved.includes(last) ? last : saved[0] ?? "");
			if (!saved.length) setTopic(defaultTopics[0]);
			const reads = JSON.parse(localStorage.getItem("reelcase.x-last-read") ?? "{}");
			if (reads && typeof reads === "object") setLastRead(reads);
		} catch {}
	}, []);
	const choose = (account) => {
		const at = Date.now();
		setTopic(null);
		setActive(account);
		setLastRead((current) => {
			const next = {
				...current,
				[account]: at
			};
			try {
				localStorage.setItem("reelcase.x-last-read", JSON.stringify(next));
			} catch {}
			return next;
		});
		try {
			localStorage.setItem("reelcase.x-active", account);
		} catch {}
	};
	const save = (next) => {
		setAccounts(next);
		try {
			localStorage.setItem("reelcase.x-accounts", JSON.stringify(next));
		} catch {
			setError("Storage is full. Account changes will last for this session only.");
		}
	};
	const add = () => {
		const value = handle.trim().replace(/^https?:\/\/(?:www\.)?(?:x|twitter)\.com\//i, "").replace(/^@/, "").replace(/[/?#].*$/, "").toLowerCase();
		if (!/^[a-z0-9_]{1,15}$/.test(value)) {
			setError("Enter a valid X handle or profile URL (up to 15 letters, numbers or underscores).");
			return;
		}
		if (accounts.length >= 50 && !accounts.includes(value)) {
			setError("Your shelf holds 50 accounts. Remove one before adding another.");
			return;
		}
		setError("");
		save([.../* @__PURE__ */ new Set([...accounts, value])]);
		choose(value);
		setHandle("");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Social desk",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }),
		title: "Keep your people close.",
		copy: "Save X profiles, switch between public timelines, and pick up where you left off. Public timelines render inside Realhub through X’s official widget; private posts and account likes stay on X.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-6 flex flex-col gap-2 sm:flex-row",
				onSubmit: (event) => {
					event.preventDefault();
					add();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: handle,
					onChange: (event) => setHandle(event.target.value),
					placeholder: "@handle or X profile URL",
					"aria-label": "X account handle"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: !handle.trim(),
					children: "Add account"
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-2 text-sm text-danger",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "mt-4",
				value: search,
				onChange: (event) => setSearch(event.target.value),
				placeholder: "Find a saved account",
				"aria-label": "Search saved X accounts"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg bg-elevated p-4 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Public topic views"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Explore these X searches separately from your saved people. X supplies the public timeline; open the topic if it is unavailable."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: defaultTopics.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: topic?.label === item.label ? "default" : "secondary",
							onClick: () => {
								setTopic(item);
								setActive("");
							},
							children: item.label
						}, item.label))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
				children: accounts.filter((account) => account.toLowerCase().includes(search.toLowerCase())).map((account) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-lg border p-2 " + (active === account ? "border-accent bg-elevated" : "border-border bg-surface"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": active === account,
						onClick: () => choose(account),
						className: "min-w-0 flex-1 p-3 text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block truncate text-lg font-semibold",
							children: ["@", account]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted",
							children: lastRead[account] ? `Read ${new Date(lastRead[account]).toLocaleDateString()}` : "Public profile"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "Remove @" + account,
						onClick: () => {
							const next = accounts.filter((value) => value !== account);
							save(next);
							if (active === account) choose(next[0] ?? "");
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}, account))
			}),
			!accounts.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 rounded-lg border border-border p-5 text-sm text-muted",
				children: "Showing the default public topic view below. Add a profile to create a personal reading shelf; if X blocks embedded posts, the Open topic/profile button is the reliable fallback."
			}),
			(active || topic) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XTimeline, {
				account: active || void 0,
				topic: topic ?? void 0
			}, topic ? `topic:${topic.label}` : active)
		]
	});
}
function WatchRoomSection() {
	const [roomCode, setRoomCode] = (0, import_react.useState)(() => `RC${Math.random().toString(36).slice(2, 7).toUpperCase()}`);
	const [roomInput, setRoomInput] = (0, import_react.useState)("");
	const [recentLocalRoom, setRecentLocalRoom] = (0, import_react.useState)(() => localStorage.getItem("reelcase.watch-room.last-host") ?? "");
	const [name, setName] = (0, import_react.useState)(() => localStorage.getItem("reelcase.profile-name") || (new URLSearchParams(window.location.search).get("theater") === "1" ? "Guest" : "Host"));
	const [activeRoom, setActiveRoom] = (0, import_react.useState)(null);
	const [joinedAsGuest, setJoinedAsGuest] = (0, import_react.useState)(false);
	const [guestAccess, setGuestAccess] = (0, import_react.useState)(false);
	const [localVideo, setLocalVideo] = (0, import_react.useState)(null);
	const [localShare, setLocalShare] = (0, import_react.useState)(null);
	const [pickedLocalVideo, setPickedLocalVideo] = (0, import_react.useState)(null);
	const localFiles = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const [pendingLocalShare, setPendingLocalShare] = (0, import_react.useState)(null);
	const [sharedRoomVideos, setSharedRoomVideos] = (0, import_react.useState)({});
	const sharedRoomVideosRef = (0, import_react.useRef)(sharedRoomVideos);
	sharedRoomVideosRef.current = sharedRoomVideos;
	const [sharedLocalMedia, setSharedLocalMedia] = (0, import_react.useState)(null);
	const [mediaHostId, setMediaHostId] = (0, import_react.useState)("");
	const [localQueue, setLocalQueue] = (0, import_react.useState)([]);
	const [localShareMatches, setLocalShareMatches] = (0, import_react.useState)({});
	const [rokuAddress, setRokuAddress] = (0, import_react.useState)("");
	const [rokuReady, setRokuReady] = (0, import_react.useState)(false);
	const [rokuDevices, setRokuDevices] = (0, import_react.useState)([]);
	const [rokuNotice, setRokuNotice] = (0, import_react.useState)("");
	const [queue, setQueue] = (0, import_react.useState)([]);
	const queueRef = (0, import_react.useRef)([]);
	const [queueNotice, setQueueNotice] = (0, import_react.useState)("");
	const [autoAdvance, setAutoAdvance] = (0, import_react.useState)(() => localStorage.getItem("reelcase.watch-room.auto-advance") !== "false");
	const lastEndedTitle = (0, import_react.useRef)("");
	const [roomHealth, setRoomHealth] = (0, import_react.useState)({
		lastPublishedAt: 0,
		lastHostStateAt: 0,
		lastQueueAt: 0,
		lastDriftSeconds: 0,
		queueRevision: 0,
		queueRequests: 0,
		queueAccepted: 0,
		staleDropped: 0,
		resyncRequests: 0
	});
	const [roomLedger, setRoomLedger] = (0, import_react.useState)([]);
	const [ledgerRoom, setLedgerRoom] = (0, import_react.useState)("");
	const [stageSize, setStageSize] = (0, import_react.useState)("theater");
	const [playback, setPlayback] = (0, import_react.useState)({
		playing: false,
		position: 0
	});
	const [guestOffset, setGuestOffset] = (0, import_react.useState)(() => {
		try {
			return normalizeGuestOffset(Number(localStorage.getItem("reelcase.watch-room.guest-offset.v1") ?? 0));
		} catch {
			return 0;
		}
	});
	const guestPlayerOffset = (0, import_react.useRef)(0);
	const [timelineEvidence, setTimelineEvidence] = (0, import_react.useState)({
		source: "local",
		at: Date.now()
	});
	const [chat, setChat] = (0, import_react.useState)([]);
	const [message, setMessage] = (0, import_react.useState)("");
	const [deferredRoomSearch, setDeferredRoomSearch] = (0, import_react.useState)("");
	const [roomCandidates, setRoomCandidates] = (0, import_react.useState)([]);
	const [roomCandidatesPending, setRoomCandidatesPending] = (0, import_react.useState)(false);
	const [roomSearchResults, setRoomSearchResults] = (0, import_react.useState)([]);
	const [roomSearchPending, setRoomSearchPending] = (0, import_react.useState)(false);
	const [roomLocalToolsOpen, setRoomLocalToolsOpen] = (0, import_react.useState)(false);
	const [roomRatingRevision, setRoomRatingRevision] = (0, import_react.useState)(0);
	const [partyPrompt, setPartyPrompt] = (0, import_react.useState)("Pick the next vibe");
	const [partyVotes, setPartyVotes] = (0, import_react.useState)({
		Comedy: 0,
		Action: 0,
		Surprise: 0
	});
	const [friendName, setFriendName] = (0, import_react.useState)("");
	const [friendCode, setFriendCode] = (0, import_react.useState)("");
	const [inviteNotice, setInviteNotice] = (0, import_react.useState)("");
	const [pulseStatus, setPulseStatus] = (0, import_react.useState)("No chat transport test yet.");
	const [friends, setFriends] = (0, import_react.useState)(() => {
		try {
			const saved = JSON.parse(localStorage.getItem("reelcase.lan-friends.v1") ?? "[]");
			return Array.isArray(saved) ? saved.slice(0, 16) : [];
		} catch {
			return [];
		}
	});
	const videos = useLibrary((s) => s.videos);
	const favorites = useLibrary((s) => s.favorites);
	const hiddenVideos = useLibrary((s) => s.hiddenVideos);
	const toggleFavorite = useLibrary((s) => s.toggleFavorite);
	const history = useLibrary((s) => s.history);
	const recordPlay = useLibrary((s) => s.recordPlay);
	const unavailable = useLibrary((s) => s.unavailable);
	(0, import_react.useEffect)(() => {
		localStorage.setItem("reelcase.profile-name", name.trim() || "Host");
	}, [name]);
	const [sharedVideoId, setSharedVideoIdState] = (0, import_react.useState)(() => {
		if (new URLSearchParams(window.location.search).get("theater") === "1") return "";
		const pending = localStorage.getItem("reelcase.watch-room.pending-video");
		return (pending ? videos.find((video) => video.id === pending && canStageRoomVideo(video)) : void 0)?.id ?? videos.find(canStageRoomVideo)?.id ?? "";
	});
	const currentVideoIdRef = (0, import_react.useRef)(sharedVideoId);
	const setSharedVideoId = (id) => {
		currentVideoIdRef.current = id;
		setSharedVideoIdState(id);
	};
	const adoptRoomMedia = (0, import_react.useCallback)((values, ids) => {
		const next = mergeRoomMedia(sharedRoomVideosRef.current, values, ids);
		sharedRoomVideosRef.current = next;
		setSharedRoomVideos(next);
	}, []);
	const sharedVideo = (0, import_react.useMemo)(() => {
		const video = joinedAsGuest ? sharedRoomVideos[sharedVideoId] ?? lookupVideo(videos, sharedVideoId) : lookupVideo(videos, sharedVideoId) ?? sharedRoomVideos[sharedVideoId];
		return video ? normalizeRoomVideo(video) : void 0;
	}, [
		videos,
		sharedRoomVideos,
		sharedVideoId,
		joinedAsGuest
	]);
	const roomVideoForId = (id) => joinedAsGuest ? sharedRoomVideosRef.current[id] ?? lookupVideo(videos, id) : lookupVideo(videos, id) ?? sharedRoomVideosRef.current[id];
	const pickedLocalShare = pickedLocalVideo ? {
		name: pickedLocalVideo.name,
		fingerprint: localRoomFingerprint(pickedLocalVideo),
		size: pickedLocalVideo.size,
		modified: pickedLocalVideo.lastModified
	} : null;
	(0, import_react.useEffect)(() => {
		const retained = /* @__PURE__ */ new Set([sharedVideoId, ...queue]);
		for (const id of localFiles.current.keys()) if (!retained.has(id)) localFiles.current.delete(id);
	}, [sharedVideoId, queue]);
	const roomRating = (0, import_react.useMemo)(() => sharedVideoId ? getRating(sharedVideoId) : 0, [roomRatingRevision, sharedVideoId]);
	const twitchClip = sharedVideo?.remote?.kind === "twitch" && (sharedVideo.extension === "clip" || sharedVideo.remote.embedUrl?.includes("clips.twitch.tv"));
	const [measuredDuration, setMeasuredDuration] = (0, import_react.useState)(null);
	const roomDuration = (videoId = sharedVideoId) => {
		if (videoId === sharedVideoId) {
			const mediaDuration = roomVideoRef.current?.duration;
			const twitchDuration = sharedVideo?.remote?.kind === "twitch" && !sharedVideo.remote.live ? twitchPlayerRef.current?.getDuration?.() : void 0;
			for (const duration of [
				mediaDuration,
				twitchDuration,
				measuredDuration?.videoId === videoId ? measuredDuration.seconds : void 0
			]) if (typeof duration === "number" && Number.isFinite(duration) && duration > 0) return duration;
		}
		const video = videoId === sharedVideoId ? sharedVideo : videos.find((item) => item.id === videoId);
		return video?.remote?.live ? void 0 : video?.duration;
	};
	const clampRoomClock = (seconds, videoId = sharedVideoId) => clampRoomPosition(seconds, roomDuration(videoId));
	const currentHostClock = () => {
		const media = roomVideoRef.current;
		if (media && !sharedVideo?.remote) {
			const actual = media.currentTime;
			return clampRoomClock(actual > .25 || playback.position <= .25 ? actual : playback.position);
		}
		const estimated = estimatedProviderPosition(lastRoomPosition.current, playback.position, playback.playing && (sharedVideo?.remote?.kind !== "twitch" || twitchPlayingRef.current) ? youtubePlaybackStartedAt.current : null, Date.now());
		const twitch = sharedVideo?.remote?.kind === "twitch" ? twitchPlayerRef.current?.getCurrentTime() : void 0;
		return clampRoomClock(typeof twitch === "number" && Number.isFinite(twitch) && twitch > .25 ? Math.max(twitch, estimated) : estimated);
	};
	const localShareIsMatched = !sharedVideoId.startsWith("local:") || localShare?.fingerprint === sharedVideoId.slice(6);
	const roomVideoRef = (0, import_react.useRef)(null);
	const remoteFrameRef = (0, import_react.useRef)(null);
	const twitchPlayerHostRef = (0, import_react.useRef)(null);
	const twitchPlayerRef = (0, import_react.useRef)(null);
	const twitchPlayingRef = (0, import_react.useRef)(false);
	const [twitchActuallyPlaying, setTwitchActuallyPlaying] = (0, import_react.useState)(false);
	const [remoteFrameReady, setRemoteFrameReady] = (0, import_react.useState)(null);
	const [remoteSeekNonce, setRemoteSeekNonce] = (0, import_react.useState)(0);
	const lastYoutubeSeekNonce = (0, import_react.useRef)(0);
	const lastTwitchSeekNonce = (0, import_react.useRef)(0);
	const lastTwitchPlaybackCommand = (0, import_react.useRef)(null);
	const suppressRemotePlayerEchoUntil = (0, import_react.useRef)(0);
	const [twitchPlayerStatus, setTwitchPlayerStatus] = (0, import_react.useState)("Waiting for Twitch player…");
	const [twitchPlayerReady, setTwitchPlayerReady] = (0, import_react.useState)(0);
	const [candidateSeed, setCandidateSeed] = (0, import_react.useState)(() => Date.now());
	const [roomPickLimit, setRoomPickLimit] = (0, import_react.useState)(18);
	const youtubePlaybackStartedAt = (0, import_react.useRef)(null);
	const [localVideoSource, setLocalVideoSource] = (0, import_react.useState)(null);
	const localVideoUrl = localVideoSource?.file === localVideo ? localVideoSource.url : "";
	const [resolvedRoomSource, setResolvedRoomSource] = (0, import_react.useState)(null);
	const lastRoomTick = (0, import_react.useRef)(0);
	const lastRoomHistoryId = (0, import_react.useRef)("");
	const lastRoomPosition = (0, import_react.useRef)(0);
	const applyingRemotePlaybackUntil = (0, import_react.useRef)(0);
	const queueRevisionRef = (0, import_react.useRef)(0);
	const lastAcceptedQueueRevision = (0, import_react.useRef)(0);
	const lastAcceptedTimelineAt = (0, import_react.useRef)(0);
	const lastAcceptedRoomStateAt = (0, import_react.useRef)(0);
	const room = activeRoom ?? "";
	const [relayConfig, setRelayConfig] = (0, import_react.useState)();
	const p2p = useP2PRoom(room, name.trim() || "Guest", relayConfig);
	const { request: requestQueueChange, replay: replayQueueReceipt, confirm: confirmQueueChange, accept: acceptQueueReceipt, pending: pendingQueueChanges } = useRoomQueueDelivery(room, joinedAsGuest, mediaHostId, p2p.send, setQueueNotice);
	const matchingLocalSource = localShare && sharedVideoId === `local:${localShare.fingerprint}` ? localVideoUrl : "";
	const libraryLocalSource = !joinedAsGuest ? resolvedRoomSource?.id === sharedVideoId ? resolvedRoomSource.url : !sharedVideo?.remote ? sharedVideo?.src ?? "" : "" : "";
	const hostLocalSource = !joinedAsGuest ? matchingLocalSource || libraryLocalSource : "";
	(0, import_react.useEffect)(() => {
		if (joinedAsGuest || !sharedVideo || sharedVideo.remote || !room || sharedVideo.id.startsWith("local:")) return;
		let cancelled = false;
		const release = pinPlayUrl(sharedVideo.id);
		resolvePlayUrl(sharedVideo).then((url) => {
			if (!cancelled) setResolvedRoomSource({
				id: sharedVideo.id,
				url
			});
		}).catch((error) => {
			if (!cancelled) setInviteNotice(error instanceof Error ? error.message : "The host could not open this local file.");
		});
		return () => {
			cancelled = true;
			release();
		};
	}, [
		joinedAsGuest,
		sharedVideo,
		room
	]);
	const localStream = useRoomLocalStream(roomVideoRef, hostLocalSource, Boolean(room) && !joinedAsGuest, p2p.setMediaStream);
	const roomMedia = (0, import_react.useMemo)(() => {
		const descriptor = describeRoomMedia(sharedVideo, sharedVideoId === `local:${localShare?.fingerprint}` ? localShare : null);
		const seconds = measuredDuration?.videoId === sharedVideoId ? measuredDuration.seconds : descriptor?.duration;
		return descriptor?.kind === "local" ? {
			...descriptor,
			duration: typeof seconds === "number" && Number.isFinite(seconds) && seconds > 0 ? Math.min(seconds, 43200) : void 0,
			streamId: localStream.streamId || void 0
		} : descriptor;
	}, [
		sharedVideo,
		sharedVideoId,
		localShare,
		localStream.streamId,
		measuredDuration
	]);
	const roomQueueMedia = (0, import_react.useMemo)(() => queue.map((id) => {
		const file = localFiles.current.get(id);
		const share = file ? {
			name: file.name,
			fingerprint: localRoomFingerprint(file),
			size: file.size,
			modified: file.lastModified
		} : void 0;
		return describeRoomMedia(lookupVideo(videos, id) ?? sharedRoomVideos[id], share);
	}).filter(Boolean), [
		videos,
		queue,
		sharedRoomVideos
	]);
	const incomingStream = p2p.mediaStreams[mediaHostId];
	const guestLocalStream = joinedAsGuest && !matchingLocalSource && sharedLocalMedia?.id === sharedVideoId && sharedLocalMedia.streamId === incomingStream?.id ? incomingStream : void 0;
	const timingAdjustsPlayback = Boolean(sharedVideo?.remote ? !sharedVideo.remote.live && !twitchClip && ["youtube", "twitch"].includes(sharedVideo.remote.kind) : matchingLocalSource && localShareIsMatched && !guestLocalStream);
	guestPlayerOffset.current = joinedAsGuest && timingAdjustsPlayback ? guestOffset : 0;
	const devicePlaybackPosition = guestPlaybackPosition(playback.position, guestPlayerOffset.current, roomDuration());
	const adjustedTimerPosition = guestPlaybackPosition(playback.position, joinedAsGuest ? guestOffset : 0, roomDuration());
	const changeGuestOffset = (seconds) => {
		const value = normalizeGuestOffset(seconds);
		applyingRemotePlaybackUntil.current = Date.now() + 1200;
		suppressRemotePlayerEchoUntil.current = Date.now() + 1200;
		setGuestOffset(value);
		try {
			localStorage.setItem("reelcase.watch-room.guest-offset.v1", String(value));
		} catch {}
	};
	const acceptRoomMedia = (0, import_react.useCallback)((from, value, id) => {
		const resolved = resolveRoomMedia(value);
		if (!resolved || resolved.descriptor.id !== id) return;
		setMediaHostId(from);
		setSharedLocalMedia(resolved.descriptor.kind === "local" ? resolved.descriptor : null);
		if (resolved.video) adoptRoomMedia([value], [resolved.descriptor.id, ...queueRef.current]);
		if (resolved.descriptor.local) setPendingLocalShare(resolved.descriptor.local);
	}, [adoptRoomMedia]);
	const invitation = useRoomInvitation(activeRoom ?? roomCode);
	const roomInvite = invitation.url;
	(0, import_react.useEffect)(() => {
		setSharedRoomVideos({});
		setSharedLocalMedia(null);
		setMediaHostId("");
		queueRevisionRef.current = 0;
		queueRef.current = queue;
		if (joinedAsGuest) {
			queueRef.current = [];
			setQueue([]);
			setSharedVideoId("");
		}
		setQueueNotice("");
		lastAcceptedQueueRevision.current = 0;
		lastAcceptedTimelineAt.current = 0;
		lastAcceptedRoomStateAt.current = 0;
		setRoomHealth({
			lastPublishedAt: 0,
			lastHostStateAt: 0,
			lastQueueAt: 0,
			lastDriftSeconds: 0,
			queueRevision: 0,
			queueRequests: 0,
			queueAccepted: 0,
			staleDropped: 0,
			resyncRequests: 0
		});
		if (!room) {
			setRoomLedger([]);
			setLedgerRoom("");
			return;
		}
		try {
			const stored = JSON.parse(localStorage.getItem(`reelcase.watch-room.ledger.v1:${room}`) ?? "[]");
			setRoomLedger(Array.isArray(stored) ? stored.filter((item) => Boolean(item && typeof item.at === "number" && typeof item.kind === "string" && typeof item.detail === "string")).slice(-32) : []);
		} catch {
			setRoomLedger([]);
		}
		setLedgerRoom(room);
	}, [room]);
	(0, import_react.useEffect)(() => {
		if (!room || ledgerRoom !== room) return;
		try {
			localStorage.setItem(`reelcase.watch-room.ledger.v1:${room}`, JSON.stringify(roomLedger.slice(-32)));
		} catch {}
	}, [
		ledgerRoom,
		room,
		roomLedger
	]);
	const noteRoom = (0, import_react.useCallback)((kind, detail) => {
		if (!room) return;
		setRoomLedger((events) => [...events, {
			at: Date.now(),
			kind,
			detail
		}].slice(-32));
	}, [room]);
	(0, import_react.useEffect)(() => {
		if (!room || ledgerRoom !== room) return;
		noteRoom("session", `Opened as ${joinedAsGuest ? "guest" : "host"}; room commands require a fresh host state.`);
	}, [
		joinedAsGuest,
		ledgerRoom,
		noteRoom,
		room
	]);
	(0, import_react.useEffect)(() => {
		if (!localVideo) {
			setLocalVideoSource(null);
			return;
		}
		const url = URL.createObjectURL(localVideo);
		setLocalVideoSource({
			file: localVideo,
			url
		});
		return () => URL.revokeObjectURL(url);
	}, [localVideo]);
	(0, import_react.useEffect)(() => {
		localStorage.removeItem("reelcase.watch-room.pending-video");
	}, []);
	(0, import_react.useEffect)(() => {
		if (!activeRoom) {
			setRoomCandidates([]);
			setRoomCandidatesPending(false);
			setRoomSearchResults([]);
			return;
		}
		const controller = new AbortController();
		setRoomCandidates([]);
		setRoomCandidatesPending(true);
		const turn = catalogTurn(controller.signal);
		prepareRoomCandidates({
			videos,
			shared: sharedRoomVideos,
			guest: joinedAsGuest,
			favorites,
			hidden: hiddenVideos,
			unavailable,
			history,
			seed: candidateSeed,
			canStage: canStageRoomVideo,
			rank: roomShuffleRank
		}, turn).then((rows) => {
			if (controller.signal.aborted) return;
			setRoomCandidates(rows);
			setRoomCandidatesPending(false);
		}).catch(() => {
			if (!controller.signal.aborted) {
				setRoomCandidates([]);
				setRoomCandidatesPending(false);
				setInviteNotice("Room recommendations could not be prepared. Try reopening the room.");
			}
		});
		return () => controller.abort();
	}, [
		activeRoom,
		candidateSeed,
		favorites,
		hiddenVideos,
		history,
		videos,
		joinedAsGuest,
		sharedRoomVideos,
		unavailable
	]);
	(0, import_react.useEffect)(() => {
		if (!activeRoom || roomCandidatesPending) {
			setRoomSearchPending(false);
			return;
		}
		const controller = new AbortController();
		setRoomSearchPending(true);
		searchRoomCandidates(roomCandidates, deferredRoomSearch, deferredRoomSearch.trim() ? 20 : 12, catalogTurn(controller.signal)).then((rows) => {
			if (!controller.signal.aborted) {
				setRoomSearchResults(rows);
				setRoomSearchPending(false);
			}
		}).catch(() => {
			if (!controller.signal.aborted) setRoomSearchPending(false);
		});
		return () => controller.abort();
	}, [
		activeRoom,
		deferredRoomSearch,
		roomCandidates,
		roomCandidatesPending
	]);
	(0, import_react.useEffect)(() => {
		const refresh = () => setRoomRatingRevision((value) => value + 1);
		window.addEventListener("reelcase:rating-change", refresh);
		return () => window.removeEventListener("reelcase:rating-change", refresh);
	}, []);
	const localQueueCandidates = (0, import_react.useMemo)(() => {
		if (!roomLocalToolsOpen) return [];
		const result = [];
		for (const video of roomCandidates) {
			if (video.remote || video.id === sharedVideoId || queue.includes(video.id)) continue;
			result.push(video);
			if (result.length === 18) break;
		}
		return result;
	}, [
		queue,
		roomCandidates,
		roomLocalToolsOpen,
		sharedVideoId
	]);
	const youtubeRoomCandidates = (0, import_react.useMemo)(() => roomCandidates.filter((video) => video.remote?.kind === "youtube"), [roomCandidates]);
	const queueRecommendations = (0, import_react.useMemo)(() => {
		const alreadyShown = new Set(roomCandidates.slice(0, roomPickLimit).map((video) => video.id));
		const queued = new Set(queue);
		const unseen = [];
		for (const video of roomCandidates) {
			if (video.id === sharedVideoId || queued.has(video.id) || alreadyShown.has(video.id)) continue;
			unseen.push(video);
			if (unseen.length === 12) break;
		}
		return (unseen.length ? unseen : roomCandidates.filter((video) => video.id !== sharedVideoId && !queued.has(video.id))).slice(0, 12);
	}, [
		candidateSeed,
		queue,
		roomCandidates,
		roomPickLimit,
		sharedVideoId
	]);
	(0, import_react.useEffect)(() => {
		if (!activeRoom || playback.playing) return;
		return registerPeriodicTask({
			name: "Room discoveries",
			everyMs: 3e4,
			work: () => setCandidateSeed(Date.now())
		}).cancel;
	}, [activeRoom, playback.playing]);
	(0, import_react.useEffect)(() => {
		const params = new URLSearchParams(window.location.search);
		const invitedRoom = (params.get("room") ?? "").trim().toUpperCase();
		if (!/^RC[A-Z0-9]{4,12}$/.test(invitedRoom)) return;
		setRoomInput(invitedRoom);
		if (params.get("theater") === "1") {
			setJoinedAsGuest(true);
			setStageSize("cinema");
			setActiveRoom(invitedRoom);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (joinedAsGuest || !p2p.peers.length) return;
		const sentAt = Date.now();
		queueRevisionRef.current = Math.max(queueRevisionRef.current, lastAcceptedQueueRevision.current);
		p2p.send({
			type: "room-state",
			playing: playback.playing,
			position: playback.position,
			videoId: sharedVideoId,
			media: roomMedia,
			queue,
			queueMedia: roomQueueMedia,
			localQueue,
			queueRevision: queueRevisionRef.current,
			sentAt
		});
		setRoomHealth((health) => ({
			...health,
			lastPublishedAt: sentAt,
			queueRevision: queueRevisionRef.current
		}));
	}, [
		joinedAsGuest,
		localQueue,
		p2p.readyRevision,
		p2p.peers.length,
		playback.playing,
		playback.position,
		queue,
		roomMedia,
		roomQueueMedia,
		sharedVideoId
	]);
	(0, import_react.useEffect)(() => {
		if (!joinedAsGuest || !p2p.joined || lastAcceptedRoomStateAt.current) return;
		let attempts = 0;
		const request = () => {
			if (lastAcceptedRoomStateAt.current || ++attempts > 8) {
				task.cancel();
				return;
			}
			p2p.send({
				type: "resync-request",
				sentAt: Date.now()
			});
			setRoomHealth((health) => ({
				...health,
				resyncRequests: health.resyncRequests + 1
			}));
			if (attempts === 1) noteRoom("request", "Requested the host’s initial state.");
		};
		const task = registerPeriodicTask({
			name: "Room initial sync",
			mode: "always",
			background: false,
			firstMs: 0,
			everyMs: 1500,
			work: request
		});
		return task.cancel;
	}, [
		joinedAsGuest,
		noteRoom,
		p2p.joined,
		p2p.readyRevision,
		p2p.send,
		room
	]);
	(0, import_react.useEffect)(() => p2p.onMessage((from, raw, channel) => {
		const data = raw;
		if (data.type === "chat" && data.text) setChat((rows) => [...rows, `${data.name ?? from}: ${data.text}`].slice(-50));
		if (data.type === "room-pulse") p2p.send({
			type: "room-pulse-ack",
			sentAt: data.sentAt
		}, from);
		if (data.type === "room-pulse-ack" && data.sentAt) setPulseStatus(`Chat transport confirmed · ${Math.max(0, Date.now() - data.sentAt)}ms round trip.`);
		if (data.type === "share-ready" && data.name && data.fingerprint) {
			const share = {
				name: data.name,
				fingerprint: data.fingerprint,
				size: Number(data.size) || 0,
				modified: Number(data.modified) || 0
			};
			setPendingLocalShare(share);
			setInviteNotice(`${data.name} is shared by the host. Playback streams to this device; choosing a matching local copy is optional.`);
		}
		if (data.type === "share-matched" && data.name && data.fingerprint) {
			setLocalShareMatches((matches) => ({
				...matches,
				[from]: {
					name: data.name,
					fingerprint: data.fingerprint,
					at: Date.now()
				}
			}));
			setInviteNotice(`${data.name} was matched by a guest. The approved local copy can now follow the room timeline.`);
		}
		if (data.type === "sync-request" && !joinedAsGuest) {
			if (!trustedRoomSentAt(data.sentAt)) {
				setRoomHealth((health) => ({
					...health,
					staleDropped: health.staleDropped + 1
				}));
				noteRoom("dropped", "Ignored a guest playback request with an invalid clock.");
			} else {
				noteRoom("request", data.seek ? "Accepted a guest timeline seek request." : "Accepted a guest playback request.");
				if (data.videoId && data.videoId !== sharedVideoId) noteRoom("dropped", "Ignored a playback request for a different video.");
				else {
					const requested = typeof data.position === "number" && Number.isFinite(data.position) ? data.position : playback.position;
					sync({
						playing: Boolean(data.playing),
						position: clampRoomClock(requested)
					}, Boolean(data.seek), true);
				}
			}
		}
		if (data.type === "sync") {
			if (!joinedAsGuest) return;
			const sentAt = trustedRoomSentAt(data.sentAt);
			if (!sentAt || sentAt + 500 < lastAcceptedTimelineAt.current) {
				setRoomHealth((health) => ({
					...health,
					staleDropped: health.staleDropped + 1
				}));
				noteRoom("dropped", "Ignored an expired or out-of-order playback command.");
				return;
			}
			if (data.videoId && currentVideoIdRef.current && data.videoId !== currentVideoIdRef.current) return;
			const nextPosition = (Number(data.position) || 0) + (data.playing ? Math.max(0, (Date.now() - sentAt) / 1e3) : 0);
			const safePosition = clampRoomClock(!data.seek && nextPosition < lastRoomPosition.current ? lastRoomPosition.current : nextPosition, data.videoId);
			const drift = Math.abs(safePosition - playback.position);
			lastAcceptedTimelineAt.current = sentAt;
			lastRoomPosition.current = safePosition;
			youtubePlaybackStartedAt.current = data.playing ? Date.now() - safePosition * 1e3 : null;
			applyingRemotePlaybackUntil.current = Date.now() + 900;
			setTimelineEvidence({
				source: "remote",
				at: Date.now()
			});
			if (data.seek || drift > .75) setRemoteSeekNonce((value) => value + 1);
			setPlayback({
				playing: Boolean(data.playing),
				position: safePosition
			});
			setRoomHealth((health) => ({
				...health,
				lastDriftSeconds: drift,
				lastHostStateAt: Date.now()
			}));
			if (drift >= 1) noteRoom("timeline", `Reconciled ${drift.toFixed(1)}s of playback drift over ${channel}.`);
		}
		if (data.type === "video" && data.videoId && joinedAsGuest) {
			setSharedVideoId(data.videoId);
			acceptRoomMedia(from, data.media, data.videoId);
		}
		if (data.type === "video-request" && data.videoId && !joinedAsGuest) {
			const requested = resolveGuestRoomVideo(data.videoId, data.media);
			if (requested) {
				noteRoom("request", "Accepted a guest video request.");
				chooseVideo(requested, data.action === "play");
			} else p2p.send({
				type: "video-rejected",
				text: "The host cannot open that file. Ask the host to choose and queue it; public YouTube and Twitch links can be shared directly."
			}, from);
		}
		if (data.type === "video-rejected" && joinedAsGuest) setInviteNotice(data.text?.slice(0, 300) || "The host could not play that title.");
		if (data.type === "next-request" && !joinedAsGuest && data.videoId === currentVideoIdRef.current) playNext();
		if (data.type === "queue-shuffle" && !joinedAsGuest && typeof data.requestId === "string" && data.requestId.length <= 160) {
			if (replayQueueReceipt(from, data.requestId)) return;
			shuffleQueue();
			confirmQueueChange(from, data.requestId, "Queue shuffle confirmed by the host.");
		}
		if (data.type === "queue-action" && !joinedAsGuest) {
			let operation = parseRoomQueueAction(data.operation);
			if (!operation || typeof data.requestId !== "string" || data.requestId.length > 160) return;
			if (replayQueueReceipt(from, data.requestId)) return;
			const addsTitle = operation.kind === "add" || operation.kind === "next";
			const requested = addsTitle ? resolveGuestRoomVideo(operation.id, data.media) : void 0;
			if (addsTitle && !requested) {
				confirmQueueChange(from, data.requestId, "This title is unavailable on the host. YouTube and Twitch links can be shared; local files must be opened by the host.");
				return;
			}
			if (requested) operation = {
				...operation,
				id: requested.id
			};
			if (operation.id === currentVideoIdRef.current || operation.kind === "add" && queueRef.current.includes(operation.id)) {
				confirmQueueChange(from, data.requestId, "That video is already playing or queued.");
				return;
			}
			if (addsTitle && !queueRef.current.includes(operation.id) && queueRef.current.length >= 48) {
				confirmQueueChange(from, data.requestId, "The queue is full. Remove a title before adding another.");
				return;
			}
			publishQueue(applyRoomQueueAction(queueRef.current, operation));
			confirmQueueChange(from, data.requestId, "Queue change confirmed by the host.");
			noteRoom("queue", `Applied a guest ${operation.kind} action to the latest queue.`);
		}
		if (data.type === "queue-batch" && !joinedAsGuest && Array.isArray(data.queueMedia) && typeof data.requestId === "string" && data.requestId.length <= 160) {
			if (replayQueueReceipt(from, data.requestId)) return;
			const result = queueLinkBatch(data.queueMedia);
			const skipped = result.invalid + Math.min(48, Math.max(0, Number(data.skipped) || 0));
			const duplicates = result.duplicates + Math.min(48, Math.max(0, Number(data.duplicates) || 0));
			confirmQueueChange(from, data.requestId, batchQueueNotice({
				...result,
				invalid: skipped,
				duplicates
			}, Boolean(data.truncated)));
		}
		if (data.type === "queue-result" && joinedAsGuest && typeof data.requestId === "string") acceptQueueReceipt(from, data.requestId, data.text || "");
		if (data.type === "queue-batch-result" && joinedAsGuest) setQueueNotice(data.text?.slice(0, 300) || "The host checked your queue links.");
		if (data.type === "queue-rejected" && joinedAsGuest) setQueueNotice(data.text?.slice(0, 300) || "The host could not apply this queue change.");
		if (data.type === "queue-request" && Array.isArray(data.queue) && !joinedAsGuest) {
			if (data.queueRevision !== queueRevisionRef.current) {
				p2p.send({
					type: "queue",
					queue: queueRef.current,
					queueMedia: roomQueueMedia,
					queueRevision: queueRevisionRef.current,
					sentAt: Date.now()
				}, from);
				return;
			}
			const requested = normalizeRoomQueue(data.queue).filter((id) => id !== sharedVideoId && Boolean(lookupVideo(videos, id) && canStageRoomVideo(lookupVideo(videos, id))));
			const revision = Math.max(queueRevisionRef.current, lastAcceptedQueueRevision.current) + 1;
			queueRevisionRef.current = revision;
			lastAcceptedQueueRevision.current = revision;
			queueRef.current = requested;
			setQueue(requested);
			p2p.send({
				type: "queue",
				queue: requested,
				queueMedia: requested.map((id) => describeRoomMedia(videos.find((video) => video.id === id))),
				queueRevision: revision,
				sentAt: Date.now()
			});
			setRoomHealth((health) => ({
				...health,
				queueAccepted: health.queueAccepted + 1,
				queueRevision: revision,
				lastQueueAt: Date.now()
			}));
			noteRoom("queue", `Accepted a guest queue proposal as revision ${revision}.`);
		}
		if (data.type === "queue" && Array.isArray(data.queue) && joinedAsGuest) {
			const revision = Number.isInteger(data.queueRevision) && Number(data.queueRevision) >= 0 ? Number(data.queueRevision) : 0;
			if (revision < lastAcceptedQueueRevision.current) {
				setRoomHealth((health) => ({
					...health,
					staleDropped: health.staleDropped + 1
				}));
				noteRoom("dropped", `Ignored stale queue revision ${revision}.`);
			} else {
				const accepted = normalizeRoomQueue(data.queue);
				if (revision) lastAcceptedQueueRevision.current = revision;
				queueRef.current = accepted;
				setQueue(accepted);
				if (Array.isArray(data.queueMedia)) adoptRoomMedia(data.queueMedia, [currentVideoIdRef.current, ...accepted]);
				setRoomHealth((health) => ({
					...health,
					queueRevision: revision || health.queueRevision,
					lastQueueAt: Date.now()
				}));
			}
		}
		if (data.type === "local-queue-request" && Array.isArray(data.localQueue) && !joinedAsGuest) {
			const requested = normalizeLocalRoomQueue(data.localQueue);
			setLocalQueue(requested);
			p2p.send({
				type: "local-queue",
				localQueue: requested,
				sentAt: Date.now()
			});
			noteRoom("queue", "Accepted a guest local-handoff queue proposal.");
		}
		if (data.type === "local-queue" && Array.isArray(data.localQueue) && joinedAsGuest) setLocalQueue(normalizeLocalRoomQueue(data.localQueue));
		if (data.type === "local-stage-request" && data.fingerprint && !joinedAsGuest) {
			const requested = localQueue.find((share) => share.fingerprint === data.fingerprint);
			if (requested) {
				noteRoom("request", "Accepted a guest request to stage a local handoff.");
				stageLocalShare(requested);
			}
		}
		if (data.type === "party-vote" && data.name) setPartyVotes((votes) => ({
			...votes,
			[data.name]: Number(data.position) || 0
		}));
		if (data.type === "room-state") {
			if (!joinedAsGuest) return;
			const sentAt = trustedRoomSentAt(data.sentAt);
			if (!sentAt || sentAt + 500 < lastAcceptedRoomStateAt.current) {
				setRoomHealth((health) => ({
					...health,
					staleDropped: health.staleDropped + 1
				}));
				noteRoom("dropped", "Ignored an expired or out-of-order host state.");
				return;
			}
			const videoChanged = Boolean(data.videoId && data.videoId !== currentVideoIdRef.current);
			if (data.videoId) setSharedVideoId(data.videoId);
			acceptRoomMedia(from, data.media, data.videoId);
			if (Array.isArray(data.queue)) {
				const revision = Number.isInteger(data.queueRevision) && Number(data.queueRevision) >= 0 ? Number(data.queueRevision) : 0;
				if (revision >= lastAcceptedQueueRevision.current) {
					if (revision) lastAcceptedQueueRevision.current = revision;
					queueRef.current = normalizeRoomQueue(data.queue);
					setQueue(queueRef.current);
					if (Array.isArray(data.queueMedia)) adoptRoomMedia(data.queueMedia, [currentVideoIdRef.current, ...queueRef.current]);
					setRoomHealth((health) => ({
						...health,
						queueRevision: revision || health.queueRevision,
						lastQueueAt: Date.now()
					}));
				} else {
					setRoomHealth((health) => ({
						...health,
						staleDropped: health.staleDropped + 1
					}));
					noteRoom("dropped", `Ignored stale queue revision ${revision} in a room state.`);
				}
			}
			if (Array.isArray(data.localQueue)) setLocalQueue(normalizeLocalRoomQueue(data.localQueue));
			const nextPosition = (Number(data.position) || 0) + (data.playing ? Math.max(0, (Date.now() - sentAt) / 1e3) : 0);
			const safePosition = clampRoomClock(!videoChanged && nextPosition + .75 < lastRoomPosition.current ? lastRoomPosition.current : nextPosition, data.videoId);
			const drift = Math.abs(safePosition - playback.position);
			lastAcceptedRoomStateAt.current = sentAt;
			lastAcceptedTimelineAt.current = Math.max(lastAcceptedTimelineAt.current, sentAt);
			lastRoomPosition.current = safePosition;
			youtubePlaybackStartedAt.current = data.playing ? Date.now() - safePosition * 1e3 : null;
			applyingRemotePlaybackUntil.current = Date.now() + 900;
			setTimelineEvidence({
				source: "remote",
				at: Date.now()
			});
			if (videoChanged || drift > .75) setRemoteSeekNonce((value) => value + 1);
			setPlayback({
				playing: Boolean(data.playing),
				position: safePosition
			});
			setRoomHealth((health) => ({
				...health,
				lastHostStateAt: Date.now(),
				lastDriftSeconds: drift
			}));
			if (drift >= 1) noteRoom("timeline", `Reconciled ${drift.toFixed(1)}s from the authoritative room state.`);
		}
		if (data.type === "resync-request" && !joinedAsGuest) {
			const position = currentHostClock();
			const sentAt = Date.now();
			p2p.send({
				type: "room-state",
				playing: playback.playing,
				position,
				videoId: sharedVideoId,
				media: roomMedia,
				queue,
				queueMedia: roomQueueMedia,
				localQueue,
				queueRevision: queueRevisionRef.current,
				sentAt
			}, from);
			setRoomHealth((health) => ({
				...health,
				lastPublishedAt: sentAt
			}));
			noteRoom("state", "Sent a targeted state reconciliation to a guest.");
		}
	}), [
		joinedAsGuest,
		localQueue,
		noteRoom,
		p2p.onMessage,
		p2p.send,
		playback.playing,
		playback.position,
		queue,
		sharedVideoId,
		videos,
		sharedRoomVideos,
		measuredDuration,
		acceptRoomMedia,
		roomMedia,
		roomQueueMedia,
		replayQueueReceipt,
		confirmQueueChange,
		acceptQueueReceipt
	]);
	const sync = (next, seek = false, explicit = false) => {
		if (!seek && !explicit && Date.now() < applyingRemotePlaybackUntil.current) return;
		if (joinedAsGuest) {
			p2p.send({
				type: "sync-request",
				...next,
				videoId: sharedVideoId,
				seek,
				sentAt: Date.now()
			});
			setInviteNotice("Playback change sent to the host. Your theater will reconcile when it is confirmed.");
			noteRoom("request", seek ? "Requested a host timeline seek." : "Requested a host playback update.");
			return;
		}
		const isYoutube = sharedVideo?.remote?.kind === "youtube";
		const isTwitch = sharedVideo?.remote?.kind === "twitch";
		const playerPosition = isTwitch ? twitchPlayerRef.current?.getCurrentTime() : void 0;
		const hasTwitchPosition = typeof playerPosition === "number" && Number.isFinite(playerPosition) && playerPosition > .25;
		const providerFallback = lastRoomPosition.current > .25 && next.position <= .25 && !seek;
		const providerClock = estimatedProviderPosition(lastRoomPosition.current, playback.position, playback.playing ? youtubePlaybackStartedAt.current : null, Date.now());
		const position = !seek && !sharedVideo?.remote && roomVideoRef.current ? roomVideoRef.current.currentTime : seek ? next.position : (isYoutube || isTwitch) && !next.playing ? Math.max(providerClock, next.position) : isTwitch ? hasTwitchPosition ? Math.max(playerPosition, providerClock, next.position) : providerFallback ? providerClock : Math.max(providerClock, next.position) : providerFallback ? providerClock : isYoutube ? Math.max(providerClock, next.position) : next.position;
		const resolved = {
			...next,
			position: clampRoomClock(position)
		};
		lastRoomPosition.current = resolved.position;
		youtubePlaybackStartedAt.current = resolved.playing ? Date.now() - resolved.position * 1e3 : null;
		setTimelineEvidence({
			source: sharedVideo?.remote ? "estimated" : "local",
			at: Date.now()
		});
		setPlayback(resolved);
		if (resolved.playing && sharedVideoId && !sharedVideoId.startsWith("local:") && lastRoomHistoryId.current !== sharedVideoId) {
			lastRoomHistoryId.current = sharedVideoId;
			recordPlay(sharedVideoId, "watch-room");
		}
		if (seek) setRemoteSeekNonce((value) => value + 1);
		const sentAt = Date.now();
		p2p.send({
			type: "sync",
			...resolved,
			videoId: sharedVideoId,
			seek,
			sentAt
		});
		setRoomHealth((health) => ({
			...health,
			lastPublishedAt: sentAt
		}));
	};
	const syncDevicePlayback = (next, seek = false) => {
		if (joinedAsGuest && Date.now() < applyingRemotePlaybackUntil.current) return;
		sync({
			...next,
			position: hostPlaybackPosition(next.position, guestPlayerOffset.current, roomDuration())
		}, seek);
	};
	(0, import_react.useEffect)(() => {
		if (!joinedAsGuest) return;
		applyingRemotePlaybackUntil.current = Date.now() + 1200;
		suppressRemotePlayerEchoUntil.current = Date.now() + 1200;
		setRemoteSeekNonce((value) => value + 1);
	}, [guestOffset, joinedAsGuest]);
	(0, import_react.useEffect)(() => {
		const provider = sharedVideo?.remote?.kind;
		if (!provider || !playback.playing || !youtubePlaybackStartedAt.current) return;
		return registerPeriodicTask({
			name: "Room playback clock",
			mode: "always",
			background: false,
			everyMs: 1e3,
			work: () => {
				const twitchTime = provider === "twitch" ? twitchPlayerRef.current?.getCurrentTime() : void 0;
				const actual = typeof twitchTime === "number" && twitchTime > .25 ? hostPlaybackPosition(twitchTime, guestPlayerOffset.current, roomDuration()) : void 0;
				const estimated = clampRoomClock(actual ?? estimatedProviderPosition(lastRoomPosition.current, playback.position, youtubePlaybackStartedAt.current, Date.now()));
				if (provider === "twitch" && !twitchPlayingRef.current) return;
				if (estimated <= lastRoomPosition.current + .2) return;
				lastRoomPosition.current = estimated;
				setPlayback((current) => current.playing ? {
					...current,
					position: estimated
				} : current);
				setTimelineEvidence({
					source: actual === void 0 ? "estimated" : "local",
					at: Date.now()
				});
				if (!joinedAsGuest) p2p.send({
					type: "sync",
					playing: true,
					position: estimated,
					videoId: sharedVideoId,
					seek: false,
					sentAt: Date.now()
				});
			}
		}).cancel;
	}, [
		joinedAsGuest,
		p2p.send,
		playback.playing,
		sharedVideo?.id,
		sharedVideo?.remote?.kind
	]);
	const resync = () => {
		if (joinedAsGuest) {
			p2p.send({
				type: "resync-request",
				sentAt: Date.now()
			});
			setRoomHealth((health) => ({
				...health,
				resyncRequests: health.resyncRequests + 1
			}));
			noteRoom("request", "Requested an explicit host state reconciliation.");
			setInviteNotice("Requested the host’s current room state.");
			return;
		}
		const position = currentHostClock();
		const playing = roomVideoRef.current ? !roomVideoRef.current.paused : playback.playing;
		lastRoomPosition.current = position;
		youtubePlaybackStartedAt.current = playing ? Date.now() - position * 1e3 : null;
		setPlayback({
			playing,
			position
		});
		const sentAt = Date.now();
		p2p.send({
			type: "room-state",
			playing,
			position,
			videoId: sharedVideoId,
			media: roomMedia,
			queue,
			queueMedia: roomQueueMedia,
			localQueue,
			queueRevision: queueRevisionRef.current,
			sentAt
		});
		setRoomHealth((health) => ({
			...health,
			lastPublishedAt: sentAt
		}));
		noteRoom("state", "Published an explicit room reconciliation.");
		setInviteNotice("Sent the current video and timeline to every guest.");
	};
	(0, import_react.useEffect)(() => {
		const media = roomVideoRef.current;
		if (!media || sharedVideo?.remote) return;
		let cancelled = false;
		const driftLimit = playback.playing ? .65 : .1;
		if (Math.abs(media.currentTime - devicePlaybackPosition) > driftLimit) {
			if (joinedAsGuest) applyingRemotePlaybackUntil.current = Date.now() + 900;
			media.currentTime = devicePlaybackPosition;
		}
		if (playback.playing && media.paused) media.play().catch((error) => {
			if (cancelled || roomVideoRef.current !== media) return;
			if (error instanceof DOMException && error.name === "NotAllowedError") {
				setInviteNotice("This browser needs a Play press to start the local video.");
				if (!joinedAsGuest) sync({
					playing: false,
					position: media.currentTime
				});
			}
		});
		if (!playback.playing && !media.paused) media.pause();
		return () => {
			cancelled = true;
		};
	}, [
		playback,
		sharedVideo,
		libraryLocalSource,
		matchingLocalSource,
		joinedAsGuest,
		devicePlaybackPosition
	]);
	(0, import_react.useEffect)(() => {
		if (sharedVideo?.remote?.kind !== "youtube" || remoteFrameReady?.id !== sharedVideo.id) return;
		const frame = remoteFrameRef.current?.contentWindow;
		if (!frame) return;
		const target = new URL(watchRoomEmbed(sharedVideo)).origin;
		if (remoteSeekNonce !== lastYoutubeSeekNonce.current) {
			lastYoutubeSeekNonce.current = remoteSeekNonce;
			if (remoteSeekNonce && !sharedVideo.remote.live) {
				suppressRemotePlayerEchoUntil.current = Date.now() + 1e3;
				frame.postMessage(JSON.stringify({
					event: "command",
					func: "seekTo",
					args: [devicePlaybackPosition, true]
				}), target);
			}
		}
		frame.postMessage(JSON.stringify({
			event: "command",
			func: playback.playing ? "playVideo" : "pauseVideo",
			args: []
		}), target);
	}, [
		playback.playing,
		remoteFrameReady,
		remoteSeekNonce,
		sharedVideo?.id,
		guestOffset
	]);
	(0, import_react.useEffect)(() => {
		if (sharedVideo?.remote?.kind !== "twitch" || twitchClip) {
			twitchPlayerRef.current = null;
			return;
		}
		const host = twitchPlayerHostRef.current;
		if (!host) return;
		let cancelled = false;
		const hostId = `reelcase-twitch-${p2p.selfId}`;
		host.id = hostId;
		host.replaceChildren();
		twitchPlayingRef.current = false;
		setTwitchActuallyPlaying(false);
		setTwitchPlayerReady(0);
		lastTwitchSeekNonce.current = -1;
		setTwitchPlayerStatus("Loading Twitch interactive player…");
		loadTwitchEmbed().then((api) => {
			if (cancelled) return;
			const live = Boolean(sharedVideo.remote?.live);
			const rawVideo = sharedVideo.remote?.videoId ?? "";
			const video = rawVideo ? rawVideo.startsWith("v") ? rawVideo : `v${rawVideo}` : void 0;
			const player = new api.Player(hostId, {
				width: "100%",
				height: "100%",
				parent: [window.location.hostname],
				autoplay: false,
				muted: false,
				...live ? { channel: sharedVideo.remote?.watchUrl?.split("/").pop() } : { video }
			});
			twitchPlayerRef.current = player;
			lastTwitchPlaybackCommand.current = null;
			const events = player.constructor;
			player.addEventListener(events.READY ?? "ready", () => {
				if (!cancelled) {
					const duration = player.getDuration?.();
					if (!live && typeof duration === "number" && Number.isFinite(duration) && duration > 0) setMeasuredDuration({
						videoId: sharedVideo.id,
						seconds: duration
					});
					setTwitchPlayerStatus("Twitch player ready. Use room controls to start.");
					setTwitchPlayerReady(Date.now());
				}
			});
			player.addEventListener(events.PLAY ?? "play", () => {
				const position = player.getCurrentTime();
				if (!cancelled && Date.now() > suppressRemotePlayerEchoUntil.current) syncDevicePlayback({
					playing: true,
					position: position > .25 ? position : guestPlaybackPosition(playback.position, guestPlayerOffset.current)
				});
			});
			player.addEventListener(events.PAUSE ?? "pause", () => {
				twitchPlayingRef.current = false;
				setTwitchActuallyPlaying(false);
				const position = player.getCurrentTime();
				if (!cancelled && Date.now() > suppressRemotePlayerEchoUntil.current) syncDevicePlayback({
					playing: false,
					position: position > .25 ? position : guestPlaybackPosition(playback.position, guestPlayerOffset.current)
				});
			});
			player.addEventListener(events.SEEK ?? "seek", () => {
				if (!cancelled && !live && Date.now() > suppressRemotePlayerEchoUntil.current) syncDevicePlayback({
					playing: true,
					position: player.getCurrentTime()
				}, true);
			});
			player.addEventListener(events.PLAYING ?? "playing", () => {
				if (!cancelled) {
					twitchPlayingRef.current = true;
					setTwitchActuallyPlaying(true);
					setTwitchPlayerStatus("Twitch playback started.");
				}
			});
			player.addEventListener(events.PLAYBACK_BLOCKED ?? "playback-blocked", () => {
				if (!cancelled) {
					twitchPlayingRef.current = false;
					setTwitchActuallyPlaying(false);
					setTwitchPlayerStatus("Twitch blocked playback. Press Play in its player.");
				}
			});
			player.addEventListener(events.ENDED ?? "ended", () => {
				if (!cancelled) finishLatestRoomTitle.current();
			});
		}).catch(() => {
			if (!cancelled) setTwitchPlayerStatus("Twitch interactive player could not load. Open Twitch directly below.");
		});
		return () => {
			cancelled = true;
			twitchPlayerRef.current = null;
			lastTwitchPlaybackCommand.current = null;
			host.replaceChildren();
		};
	}, [
		p2p.selfId,
		room,
		sharedVideo?.id
	]);
	(0, import_react.useEffect)(() => {
		if (sharedVideo?.remote?.kind !== "twitch" || twitchClip) return;
		const player = twitchPlayerRef.current;
		if (!player || !twitchPlayerReady) return;
		if (remoteSeekNonce !== lastTwitchSeekNonce.current) {
			lastTwitchSeekNonce.current = remoteSeekNonce;
			if (remoteSeekNonce && !sharedVideo.remote.live) {
				suppressRemotePlayerEchoUntil.current = Date.now() + 1e3;
				player.seek(devicePlaybackPosition);
			}
		}
		if (lastTwitchPlaybackCommand.current !== playback.playing) {
			lastTwitchPlaybackCommand.current = playback.playing;
			suppressRemotePlayerEchoUntil.current = Date.now() + 750;
			if (playback.playing) player.play();
			else player.pause();
		}
	}, [
		playback.playing,
		playback.position,
		remoteSeekNonce,
		sharedVideo?.id,
		twitchPlayerReady,
		guestOffset
	]);
	const toggleRoomPlayback = () => {
		const playing = !playback.playing;
		const player = twitchPlayerRef.current;
		if (sharedVideo?.remote?.kind === "twitch" && !twitchClip && (!player || !twitchPlayerReady)) {
			setInviteNotice("Twitch is still preparing its player. Wait for “Twitch player ready,” then press Play.");
			return;
		}
		if (sharedVideo?.remote?.kind === "twitch" && !twitchClip && player) {
			lastTwitchPlaybackCommand.current = playing;
			suppressRemotePlayerEchoUntil.current = Date.now() + 750;
			if (playing) {
				player.setMuted?.(false);
				player.play();
				setTwitchPlayerStatus("Starting Twitch from the room control…");
				window.setTimeout(() => {
					if (!twitchPlayingRef.current) setTwitchPlayerStatus("Twitch is waiting for a Play press inside its player.");
				}, 1800);
			} else player.pause();
		}
		sync({
			...playback,
			playing
		}, false, true);
	};
	const chooseVideo = (video, startPlayback = false) => {
		if (joinedAsGuest) {
			p2p.send({
				type: "video-request",
				videoId: video.id,
				media: describeRoomMedia(video),
				action: startPlayback ? "play" : "stage",
				sentAt: Date.now()
			});
			setInviteNotice(`Requested ${video.name} from the host. The room changes only after host confirmation.`);
			noteRoom("request", "Requested a host video change.");
			return;
		}
		const file = localFiles.current.get(video.id);
		if (!video.remote && video.id.startsWith("local:") && !file) {
			setInviteNotice(`Choose ${video.name} on the host before playing it.`);
			return;
		}
		const share = file ? {
			name: file.name,
			fingerprint: localRoomFingerprint(file),
			size: file.size,
			modified: file.lastModified
		} : null;
		setLocalVideo(file ?? null);
		setLocalShare(share);
		setLocalShareMatches({});
		setSharedVideoId(video.id);
		const selectedKey = roomMediaKey(video);
		const remaining = queueRef.current.filter((id) => {
			const queued = roomVideoForId(id);
			return queued && roomMediaKey(queued) !== selectedKey;
		});
		if (remaining.length !== queueRef.current.length) publishQueue(remaining, video.id);
		setPlayback({
			playing: startPlayback,
			position: 0
		});
		youtubePlaybackStartedAt.current = startPlayback ? Date.now() : null;
		lastRoomPosition.current = 0;
		lastRoomHistoryId.current = "";
		recordPlay(video.id, "watch-room");
		p2p.send({
			type: "video",
			videoId: video.id,
			media: describeRoomMedia(video, share),
			sentAt: Date.now()
		});
		p2p.send({
			type: "sync",
			playing: startPlayback,
			position: 0,
			videoId: video.id,
			seek: true,
			sentAt: Date.now()
		});
		noteRoom("state", "Host selected a new room video.");
	};
	const resolveGuestRoomVideo = (id, media) => {
		const requested = resolveRoomRequest(id, media, roomVideoForId, [currentVideoIdRef.current, ...queueRef.current]);
		if (!requested || !canStageRoomVideo(requested)) return void 0;
		if (!requested.remote && requested.id.startsWith("local:") && !localFiles.current.has(requested.id)) return void 0;
		if (requested.remote) adoptRoomMedia([describeRoomMedia(requested)], [
			currentVideoIdRef.current,
			...queueRef.current,
			requested.id
		]);
		return requested;
	};
	const publishQueue = (next, currentId = currentVideoIdRef.current) => {
		measureInteraction("queue");
		const current = roomVideoForId(currentId);
		const bounded = distinctRoomQueue(next, (id) => {
			const video = roomVideoForId(id);
			return video && canStageRoomVideo(video) ? roomMediaKey(video) : void 0;
		}, current ? roomMediaKey(current) : void 0);
		const revision = Math.max(queueRevisionRef.current, lastAcceptedQueueRevision.current) + 1;
		queueRevisionRef.current = revision;
		lastAcceptedQueueRevision.current = revision;
		queueRef.current = bounded;
		setQueue(bounded);
		p2p.send({
			type: "queue",
			queue: bounded,
			queueMedia: bounded.map((id) => {
				const file = localFiles.current.get(id);
				const share = file ? {
					name: file.name,
					fingerprint: localRoomFingerprint(file),
					size: file.size,
					modified: file.lastModified
				} : void 0;
				return describeRoomMedia(roomVideoForId(id), share);
			}),
			queueRevision: revision,
			sentAt: Date.now()
		});
		setRoomHealth((health) => ({
			...health,
			queueAccepted: health.queueAccepted + 1,
			queueRevision: revision,
			lastQueueAt: Date.now()
		}));
		noteRoom("queue", `Published queue revision ${revision} with ${bounded.length} title${bounded.length === 1 ? "" : "s"}.`);
	};
	const changeQueue = (operation, video) => {
		if (joinedAsGuest) {
			requestQueueChange({
				type: "queue-action",
				operation,
				media: describeRoomMedia(video ?? roomVideoForId(operation.id)),
				queueRevision: lastAcceptedQueueRevision.current
			}, "Queue change sent · waiting for host confirmation.");
			setRoomHealth((health) => ({
				...health,
				queueRequests: health.queueRequests + 1
			}));
			return;
		}
		if ((operation.kind === "add" || operation.kind === "next") && !queueRef.current.includes(operation.id) && queueRef.current.length >= 48) {
			setQueueNotice("The queue holds 48 titles. Remove one before adding another.");
			return;
		}
		publishQueue(applyRoomQueueAction(queueRef.current, operation));
	};
	const shuffleQueue = () => {
		if (joinedAsGuest) {
			requestQueueChange({ type: "queue-shuffle" }, "Shuffle requested · waiting for host confirmation.");
			return;
		}
		if (queueRef.current.length < 2) return;
		publishQueue(shuffleRoomQueue(queueRef.current));
		setQueueNotice("Queue shuffled. The current video keeps playing.");
	};
	const queueLinkBatch = (values) => {
		const next = [...queueRef.current], media = [];
		const staged = /* @__PURE__ */ new Map();
		const seen = new Set([currentVideoIdRef.current, ...next].flatMap((id) => {
			const video = roomVideoForId(id);
			return video ? [roomMediaKey(video)] : [];
		}));
		const result = {
			added: 0,
			duplicates: 0,
			invalid: 0,
			full: 0
		};
		for (const value of values.slice(0, 48)) {
			const resolved = resolveRoomMedia(value);
			if (!resolved?.video?.remote) {
				result.invalid++;
				continue;
			}
			const key = roomMediaKey(resolved.video);
			if (seen.has(key)) {
				result.duplicates++;
				continue;
			}
			if (next.length >= 48) {
				result.full++;
				continue;
			}
			const requested = resolveRoomRequest(resolved.video.id, value, (id) => staged.get(id) ?? roomVideoForId(id), [currentVideoIdRef.current, ...next]);
			if (!requested) {
				result.invalid++;
				continue;
			}
			staged.set(requested.id, requested);
			next.push(requested.id);
			seen.add(key);
			media.push(describeRoomMedia(requested));
			result.added++;
		}
		if (result.added) {
			adoptRoomMedia(media, [currentVideoIdRef.current, ...next]);
			publishQueue(next);
		}
		return result;
	};
	const batchQueueNotice = (result, truncated = false) => [
		`${result.added} queued`,
		result.duplicates ? `${result.duplicates} already playing/queued` : "",
		result.invalid ? `${result.invalid} invalid or unavailable` : "",
		result.full ? `${result.full} skipped · queue full` : "",
		truncated ? "Only the first 48 links were checked" : ""
	].filter(Boolean).join(" · ");
	const queuePublicLinks = (value) => {
		const parsed = parseRoomLinks(value);
		if (!parsed.videos.length) {
			setQueueNotice("Enter public YouTube or Twitch links, one per line.");
			return false;
		}
		if (joinedAsGuest) return requestQueueChange({
			type: "queue-batch",
			queueMedia: parsed.videos.map((video) => describeRoomMedia(video)),
			skipped: parsed.invalid,
			duplicates: parsed.duplicates,
			truncated: parsed.truncated
		}, `${parsed.videos.length} links sent · waiting for host confirmation.`);
		else {
			const result = queueLinkBatch(parsed.videos.map((video) => describeRoomMedia(video)));
			setQueueNotice(batchQueueNotice({
				...result,
				invalid: result.invalid + parsed.invalid,
				duplicates: result.duplicates + parsed.duplicates
			}, parsed.truncated));
		}
		return true;
	};
	const updateQueue = (next) => {
		if (!joinedAsGuest) {
			publishQueue(next);
			return;
		}
		for (const id of queueRef.current) if (!next.includes(id)) changeQueue({
			kind: "remove",
			id
		});
		for (let index = next.length - 1; index >= 0; index--) {
			const id = next[index];
			if (!queueRef.current.includes(id)) changeQueue({
				kind: "add",
				id,
				before: next[index + 1]
			});
			else if (next.indexOf(id) !== queueRef.current.indexOf(id) && next.length === queueRef.current.length) changeQueue({
				kind: "move",
				id,
				before: next[index + 1]
			});
		}
	};
	const updateLocalQueue = (next) => {
		const bounded = normalizeLocalRoomQueue(next);
		if (joinedAsGuest) {
			p2p.send({
				type: "local-queue-request",
				localQueue: bounded,
				sentAt: Date.now()
			});
			noteRoom("request", "Sent a local-handoff queue proposal to the host.");
			setInviteNotice("Local handoff proposal sent to the host. It appears once confirmed.");
			return;
		}
		setLocalQueue(bounded);
		p2p.send({
			type: "local-queue",
			localQueue: bounded,
			sentAt: Date.now()
		});
		noteRoom("queue", "Published the approved local-handoff queue.");
	};
	const stageLocalShare = (share) => {
		if (joinedAsGuest) {
			p2p.send({
				type: "local-stage-request",
				fingerprint: share.fingerprint,
				sentAt: Date.now()
			});
			noteRoom("request", "Requested that the host stage a local handoff.");
			setInviteNotice("Requested that the host stage this local handoff.");
			return;
		}
		if (!localShare || localShare.fingerprint !== share.fingerprint || !localVideo) {
			setPendingLocalShare(share);
			setInviteNotice(`Choose ${share.name} on the host before staging its playback stream.`);
			return;
		}
		if (!guestAccess) {
			setInviteNotice("Confirm guest viewing access in Local sharing before staging this file.");
			return;
		}
		setSharedVideoId(`local:${share.fingerprint}`);
		setPlayback({
			playing: false,
			position: 0
		});
		lastRoomPosition.current = 0;
		p2p.send({
			type: "share-ready",
			...share
		});
		p2p.send({
			type: "video",
			videoId: `local:${share.fingerprint}`,
			media: describeRoomMedia(void 0, share)
		});
		p2p.send({
			type: "sync",
			playing: false,
			position: 0,
			videoId: `local:${share.fingerprint}`,
			seek: true,
			sentAt: Date.now()
		});
		setInviteNotice(`${share.name} is staged. Press Play to stream it to every connected guest.`);
	};
	const selectLocalVideo = (file) => {
		if (!file) return;
		const share = {
			name: file.name,
			fingerprint: localRoomFingerprint(file),
			size: file.size,
			modified: file.lastModified
		};
		if (joinedAsGuest && !pendingLocalShare) {
			setInviteNotice("Wait for the host’s local-share request before matching a permitted file on this device.");
			return;
		}
		if (joinedAsGuest && pendingLocalShare && pendingLocalShare.fingerprint !== share.fingerprint) {
			setInviteNotice(`That file does not match ${pendingLocalShare.name}. Select the same permitted copy (name, size, and modified time must agree).`);
			return;
		}
		if (!joinedAsGuest) {
			setPickedLocalVideo(file);
			setInviteNotice("File selected. Queue it or share it when ready; the current video keeps playing.");
			return;
		}
		setLocalVideo(file);
		setLocalShare(share);
		if (joinedAsGuest && pendingLocalShare) {
			setSharedVideoId(`local:${share.fingerprint}`);
			setPendingLocalShare(null);
			p2p.send({
				type: "share-matched",
				name: share.name,
				fingerprint: share.fingerprint
			});
			setInviteNotice(`${share.name} matched locally. Waiting for the host to stage or play it.`);
			return;
		}
	};
	const preparePickedLocal = (keepCurrent = true) => {
		if (joinedAsGuest || !pickedLocalVideo || !pickedLocalShare || !guestAccess) return void 0;
		const media = describeRoomMedia(void 0, pickedLocalShare);
		const video = resolveRoomMedia(media)?.video;
		if (!media || !video) return void 0;
		localFiles.current.set(video.id, pickedLocalVideo);
		adoptRoomMedia([media], keepCurrent ? [
			currentVideoIdRef.current,
			...queueRef.current,
			video.id
		] : [video.id, ...queueRef.current]);
		return video;
	};
	const queuePickedLocal = () => {
		if (queueRef.current.length >= 48) {
			setQueueNotice("The queue is full. Remove a title first.");
			return;
		}
		const video = preparePickedLocal();
		if (!video) return;
		if (video.id === currentVideoIdRef.current || queueRef.current.includes(video.id)) {
			setQueueNotice("That file is already playing or queued.");
			return;
		}
		changeQueue({
			kind: "add",
			id: video.id
		}, video);
		setQueueNotice(`${video.name} queued. Guests receive the host stream when it plays.`);
	};
	const sharePickedLocal = () => {
		const video = preparePickedLocal(false);
		if (!video || !pickedLocalShare) return;
		chooseVideo(video);
		p2p.send({
			type: "share-ready",
			...pickedLocalShare
		});
		setInviteNotice("Local playback shared. Press Play to stream it to the room; guests do not need a local copy.");
	};
	const queueVideo = (video) => {
		if (video.id !== sharedVideoId && !queue.includes(video.id)) changeQueue({
			kind: "add",
			id: video.id
		}, video);
	};
	const queueImmediately = (video) => {
		if (video.id === sharedVideoId) return;
		changeQueue({
			kind: "next",
			id: video.id
		}, video);
		if (!joinedAsGuest) setInviteNotice(`${video.name} will play next for everyone in the room.`);
	};
	const playNext = () => {
		if (joinedAsGuest) {
			p2p.send({
				type: "next-request",
				videoId: currentVideoIdRef.current,
				sentAt: Date.now()
			});
			setQueueNotice("Requested the next queued title from the host.");
			return;
		}
		const nextId = queueRef.current[0];
		if (!nextId) return;
		const next = roomVideoForId(nextId);
		if (next) chooseVideo(next, true);
		else publishQueue(queueRef.current.slice(1));
	};
	const queuePanelActions = (0, import_react.useRef)({
		search: (_value) => {},
		autoAdvance: (_value) => {},
		select: (_video) => {},
		add: (_video) => {},
		change: (_action) => {},
		clear: () => {},
		next: () => {},
		shuffle: () => {},
		link: (_value) => false
	});
	queuePanelActions.current = {
		search: setDeferredRoomSearch,
		autoAdvance: setAutoAdvance,
		select: (video) => chooseVideo(video, true),
		add: queueVideo,
		change: changeQueue,
		clear: () => updateQueue([]),
		next: playNext,
		shuffle: shuffleQueue,
		link: queuePublicLinks
	};
	const onQueueSearch = (0, import_react.useCallback)((value) => queuePanelActions.current.search(value), []);
	const onQueueAutoAdvance = (0, import_react.useCallback)((value) => queuePanelActions.current.autoAdvance(value), []);
	const onQueueSelect = (0, import_react.useCallback)((video) => queuePanelActions.current.select(video), []);
	const onQueueAdd = (0, import_react.useCallback)((video) => queuePanelActions.current.add(video), []);
	const onQueueChange = (0, import_react.useCallback)((action) => queuePanelActions.current.change(action), []);
	const onQueueClear = (0, import_react.useCallback)(() => queuePanelActions.current.clear(), []);
	const onQueueNext = (0, import_react.useCallback)(() => queuePanelActions.current.next(), []);
	const onQueueShuffle = (0, import_react.useCallback)(() => queuePanelActions.current.shuffle(), []);
	const onQueueLink = (0, import_react.useCallback)((value) => queuePanelActions.current.link(value), []);
	const recommendationSelectRef = (0, import_react.useRef)(() => {});
	recommendationSelectRef.current = (video) => chooseVideo(video);
	const onRecommendationSelect = (0, import_react.useCallback)((video) => recommendationSelectRef.current(video), []);
	const onMixRecommendations = (0, import_react.useCallback)(() => {
		setCandidateSeed(Date.now());
		setRoomPickLimit(18);
	}, []);
	const onLoadRecommendations = (0, import_react.useCallback)(() => setRoomPickLimit((limit) => Math.min(roomCandidates.length, limit + 18)), [roomCandidates.length]);
	const queuePanelRows = (0, import_react.useMemo)(() => queue.map((id) => ({
		id,
		video: joinedAsGuest ? sharedRoomVideos[id] ?? lookupVideo(videos, id) : lookupVideo(videos, id) ?? sharedRoomVideos[id]
	})), [
		joinedAsGuest,
		queue,
		sharedRoomVideos,
		videos
	]);
	const playQueuedNow = (id) => {
		const video = roomVideoForId(id);
		if (!video) return;
		if (joinedAsGuest) {
			chooseVideo(video, true);
			return;
		}
		chooseVideo(video, true);
	};
	const finishRoomTitle = () => {
		if (joinedAsGuest || !autoAdvance || !queueRef.current.length || lastEndedTitle.current === sharedVideoId) return;
		lastEndedTitle.current = sharedVideoId;
		playNext();
	};
	const finishLatestRoomTitle = (0, import_react.useRef)(finishRoomTitle);
	finishLatestRoomTitle.current = finishRoomTitle;
	(0, import_react.useEffect)(() => {
		lastEndedTitle.current = "";
	}, [sharedVideoId]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.watch-room.auto-advance", String(autoAdvance));
		} catch {}
	}, [autoAdvance]);
	(0, import_react.useEffect)(() => {
		if (sharedVideo?.remote?.kind !== "youtube") return;
		const listener = (event) => {
			if (event.source !== remoteFrameRef.current?.contentWindow || event.origin !== new URL(watchRoomEmbed(sharedVideo)).origin) return;
			let data;
			try {
				data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
			} catch {
				return;
			}
			if (!data) return;
			if (data.event === "onStateChange" && data.info === 0 || data.event === "infoDelivery" && typeof data.info === "object" && data.info?.playerState === 0) finishRoomTitle();
		};
		window.addEventListener("message", listener);
		return () => window.removeEventListener("message", listener);
	}, [
		sharedVideo?.id,
		joinedAsGuest,
		autoAdvance,
		queue
	]);
	(0, import_react.useEffect)(() => {
		if (sharedVideo?.remote?.kind !== "youtube" || remoteFrameReady?.id !== sharedVideo.id) return;
		const target = new URL(watchRoomEmbed(sharedVideo)).origin;
		const frame = remoteFrameRef.current?.contentWindow;
		frame?.postMessage(JSON.stringify({
			event: "listening",
			id: "room-youtube"
		}), target);
		frame?.postMessage(JSON.stringify({
			event: "command",
			func: "addEventListener",
			args: ["onStateChange"]
		}), target);
	}, [sharedVideo?.id, remoteFrameReady]);
	const send = () => {
		const text = message.trim();
		if (!text) return;
		setChat((rows) => [...rows, `You: ${text}`].slice(-50));
		p2p.send({
			type: "chat",
			text,
			name: name.trim() || "Guest"
		});
		setMessage("");
	};
	if (!activeRoom) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HubShell, {
		eyebrow: "LAN watch room",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }),
		title: "Watch together, on your terms.",
		copy: "Create a private room code or join one on the same network. Peers exchange names, chat, and playback commands over a direct or configured relay path.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Create a room"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-mono text-3xl tracking-[0.16em] text-fg",
						children: roomCode
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Share this code only with people you want in your watch room."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomInvitation, {
						invitation,
						started: false,
						onNotice: setInviteNotice
					}),
					!roomInvite && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs leading-5 text-muted",
						children: ["This localhost address opens only on this computer. Use the home-network address in the Connection guide before sharing with another device. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-accent underline",
							onClick: () => useLibrary.getState().setSource("connection"),
							children: "Open Connection guide"
						})]
					}),
					inviteNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 break-all text-xs text-accent",
						children: inviteNotice
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-5 w-full",
						onClick: () => {
							setJoinedAsGuest(false);
							localStorage.setItem("reelcase.watch-room.last-host", roomCode);
							setRecentLocalRoom(roomCode);
							setActiveRoom(roomCode);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-4" }), " Start room"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs leading-5 text-subtle",
						children: [
							"Testing on one computer? Start the room first, then use ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-fg",
								children: "Open local guest window"
							}),
							" inside the room. A second browser window is a separate peer; a single tab cannot chat with itself."
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Join a theater"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Guests enter a focused theater view first; controls and chat stay available beside the screen."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-3",
						value: roomInput,
						onChange: (event) => setRoomInput(event.target.value.toUpperCase()),
						placeholder: "Enter room code",
						"aria-label": "Watch room code"
					}),
					recentLocalRoom && recentLocalRoom !== roomInput && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						className: "mt-2",
						onClick: () => {
							setRoomInput(recentLocalRoom);
							setInviteNotice(`Using this browser’s active host room: ${recentLocalRoom}.`);
						},
						children: ["Join local host · ", recentLocalRoom]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-2",
						value: name,
						onChange: (event) => setName(event.target.value),
						placeholder: "Your display name",
						"aria-label": "Your display name"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "mt-3 w-full",
						disabled: !roomInput.trim(),
						onClick: () => {
							setJoinedAsGuest(true);
							setStageSize("cinema");
							setActiveRoom(roomInput.trim());
						},
						children: "Join theater"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 border-t border-border pt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Local friends"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs leading-5 text-muted",
								children: "Save a trusted friend name and their current room code for one-tap joining on this network."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 grid gap-2 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: friendName,
									onChange: (event) => setFriendName(event.target.value),
									placeholder: "Friend name",
									"aria-label": "Friend name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: friendCode,
									onChange: (event) => setFriendCode(event.target.value.toUpperCase()),
									placeholder: "Room code",
									"aria-label": "Friend room code"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								className: "mt-2",
								disabled: !friendName.trim() || !friendCode.trim(),
								onClick: () => {
									const next = [{
										name: friendName.trim(),
										code: friendCode.trim()
									}, ...friends.filter((friend) => friend.code !== friendCode.trim())].slice(0, 16);
									setFriends(next);
									localStorage.setItem("reelcase.lan-friends.v1", JSON.stringify(next));
									setFriendName("");
									setFriendCode("");
								},
								children: "Save friend"
							}),
							friends.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: friends.map((friend) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => {
										setRoomInput(friend.code);
										setName(friend.name);
									},
									children: [
										friend.name,
										" · ",
										friend.code
									]
								}, `${friend.name}-${friend.code}`))
							})
						]
					})
				]
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Connected watch room",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }),
		title: joinedAsGuest ? `Theater · ${activeRoom}` : `Room ${activeRoom}`,
		copy: joinedAsGuest ? "Guest theater view. The host's current video, queue, and timeline arrive as the connection settles." : "Peer connection for your selected guests. Playback events are synchronized across connected devices.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(20rem,0.6fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Synchronized playback"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5 text-xs text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: `size-3 ${p2p.joined ? "text-accent" : "text-subtle"}` }), p2p.joined ? "Signaling online" : "Connecting…"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							disabled: !p2p.joined,
							onClick: () => {
								const invite = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(activeRoom)}&theater=1`;
								const opened = window.open(invite, "reelcase-local-guest", "noopener,width=1200,height=820");
								setInviteNotice(opened ? "Opened a separate local guest window. Give it a moment to appear in Guests." : "Your browser blocked the guest window. Allow pop-ups, then try again.");
							},
							children: "Open local guest window"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => void navigator.clipboard?.writeText(JSON.stringify({
								room: activeRoom,
								invitation: roomInvite,
								invitationNote: roomInvite ? void 0 : "Open Realhub from a home-network address before sharing this room with another device.",
								role: joinedAsGuest ? "guest" : "host",
								self: p2p.selfId,
								signaling: p2p.joined,
								peers: p2p.peers,
								transportTest: pulseStatus,
								reliability: roomHealth,
								ledger: roomLedger,
								events: p2p.events,
								capturedAt: (/* @__PURE__ */ new Date()).toISOString()
							}, null, 2)).then(() => setInviteNotice("Connection and reconciliation diagnostic copied."), () => setInviteNotice("Could not copy the diagnostic.")),
							children: "Copy room diagnostic"
						})]
					}),
					!roomInvite && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs leading-5 text-muted",
						children: ["A localhost invitation cannot open on another device. Open this room through the home-network address before sharing. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-accent underline",
							onClick: () => useLibrary.getState().setSource("connection"),
							children: "Open Connection guide"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "mt-3 rounded-sm bg-bg/45 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
								className: "cursor-pointer text-xs font-medium text-fg",
								children: [
									"Connection details · ",
									p2p.peers.filter((peer) => peer.connectionState === "connected").length,
									"/",
									p2p.peers.length,
									" connected"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium text-fg",
									children: "Connection signals"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted",
									children: [
										p2p.peers.filter((peer) => peer.connectionState === "connected").length,
										"/",
										p2p.peers.length,
										" connected · ",
										p2p.peers.filter((peer) => peer.connectionState === "connected" && peer.candidateType === "relay").length,
										" relayed"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomRelaySettings, {
								config: relayConfig,
								onChange: setRelayConfig
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 max-h-28 space-y-1 overflow-y-auto font-mono text-[11px] leading-4 text-muted",
								children: p2p.events.map((event, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: event }, `${event}-${index}`))
							}),
							!p2p.peers.length && p2p.joined && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs text-accent",
								children: [
									"Signaling is healthy, but no peer is in ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: activeRoom }),
									". The other window must join this exact code—not create its own. Use Open local guest window or copy this room link."
								]
							}),
							p2p.peers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 space-y-1 text-xs text-muted",
								children: p2p.peers.map((peer) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-fg",
										children: peer.name || "Guest"
									}),
									" · ",
									peer.connectionState,
									" · ",
									peer.candidateType ?? "path pending",
									" · ",
									peer.rttMs == null ? "RTT pending" : `${peer.rttMs}ms`,
									" · ",
									peer.id.slice(-6)
								] }, peer.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									disabled: !p2p.peers.some((peer) => peer.connectionState === "connected"),
									onClick: () => {
										setPulseStatus("Sending chat transport test…");
										p2p.send({
											type: "room-pulse",
											sentAt: Date.now()
										});
									},
									children: "Test chat transport"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted",
									children: pulseStatus
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-3xl text-fg",
						children: playback.playing && sharedVideo?.remote?.kind === "twitch" && !twitchClip && !twitchActuallyPlaying ? "Twitch waiting for playback" : playback.playing ? "Playing together" : "Paused together"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [
							"Timeline ",
							Math.floor(playback.position / 60),
							":",
							String(Math.floor(playback.position % 60)).padStart(2, "0"),
							" · ",
							timelineEvidence.source === "remote" ? "host-confirmed" : timelineEvidence.source === "local" ? "local player" : "provider estimate",
							" · checked ",
							new Date(timelineEvidence.at).toLocaleTimeString([], {
								hour: "numeric",
								minute: "2-digit",
								second: "2-digit"
							}),
							"."
						]
					}),
					joinedAsGuest && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomGuestTiming, {
						offset: guestOffset,
						position: adjustedTimerPosition,
						adjustsPlayback: timingAdjustsPlayback,
						onChange: changeGuestOffset
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "mt-4 rounded-md border border-border bg-bg/45 p-3",
						"aria-label": "Room reliability",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
								className: "cursor-pointer text-xs font-medium text-fg",
								children: [
									"Room reliability · r",
									roomHealth.queueRevision,
									" · ",
									roomHealth.staleDropped,
									" stale commands dropped"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
									children: "Room reliability"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted",
									children: joinedAsGuest ? "Guest commands are requests; the host publishes the canonical state." : "This device is the host and publishes the canonical state."
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-accent/15 px-2 py-1 text-xs text-accent",
									children: p2p.peers.some((peer) => peer.connectionState === "connected" && peer.candidateType === "relay") ? "TURN relay connected" : p2p.peers.some((peer) => peer.connectionState === "connected" && [
										"host",
										"srflx",
										"prflx"
									].includes(peer.candidateType ?? "")) ? "direct path connected" : p2p.peers.some((peer) => peer.connectionState === "connected") ? "connected · path pending" : p2p.joined ? "signaling online · peer pending" : "connecting"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 grid gap-2 text-xs sm:grid-cols-2 xl:grid-cols-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-sm bg-elevated p-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-muted",
											children: joinedAsGuest ? "Last host state" : "Last publish"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "mt-1 block text-fg",
											children: roomTimeLabel(joinedAsGuest ? roomHealth.lastHostStateAt : roomHealth.lastPublishedAt)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-sm bg-elevated p-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-muted",
											children: "Queue revision"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
											className: "mt-1 block text-fg",
											children: [
												"r",
												roomHealth.queueRevision,
												" · ",
												queue.length,
												" title",
												queue.length === 1 ? "" : "s"
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-sm bg-elevated p-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-muted",
											children: "Last correction"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "mt-1 block text-fg",
											children: roomHealth.lastDriftSeconds ? `${roomHealth.lastDriftSeconds.toFixed(1)}s` : "none needed"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-sm bg-elevated p-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-muted",
											children: "Safety checks"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
											className: "mt-1 block text-fg",
											children: [
												roomHealth.staleDropped,
												" stale dropped · ",
												roomHealth.resyncRequests,
												" resync"
											]
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
								className: "mt-3 rounded-sm bg-elevated p-2 text-xs text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
									className: "cursor-pointer font-medium text-fg",
									children: [
										"Session ledger · ",
										roomLedger.length,
										" local event",
										roomLedger.length === 1 ? "" : "s"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 max-h-32 space-y-1 overflow-y-auto",
									children: roomLedger.length ? roomLedger.slice().reverse().map((event, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-subtle",
											children: roomTimeLabel(event.at)
										}),
										" · ",
										event.detail
									] }, `${event.at}-${index}`)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No room decisions recorded yet." })
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: toggleRoomPlayback,
								children: [playback.playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), playback.playing ? "Pause" : "Play"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => sync({
									...playback,
									position: clampRoomClock(playback.position - 15)
								}, true),
								children: "−15 sec"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => sync({
									...playback,
									position: clampRoomClock(playback.position + 15)
								}, true),
								children: "+15 sec"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								onClick: resync,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-4" }),
									" ",
									joinedAsGuest ? "Request resync" : "Resync guests"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								disabled: !queue.length,
								onClick: playNext,
								children: [
									joinedAsGuest ? "Request next" : "Play next",
									" ",
									queue.length ? `(${queue.length})` : ""
								]
							})
						]
					}),
					inviteNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-accent",
						children: inviteNotice
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap items-center gap-2 text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Stage size" }), [
							"compact",
							"theater",
							"cinema"
						].map((size) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: stageSize === size ? "default" : "secondary",
							onClick: () => setStageSize(size),
							children: size
						}, size))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `mt-3 mx-auto w-full max-w-full overflow-hidden rounded-md bg-bg shadow-border ${stageSize === "compact" ? "lg:max-w-3xl" : ""}`,
						children: guestLocalStream ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomStreamPlayer, {
							stream: guestLocalStream,
							title: sharedVideo?.name ?? sharedLocalMedia?.name ?? "Host video",
							playing: playback.playing,
							position: playback.position,
							duration: roomDuration(),
							onPlayback: (playing) => sync({
								...playback,
								playing
							}, false, true),
							onSeek: (position) => sync({
								...playback,
								position
							}, true, true),
							onResync: resync
						}) : matchingLocalSource && localShareIsMatched ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							ref: roomVideoRef,
							className: "aspect-video w-full bg-bg",
							src: matchingLocalSource,
							controls: true,
							playsInline: true,
							onLoadedMetadata: () => {
								const seconds = roomVideoRef.current?.duration;
								if (typeof seconds === "number" && Number.isFinite(seconds)) setMeasuredDuration({
									videoId: sharedVideoId,
									seconds
								});
							},
							onEnded: finishRoomTitle,
							onPlay: () => syncDevicePlayback({
								playing: true,
								position: roomVideoRef.current?.currentTime ?? 0
							}),
							onPause: () => syncDevicePlayback({
								playing: false,
								position: roomVideoRef.current?.currentTime ?? 0
							}),
							onSeeked: () => syncDevicePlayback({
								playing: roomVideoRef.current ? !roomVideoRef.current.paused : false,
								position: roomVideoRef.current?.currentTime ?? 0
							}, true),
							onTimeUpdate: () => {
								const media = roomVideoRef.current;
								if (joinedAsGuest || !media || media.paused || Date.now() - lastRoomTick.current < 900) return;
								lastRoomTick.current = Date.now();
								sync({
									playing: true,
									position: media.currentTime
								});
							}
						}, sharedVideoId) : sharedVideo?.remote?.kind === "twitch" && !twitchClip ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative aspect-video w-full bg-bg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								ref: twitchPlayerHostRef,
								className: "absolute inset-0"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "absolute bottom-2 left-2 rounded-sm bg-bg/80 px-2 py-1 text-xs text-muted",
								children: twitchPlayerStatus
							})]
						}) : sharedVideo?.remote?.embedUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
							ref: remoteFrameRef,
							title: sharedVideo.name,
							src: watchRoomEmbed(sharedVideo),
							className: "aspect-video w-full border-0",
							allow: "autoplay; encrypted-media; picture-in-picture",
							allowFullScreen: true,
							onLoad: () => {
								lastYoutubeSeekNonce.current = -1;
								setRemoteFrameReady({
									id: sharedVideo.id,
									at: Date.now()
								});
							}
						}, sharedVideo.id) : libraryLocalSource ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							ref: roomVideoRef,
							className: "aspect-video w-full bg-bg",
							src: libraryLocalSource,
							controls: true,
							playsInline: true,
							onLoadedMetadata: () => {
								const seconds = roomVideoRef.current?.duration;
								if (typeof seconds === "number" && Number.isFinite(seconds)) setMeasuredDuration({
									videoId: sharedVideoId,
									seconds
								});
							},
							onEnded: finishRoomTitle,
							onPlay: () => syncDevicePlayback({
								playing: true,
								position: roomVideoRef.current?.currentTime ?? 0
							}),
							onPause: () => syncDevicePlayback({
								playing: false,
								position: roomVideoRef.current?.currentTime ?? 0
							}),
							onSeeked: () => syncDevicePlayback({
								playing: roomVideoRef.current ? !roomVideoRef.current.paused : false,
								position: roomVideoRef.current?.currentTime ?? 0
							}, true),
							onTimeUpdate: () => {
								const media = roomVideoRef.current;
								if (joinedAsGuest || !media || media.paused || Date.now() - lastRoomTick.current < 900) return;
								lastRoomTick.current = Date.now();
								sync({
									playing: true,
									position: media.currentTime
								});
							}
						}, sharedVideoId) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex aspect-video flex-col items-center justify-center px-6 text-center text-sm text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/art/realhub-projector.webp",
								alt: "",
								loading: "lazy",
								className: "mb-2 h-28 w-36 object-contain"
							}), sharedLocalMedia?.id === sharedVideoId ? `Waiting for the host to play ${sharedLocalMedia.name}. Local video streams directly to this device once playback starts.` : sharedVideoId.startsWith("local:") ? "Waiting for the host’s local video stream or a matching file on this device." : "Choose a starter movie or an online video to show it to the room."]
						})
					}),
					localStream.status && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted",
						children: localStream.status
					}),
					guestLocalStream && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted",
						children: "Watching the host’s local video. Use the room controls to pause or seek for everyone."
					}),
					sharedVideo?.remote?.kind === "youtube" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-subtle",
						children: "YouTube room controls retain the last trusted clock on pause, then resume from that same point. Use the room controls so every guest receives the same command."
					}) : sharedVideo?.remote?.kind === "twitch" && twitchClip ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-subtle",
						children: [
							"Twitch clips use Twitch’s separate clip player. Use its own controls to watch; room selection and chat remain shared. If Twitch shows a content classification error, ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: sharedVideo.remote.watchUrl,
								target: "_blank",
								rel: "noreferrer",
								className: "text-accent underline",
								children: "open the clip directly"
							}),
							"."
						]
					}) : sharedVideo?.remote?.kind === "twitch" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap items-center gap-2 text-xs text-subtle",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							className: "text-fg",
							children: "Twitch currently needs one manual Play press in each viewer’s embed."
						}), " Browser media rules prevent Realhub from forcing a guest stream to start. Selection, queue, chat, and the preserved pause clock still sync through the room controls."] }), sharedVideo.remote.watchUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: sharedVideo.remote.watchUrl,
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-8 items-center rounded-sm bg-elevated px-2 text-xs text-fg shadow-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "mr-1 size-3" }), "Open Twitch directly"]
						})]
					}) : null,
					sharedVideo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap items-center gap-2 rounded-md border border-border bg-bg/45 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mr-auto min-w-0 truncate text-sm font-medium text-fg",
								children: sharedVideo.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: favorites[sharedVideo.id] ? "default" : "secondary",
								onClick: () => toggleFavorite(sharedVideo.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: `size-4 ${favorites[sharedVideo.id] ? "fill-current" : ""}` }), favorites[sharedVideo.id] ? "Favorited" : "Favorite"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center gap-1",
								"aria-label": "Rate current room video",
								children: [
									1,
									2,
									3,
									4,
									5
								].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "flex size-9 items-center justify-center rounded-md text-accent hover:bg-elevated",
									"aria-label": `Rate ${sharedVideo.name} ${value} stars`,
									"aria-pressed": roomRating === value,
									onClick: () => {
										setRating(sharedVideo.id, roomRating === value ? 0 : value);
										setRoomRatingRevision((revision) => revision + 1);
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: `size-4 ${value <= roomRating ? "fill-current" : ""}` })
								}, value))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "mt-5 rounded-md border border-border bg-bg/35 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
								className: "cursor-pointer text-sm font-medium text-fg",
								children: "Explore more videos and advanced queue controls"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-xs text-muted",
								children: "Recommended from your playable library — saved titles get a small lift while unplayed playable videos rotate to the front. Ready local files can be added to the queue below without taking over the stage."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomRecommendations, {
								videos: roomCandidates,
								youtubeVideos: youtubeRoomCandidates,
								currentId: sharedVideoId,
								visibleCount: roomPickLimit,
								pending: roomCandidatesPending,
								onSelect: onRecommendationSelect,
								onMix: onMixRecommendations,
								onLoadMore: onLoadRecommendations
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 rounded-md bg-bg/45 p-3 shadow-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium text-fg",
											children: "Up next queue"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted",
											children: joinedAsGuest ? "Propose changes; host confirms the shared order" : "Host-controlled shared order"
										})]
									}),
									queue.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 space-y-2",
										children: queue.map((id, index) => {
											const video = videos.find((item) => item.id === id) ?? sharedRoomVideos[id];
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between gap-3 rounded-sm bg-elevated p-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex min-w-0 items-center gap-3",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent",
															children: index + 1
														}),
														video && watchRoomPoster(video) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
															src: watchRoomPoster(video),
															alt: "",
															className: "aspect-video w-16 shrink-0 rounded-sm object-cover"
														}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "flex aspect-video w-16 shrink-0 items-center justify-center rounded-sm bg-bg/60 text-xs text-muted",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3" })
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "min-w-0",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "block truncate text-sm text-fg",
																children: video?.name ?? "Unavailable title"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "block truncate text-xs text-muted",
																children: video?.remote?.channelName ?? (video?.remote ? "Remote video" : "Local file")
															})]
														})
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex gap-1",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															size: "sm",
															variant: "secondary",
															onClick: () => playQueuedNow(id),
															children: joinedAsGuest ? "Request play" : "Play now"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															size: "sm",
															variant: "ghost",
															disabled: index === 0,
															onClick: () => {
																const next = [...queue];
																[next[index - 1], next[index]] = [next[index], next[index - 1]];
																updateQueue(next);
															},
															children: "↑"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															size: "sm",
															variant: "ghost",
															onClick: () => updateQueue(queue.filter((item) => item !== id)),
															children: "Remove"
														})
													]
												})]
											}, id);
										})
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-xs text-muted",
										children: "Choose “Add next” below to build the shared queue."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 flex gap-2 overflow-x-auto pb-1",
										children: roomCandidates.filter((video) => video.id !== sharedVideoId).slice(0, 12).map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "inline-flex shrink-0 overflow-hidden rounded-sm shadow-border",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "secondary",
												onClick: () => queueImmediately(video),
												children: "Play next"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "ghost",
												disabled: queue.includes(video.id),
												onClick: () => queueVideo(video),
												children: ["+ queue · ", video.name]
											})]
										}, video.id))
									}),
									queueRecommendations.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 border-t border-border pt-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-medium text-fg",
												children: "More queue ideas"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted",
												children: "Different from the theater picks above"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2 flex gap-2 overflow-x-auto pb-1",
											children: queueRecommendations.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex shrink-0 overflow-hidden rounded-sm shadow-border",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "secondary",
													onClick: () => queueImmediately(video),
													children: "Play next"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													variant: "ghost",
													onClick: () => queueVideo(video),
													children: ["+ queue · ", video.name]
												})]
											}, video.id))
										})]
									}),
									localQueueCandidates.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 border-t border-border pt-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-medium text-fg",
												children: "Ready local files"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted",
												children: "Add to queue without opening now"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2 flex gap-2 overflow-x-auto pb-1",
											children: localQueueCandidates.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => queueVideo(video),
												children: ["+ queue · ", video.name]
											}, video.id))
										})]
									}),
									localQueue.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 border-t border-border pt-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-medium text-fg",
												children: "Approved local handoffs"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted",
												children: "Shared manifest · files stay on each device"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2 space-y-2",
											children: localQueue.map((share) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap items-center justify-between gap-2 rounded-sm bg-elevated px-3 py-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "min-w-0 truncate text-xs text-fg",
													children: [
														share.name,
														" · ",
														bytes(share.size)
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex gap-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														size: "sm",
														variant: "secondary",
														onClick: () => stageLocalShare(share),
														children: "Stage"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														size: "sm",
														variant: "ghost",
														onClick: () => updateLocalQueue(localQueue.filter((item) => item.fingerprint !== share.fingerprint)),
														children: "Remove"
													})]
												})]
											}, share.fingerprint))
										})]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "mt-4 rounded-md border border-border bg-bg/35 p-3",
						onToggle: (event) => setRoomLocalToolsOpen(event.currentTarget.open),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
								className: "cursor-pointer text-sm font-medium text-fg",
								children: "Local sharing, games & TV"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 rounded-md bg-bg/45 p-4 shadow-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorPlay, { className: "size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium text-fg",
											children: "Share local video"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: "Choose a file you may share with your guests. Playback streams from the host; phones do not need a copy of the file. Keep this player open while watching."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "mt-3 block",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "sr-only",
											type: "file",
											accept: "video/*",
											onChange: (event) => {
												const file = event.target.files?.[0] ?? null;
												selectLocalVideo(file);
											}
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "inline-flex min-h-10 items-center rounded-sm bg-elevated px-3 text-sm text-fg shadow-border",
											children: joinedAsGuest ? localVideo?.name ?? "Choose matching local video" : pickedLocalVideo?.name ?? "Choose local video"
										})]
									}),
									(pickedLocalShare ?? localShare) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-xs text-subtle",
										children: [
											"Selected file · ",
											bytes((pickedLocalShare ?? localShare).size),
											". Only title and match metadata are shared; file bytes stream during playback."
										]
									}),
									localShare && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-xs text-muted",
										children: [
											"Optional local copies · ",
											Object.values(localShareMatches).filter((match) => match.fingerprint === localShare.fingerprint).length,
											"/",
											p2p.peers.length,
											" guests matched this file. Other guests receive the host’s playback stream."
										]
									}),
									pendingLocalShare && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-xs text-accent",
										children: [
											"Optional local copy: ",
											pendingLocalShare.name,
											" · ",
											bytes(pendingLocalShare.size),
											". You may choose a matching copy above instead of receiving the stream."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "mt-3 flex items-start gap-2 text-xs text-muted",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: guestAccess,
											onChange: (event) => setGuestAccess(event.target.checked)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "I confirm guests have access to this video and may receive this direct share." })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										className: "mt-3",
										disabled: joinedAsGuest || !pickedLocalVideo || !guestAccess || !p2p.peers.length,
										onClick: sharePickedLocal,
										children: "Send sharing request"
									}),
									!joinedAsGuest && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										className: "mt-3 ml-2 min-h-11",
										disabled: !pickedLocalVideo || !guestAccess || queue.length >= 48,
										onClick: queuePickedLocal,
										children: "Queue selected local file"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										className: "mt-3 min-h-11",
										disabled: !(pickedLocalShare ?? localShare),
										onClick: () => {
											const share = pickedLocalShare ?? localShare;
											if (!share) return;
											if (!localQueue.some((item) => item.fingerprint === share.fingerprint)) updateLocalQueue([...localQueue, share]);
											setInviteNotice("Added file match metadata to the handoff list. Queue selected local file above for automatic playback.");
										},
										children: "Add to matching-file list"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 rounded-md bg-bg/45 p-4 shadow-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-fg",
										children: "Watch-party mini games"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: "Start a lightweight shared vote while the room is paused. Votes are sent to connected guests."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "mt-3",
										value: partyPrompt,
										onChange: (event) => setPartyPrompt(event.target.value),
										"aria-label": "Party vote question"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 flex flex-wrap gap-2",
										children: Object.keys(partyVotes).map((choice) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "secondary",
											onClick: () => {
												const next = (partyVotes[choice] ?? 0) + 1;
												setPartyVotes((votes) => ({
													...votes,
													[choice]: next
												}));
												p2p.send({
													type: "party-vote",
													name: choice,
													position: next
												});
											},
											children: [
												choice,
												" · ",
												partyVotes[choice] ?? 0
											]
										}, choice))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 text-xs text-accent",
										children: ["Now voting: ", partyPrompt]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 rounded-md bg-bg/45 p-4 shadow-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "flex items-center gap-2 text-sm font-medium text-fg",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorPlay, { className: "size-4 text-accent" }), "Roku handoff"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
										className: "mt-2 space-y-1 text-xs text-muted",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mr-2 text-accent",
												children: "1."
											}), "On Roku, open Settings → Network → About and copy its IP address."] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mr-2 text-accent",
												children: "2."
											}), "Enter it below to save this TV as a trusted handoff target."] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mr-2 text-accent",
												children: "3."
											}), "Launch the channel and copy the room invitation to your Roku browser or companion app."] })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex flex-col gap-2 sm:flex-row",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: rokuAddress,
												onChange: (event) => {
													setRokuAddress(event.target.value);
													setRokuReady(false);
												},
												placeholder: "Roku IP address, e.g. 192.168.1.24",
												"aria-label": "Roku IP address"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "secondary",
												disabled: !rokuAddress.trim(),
												onClick: () => {
													setRokuReady(true);
													localStorage.setItem("reelcase.roku", rokuAddress.trim());
												},
												children: "Save & pair TV"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "secondary",
												onClick: () => void (async () => {
													try {
														const devices = (await (await fetch("http://127.0.0.1:43123/roku/discover")).json()).devices ?? [];
														setRokuDevices(devices);
														setRokuNotice(devices.length ? `${devices.length} Roku device${devices.length === 1 ? "" : "s"} found on this network.` : "No Roku devices responded. You can still pair one by its IP address.");
													} catch {
														setRokuNotice("Roku discovery needs the local Realhub Companion running on this Windows computer.");
													}
												})(),
												children: "Discover TVs"
											})
										]
									}),
									rokuNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-xs text-muted",
										children: rokuNotice
									}),
									rokuDevices.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 flex flex-wrap gap-2",
										children: rokuDevices.map((device) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "secondary",
											onClick: () => {
												setRokuAddress(device.address);
												setRokuReady(true);
												localStorage.setItem("reelcase.roku", device.address);
											},
											children: device.address
										}, device.address))
									}),
									rokuReady && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 rounded-sm bg-elevated p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-accent",
											children: ["Step 3 ready · ", rokuAddress]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-2 flex flex-wrap gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												onClick: () => {
													const url = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(activeRoom)}`;
													window.open(`http://${rokuAddress}:8060/launch/837`, "_blank", "noopener");
													navigator.clipboard?.writeText(url).catch(() => {});
												},
												children: "Launch & copy room link"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => {
													setRokuReady(false);
													localStorage.removeItem("reelcase.roku");
												},
												children: "Forget TV"
											})]
										})]
									})
								]
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 space-y-4 self-start",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-lg bg-elevated p-4 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-2 text-sm font-medium text-fg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4 text-accent" }), " Room chat"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 min-h-24 max-h-48 space-y-2 overflow-y-auto text-sm text-muted",
								children: chat.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "rounded-sm bg-bg/45 px-3 py-2",
									children: row
								}, `${row}-${index}`))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: message,
									onChange: (event) => setMessage(event.target.value),
									onKeyDown: (event) => {
										if (event.key === "Enter") send();
									},
									placeholder: "Say something",
									"aria-label": "Room chat message"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									onClick: send,
									children: "Send"
								})]
							})
						]
					}),
					joinedAsGuest ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "rounded-lg border border-border bg-surface p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
							className: "cursor-pointer text-sm text-fg",
							children: "Invite another guest"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomInvitation, {
							invitation,
							started: true,
							onNotice: setInviteNotice
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomInvitation, {
						invitation,
						started: true,
						onNotice: setInviteNotice
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomQueuePanel, {
						onSearch: onQueueSearch,
						results: roomSearchResults,
						queue: queuePanelRows,
						currentId: sharedVideoId,
						currentMediaKey: sharedVideo ? roomMediaKey(sharedVideo) : void 0,
						guest: joinedAsGuest,
						notice: queueNotice,
						pending: pendingQueueChanges,
						autoAdvance,
						onAutoAdvance: onQueueAutoAdvance,
						onSelect: onQueueSelect,
						onAdd: onQueueAdd,
						onChange: onQueueChange,
						onClear: onQueueClear,
						onNext: onQueueNext,
						onShuffle: onQueueShuffle,
						onLink: onQueueLink,
						catalogPending: roomCandidatesPending,
						searching: roomSearchPending
					}, room),
					sharedVideo?.remote?.kind === "youtube" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "rounded-lg bg-elevated p-2 shadow-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdultComments, { video: sharedVideo })
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 rounded-lg bg-elevated p-4 shadow-border",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-fg",
					children: "Guests & connection status"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted",
						children: ["You · ", p2p.joined ? "ready" : "joining"]
					}), p2p.peers.length ? p2p.peers.map((peer) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted",
						children: [
							peer.name || "Guest",
							" · ",
							peer.connectionState,
							peer.rttMs ? ` · ${peer.rttMs}ms` : ""
						]
					}, peer.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-subtle",
						children: "Waiting for guests to join with the room code."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						onChange: (event) => setName(event.target.value),
						"aria-label": "Display name",
						className: "max-w-56"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => {
							setActiveRoom(null);
							queueRef.current = [];
							setQueue([]);
							localFiles.current.clear();
							setLocalVideo(null);
							setLocalShare(null);
							setPickedLocalVideo(null);
							setPendingLocalShare(null);
							setPlayback({
								playing: false,
								position: 0
							});
							setSharedVideoId("");
							setRoomCode(`RC${Math.random().toString(36).slice(2, 7).toUpperCase()}`);
						},
						children: "Leave room"
					})]
				})
			]
		})]
	});
}
function HubShell({ eyebrow, icon, title, copy, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "w-full max-w-none rounded-xl bg-surface p-5 shadow-border sm:p-6 xl:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-accent uppercase",
				children: [
					icon,
					" ",
					eyebrow
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl leading-none tracking-tight text-fg sm:text-5xl",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base",
				children: copy
			}),
			children
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-elevated px-4 py-4 shadow-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-2xl tabular-nums text-fg",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-muted",
			children: label
		})]
	});
}
function ServiceLink({ name, href, copy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href,
		className: "rounded-lg bg-elevated p-5 shadow-border transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-border-hover",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-2xl text-fg",
				children: name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: copy
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent",
				children: ["Open ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" })]
			})
		]
	});
}
function InfoCard({ icon, title, copy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-elevated p-5 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-accent",
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-3 font-display text-2xl text-fg",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-muted",
				children: copy
			})
		]
	});
}
function PhotoStars({ name, rating, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 flex flex-wrap items-center gap-1",
		role: "group",
		"aria-label": "Rating for " + name,
		children: [[
			1,
			2,
			3,
			4,
			5
		].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "inline-flex size-11 items-center justify-center rounded-sm hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-accent",
			"aria-label": "Rate " + name + " " + value + " stars",
			"aria-pressed": rating === value,
			onClick: () => onChange(value),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-5 " + (value <= rating ? "fill-accent text-accent" : "text-muted") })
		}, value)), rating > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "min-h-11 px-2 text-xs text-muted",
			"aria-label": "Clear rating for " + name,
			onClick: () => onChange(0),
			children: "Clear"
		})]
	});
}
//#endregion
export { isViewablePrintName as n, loadPrintBlob as r, hub_sections_exports as t };
