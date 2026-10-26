import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { ln as yieldCatalogTask } from "./live-rooms-CNGwnMZr.mjs";
import { $ as Button, An as youtubeDownloadTarget, Sn as useLibrary, gr as youtubeTextTags, y as fetchYoutubeVideoMetadata } from "./library-app-BtCPS7Tj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/youtube-tags-control-516_g-1Q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var labels = {
	"video-tag": "Creator video tag",
	hashtag: "Hashtag",
	chapter: "Chapter phrase",
	title: "Title",
	description: "Description"
};
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
						detail: `${metadata.keywords?.length ?? 0} creator tags · ${saved.tags} recommended tags${saved.locked ? " · your tag lock kept; suggestions available in the preview" : " · saved"}${metadata.description ? " · full description checked" : ""}`
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
	const evidence = video ? youtubeTextTags(video) : void 0;
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
			video && !!evidence?.tags.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "rounded-lg border border-border px-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
						className: "min-h-11 cursor-pointer py-3 text-xs font-medium",
						children: ["Recommended tags · ", evidence.tags.length]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-xs leading-5 text-muted",
						children: "Based on this video’s metadata. Creator tags, hashtags and chapter phrases have priority. Generic and promotional terms are filtered. Your saved edits take precedence."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						"aria-label": "Recommended YouTube tags",
						className: "grid gap-2 pb-3 sm:grid-cols-2",
						children: evidence.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "min-w-0 rounded bg-bg p-2 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "break-words font-medium",
								children: tag
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 block text-muted",
								children: labels[evidence.sources[tag]]
							})]
						}, tag))
					})
				]
			})
		]
	});
}
//#endregion
export { YoutubeTagsControl as t };
