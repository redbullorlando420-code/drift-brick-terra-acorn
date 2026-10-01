import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { Dn as useLibrary, at as hasFreshViewerCount, n as Input, t as Button } from "./input-CETQgBIY.mjs";
import { D as RefreshCw, Nt as Bot, g as Sparkles } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-guide-0f0P4PXe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AiGuide() {
	const videos = useLibrary((s) => s.videos);
	const tags = useLibrary((s) => s.tags);
	const favorites = useLibrary((s) => s.favorites);
	const likes = useLibrary((s) => s.likes);
	const history = useLibrary((s) => s.history);
	const openPreview = useLibrary((s) => s.openPreview);
	const [recommendationSeed, setRecommendationSeed] = (0, import_react.useState)(() => Date.now());
	const [prompt, setPrompt] = (0, import_react.useState)("What should I watch tonight?");
	const [answer, setAnswer] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const localPicks = (0, import_react.useMemo)(() => {
		const favoredTags = new Set(videos.filter((video) => favorites[video.id] || likes[video.id]).flatMap((video) => tags[video.id] ?? []));
		const watched = new Set(history.map((entry) => entry.id));
		const rank = (id) => {
			let value = recommendationSeed >>> 0;
			for (const char of id) value = Math.imul(value ^ char.charCodeAt(0), 73244475);
			return value >>> 0;
		};
		return [...videos].filter((video) => !watched.has(video.id)).map((video) => ({
			video,
			score: (favorites[video.id] ? 3 : 0) + (likes[video.id] ? 2 : 0) + (tags[video.id] ?? []).filter((tag) => favoredTags.has(tag)).length,
			random: rank(video.id)
		})).sort((a, b) => {
			return b.score - a.score || a.random - b.random;
		}).slice(0, 12).map((row) => row.video);
	}, [
		favorites,
		history,
		likes,
		recommendationSeed,
		tags,
		videos
	]);
	const liveNow = (0, import_react.useMemo)(() => videos.filter((video) => video.remote?.kind === "twitch" && video.remote.live).sort((a, b) => (hasFreshViewerCount(b.remote) ? b.remote?.viewers ?? 0 : 0) - (hasFreshViewerCount(a.remote) ? a.remote?.viewers ?? 0 : 0)), [videos]);
	const localAnswer = () => {
		if (/live|twitch|stream/i.test(prompt) && liveNow.length) return `Live on your followed Twitch channels:\n${liveNow.slice(0, 4).map((video, index) => `${index + 1}. ${video.remote?.channelName ?? video.name}${hasFreshViewerCount(video.remote) ? ` · ${video.remote?.viewers?.toLocaleString()} viewers` : ""}`).join("\n")}\n\nLive status comes from the latest refresh in Realhub. Open a card to watch it.`;
		return localPicks.length ? `Local recommendation${localPicks.length === 1 ? "" : "s"} for “${prompt}”:\n${localPicks.slice(0, 3).map((video, index) => `${index + 1}. ${video.name} — ${video.genre ?? "a library pick"}${(tags[video.id] ?? []).length ? ` · ${(tags[video.id] ?? []).slice(0, 2).join(", ")}` : ""}`).join("\n")}\n\nThe optional cloud guide is unavailable, so these picks were ranked privately from your library signals.` : "Add a few titles, tags, likes, or favorites and the local guide will start making picks.";
	};
	const ask = async () => {
		setBusy(true);
		setAnswer("");
		await new Promise((resolve) => window.setTimeout(resolve, 120));
		setAnswer(localAnswer());
		setBusy(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
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
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl text-fg",
						children: "Your current signals"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted",
						children: [
							history.length,
							" history signals · ",
							Object.keys(favorites).length,
							" favorites · ",
							Object.values(tags).flat().length,
							" tags"
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => setRecommendationSeed(Date.now()),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" }), "New recommendations"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
					children: localPicks.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => openPreview(video.id),
						className: "rounded-md bg-bg/45 px-3 py-3 text-left shadow-border hover:bg-bg",
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
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-lg border border-border bg-elevated/60 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium text-fg",
						children: "Twitch live check"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: liveNow.length ? `${liveNow.length} followed channel${liveNow.length === 1 ? "" : "s"} live in the latest refresh.` : "No followed channels are live in the latest refresh."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-full bg-accent/15 px-2 py-1 text-xs font-medium text-accent",
						children: [liveNow.length, " live"]
					})]
				}), liveNow.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: liveNow.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => openPreview(video.id),
						children: [video.remote?.channelName ?? video.name, hasFreshViewerCount(video.remote) ? ` · ${video.remote?.viewers?.toLocaleString()}` : ""]
					}, video.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-2 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: prompt,
					onChange: (event) => setPrompt(event.target.value),
					onKeyDown: (event) => {
						if (event.key === "Enter") ask();
					},
					"aria-label": "Library guide question"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					disabled: busy || !prompt.trim(),
					onClick: () => void ask(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-4" }), busy ? "Checking library…" : "Ask guide"]
				})]
			}),
			answer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 rounded-lg bg-elevated p-5 text-sm leading-6 text-fg shadow-border whitespace-pre-wrap",
				children: answer
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 flex flex-wrap gap-2",
				children: [
					"Who is live on Twitch?",
					"Something funny",
					"A tech video",
					"What fits my favorites?",
					"Show a surprise based on my tags"
				].map((suggestion) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					onClick: () => setPrompt(suggestion),
					children: suggestion
				}, suggestion))
			})
		]
	});
}
//#endregion
export { AiGuide };
