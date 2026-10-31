import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { N as RotateCcw, x as SlidersHorizontal } from "../_libs/lucide-react.mjs";
import { t as LIBRARY_LIMITS } from "./youtube-contract-DMSANo43.mjs";
import { bt as forEachCatalogSlice, xn as sortCatalogRows } from "./live-rooms-DInVyvi_.mjs";
import { Ci as reviewedRankingTag, Dt as createExposurePenalty, Et as createBoundedPicks, G as bridgePolicy, It as exposureKey, Jt as guidePersonalScore, Oi as sameRecommendationSession, Ot as createRejectionPenalty, Qt as hasTopicForScan, Sa as topicEvidenceForScan, Tr as publicVideoBoundary, Xn as normalizeExposure, Xt as guideTieRank, Yt as guidePositive, Z as canonicalTopic, Zt as guideWeights, ba as titleRejectionTarget, i as DEFAULT_RECOMMENDATION_SESSION, jt as creatorRejectionTarget, ka as videoBridgeSource, kt as createSessionPicks, la as sessionAllows, nr as normalizeRejections, q as bridgeTopic, tr as normalizeRecommendationSession, ua as sessionPreferenceAdjustment } from "./persist-D_pR3DU-.mjs";
import { $n as useLibrary, nt as hasFreshViewerCount } from "./store-0MIXEefC.mjs";
import { Vt as Button } from "./library-app-BzjSyqkW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/guide-picks-H-pVr5Jv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var REPORT_SOURCES = [
	"local",
	"youtube",
	"twitch",
	"other"
];
var sourceOf = (video) => !video.remote ? "local" : video.remote.kind === "youtube" ? "youtube" : video.remote.kind === "twitch" ? "twitch" : "other";
/** Provider-scoped actual creator evidence. A local folder is not a creator. */
function creatorOf(video) {
	if (!video.remote) return void 0;
	const id = video.remote.channelId?.trim() || video.remote.channelName?.trim().normalize("NFKC").toLowerCase();
	return id ? video.remote.kind + ":" + id.slice(0, 500) : void 0;
}
/** O(1) source counters and at most 4096 creator counters; no title graph. */
function createDistributionCollector(session, weights) {
	const tuning = normalizeRecommendationSession(session), sources = new Map(REPORT_SOURCES.map((source) => [source, 0])), creators = /* @__PURE__ */ new Map();
	let eligible = 0, unknownCandidateCreators = 0, creatorLimited = false;
	return {
		add(video) {
			eligible++;
			const source = sourceOf(video);
			sources.set(source, sources.get(source) + 1);
			const key = creatorOf(video);
			if (!key) {
				unknownCandidateCreators++;
				return;
			}
			if (creators.has(key)) creators.set(key, creators.get(key) + 1);
			else if (creators.size < 4096) creators.set(key, 1);
			else creatorLimited = true;
		},
		finish(picks, at, historyHas, exposure) {
			const selected = picks.slice(0, 12), groups = /* @__PURE__ */ new Map(), exposed = new Set(normalizeExposure(exposure, at).entries.map((row) => row.key));
			let unknownCreators = 0;
			for (const video of selected) {
				const key = creatorOf(video);
				if (!key) {
					unknownCreators++;
					continue;
				}
				const previous = groups.get(key);
				if (previous) previous.shown++;
				else groups.set(key, {
					bucket: groups.size + 1,
					source: sourceOf(video),
					shown: 1,
					available: creators.get(key) ?? null
				});
			}
			return {
				version: 1,
				at,
				session: tuning,
				weights: guideWeights(weights),
				eligible,
				creatorLimited,
				sources: REPORT_SOURCES.map((source) => ({
					source,
					available: sources.get(source),
					shown: selected.filter((video) => sourceOf(video) === source).length
				})),
				creators: [...groups.values()].sort((a, b) => b.shown - a.shown || a.bucket - b.bucket),
				unknownCreators,
				unknownCandidateCreators,
				selections: selected.map((video) => ({
					key: exposureKey(video),
					recorded: historyHas(video.id),
					exposed: exposed.has(exposureKey(video))
				}))
			};
		},
		get trackedCreators() {
			return creators.size;
		}
	};
}
function summarizeDistribution(data, previous, threshold = 50) {
	const cutoff = Number.isFinite(threshold) ? Math.max(25, Math.min(100, Math.round(threshold))) : 50, n = data.selections.length, unique = new Set(data.selections.map((row) => row.key)), prior = previous ? new Set(previous) : void 0;
	const findings = [];
	const available = data.sources.filter((row) => row.available > 0);
	if (!n) findings.push({
		kind: "policy",
		status: "unknown",
		text: "No output to assess. Empty results do not establish a diversity problem."
	});
	else if (data.session.sources === "balanced") {
		const violation = data.sources.some((a) => data.sources.some((b) => a.shown > b.shown + 1 && b.available > b.shown));
		const constrained = available.length < 2 || available.some((row) => row.available < Math.ceil(n / Math.max(1, available.length)));
		findings.push({
			kind: "policy",
			status: violation ? "review" : constrained ? "constrained" : "ok",
			text: violation ? "The output does not match the balanced-source policy; an eligible source had unused capacity." : available.length < 2 ? "Only one source has eligible candidates. Balanced mode cannot add an unavailable provider." : constrained ? "Balanced sources fill shortages from available pools; smaller pools limit an equal split." : "The actual output follows the balanced-source policy within one slot per available source."
		});
	} else findings.push({
		kind: "policy",
		status: available.length < 2 ? "constrained" : "ok",
		text: data.session.sources !== "all" ? "This session deliberately restricts the source. Provider diversity is not an active ranking target." : available.length < 2 ? "Only one source has eligible candidates. This is a library constraint, not a provider-diversity failure." : "Standard ranking has no equal-provider quota. Provider shares describe the output; they do not declare a policy failure."
	});
	const dominant = data.creators[0];
	if (n && dominant && dominant.shown / n * 100 > cutoff) {
		const alternatives = dominant.available === null ? null : Math.max(0, data.eligible - dominant.available), needed = n - Math.floor(n * cutoff / 100);
		const missingCredits = alternatives !== null && alternatives >= needed && alternatives - data.unknownCandidateCreators < needed;
		findings.push({
			kind: "concentration",
			status: alternatives === null || missingCredits ? "unknown" : alternatives < needed ? "constrained" : "review",
			text: alternatives === null ? "The leading creator exceeds the diagnostic threshold. Creator availability hit the counting limit, so avoidability is unknown." : missingCredits ? "The leading creator exceeds the diagnostic threshold, but missing creator credits prevent confirming enough distinct-creator alternatives." : alternatives < needed ? "The leading creator exceeds the diagnostic threshold, but too few eligible alternatives can fill this output below it." : "The leading creator exceeds the diagnostic threshold and eligible alternatives with other creator credits exist. Review the mix or session settings; no creator cap is currently enforced."
		});
	} else if (n) findings.push({
		kind: "concentration",
		status: "ok",
		text: "No identified creator exceeds the diagnostic threshold. Missing creator credits are reported separately."
	});
	if (data.creatorLimited) findings.push({
		kind: "coverage",
		status: "unknown",
		text: "Creator availability is counted for at most 4,096 identities. Untracked selected creators have unknown availability, not zero."
	});
	return {
		threshold: cutoff,
		shown: n,
		uniqueTitles: unique.size,
		repeatedWithin: n - unique.size,
		recorded: data.selections.filter((row) => row.recorded).length,
		recentlyExposed: data.selections.filter((row) => row.exposed).length,
		novel: data.selections.filter((row) => !row.recorded && !row.exposed).length,
		previousShown: prior?.size ?? null,
		repeatedFromPrevious: prior ? [...unique].filter((key) => prior.has(key)).length : null,
		findings
	};
}
/** Export counts and anonymous creator buckets only, never titles, IDs, paths or prompts. */
function distributionExport(data, previous, threshold = 50) {
	return {
		version: 1,
		scope: "Actual generated public AI Guide output only; aggregate snapshot, not demographic fairness or a watch-completion claim.",
		at: data.at,
		session: data.session,
		weights: guideWeights(data.weights),
		eligible: data.eligible,
		sources: data.sources.map((row) => ({
			source: row.source,
			available: row.available,
			shown: row.shown
		})),
		creators: data.creators.map((row) => ({
			bucket: row.bucket,
			source: row.source,
			shown: row.shown,
			available: row.available
		})),
		unknownCreators: data.unknownCreators,
		unknownCandidateCreators: data.unknownCandidateCreators,
		creatorLimited: data.creatorLimited,
		...summarizeDistribution(data, previous, threshold)
	};
}
var listeners = /* @__PURE__ */ new Set();
var empty = Object.freeze([]);
var entries = empty;
var getRecommendationReports = () => entries;
var emptyRecommendationReports = () => empty;
function subscribeRecommendationReports(listener) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}
function publishRecommendationReport(shelf, distribution) {
	const prior = entries.find((row) => row.shelf === shelf);
	if (prior?.distribution === distribution) return;
	const entry = Object.freeze({
		shelf,
		distribution,
		previous: prior ? Object.freeze(prior.distribution.selections.map((row) => row.key)) : void 0
	});
	entries = Object.freeze([entry, ...entries.filter((row) => row.shelf !== shelf)].slice(0, 2));
	for (const listener of listeners) listener();
}
function clearRecommendationReports() {
	if (!entries.length) return;
	entries = empty;
	for (const listener of listeners) listener();
}
var label = (source) => source === "youtube" ? "YouTube" : source === "twitch" ? "Twitch" : source === "local" ? "Local" : "Other public sources";
var percent = (count, total) => total ? Math.round(count / total * 100) + "%" : "—";
var useReports = () => (0, import_react.useSyncExternalStore)(subscribeRecommendationReports, getRecommendationReports, emptyRecommendationReports);
/** Publish only a successfully prepared, currently rendered output. No storage or polling. */
function GuideOutputReport({ distribution, shelf }) {
	const entries = useReports();
	(0, import_react.useEffect)(() => publishRecommendationReport(shelf, distribution), [shelf, distribution]);
	const entry = entries.find((row) => row.shelf === shelf && row.distribution === distribution);
	return entry ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OutputReport, { entry }) : null;
}
function RecommendationReports() {
	const entries = useReports(), setSource = useLibrary((s) => s.setSource);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-recommendation-reports": true,
		className: "mt-5 rounded-xl border border-border bg-surface p-5 text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "Recommendation fairness report"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-3xl text-sm leading-6 text-muted",
				children: "Inspect actual public AI Guide outputs from this tab. These are generation snapshots, not impressions or proof of watching. Other recommendation shelves are outside this report."
			})] }), entries.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "min-h-11",
				onClick: clearRecommendationReports,
				children: "Clear Guide reports"
			})]
		}), entries.length ? entries.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OutputReport, { entry }, entry.shelf)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No Guide output has been generated in this tab yet. Reports clear on reload and never add history, likes or exposure."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "mt-3 min-h-11",
				onClick: () => setSource("assistant"),
				children: "Open AI Guide for a report"
			})]
		})]
	});
}
function OutputReport({ entry }) {
	const [threshold, setThreshold] = (0, import_react.useState)(50), [error, setError] = (0, import_react.useState)("");
	const data = entry.distribution, summary = summarizeDistribution(data, entry.previous, threshold), n = summary.shown;
	const download = () => {
		let url = "";
		try {
			url = URL.createObjectURL(new Blob([JSON.stringify({
				...distributionExport(data, entry.previous, threshold),
				shelf: entry.shelf
			}, null, 2)], { type: "application/json" }));
			const a = document.createElement("a");
			a.href = url;
			a.download = "realhub-guide-" + entry.shelf + "-report.json";
			a.click();
			setError("");
		} catch {
			setError("The report could not be exported. Try again.");
		} finally {
			if (url) setTimeout(() => URL.revokeObjectURL(url), 1e3);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		"data-guide-report": entry.shelf,
		className: "mt-4 rounded-lg border border-border bg-elevated p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
				className: "min-h-11 cursor-pointer text-sm font-medium",
				children: [entry.shelf === "mix" ? "Current mix" : "Latest question", " · recommendation fairness report"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: [
					"Generated ",
					new Date(data.at).toLocaleString(),
					" · ",
					data.eligible.toLocaleString(),
					" eligible candidate rows · ",
					n,
					" output slots. Availability uses the same public visibility, recorded-history policy and session/query filters as this output. Counts are snapshots; use a new mix or question to update."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-report-metrics": true,
				className: "mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4",
				children: [
					["Unique titles", summary.uniqueTitles + " / " + n],
					["Repeated in output", String(summary.repeatedWithin)],
					["No recorded history or recent exposure", summary.novel + " / " + n],
					["Repeated from previous " + entry.shelf, summary.repeatedFromPrevious === null ? "No previous output" : summary.repeatedFromPrevious + " / " + summary.uniqueTitles]
				].map(([title, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 rounded-lg bg-bg p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-5 text-muted",
						children: title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-lg font-medium tabular-nums",
						children: value
					})]
				}, title))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs leading-5 text-muted",
				children: [
					summary.recorded,
					" slots have recorded history · ",
					summary.recentlyExposed,
					" have valid exposure in the last 30 days, including protected favorites. “No recorded history or recent exposure” is evidence-limited novelty, not proof you have never seen a title. Repeats compare canonical media IDs, not similar titles. Previous output means the prior generated shelf of this kind, even if its filters differed."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-medium",
					children: "Provider share"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 space-y-3",
					children: data.sources.filter((row) => row.available || row.shown).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-report-provider": row.source,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap justify-between gap-2 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label(row.source) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted",
								children: [
									row.shown,
									" / ",
									n,
									" · ",
									percent(row.shown, n),
									" · ",
									row.available.toLocaleString(),
									" available rows"
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meter", {
							className: "mt-1 h-3 w-full accent-accent",
							min: 0,
							max: Math.max(1, n),
							value: row.shown,
							"aria-label": label(row.source) + " output share"
						})]
					}, row.source))
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-medium",
						children: "Creator share · anonymous groups"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs leading-5 text-muted",
						children: "Grouped by provider-scoped creator ID, falling back to a normalized creator name. Names and title samples are omitted. Local folder names are not creator credits."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 space-y-2",
						children: [data.creators.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							"data-report-creator": true,
							className: "text-xs leading-5",
							children: [
								"Creator ",
								row.bucket,
								" · ",
								label(row.source),
								" · ",
								row.shown,
								" / ",
								n,
								" (",
								percent(row.shown, n),
								") · ",
								row.available === null ? "unknown availability" : row.available + " available rows"
							]
						}, row.bucket)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								data.unknownCreators,
								" / ",
								n,
								" slots and ",
								data.unknownCandidateCreators,
								" eligible rows lack creator credits; unknown alternatives cannot prove creator diversity."
							]
						})]
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-4 flex min-h-11 flex-wrap items-center gap-3 text-sm",
				children: ["Creator diagnostic threshold", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					"aria-label": "Creator diagnostic threshold",
					className: "min-h-11 rounded-md border border-border bg-bg px-3 text-fg",
					value: threshold,
					onChange: (e) => setThreshold(Number(e.target.value)),
					children: [
						25,
						50,
						75,
						100
					].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value,
						children: [value, "% of output"]
					}, value))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs leading-5 text-muted",
				children: [
					"This threshold changes the diagnostic only. It does not configure a creator cap, rewrite preferences or rerank cards. Source policy: ",
					data.session.sources,
					" · discovery style: ",
					data.session.familiarity,
					" · length: ",
					data.session.length,
					". Positive weights: favorites ",
					data.weights?.favorite ?? 3,
					", likes ",
					data.weights?.like ?? 2,
					", topics ",
					data.weights?.topic ?? 1,
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				"data-report-findings": true,
				className: "mt-4 space-y-3 text-sm leading-6",
				children: summary.findings.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mr-2 rounded bg-bg px-2 py-1 text-xs font-medium",
					children: row.status === "review" ? "Review" : row.status === "constrained" ? "Limited by candidates" : row.status === "unknown" ? "Not fully measured" : row.kind === "concentration" ? "Below threshold" : "Within policy"
				}), row.text] }, row.kind))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs leading-5 text-muted",
				children: "Eligible alternatives are not a promise of equal relevance. This report measures output distribution, not demographic fairness. It retains at most two reports and twelve media keys per output in this tab. Public title names, creator names, prompts, paths, private titles and image data are never exported."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "secondary",
				className: "mt-4 min-h-11",
				onClick: download,
				children: [
					"Export ",
					entry.shelf,
					" fairness report"
				]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-2 text-sm text-muted",
				children: error
			})
		]
	});
}
/** Volatile discovery controls: no persistence, library mutation, room sharing or provider request. */
function createRecommendationSessionStore() {
	let snapshot = DEFAULT_RECOMMENDATION_SESSION;
	const listeners = /* @__PURE__ */ new Set();
	const apply = (raw) => {
		const next = normalizeRecommendationSession(raw);
		if (sameRecommendationSession(snapshot, next)) return false;
		snapshot = next;
		for (const listener of listeners) listener();
		return true;
	};
	return {
		getSnapshot: () => snapshot,
		subscribe(listener) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
		apply,
		reset: () => apply(DEFAULT_RECOMMENDATION_SESSION)
	};
}
var recommendationSessionStore = createRecommendationSessionStore();
var useRecommendationSession = () => (0, import_react.useSyncExternalStore)(recommendationSessionStore.subscribe, recommendationSessionStore.getSnapshot, () => DEFAULT_RECOMMENDATION_SESSION);
var selectClass = "mt-2 min-h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg";
function RecommendationSessionControl() {
	const active = useRecommendationSession(), [draft, setDraft] = (0, import_react.useState)(active), [message, setMessage] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => setDraft(active), [active]);
	const dirty = !sameRecommendationSession(draft, active), custom = !sameRecommendationSession(active, DEFAULT_RECOMMENDATION_SESSION);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		"data-recommendation-session": true,
		className: "mt-4 rounded-lg border border-border bg-elevated/40 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
				className: "min-h-11 cursor-pointer content-center text-sm font-medium text-fg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "size-4" }),
						"Tune this Guide session",
						custom && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-accent/15 px-2 py-1 text-xs text-accent",
							children: "Custom mix"
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-muted",
				children: "Temporary controls for Guide picks and questions. Kept while you navigate this app; reloading or Reset restores the defaults. Your saved tastes and other recommendation shelves stay unchanged."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4",
				onSubmit: (event) => {
					event.preventDefault();
					const changed = recommendationSessionStore.apply(draft);
					setMessage(changed ? "Session mix applied. Saved tastes are unchanged." : "This session mix is already applied.");
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 md:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-xs font-medium text-fg",
								children: ["Discovery style", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									"aria-label": "Guide discovery style",
									className: selectClass,
									value: draft.familiarity,
									onChange: (event) => setDraft({
										...draft,
										familiarity: event.target.value
									}),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "balanced",
											children: "Standard ranking"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "familiar",
											children: "More familiar"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "explore",
											children: "Explore beyond my tastes"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-xs font-medium text-fg",
								children: ["Recording length", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									"aria-label": "Guide recording length",
									className: selectClass,
									value: draft.length,
									onChange: (event) => setDraft({
										...draft,
										length: event.target.value
									}),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "any",
											children: "Any length, including unknown"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "short",
											children: "Up to 10 minutes"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "medium",
											children: "Over 10 minutes to 1 hour"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "long",
											children: "Over 1 hour"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-xs font-medium text-fg",
								children: ["Source mix", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									"aria-label": "Guide source mix",
									className: selectClass,
									value: draft.sources,
									onChange: (event) => setDraft({
										...draft,
										sources: event.target.value
									}),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "all",
											children: "All public sources"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "balanced",
											children: "Balance available sources"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "youtube",
											children: "YouTube only"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "twitch",
											children: "Twitch only"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "local",
											children: "Local library only"
										})
									]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs leading-5 text-muted",
						children: "Familiar boosts favorites, likes and shared saved content tags. Explore makes room for titles without those matches. Source balance alternates available sources and fills empty slots. Length filters exclude unknown durations and apply to recordings; live observations follow the source choice. Source names in questions must also fit your mix."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "min-h-11",
							children: "Apply session mix"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "secondary",
							className: "min-h-11",
							onClick: () => {
								setDraft(DEFAULT_RECOMMENDATION_SESSION);
								recommendationSessionStore.reset();
								setMessage("Guide session reset to standard ranking, any length and all public sources. Saved tastes are unchanged.");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Reset Guide session"]
						})]
					}),
					dirty && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						"data-session-draft": true,
						role: "status",
						className: "mt-3 text-xs text-accent",
						children: "Changes are waiting. Apply when ready; the current cards stay in place."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						"data-session-active": true,
						className: "mt-3 text-xs text-muted",
						children: [
							"Applied mix: ",
							active.familiarity,
							" · ",
							active.length,
							" length · ",
							active.sources,
							" sources."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						className: "mt-2 text-xs text-muted",
						children: message
					})
				]
			})
		]
	});
}
var guideClip = (value) => value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
function guideContentKey(raw) {
	const tag = raw.trim().toLowerCase().replace(/^keyword-/, "");
	if (!/^[\p{L}\p{N}][\p{L}\p{N} -]{1,63}$/u.test(tag) || /^(?:provider|creator|source|format|auto|sub|fetish|genre|meta|vision)-/.test(tag) || [
		"adult",
		"video",
		"videos",
		"youtube",
		"twitch",
		"shorts",
		"live",
		"clip",
		"clips",
		"vod",
		"upload"
	].includes(tag) || /^\d[\d -]+$/.test(tag)) return;
	return canonicalTopic(tag) ?? reviewedRankingTag(tag);
}
function guideContentTags(tags = []) {
	return [...new Set(tags.slice(0, 80).map(guideContentKey).filter((tag) => Boolean(tag)))];
}
function guideChoice(video, topic, creator = false) {
	if (topic && canonicalTopic(topic) === topic) return {
		scope: "topic",
		target: topic,
		label: topic
	};
	const target = creator && creatorRejectionTarget(video);
	if (target) return {
		scope: "creator",
		target,
		label: guideClip(video.remote?.channelName ?? "This local source")
	};
	return {
		scope: "title",
		target: titleRejectionTarget(video),
		label: guideClip(video.name)
	};
}
function guideNotices(input, video, penalty, exposure) {
	const notices = [];
	const rating = input.ratingOf?.(video.id), favorite = Boolean(input.favorites[video.id]), liked = Boolean(input.likes[video.id]);
	if (rating === 1) notices.push(favorite || liked ? "Your 1-star rating conflicts with a saved favorite or like. Review those choices if your taste changed." : "You recorded a 1-star rating for this title. This is not a positive preference signal.");
	const creatorFavorite = input.creatorIsFavorited?.(video.remote?.channelName ?? "");
	const matched = normalizeRejections(input.recommendationRejections).entries.some((row) => row.scope === "title" ? row.target === titleRejectionTarget(video) : row.scope === "creator" ? row.target === creatorRejectionTarget(video) : topicEvidenceForScan(video, input.tags[video.id]).some((link) => link.topic === row.target));
	if (penalty > 0) notices.push("A saved “less of this” choice lowers this title’s rank. It stays searchable.");
	else if (matched && (favorite || creatorFavorite)) notices.push("A saved favorite protects this title from your “less of this” choice. That choice applies when the favorite is removed.");
	else if (matched) notices.push("A matching topic choice is protected by your topic heart.");
	if (exposure > 0) notices.push("Recent recommendation exposure reduces repetition; it does not mean you watched this title.");
	return notices.slice(0, 3);
}
function personalGuideExplanation(input, video, matches, penalty, exposure) {
	const reasons = [];
	if (input.favorites[video.id]) reasons.push({
		id: "favorite",
		kind: "favorite",
		text: "You saved this title as a favorite.",
		feedback: guideChoice(video)
	});
	if (input.likes[video.id]) reasons.push({
		id: "like",
		kind: "like",
		text: "You liked this title.",
		feedback: guideChoice(video)
	});
	for (const [tag, encoded] of matches) {
		const origin = input.videos[Math.abs(encoded) - 1];
		if (!origin || origin.id === video.id) continue;
		const a = videoBridgeSource(origin), b = videoBridgeSource(video), bridge = a && b && a !== b ? {
			topic: tag,
			a,
			b
		} : void 0, keyOf = bridge ? bridgeTopic : guideContentKey, raw = (input.tags[video.id] ?? []).find((value) => keyOf(value) === tag) ?? tag, originTag = (input.tags[origin.id] ?? []).find((value) => keyOf(value) === tag) ?? tag, signal = encoded > 0 ? "favorite" : "like";
		reasons.push({
			id: "shared-tag:" + tag,
			kind: "shared-tag",
			bridge,
			text: "Shared saved content label “" + guideClip(raw) + "” with a title you " + (signal === "favorite" ? "saved" : "liked") + ".",
			field: "saved tag",
			quote: guideClip(raw),
			origin: {
				id: origin.id,
				title: guideClip(origin.name),
				tag: guideClip(originTag),
				signal
			},
			feedback: guideChoice(video, canonicalTopic(tag))
		});
		if (reasons.length >= 4) break;
	}
	if (!reasons.length) reasons.push({
		id: "discovery",
		kind: "discovery",
		text: "Available in your public library; no saved content preference matched.",
		field: "title",
		quote: guideClip(video.name),
		feedback: guideChoice(video)
	});
	return {
		basis: reasons[0]?.kind === "discovery" ? "discovery" : "preference",
		reasons,
		notices: guideNotices(input, video, penalty, exposure)
	};
}
function topicGuideReason(video, topic, tags) {
	const evidence = topicEvidenceForScan(video, tags).find((link) => link.topic === topic);
	if (!evidence) return;
	return {
		id: "topic:" + topic,
		kind: "topic",
		text: "Topic “" + topic + "” matches recorded content evidence.",
		field: evidence.saved ? "saved tag" : "content topic evidence",
		quote: guideClip(evidence.reason),
		feedback: guideChoice(video, topic)
	};
}
var createGuideOrigins = () => ({
	same: /* @__PURE__ */ new Map(),
	cross: /* @__PURE__ */ new Map()
});
function record(map, key, source, ordinal) {
	const slots = map.get(key) ?? {};
	if (slots[source] === void 0 || ordinal > 0 && slots[source] < 0) slots[source] = ordinal;
	map.set(key, slots);
}
function addGuideOrigins(input, video, index, origins, content = guideContentTags(input.tags[video.id])) {
	const source = videoBridgeSource(video);
	if (!source || !input.favorites[video.id] && !input.likes[video.id]) return false;
	let limited = false;
	const ordinal = input.favorites[video.id] ? index + 1 : -(index + 1);
	for (const key of content) {
		if (!origins.same.has(key) && origins.same.size >= 4096) {
			limited = true;
			continue;
		}
		record(origins.same, key, source, ordinal);
	}
	for (const raw of (input.tags[video.id] ?? []).slice(0, 80)) {
		const topic = bridgeTopic(raw);
		if (topic) record(origins.cross, topic, source, ordinal);
	}
	return limited;
}
/** Prefer within-source evidence. Only explicit canonical content topics can cross sources. */
function createGuideAffinity(input, origins) {
	const paused = bridgePolicy(input.bridgeSuppressions);
	return (video, visit) => {
		const source = videoBridgeSource(video);
		if (!source) return 0;
		let score = 0, crossTags;
		for (const key of guideContentTags(input.tags[video.id])) {
			let ordinal = origins.same.get(key)?.[source];
			if (ordinal === void 0 && origins.cross.has(key)) {
				crossTags ??= new Set((input.tags[video.id] ?? []).slice(0, 80).map(bridgeTopic).filter((topic) => Boolean(topic)));
				if (!crossTags.has(key)) continue;
				for (const candidateSource of [
					"local",
					"youtube",
					"twitch"
				]) {
					if (source === candidateSource || paused(key, source, candidateSource)) continue;
					const candidate = origins.cross.get(key)?.[candidateSource];
					if (candidate !== void 0 && (ordinal === void 0 || candidate > 0 && ordinal < 0)) ordinal = candidate;
				}
			}
			if (ordinal !== void 0) {
				score++;
				visit?.(key, ordinal);
			}
		}
		return score;
	};
}
function guideVisibility(input) {
	const publicTitle = publicVideoBoundary(input.folders), known = input.folders ? new Set(input.folders.map((folder) => folder.id)) : void 0;
	return (video) => (!input.provider || video.remote?.kind === input.provider) && publicTitle(video) && !input.hidden?.[video.id] && !input.unavailable?.[video.id] && !video.isSample && Boolean(video.remote || !known || known.has(video.folderId));
}
function guideConfirmedLive(video, now) {
	const remote = video.remote;
	if (!remote?.live || !["youtube", "twitch"].includes(remote.kind) || remote.liveUnconfirmed || remote.liveOfflineSince) return false;
	const observed = remote.observedAt ?? 0, maxAge = remote.kind === "twitch" ? LIBRARY_LIMITS.twitchLiveStateFreshnessMs : LIBRARY_LIMITS.youtubeLiveStateFreshnessMs;
	return observed > 0 && observed <= now + 5e3 && now - observed <= maxAge;
}
function guidePenalties(input, now) {
	const rejection = input.recommendationRejections?.entries.length ? createRejectionPenalty(input.recommendationRejections) : void 0, exposure = input.recommendationExposure?.entries.length ? createExposurePenalty(input.recommendationExposure, now) : void 0;
	return (video) => ({
		penalty: rejection?.(video, input.tags[video.id], {
			favorite: Boolean(input.favorites[video.id]),
			creatorFavorite: input.creatorIsFavorited?.(video.remote?.channelName ?? ""),
			tagIsLiked: input.tagIsLiked
		}) ?? 0,
		exposure: exposure?.(video, {
			favorite: Boolean(input.favorites[video.id]),
			liked: Boolean(input.likes[video.id]),
			creatorFavorite: input.creatorIsFavorited?.(video.remote?.channelName ?? ""),
			rating: input.ratingOf?.(video.id)
		}) ?? 0
	});
}
/** Twelve selected candidates, bounded source pools and 4,096 compact affinity ordinals. */
async function prepareGuide(input, seed, now, turn) {
	await turn();
	const weights = guideWeights(input.weights), distribution = createDistributionCollector(input.session, weights), tuning = normalizeRecommendationSession(input.session), allowed = guideVisibility(input), origins = createGuideOrigins(), watched = /* @__PURE__ */ new Map(), live = [], topicCounts = /* @__PURE__ */ new Map(), adjustments = guidePenalties(input, now);
	let favoriteCount = 0, likeCount = 0, tagCount = 0, publicCount = 0, candidateCount = 0, historyCount = 0, affinityLimited = false;
	await forEachCatalogSlice(input.history, (entry) => watched.set(entry.id, false), turn);
	await forEachCatalogSlice(input.videos, (video, index) => {
		if (!allowed(video)) return;
		publicCount++;
		if (watched.get(video.id) === false) {
			watched.set(video.id, true);
			historyCount++;
		}
		const content = guideContentTags(input.tags[video.id]);
		tagCount += content.length;
		if (input.favorites[video.id]) favoriteCount++;
		if (input.likes[video.id]) likeCount++;
		affinityLimited = addGuideOrigins(input, video, index, origins, content) || affinityLimited;
		if (!video.remote?.live && sessionAllows(video, tuning)) for (const link of topicEvidenceForScan(video, input.tags[video.id])) topicCounts.set(link.topic, (topicCounts.get(link.topic) ?? 0) + 1);
		if (video.remote?.kind === "twitch" && sessionAllows(video, tuning, true) && guideConfirmedLive(video, now)) live.push(video);
	}, turn);
	const affinity = createGuideAffinity(input, origins);
	const best = createSessionPicks(12, (a, b) => b.score - a.score || a.rank - b.rank || a.index - b.index, (row) => row.video, tuning);
	await forEachCatalogSlice(input.videos, (video, index) => {
		if (!allowed(video) || video.remote?.live || watched.has(video.id) || !sessionAllows(video, tuning)) return;
		candidateCount++;
		distribution.add(video);
		const reduced = adjustments(video), score = guidePersonalScore({
			favorite: Boolean(input.favorites[video.id]),
			like: Boolean(input.likes[video.id]),
			topics: affinity(video),
			...reduced
		}, weights, tuning);
		best.add({
			video,
			score,
			rank: guideTieRank(video.id, seed),
			index,
			...reduced
		});
	}, turn);
	await turn();
	const matches = best.finish(), explanations = Object.fromEntries(matches.map((row) => [row.video.id, personalGuideExplanation(input, row.video, (() => {
		const matches = [];
		affinity(row.video, (key, ordinal) => matches.push([key, ordinal]));
		return matches;
	})(), row.penalty, row.exposure)]));
	const choices = createBoundedPicks(8, (a, b) => b.count - a.count || a.topic.localeCompare(b.topic));
	for (const [topic, count] of topicCounts) choices.add({
		topic,
		count
	});
	const viewers = (video) => hasFreshViewerCount(video.remote, now) ? video.remote.viewers : 0;
	const orderedLive = await sortCatalogRows(live, (a, b) => viewers(b) - viewers(a), turn);
	return {
		distribution: distribution.finish(matches.map((row) => row.video), now, (id) => watched.has(id), input.recommendationExposure),
		picks: matches.map((row) => row.video),
		explanations,
		live: orderedLive,
		historyCount,
		favoriteCount,
		likeCount,
		tagCount,
		publicCount,
		candidateCount,
		preparedAt: now,
		topics: choices.finish(),
		affinityLimited,
		mode: !publicCount ? "empty" : matches.some((row) => explanations[row.video.id]?.basis === "preference") ? "personalized" : "discovery"
	};
}
/** Uses only the prepared short list. History exclusions never imply a completed watch. */
function guideAnswer(prompt, snapshot, _tags) {
	if (/\b(live|on air|streaming)\b/i.test(prompt) && snapshot.live.length) return "Live on your followed Twitch channels:\n" + snapshot.live.slice(0, 4).map((video, i) => i + 1 + ". " + (video.remote?.channelName ?? video.name) + (hasFreshViewerCount(video.remote, snapshot.preparedAt) ? " · " + video.remote?.viewers?.toLocaleString() + " viewers" : "")).join("\n") + "\n\nLive observations belong to this prepared snapshot. Open a card to watch.";
	return snapshot.picks.length ? "Local recommendations for “" + guideClip(prompt) + "”:\n" + snapshot.picks.slice(0, 3).map((video, i) => i + 1 + ". " + video.name + " — " + snapshot.explanations[video.id].reasons[0].text).join("\n") + "\n\nPrepared locally from eligible public fields; discovery picks are labeled separately." : snapshot.publicCount ? "No unrecorded recordings match this Guide session. Try a topic question, reset the Guide session, or change its source/length choices. Titles already in history are skipped." : "Add a few public titles, tags, likes, or favorites to prepare new picks. Titles already in history are skipped.";
}
var normalize = (value) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/^(?:keyword|topic|genre|creator)-/, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
var stop = new Set("who surprise random a an the i me my you your we our is are was were be been to of and or for on in at by with about some something anything find show give suggest recommend recommendations please want watch watching video videos title titles tag tags tonight next should could can would what which based fits favorites favorite liked likes library from more".split(" "));
async function answerGuideQuery(input, prompt, seed, now, turn) {
	await turn();
	const weights = guideWeights(input.weights), tuning = normalizeRecommendationSession(input.session), question = normalize(prompt.slice(0, 500)), liveIntent = /\b(live|on air|streaming)\b/.test(question), provider = /\byoutube\b/.test(question) ? "youtube" : /\btwitch\b/.test(question) ? "twitch" : input.provider;
	const scoped = {
		...input,
		provider
	}, tokens = [...new Set(question.split(" ").filter((word) => !stop.has(word) && ![
		"youtube",
		"twitch",
		"live",
		"streams",
		"streaming",
		"air"
	].includes(word)))].slice(0, 12), terms = [...new Set(tokens.map((word) => word === "funny" ? "comedy" : canonicalTopic(word) ?? word))];
	if (!terms.length && !liveIntent) {
		const snapshot = await prepareGuide(scoped, seed, now, turn);
		return {
			distribution: snapshot.distribution,
			text: guideAnswer(prompt, snapshot, input.tags),
			picks: snapshot.picks,
			explanations: snapshot.explanations,
			reasons: Object.fromEntries(snapshot.picks.map((video) => [video.id, snapshot.explanations[video.id].reasons.map((reason) => reason.text).join(" · ")]))
		};
	}
	const distribution = createDistributionCollector(input.session, weights), origins = createGuideOrigins();
	if (tuning.familiarity !== "balanced") {
		const signalAllowed = guideVisibility(input);
		await forEachCatalogSlice(input.videos, (video, index) => {
			if (signalAllowed(video)) addGuideOrigins(input, video, index, origins);
		}, turn);
	}
	const affinity = createGuideAffinity(input, origins), allowed = guideVisibility(scoped), seen = /* @__PURE__ */ new Set(), adjustments = guidePenalties(scoped, now), best = createSessionPicks(12, (a, b) => b.score - a.score || a.rank - b.rank || a.index - b.index, (row) => row.video, tuning);
	await forEachCatalogSlice(input.videos, (video, index) => {
		if (!allowed(video) || !sessionAllows(video, tuning, liveIntent) || (liveIntent ? !guideConfirmedLive(video, now) : video.remote?.live)) return;
		const key = video.remote?.videoId ? video.remote.kind + ":" + video.remote.videoId : video.id;
		if (seen.has(key)) return;
		const title = normalize(video.name.slice(0, 1e3)), creator = normalize(video.remote?.channelName ?? ""), tags = (input.tags[video.id] ?? []).slice(0, 80), genre = normalize(video.genre ?? "");
		let matched = 0, score = 0;
		const evidence = [];
		for (const term of terms) {
			let reason;
			if (title.includes(term)) {
				matched++;
				score += 8;
				reason = {
					id: "title:" + term,
					kind: "title",
					text: "Title matches “" + term + "”.",
					field: "title",
					quote: guideClip(video.name),
					feedback: guideChoice(video)
				};
			} else {
				const raw = tags.find((tag) => normalize(tag) === term || normalize(tag).split(" ").includes(term));
				if (raw) {
					matched++;
					score += 10;
					reason = {
						id: "tag:" + term,
						kind: "saved-tag",
						text: "Saved tag matches “" + term + "”.",
						field: "saved tag",
						quote: guideClip(raw),
						feedback: guideChoice(video, canonicalTopic(raw))
					};
				} else if (creator.includes(term)) {
					matched++;
					score += 5;
					reason = {
						id: "creator:" + term,
						kind: "creator",
						text: "Saved creator field matches “" + term + "”.",
						field: "creator",
						quote: guideClip(video.remote?.channelName ?? ""),
						feedback: guideChoice(video, void 0, true)
					};
				} else if (genre.includes(term)) {
					matched++;
					score += 5;
					reason = {
						id: "category:" + term,
						kind: "category",
						text: "Saved category matches “" + term + "”.",
						field: "category",
						quote: guideClip(video.genre ?? ""),
						feedback: guideChoice(video, canonicalTopic(video.genre ?? ""))
					};
				} else {
					const topic = canonicalTopic(term);
					if (topic && hasTopicForScan(video, topic, input.tags[video.id])) {
						matched++;
						score += 4;
						reason = topicGuideReason(video, topic, input.tags[video.id]);
					}
				}
			}
			if (reason && evidence.length < 4) evidence.push(reason);
		}
		if (terms.length && matched < terms.length) return;
		seen.add(key);
		distribution.add(video);
		if (liveIntent) {
			if (evidence.length === 4) evidence.pop();
			evidence.push({
				id: "live",
				kind: "live",
				text: "A recent provider observation confirms live status in this snapshot.",
				field: "live observation",
				quote: new Date(video.remote.observedAt).toISOString(),
				feedback: guideChoice(video)
			});
		}
		const reduced = adjustments(video), direct = guidePositive(Boolean(input.favorites[video.id]), Boolean(input.likes[video.id]), 0, weights);
		const preference = direct + (tuning.familiarity === "balanced" ? 0 : affinity(video) * weights.topic);
		score += direct + sessionPreferenceAdjustment(preference, tuning);
		best.add({
			video,
			index,
			score: score - reduced.penalty - reduced.exposure,
			rank: guideTieRank(video.id, seed),
			evidence,
			...reduced
		});
	}, turn);
	const matches = best.finish(), explanations = Object.fromEntries(matches.map((row) => [row.video.id, {
		basis: liveIntent ? "live" : "query",
		reasons: row.evidence,
		notices: guideNotices(scoped, row.video, row.penalty, row.exposure)
	}]));
	const selectedIds = new Set(matches.map((row) => row.video.id)), recorded = /* @__PURE__ */ new Set();
	await forEachCatalogSlice(input.history, (row) => {
		if (selectedIds.has(row.id)) recorded.add(row.id);
	}, turn);
	return {
		distribution: distribution.finish(matches.map((row) => row.video), now, (id) => recorded.has(id), input.recommendationExposure),
		picks: matches.map((row) => row.video),
		explanations,
		reasons: Object.fromEntries(matches.map((row) => [row.video.id, row.evidence.map((reason) => reason.text + (reason.quote ? " " + reason.quote : "")).join(" · ")])),
		text: matches.length ? (liveIntent ? "Recently confirmed live matches" : "Library matches") + " for “" + guideClip(prompt) + "” · " + matches.length + " shown. These match saved fields; no model wording is used." : liveIntent ? "No fresh live observation matches that question and this session’s source choices. Reset the Guide session or use the Live page to check current status." : "No eligible public titles or saved tags match that question and this session’s source/length choices. Try a title, creator, one of the available topics, or reset the Guide session."
	};
}
//#endregion
export { addGuideOrigins as a, createGuideOrigins as c, prepareGuide as d, summarizeDistribution as f, RecommendationSessionControl as i, guidePenalties as l, REPORT_SOURCES as n, answerGuideQuery as o, useRecommendationSession as p, RecommendationReports as r, createGuideAffinity as s, GuideOutputReport as t, guideVisibility as u };
