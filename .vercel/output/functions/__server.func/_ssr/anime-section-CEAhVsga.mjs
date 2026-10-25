import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { Vt as Clapperboard } from "../_libs/lucide-react.mjs";
import { C as adultFolderIds, Kt as sortCatalogRows, c as ADULT_PULL_PROVIDERS, tt as forEachCatalogSlice } from "./live-rooms-9iiWP3WP.mjs";
import { G as useSessionPhase, Gt as resumeForVideo, R as useSettledTags, X as Input, Z as Button, c as VirtualVideoGrid, h as catalogTurn, nt as animeEvidence, pn as useLibrary, rt as animeTitleInfo } from "./library-app-VjV5eJfN.mjs";
import { s as HubShell, u as Stat } from "./hub-shared-CSaQ1YXN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/anime-section-CEAhVsga.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EMPTY_TAGS = [];
var adultProviders = new Set(ADULT_PULL_PROVIDERS);
function film(video, tags) {
	return /\b(anime[- ]?(?:movie|film)|movie|film|theatrical)\b/.test(`${video.name} ${video.genre ?? ""} ${tags.join(" ")}`.toLowerCase());
}
function matches(video, tags, needle) {
	return `${video.name} ${video.genre ?? ""} ${video.description ?? ""} ${tags.join(" ")}`.toLowerCase().includes(needle);
}
/** Prepare membership/order/counts once per immutable catalog/tag snapshot.
* Typing and watch progress never restart topic detection or the date sort. */
async function prepareAnimeCatalog(input, turn) {
	await turn();
	const adult = adultFolderIds(input.folders);
	const catalog = [], found = [];
	await forEachCatalogSlice(input.videos, (video) => {
		if (adult.has(video.folderId) || adultProviders.has(video.remote?.kind ?? "") || input.unavailable[video.id] || input.hiddenVideos[video.id] || input.hideDemo && video.isSample) return;
		catalog.push(video);
		if (animeEvidence(video, input.tags[video.id] ?? EMPTY_TAGS, input.metadataProvenance?.[video.id])) found.push(video);
	}, turn);
	const anime = await sortCatalogRows(found, (a, b) => b.addedAt - a.addedAt, turn);
	const films = new Uint8Array(anime.length), specials = new Uint8Array(anime.length);
	const series = /* @__PURE__ */ new Map();
	let seriesOverflow = false;
	let localCount = 0, filmCount = 0, specialCount = 0;
	await forEachCatalogSlice(anime, (video, index) => {
		if (!video.remote) localCount++;
		const info = animeTitleInfo(video.name);
		if (film(video, input.tags[video.id] ?? EMPTY_TAGS)) {
			films[index] = 1;
			filmCount++;
		} else if (info.format === "special" || (input.tags[video.id] ?? EMPTY_TAGS).some((tag) => /(?:^|[- ])(?:ova|ona|special)$/i.test(tag))) {
			specials[index] = 1;
			specialCount++;
		} else if (info.episode !== void 0) {
			const group = series.get(info.key);
			if (group) group.count++;
			else if (series.size < 512) series.set(info.key, {
				key: info.key,
				title: info.series,
				count: 1
			});
			else seriesOverflow = true;
		}
	}, turn);
	await turn();
	return {
		catalog,
		anime,
		films,
		specials,
		localCount,
		filmCount,
		specialCount,
		series: [...series.values()],
		seriesOverflow
	};
}
/** Resolve each resume mark once. Stable ties keep the newest-title order. */
async function prepareAnimeContinue(anime, resume, turn) {
	const rows = [];
	await forEachCatalogSlice(anime, (video) => {
		const mark = resume(video);
		if (mark && mark.d > 0 && mark.t >= 2 && mark.t / mark.d < .992) rows.push({
			video,
			at: mark.at
		});
	}, turn);
	const sorted = await sortCatalogRows(rows, (a, b) => b.at - a.at, turn);
	const result = new Array(sorted.length);
	await forEachCatalogSlice(sorted, (row, index) => {
		result[index] = row.video;
	}, turn);
	await turn();
	return result;
}
async function selectAnimeTitles(index, continuing, filter, query, tags, turn, options = {}) {
	await turn();
	const needle = query.trim().toLowerCase();
	const base = filter === "continue" ? continuing : index.anime;
	if (!needle && !options.series && !options.episodeOrder && (filter === "all" || filter === "continue")) return base;
	const result = [];
	await forEachCatalogSlice(base, (video, position) => {
		if (filter === "films" && !index.films[position] || filter === "specials" && !index.specials[position] || filter === "series" && (index.films[position] || index.specials[position])) return;
		if (options.series && animeTitleInfo(video.name).key !== options.series) return;
		if (!needle || matches(video, tags[video.id] ?? EMPTY_TAGS, needle)) result.push(video);
	}, turn);
	if (options.episodeOrder) {
		const decorated = [];
		await forEachCatalogSlice(result, (video) => {
			decorated.push({
				video,
				info: animeTitleInfo(video.name)
			});
		}, turn);
		const collator = new Intl.Collator(void 0, {
			numeric: true,
			sensitivity: "base"
		});
		const sorted = await sortCatalogRows(decorated, (a, b) => collator.compare(a.info.key, b.info.key) || a.info.season - b.info.season || (a.info.episode ?? Infinity) - (b.info.episode ?? Infinity) || collator.compare(a.video.name, b.video.name), turn);
		const ordered = [];
		await forEachCatalogSlice(sorted, (row) => {
			ordered.push(row.video);
		}, turn);
		return ordered;
	}
	await turn();
	return result;
}
/** The title finder displays eight matches. Stop at eight rather than scanning
* and allocating every matching library title before discarding the rest. */
async function findAnimeTagTitles(catalog, query, tags, turn) {
	await turn();
	const needle = query.trim().toLowerCase(), result = [];
	if (!needle) return result;
	for (let offset = 0; offset < catalog.length && result.length < 8;) {
		await turn();
		const end = Math.min(catalog.length, offset + 512), started = performance.now();
		for (; offset < end && result.length < 8; offset++) {
			const video = catalog[offset];
			if (matches(video, tags[video.id] ?? EMPTY_TAGS, needle)) result.push(video);
			if (performance.now() - started >= 4) {
				offset++;
				break;
			}
		}
	}
	await turn();
	return result;
}
var EMPTY = [];
/** Each stage has its own inputs: progress only recalculates Continue, while
* queries only rescan the already-classified catalog. Obsolete work is aborted
* at task boundaries, including before publication. Hidden tabs and viewers
* suspend preparation without discarding a completed current snapshot. */
function useAnimeJob(scope, ready, work) {
	const phase = useSessionPhase(), viewer = useLibrary((state) => Boolean(state.activeId || state.previewId));
	const [packet, setPacket] = (0, import_react.useState)();
	const [failure, setFailure] = (0, import_react.useState)();
	const [attempt, retry] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (!ready || phase !== "active" || viewer || packet?.scope === scope) return;
		const controller = new AbortController();
		setFailure(void 0);
		work(scope, catalogTurn(controller.signal)).then((value) => {
			if (!controller.signal.aborted) (0, import_react.startTransition)(() => setPacket({
				scope,
				value
			}));
		}).catch(() => {
			if (!controller.signal.aborted) setFailure(scope);
		});
		return () => controller.abort();
	}, [
		scope,
		ready,
		phase,
		viewer,
		attempt
	]);
	return {
		value: ready && packet?.scope === scope ? packet.value : void 0,
		failed: failure === scope && packet?.scope !== scope,
		retry: () => retry((value) => value + 1)
	};
}
function useAnimeCatalog(input, filter, query, tagQuery, series = "", episodeOrder = false) {
	const progress = useLibrary((state) => state.progress), resumeProgress = useLibrary((state) => state.resumeProgress);
	const index = useAnimeJob(input, true, prepareAnimeCatalog);
	const continuing = useAnimeJob((0, import_react.useMemo)(() => ({
		index: index.value,
		progress,
		resumeProgress
	}), [
		index.value,
		progress,
		resumeProgress
	]), !!index.value, (scope, turn) => prepareAnimeContinue(scope.index.anime, (video) => resumeForVideo(scope, video), turn));
	const selection = useAnimeJob((0, import_react.useMemo)(() => ({
		index: index.value,
		continuing: filter === "continue" ? continuing.value : EMPTY,
		tags: input.tags,
		filter,
		query,
		series,
		episodeOrder
	}), [
		index.value,
		filter === "continue" ? continuing.value : EMPTY,
		input.tags,
		filter,
		query,
		series,
		episodeOrder
	]), !!index.value && (filter !== "continue" || !!continuing.value), (scope, turn) => selectAnimeTitles(scope.index, scope.continuing, scope.filter, scope.query, scope.tags, turn, {
		series: scope.series,
		episodeOrder: scope.episodeOrder
	}));
	const finder = useAnimeJob((0, import_react.useMemo)(() => ({
		index: index.value,
		tags: input.tags,
		tagQuery
	}), [
		index.value,
		input.tags,
		tagQuery
	]), !!index.value && !!tagQuery.trim(), (scope, turn) => findAnimeTagTitles(scope.index.catalog, scope.tagQuery, scope.tags, turn));
	return {
		index: index.value,
		continuing: continuing.value,
		rows: selection.value ?? EMPTY,
		matches: finder.value ?? EMPTY,
		pending: !selection.value,
		finderPending: !!tagQuery.trim() && !finder.value,
		failed: index.failed || continuing.failed || selection.failed || finder.failed,
		retry() {
			index.retry();
			continuing.retry();
			selection.retry();
			finder.retry();
		}
	};
}
function useAnimeQuery(value) {
	const [settled, setSettled] = (0, import_react.useState)(value);
	(0, import_react.useEffect)(() => {
		if (!value.trim()) {
			setSettled(value);
			return;
		}
		const timer = window.setTimeout(() => setSettled(value), 160);
		return () => window.clearTimeout(timer);
	}, [value]);
	return settled;
}
function AnimeSection() {
	const videos = useLibrary((s) => s.videos);
	const folders = useLibrary((s) => s.folders);
	const tags = useLibrary((s) => s.tags);
	const metadataProvenance = useLibrary((s) => s.metadataProvenance);
	const unavailable = useLibrary((s) => s.unavailable);
	const hiddenVideos = useLibrary((s) => s.hiddenVideos);
	const hideDemo = useLibrary((s) => s.hideDemo);
	const setVideoTags = useLibrary((s) => s.setVideoTags);
	const setSource = useLibrary((s) => s.setSource);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [series, setSeries] = (0, import_react.useState)("");
	const [episodeOrder, setEpisodeOrder] = (0, import_react.useState)(false);
	const [seriesLimit, setSeriesLimit] = (0, import_react.useState)(12);
	const [query, setQuery] = (0, import_react.useState)("");
	const [tagQuery, setTagQuery] = (0, import_react.useState)("");
	const settledTags = useSettledTags(tags, true);
	const settledQuery = useAnimeQuery(query), settledTagQuery = useAnimeQuery(tagQuery);
	const catalog = useAnimeCatalog((0, import_react.useMemo)(() => ({
		videos,
		folders,
		tags: settledTags,
		unavailable,
		hiddenVideos,
		hideDemo,
		metadataProvenance
	}), [
		videos,
		folders,
		settledTags,
		unavailable,
		hiddenVideos,
		hideDemo,
		metadataProvenance
	]), filter, settledQuery, settledTagQuery, series, episodeOrder);
	const animeCount = catalog.index?.anime.length, continueCount = catalog.continuing?.length;
	const filmCount = catalog.index?.filmCount, localCount = catalog.index?.localCount;
	const filtered = catalog.rows;
	const pending = catalog.pending || query !== settledQuery;
	const finderPending = catalog.finderPending || tagQuery !== settledTagQuery;
	const tagMatches = tagQuery === settledTagQuery ? catalog.matches : [];
	const markAnime = (video) => {
		const current = tags[video.id] ?? [];
		setVideoTags(video.id, [.../* @__PURE__ */ new Set([...current, "anime"])]);
	};
	const filters = [
		{
			id: "all",
			label: "All titles",
			count: animeCount
		},
		{
			id: "continue",
			label: "Continue",
			count: continueCount
		},
		{
			id: "series",
			label: "Series",
			count: animeCount === void 0 ? void 0 : animeCount - filmCount - (catalog.index?.specialCount ?? 0)
		},
		{
			id: "films",
			label: "Films",
			count: filmCount
		},
		{
			id: "specials",
			label: "OVAs & specials",
			count: catalog.index?.specialCount
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Anime library",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, { className: "size-4" }),
		title: "Keep anime on its own shelf.",
		copy: "A fast, local-first view for anime already in your Realhub catalog. Saved #anime tags and clear anime title/episode evidence keep it separate without copying or proxying third-party playback.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
				"aria-label": "Anime library summary",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Anime titles",
						value: animeCount ?? "…"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Continue watching",
						value: continueCount ?? "…"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Local titles",
						value: localCount ?? "…"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Films & specials",
						value: filmCount === void 0 ? "…" : filmCount + (catalog.index?.specialCount ?? 0)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-lg bg-elevated p-4 shadow-border sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Browse your shelf"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 max-w-2xl text-sm leading-6 text-muted",
							children: "Search stays inside Anime. Episode, series and film evidence keeps this shelf focused. Gameplay, reviews, trailers, music edits and unrelated description mentions stay in the general library."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => setSource("home"),
							children: "Add library media"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-col gap-3 lg:flex-row lg:items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: query,
							onChange: (event) => setQuery(event.target.value),
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
								"aria-pressed": filter === item.id,
								onClick: () => {
									setFilter(item.id);
									setSeries("");
								},
								children: [
									item.label,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-1 font-mono tabular-nums opacity-70",
										children: item.count ?? "…"
									})
								]
							}, item.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-xs text-muted",
							children: ["Order", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								"aria-label": "Anime title order",
								value: episodeOrder ? "episode" : "recent",
								onChange: (event) => setEpisodeOrder(event.target.value === "episode"),
								className: "ml-2 min-h-11 rounded-md border border-border bg-bg px-3 text-sm text-fg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "recent",
									children: "Recent additions"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "episode",
									children: "Series & episode order"
								})]
							})]
						}), series && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "min-h-11",
							variant: "secondary",
							onClick: () => setSeries(""),
							children: "Clear series selection"
						})]
					})
				]
			}),
			!!catalog.index?.series.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5 rounded-lg border border-border bg-surface p-4",
				"aria-label": "Anime series browser",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl text-fg",
						children: "Pick a series, then watch in order."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs leading-5 text-muted",
						children: "Season/episode numbers and fansub filenames determine order. Films and OVAs have their own filters; unnumbered titles remain searchable."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
						children: catalog.index.series.slice(0, seriesLimit).map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: series === group.key ? "default" : "secondary",
							className: "min-h-11 min-w-0 justify-between",
							"aria-pressed": series === group.key,
							onClick: () => {
								setSeries(group.key);
								setFilter("series");
								setEpisodeOrder(true);
								setQuery("");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: group.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "ml-2 shrink-0 text-xs",
								children: [group.count, " episodes"]
							})]
						}, group.key))
					}),
					seriesLimit < catalog.index.series.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						className: "mt-2 min-h-11",
						onClick: () => setSeriesLimit((value) => value + 12),
						children: "Show 12 more series"
					}),
					catalog.index.seriesOverflow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted",
						children: "Showing the first 512 series groups. Search still reaches every saved episode."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-anime-ready": !pending && !catalog.failed,
				"aria-busy": pending && !catalog.failed,
				children: catalog.failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					role: "alert",
					className: "mt-6 rounded-lg bg-elevated p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Anime titles could not be prepared." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3",
						variant: "secondary",
						onClick: catalog.retry,
						children: "Retry Anime"
					})]
				}) : pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "mt-6 text-sm text-muted",
					children: "Updating anime titles…"
				}) : filtered.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-6",
					"aria-label": "Anime catalog",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VirtualVideoGrid, {
						videos: filtered,
						variant: "grid",
						pageSize: 36
					}, `${filter}:${series}:${episodeOrder}:${settledQuery}`)]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium text-fg",
						children: "No matching anime titles yet."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-2xl text-sm leading-6 text-muted",
						children: "Add a local or authorized library source, then use the title finder below to give the right cards a saved #anime tag. Existing media, ratings, history, and resume points remain untouched."
					})]
				})
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
					tagQuery && finderPending && !catalog.failed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						className: "mt-3 text-sm text-muted",
						children: "Finding library titles…"
					}),
					tagQuery && !finderPending && !tagMatches.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "No catalog titles match that search."
					}),
					tagMatches.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-2",
						children: tagMatches.map((video) => {
							const alreadyAnime = Boolean(animeEvidence(video, tags[video.id], metadataProvenance[video.id]));
							const canMarkAnime = Boolean(animeEvidence(video, ["anime"]));
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
									disabled: alreadyAnime || !canMarkAnime,
									onClick: () => markAnime(video),
									children: alreadyAnime ? "In Anime" : !canMarkAnime ? "Related content · use Topics" : "Add #anime"
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
//#endregion
export { AnimeSection };
