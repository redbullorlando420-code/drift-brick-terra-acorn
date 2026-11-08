import { o as __toESM } from "../_runtime.mjs";
import { I as forEachCatalogSlice, c as adultFolderIds, gt as sortCatalogRows, n as ADULT_PULL_PROVIDERS } from "./twitch-retry-C3xxOucA.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { t as Button } from "./button-BBe1bZ7q.mjs";
import { Aa as reviewedAnimeInfo, z as animeReviewVisibility } from "./persist-BKzTZjAH.mjs";
import { Yt as Clapperboard } from "../_libs/lucide-react.mjs";
import { Gt as animeEvidence, Ot as reviewedPreferences, _ as VirtualVideoGrid, _n as Input, an as resumeForVideo, fn as useLibrary, ht as catalogTurn, rt as useSettledTags, ut as useSessionPhase } from "./library-app-B2g2Od4o.mjs";
import { a as hydrateAnimeReviews, i as getServerAnimeReviews, r as getAnimeReviews, s as subscribeAnimeReviews } from "./anime-review-store-DZrcxr5p.mjs";
import { AnimeReviewDesk, t as useAnimeReviews } from "./anime-review-Vgew4jZE.mjs";
import { s as HubShell, u as Stat } from "./hub-shared-ClIjxmr9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/anime-section-DOg3MEwl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function releaseInstant(text) {
	if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})$/.test(text)) throw Error("Use an ISO date/time with an explicit UTC offset, for example 2026-11-04T20:00:00-05:00.");
	const stamp = Date.parse(text);
	if (!Number.isFinite(stamp) || Number(text.slice(0, 4)) < 2e3 || Number(text.slice(0, 4)) > 2200) throw Error("Choose a valid expected date from 2000 to 2200.");
	const day = Date.parse(text.slice(0, 10) + "T00:00:00Z");
	if (new Date(day).toISOString().slice(0, 10) !== text.slice(0, 10)) throw Error("Expected release date is not a calendar date.");
	return stamp;
}
function readAnimeReleases(raw) {
	const r = raw;
	if (!r || r.version !== 1 || Object.keys(r).some((k) => !["version", "entries"].includes(k)) || !Array.isArray(r.entries) || r.entries.length > 32) throw Error("Unsupported anime watchlist. Existing entries were kept.");
	const ids = /* @__PURE__ */ new Set(), slots = /* @__PURE__ */ new Set();
	return {
		version: 1,
		entries: r.entries.map((v) => {
			if (!v || Object.keys(v).some((k) => ![
				"id",
				"seriesId",
				"numbering",
				"season",
				"episode",
				"expected",
				"zone",
				"postponed",
				"remind",
				"acknowledged",
				"source"
			].includes(k)) || typeof v.id !== "string" || !/^[\w-]{1,80}$/.test(v.id) || ids.has(v.id) || typeof v.seriesId !== "string" || !/^anime:[a-z0-9-]{1,80}$/i.test(v.seriesId) || !["season", "absolute"].includes(v.numbering) || !Number.isInteger(v.season) || v.season < (v.numbering === "absolute" ? 0 : 1) || v.season > (v.numbering === "absolute" ? 0 : 100) || !Number.isInteger(v.episode) || v.episode < 1 || v.episode > 1e4 || typeof v.expected !== "string" || typeof v.zone !== "string" || v.zone.length > 80 || [
				v.postponed,
				v.remind,
				v.acknowledged
			].some((x) => typeof x !== "boolean") || typeof v.source !== "string" || v.source.length > 200) throw Error("Invalid anime release observation.");
			releaseInstant(v.expected);
			try {
				new Intl.DateTimeFormat("en", { timeZone: v.zone }).format();
			} catch {
				throw Error("Choose a supported IANA time zone.");
			}
			const slot = [
				v.seriesId,
				v.numbering,
				v.season,
				v.episode
			].join("|");
			if (slots.has(slot)) throw Error("An observation already exists for this episode. Edit it instead.");
			slots.add(slot);
			ids.add(v.id);
			return { ...v };
		})
	};
}
function releaseObservation(row, reviews, available, now) {
	const matches = [];
	for (const id of available) {
		const e = reviews.episodes[id];
		if (e && e.seriesId === row.seriesId && e.numbering === row.numbering && e.season === row.season && e.episode === row.episode && e.kind === "episode") {
			matches.push(id);
			if (matches.length === 8) break;
		}
	}
	return {
		available: matches.length > 0,
		ids: matches.slice(0, 8),
		due: row.remind && !row.acknowledged && !row.postponed && !matches.length && releaseInstant(row.expected) <= now
	};
}
var animeReleases = reviewedPreferences("reelcase.anime-releases.v1", () => ({
	version: 1,
	entries: []
}), readAnimeReleases);
function AnimeReleaseWatchlist() {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		"data-anime-watchlist": true,
		className: "mt-5 rounded-lg border border-border bg-surface p-4",
		onToggle: (e) => setOpen(e.currentTarget.open),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
			className: "min-h-11 cursor-pointer content-center text-sm font-medium",
			children: "Expected anime releases"
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReleaseEditor, {})]
	});
}
function ReleaseEditor() {
	const reviews = (0, import_react.useSyncExternalStore)(subscribeAnimeReviews, getAnimeReviews, getServerAnimeReviews), videos = useLibrary((s) => s.videos), folders = useLibrary((s) => s.folders), hidden = useLibrary((s) => s.hiddenVideos), unavailable = useLibrary((s) => s.unavailable), [state, setState] = (0, import_react.useState)(() => animeReleases.read()), [error, setError] = (0, import_react.useState)(""), [note, setNote] = (0, import_react.useState)(""), [now, setNow] = (0, import_react.useState)(Date.now), [available, setAvailable] = (0, import_react.useState)();
	const scope = (0, import_react.useMemo)(() => ({
		videos,
		folders,
		hidden,
		unavailable,
		reviews: reviews.ledger,
		entries: state.entries
	}), [
		videos,
		folders,
		hidden,
		unavailable,
		reviews.ledger,
		state.entries
	]);
	const blank = () => ({
		id: crypto.randomUUID(),
		seriesId: Object.keys(reviews.ledger.series)[0] ?? "",
		numbering: "season",
		season: 1,
		episode: 1,
		expected: "",
		zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		postponed: false,
		remind: false,
		acknowledged: false,
		source: "Owner-entered observation"
	}), [draft, setDraft] = (0, import_react.useState)(blank);
	(0, import_react.useEffect)(() => {
		hydrateAnimeReviews();
	}, []);
	(0, import_react.useEffect)(() => {
		const c = new AbortController(), ids = /* @__PURE__ */ new Set(), visible = animeReviewVisibility(scope), wanted = new Set(state.entries.map((r) => r.seriesId)), permitted = new Set(folders.filter((f) => !f.needsPermission && !f.adult).map((f) => f.id));
		forEachCatalogSlice(videos, (v) => {
			const e = reviews.ledger.episodes[v.id];
			if (e && wanted.has(e.seriesId) && visible(v) && permitted.has(v.folderId)) ids.add(v.id);
		}, catalogTurn(c.signal)).then(() => {
			if (!c.signal.aborted) setAvailable({
				input: scope,
				ids
			});
		}).catch(() => {});
		return () => c.abort();
	}, [scope]);
	const act = (fn) => {
		try {
			fn();
			setError("");
		} catch (e) {
			setError(e instanceof Error ? e.message : "Release could not be saved.");
		}
	};
	const commit = (entries) => setState(animeReleases.write(readAnimeReleases({
		version: 1,
		entries
	})));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-6 text-muted",
				children: "Opt-in, owner-entered expectations for reviewed series. Dates never establish availability. Reminders are checked only here while the app is open, on entry or Refresh; no background or closed-app delivery is promised."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3 sm:grid-cols-2",
				onSubmit: (e) => {
					e.preventDefault();
					act(() => {
						if (!reviews.ledger.series[draft.seriesId]) throw Error("First review this series in the anime series/episode tools.");
						commit([...state.entries.filter((r) => r.id !== draft.id), {
							...draft,
							acknowledged: false
						}]);
						setDraft(blank());
						setNote("Release observation saved. Editing replaces its reminder identity.");
					});
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "space-y-1 text-sm",
						children: ["Reviewed series", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							"aria-label": "Release series",
							className: "min-h-11 w-full rounded-md border border-border bg-bg px-3",
							value: draft.seriesId,
							onChange: (e) => setDraft({
								...draft,
								seriesId: e.target.value
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Choose reviewed series"
							}), Object.values(reviews.ledger.series).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: s.id,
								children: [
									s.title,
									" · ",
									s.release
								]
							}, s.id))]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "space-y-1 text-sm",
						children: ["Numbering", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							"aria-label": "Release numbering",
							className: "min-h-11 w-full rounded-md border border-border bg-bg px-3",
							value: draft.numbering,
							onChange: (e) => setDraft({
								...draft,
								numbering: e.target.value,
								season: e.target.value === "absolute" ? 0 : 1
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "season",
								children: "Season / episode"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "absolute",
								children: "Absolute episode"
							})]
						})]
					}),
					["season", "episode"].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "space-y-1 text-sm",
						children: [k, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"aria-label": "Release " + k,
							type: "number",
							value: draft[k],
							onChange: (e) => setDraft({
								...draft,
								[k]: Number(e.target.value)
							})
						})]
					}, k)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "space-y-1 text-sm",
						children: ["Expected time (ISO with UTC offset)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"aria-label": "Expected release time",
							placeholder: "2026-11-04T20:00:00-05:00",
							value: draft.expected,
							onChange: (e) => setDraft({
								...draft,
								expected: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "space-y-1 text-sm",
						children: ["Display time zone", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"aria-label": "Release time zone",
							value: draft.zone,
							onChange: (e) => setDraft({
								...draft,
								zone: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "space-y-1 text-sm",
						children: ["Observation source / note", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							"aria-label": "Release observation source",
							maxLength: 200,
							value: draft.source,
							onChange: (e) => setDraft({
								...draft,
								source: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: ["postponed", "remind"].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-11 items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: draft[k],
								onChange: (e) => setDraft({
									...draft,
									[k]: e.target.checked
								})
							}), k === "postponed" ? "Postponed (no due reminder)" : "Remind me here when due"]
						}, k))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "min-h-11",
							children: "Save release observation"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setDraft(blank()),
							children: "Cancel release edit"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => setNow(Date.now()),
					children: "Refresh release reminders"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => {
						setState(animeReleases.read());
						setError(animeReleases.error());
					},
					children: "Reload watchlist"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "break-words text-xs text-muted",
				children: [
					"Checked ",
					new Date(now).toLocaleString(),
					". Explicit offsets distinguish repeated daylight-saving hours; changing display zone changes no stored instant."
				]
			}),
			state.entries.map((row) => {
				const observation = available?.input === scope ? releaseObservation(row, reviews.ledger, available.ids, now) : void 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					"data-release-id": row.id,
					className: "space-y-2 rounded-lg border border-border p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "font-medium",
							children: [
								reviews.ledger.series[row.seriesId]?.title ?? "Reviewed series unavailable",
								" ·",
								" ",
								row.numbering === "absolute" ? "Absolute" : `Season ${row.season}`,
								" episode",
								" ",
								row.episode
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								"Expected:",
								" ",
								new Intl.DateTimeFormat(void 0, {
									dateStyle: "medium",
									timeStyle: "short",
									timeZone: row.zone
								}).format(Date.parse(row.expected)),
								" ",
								"· ",
								row.zone
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "break-words text-xs text-muted",
							children: [
								"Owner-entered · ",
								row.source || "Source not recorded",
								" ·",
								" ",
								row.postponed ? "Postponed" : observation?.available ? "Available: matching reviewed library observation" : observation ? "Expected only; no matching available reviewed episode" : "Checking library observations…"
							]
						}),
						observation?.due && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							role: "status",
							className: "text-sm text-accent",
							children: "Reminder due here. Expected time passed; this does not confirm a release or library arrival."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									onClick: () => setDraft(row),
									children: "Edit release"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									onClick: () => act(() => commit(state.entries.map((r) => r.id === row.id ? {
										...r,
										acknowledged: true
									} : r))),
									children: "Acknowledge reminder"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									onClick: () => act(() => commit(state.entries.filter((r) => r.id !== row.id))),
									children: "Remove release"
								}),
								observation?.ids.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									onClick: () => useLibrary.getState().openPreview(id),
									children: "Open available episode"
								}, id))
							]
						})
					]
				}, row.id);
			}),
			!state.entries.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No expected releases saved. Create or review a series below before adding an observation."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				className: "text-sm text-muted",
				children: note
			}),
			(error || animeReleases.error()) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-sm text-danger",
				children: error || animeReleases.error()
			})
		]
	});
}
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
	const visibleReview = animeReviewVisibility({
		folders: input.folders,
		hidden: input.hiddenVideos,
		unavailable: input.unavailable
	});
	const reviewed = /* @__PURE__ */ new Map(), eligibleEpisodes = Object.create(null);
	const catalog = [], found = [];
	await forEachCatalogSlice(input.videos, (video) => {
		if (adult.has(video.folderId) || adultProviders.has(video.remote?.kind ?? "") || input.unavailable[video.id] || input.hiddenVideos[video.id] || input.hideDemo && video.isSample) return;
		catalog.push(video);
		const review = input.animeLedger?.episodes[video.id], series = review && input.animeLedger?.series[review.seriesId];
		if (series && visibleReview(video)) {
			eligibleEpisodes[video.id] = review;
			found.push(video);
			const group = reviewed.get(series.id) ?? {
				id: series.id,
				videos: []
			};
			group.videos.push(video);
			reviewed.set(series.id, group);
		} else if (animeEvidence(video, input.tags[video.id] ?? EMPTY_TAGS, input.metadataProvenance?.[video.id])) found.push(video);
	}, turn);
	const anime = await sortCatalogRows(found, (a, b) => b.addedAt - a.addedAt, turn);
	const films = new Uint8Array(anime.length), specials = new Uint8Array(anime.length);
	const series = /* @__PURE__ */ new Map();
	let seriesOverflow = false;
	let localCount = 0, filmCount = 0, specialCount = 0;
	await forEachCatalogSlice(anime, (video, index) => {
		if (!video.remote) localCount++;
		const confirmed = !!input.animeLedger?.episodes[video.id] && visibleReview(video), info = reviewedAnimeInfo(video, confirmed ? input.animeLedger : void 0);
		if (!confirmed && film(video, input.tags[video.id] ?? EMPTY_TAGS)) {
			films[index] = 1;
			filmCount++;
		} else if (info.format === "special" || !confirmed && (input.tags[video.id] ?? EMPTY_TAGS).some((tag) => /(?:^|[- ])(?:ova|ona|special)$/i.test(tag))) {
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
		seriesOverflow,
		...input.animeLedger ? {
			reviewedGroups: [...reviewed.values()],
			animeLedger: {
				...input.animeLedger,
				episodes: eligibleEpisodes,
				series: Object.fromEntries([...reviewed.keys()].map((id) => [id, input.animeLedger.series[id]]))
			}
		} : {}
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
		if (options.series && reviewedAnimeInfo(video, index.animeLedger).key !== options.series) return;
		const e = index.animeLedger?.episodes[video.id], s = e && index.animeLedger?.series[e.seriesId];
		if (!needle || matches(video, tags[video.id] ?? EMPTY_TAGS, needle) || s && `${s.title} ${s.release} ${s.aliases.join(" ")}`.toLowerCase().includes(needle)) result.push(video);
	}, turn);
	if (options.episodeOrder) {
		const decorated = [];
		await forEachCatalogSlice(result, (video) => {
			decorated.push({
				video,
				info: reviewedAnimeInfo(video, index.animeLedger)
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
	const reviews = useAnimeReviews();
	const index = useAnimeJob((0, import_react.useMemo)(() => ({
		...input,
		animeLedger: reviews.ledger
	}), [input, reviews.ledger]), reviews.ready, prepareAnimeCatalog);
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimeReleaseWatchlist, {}),
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimeReviewDesk, { index: catalog.index }),
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
						children: "Reviewed identities determine approved groups. Other shortcuts use unverified season/episode parsing; review ambiguous remakes above. Films, OVAs and unnumbered titles remain searchable."
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
								children: [
									group.count,
									" ",
									group.key.startsWith("anime:") ? "reviewed sources" : "parsed sources"
								]
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
