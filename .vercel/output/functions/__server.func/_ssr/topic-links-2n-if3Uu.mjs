import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { Kt as sortCatalogRows, ct as isAdultPullKind, et as forEachCatalogEntry, tt as forEachCatalogSlice } from "./live-rooms-9iiWP3WP.mjs";
import { Dt as getWatchTime, F as useBrowseLibrary, G as useSessionPhase, K as createSettledInput, Ln as ratingPreference, X as Input, Z as Button, at as canonicalTopic, c as VirtualVideoGrid, dn as topicEvidenceForScan, h as catalogTurn, hn as watchTimeScore, k as openTopic, ln as toggleTagLike, on as tagIsLiked, pn as useLibrary, un as topicEvidence, wt as getRating } from "./library-app-VjV5eJfN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/topic-links-2n-if3Uu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var normalize = (text) => text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[-_#]+/g, " ");
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
async function selectTopicCatalog(input, selected, genre, provider, taste, turn, filters = {}) {
	const allowed = publicTitle(input), videos = [];
	const terms = normalize((filters.text ?? "").trim().slice(0, 200)).split(/\s+/).filter(Boolean).slice(0, 12);
	const related = /* @__PURE__ */ new Map();
	await forEachCatalogSlice(input.videos, (video) => {
		if (!allowed(video) || genre && video.genre !== genre || provider !== "all" && (video.remote?.kind ?? "local") !== provider) return;
		const links = selected || filters.evidence && filters.evidence !== "all" ? topicEvidenceForScan(video, input.tags[video.id]) : [];
		if (selected && !links.some((link) => link.topic === selected)) return;
		const relevant = selected ? links.filter((link) => link.topic === selected) : links;
		if (filters.evidence === "saved" && !relevant.some((link) => link.saved) || filters.evidence === "inferred" && (!relevant.length || relevant.some((link) => link.saved))) return;
		if (terms.length) {
			const text = normalize(`${video.name.slice(0, 1e3)} ${video.genre ?? ""} ${video.remote?.channelName ?? ""} ${(input.tags[video.id] ?? []).slice(0, 80).join(" ")}`);
			if (!terms.every((term) => text.includes(term))) return;
		}
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
		videos: filters.sort && filters.sort !== "catalog" ? await sortCatalogRows(videos, (a, b) => filters.sort === "title" ? a.name.localeCompare(b.name) : filters.sort === "taste" ? taste.score(b.id) - taste.score(a.id) || b.addedAt - a.addedAt : b.addedAt - a.addedAt, turn) : videos,
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
function useTopicCatalog(input, revision, selected, genre, provider, explorer, filters) {
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
		if (selection?.input === settled.input && selection.revision === settled.revision && selection.selected === selected && selection.genre === genre && selection.provider === provider && selection.filters === filters) return;
		const controller = new AbortController();
		setFailed(false);
		selectTopicCatalog(settled.input, selected, genre, provider, taste, catalogTurn(controller.signal), filters).then((data) => {
			if (!controller.signal.aborted) (0, import_react.startTransition)(() => setSelection({
				...settled,
				selected,
				genre,
				provider,
				filters,
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
		viewer,
		filters
	]);
	const summaryReady = summary?.input === input && summary.revision === revision;
	const selectionReady = selection?.input === input && selection.revision === revision && selection.selected === selected && selection.genre === genre && selection.provider === provider && selection.filters === filters;
	const sameVisibility = (previous) => previous.folders === input.folders && previous.unavailable === input.unavailable && previous.hiddenVideos === input.hiddenVideos && previous.hideDemo === input.hideDemo;
	const matchesReady = Boolean(selection && sameVisibility(selection.input) && selection.selected === selected && selection.genre === genre && selection.provider === provider && selection.filters === filters);
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
	const [text, setText] = (0, import_react.useState)(""), [settledText, setSettledText] = (0, import_react.useState)(""), [topicSearch, setTopicSearch] = (0, import_react.useState)("");
	const [order, setOrder] = (0, import_react.useState)("catalog"), [evidence, setEvidence] = (0, import_react.useState)("all");
	(0, import_react.useEffect)(() => {
		const timer = setTimeout(() => setSettledText(text), 180);
		return () => clearTimeout(timer);
	}, [text]);
	const [favoriteRevision, setFavoriteRevision] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const refresh = () => setFavoriteRevision((value) => value + 1);
		window.addEventListener("reelcase:rating-change", refresh);
		return () => window.removeEventListener("reelcase:rating-change", refresh);
	}, []);
	const selected = explorer ? canonicalTopic(query) : void 0;
	const selectedGenre = explorer && query.startsWith("genre:") ? query.slice(6) : void 0;
	const filters = (0, import_react.useMemo)(() => ({
		text: [!selected && !selectedGenre ? query : "", settledText].filter(Boolean).join(" "),
		sort: order,
		evidence
	}), [
		query,
		selected,
		selectedGenre,
		settledText,
		order,
		evidence
	]);
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
	]), favoriteRevision, selected, selectedGenre, provider, explorer, filters);
	const { videos: matching, related } = selection, genres = index.genres;
	const genreOffset = Math.min(genrePage * 48, Math.max(0, Math.ceil(genres.length / 48) - 1) * 48);
	const choose = (topic) => {
		setText("");
		setSettledText("");
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "mt-4 max-w-xl",
				value: topicSearch,
				maxLength: 120,
				onChange: (event) => setTopicSearch(event.target.value),
				"aria-label": "Find a topic",
				placeholder: "Find a topic, such as science or gaming"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: index.counts.filter(([topic]) => topic.includes(topicSearch.trim().toLowerCase().replace(/^#/, ""))).map(([topic, data]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-wrap gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "min-w-0 flex-1 basis-64",
							maxLength: 200,
							value: text,
							onChange: (event) => setText(event.target.value),
							placeholder: "Search these titles, saved tags or creators",
							"aria-label": "Search Topic Explorer titles"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							"aria-label": "Sort Topic Explorer",
							value: order,
							onChange: (event) => setOrder(event.target.value),
							className: "min-h-11 rounded-md border border-border bg-bg px-3 text-sm text-fg",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "catalog",
									children: "Library order"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "newest",
									children: "Newest added"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "title",
									children: "Title A–Z"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "taste",
									children: "Your taste"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							"aria-label": "Topic evidence filter",
							value: evidence,
							onChange: (event) => setEvidence(event.target.value),
							className: "min-h-11 rounded-md border border-border bg-bg px-3 text-sm text-fg",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "all",
									children: "All topic evidence"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "saved",
									children: "Saved tags only"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "inferred",
									children: "Inferred topics only"
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted",
					children: "Filters combine with the selected topic and source. The result cards show why each title is connected."
				}),
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
							setText("");
							setSettledText("");
							setEvidence("all");
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
					}, `${selected ?? ""}:${selectedGenre ?? ""}:${provider}:${settledText}:${order}:${evidence}`)
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
//#endregion
export { TopicLinks as t };
