import { o as __toESM } from "../_runtime.mjs";
import { G as mineRedditCommentTags, J as redditTitleTokens, O as adultTextFetishTags } from "./adult-reddit-tags-D2uyB_M1.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { Dn as useLibrary, L as fetchAdultComments } from "./input-CETQgBIY.mjs";
import { B as MessageCircle, vt as ExternalLink } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/adult-comments-BS7w048B.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function twitchVodEmbedId(value) {
	const clean = value.trim();
	if (!clean) return "";
	return /^\d+$/.test(clean) ? `v${clean}` : clean;
}
/**
* Build Twitch's documented embed route from current catalog metadata. Older
* history cards can retain a normal twitch.tv watch URL, which Twitch refuses
* to frame. This converts those records to player/clips endpoints and sends
* precisely the page host required by Twitch's parent check.
*/
function twitchEmbedUrl(remote, parentHost) {
	const parent = parentHost.trim().toLowerCase();
	if (!parent) return null;
	const candidates = [remote.embedUrl, remote.watchUrl].filter((value) => Boolean(value?.trim()));
	let url;
	for (const candidate of candidates) try {
		const parsed = new URL(candidate);
		const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
		if (host === "player.twitch.tv" || host === "clips.twitch.tv") {
			url = parsed;
			if (host === "player.twitch.tv") {
				const video = url.searchParams.get("video");
				if (video) url.searchParams.set("video", twitchVodEmbedId(video));
			}
			break;
		}
		if (!host.endsWith("twitch.tv")) continue;
		const videoId = parsed.pathname.match(/\/videos\/([0-9]+)/i)?.[1];
		const clip = parsed.pathname.match(/\/clip\/([^/?#]+)/i)?.[1];
		const channel = parsed.pathname.split("/").filter(Boolean)[0];
		if (videoId) url = new URL(`https://player.twitch.tv/?video=${encodeURIComponent(twitchVodEmbedId(videoId))}`);
		else if (clip) url = new URL(`https://clips.twitch.tv/embed?clip=${encodeURIComponent(clip)}`);
		else if (channel) url = new URL(`https://player.twitch.tv/?channel=${encodeURIComponent(channel)}`);
		if (url) break;
	} catch {}
	if (!url && remote.videoId) url = /^\d+$/.test(remote.videoId) ? new URL(`https://player.twitch.tv/?video=${encodeURIComponent(twitchVodEmbedId(remote.videoId))}`) : new URL(`https://clips.twitch.tv/embed?clip=${encodeURIComponent(remote.videoId)}`);
	if (!url) return null;
	url.searchParams.delete("parent");
	url.searchParams.set("parent", parent);
	url.searchParams.set("autoplay", "true");
	return url.toString();
}
var COMMENT_KINDS = /* @__PURE__ */ new Set([
	"reddit",
	"youtube",
	"twitch"
]);
function supportsRemoteComments(kind) {
	return Boolean(kind && COMMENT_KINDS.has(kind));
}
function AdultComments({ video }) {
	const setVideoTags = useLibrary((s) => s.setVideoTags);
	const setVideoComments = useLibrary((s) => s.setVideoComments);
	const [comments, setComments] = (0, import_react.useState)(video.remote?.comments ?? []);
	const [note, setNote] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [reload, setReload] = (0, import_react.useState)(0);
	const [opened, setOpened] = (0, import_react.useState)(video.remote?.kind !== "youtube");
	const [visibleRows, setVisibleRows] = (0, import_react.useState)(20);
	const lastLoadedReload = (0, import_react.useRef)(-1);
	const linkedRedgifs = Boolean(video.remote?.sourceKinds?.includes("redgifs"));
	const kind = video.remote?.kind;
	const providerVideoId = video.remote?.videoId || (kind === "youtube" ? video.remote?.watchUrl?.match(/[?&]v=([A-Za-z0-9_-]{11})/)?.[1] : void 0);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		if (!opened) return;
		if (!supportsRemoteComments(kind) || !providerVideoId) {
			setComments(video.remote?.comments ?? []);
			setNote(supportsRemoteComments(kind) ? "" : "No documented public comment feed for this source.");
			return;
		}
		if (kind === "twitch" && (video.extension === "clip" || video.id.startsWith("tw:c:"))) {
			setComments(video.remote?.comments ?? []);
			setNote("Twitch clips do not expose VOD chat replay.");
			return;
		}
		if (video.remote?.comments?.length && (!reload || lastLoadedReload.current === reload)) {
			setComments(video.remote.comments);
			setNote("");
			setLoading(false);
			return;
		}
		setLoading(true);
		(async () => {
			try {
				const result = await fetchAdultComments({ data: {
					kind: kind ?? "",
					videoId: providerVideoId,
					watchUrl: video.remote?.watchUrl ?? ""
				} });
				if (cancelled) return;
				lastLoadedReload.current = reload;
				setComments(result.comments);
				setNote(linkedRedgifs && result.comments.length ? `${result.note} Linked Redgifs media stays attached to this original Reddit thread.` : result.note);
				if (result.comments.length) {
					setVideoComments(video.id, result.comments);
					if (kind === "reddit") {
						const blob = result.comments.map((c) => c.body).join(" ");
						const mined = [
							...mineRedditCommentTags(blob, 24),
							...adultTextFetishTags(blob, 16),
							...redditTitleTokens(video.name, 8)
						];
						if (mined.length) {
							const existing = useLibrary.getState().tags[video.id] ?? [];
							const merged = [.../* @__PURE__ */ new Set([...existing, ...mined])].slice(0, 120);
							setVideoTags(video.id, merged);
						}
					}
				}
			} catch (err) {
				if (!cancelled) setNote(err instanceof Error ? err.message : "Comments unavailable.");
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [
		opened,
		linkedRedgifs,
		kind,
		video.id,
		video.extension,
		video.name,
		providerVideoId,
		video.remote?.watchUrl,
		video.remote?.comments,
		reload,
		setVideoTags,
		setVideoComments
	]);
	if (!supportsRemoteComments(kind)) return null;
	const authorPrefix = kind === "reddit" ? "u/" : kind === "youtube" ? "" : "";
	const chatRows = kind === "youtube" ? comments.filter((row) => row.kind === "chat") : [];
	const commentRows = kind === "youtube" ? comments.filter((row) => row.kind !== "chat") : comments;
	const heading = linkedRedgifs ? "Reddit comments for linked Redgifs media" : kind === "twitch" ? "VOD chat" : kind === "youtube" && chatRows.length ? "Chat + comments" : "Comments";
	const renderList = (rows, emptyLabel) => rows.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-2 max-h-48 space-y-2 overflow-y-auto",
		children: rows.slice(0, visibleRows).map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "rounded-sm bg-elevated/60 px-2 py-1.5 text-xs text-fg",
			children: [comment.author && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "font-medium text-accent",
				children: [
					authorPrefix,
					comment.author,
					typeof comment.score === "number" ? ` · ${comment.score}` : "",
					" · "
				]
			}), comment.body]
		}, comment.id))
	}) : emptyLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 text-xs text-muted",
		children: emptyLabel
	}) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-3 rounded-lg border border-border bg-bg/40 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			"aria-expanded": opened,
			onClick: () => setOpened((value) => !value),
			className: "flex min-h-9 items-center gap-2 text-xs font-medium tracking-[0.14em] text-accent uppercase",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-3.5" }),
				" ",
				heading,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted",
					children: opened ? "Hide" : "Show"
				})
			]
		}), opened && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			kind === "youtube" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "mt-2 text-xs text-accent underline",
				disabled: loading,
				onClick: () => setReload((value) => value + 1),
				children: ["Refresh public comments", comments.length ? ` · ${comments.filter((row) => row.kind !== "chat").length} threads` : ""]
			}),
			loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted",
				children: "Loading comments…"
			}),
			!loading && note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted",
				children: note
			}),
			!loading && kind === "youtube" && (chatRows.length > 0 || commentRows.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 space-y-3",
				children: [chatRows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium uppercase tracking-wider text-subtle",
					children: "Live chat / replay"
				}), renderList(chatRows)] }), commentRows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium uppercase tracking-wider text-subtle",
					children: "Comments"
				}), renderList(commentRows)] })]
			}),
			!loading && kind !== "youtube" && renderList(commentRows),
			!loading && Math.max(chatRows.length, commentRows.length) > visibleRows && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-2 min-h-9 text-xs text-accent underline",
				onClick: () => setVisibleRows((value) => value + 20),
				children: "Show more"
			}),
			!loading && kind === "reddit" && !commentRows.length && video.remote?.watchUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: video.remote.watchUrl,
				target: "_blank",
				rel: "noreferrer",
				className: "mt-3 inline-flex min-h-8 items-center gap-1 text-xs font-medium text-accent hover:underline",
				children: ["Open discussion on Reddit ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" })]
			})
		] })]
	});
}
//#endregion
export { supportsRemoteComments as n, twitchEmbedUrl as r, AdultComments as t };
