import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { Mt as matchesTwitchContent, pt as forEachCatalogSlice, wn as yieldCatalogTask } from "./live-rooms-Wov1xeIQ.mjs";
import { Dt as Input, E as isTwitchClip, Ot as Button, Xn as useLibrary, at as yieldNavigationTask, u as VirtualVideoGrid } from "./library-app-CrsCDQmv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/twitch-archive-search-DJTnGU2V.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Calendar bounds use local midnight and the next local day (including DST).
* The exclusive end means every video on the selected end date is included. */
function twitchArchiveDate(value, end = false) {
	if (!value) return;
	const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!match) return NaN;
	const [year, month, day] = match.slice(1).map(Number);
	if (year < 1900 || year > 9999) return NaN;
	const date = new Date(year, month - 1, day);
	if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return NaN;
	if (end) date.setDate(day + 1);
	return date.getTime();
}
function key(video) {
	return {
		date: Number.isFinite(video.addedAt) && video.addedAt > 0 ? video.addedAt : 0,
		id: video.id
	};
}
function compareTwitchArchiveKeys(a, b, order) {
	if (Boolean(a.date) !== Boolean(b.date)) return a.date ? -1 : 1;
	return (order === "newest" ? b.date - a.date : a.date - b.date) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}
function matchesCreator(video, creator) {
	if (video.folderId.toLowerCase() === creator.id.toLowerCase() || creator.channelId && video.remote?.channelId === creator.channelId) return true;
	if (video.folderId.startsWith("tw:")) return false;
	return video.remote?.channelName?.trim().toLowerCase() === creator.title.trim().toLowerCase();
}
/** One source-scoped, cancelable scan; no title index, sorted whole-catalog
* copy or growing result history. Keyset pages retain at most 49 references. */
async function searchTwitchArchive(videos, filter, options) {
	const started = performance.now();
	const size = Math.min(48, Math.max(1, Math.floor(options.pageSize ?? 24)));
	const tokens = filter.query.slice(0, 256).normalize("NFKC").toLowerCase().trim().split(/\s+/).filter(Boolean).slice(0, 8);
	const candidates = [];
	let matched = 0, visited = 0, maxCandidates = 0;
	const compare = (a, b) => compareTwitchArchiveKeys(a, b, filter.order);
	const turn = async () => {
		options.signal.throwIfAborted();
		await (options.turn ?? yieldCatalogTask)();
		options.signal.throwIfAborted();
	};
	if (filter.from !== void 0 && !Number.isFinite(filter.from) || filter.until !== void 0 && !Number.isFinite(filter.until) || filter.from !== void 0 && filter.until !== void 0 && filter.from >= filter.until) throw new Error("Choose a valid date range.");
	await forEachCatalogSlice(videos, (video) => {
		visited++;
		if (video.remote?.kind !== "twitch" || video.remote.live || video.isSample || video.extension === "live" || /\/(?:live|channel)$/i.test(video.path) || /:(?:live|channel)$/i.test(video.id) || /^offline\b/i.test(video.tagline ?? "")) return;
		if (filter.creator && !matchesCreator(video, filter.creator)) return;
		const clip = isTwitchClip(video);
		if (filter.kind === "vod" ? clip : !matchesTwitchContent(video, filter.kind)) return;
		const position = key(video);
		if (filter.from !== void 0 && (!position.date || position.date < filter.from) || filter.until !== void 0 && (!position.date || position.date >= filter.until)) return;
		if (tokens.length) {
			const title = video.name.slice(0, 2048).normalize("NFKC").toLowerCase();
			if (!tokens.every((token) => title.includes(token))) return;
		}
		matched++;
		if (filter.after && compare(position, filter.after) <= 0) return;
		if (candidates.length === size + 1 && compare(position, candidates.at(-1).key) >= 0) return;
		let low = 0, high = candidates.length;
		while (low < high) {
			const middle = low + high >>> 1;
			if (compare(candidates[middle].key, position) <= 0) low = middle + 1;
			else high = middle;
		}
		candidates.splice(low, 0, {
			video,
			key: position
		});
		if (candidates.length > size + 1) candidates.pop();
		maxCandidates = Math.max(maxCandidates, candidates.length);
	}, turn);
	options.signal.throwIfAborted();
	const shown = candidates.slice(0, size);
	return {
		videos: shown.map((row) => row.video),
		matched,
		hasNext: candidates.length > size,
		next: shown.at(-1)?.key,
		visited,
		maxCandidates,
		elapsedMs: performance.now() - started
	};
}
var PAGE = 24;
var defaults = {
	query: "",
	creator: "all",
	kind: "all",
	order: "newest",
	from: "",
	until: ""
};
function TwitchArchiveSearch({ videos, follows, onClose }) {
	const [filters, setFilters] = (0, import_react.useState)(defaults);
	const [after, setAfter] = (0, import_react.useState)();
	const [previous, setPrevious] = (0, import_react.useState)([]);
	const [pageNumber, setPageNumber] = (0, import_react.useState)(1);
	const [result, setResult] = (0, import_react.useState)();
	const [pending, setPending] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)("");
	const completed = (0, import_react.useRef)(void 0);
	const viewerOpen = useLibrary((state) => Boolean(state.activeId || state.previewId));
	const creators = (0, import_react.useMemo)(() => follows.filter((row) => row.kind === "twitch").sort((a, b) => a.title.localeCompare(b.title)), [follows]);
	const update = (patch) => {
		setFilters((value) => ({
			...value,
			...patch
		}));
		setAfter(void 0);
		setPrevious([]);
		setPageNumber(1);
		setPending(true);
		setResult(void 0);
	};
	(0, import_react.useEffect)(() => {
		const controller = new AbortController();
		if (viewerOpen) return () => controller.abort();
		const last = completed.current;
		if (last?.videos === videos && last.creators === creators && last.filters === filters && last.after === after) return () => controller.abort();
		completed.current = void 0;
		setPending(true);
		setResult(void 0);
		setError("");
		const timer = setTimeout(() => {
			const from = twitchArchiveDate(filters.from), until = twitchArchiveDate(filters.until, true);
			if (filters.from && !Number.isFinite(from) || filters.until && !Number.isFinite(until) || from !== void 0 && until !== void 0 && from >= until) {
				setPending(false);
				setError("Choose a valid date range; the end date must be on or after the start date.");
				return;
			}
			const creator = creators.find((row) => row.id === filters.creator);
			if (filters.creator !== "all" && !creator) {
				setPending(false);
				setError("This creator is no longer followed. Choose another creator or reset the filters.");
				return;
			}
			searchTwitchArchive(videos, {
				query: filters.query,
				creator,
				kind: filters.kind,
				order: filters.order,
				from,
				until,
				after
			}, {
				signal: controller.signal,
				pageSize: PAGE,
				turn: () => yieldNavigationTask(controller.signal)
			}).then((value) => {
				if (!controller.signal.aborted) {
					completed.current = {
						videos,
						creators,
						filters,
						after
					};
					setResult(value);
					setPending(false);
				}
			}).catch((failure) => {
				if (!controller.signal.aborted) {
					setPending(false);
					setError(failure instanceof Error ? failure.message : "Archive search failed.");
				}
			});
		}, filters.query ? 180 : 0);
		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [
		videos,
		creators,
		filters,
		after,
		viewerOpen
	]);
	const selectClass = "min-h-11 w-full min-w-0 rounded-md border border-border bg-bg px-3 text-sm text-fg";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Search saved Twitch archive",
		className: "mb-6 rounded-xl border border-border bg-surface p-4 sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl text-fg",
					children: "Search saved archive"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Twitch VODs and clips already in your library. Live streams stay in the live rail."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: onClose,
					children: "Close archive search"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "min-w-0 text-xs text-muted",
						children: ["Title contains", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-1 min-h-11",
							"aria-label": "Twitch archive title",
							maxLength: 256,
							placeholder: "Words from a title",
							value: filters.query,
							onChange: (event) => update({ query: event.target.value })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "min-w-0 text-xs text-muted",
						children: ["Creator", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: `mt-1 ${selectClass}`,
							"aria-label": "Twitch archive creator",
							value: filters.creator,
							onChange: (event) => update({ creator: event.target.value }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "All creators"
							}), creators.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: row.id,
								children: row.title
							}, row.id))]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "min-w-0 text-xs text-muted",
						children: ["Video type", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: `mt-1 ${selectClass}`,
							"aria-label": "Twitch archive type",
							value: filters.kind,
							onChange: (event) => update({ kind: event.target.value }),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "all",
									children: "VODs and clips"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "vod",
									children: "VODs only"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "clip",
									children: "Clips only"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "past-broadcast",
									children: "Past broadcasts"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "highlight",
									children: "Highlights"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "upload",
									children: "Uploads"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "unknown",
									children: "Unknown subtype"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "min-w-0 text-xs text-muted",
						children: ["Published from", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							className: "mt-1 min-h-11 w-full min-w-0",
							"aria-label": "Twitch archive start date",
							value: filters.from,
							onChange: (event) => update({ from: event.target.value })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "min-w-0 text-xs text-muted",
						children: ["Published through", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							className: "mt-1 min-h-11 w-full min-w-0",
							"aria-label": "Twitch archive end date",
							value: filters.until,
							onChange: (event) => update({ until: event.target.value })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "min-w-0 text-xs text-muted",
						children: ["Date order", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: `mt-1 ${selectClass}`,
							"aria-label": "Twitch archive order",
							value: filters.order,
							onChange: (event) => update({ order: event.target.value }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "newest",
								children: "Newest first"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "oldest",
								children: "Oldest first"
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					onClick: () => update(defaults),
					children: "Reset archive filters"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "text-sm text-muted",
					children: error || (pending ? viewerOpen ? "Search pauses during preview or playback." : "Searching saved archive…" : `${result?.matched.toLocaleString() ?? 0} matches · page ${pageNumber} · ${result?.videos.length ?? 0} shown`)
				})]
			}),
			!pending && !error && result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				result.videos.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VirtualVideoGrid, {
						videos: result.videos,
						variant: "grid",
						pageSize: PAGE
					}, `${pageNumber}:${filters.query}:${filters.creator}:${filters.kind}:${filters.order}:${filters.from}:${filters.until}`)
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted",
					children: "No saved videos match these filters. Clear a filter or pull this creator’s archive to add more."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							disabled: !previous.length,
							onClick: () => {
								setAfter(previous.at(-1));
								setPrevious((value) => value.slice(0, -1));
								setPageNumber((value) => value - 1);
								setPending(true);
							},
							children: "Previous archive page"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							disabled: !result.hasNext,
							onClick: () => {
								setPrevious((value) => [...value.slice(-63), after]);
								setAfter(result.next);
								setPageNumber((value) => value + 1);
								setPending(true);
							},
							children: "Next archive page"
						}),
						pageNumber > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => {
								setAfter(void 0);
								setPrevious([]);
								setPageNumber(1);
								setPending(true);
							},
							children: "First archive page"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-subtle",
					children: "Ordered by saved publication date. Missing dates appear last and are excluded when a date range is set."
				})
			] })
		]
	});
}
//#endregion
export { TwitchArchiveSearch as default };
