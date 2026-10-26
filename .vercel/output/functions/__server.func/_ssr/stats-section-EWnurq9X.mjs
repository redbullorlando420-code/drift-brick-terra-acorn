import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { Zt as ChartColumn, c as Upload, zt as Download } from "../_libs/lucide-react.mjs";
import { fn as sparseRecordScan, ft as forEachCatalogEntry, mt as getAdultPreviewHealth, pt as forEachCatalogSlice, wn as yieldCatalogTask } from "./live-rooms-Wov1xeIQ.mjs";
import { i as allowCardArtwork } from "./companion-C8xPNDAD.mjs";
import { $ as useSessionPhase, Br as guidePersonalScore, Gr as isGuideWeights, Hr as guideTieRank, Ir as exposureKey, It as creatorIsFavorited, Jt as getInteractionPriorityDelay, Kr as linksFromHistoryAndResume, Nr as createSourcePicks, O as openTopic, Ot as Button, Q as useBrowseLibrary, Rt as exportFeedback, Si as sessionPreferenceAdjustment, T as importLibraryPackZip, Ur as guideWeights, Ut as getFeedbackRevision, Vr as guidePositive, Wn as tagIsLiked, Xn as useLibrary, _i as sameGuideWeights, _t as undoGuidePreset, cr as DEFAULT_GUIDE_WEIGHTS, ct as getGuidePreset, dt as hydrateGuidePreset, ei as normalizeExposure, et as createSettledInput, g as createWeakSnapshotCache, ki as topicPreferenceScore, kn as scheduleBackgroundWork, kr as createBoundedPicks, l as RankingPanel, lt as getTopicBridges, mt as retryGuidePresetSave, nn as getRecommendationExposure, nt as cardVisibility, ot as catalogTurn, rn as getRecommendationRejections, rt as scheduleNavigationWork, st as acceptGuidePreset, ti as normalizeRecommendationSession, tn as getRating, ut as guidePresetSaveStatus, xi as sessionAllows, xn as recommendationTopicIsLiked, y as exportAdultStats } from "./library-app-CrsCDQmv.mjs";
import { a as addGuideOrigins, c as createGuideOrigins, f as summarizeDistribution, l as guidePenalties, n as REPORT_SOURCES, p as useRecommendationSession, r as RecommendationReports, s as createGuideAffinity, u as guideVisibility } from "./guide-picks-DB1XicWj.mjs";
import { d as bytes, f as downloadCsv, s as HubShell, u as Stat } from "./hub-shared-CSaQ1YXN.mjs";
import { t as TopicLinks } from "./topic-links-C2BpgK0_.mjs";
import { a as Bar, c as ResponsiveContainer, i as XAxis, l as Tooltip, n as BarChart, o as Pie, r as YAxis, s as Cell, t as PieChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stats-section-EWnurq9X.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var integer = (n, min, max) => typeof n === "number" && Number.isSafeInteger(n) && n >= min && n <= max;
/** Strict bounded numeric allowlist. Imported capsules cannot carry titles, paths or arbitrary fields. */
function normalizeGuideReplay(raw) {
	const r = raw;
	if (!r || r.format !== "realhub-guide-replay" || r.version !== 1 || !integer(r.at, 1, Number.MAX_SAFE_INTEGER) || !integer(r.seed, 0, 4294967295) || !integer(r.eligible, 0, 1e8) || typeof r.affinityLimited !== "boolean" || !isGuideWeights(r.baseline) || !Array.isArray(r.candidates) || r.candidates.length > 512 || r.eligible < r.candidates.length) throw Error("Unsupported or invalid Guide replay capsule.");
	const session = normalizeRecommendationSession(r.session);
	if (!r.session || session.familiarity !== r.session.familiarity || session.length !== r.session.length || session.sources !== r.session.sources) throw Error("Invalid replay session.");
	const keys = /* @__PURE__ */ new Set(), candidates = r.candidates.map((c) => {
		if (!c || !integer(c.key, 1, 512) || keys.has(c.key) || !integer(c.media, 1, 512) || !REPORT_SOURCES.includes(c.source) || !integer(c.creator, 0, 512) || typeof c.favorite !== "boolean" || typeof c.like !== "boolean" || typeof c.exposed !== "boolean" || !integer(c.topics, 0, 80) || !integer(c.penalty, 0, 64) || !Number.isFinite(c.exposure) || c.exposure < 0 || c.exposure > 18 || !integer(c.rank, 0, 4294967295)) throw Error("Invalid anonymous replay candidate.");
		keys.add(c.key);
		return Object.freeze({
			key: c.key,
			media: c.media,
			source: c.source,
			creator: c.creator,
			favorite: c.favorite,
			like: c.like,
			topics: c.topics,
			penalty: c.penalty,
			exposure: c.exposure,
			exposed: c.exposed,
			rank: c.rank
		});
	});
	return Object.freeze({
		format: "realhub-guide-replay",
		version: 1,
		at: r.at,
		seed: r.seed,
		eligible: r.eligible,
		affinityLimited: r.affinityLimited,
		session,
		baseline: guideWeights(r.baseline),
		candidates: Object.freeze(candidates)
	});
}
async function captureGuideReplay(input, seed, now, turn) {
	await turn();
	const tuning = normalizeRecommendationSession(input.session), weights = guideWeights(input.weights), allowed = guideVisibility(input), watched = /* @__PURE__ */ new Set(), origins = createGuideOrigins(), exposed = new Set(normalizeExposure(input.recommendationExposure, now).entries.map((row) => row.key));
	let eligible = 0, affinityLimited = false;
	await forEachCatalogSlice(input.history, (row) => watched.add(row.id), turn);
	await forEachCatalogSlice(input.videos, (video, index) => {
		if (allowed(video)) affinityLimited = addGuideOrigins(input, video, index, origins) || affinityLimited;
	}, turn);
	const affinity = createGuideAffinity(input, origins), penalties = guidePenalties(input, now);
	const compare = (a, b) => b.score - a.score || a.rank - b.rank || a.index - b.index, best = createSourcePicks(12, compare, (row) => row.source, tuning), sample = createBoundedPicks(500, (a, b) => a.sampleRank - b.sampleRank || a.index - b.index);
	await forEachCatalogSlice(input.videos, (video, index) => {
		if (!allowed(video) || video.remote?.live || watched.has(video.id) || !sessionAllows(video, tuning)) return;
		eligible++;
		const source = !video.remote ? "local" : video.remote.kind === "youtube" ? "youtube" : video.remote.kind === "twitch" ? "twitch" : "other", creator = video.remote && (video.remote.channelId?.trim() || video.remote.channelName?.trim().normalize("NFKC").toLowerCase());
		const bits = {
			favorite: Boolean(input.favorites[video.id]),
			like: Boolean(input.likes[video.id]),
			topics: affinity(video),
			...penalties(video)
		};
		const row = {
			index,
			source,
			creatorKey: creator ? video.remote.kind + ":" + creator.slice(0, 500) : void 0,
			mediaKey: exposureKey(video),
			...bits,
			exposed: exposed.has(exposureKey(video)),
			rank: guideTieRank(video.id, seed),
			sampleRank: guideTieRank(video.id, (seed ^ 2654435769) >>> 0),
			score: guidePersonalScore(bits, weights, tuning)
		};
		best.add(row);
		sample.add(row);
	}, turn);
	await turn();
	const retained = [...new Map([...best.finish(), ...sample.finish()].map((row) => [row.index, row])).values()].sort((a, b) => a.index - b.index), creators = /* @__PURE__ */ new Map(), media = /* @__PURE__ */ new Map();
	const candidates = retained.map((row, index) => {
		if (row.creatorKey && !creators.has(row.creatorKey)) creators.set(row.creatorKey, creators.size + 1);
		if (!media.has(row.mediaKey)) media.set(row.mediaKey, media.size + 1);
		return {
			key: index + 1,
			media: media.get(row.mediaKey),
			source: row.source,
			creator: row.creatorKey ? creators.get(row.creatorKey) : 0,
			favorite: row.favorite,
			like: row.like,
			topics: row.topics,
			penalty: row.penalty,
			exposure: row.exposure,
			exposed: row.exposed,
			rank: row.rank
		};
	});
	return normalizeGuideReplay({
		format: "realhub-guide-replay",
		version: 1,
		at: now,
		seed: seed >>> 0,
		eligible,
		affinityLimited,
		session: tuning,
		baseline: weights,
		candidates
	});
}
function rankReplay(data, weights) {
	const best = createSourcePicks(12, (a, b) => b.score - a.score || a.row.rank - b.row.rank || a.row.key - b.row.key, (item) => item.row.source, data.session);
	for (const row of data.candidates) best.add({
		row,
		score: guidePersonalScore(row, weights, data.session)
	});
	return best.finish();
}
function replayDistribution(data, selected, weights) {
	const groups = /* @__PURE__ */ new Map();
	let unknownCreators = 0;
	for (const { row } of selected) {
		if (!row.creator) {
			unknownCreators++;
			continue;
		}
		const old = groups.get(row.creator);
		if (old) old.shown++;
		else groups.set(row.creator, {
			bucket: row.creator,
			source: row.source,
			shown: 1,
			available: data.candidates.filter((c) => c.creator === row.creator).length
		});
	}
	return {
		version: 1,
		at: data.at,
		session: data.session,
		weights,
		eligible: data.candidates.length,
		creatorLimited: false,
		sources: REPORT_SOURCES.map((source) => ({
			source,
			available: data.candidates.filter((row) => row.source === source).length,
			shown: selected.filter((item) => item.row.source === source).length
		})),
		creators: [...groups.values()].sort((a, b) => b.shown - a.shown || a.bucket - b.bucket),
		unknownCreators,
		unknownCandidateCreators: data.candidates.filter((row) => !row.creator).length,
		selections: selected.map(({ row }) => ({
			key: "sample:" + row.media,
			recorded: false,
			exposed: row.exposed
		}))
	};
}
function compareGuideReplay(raw, proposed) {
	if (!isGuideWeights(proposed)) throw Error("Invalid proposed weights.");
	const data = normalizeGuideReplay(raw), weights = guideWeights(proposed), current = rankReplay(data, data.baseline), next = rankReplay(data, weights), currentRanks = new Map(current.map((item, i) => [item.row.key, i + 1])), nextRanks = new Map(next.map((item, i) => [item.row.key, i + 1]));
	const distributionBefore = replayDistribution(data, current, data.baseline), distributionAfter = replayDistribution(data, next, weights), metricsBefore = summarizeDistribution(distributionBefore, void 0), metricsAfter = summarizeDistribution(distributionAfter, distributionBefore.selections.map((row) => row.key));
	const changes = [.../* @__PURE__ */ new Set([...next.map((item) => item.row.key), ...current.map((item) => item.row.key)])].map((key) => {
		const row = data.candidates.find((row) => row.key === key), before = guidePersonalScore(row, data.baseline, data.session), after = guidePersonalScore(row, weights, data.session), oldPositive = guidePositive(row.favorite, row.like, row.topics, data.baseline), newPositive = guidePositive(row.favorite, row.like, row.topics, weights);
		return {
			candidate: key,
			source: row.source,
			from: currentRanks.get(key) ?? null,
			to: nextRanks.get(key) ?? null,
			before,
			after,
			favoriteDelta: Number(row.favorite) * (weights.favorite - data.baseline.favorite),
			likeDelta: Number(row.like) * (weights.like - data.baseline.like),
			topicDelta: row.topics * (weights.topic - data.baseline.topic),
			sessionDelta: sessionPreferenceAdjustment(newPositive, data.session) - sessionPreferenceAdjustment(oldPositive, data.session)
		};
	}).filter((row) => row.from !== row.to || row.before !== row.after).slice(0, 8);
	return {
		proposed: weights,
		current: current.map((item) => ({
			candidate: item.row.key,
			score: item.score,
			source: item.row.source
		})),
		next: next.map((item) => ({
			candidate: item.row.key,
			score: item.score,
			source: item.row.source
		})),
		metricsBefore,
		metricsAfter,
		distributionBefore,
		distributionAfter,
		changes
	};
}
var weightsLabel = (w) => "favorites " + w.favorite + " · likes " + w.like + " · shared topics " + w.topic;
var number = (n) => Math.round(n * 100) / 100;
function GuideExperiment() {
	const videos = useBrowseLibrary((s) => s.videos), tags = useBrowseLibrary((s) => s.tags), favorites = useBrowseLibrary((s) => s.favorites), likes = useBrowseLibrary((s) => s.likes), history = useBrowseLibrary((s) => s.history), folders = useBrowseLibrary((s) => s.folders), hidden = useBrowseLibrary((s) => s.hiddenVideos), unavailable = useBrowseLibrary((s) => s.unavailable), hideDemo = useBrowseLibrary((s) => s.hideDemo), session = useRecommendationSession(), phase = useSessionPhase(), viewer = useLibrary((s) => Boolean(s.activeId || s.previewId));
	const [revision, refresh] = (0, import_react.useState)(0), [ready, setReady] = (0, import_react.useState)(false), [proposal, setProposal] = (0, import_react.useState)(DEFAULT_GUIDE_WEIGHTS), [packet, setPacket] = (0, import_react.useState)(), [result, setResult] = (0, import_react.useState)(), [busy, setBusy] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)(""), [note, setNote] = (0, import_react.useState)("");
	const request = (0, import_react.useRef)(void 0), file = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const update = () => refresh((n) => n + 1);
		for (const name of [
			"reelcase:rating-change",
			"reelcase:bridge-change",
			"reelcase:guide-preset-change",
			"reelcase:guide-preset-save"
		]) window.addEventListener(name, update);
		hydrateGuidePreset().then(() => {
			setProposal(getGuidePreset().current);
			setReady(true);
		});
		return () => {
			for (const name of [
				"reelcase:rating-change",
				"reelcase:bridge-change",
				"reelcase:guide-preset-change",
				"reelcase:guide-preset-save"
			]) window.removeEventListener(name, update);
		};
	}, []);
	const ledger = getGuidePreset(), input = (0, import_react.useMemo)(() => ({
		weights: getGuidePreset().current,
		session,
		videos,
		tags,
		favorites,
		likes,
		history,
		folders,
		hidden,
		unavailable,
		hideDemo,
		bridgeSuppressions: getTopicBridges(),
		recommendationExposure: getRecommendationExposure(),
		recommendationRejections: getRecommendationRejections(),
		ratingOf: getRating,
		creatorIsFavorited,
		tagIsLiked: recommendationTopicIsLiked
	}), [
		session,
		videos,
		tags,
		favorites,
		likes,
		history,
		folders,
		hidden,
		unavailable,
		hideDemo,
		revision
	]);
	(0, import_react.useEffect)(() => {
		request.current?.abort();
		setBusy(false);
		return () => request.current?.abort();
	}, [
		input,
		phase,
		viewer
	]);
	const fresh = Boolean(packet?.input === input && packet.presetAt === ledger.updatedAt), changed = Boolean(result && !sameGuideWeights(packet.data.baseline, result.proposed)), canAccept = ready && fresh && changed && Boolean(packet?.data.candidates.length) && !busy && phase === "active" && !viewer;
	const capture = async () => {
		request.current?.abort();
		const controller = new AbortController();
		request.current = controller;
		setBusy(true);
		setError("");
		setNote("");
		setResult(void 0);
		try {
			const data = await captureGuideReplay(input, Date.now() >>> 0, Date.now(), catalogTurn(controller.signal));
			if (!controller.signal.aborted) {
				setPacket({
					data,
					input,
					presetAt: ledger.updatedAt
				});
				setProposal(data.baseline);
			}
		} catch {
			if (!controller.signal.aborted) setError("The snapshot could not finish. Try again.");
		} finally {
			if (!controller.signal.aborted) setBusy(false);
		}
	};
	const compare = () => {
		if (!packet) return;
		try {
			setResult(compareGuideReplay(packet.data, proposal));
			setError("");
			setNote("Comparison prepared from the frozen sample. Nothing has been applied.");
		} catch (e) {
			setError(e instanceof Error ? e.message : "Could not compare this snapshot.");
		}
	};
	const exportReplay = () => {
		if (!packet) return;
		let url = "";
		try {
			url = URL.createObjectURL(new Blob([JSON.stringify({
				snapshot: normalizeGuideReplay(packet.data),
				proposal,
				result
			}, null, 2)], { type: "application/json" }));
			const a = document.createElement("a");
			a.href = url;
			a.download = "realhub-guide-experiment.json";
			a.click();
		} catch {
			setError("The replay could not be exported.");
		} finally {
			if (url) setTimeout(() => URL.revokeObjectURL(url), 1e3);
		}
	};
	const importReplay = async (file) => {
		try {
			if (file.size > 262144) throw Error("Replay files must be no larger than 256 KB.");
			const raw = JSON.parse(await file.text()), data = normalizeGuideReplay(raw.snapshot ?? raw);
			request.current?.abort();
			setBusy(false);
			setPacket({
				data,
				presetAt: -1
			});
			setProposal(isGuideWeights(raw.proposal) ? guideWeights(raw.proposal) : data.baseline);
			setResult(void 0);
			setError("");
			setNote("Imported snapshot is preview-only. Capture this library before applying a preset.");
		} catch (e) {
			setError(e instanceof Error ? e.message : "This replay file could not be read.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		"data-guide-experiment": true,
		className: "mt-5 rounded-xl border border-border bg-surface p-5 text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
				className: "min-h-11 cursor-pointer content-center font-display text-2xl",
				children: "Feedback experiment replay"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-3xl text-sm leading-6 text-muted",
				children: "Test positive-signal weights for personal AI Guide mixes on a frozen, anonymous sample. The sample keeps the current top twelve plus up to 500 seeded alternatives. It may miss a proposed preset’s full-library winners. Preview does not write likes, history, exposure, tags or preset choices."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				"data-guide-preset-current": true,
				className: "mt-3 text-sm",
				children: ["Applied Guide weights: ", weightsLabel(ledger.current)]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: "Scope: Guide personal picks and preference boosts in Guide questions only. Title/query relevance, private visibility, source/length settings, rejection penalties and protected exposure rules stay fixed. Other recommendation desks keep their existing ranking."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "min-h-11",
						disabled: !ready || busy || phase !== "active" || viewer,
						onClick: () => void capture(),
						children: busy ? "Capturing public signals…" : "Capture current Guide snapshot"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "min-h-11",
						onClick: () => file.current?.click(),
						children: "Import replay snapshot"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: file,
						type: "file",
						accept: ".json,application/json",
						className: "hidden",
						"aria-label": "Import Guide replay file",
						onChange: (event) => {
							const value = event.target.files?.[0];
							if (value) importReplay(value);
							event.target.value = "";
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "min-h-11",
						disabled: !ledger.previous,
						onClick: () => {
							undoGuidePreset();
							setNote("Previous Guide preset restored. Generate a new Guide mix or question to use it.");
						},
						children: "Roll back Guide preset"
					})
				]
			}),
			busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-3 text-sm text-muted",
				children: "Reading eligible public records cooperatively. Leaving this page or changing inputs cancels capture."
			}),
			packet && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-replay-snapshot": true,
				className: "mt-4 rounded-lg bg-elevated p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium",
						children: [
							packet.data.candidates.length,
							" anonymous candidates · ",
							packet.data.eligible.toLocaleString(),
							" eligible library rows · seed ",
							packet.data.seed
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs leading-5 text-muted",
						children: [
							"Captured ",
							new Date(packet.data.at).toLocaleString(),
							" · source mix ",
							packet.data.session.sources,
							" · length ",
							packet.data.session.length,
							" · style ",
							packet.data.session.familiarity,
							". Current comparison weights: ",
							weightsLabel(packet.data.baseline),
							". No titles, creator names, media IDs, paths, raw tags or image data are retained in the capsule. Anonymous candidate and creator numbers are specific to this snapshot."
						]
					}),
					packet.data.affinityLimited && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted",
						children: "The Guide’s bounded affinity vocabulary was reached. This snapshot preserves that same limited evidence."
					}),
					!fresh && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-replay-stale": true,
						role: "status",
						className: "mt-2 text-sm text-muted",
						children: "Preview only: imported data or library/preset inputs changed. Capture current signals before applying."
					}),
					!packet.data.candidates.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "No eligible unrecorded public recordings match this session. Add media or change the Guide session; an empty replay cannot be applied."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-3",
						children: [
							"favorite",
							"like",
							"topic"
						].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-sm",
							children: [key === "favorite" ? "Favorite weight" : key === "like" ? "Like weight" : "Shared-topic weight", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "mt-2 min-h-11 w-full rounded-lg border border-border bg-bg px-3 text-fg",
								"aria-label": "Experiment " + key + " weight",
								value: proposal[key],
								onChange: (event) => {
									setProposal({
										...proposal,
										[key]: Number(event.target.value)
									});
									setResult(void 0);
									setNote("Proposal changed. Compare before applying.");
								},
								children: Array.from({ length: key === "topic" ? 4 : 9 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: i,
									children: i
								}, i))
							})]
						}, key))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "min-h-11",
								onClick: compare,
								children: "Compare on frozen snapshot"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "min-h-11",
								onClick: () => {
									setProposal(DEFAULT_GUIDE_WEIGHTS);
									setResult(void 0);
									setNote("Standard weights are a proposal. Compare and explicitly apply to change the preset.");
								},
								children: "Propose standard weights"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "min-h-11",
								onClick: exportReplay,
								children: "Export anonymous replay"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "min-h-11",
								onClick: () => {
									request.current?.abort();
									setBusy(false);
									setPacket(void 0);
									setResult(void 0);
									setNote("Snapshot cleared. Applied weights are unchanged.");
								},
								children: "Clear replay snapshot"
							})
						]
					}),
					result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-replay-result": true,
						className: "mt-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-lg font-medium",
								children: "Current → proposed on this sample"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4",
								children: [
									["New-to-exposure slots", result.metricsBefore.novel + " → " + result.metricsAfter.novel],
									["Unique media", result.metricsBefore.uniqueTitles + " → " + result.metricsAfter.uniqueTitles],
									["Repeated output slots", result.metricsBefore.repeatedWithin + " → " + result.metricsAfter.repeatedWithin],
									["Retained current titles", result.metricsAfter.repeatedFromPrevious + " / " + result.metricsBefore.uniqueTitles]
								].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg bg-bg p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-lg tabular-nums",
										children: value
									})]
								}, label))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 grid gap-4 lg:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "text-sm font-medium",
									children: "Provider slots · current → proposed"
								}), result.distributionBefore.sources.filter((row) => row.available).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-xs",
									children: [
										row.source,
										" · ",
										row.shown,
										" → ",
										result.distributionAfter.sources.find((other) => other.source === row.source).shown
									]
								}, row.source))] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "text-sm font-medium",
										children: "Largest credited creator share"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-xs",
										children: [
											number((result.distributionBefore.creators[0]?.shown ?? 0) / Math.max(1, result.current.length) * 100),
											"% → ",
											number((result.distributionAfter.creators[0]?.shown ?? 0) / Math.max(1, result.next.length) * 100),
											"%"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-xs text-muted",
										children: [
											"Unknown creator credits: ",
											result.distributionBefore.unknownCreators,
											" → ",
											result.distributionAfter.unknownCreators,
											" slots. Creator groups use the same provider-scoped identity rule as the fairness report."
										]
									})
								] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
								className: "mt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
									className: "min-h-11 cursor-pointer content-center text-sm",
									children: "Anonymous output order"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid gap-4 sm:grid-cols-2",
									children: [result.current, result.next].map((rows, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "text-sm font-medium",
										children: i ? "Proposed" : "Current"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
										className: "mt-2 space-y-2 text-xs",
										children: rows.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
											index + 1,
											". Candidate ",
											row.candidate,
											" · ",
											row.source,
											" · score ",
											number(row.score)
										] }, row.candidate))
									})] }, i))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "mt-4 text-sm font-medium",
								children: "Top output changes"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 space-y-2",
								children: [result.changes.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "rounded-md bg-bg p-3 text-xs leading-5",
									children: [
										"Candidate ",
										row.candidate,
										" · ",
										row.source,
										" · rank ",
										row.from ?? "outside top 12",
										" → ",
										row.to ?? "outside top 12",
										" · score ",
										number(row.before),
										" → ",
										number(row.after),
										". Weight contributions: favorite ",
										number(row.favoriteDelta),
										", like ",
										number(row.likeDelta),
										", topic ",
										number(row.topicDelta),
										", session modifier ",
										number(row.sessionDelta),
										". Rejection/exposure deductions unchanged."
									]
								}, row.candidate)), !result.changes.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "No selected rank or score changed on this sample."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-xs leading-5 text-muted",
								children: "Metrics reuse the fairness report’s output definitions. Novelty here means no valid recent exposure; personal candidates already exclude recorded history. These unjudged candidates have no relevance scores, so this replay cannot establish higher relevance or user satisfaction. No provider is contacted."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-4 min-h-11",
								disabled: !canAccept,
								onClick: () => {
									if (!canAccept || !result) return;
									acceptGuidePreset(result.proposed);
									setNote("Guide preset applied. The previous preset is available for rollback. Generate a new Guide mix or question to use it.");
								},
								children: "Apply reviewed Guide preset"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted",
								children: "Applying is an explicit change to this browser library’s Guide weights. The previous preset is retained across reload and in library backups. Existing painted cards stay stable until the next Guide request."
							})
						]
					})
				]
			}),
			ledger.previous && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs text-muted",
				children: ["Rollback available: ", weightsLabel(ledger.previous)]
			}),
			guidePresetSaveStatus() === "failed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "alert",
				className: "mt-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Guide weights work for this session, but browser storage could not save them." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "mt-2 min-h-11",
					onClick: retryGuidePresetSave,
					children: "Retry saving Guide preset"
				})]
			}),
			note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				"data-replay-note": true,
				className: "mt-3 text-sm text-muted",
				children: note
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-3 text-sm text-muted",
				children: error
			})
		]
	});
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
			if (controller.signal.aborted) return;
			stop();
			controller.abort();
			cancelTurn();
			rejectTurn?.(/* @__PURE__ */ new Error("Statistics worker stopped"));
			ack?.();
			ack = void 0;
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
				worker.onerror = (event) => {
					event.preventDefault();
					failed();
				};
				worker.onmessageerror = failed;
				worker.onmessage = ({ data }) => {
					if (controller.signal.aborted) return;
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
		pending: !snapshot.error && (snapshot.pending || input !== settled.input || revision !== settled.revision)
	};
}
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
			stats.error && stats.data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-2 min-h-11",
				variant: "secondary",
				onClick: () => setFavoriteRevision((value) => value + 1),
				children: "Retry statistics"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuideExperiment, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecommendationReports, {}),
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
										Math.max(run.total, run.targets.length) > 8 ? ` + ${Math.max(run.total, run.targets.length) - 8} more targets` : ""
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
//#endregion
export { StatsSection };
