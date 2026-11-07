import { o as __toESM } from "../_runtime.mjs";
import { I as forEachCatalogSlice } from "./twitch-retry-C3xxOucA.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-BBe1bZ7q.mjs";
import { t as createLocalId } from "./local-id-CsDq4efR.mjs";
import { B as animeTitleInfo, Lo as undoAnimeReview, Rr as nextAnimeEpisode, Ut as confirmAnimeEpisode, Xi as removeAnimeMapping, bo as setAnimeRange, ci as preferAnimeVersion, ct as buildAnimeEpisodeMap, en as editAnimeSeries, hr as lookupVideo, yo as setAnimePolicy, z as animeReviewVisibility } from "./persist-BhJ4449E.mjs";
import { G as reviewedDocument, _t as catalogTurn, dt as useBrowseLibrary, ft as useSessionPhase, ln as useLibrary, nn as resumeForVideo, pn as Input, tt as useReviewedDocument } from "./library-app-3PBwf-4D.mjs";
import { a as hydrateAnimeReviews, i as getServerAnimeReviews, n as changeAnimeReviews, o as retryAnimeReviewSave, r as getAnimeReviews, s as subscribeAnimeReviews } from "./anime-review-store-rw9u9lp6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/anime-review-AK2RMpFS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var emptySeriesProgress = () => ({
	version: 1,
	series: {}
});
var validId = (s) => /^anime:[a-z0-9-]{1,80}$/i.test(s);
var validSlot = (s) => /^(?:absolute|season:\d{1,3}):(?:episode|special|ova):\d{1,5}$/.test(s);
function tracking(r) {
	if (!r || Object.keys(r).some((k) => !["resetAt", "decisions"].includes(k)) || !r.decisions || Array.isArray(r.decisions) || typeof r.decisions !== "object" || Object.keys(r.decisions).length > 200 || Object.entries(r.decisions).some(([k, v]) => !validSlot(k) || typeof v !== "boolean") || r.resetAt !== void 0 && (!Number.isSafeInteger(r.resetAt) || r.resetAt < 0)) throw Error("Invalid series tracking decisions.");
	return {
		decisions: { ...r.decisions },
		...r.resetAt !== void 0 ? { resetAt: r.resetAt } : {}
	};
}
function parseSeriesProgress(raw) {
	const r = raw;
	if (!r || r.version !== 1 || Object.keys(r).some((k) => ![
		"version",
		"series",
		"undo"
	].includes(k)) || !r.series || Array.isArray(r.series) || typeof r.series !== "object" || Object.keys(r.series).length > 64 || Object.keys(r.series).some((k) => !validId(k))) throw Error("Unsupported series progress settings. Existing decisions were kept.");
	const series = Object.fromEntries(Object.entries(r.series).map(([k, v]) => [k, tracking(v)]));
	if (Object.values(series).reduce((n, s) => n + Object.keys(s.decisions).length, 0) > 512) throw Error("Keep at most 512 episode decisions across 64 series.");
	const undo = r.undo;
	if (undo && (!validId(undo.id) || undo.before !== null && !undo.before)) throw Error("Invalid series progress undo.");
	return {
		version: 1,
		series,
		...undo ? { undo: {
			id: undo.id,
			before: undo.before === null ? null : tracking(undo.before)
		} } : {}
	};
}
function changeSeriesProgress(state, id, change, known) {
	if (!validId(id)) throw Error("Review the series identity first.");
	const old = state.series[id], before = old ?? null;
	let next;
	if (change.kind === "reset") {
		if (!Number.isSafeInteger(change.at) || change.at < 0) throw Error("Invalid reset time.");
		next = {
			resetAt: change.at,
			decisions: {}
		};
	} else {
		if (!known.includes(change.slot) || !validSlot(change.slot)) throw Error("Only an existing reviewed episode can be corrected.");
		const decisions = { ...old?.decisions };
		if (change.value === void 0) delete decisions[change.slot];
		else decisions[change.slot] = change.value;
		next = {
			...old,
			decisions
		};
	}
	return parseSeriesProgress({
		...state,
		series: {
			...state.series,
			[id]: next
		},
		undo: {
			id,
			before
		}
	});
}
function undoSeriesProgress(state) {
	if (!state.undo) return state;
	const { id, before } = state.undo, series = { ...state.series }, previous = series[id] ?? null;
	if (before) series[id] = before;
	else delete series[id];
	return parseSeriesProgress({
		version: 1,
		series,
		undo: {
			id,
			before: previous
		}
	});
}
function slotProgress(slot, series, tracked) {
	const decision = tracked?.decisions[slot.key];
	if (decision !== void 0) return {
		complete: decision,
		origin: "owner decision"
	};
	const complete = slot.versions.some((v) => {
		const p = v.resume;
		return p && Number.isFinite(p.t) && Number.isFinite(p.d) && Number.isFinite(p.at) && p.d > 0 && p.t >= 2 && p.at > (tracked?.resetAt ?? -1) && p.t / p.d >= series.policy.threshold;
	});
	return {
		complete: Boolean(complete),
		origin: "playback evidence"
	};
}
function summarizeSeriesProgress(series, map, tracked) {
	const slots = map.numbered.filter((s) => s.numbering === series.policy.numbering), lanes = map.lanes.filter((l) => l.numbering === series.policy.numbering);
	return {
		known: slots.length,
		complete: slots.filter((s) => slotProgress(s, series, tracked).complete).length,
		missing: lanes.reduce((n, l) => n + l.slots.filter((s) => !s.versions.length).length, 0),
		uncertain: lanes.some((l) => l.unverified),
		unavailable: slots.filter((s) => !s.versions.some((v) => v.available)).length,
		otherNumbering: map.numbered.length - slots.length,
		unresolved: map.unresolved.length,
		specials: map.specials.length
	};
}
function nextTrackedAnimeEpisode(series, map, tracked) {
	if (!tracked) return nextAnimeEpisode(series, map);
	const slots = [...map.numbered, ...series.policy.specials ? map.specials : []].filter((s) => s.numbering === series.policy.numbering);
	for (const slot of slots) {
		if (slotProgress(slot, series, tracked).complete) continue;
		const available = slot.versions.filter((v) => v.available), version = available.find((v) => v.review.preferred) ?? available[0];
		if (version) return {
			slot,
			version,
			resume: false,
			skip: 0,
			reason: "First incomplete available episode under your series tracking decisions. Source playback positions are retained; opening a title does not erase its resume mark."
		};
	}
	return {
		resume: false,
		skip: 0,
		reason: "No incomplete available reviewed episode remains in this numbering lane. Missing or unresolved entries are not marked watched."
	};
}
var seriesProgress = reviewedDocument("reelcase.series-progress.v1", emptySeriesProgress, parseSeriesProgress);
function SeriesProgressPanel({ series, map }) {
	const state = useReviewedDocument(seriesProgress), [open, setOpen] = (0, import_react.useState)(false), [page, setPage] = (0, import_react.useState)(0), [confirmed, setConfirmed] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)(""), [notice, setNotice] = (0, import_react.useState)(""), tracked = state.data.series[series.id], summary = summarizeSeriesProgress(series, map, tracked), slots = map.numbered.filter((s) => s.numbering === series.policy.numbering), offset = Math.min(page * 10, Math.max(0, Math.ceil(slots.length / 10) - 1) * 10), known = [...map.numbered, ...map.specials].map((s) => s.key);
	const run = (fn, note) => {
		try {
			fn();
			setError("");
			setNotice(note);
			setConfirmed(false);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Series tracking could not be saved.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-series-progress": series.id,
		className: "mt-4 rounded-lg border border-border bg-bg p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
				className: "text-lg font-medium text-fg",
				children: "Series progress"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-2 text-sm text-fg",
				children: state.ready ? `${summary.complete} / ${summary.known} known episodes tracked as watched` : "Loading saved series decisions…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: [
					summary.missing,
					" absent slots · ",
					summary.unavailable,
					" known episodes need a source reconnected · ",
					summary.otherNumbering,
					" entries in another numbering lane ·",
					" ",
					summary.unresolved,
					" unresolved sources · ",
					summary.specials,
					" specials/OVAs kept separate",
					summary.uncertain ? " · expected range unverified" : "",
					". Numbering:",
					" ",
					series.policy.numbering,
					". Duplicate versions count once; missing entries are never marked watched."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "mt-3",
				onToggle: (e) => setOpen(e.currentTarget.open),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
					className: "min-h-11 cursor-pointer content-center text-sm font-medium text-fg",
					children: "Correct or reset series tracking"
				}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm leading-6 text-muted",
						children: [
							"Playback evidence uses this series’ completion threshold (",
							Math.round(series.policy.threshold * 100),
							"%). Owner corrections override only series tracking. Reset ignores older playback evidence for this series; future playback can count again. Original resume positions, ratings, tags and watch history stay intact."
						]
					}),
					slots.slice(offset, offset + 10).map((slot) => {
						const p = slotProgress(slot, series, tracked), choice = tracked?.decisions[slot.key];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							"data-series-progress-slot": slot.key,
							className: "mt-3 grid min-w-0 gap-2 rounded-md border border-border p-3 text-sm sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								slot.numbering === "absolute" ? "Absolute" : "Season " + slot.season,
								" · Episode",
								" ",
								slot.episode,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mt-1 block text-xs text-muted",
									children: [
										p.complete ? "Watched" : "Incomplete",
										" · ",
										p.origin,
										" · ",
										slot.versions.length,
										" ",
										"version(s)"
									]
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "min-h-11 min-w-0 rounded-md border border-border bg-surface px-3 text-sm text-fg",
								"aria-label": "Series decision " + slot.key,
								value: choice === void 0 ? "evidence" : choice ? "watched" : "unwatched",
								disabled: !state.ready || Boolean(state.error),
								onChange: (e) => run(() => seriesProgress.write(changeSeriesProgress(state.data, series.id, {
									kind: "decision",
									slot: slot.key,
									value: e.target.value === "evidence" ? void 0 : e.target.value === "watched"
								}, known)), "Series correction saved. Playback marks were retained."),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "evidence",
										children: "Use playback evidence"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "watched",
										children: "Owner: watched"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "unwatched",
										children: "Owner: not watched"
									})
								]
							})]
						}, slot.key);
					}),
					slots.length > 10 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							disabled: !offset,
							onClick: () => setPage(offset / 10 - 1),
							children: "Previous tracked episodes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							disabled: offset + 10 >= slots.length,
							onClick: () => setPage(offset / 10 + 1),
							children: "Next tracked episodes"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-4 flex min-h-11 items-center gap-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								"aria-label": "I want to reset only this series tracking",
								checked: confirmed,
								onChange: (e) => setConfirmed(e.target.checked)
							}),
							"Reset tracking for ",
							series.title,
							"; keep source playback history and positions."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								disabled: !confirmed || !state.ready || Boolean(state.error),
								onClick: () => run(() => seriesProgress.write(changeSeriesProgress(state.data, series.id, {
									kind: "reset",
									at: Date.now()
								}, known)), "Series tracking reset saved. Undo remains available after reload."),
								children: "Reset this series tracking"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								disabled: state.data.undo?.id !== series.id || !state.ready || Boolean(state.error),
								onClick: () => run(() => seriesProgress.write(undoSeriesProgress(state.data)), "Previous series tracking restored."),
								children: "Undo series tracking change"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => {
									seriesProgress.reload();
									setError("");
									setNotice("Saved series tracking reloaded.");
								},
								children: "Reload series tracking"
							})
						]
					})
				] })]
			}),
			tracked?.resetAt !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-muted",
				children: [
					"Playback evidence at or before ",
					new Date(tracked.resetAt).toLocaleString(),
					" is ignored for this series summary."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-2 text-xs text-muted",
				children: notice
			}),
			(error || state.error) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-2 text-sm text-danger",
				children: error || state.error
			})
		]
	});
}
function useAnimeReviews(active = true) {
	const snapshot = (0, import_react.useSyncExternalStore)(subscribeAnimeReviews, active ? getAnimeReviews : getServerAnimeReviews, getServerAnimeReviews);
	(0, import_react.useEffect)(() => {
		if (active) hydrateAnimeReviews();
	}, [active]);
	return snapshot;
}
var selectClass = "mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg";
var aliases = (value) => value.split(";").map((v) => v.trim()).filter(Boolean);
function useAnimeScope() {
	const folders = useLibrary((s) => s.folders), hidden = useLibrary((s) => s.hiddenVideos), unavailable = useLibrary((s) => s.unavailable);
	return {
		visible: (0, import_react.useMemo)(() => animeReviewVisibility({
			folders,
			hidden,
			unavailable
		}), [
			folders,
			hidden,
			unavailable
		]),
		availableFolders: (0, import_react.useMemo)(() => new Set(folders.filter((f) => !f.adult && !f.needsPermission).map((f) => f.id)), [folders])
	};
}
function AnimeSaveControls() {
	const state = useAnimeReviews(), [error, setError] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 border-t border-border pt-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "min-h-11 max-w-full whitespace-normal",
					disabled: !state.ready || !state.ledger.undo,
					onClick: () => {
						try {
							changeAnimeReviews(undoAnimeReview);
							setError("");
						} catch (e) {
							setError(e instanceof Error ? e.message : "Undo failed.");
						}
					},
					children: "Undo last anime review change"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "text-xs text-muted",
					children: state.status === "pending" ? "Saving anime reviews…" : state.ledger.action ?? "No anime reviews saved yet."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: "Undo swaps the latest review change. Original files, tags, ratings and version-specific progress are retained."
			}),
			state.status === "failed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "alert",
				className: "mt-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Anime reviews work for this session, but browser storage could not save them." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-2 min-h-11",
					variant: "secondary",
					onClick: retryAnimeReviewSave,
					children: "Retry saving anime reviews"
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-2 text-sm",
				children: error
			})
		]
	});
}
function AnimeReviewEntry({ video }) {
	const [open, setOpen] = (0, import_react.useState)(false), { visible } = useAnimeScope();
	if (!visible(video)) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		className: "mt-4 rounded-lg border border-border p-3",
		onToggle: (e) => setOpen(e.currentTarget.open),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
			className: "min-h-11 cursor-pointer content-center text-sm font-medium text-fg",
			children: "Review anime series and episode"
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimeReviewPanel, { video }, video.id)]
	});
}
function AnimeReviewPanel({ video, seriesOptions = [] }) {
	const state = useAnimeReviews(), { visible } = useAnimeScope(), evidence = animeTitleInfo(video.name), mapping = state.ledger.episodes[video.id], reviewed = mapping && state.ledger.series[mapping.seriesId];
	const [choice, setChoice] = (0, import_react.useState)(() => ({
		existing: mapping?.seriesId ?? "",
		title: reviewed?.title ?? evidence.series,
		release: reviewed?.release ?? "",
		aliases: reviewed?.aliases.join("; ") ?? "",
		numbering: mapping?.numbering ?? "season",
		season: String(mapping?.season || evidence.season),
		episode: String(mapping?.episode ?? evidence.episode ?? ""),
		kind: mapping?.kind ?? (evidence.format === "special" ? "special" : evidence.episode ? "episode" : "unresolved")
	})), [confirmed, setConfirmed] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)(""), [note, setNote] = (0, import_react.useState)("");
	const update = (field, value) => {
		setChoice((p) => ({
			...p,
			[field]: value
		}));
		setConfirmed(false);
		setNote("");
		setError("");
	};
	const options = (0, import_react.useMemo)(() => {
		const all = new Map(seriesOptions.map((s) => [s.id, s]));
		if (reviewed) all.set(reviewed.id, reviewed);
		return [...all.values()].filter((s) => s.id === choice.existing || `${s.title} ${s.release} ${s.aliases.join(" ")}`.toLowerCase().includes(choice.title.trim().toLowerCase())).slice(0, 50);
	}, [
		seriesOptions,
		reviewed,
		choice.existing,
		choice.title
	]);
	if (!visible(video)) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-anime-review": video.id,
		className: "mt-4 min-w-0 rounded-lg bg-elevated p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-xl text-fg",
				children: "Confirm an anime source"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 break-words text-sm text-muted",
				children: ["Original source: ", video.name]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: [
					reviewed ? `Owner-reviewed series: ${reviewed.title} · ${reviewed.release}` : "Identity unverified. Parsed names and numbers are proposals only.",
					" Parsed evidence: ",
					evidence.series,
					" · season ",
					evidence.season,
					" · ",
					evidence.episode === void 0 ? "episode unresolved" : "episode " + evidence.episode,
					" · ",
					evidence.format,
					". No external anime database is connected."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm text-muted",
						children: ["Series title", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"aria-label": "Reviewed anime title",
							className: "mt-1",
							maxLength: 160,
							value: choice.title,
							onChange: (e) => update("title", e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm text-muted",
						children: ["Release / sequel label", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"aria-label": "Reviewed anime release",
							className: "mt-1",
							placeholder: "1998 original, 2024 remake, sequel…",
							maxLength: 80,
							disabled: !!choice.existing,
							value: choice.existing ? state.ledger.series[choice.existing]?.release ?? "" : choice.release,
							onChange: (e) => update("release", e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm text-muted sm:col-span-2",
						children: ["Choose an identity", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							"aria-label": "Reviewed anime identity",
							className: selectClass,
							value: choice.existing,
							onChange: (e) => update("existing", e.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Create a separate reviewed series"
							}), options.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: s.id,
								children: [
									s.title,
									" · ",
									s.release
								]
							}, s.id))]
						})]
					}),
					!choice.existing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm text-muted sm:col-span-2",
						children: ["Aliases (separate with semicolons, up to 12)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"aria-label": "Reviewed anime aliases",
							className: "mt-1",
							maxLength: 1900,
							value: choice.aliases,
							onChange: (e) => update("aliases", e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm text-muted",
						children: ["Numbering", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							"aria-label": "Anime episode numbering",
							className: selectClass,
							value: choice.numbering,
							onChange: (e) => update("numbering", e.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "season",
								children: "Season and episode"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "absolute",
								children: "Absolute episode number"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm text-muted",
						children: ["Source type", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							"aria-label": "Reviewed anime source type",
							className: selectClass,
							value: choice.kind,
							onChange: (e) => update("kind", e.target.value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "episode",
									children: "Numbered episode"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "special",
									children: "Special"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "ova",
									children: "OVA / ONA"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "unresolved",
									children: "Unresolved number"
								})
							]
						})]
					}),
					choice.numbering === "season" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm text-muted",
						children: ["Season", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"aria-label": "Reviewed anime season",
							className: "mt-1",
							type: "number",
							min: 1,
							max: 100,
							value: choice.season,
							onChange: (e) => update("season", e.target.value)
						})]
					}),
					choice.kind !== "unresolved" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm text-muted",
						children: [
							"Episode ",
							choice.kind === "episode" ? "" : "(optional for specials)",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								"aria-label": "Reviewed anime episode",
								className: "mt-1",
								type: "number",
								min: 1,
								max: 1e4,
								value: choice.episode,
								onChange: (e) => update("episode", e.target.value)
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs leading-5 text-muted",
				children: "The preview above remains unverified until you approve this mapping. An existing identity uses its saved labels; edit them in the episode map. Aliases help you find candidates; they never merge sources automatically. Absolute and season numbers remain separate unless you explicitly remap a source."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-3 flex min-h-11 items-start gap-3 text-sm text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "mt-1",
					type: "checkbox",
					"aria-label": "Confirm anime identity and episode mapping",
					checked: confirmed,
					onChange: (e) => setConfirmed(e.target.checked)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "I checked the series, release, source type and episode numbering for this source." })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "min-h-11 max-w-full whitespace-normal",
					disabled: !state.ready || !confirmed,
					onClick: () => {
						try {
							const seriesId = choice.existing || createLocalId("anime:");
							changeAnimeReviews((l) => confirmAnimeEpisode(l, video.id, {
								seriesId,
								title: choice.title,
								release: choice.release,
								aliases: aliases(choice.aliases),
								existing: !!choice.existing,
								numbering: choice.numbering,
								season: choice.numbering === "absolute" ? 0 : Number(choice.season),
								kind: choice.kind,
								episode: choice.kind === "unresolved" || !choice.episode ? void 0 : Number(choice.episode)
							}));
							setChoice((p) => ({
								...p,
								existing: seriesId
							}));
							setConfirmed(false);
							setError("");
							setNote("Anime mapping saved. The source and its progress were retained.");
						} catch (e) {
							setError(e instanceof Error ? e.message : "Could not confirm anime source.");
						}
					},
					children: "Confirm anime identity and episode"
				}), mapping && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "min-h-11 max-w-full whitespace-normal",
					variant: "secondary",
					onClick: () => {
						changeAnimeReviews((l) => removeAnimeMapping(l, video.id));
						setChoice((p) => ({
							...p,
							existing: "",
							release: reviewed?.release ?? ""
						}));
						setConfirmed(false);
						setNote("Review action completed; original source and progress retained.");
					},
					children: "Remove this episode mapping"
				})]
			}),
			note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "mt-3 text-sm text-muted",
				children: note
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-3 text-sm text-fg",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimeSaveControls, {})
		]
	});
}
function AnimeReviewDesk({ index }) {
	const state = useAnimeReviews(), videos = useBrowseLibrary((s) => s.videos), phase = useSessionPhase(), viewer = useLibrary((s) => Boolean(s.activeId || s.previewId)), { visible } = useAnimeScope();
	const [query, setQuery] = (0, import_react.useState)(""), [matches, setMatches] = (0, import_react.useState)(), [target, setTarget] = (0, import_react.useState)(), [busy, setBusy] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)(""), [page, setPage] = (0, import_react.useState)(0), [selectedSeries, setSelectedSeries] = (0, import_react.useState)(""), request = (0, import_react.useRef)(void 0);
	(0, import_react.useEffect)(() => {
		request.current?.abort();
		setBusy(false);
		setMatches(void 0);
		return () => request.current?.abort();
	}, [
		videos,
		visible,
		phase,
		viewer,
		state.ledger
	]);
	const groups = index?.reviewedGroups ?? [], options = groups.flatMap((g) => state.ledger.series[g.id] ? [state.ledger.series[g.id]] : []), selected = lookupVideo(videos, target ?? null), group = groups.find((g) => g.id === selectedSeries), offset = Math.min(page * 4, Math.max(0, Math.ceil(groups.length / 4) - 1) * 4);
	const search = async () => {
		request.current?.abort();
		const controller = new AbortController();
		request.current = controller;
		setBusy(true);
		setError("");
		try {
			if (query.trim().length < 2) throw Error("Enter at least two title characters.");
			const rows = [], needle = query.trim().toLowerCase();
			await forEachCatalogSlice(videos, (v) => {
				const e = state.ledger.episodes[v.id], s = e && state.ledger.series[e.seriesId];
				if (rows.length < 24 && visible(v) && `${v.name} ${s?.title ?? ""} ${s?.release ?? ""} ${s?.aliases.join(" ") ?? ""}`.toLowerCase().includes(needle)) rows.push(v);
			}, catalogTurn(controller.signal));
			if (!controller.signal.aborted) setMatches(rows);
		} catch (e) {
			if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Could not search anime candidates.");
		} finally {
			if (!controller.signal.aborted) setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-anime-review-desk": true,
		className: "mt-6 rounded-lg border border-border bg-surface p-4 sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
					className: "min-h-11 cursor-pointer content-center font-display text-2xl",
					children: "Review series identities and episodes"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-6 text-muted",
					children: "Confirm ambiguous filenames, remakes and alternate numbering. Reviews stay separate from original metadata, survive backups, and never transfer progress between versions."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					"aria-label": "Search anime review candidates",
					className: "mt-3",
					maxLength: 160,
					placeholder: "Source title, reviewed title or alias",
					value: query,
					onChange: (e) => {
						setQuery(e.target.value);
						request.current?.abort();
						setBusy(false);
						setMatches(void 0);
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-3 min-h-11",
					variant: "secondary",
					disabled: !state.ready || busy || viewer || phase !== "active",
					onClick: () => void search(),
					children: busy ? "Searching anime candidates…" : "Find anime review candidates"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted",
					children: "First 24 eligible public local/YouTube sources. Refine the title for a specific file."
				}),
				matches && !matches.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "mt-3 text-sm text-muted",
					children: "No eligible public anime candidates match."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 space-y-2",
					children: matches?.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						className: "min-h-11 w-full justify-start whitespace-normal text-left",
						onClick: () => setTarget(v.id),
						children: ["Review ", v.name]
					}, v.id))
				}),
				selected && visible(selected) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimeReviewPanel, {
					video: selected,
					seriesOptions: options
				}, selected.id)
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 border-t border-border pt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl text-fg",
						children: "Reviewed series · episode maps"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-6 text-muted",
						children: "Only explicitly reviewed mappings create these maps and next-episode choices. Parsed series shortcuts below are unverified browsing hints."
					}),
					!index ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						className: "mt-3 text-sm text-muted",
						children: "Preparing reviewed series…"
					}) : !groups.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "Review a source above to start an episode map."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 grid gap-2 sm:grid-cols-2",
							children: groups.slice(offset, offset + 4).map((g) => {
								const s = state.ledger.series[g.id];
								return s ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: selectedSeries === g.id ? "default" : "secondary",
									className: "min-h-11 min-w-0 justify-start whitespace-normal text-left",
									"aria-pressed": selectedSeries === g.id,
									onClick: () => setSelectedSeries(g.id),
									children: [
										"Open episode map: ",
										s.title,
										" · ",
										s.release,
										" (",
										g.videos.length,
										" ",
										g.videos.length === 1 ? "source" : "sources",
										")"
									]
								}, g.id) : null;
							})
						}),
						groups.length > 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "min-h-11 max-w-full whitespace-normal",
								disabled: !offset,
								onClick: () => setPage(offset / 4 - 1),
								children: "Previous reviewed series"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "min-h-11 max-w-full whitespace-normal",
								disabled: offset + 4 >= groups.length,
								onClick: () => setPage(offset / 4 + 1),
								children: "Next reviewed series"
							})]
						}),
						group && state.ledger.series[group.id] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimeSeriesMap, {
							group,
							onReview: (id) => {
								setTarget(id);
								const detail = document.querySelector("[data-anime-review-desk] > details");
								if (detail) detail.open = true;
							}
						}, group.id)
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimeSaveControls, {})
				]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-3 text-sm",
				children: error
			})
		]
	});
}
function AnimeSeriesMap({ group, onReview }) {
	const { ledger } = useAnimeReviews(), series = ledger.series[group.id], { availableFolders, visible } = useAnimeScope(), progress = useBrowseLibrary((s) => s.progress), resumeProgress = useBrowseLibrary((s) => s.resumeProgress), openPreview = useLibrary((s) => s.openPreview);
	const [laneKey, setLaneKey] = (0, import_react.useState)("");
	const [policy, setPolicy] = (0, import_react.useState)(series.policy), [labels, setLabels] = (0, import_react.useState)({
		title: series.title,
		release: series.release,
		aliases: series.aliases.join("; ")
	}), [range, setRange] = (0, import_react.useState)({
		numbering: "season",
		season: "1",
		start: "1",
		end: "12"
	}), [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setPolicy(series.policy);
		setLabels({
			title: series.title,
			release: series.release,
			aliases: series.aliases.join("; ")
		});
	}, [series]);
	const owned = (0, import_react.useMemo)(() => group.videos.filter((v) => visible(v) && ledger.episodes[v.id]?.seriesId === series.id).map((video) => ({
		video,
		review: ledger.episodes[video.id],
		available: !!video.remote || availableFolders.has(video.folderId),
		resume: resumeForVideo({
			progress,
			resumeProgress
		}, video)
	})), [
		group,
		visible,
		ledger,
		availableFolders,
		progress,
		resumeProgress
	]);
	const tracking = useReviewedDocument(seriesProgress);
	const map = (0, import_react.useMemo)(() => buildAnimeEpisodeMap(series, owned), [series, owned]), next = (0, import_react.useMemo)(() => tracking.ready ? nextTrackedAnimeEpisode(series, map, tracking.data.series[series.id]) : {
		reason: "Loading saved series tracking decisions…",
		resume: false,
		skip: 0
	}, [
		series,
		map,
		tracking.data,
		tracking.ready
	]);
	const activeLane = map.lanes.find((r) => r.key === laneKey) ?? map.lanes.find((r) => r.numbering === series.policy.numbering) ?? map.lanes[0];
	const run = (action) => {
		try {
			action();
			setError("");
		} catch (e) {
			setError(e instanceof Error ? e.message : "Could not save anime review.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		"data-anime-series-map": series.id,
		className: "mt-4 min-w-0 rounded-lg bg-elevated p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				className: "break-words font-display text-xl text-fg",
				children: [
					series.title,
					" · ",
					series.release
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs leading-5 text-muted",
				children: [
					"Owner-reviewed identity · aliases: ",
					series.aliases.join(", ") || "none",
					". Source filenames are retained. Maps reflect this eligible library, not a verified release schedule."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeriesProgressPanel, {
				series,
				map
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"data-anime-next": true,
				className: "mt-4 rounded-lg border border-border bg-bg p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "text-lg font-medium text-fg",
						children: "Your next episode"
					}),
					next.slot && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm font-medium text-fg",
						children: [
							next.slot.numbering === "absolute" ? "Absolute" : "Season " + next.slot.season,
							" · ",
							next.slot.kind,
							" ",
							next.slot.episode,
							next.resume ? " · resume" : ""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-6 text-muted",
						children: next.reason
					}),
					next.version && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 break-words text-xs text-muted",
						children: [
							"Selected source: ",
							next.version.video.name,
							next.version.review.preferred ? " · preferred version" : ""
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3 min-h-11",
						onClick: () => openPreview(next.version.video.id),
						children: next.skip ? "Accept missing-episode skip and open preview" : next.resume ? "Open resume episode preview" : "Open next episode preview"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "mt-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
								className: "min-h-11 cursor-pointer content-center text-sm font-medium",
								children: "Next-episode policy"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "text-sm text-muted",
									children: ["Use numbering lane", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										"aria-label": "Next anime numbering lane",
										className: selectClass,
										value: policy.numbering,
										onChange: (e) => setPolicy((p) => ({
											...p,
											numbering: e.target.value
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "season",
											children: "Season and episode"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "absolute",
											children: "Absolute numbering"
										})]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "text-sm text-muted",
									children: ["Complete after", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										"aria-label": "Anime completion threshold",
										className: selectClass,
										value: policy.threshold,
										onChange: (e) => setPolicy((p) => ({
											...p,
											threshold: Number(e.target.value)
										})),
										children: [
											.9,
											.95,
											.992,
											1
										].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value,
											children: [value * 100, "% watched"]
										}, value))
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mt-3 flex min-h-11 items-center gap-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									"aria-label": "Include anime specials and OVAs",
									type: "checkbox",
									checked: policy.specials,
									onChange: (e) => setPolicy((p) => ({
										...p,
										specials: e.target.checked
									}))
								}), "Offer specials / OVAs after numbered episodes"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-2 min-h-11",
								variant: "secondary",
								onClick: () => run(() => changeAnimeReviews((l) => setAnimePolicy(l, series.id, policy))),
								children: "Save next-episode policy"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted",
								children: "Duplicate versions occupy one episode slot. Incomplete progress resumes that exact version. Specials never enter the next choice until explicitly enabled; unnumbered specials require a manual map action."
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4",
				"aria-label": "Reviewed anime episode gap map",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "text-lg font-medium text-fg",
						children: "Numbered episodes and known gaps"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs leading-5 text-muted",
						children: "Observed ranges stop at the first and last confirmed episode in each season. An empty slot means no eligible reviewed version is saved here. It does not prove the episode was released. Absolute lanes stay separate. A span over 200 remains unverified until you enter a narrower range."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-3 block text-sm text-muted",
						children: ["Episode map lane", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							"aria-label": "Anime episode map lane",
							className: selectClass,
							value: activeLane?.key ?? "",
							onChange: (e) => setLaneKey(e.target.value),
							children: map.lanes.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: row.key,
								children: row.numbering === "absolute" ? "Absolute numbering" : "Season " + row.season
							}, row.key))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: activeLane && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimeGapLaneView, {
							row: activeLane,
							onReview
						}, activeLane.key)
					}),
					!map.lanes.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "No numbered episode mappings yet."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "mt-4 rounded-md border border-border p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "min-h-11 cursor-pointer content-center text-sm font-medium",
						children: "Enter an expected episode range"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs leading-5 text-muted",
						children: "Enter only a range you know. Up to 200 slots per lane, 24 entered lanes per series. This is owner-supplied evidence, not a fetched release schedule."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-sm text-muted",
								children: ["Range numbering", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									"aria-label": "Anime range numbering",
									className: selectClass,
									value: range.numbering,
									onChange: (e) => setRange((r) => ({
										...r,
										numbering: e.target.value
									})),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "season",
										children: "Season and episode"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "absolute",
										children: "Absolute"
									})]
								})]
							}),
							range.numbering === "season" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-sm text-muted",
								children: ["Season", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"aria-label": "Anime range season",
									className: "mt-1",
									type: "number",
									min: 1,
									max: 100,
									value: range.season,
									onChange: (e) => setRange((r) => ({
										...r,
										season: e.target.value
									}))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-sm text-muted",
								children: ["First episode", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"aria-label": "Anime range start",
									className: "mt-1",
									type: "number",
									min: 1,
									max: 1e4,
									value: range.start,
									onChange: (e) => setRange((r) => ({
										...r,
										start: e.target.value
									}))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-sm text-muted",
								children: ["Last episode", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"aria-label": "Anime range end",
									className: "mt-1",
									type: "number",
									min: 1,
									max: 1e4,
									value: range.end,
									onChange: (e) => setRange((r) => ({
										...r,
										end: e.target.value
									}))
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [false, true].map((remove) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "min-h-11 max-w-full whitespace-normal",
							variant: "secondary",
							onClick: () => run(() => changeAnimeReviews((l) => setAnimeRange(l, series.id, {
								numbering: range.numbering,
								season: range.numbering === "absolute" ? 0 : Number(range.season),
								start: Number(range.start),
								end: Number(range.end)
							}, remove))),
							children: remove ? "Use observed range again" : "Save entered episode range"
						}, String(remove)))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimeAuxiliaryVersions, {
				title: "Specials & OVAs · separate from numbered gaps",
				versions: map.specials.flatMap((s) => s.versions),
				onReview
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimeAuxiliaryVersions, {
				title: "Unresolved episode numbers · manual review",
				versions: map.unresolved,
				onReview
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "mt-4 rounded-md border border-border p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "min-h-11 cursor-pointer content-center text-sm font-medium",
						children: "Edit reviewed series labels and aliases"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 grid gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-sm text-muted",
								children: ["Title", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"aria-label": "Edit reviewed series title",
									className: "mt-1",
									maxLength: 160,
									value: labels.title,
									onChange: (e) => setLabels((l) => ({
										...l,
										title: e.target.value
									}))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-sm text-muted",
								children: ["Release / sequel label", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"aria-label": "Edit reviewed series release",
									className: "mt-1",
									maxLength: 80,
									value: labels.release,
									onChange: (e) => setLabels((l) => ({
										...l,
										release: e.target.value
									}))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "text-sm text-muted",
								children: ["Aliases separated by semicolons", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									"aria-label": "Edit reviewed series aliases",
									className: "mt-1",
									maxLength: 1900,
									value: labels.aliases,
									onChange: (e) => setLabels((l) => ({
										...l,
										aliases: e.target.value
									}))
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "mt-3 min-h-11",
						onClick: () => run(() => changeAnimeReviews((l) => editAnimeSeries(l, series.id, {
							...labels,
							aliases: aliases(labels.aliases)
						}))),
						children: "Save series labels and aliases"
					})
				]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-3 text-sm",
				children: error
			})
		]
	});
}
function AnimeGapLaneView({ row, onReview }) {
	const [page, setPage] = (0, import_react.useState)(0), offset = Math.min(page * 20, Math.max(0, Math.ceil(row.slots.length / 20) - 1) * 20);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-anime-lane": row.key,
		className: "min-w-0 rounded-lg border border-border p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h5", {
			className: "text-sm font-medium text-fg",
			children: [
				row.numbering === "absolute" ? "Absolute numbering" : "Season " + row.season,
				" · ",
				row.start,
				"–",
				row.end,
				" · ",
				row.origin === "entered" ? "owner-entered range" : "observed range"
			]
		}), row.unverified ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "status",
			className: "mt-2 text-sm text-muted",
			children: "Wide numbering span is unverified. No gap grid was created. Review numbering or enter a range of at most 200."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-muted",
				children: [
					row.slots.filter((s) => !s.versions.length).length,
					" absent slots in this range · no episodes inferred after ",
					row.end
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 space-y-3",
				children: row.slots.slice(offset, offset + 20).map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-anime-slot": slot.episode,
					className: "min-w-0 rounded-md bg-bg p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium text-fg",
						children: [
							"Episode ",
							slot.episode,
							" · ",
							slot.versions.length ? slot.versions.length + " saved version" + (slot.versions.length === 1 ? "" : "s") : "Missing from reviewed library"
						]
					}), slot.versions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimeVersionList, {
						versions: slot.versions,
						onReview
					})]
				}, slot.episode))
			}),
			row.slots.length > 20 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "min-h-11 max-w-full whitespace-normal",
					disabled: !offset,
					onClick: () => setPage(offset / 20 - 1),
					children: "Previous 20 episodes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "min-h-11 max-w-full whitespace-normal",
					disabled: offset + 20 >= row.slots.length,
					onClick: () => setPage(offset / 20 + 1),
					children: "Next 20 episodes"
				})]
			})
		] })]
	});
}
function AnimeAuxiliaryVersions({ title, versions, onReview }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		className: "mt-4 rounded-md border border-border p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
			className: "min-h-11 cursor-pointer content-center text-sm font-medium",
			children: [
				title,
				" (",
				versions.length,
				")"
			]
		}), versions.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimeVersionList, {
			versions,
			onReview
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "No reviewed sources in this group."
		})]
	});
}
function AnimeVersionList({ versions, onReview }) {
	const [page, setPage] = (0, import_react.useState)(0), [error, setError] = (0, import_react.useState)(""), offset = Math.min(page * 4, Math.max(0, Math.ceil(versions.length / 4) - 1) * 4), openPreview = useLibrary((s) => s.openPreview), { ledger } = useAnimeReviews();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 space-y-2",
		children: [
			versions.slice(offset, offset + 4).map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-anime-version": v.video.id,
				className: "min-w-0 rounded-md border border-border p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "break-words text-sm text-fg",
						children: v.video.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs leading-5 text-muted",
						children: [
							v.video.remote ? "YouTube" : "Local",
							" · ",
							v.review.kind,
							v.review.episode !== void 0 ? " " + v.review.episode : "",
							" · ",
							v.resume && v.resume.d > 0 ? Math.round(v.resume.t / v.resume.d * 100) + "% watched in this version" : "No resume mark in this version",
							v.review.preferred ? " · preferred version" : "",
							!v.available ? " · reconnect source" : ""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "min-h-11 max-w-full whitespace-normal",
								disabled: !v.available,
								onClick: () => openPreview(v.video.id),
								children: "Open this episode version"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "min-h-11 max-w-full whitespace-normal",
								disabled: !v.available || v.review.preferred,
								onClick: () => {
									try {
										changeAnimeReviews((l) => preferAnimeVersion(l, v.video.id, versions.filter((r) => r.available).map((r) => r.video.id)));
										setError("");
									} catch (e) {
										setError(e instanceof Error ? e.message : "Could not prefer version.");
									}
								},
								children: "Prefer episode version"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								className: "min-h-11 max-w-full whitespace-normal",
								disabled: !ledger.episodes[v.video.id],
								onClick: () => onReview(v.video.id),
								children: "Review this mapping"
							})
						]
					})
				]
			}, v.video.id)),
			versions.length > 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "min-h-11 max-w-full whitespace-normal",
					disabled: !offset,
					onClick: () => setPage(offset / 4 - 1),
					children: "Previous versions"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "min-h-11 max-w-full whitespace-normal",
					disabled: offset + 4 >= versions.length,
					onClick: () => setPage(offset / 4 + 1),
					children: "Next versions"
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-sm",
				children: error
			})
		]
	});
}
//#endregion
export { AnimeReviewDesk, AnimeReviewEntry, useAnimeReviews as t };
