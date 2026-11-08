import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-BBe1bZ7q.mjs";
import { Jr as normalizeRecommendationSession, La as sameRecommendationSession, a as DEFAULT_RECOMMENDATION_SESSION } from "./persist-BKzTZjAH.mjs";
import { C as SlidersHorizontal, F as RotateCcw } from "../_libs/lucide-react.mjs";
import { Dt as summarizeDistribution, St as distributionExport, Tt as normalizeGuideDiversity, fn as useLibrary, gt as DEFAULT_GUIDE_DIVERSITY } from "./library-app-B2g2Od4o.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recommendation-session-control-s_9CoCcx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function createGuideDiversitySession() {
	let snapshot = DEFAULT_GUIDE_DIVERSITY;
	const listeners = /* @__PURE__ */ new Set();
	const apply = (raw) => {
		const next = normalizeGuideDiversity(raw);
		if (JSON.stringify(next) === JSON.stringify(snapshot)) return;
		snapshot = next;
		for (const fn of listeners) fn();
	};
	return {
		getSnapshot: () => snapshot,
		subscribe(fn) {
			listeners.add(fn);
			return () => {
				listeners.delete(fn);
			};
		},
		apply,
		reset: () => apply(DEFAULT_GUIDE_DIVERSITY)
	};
}
/** Document-local choices are intentionally absent from persistent profile settings and room messages. */
var guideDiversitySession = createGuideDiversitySession();
var useGuideDiversity = () => (0, import_react.useSyncExternalStore)(guideDiversitySession.subscribe, guideDiversitySession.getSnapshot, () => DEFAULT_GUIDE_DIVERSITY);
function GuideDiversityControl() {
	const active = useGuideDiversity(), [draft, setDraft] = (0, import_react.useState)(active), [note, setNote] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => setDraft(active), [active]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		"data-guide-diversity-control": true,
		className: "mt-4 rounded-lg border border-border bg-elevated/40 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
				className: "min-h-11 cursor-pointer content-center text-sm font-medium text-fg",
				children: "Optional shelf diversity"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-muted",
				children: "Temporary floors for public Guide picks and questions. Defaults preserve standard ranking. These choices stay in this tab while navigating; reload or Reset clears them. Desk preferences and other provider shelves are unchanged."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 space-y-4",
				onSubmit: (e) => {
					e.preventDefault();
					guideDiversitySession.apply(draft);
					setNote("Diversity choices applied. The next prepared output reports the actual result.");
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 md:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-sm text-fg",
								children: ["Maximum identified creator share", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									"aria-label": "Maximum Guide creator share",
									className: "mt-2 min-h-11 w-full rounded-md border border-border bg-bg px-3 text-fg",
									value: draft.creatorPercent,
									onChange: (e) => setDraft({
										...draft,
										creatorPercent: Number(e.target.value)
									}),
									children: [
										100,
										75,
										50
									].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: n,
										children: n === 100 ? "No creator cap" : n + "% of output"
									}, n))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-sm text-fg",
								children: ["Minimum public sources", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									"aria-label": "Minimum Guide sources",
									className: "mt-2 min-h-11 w-full rounded-md border border-border bg-bg px-3 text-fg",
									value: draft.minSources,
									onChange: (e) => setDraft({
										...draft,
										minSources: Number(e.target.value)
									}),
									children: [
										1,
										2,
										3
									].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: n,
										children: n === 1 ? "No additional source floor" : n + " available sources"
									}, n))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-sm text-fg",
								children: ["Publication age floor", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									"aria-label": "Guide older publication floor",
									className: "mt-2 min-h-11 w-full rounded-md border border-border bg-bg px-3 text-fg",
									value: draft.olderSlots,
									onChange: (e) => setDraft({
										...draft,
										olderSlots: Number(e.target.value)
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: 0,
										children: "No publication age floor"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: 2,
										children: "Two recordings at least 365 days old"
									})]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-5 text-muted",
						children: "Eligibility, your query and source/length filters apply first. Active diversity mixes exclude explicit “less of this” rank reductions, retain balanced-source slot quotas, and may trade score for variety. Missing creator credits and publication dates stay unknown. At most 64 creator groups supply alternatives; failure to meet a floor does not prove it is impossible in the full library."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "min-h-11",
							children: "Apply diversity floors"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							className: "min-h-11",
							onClick: () => {
								guideDiversitySession.reset();
								setDraft(DEFAULT_GUIDE_DIVERSITY);
								setNote("Diversity floors reset. Standard ranking is active.");
							},
							children: "Reset diversity floors"
						})]
					}),
					JSON.stringify(draft) !== JSON.stringify(active) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						className: "text-xs text-accent",
						children: "Unapplied diversity changes. Current cards keep their applied choices."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						"data-diversity-active": true,
						className: "text-xs text-muted",
						children: [
							"Applied: creator ",
							active.creatorPercent,
							"% · ",
							active.minSources,
							" source(s) ·",
							" ",
							active.olderSlots,
							" older recording(s)."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						className: "text-xs text-muted",
						children: note
					})
				]
			})
		]
	});
}
function GuideDiversitySummary({ report }) {
	return report ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-guide-diversity-result": true,
		className: "mt-4 space-y-2 rounded-lg border border-border bg-surface p-3",
		"aria-label": "Applied diversity result",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm font-medium text-fg",
				children: [
					report.met ? "Diversity floors met" : "Diversity floors limited or unverified",
					" ·",
					" ",
					report.shown,
					" shown"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs leading-5 text-muted",
				children: [
					"Creator limit ",
					report.creatorCap,
					" per identified creator (",
					report.config.creatorPercent,
					"%) ·",
					" ",
					report.sources,
					"/",
					report.config.minSources,
					" sources · ",
					report.older,
					"/",
					report.config.olderSlots,
					" older recordings. ",
					report.unknownCreators,
					" output slots lack creator credits."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs leading-5 text-muted",
				children: [
					"Publication evidence: available older ",
					report.availableAge.older,
					", recent",
					" ",
					report.availableAge.recent,
					", unknown ",
					report.availableAge.unknown,
					"; selected older",
					" ",
					report.selectedAge.older,
					", recent ",
					report.selectedAge.recent,
					", unknown",
					" ",
					report.selectedAge.unknown,
					". Older means at least 365 days before this snapshot.",
					" ",
					report.pooled,
					" retained alternative rows; no full-library feasibility claim."
				]
			}),
			report.notices.map((text) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-5 text-muted",
				children: text
			}, text))
		]
	}) : null;
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
	return entry ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuideDiversitySummary, { report: distribution.diversity }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OutputReport, { entry })] }) : null;
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
			data.publicationAge && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				"data-report-age": true,
				className: "mt-3 text-xs leading-5 text-muted",
				children: [
					"Selected publication age: ",
					data.publicationAge.older,
					" at least 365 days old · ",
					data.publicationAge.recent,
					" recent · ",
					data.publicationAge.unknown,
					" unknown or uncertain. Publication evidence never falls back to a local download clock."
				]
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
//#endregion
export { useGuideDiversity as a, RecommendationSessionControl as i, GuideOutputReport as n, useRecommendationSession as o, RecommendationReports as r, GuideDiversityControl as t };
