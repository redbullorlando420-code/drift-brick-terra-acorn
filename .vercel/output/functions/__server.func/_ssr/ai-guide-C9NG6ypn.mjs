import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { D as RefreshCw, It as Bot, Y as LoaderCircle, g as Sparkles } from "../_libs/lucide-react.mjs";
import { G as Button, Gn as useLibrary, K as Input, M as useBrowseLibrary, On as sortCatalogRows, Tt as forEachCatalogSlice, V as useSessionPhase, _t as createBoundedPicks, h as createSettledInput, in as measureInteraction, kn as sparseRecordScan, m as catalogTurn, qt as hasFreshViewerCount, wt as forEachCatalogEntry } from "./library-app-BzjHGYQD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-guide-C9NG6ypn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function shuffleRank(id, seed) {
	let value = seed >>> 0;
	for (const char of id) value = Math.imul(value ^ char.charCodeAt(0), 73244475);
	return value >>> 0;
}
/** Retain twelve scored candidates rather than sorting/cloning the catalog.
* All scans (including saved signals and live sorting) yield to current input. */
async function prepareGuide(input, seed, now, turn) {
	const { videos, favorites, likes, tags, history } = input;
	const favoredTags = /* @__PURE__ */ new Set(), watched = /* @__PURE__ */ new Set(), live = [];
	let favoriteCount = 0, tagCount = 0;
	await forEachCatalogSlice(history, (entry) => {
		watched.add(entry.id);
	}, turn);
	await forEachCatalogEntry(sparseRecordScan(favorites, false), (row) => {
		if (row) favoriteCount++;
	}, turn);
	await forEachCatalogEntry(sparseRecordScan(tags), (row) => {
		if (row) tagCount += row[1].length;
	}, turn);
	await forEachCatalogSlice(videos, (video) => {
		if (favorites[video.id] || likes[video.id]) for (const tag of tags[video.id] ?? []) favoredTags.add(tag);
		if (video.remote?.kind === "twitch" && video.remote.live) live.push(video);
	}, turn);
	const best = createBoundedPicks(12, (a, b) => b.score - a.score || a.rank - b.rank || a.index - b.index);
	await forEachCatalogSlice(videos, (video, index) => {
		if (watched.has(video.id)) return;
		let score = (favorites[video.id] ? 3 : 0) + (likes[video.id] ? 2 : 0);
		for (const tag of tags[video.id] ?? []) if (favoredTags.has(tag)) score++;
		best.add({
			video,
			score,
			rank: shuffleRank(video.id, seed),
			index
		});
	}, turn);
	const viewers = (video) => hasFreshViewerCount(video.remote, now) ? video.remote.viewers : 0;
	const orderedLive = await sortCatalogRows(live, (a, b) => viewers(b) - viewers(a), turn);
	return {
		picks: best.finish().map((row) => row.video),
		live: orderedLive,
		historyCount: history.length,
		favoriteCount,
		tagCount
	};
}
/** Asking reads only prepared short lists and never rescans the library. */
function guideAnswer(prompt, snapshot, tags) {
	if (/live|twitch|stream/i.test(prompt) && snapshot.live.length) return `Live on your followed Twitch channels:\n${snapshot.live.slice(0, 4).map((video, index) => `${index + 1}. ${video.remote?.channelName ?? video.name}${hasFreshViewerCount(video.remote) ? ` · ${video.remote?.viewers?.toLocaleString()} viewers` : ""}`).join("\n")}\n\nLive status comes from the latest refresh in Realhub. Open a card to watch it.`;
	return snapshot.picks.length ? `Local recommendation${snapshot.picks.length === 1 ? "" : "s"} for “${prompt}”:\n${snapshot.picks.slice(0, 3).map((video, index) => `${index + 1}. ${video.name} — ${video.genre ?? "a library pick"}${(tags[video.id] ?? []).length ? ` · ${(tags[video.id] ?? []).slice(0, 2).join(", ")}` : ""}`).join("\n")}\n\nThe optional cloud guide is unavailable, so these picks were ranked privately from your library signals.` : "Add a few titles, tags, likes, or favorites and the local guide will start making picks.";
}
var LIVE_PAGE_SIZE = 24;
var SUGGESTIONS = [
	"Who is live on Twitch?",
	"Something funny",
	"A tech video",
	"What fits my favorites?",
	"Show a surprise based on my tags"
];
function AiGuide() {
	const videos = useBrowseLibrary((s) => s.videos), tags = useBrowseLibrary((s) => s.tags);
	const favorites = useBrowseLibrary((s) => s.favorites), likes = useBrowseLibrary((s) => s.likes);
	const history = useBrowseLibrary((s) => s.history);
	const viewer = useLibrary((s) => Boolean(s.activeId || s.previewId)), phase = useSessionPhase();
	const input = (0, import_react.useMemo)(() => ({
		videos,
		tags,
		favorites,
		likes,
		history
	}), [
		videos,
		tags,
		favorites,
		likes,
		history
	]);
	const [settled, setSettled] = (0, import_react.useState)(input), [seed, setSeed] = (0, import_react.useState)(() => Date.now());
	const [packet, setPacket] = (0, import_react.useState)();
	const [failed, setFailed] = (0, import_react.useState)(false);
	const settler = (0, import_react.useMemo)(() => createSettledInput(setSettled, {
		quietMs: 600,
		maxWaitMs: 4e3
	}), []);
	(0, import_react.useEffect)(() => {
		if (input !== settled) settler.push(input);
		else settler.cancel();
	}, [
		input,
		settled,
		settler
	]);
	(0, import_react.useEffect)(() => () => settler.cancel(), [settler]);
	(0, import_react.useEffect)(() => {
		if (phase !== "active" || viewer || packet?.input === settled && packet.seed === seed) return;
		const controller = new AbortController();
		setFailed(false);
		prepareGuide(settled, seed, Date.now(), catalogTurn(controller.signal)).then((data) => {
			if (!controller.signal.aborted) (0, import_react.startTransition)(() => setPacket({
				input: settled,
				seed,
				data
			}));
		}).catch(() => {
			if (!controller.signal.aborted) setFailed(true);
		});
		return () => controller.abort();
	}, [
		settled,
		seed,
		phase,
		viewer
	]);
	const data = packet?.input.videos === input.videos ? packet.data : void 0;
	const pending = !failed && (packet?.input !== input || packet.seed !== seed);
	const mix = () => {
		measureInteraction("navigation");
		settler.cancel();
		setSettled(input);
		setSeed((value) => value + 1);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-guide-catalog": true,
		"data-guide-pending": pending,
		className: "w-full max-w-none rounded-xl bg-surface p-5 shadow-border sm:p-6 xl:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-accent uppercase",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), "Library guide"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl text-fg sm:text-5xl",
				children: "Useful answers from local signals."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-xl text-sm text-muted",
				children: "This guide only uses saved favorites, likes, tags, viewing history, and the most recent Twitch refresh. It does not send your catalog or files to a cloud model."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl text-fg",
							children: "Your current signals"
						}), data && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							"data-guide-signals": true,
							className: "mt-1 text-xs text-muted",
							children: [
								data.historyCount,
								" history signals · ",
								data.favoriteCount,
								" favorites · ",
								data.tagCount,
								" tags"
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							className: "h-11 sm:h-9",
							onClick: mix,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" }), "New recommendations"]
						})]
					}),
					pending && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						role: "status",
						className: "mt-3 flex items-center gap-2 text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }), data ? "Updating your recommendations…" : "Preparing your library signals…"]
					}),
					failed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "mt-3 text-sm text-muted",
						children: "Library signals could not be prepared. Try New recommendations again."
					}),
					data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuidePicks, {
						data,
						tags
					})
				]
			}),
			data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuideLive, { live: data.live }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuideQuestion, {
				data,
				tags
			})
		]
	});
}
var GuidePicks = (0, import_react.memo)(function GuidePicks({ data, tags }) {
	const openPreview = useLibrary((s) => s.openPreview);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-guide-picks": true,
		className: "mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
		children: data.picks.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => openPreview(video.id),
			className: "min-w-0 rounded-md bg-bg/45 px-3 py-3 text-left shadow-border hover:bg-bg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate text-sm font-medium text-fg",
				children: video.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 truncate text-xs text-muted",
				children: [
					video.remote?.channelName ?? video.genre ?? "Library pick",
					" · ",
					(tags[video.id] ?? []).slice(0, 3).join(", ") || "Fresh discovery"
				]
			})]
		}, video.id))
	});
});
var GuideLive = (0, import_react.memo)(function GuideLive({ live }) {
	const openPreview = useLibrary((s) => s.openPreview);
	const [page, setPage] = (0, import_react.useState)(0);
	const lastPage = Math.max(0, Math.ceil(live.length / LIVE_PAGE_SIZE) - 1), current = Math.min(page, lastPage);
	(0, import_react.useEffect)(() => setPage(0), [live]);
	const move = (page) => {
		measureInteraction("navigation");
		setPage(page);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-5 rounded-lg border border-border bg-elevated/60 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium text-fg",
					children: "Twitch live check"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted",
					children: live.length ? `${live.length} followed channel${live.length === 1 ? "" : "s"} live in the latest refresh.` : "No followed channels are live in the latest refresh."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "shrink-0 rounded-full bg-accent/15 px-2 py-1 text-xs font-medium text-accent",
					children: [live.length, " live"]
				})]
			}),
			live.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"data-guide-live": true,
				className: "mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
				children: live.slice(current * LIVE_PAGE_SIZE, (current + 1) * LIVE_PAGE_SIZE).map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					className: "h-11 min-w-0 justify-start sm:h-9",
					onClick: () => openPreview(video.id),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "truncate",
						children: [video.remote?.channelName ?? video.name, hasFreshViewerCount(video.remote) ? ` · ${video.remote?.viewers?.toLocaleString()}` : ""]
					})
				}, video.id))
			}),
			lastPage > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						className: "h-11 sm:h-9",
						disabled: current === 0,
						onClick: () => move(current - 1),
						children: "Previous live channels"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted",
						"aria-live": "polite",
						children: [
							"Page ",
							current + 1,
							" of ",
							lastPage + 1
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						className: "h-11 sm:h-9",
						disabled: current === lastPage,
						onClick: () => move(current + 1),
						children: "Next live channels"
					})
				]
			})
		]
	});
});
function GuideQuestion({ data, tags }) {
	const [prompt, setPrompt] = (0, import_react.useState)("What should I watch tonight?"), [answer, setAnswer] = (0, import_react.useState)("");
	const ask = () => {
		if (!data || !prompt.trim()) return;
		measureInteraction("search");
		setAnswer(guideAnswer(prompt, data, tags));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 flex flex-col gap-2 sm:flex-row",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: prompt,
				onChange: (event) => {
					measureInteraction("search");
					setPrompt(event.target.value);
				},
				onKeyDown: (event) => {
					if (event.key === "Enter" && !event.nativeEvent.isComposing) ask();
				},
				"aria-label": "Library guide question"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				disabled: !data || !prompt.trim(),
				onClick: ask,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-4" }), "Ask guide"]
			})]
		}),
		answer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-guide-answer": true,
			className: "mt-5 rounded-lg bg-elevated p-5 text-sm leading-6 text-fg shadow-border whitespace-pre-wrap",
			children: answer
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-5 flex flex-wrap gap-2",
			children: SUGGESTIONS.map((suggestion) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "secondary",
				className: "h-11 sm:h-9",
				onClick: () => {
					measureInteraction("search");
					setPrompt(suggestion);
				},
				children: suggestion
			}, suggestion))
		})
	] });
}
//#endregion
export { AiGuide };
