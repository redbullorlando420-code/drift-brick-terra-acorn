import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { E as getCreatorRating, Ft as tagIsLiked, Jt as Input, Lt as toggleCreatorLike, Rt as toggleTagLike, Vt as useLibrary, et as ratingPreference, it as resolvePlayUrl, j as getRating, jt as setRating, kt as setCreatorRating, qt as Button, tt as recordWatchTime, x as creatorIsLiked, zt as topicEvidence } from "./store-uZbLuJol.mjs";
import { I as isAdultImageKind, R as isAdultPullKind } from "./adult-pull-cache-CM6xh6_t.mjs";
import { Nt as ArrowLeft, f as ThumbsUp, h as Star, ht as ExternalLink, it as Glasses, k as Play, n as X, nt as Heart, p as Tag } from "../_libs/lucide-react.mjs";
import { t as openTopic } from "./topic-navigation-CjFyUSel.mjs";
import { n as supportsRemoteComments, r as twitchEmbedUrl, t as AdultComments } from "./adult-comments-Is6oMx6A.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pre-video-DkSg26ay.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EMPTY_TAGS = [];
function previewShuffle(id, seed) {
	let value = seed >>> 0;
	for (let index = 0; index < id.length; index += 1) value = Math.imul(value ^ id.charCodeAt(index), 73244475);
	return value >>> 0;
}
function isExcludedPreviewCandidate(video) {
	return Boolean(video.isSample) || /\b(blender|big buck bunny|cosmos laundromat|tears of steel|elephants dream|sintel|night rain|empty house|golden coast|tungsten reel)\b/i.test(`${video.name} ${video.remote?.channelName ?? ""} ${video.tagline ?? ""}`);
}
function PreVideo() {
	const previewId = useLibrary((s) => s.previewId);
	const videos = useLibrary((s) => s.videos);
	const folders = useLibrary((s) => s.folders);
	const allTags = useLibrary((s) => s.tags);
	const unavailable = useLibrary((s) => s.unavailable);
	const hiddenVideos = useLibrary((s) => s.hiddenVideos);
	const openVideo = useLibrary((s) => s.openVideo);
	const closePreview = useLibrary((s) => s.closePreview);
	const setSource = useLibrary((s) => s.setSource);
	const setQuery = useLibrary((s) => s.setQuery);
	const setVideoTags = useLibrary((s) => s.setVideoTags);
	const setVideoCategory = useLibrary((s) => s.setVideoCategory);
	const toggleFavorite = useLibrary((s) => s.toggleFavorite);
	const recordPlay = useLibrary((s) => s.recordPlay);
	const markProgress = useLibrary((s) => s.markProgress);
	const toggleLike = useLibrary((s) => s.toggleLike);
	const followRemoteQuery = useLibrary((s) => s.followRemoteQuery);
	const favorite = useLibrary((s) => previewId ? Boolean(s.favorites[previewId]) : false);
	const liked = useLibrary((s) => previewId ? Boolean(s.likes[previewId]) : false);
	const tags = useLibrary((s) => previewId ? s.tags[previewId] ?? EMPTY_TAGS : EMPTY_TAGS);
	const metadataProvenance = useLibrary((s) => previewId ? s.metadataProvenance[previewId] : void 0);
	const category = useLibrary((s) => previewId ? s.categories[previewId] ?? "" : "");
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [tagText, setTagText] = (0, import_react.useState)("");
	const [categoryText, setCategoryText] = (0, import_react.useState)("");
	const [vrAvailable, setVrAvailable] = (0, import_react.useState)(false);
	const [rating, setRating$1] = (0, import_react.useState)(0);
	const [ratingRevision, setRatingRevision] = (0, import_react.useState)(0);
	const [creatorRevision, setCreatorRevision] = (0, import_react.useState)(0);
	const [creatorLoading, setCreatorLoading] = (0, import_react.useState)(false);
	const [tagRevision, setTagRevision] = (0, import_react.useState)(0);
	const [recommendationSeed, setRecommendationSeed] = (0, import_react.useState)(() => Date.now() >>> 0);
	const [localPreviewSrc, setLocalPreviewSrc] = (0, import_react.useState)(null);
	const [previewError, setPreviewError] = (0, import_react.useState)("");
	const [shelfReady, setShelfReady] = (0, import_react.useState)(false);
	const previewWatchTick = (0, import_react.useRef)(0);
	const previewWatchPending = (0, import_react.useRef)(0);
	const markUnavailable = useLibrary((s) => s.markUnavailable);
	const video = videos.find((item) => item.id === previewId);
	const flushPreviewWatch = () => {
		if (previewId && previewWatchPending.current > 0) recordWatchTime(previewId, "preview", previewWatchPending.current);
		previewWatchPending.current = 0;
		previewWatchTick.current = 0;
	};
	(0, import_react.useEffect)(() => () => {
		if (previewId && previewWatchPending.current > 0) recordWatchTime(previewId, "preview", previewWatchPending.current);
		previewWatchPending.current = 0;
		previewWatchTick.current = 0;
	}, [previewId]);
	const adultFolderIds = (0, import_react.useMemo)(() => new Set(folders.filter((folder) => folder.adult).map((folder) => folder.id)), [folders]);
	const previewIsAdult = Boolean(video && (isAdultPullKind(video.remote?.kind) || adultFolderIds.has(video.folderId)));
	(0, import_react.useEffect)(() => {
		if (video) recordPlay(video.id, "open");
	}, [recordPlay, video?.id]);
	(0, import_react.useEffect)(() => {
		if (!video?.remote) return;
		const openedAt = Date.now();
		const durationHint = Math.max(video.duration ?? 0, 120);
		const savePreviewWatch = () => {
			const watched = (Date.now() - openedAt) / 1e3;
			if (watched >= 8) markProgress(video.id, Math.min(watched, durationHint * .94), durationHint);
		};
		const timer = window.setInterval(() => {
			savePreviewWatch();
			if (Date.now() - openedAt >= 8e3 && document.visibilityState === "visible" && document.hasFocus()) recordWatchTime(video.id, "previewEstimated", 5);
		}, 5e3);
		return () => {
			savePreviewWatch();
			window.clearInterval(timer);
		};
	}, [
		markProgress,
		video?.id,
		video?.remote
	]);
	const creator = video?.remote?.channelName?.trim() ?? "";
	const creatorKeyword = creator.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
	const tagScores = (0, import_react.useMemo)(() => {
		const scores = /* @__PURE__ */ new Map();
		for (const item of videos) for (const rawTag of allTags[item.id] ?? EMPTY_TAGS) {
			const tag = rawTag.replace(/^(?:keyword-|creator-)/i, "");
			const entry = scores.get(tag) ?? {
				total: 0,
				count: 0
			};
			entry.total += ratingPreference(getRating(item.id));
			entry.count += 1;
			scores.set(tag, entry);
		}
		return scores;
	}, [
		allTags,
		ratingRevision,
		videos
	]);
	const allVisibleTags = [...new Set((creatorKeyword && !tags.includes(creatorKeyword) ? [creatorKeyword, ...tags] : tags).map((tag) => tag.replace(/^(?:keyword-|creator-)/i, "")))];
	const visibleTags = allVisibleTags.slice(0, 80);
	const tagsLocked = Boolean(metadataProvenance?.lockedFields?.includes("tags"));
	const tagSourceSummary = [...new Set(Object.values(metadataProvenance?.tags ?? {}))].map((source) => source === "manual" ? "your edit" : source === "local-name" ? "local filename" : source === "companion-inspection" ? "Companion inspection" : source === "local-vision" ? "local vision" : source === "legacy" ? "saved library" : source.replace(/^provider:/, "provider · ")).join(", ");
	const creatorRating = creator ? getCreatorRating(creator) : 0;
	const creatorLiked = creator ? creatorIsLiked(creator) : false;
	(0, import_react.useEffect)(() => {
		if (!previewId) return;
		setRating$1(getRating(previewId));
	}, [previewId]);
	(0, import_react.useEffect)(() => {
		const refresh = () => setRatingRevision((value) => value + 1);
		window.addEventListener("reelcase:rating-change", refresh);
		return () => window.removeEventListener("reelcase:rating-change", refresh);
	}, []);
	(0, import_react.useEffect)(() => {
		setShelfReady(false);
		const timer = window.setTimeout(() => setShelfReady(true), 140);
		return () => window.clearTimeout(timer);
	}, [previewId]);
	(0, import_react.useEffect)(() => {
		const timer = window.setInterval(() => setRecommendationSeed(Date.now() >>> 0), 6e4);
		return () => window.clearInterval(timer);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!video || video.remote || video.src) {
			setLocalPreviewSrc(null);
			setPreviewError("");
			return;
		}
		let cancelled = false;
		setLocalPreviewSrc(null);
		setPreviewError("");
		resolvePlayUrl(video).then((src) => {
			if (!cancelled) setLocalPreviewSrc(src);
		}).catch((error) => {
			const message = error instanceof Error ? error.message : "This local file is no longer available.";
			if (!cancelled) {
				setPreviewError(message);
				markUnavailable(video.id, message);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [markUnavailable, video]);
	(0, import_react.useEffect)(() => {
		const xr = navigator.xr;
		if (xr) xr.isSessionSupported("immersive-vr").then(setVrAvailable).catch(() => setVrAvailable(false));
	}, []);
	const related = (0, import_react.useMemo)(() => {
		if (!video || !shelfReady) return [];
		const sourceTags = new Set(tags);
		const creatorName = video.remote?.channelName?.trim().toLowerCase();
		const sourceKind = video.remote?.kind;
		return videos.filter((item) => {
			const itemIsAdult = isAdultPullKind(item.remote?.kind) || adultFolderIds.has(item.folderId);
			return item.id !== video.id && !isExcludedPreviewCandidate(item) && !unavailable[item.id] && !hiddenVideos[item.id] && itemIsAdult === previewIsAdult;
		}).map((item) => {
			const itemTags = allTags[item.id] ?? EMPTY_TAGS;
			const sharedTopics = itemTags.filter((tag) => sourceTags.has(tag)).length;
			const sameCreator = Boolean(creatorName && item.remote?.channelName?.trim().toLowerCase() === creatorName);
			const liveToVod = Boolean(video.remote?.live && !item.remote?.live && sameCreator);
			return {
				item,
				score: Number(sameCreator) * 14 + Number(liveToVod) * 8 + Number(item.folderId === video.folderId) * 5 + Number(item.genre === video.genre) * 4 + Number(item.remote?.kind === sourceKind) * (previewIsAdult ? 5 : 2) + sharedTopics * (previewIsAdult ? 6 : 3) + itemTags.filter((tag) => tagIsLiked(tag)).length * 2 + ratingPreference(getRating(item.id)) * 1.5 + ratingPreference(getCreatorRating(item.remote?.channelName ?? "")) * 2 + Number(creatorIsLiked(item.remote?.channelName ?? "")) * 3,
				random: previewShuffle(`${video.id}:${item.id}:${recommendationSeed}`, recommendationSeed)
			};
		}).filter((row) => row.score > 0).sort((a, b) => b.score - a.score || a.random - b.random).slice(0, 8).map((row) => row.item);
	}, [
		adultFolderIds,
		allTags,
		creatorRevision,
		hiddenVideos,
		previewIsAdult,
		recommendationSeed,
		shelfReady,
		tags,
		unavailable,
		video,
		videos
	]);
	const recommended = (0, import_react.useMemo)(() => {
		if (!video || !shelfReady) return [];
		const sourceTags = new Set(tags);
		const sourceKind = video.remote?.kind;
		const seed = recommendationSeed + 17 >>> 0;
		const highlyRatedTags = new Set(videos.flatMap((item) => {
			const itemTags = allTags[item.id] ?? EMPTY_TAGS;
			return getRating(item.id) >= 4 ? itemTags : itemTags.filter((tag) => tagIsLiked(tag));
		}));
		const relatedIds = new Set(related.map((relatedItem) => relatedItem.id));
		return videos.filter((item) => {
			const itemIsAdult = isAdultPullKind(item.remote?.kind) || adultFolderIds.has(item.folderId);
			return item.id !== video.id && !isExcludedPreviewCandidate(item) && !unavailable[item.id] && !hiddenVideos[item.id] && !relatedIds.has(item.id) && itemIsAdult === previewIsAdult;
		}).map((item) => {
			const itemTags = allTags[item.id] ?? EMPTY_TAGS;
			const sharedTopics = itemTags.filter((tag) => sourceTags.has(tag)).length;
			return {
				item,
				score: Number(item.genre === video.genre) * 3 + Number(item.remote?.kind === sourceKind) * (previewIsAdult ? 4 : 1.5) + sharedTopics * (previewIsAdult ? 6 : 3) + ratingPreference(getRating(item.id)) * 2 + ratingPreference(getCreatorRating(item.remote?.channelName ?? "")) * 2 + Number(creatorIsLiked(item.remote?.channelName ?? "")) * 3 + itemTags.filter((tag) => highlyRatedTags.has(tag)).length * 3 + itemTags.filter((tag) => tagIsLiked(tag)).length * 2,
				random: previewShuffle(`${video.id}:${item.id}:${seed}`, seed)
			};
		}).sort((a, b) => b.score - a.score || a.random - b.random).slice(0, 6).map((row) => row.item);
	}, [
		adultFolderIds,
		allTags,
		creatorRevision,
		hiddenVideos,
		previewIsAdult,
		recommendationSeed,
		related,
		shelfReady,
		tagRevision,
		tags,
		unavailable,
		video,
		videos
	]);
	if (!video) return null;
	const adultImage = Boolean(video.remote && isAdultImageKind(video.remote.kind, video.mime, video.extension));
	const myFreeCamsRoom = video.remote?.kind === "myfreecams";
	const redgifsEmbed = video.remote?.kind === "redgifs" && Boolean(video.remote.embedUrl);
	const directAdultMedia = Boolean(video.remote && isAdultPullKind(video.remote.kind) && video.src && /\.(?:mp4|webm|gifv)(?:\?|$)/i.test(video.src) && !redgifsEmbed);
	const imageSrc = adultImage ? video.src || video.remote?.embedUrl || video.remote?.previewUrl || video.poster || null : null;
	const embed = adultImage ? null : !myFreeCamsRoom && video.remote?.embedUrl && !directAdultMedia ? video.remote.kind === "twitch" ? twitchEmbedUrl(video.remote, window.location.hostname) : video.remote.kind === "youtube" ? (() => {
		const url = new URL(video.remote.embedUrl, "https://www.youtube.com");
		url.protocol = "https:";
		url.hostname = "www.youtube.com";
		url.searchParams.set("autoplay", "1");
		url.searchParams.set("rel", "0");
		url.searchParams.set("modestbranding", "1");
		url.searchParams.set("playsinline", "1");
		url.searchParams.set("origin", window.location.origin);
		return url.toString();
	})() : video.remote.embedUrl : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 overflow-y-auto bg-bg/98 px-4 py-5 sm:px-8 sm:py-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: video.remote ? "w-full max-w-none" : "mx-auto max-w-6xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						onClick: closePreview,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Browse"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "Close preview",
						onClick: closePreview,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: video.remote?.kind === "twitch" ? "mt-5 grid gap-7" : video.remote?.kind === "youtube" ? "mt-5 grid gap-7 xl:grid-cols-[minmax(0,2.35fr)_minmax(20rem,0.65fr)]" : "mt-5 grid gap-7 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.7fr)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-hidden rounded-lg bg-elevated shadow-border",
							children: imageSrc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: imageSrc,
								alt: video.name,
								className: "aspect-video w-full bg-bg object-contain",
								decoding: "async"
							}) : embed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
								title: `${video.name} preview`,
								src: embed,
								className: "aspect-video w-full border-0",
								allow: "autoplay; encrypted-media; picture-in-picture",
								allowFullScreen: true
							}) : myFreeCamsRoom ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex aspect-video flex-col items-center justify-center gap-3 bg-bg px-6 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "This is a confirmed MyFreeCams live room. MyFreeCams does not provide a permitted in-app player."
								}), video.remote?.watchUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: video.remote.watchUrl,
									target: "_blank",
									rel: "noreferrer",
									className: "inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg",
									children: ["Open MyFreeCams live ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-2 size-4" })]
								})]
							}) : video.src || localPreviewSrc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
								src: video.src ?? localPreviewSrc ?? void 0,
								poster: video.poster,
								className: "aspect-video w-full bg-bg object-contain",
								muted: true,
								autoPlay: true,
								preload: "metadata",
								playsInline: true,
								controls: true,
								onTimeUpdate: (event) => {
									const element = event.currentTarget;
									if (!element.paused && !element.seeking && document.visibilityState === "visible") {
										const now = performance.now();
										if (previewWatchTick.current) previewWatchPending.current += Math.min(1, Math.max(0, (now - previewWatchTick.current) / 1e3));
										previewWatchTick.current = now;
										if (previewWatchPending.current >= 4) flushPreviewWatch();
									} else previewWatchTick.current = 0;
									if (Number.isFinite(element.duration) && element.duration > 0) markProgress(video.id, element.currentTime, element.duration);
								},
								onPause: flushPreviewWatch
							}) : previewError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex aspect-video items-center justify-center bg-bg px-6 text-center text-sm text-muted",
								children: previewError
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: video.poster,
								alt: "",
								className: "aspect-video w-full object-cover"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: video.remote?.kind ?? video.genre ?? "Library"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 font-display text-4xl leading-none text-fg sm:text-5xl",
							children: video.name.replace(/\.[^/.]+$/, "")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 max-w-3xl text-sm leading-6 text-muted",
							children: video.tagline ?? "Preview this title, tune its metadata, then start watching."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: () => openVideo(video.id),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 fill-current" }), " Watch now"]
								}),
								video.remote?.watchUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: video.remote.watchUrl,
									onClick: () => recordPlay(video.id),
									className: "inline-flex min-h-10 items-center rounded-sm bg-elevated px-3 text-sm text-fg shadow-border",
									children: ["Open official player ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-2 size-4" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									title: vrAvailable ? "Use Meta Quest Browser to enter VR" : "VR is available on a Meta Quest or other WebXR browser",
									onClick: () => openVideo(video.id),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glasses, { className: "size-4" }), " Open VR cinema"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									onClick: () => {
										setEditing((value) => !value);
										setTagText(tags.join(", "));
										setCategoryText(category);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-4" }), " Edit tags"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: favorite ? "default" : "secondary",
									onClick: () => toggleFavorite(video.id),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: favorite ? "size-4 fill-current" : "size-4" }), favorite ? "Saved" : "Save"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: liked ? "default" : "secondary",
									onClick: () => toggleLike(video.id),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, { className: liked ? "size-4 fill-current" : "size-4" }), liked ? "Liked" : "Like"]
								})
							]
						}),
						video.remote && supportsRemoteComments(video.remote.kind) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdultComments, { video })
						}),
						creator && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 rounded-lg border border-border bg-elevated/55 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
									children: "Creator taste"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex flex-wrap items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => {
												setSource(video.remote?.kind === "twitch" ? "twitch" : video.remote?.kind === "youtube" ? "youtube" : isAdultPullKind(video.remote?.kind) ? "adults" : "youtube");
												setQuery(creator);
												closePreview();
											},
											className: "font-medium text-fg hover:text-accent",
											children: creator
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: creatorLiked ? "default" : "secondary",
											onClick: () => {
												toggleCreatorLike(creator);
												setCreatorRevision((value) => value + 1);
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, { className: creatorLiked ? "size-3.5 fill-current" : "size-3.5" }), creatorLiked ? "Creator liked" : "Like creator"]
										}),
										[
											1,
											2,
											3,
											4,
											5
										].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => {
												setCreatorRating(creator, value);
												setCreatorRevision((revision) => revision + 1);
											},
											className: `flex size-8 items-center justify-center rounded-sm text-xs shadow-border ${value <= creatorRating ? "bg-accent text-accent-fg" : "bg-bg/50 text-accent"}`,
											"aria-label": `Rate creator ${creator} ${value} stars`,
											children: value
										}, value))
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 flex flex-wrap gap-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										disabled: creatorLoading || !video.remote,
										onClick: () => void (async () => {
											if (!video.remote) return;
											setCreatorLoading(true);
											try {
												if (video.remote.kind === "youtube" || video.remote.kind === "twitch") await followRemoteQuery(creator, video.remote.kind);
												setCreatorRevision((value) => value + 1);
											} finally {
												setCreatorLoading(false);
											}
										})(),
										children: creatorLoading ? "Pulling older videos…" : "Pull older creator videos"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs text-muted",
									children: "Creator likes, ratings, and the older-video pull boost this creator and shared tags across related recommendations."
								})
							]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "rounded-lg bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Details"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: topicEvidence(video, tags).map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "secondary",
									title: link.reason,
									onClick: () => {
										openTopic(link.topic);
										closePreview();
									},
									children: [
										"#",
										link.topic,
										" ↔"
									]
								}, link.topic))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted",
								children: "Topic links explore all public sources. Hover a topic for its evidence."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-sm text-fg",
								children: [
									video.year ?? "New",
									" · ",
									video.genre ?? "Uncategorized"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 flex flex-wrap gap-1.5",
								children: visibleTags.length ? visibleTags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex overflow-hidden rounded-xs bg-bg/50 text-xs text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										title: `Show videos tagged ${tag} · score ${Math.round((tagScores.get(tag)?.total ?? 0) / Math.max(1, tagScores.get(tag)?.count ?? 1) * 1e3).toLocaleString()}`,
										onClick: () => {
											if (previewIsAdult) {
												setQuery("");
												setSource("adults");
												window.dispatchEvent(new CustomEvent("reelcase:adult-tag", { detail: { tag } }));
												closePreview();
												return;
											}
											setSource(video.remote?.kind === "twitch" ? "twitch" : video.remote?.kind === "youtube" ? "youtube" : "all");
											setQuery(tag);
											closePreview();
										},
										className: "px-2 py-1 transition-colors hover:bg-accent/15 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent",
										children: [
											"#",
											tag,
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-accent",
												children: ["· ", Math.round((tagScores.get(tag)?.total ?? 0) / Math.max(1, tagScores.get(tag)?.count ?? 1) * 1e3).toLocaleString()]
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										title: tagIsLiked(tag) ? `Unlike tag ${tag}` : `Like tag ${tag}`,
										"aria-label": tagIsLiked(tag) ? `Unlike tag ${tag}` : `Like tag ${tag}`,
										onClick: () => {
											toggleTagLike(tag);
											setTagRevision((value) => value + 1);
										},
										className: `border-l border-border px-1.5 transition-colors hover:bg-accent/15 ${tagIsLiked(tag) ? "text-accent" : "text-subtle"}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: tagIsLiked(tag) ? "size-3 fill-current" : "size-3" })
									})]
								}, tag)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-subtle",
									children: "No keywords yet"
								})
							}),
							allVisibleTags.length > visibleTags.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs text-muted",
								children: [
									"Showing ",
									visibleTags.length,
									" of ",
									allVisibleTags.length,
									" saved provider tags. Search the source to use the rest."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted",
								children: tagsLocked ? "Manual tags are locked; provider refreshes cannot replace them." : tagSourceSummary ? `Tag sources: ${tagSourceSummary}.` : "Tags are waiting for a local or provider metadata source."
							}),
							editing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 space-y-3 border-t border-border pt-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block text-xs text-muted",
										children: ["IPTC/XMP-style keywords", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: tagText,
											onChange: (event) => setTagText(event.target.value),
											className: "mt-1",
											placeholder: "science, repair, funny"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block text-xs text-muted",
										children: ["Collection / category", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: categoryText,
											onChange: (event) => setCategoryText(event.target.value),
											className: "mt-1",
											placeholder: "Tech, comedy, open film"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										className: "w-full",
										onClick: () => {
											setVideoTags(video.id, tagText.split(","));
											setVideoCategory(video.id, categoryText);
											setEditing(false);
										},
										children: "Save metadata"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs leading-5 text-muted",
										children: "Saving tags locks this field to your choices. Provider refreshes can still update the card itself, but they cannot replace these tags or your category."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 border-t border-border pt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-center gap-2 text-sm text-fg",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4 text-accent" }), " Your rating"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex gap-1",
									children: [
										1,
										2,
										3,
										4,
										5
									].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => {
											setRating$1(value);
											(0, import_react.startTransition)(() => setRating(video.id, value));
										},
										className: `flex size-9 items-center justify-center rounded-sm text-sm shadow-border ${value <= rating ? "bg-accent text-accent-fg" : "bg-bg/50 text-accent"}`,
										children: value
									}, value))
								})]
							})
						]
					})]
				}),
				related.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-9",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl text-fg",
						children: previewIsAdult ? "More Adult picks from this shelf" : "More from this shelf"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6",
						children: related.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => useLibrary.getState().openPreview(item.id),
							className: "overflow-hidden rounded-md bg-elevated text-left shadow-border hover:bg-surface",
							children: [item.poster ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: item.poster,
								alt: "",
								loading: "lazy",
								className: "aspect-video w-full object-cover",
								onError: (event) => {
									const fallback = item.remote?.kind === "youtube" && item.remote.videoId ? `https://i.ytimg.com/vi/${item.remote.videoId}/mqdefault.jpg` : "";
									if (fallback && event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
									else event.currentTarget.style.display = "none";
								}
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "block aspect-video bg-bg" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate px-3 py-2 text-sm text-fg",
								children: item.name
							})]
						}, item.id))
					})]
				}),
				recommended.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-9",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl text-fg",
							children: previewIsAdult ? "More Adult picks to try next" : "More to try next"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: previewIsAdult ? "A fresh Adult-only mix based on this title’s tags, creator, source, and your saved Adult interests." : "A fresh mix based on this title’s genre and what was added recently."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6",
							children: recommended.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => useLibrary.getState().openPreview(item.id),
								className: "overflow-hidden rounded-md bg-elevated text-left shadow-border hover:bg-surface",
								children: [item.poster ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: item.poster,
									alt: "",
									loading: "lazy",
									className: "aspect-video w-full object-cover",
									onError: (event) => {
										const fallback = item.remote?.kind === "youtube" && item.remote.videoId ? `https://i.ytimg.com/vi/${item.remote.videoId}/mqdefault.jpg` : "";
										if (fallback && event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
										else event.currentTarget.style.display = "none";
									}
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "block aspect-video bg-bg" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate px-3 py-2 text-sm text-fg",
									children: item.name
								})]
							}, item.id))
						})
					]
				})
			]
		})
	});
}
//#endregion
export { PreVideo };
