import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { wn as yieldCatalogTask } from "./live-rooms-Wov1xeIQ.mjs";
import { $n as youtubeTagConfidenceReport, Dr as confidenceBand, Fi as youtubeTagTitleHash, Ii as youtubeTextTags, Ot as Button, Pi as youtubeTagEvidence, Ti as sourcesInMask, Xn as useLibrary, ar as youtubeDownloadTarget, b as fetchYoutubeVideoMetadata } from "./library-app-CrsCDQmv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/youtube-tags-control-B14w4QlW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var labels = {
	"video-tag": "Creator video tag",
	hashtag: "Hashtag",
	chapter: "Chapter phrase",
	title: "Title",
	description: "Description prose"
};
function YoutubeTagSuggestions({ video }) {
	const tags = useLibrary((state) => state.tags[video.id]), provenance = useLibrary((state) => state.metadataProvenance[video.id]);
	const [open, setOpen] = (0, import_react.useState)(false), [page, setPage] = (0, import_react.useState)(0), [selected, select] = (0, import_react.useState)([]), [expanded, expand] = (0, import_react.useState)(""), [note, setNote] = (0, import_react.useState)(""), [error, setError] = (0, import_react.useState)("");
	const evidence = (0, import_react.useMemo)(() => youtubeTextTags(video), [video]);
	const base = (0, import_react.useMemo)(() => ({
		tags,
		provenance,
		summary: video.remote?.youtubeTagSummary,
		checkedAt: video.remote?.youtubeTagsCheckedAt
	}), [
		tags,
		provenance,
		video.remote?.youtubeTagSummary,
		video.remote?.youtubeTagsCheckedAt
	]);
	(0, import_react.useEffect)(() => {
		select([]);
		expand("");
		setPage(0);
	}, [base, video.id]);
	(0, import_react.useEffect)(() => {
		setNote("");
		setError("");
	}, [video.id]);
	const locked = Boolean(provenance?.lockedFields?.includes("tags")), fresh = Boolean(base.checkedAt && base.summary?.version === 4 && base.summary.scores && base.summary.signals && base.summary.titleHash === youtubeTagTitleHash(video.name));
	const rows = (0, import_react.useMemo)(() => evidence.tags.map((tag, index) => ({
		tag,
		score: evidence.scores[index] ?? 0,
		signals: evidence.signals[index] ?? 0
	})).sort((a, b) => b.score - a.score || a.tag.localeCompare(b.tag)), [evidence]);
	const offset = Math.min(page * 8, Math.max(0, Math.ceil(rows.length / 8) - 1) * 8), reviews = (tags ?? []).slice(0, 32).flatMap((tag) => provenance?.youtubeReviews?.[tag] ? [[tag, provenance.youtubeReviews[tag]]] : []).sort((a, b) => b[1].at - a[1].at);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		"data-tag-confidence": true,
		className: "rounded-lg border border-border px-3",
		onToggle: (event) => setOpen(event.currentTarget.open),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
			className: "min-h-11 cursor-pointer py-3 text-sm font-medium",
			children: ["Recommended tags · ", rows.length]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3 pb-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-5 text-muted",
					children: "Evidence scores describe field agreement, not probabilities. High: 80–100; medium: 50–79; low: 0–49. Only high-confidence tags join automatic enrichment. Medium and low suggestions need your review; repeated words and hashtags alone cannot raise confidence."
				}),
				!fresh && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-5 text-muted",
					children: "Pull this video’s tags and description to prepare current, reviewable evidence. Older saved labels stay visible."
				}),
				locked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "text-xs leading-5 text-muted",
					children: "Your tag field is locked. Suggestions remain visible; use Edit tags to make your own changes."
				}),
				!rows.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "No supported tag suggestions from the available metadata."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					"aria-label": "Recommended YouTube tags",
					className: "grid gap-2 sm:grid-cols-2",
					children: rows.slice(offset, offset + 8).map((row) => {
						const source = provenance?.tags[row.tag], protectedTag = source === "manual" || source === "youtube-review" || tags?.includes(row.tag) && !source, isSaved = tags?.includes(row.tag);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							"data-confidence": confidenceBand(row.score),
							className: "min-w-0 rounded-md bg-bg p-3 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex min-h-11 items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										"aria-label": "Select suggested tag " + row.tag,
										disabled: locked || !fresh || protectedTag,
										checked: selected.includes(row.tag),
										onChange: (event) => select((current) => event.target.checked ? [...current, row.tag] : current.filter((tag) => tag !== row.tag))
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 break-words font-medium",
										children: ["#", row.tag]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "leading-5 text-accent",
									children: [
										confidenceBand(row.score),
										" confidence · ",
										row.score,
										"/100"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 leading-5 text-muted",
									children: sourcesInMask(row.signals).map((source) => labels[source]).join(" + ") || "No current confidence evidence"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-muted",
									children: source === "youtube-review" ? "Accepted by you" : source === "manual" ? "Your manual tag" : isSaved ? "Saved provider tag" : row.score >= 80 ? "Eligible for automatic enrichment" : "Review only"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									className: "mt-2 min-h-11",
									"aria-expanded": expanded === row.tag,
									onClick: () => expand((current) => current === row.tag ? "" : row.tag),
									children: ["Evidence for ", row.tag]
								}),
								expanded === row.tag && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-1 space-y-2 text-muted",
									children: youtubeTagEvidence(video, row.tag).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-fg",
										children: labels[item.source]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 break-words leading-5",
										children: item.excerpt
									})] }, item.source))
								})
							]
						}, row.tag);
					})
				}),
				rows.length > 8 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "min-h-11",
							disabled: !offset,
							onClick: () => {
								setPage(offset / 8 - 1);
								expand("");
							},
							children: "Previous tag suggestions"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted",
							children: [
								offset + 1,
								"–",
								Math.min(offset + 8, rows.length),
								" of ",
								rows.length
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "min-h-11",
							disabled: offset + 8 >= rows.length,
							onClick: () => {
								setPage(offset / 8 + 1);
								expand("");
							},
							children: "Next tag suggestions"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "min-h-11",
							onClick: () => {
								try {
									const url = URL.createObjectURL(new Blob([JSON.stringify(youtubeTagConfidenceReport(video, provenance), null, 2)], { type: "application/json" })), anchor = document.createElement("a");
									anchor.href = url;
									anchor.download = "youtube-tag-evidence-" + (video.remote?.videoId ?? "video") + ".json";
									anchor.click();
									setTimeout(() => URL.revokeObjectURL(url), 1e3);
								} catch {
									setError("Evidence export could not be prepared. Try again.");
								}
							},
							children: "Export tag evidence"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "min-h-11",
							disabled: !selected.length || locked || !fresh,
							onClick: () => {
								try {
									const count = useLibrary.getState().acceptYoutubeTagSuggestions(video.id, selected, base);
									select([]);
									setError("");
									setNote(count + " reviewed tag" + (count === 1 ? "" : "s") + " accepted with confidence provenance. Existing manual choices are preserved.");
								} catch (cause) {
									select([]);
									setError(cause instanceof Error ? cause.message : "Tags could not be accepted.");
								}
							},
							children: ["Accept selected tags", selected.length ? " · " + selected.length : ""]
						}),
						selected.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "min-h-11",
							onClick: () => select([]),
							children: "Clear tag selection"
						})
					]
				}),
				note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "text-xs leading-5 text-muted",
					children: note
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "text-xs leading-5 text-danger",
					children: error
				}),
				reviews.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
					"data-accepted-tag-evidence": true,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
							className: "min-h-11 cursor-pointer content-center text-xs font-medium",
							children: ["Accepted tag evidence · ", reviews.length]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-2 text-xs text-muted",
							children: reviews.slice(0, 8).map(([tag, review]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "break-words leading-5",
								children: [
									"#",
									tag,
									" · ",
									review.score,
									"/100 at acceptance · ",
									sourcesInMask(review.signals).map((source) => labels[source]).join(" + "),
									" · ",
									new Date(review.at).toLocaleDateString()
								]
							}, tag))
						}),
						reviews.length > 8 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted",
							children: "Showing the eight latest accepted tags. Accepted evidence stays with your saved tag provenance."
						})
					]
				})
			]
		})]
	});
}
function YoutubeTagsControl({ video }) {
	const [busy, setBusy] = (0, import_react.useState)(false), [note, setNote] = (0, import_react.useState)(""), [error, setError] = (0, import_react.useState)("");
	const [results, setResults] = (0, import_react.useState)([]);
	const generation = (0, import_react.useRef)(0), running = (0, import_react.useRef)(false);
	const retryIds = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		generation.current++;
		running.current = false;
		retryIds.current.clear();
		setBusy(false);
		setResults([]);
		setError("");
		setNote("");
		return () => {
			generation.current++;
			running.current = false;
		};
	}, [video?.id]);
	if (video && video.remote?.kind !== "youtube") return null;
	const run = async () => {
		if (running.current) return;
		running.current = true;
		setBusy(true);
		setError("");
		setResults([]);
		const revision = ++generation.current, current = () => generation.current === revision;
		const targets = [];
		let visited = 0;
		for (const row of video ? [video] : useLibrary.getState().videos) {
			if (++visited % 512 === 0) {
				await yieldCatalogTask();
				if (!current()) return;
			}
			if (row.remote?.kind !== "youtube" || row.remote.live || row.remote.youtubeType === "upcoming") continue;
			if (!video && row.remote.youtubeTagsCheckedAt && !retryIds.current.has(row.id)) continue;
			if (youtubeDownloadTarget(row)) targets.push(row);
			if (targets.length === 5) break;
		}
		const report = [];
		try {
			if (!targets.length) {
				setNote("Every eligible saved video has been checked. Open a video to refresh its tags. Live and upcoming streams are skipped.");
				return;
			}
			for (const [index, row] of targets.entries()) {
				if (!current()) break;
				setNote(`Pulling video ${index + 1} of ${targets.length}: ${row.name}`);
				try {
					const metadata = await fetchYoutubeVideoMetadata({ data: { id: youtubeDownloadTarget(row).videoId } });
					if (!current()) break;
					const saved = await useLibrary.getState().setYoutubeMetadata(row.id, metadata);
					retryIds.current.delete(row.id);
					report.push({
						id: row.id,
						title: row.name,
						detail: `${metadata.keywords?.length ?? 0} creator tags · ${saved.tags} suggestions prepared${saved.locked ? " · your tag lock kept; suggestions available in the preview" : " · only high-confidence enrichment saved"}${metadata.description ? " · full description checked" : ""}`
					});
				} catch (cause) {
					if (!current()) break;
					retryIds.current.add(row.id);
					const message = cause instanceof Error ? cause.message : "YouTube metadata is unavailable.";
					report.push({
						id: row.id,
						title: row.name,
						detail: message,
						failed: true
					});
					setError(`${message} Remaining videos were not requested. Try again when YouTube is available.`);
					break;
				}
				if (current()) setResults([...report]);
			}
			if (current()) {
				setResults(report);
				setNote(`${report.filter((row) => !row.failed).length} video${report.filter((row) => !row.failed).length === 1 ? "" : "s"} saved. Manual tags and locked fields stay protected.`);
			}
		} finally {
			if (current()) {
				running.current = false;
				setBusy(false);
			}
		}
	};
	const stream = Boolean(video?.remote?.live || video?.remote?.youtubeType === "upcoming");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "min-h-11",
					disabled: busy || stream,
					onClick: () => void run(),
					children: busy ? "Pulling YouTube tags…" : video ? "Pull video tags & description" : "Pull tags for next 5 videos"
				}), busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					className: "min-h-11",
					onClick: () => {
						generation.current++;
						running.current = false;
						setBusy(false);
						setNote("Stopped. Completed saves were kept. A save already underway may finish; remaining videos will not be requested.");
					},
					children: "Stop tag pull"
				})]
			}),
			stream && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: "Pull tags after this stream ends."
			}),
			note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "break-words text-xs leading-5 text-muted",
				children: note
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "break-words text-xs leading-5 text-danger",
				children: error
			}),
			results.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				"aria-label": "YouTube tag pull results",
				className: "divide-y divide-border rounded-lg border border-border px-3",
				children: results.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "break-words text-xs font-medium",
						children: row.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `mt-1 break-words text-xs leading-5 ${row.failed ? "text-danger" : "text-muted"}`,
						children: row.detail
					})]
				}, row.id))
			}),
			video?.remote?.youtubeTagsCheckedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [
					"Video metadata checked ",
					new Date(video.remote.youtubeTagsCheckedAt).toLocaleString(),
					" · ",
					video.remote.youtubeKeywords?.length ?? 0,
					" creator tags"
				]
			}),
			video && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YoutubeTagSuggestions, { video })
		]
	});
}
//#endregion
export { YoutubeTagsControl as t };
