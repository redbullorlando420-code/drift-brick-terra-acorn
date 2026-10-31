import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { B as Play, Ct as Heart, Et as Glasses, F as RefreshCw, Rt as ExternalLink, cn as ArrowLeft, h as Tag, l as Undo2, m as ThumbsDown, n as X, p as ThumbsUp, v as Star } from "../_libs/lucide-react.mjs";
import { _ as youtubePublicationTime, p as youtubeContentKind } from "./provider-json-CjRAnOrq.mjs";
import { Dn as twitchContentLabel, Dt as isAdultPullKind, Ft as knownTwitchContent, Mt as isRemovedRedditVideo, Tt as isAdultImageKind, k as adultFolderIds } from "./live-rooms-DInVyvi_.mjs";
import { Dt as createExposurePenalty, Mn as lookupVideo, Nn as lookupVideos, Ot as createRejectionPenalty, Ur as rejectionKey, Z as canonicalTopic, ba as titleRejectionTarget, dr as peekYoutubeOwner, ir as officialAdultUrl, jt as creatorRejectionTarget, qr as rememberVideo, xa as topicEvidence, xt as confidenceAdjustedPreference } from "./persist-D_pR3DU-.mjs";
import { $n as useLibrary, An as setRecommendationRejection, Ht as rankingFeedbackSnapshot, J as getRecommendationExposure, Jn as toggleTagLike, Jt as recordWatchTime, Kn as toggleCreatorFavorite, On as setRating, P as getFeedbackSaveState, Qt as resolvePlayUrl, Sn as setCreatorRating, Wn as tagIsLiked, Y as getRecommendationRejections, _ as creatorIsFavorited, en as retryFeedbackSave, j as getExposureRevision, k as getCreatorRating, on as scheduleBackgroundWork, qn as toggleCreatorLike, v as creatorIsLiked } from "./store-0MIXEefC.mjs";
import { B as registerPeriodicTask, Bt as Input, K as useMediaRating, L as previewCandidates$1, N as openTopic, Q as warmVideoPlayer, Vt as Button, Z as useViewerInitialFocus, c as PullPauseButton, dt as useBrowseLibrary, f as YoutubeDownloadButton, gt as RecommendationExposureControl, p as YoutubePublicationControl } from "./library-app-BzjSyqkW.mjs";
import { s as rememberOfficialViewing, t as AdultProviderFrame } from "./provider-recovery-CuBcDi-X.mjs";
import { t as RecommendationButton } from "./recommendation-button-SJ_hjWLs.mjs";
import { i as twitchChapterEmbed } from "./twitch-chapters-dTpIW994.mjs";
import { a as useVideoDetails, i as useRedditMedia, n as TwitchChapters, o as youtubeEmbedUrl, r as useBooruOriginal, t as OfficialRoomPlayer } from "./use-video-details-PR7pE1lr.mjs";
import { i as twitchEmbedUrl, r as supportsRemoteComments, t as AdultComments } from "./twitch-embed-D83ysKZo.mjs";
import { t as YoutubeTagsControl } from "./youtube-tags-control-D9vPYPxZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pre-video-BtqNmAJp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FilmReviewEntry = (0, import_react.lazy)(() => import("./library-app-BzjSyqkW.mjs").then((n) => n.j).then((n) => n.z).then((module) => ({ default: module.FilmReviewEntry })));
var AnimeReviewEntry = (0, import_react.lazy)(() => import("./anime-review-Bf_u4q4_.mjs").then((module) => ({ default: module.AnimeReviewEntry })));
/** Metadata tools load after the iframe has painted, independently of playback. */
function DeferredVideoReviews({ video }) {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => scheduleBackgroundWork(() => setReady(true)), []);
	return ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Suspense, {
		fallback: null,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilmReviewEntry, { video }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimeReviewEntry, { video })]
	}) : null;
}
var PAGE_SIZE = 8;
function RecommendationChoices({ video, tags, favorite }) {
	const [, refresh] = (0, import_react.useState)(0), [topic, setTopic] = (0, import_react.useState)(""), [page, setPage] = (0, import_react.useState)(0);
	const [message, setMessage] = (0, import_react.useState)(""), [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const changed = () => refresh((value) => value + 1);
		window.addEventListener("reelcase:rating-change", changed);
		window.addEventListener("reelcase:feedback-save", changed);
		return () => {
			window.removeEventListener("reelcase:rating-change", changed);
			window.removeEventListener("reelcase:feedback-save", changed);
		};
	}, []);
	const ledger = getRecommendationRejections(), creator = creatorRejectionTarget(video), topics = topicEvidence(video, tags);
	const selectedTopic = topics.some((link) => link.topic === topic) ? topic : topics[0]?.topic ?? "";
	const currentPage = Math.min(page, Math.max(0, Math.ceil(ledger.entries.length / PAGE_SIZE) - 1));
	const apply = (entry, remove = false) => {
		try {
			setRecommendationRejection(entry, remove);
			setError("");
			setMessage(remove ? "Choice undone. Its ranking penalty was removed." : "Choice applied. Matching recommendations will rank lower.");
			refresh((value) => value + 1);
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "This choice could not be saved. Try again.");
		}
	};
	const choice = (entry, label) => {
		const saved = ledger.entries.find((row) => rejectionKey(row) === rejectionKey(entry));
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			variant: "secondary",
			className: "min-h-11 max-w-full whitespace-normal text-left",
			"aria-pressed": Boolean(saved),
			onClick: () => apply(saved ?? {
				...entry,
				at: Date.now()
			}, Boolean(saved)),
			children: [
				saved ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "size-4 shrink-0" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsDown, { className: "size-4 shrink-0" }),
				saved ? "Undo: " : "",
				label
			]
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		"data-recommendation-choices": true,
		className: "mt-4 rounded-lg border border-border bg-elevated/55 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
				className: "min-h-11 cursor-pointer content-center text-sm font-medium text-fg",
				children: "Not interested? Tune recommendations"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-muted",
				children: "Choose exactly what you want less of. This lowers scores in YouTube picks, Twitch VOD recommendations, the Guide, and preview suggestions. Videos remain searchable; ratings and visibility stay as you set them."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [choice({
					scope: "title",
					target: titleRejectionTarget(video),
					label: video.name
				}, "Less of this title"), creator && choice({
					scope: "creator",
					target: creator,
					label: video.remote?.channelName ?? "This local folder"
				}, video.remote ? "Less from this creator" : "Less from this folder")]
			}),
			topics.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-col gap-2 sm:flex-row sm:items-end",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "min-w-0 flex-1 text-xs text-muted",
					children: ["Topic to reduce", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						"aria-label": "Topic to recommend less",
						value: selectedTopic,
						onChange: (event) => setTopic(event.target.value),
						className: "mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg",
						children: topics.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: link.topic,
							children: link.topic
						}, link.topic))
					})]
				}), choice({
					scope: "topic",
					target: selectedTopic,
					label: selectedTopic
				}, "Less of this topic")]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs leading-5 text-muted",
				children: "Title choices affect only that media identity. Creator choices stay within that provider; topic choices apply across public sources. Saved titles and favorited creators bypass these penalties. A hearted topic bypasses its topic penalty."
			}),
			(favorite || creatorIsFavorited(video.remote?.channelName ?? "")) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-accent",
				children: "This title is protected by a favorite. Your choices remain saved and apply if that favorite is removed."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "status",
				className: "mt-2 text-xs text-muted",
				children: [message, getFeedbackSaveState() === "pending" ? " Saving to this browser…" : message && getFeedbackSaveState() === "saved" ? " Saved to this browser." : ""]
			}),
			getFeedbackSaveState() === "failed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "alert",
				className: "mt-3 text-sm text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Browser storage could not save your feedback. Choices work for this session; retry before closing or export a library pack." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "secondary",
					className: "mt-2 min-h-11",
					onClick: retryFeedbackSave,
					children: "Retry saving feedback"
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-2 text-sm text-fg",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecommendationExposureControl, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "mt-3 border-t border-border pt-3",
				"data-rejection-review": true,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
						className: "min-h-11 cursor-pointer content-center text-sm text-fg",
						children: [
							"Review saved choices (",
							ledger.entries.length,
							"/512)"
						]
					}),
					ledger.entries.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-2",
						children: ledger.entries.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE).map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex min-w-0 items-center justify-between gap-3 rounded-md bg-bg/50 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "break-words text-sm text-fg",
									children: entry.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: entry.scope
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								variant: "secondary",
								className: "min-h-11 shrink-0",
								"aria-label": "Undo " + entry.scope + " choice: " + entry.label,
								onClick: () => apply(entry, true),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "size-4" }), "Undo"]
							})]
						}, rejectionKey(entry)))
					}), ledger.entries.length > PAGE_SIZE && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-center justify-between gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								className: "min-h-11",
								disabled: !currentPage,
								onClick: () => setPage(currentPage - 1),
								children: "Previous choices"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted",
								children: [
									"Page ",
									currentPage + 1,
									" of ",
									Math.ceil(ledger.entries.length / PAGE_SIZE)
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								className: "min-h-11",
								disabled: (currentPage + 1) * PAGE_SIZE >= ledger.entries.length,
								onClick: () => setPage(currentPage + 1),
								children: "Next choices"
							})
						]
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "No rejection choices saved. Your current ratings and favorites still guide recommendations."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs leading-5 text-muted",
						children: "Private to this browser library. Included in your library pack; never sent to Watch Together guests. Up to 512 choices are kept without automatic expiry or silent eviction."
					})
				]
			})
		]
	});
}
var EMPTY = {
	related: [],
	recommended: [],
	tagScores: {}
};
var EMPTY_TAGS$1 = [];
var SAMPLE_TITLE = /\b(blender|big buck bunny|cosmos laundromat|tears of steel|elephants dream|sintel|night rain|empty house|golden coast|tungsten reel)\b/i;
var shared;
var feedbackRevision = 0;
var latestRequest;
function dispose(session, reason) {
	if (session.disposed) return;
	session.disposed = true;
	clearTimeout(session.deadline);
	session.worker.onerror = session.worker.onmessageerror = null;
	session.worker.onmessage = null;
	const notify = session.failed;
	session.failed = void 0;
	session.cancelBuild?.();
	window.clearTimeout(session.disposeTimer);
	session.worker.terminate();
	session.inputs = void 0;
	session.cancelBuild = void 0;
	session.listener = void 0;
	session.candidates = void 0;
	if (latestRequest?.session === session) latestRequest = void 0;
	if (shared === session) shared = void 0;
	if (reason) notify?.(reason);
}
var onRatingChange = () => {
	feedbackRevision++;
};
var onPageHide = () => {
	if (shared) dispose(shared, "Preview suggestions paused when the page closed. Retry to resume.");
};
var onVisibilityChange = () => {
	if (document.visibilityState === "hidden" && shared && !shared.listener) dispose(shared);
};
if (typeof window !== "undefined") {
	window.addEventListener("reelcase:rating-change", onRatingChange);
	window.addEventListener("pagehide", onPageHide);
	document.addEventListener("visibilitychange", onVisibilityChange);
}
function sessionForPreview() {
	if (shared) {
		window.clearTimeout(shared.disposeTimer);
		return shared;
	}
	const session = {
		worker: new Worker(new URL("../../lib/videos/preview-ranking.worker.ts", import.meta.url), { type: "module" }),
		generation: 0,
		requestId: 0
	};
	session.worker.onmessage = ({ data }) => {
		if (!session.disposed && data?.generation === session.generation && data.requestId === session.requestId) {
			if (!data.result || !Array.isArray(data.result.related) || !Array.isArray(data.result.recommended) || data.result.related.length > 96 || data.result.recommended.length > 96 || !data.result.tagScores || typeof data.result.tagScores !== "object") {
				dispose(session, "Preview suggestions returned an unreadable result.");
				return;
			}
			clearTimeout(session.deadline);
			session.deadline = void 0;
			for (const id of [...data.result.related, ...data.result.recommended]) {
				const card = session.candidates?.get(id);
				if (card && session.inputs) rememberVideo(session.inputs.videos, card);
			}
			session.listener?.(data);
		}
	};
	session.worker.onerror = (event) => {
		event.preventDefault();
		dispose(session, "Preview suggestions worker stopped. Your saved feedback is unchanged.");
	};
	session.worker.onmessageerror = () => dispose(session, "Preview suggestions returned an unreadable message.");
	shared = session;
	return session;
}
function sameInputs(left, right) {
	return left && left.target.id === right.target.id && left.videos === right.videos && left.tags === right.tags && left.unavailable === right.unavailable && left.favorites === right.favorites && left.likes === right.likes && left.cameCounts === right.cameCounts && left.viewCounts === right.viewCounts && left.hidden === right.hidden && left.feedbackRevision === right.feedbackRevision && left.exposureRevision === right.exposureRevision && left.adultFolders.size === right.adultFolders.size && [...right.adultFolders].every((id) => left.adultFolders.has(id));
}
function send(session, message) {
	if (session.disposed) return;
	if (message.type === "rank" || session.deadline === void 0) {
		clearTimeout(session.deadline);
		session.deadline = setTimeout(() => dispose(session, "Preview suggestions timed out. Retry when ready."), 3e4);
	}
	try {
		session.worker.postMessage(message);
	} catch {
		dispose(session, "Preview suggestions could not receive their next packet.");
	}
}
/** Keep one short-lived worker catalog across preview switches. Building never
* holds a second full row array or sends a catalog-sized structured clone. */
function prepare(session, inputs) {
	if (sameInputs(session.inputs, inputs)) return;
	session.cancelBuild?.();
	session.inputs = inputs;
	const owner = peekYoutubeOwner(inputs.videos, inputs.target);
	const candidates = previewCandidates$1(inputs.videos, inputs.target, owner);
	session.candidates = new Map(candidates.map((card) => [card.id, card]));
	const generation = ++session.generation;
	let cancelled = false;
	let cancelNext = () => {};
	session.cancelBuild = () => {
		cancelled = true;
		cancelNext();
	};
	cancelNext = scheduleBackgroundWork(() => void (async () => {
		const feedback = await rankingFeedbackSnapshot();
		if (cancelled) return;
		send(session, {
			type: "reset",
			generation,
			hearted: feedback.heartedTags
		});
		const penalty = feedback.recommendationRejections.entries.length ? createRejectionPenalty(feedback.recommendationRejections) : void 0;
		const exposureLedger = getRecommendationExposure();
		const exposure = exposureLedger.entries.length ? createExposurePenalty(exposureLedger) : void 0;
		const hearted = new Set(feedback.heartedTags.map(canonicalTopic).filter(Boolean));
		const creators = /* @__PURE__ */ new Map();
		let offset = 0;
		const next = () => {
			if (cancelled) return;
			const rows = [];
			const started = performance.now();
			while (offset < candidates.length && rows.length < 512) {
				const item = candidates[offset++];
				const creator = item.remote?.channelName?.trim().toLowerCase() ?? "";
				let taste = creators.get(creator);
				if (!taste) {
					taste = {
						rating: feedback.creatorRatings[creator] ?? 0,
						liked: Boolean(feedback.creatorLikes[creator]),
						favorite: Boolean(feedback.creatorFavorites[creator])
					};
					creators.set(creator, taste);
				}
				const adult = isAdultPullKind(item.remote?.kind) || inputs.adultFolders.has(item.folderId);
				rows.push({
					id: item.id,
					folderId: item.folderId,
					genre: item.genre,
					kind: item.remote?.kind,
					creator,
					creatorId: item.remote?.channelId ? `${item.remote.kind}:${item.remote.channelId}` : void 0,
					identity: item.remote?.videoId ? `${item.remote.kind}:${item.remote.videoId}` : item.id,
					titleTokens: [...new Set(item.name.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? [])].filter((word) => !/^(?:the|and|with|for|this|that|from|video|youtube|official|full|part|episode)$/.test(word)).slice(0, 16),
					format: item.remote?.kind === "youtube" ? youtubeContentKind(item) : void 0,
					publishedAt: item.remote?.kind === "youtube" ? youtubePublicationTime(item) : void 0,
					exposurePenalty: (adult ? void 0 : exposure)?.(item, {
						favorite: Boolean(inputs.favorites[item.id]),
						liked: Boolean(inputs.likes[item.id]),
						creatorFavorite: taste.favorite,
						rating: feedback.ratings[item.id] ?? 0
					}),
					rejectionPenalty: (adult ? void 0 : penalty)?.(item, inputs.tags[item.id], {
						favorite: Boolean(inputs.favorites[item.id]),
						creatorFavorite: taste.favorite,
						tagIsLiked: (topic) => hearted.has(topic)
					}),
					tags: (inputs.tags[item.id] ?? EMPTY_TAGS$1).slice(0, 32),
					rating: feedback.ratings[item.id] ?? 0,
					creatorRating: taste.rating,
					creatorLiked: taste.liked,
					creatorFavorite: taste.favorite,
					favorite: Boolean(inputs.favorites[item.id]),
					liked: Boolean(inputs.likes[item.id]),
					marks: inputs.cameCounts[item.id] ?? 0,
					plays: inputs.viewCounts[item.id] ?? 0,
					watch: feedback.watchScores[item.id] ?? 0,
					adult,
					live: Boolean(item.remote?.live),
					eligible: !isRemovedRedditVideo(item) && !inputs.unavailable[item.id] && !inputs.hidden[item.id] && !item.isSample && !SAMPLE_TITLE.test(`${item.name} ${creator} ${item.tagline ?? ""}`)
				});
				if (rows.length % 32 === 0 && performance.now() - started >= 4) break;
			}
			send(session, {
				type: "append",
				generation,
				rows
			});
			if (offset < candidates.length) cancelNext = scheduleBackgroundWork(next);
			else {
				session.cancelBuild = void 0;
				send(session, {
					type: "ready",
					generation
				});
			}
		};
		if (latestRequest?.session === session) send(session, latestRequest.message);
		next();
	})().catch(() => {
		if (!cancelled) dispose(session, "Preview suggestions could not be prepared.");
	}));
}
function usePreviewRanking(video, videos, tags, adultFolders, unavailable, hidden, seed, revision) {
	const favorites = useLibrary((s) => s.favorites), likes = useLibrary((s) => s.likes), cameCounts = useLibrary((s) => s.cameCounts), viewCounts = useLibrary((s) => s.viewCounts);
	const failure = (0, import_react.useRef)(void 0);
	const [attempt, setAttempt] = (0, import_react.useState)(0), [pending, setPending] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)("");
	const [packet, setPacket] = (0, import_react.useState)();
	(0, import_react.useEffect)(() => {
		if (!video) return;
		if (failure.current?.id === video.id && failure.current.attempt === attempt && failure.current.seed === seed) return;
		failure.current = void 0;
		let session;
		setPending(true);
		setError("");
		const receive = (data) => {
			setPending(false);
			setError("");
			(0, import_react.startTransition)(() => setPacket({
				id: data.id,
				result: data.result
			}));
		};
		const cancelStart = scheduleBackgroundWork(() => {
			try {
				session = sessionForPreview();
			} catch {
				failure.current = {
					id: video.id,
					attempt,
					seed
				};
				setPending(false);
				setError("Preview suggestions worker could not start.");
				return;
			}
			session.failed = (reason) => {
				failure.current = {
					id: video.id,
					attempt,
					seed
				};
				setPending(false);
				setError(reason);
			};
			session.listener = receive;
			prepare(session, {
				target: video,
				videos,
				tags,
				adultFolders,
				unavailable,
				hidden,
				feedbackRevision,
				exposureRevision: getExposureRevision(),
				favorites,
				likes,
				cameCounts,
				viewCounts
			});
			const message = {
				type: "rank",
				generation: session.generation,
				requestId: ++session.requestId,
				id: video.id,
				seed
			};
			latestRequest = {
				session,
				message
			};
			send(session, message);
		});
		return () => {
			cancelStart();
			if (!session) return;
			if (session.listener !== receive) return;
			session.listener = void 0;
			session.failed = void 0;
			clearTimeout(session.deadline);
			session.deadline = void 0;
			const owner = session;
			session.disposeTimer = window.setTimeout(() => dispose(owner), 1e3);
		};
	}, [
		video?.id,
		videos,
		tags,
		adultFolders,
		unavailable,
		hidden,
		seed,
		revision,
		favorites,
		likes,
		cameCounts,
		viewCounts,
		attempt
	]);
	return {
		...packet && packet.id === video?.id ? packet.result : EMPTY,
		pending,
		error,
		retry: () => setAttempt((value) => value + 1)
	};
}
var EMPTY_TAGS = [];
function PreVideo() {
	const closeFocus = useViewerInitialFocus();
	(0, import_react.useEffect)(() => {
		const timer = window.setTimeout(warmVideoPlayer, 100);
		return () => window.clearTimeout(timer);
	}, []);
	const previewId = useLibrary((s) => s.previewId);
	const videos = useBrowseLibrary((s) => s.videos);
	const adultFolderIds$1 = useLibrary((s) => adultFolderIds(s.folders));
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
	const [chapterStart, setChapterStart] = (0, import_react.useState)(null);
	const [tagText, setTagText] = (0, import_react.useState)("");
	const [categoryText, setCategoryText] = (0, import_react.useState)("");
	const [vrAvailable, setVrAvailable] = (0, import_react.useState)(false);
	const rating = useMediaRating(previewId);
	const [ratingRevision, setRatingRevision] = (0, import_react.useState)(0);
	const [creatorRevision, setCreatorRevision] = (0, import_react.useState)(0);
	const [creatorLoading, setCreatorLoading] = (0, import_react.useState)(false);
	const [tagRevision, setTagRevision] = (0, import_react.useState)(0);
	const [recommendationSeed, setRecommendationSeed] = (0, import_react.useState)(() => Date.now() >>> 0);
	const [localPreviewSrc, setLocalPreviewSrc] = (0, import_react.useState)(null);
	const [previewError, setPreviewError] = (0, import_react.useState)("");
	const previewWatchTick = (0, import_react.useRef)(0);
	const previewWatchPending = (0, import_react.useRef)(0);
	const markUnavailable = useLibrary((s) => s.markUnavailable);
	const selectedVideo = useLibrary((s) => lookupVideo(s.videos, s.previewId));
	const video = useVideoDetails(selectedVideo);
	const booruImage = useBooruOriginal(video);
	const redditRemoved = useRedditMedia(video);
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
	const previewIsAdult = Boolean(video && (isAdultPullKind(video.remote?.kind) || adultFolderIds$1.has(video.folderId)));
	(0, import_react.useEffect)(() => {
		if (!video) return;
		const timer = window.setTimeout(() => recordPlay(video.id, "open"), 800);
		return () => window.clearTimeout(timer);
	}, [recordPlay, video?.id]);
	(0, import_react.useEffect)(() => {
		if (!video?.remote) return;
		let openedAt = Date.now();
		const durationHint = Math.max(video.duration ?? 0, 120);
		const savePreviewWatch = () => {
			if (isAdultPullKind(video.remote?.kind) && document.querySelector("[data-provider-frame=\"" + video.remote.kind + "\"]")?.getAttribute("data-provider-running") === "false") {
				openedAt = Date.now();
				return false;
			}
			const watched = (Date.now() - openedAt) / 1e3;
			if (watched >= 8) markProgress(video.id, Math.min(watched, durationHint * .94), durationHint);
		};
		const task = registerPeriodicTask({
			name: "Preview watch record",
			mode: "visible",
			everyMs: 5e3,
			work: () => {
				if (savePreviewWatch() === false) return;
				if (Date.now() - openedAt >= 8e3 && document.visibilityState === "visible" && document.hasFocus()) recordWatchTime(video.id, "previewEstimated", 5);
			}
		});
		return () => {
			savePreviewWatch();
			task.cancel();
		};
	}, [
		markProgress,
		video?.id,
		video?.remote
	]);
	const creator = video?.remote?.channelName?.trim() ?? "";
	const creatorKeyword = creator.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
	const allVisibleTags = [...new Set((creatorKeyword && !tags.includes(creatorKeyword) ? [creatorKeyword, ...tags] : tags).map((tag) => tag.replace(/^(?:keyword-|creator-)/i, "")))];
	const visibleTags = allVisibleTags.slice(0, 80);
	const tagsLocked = Boolean(metadataProvenance?.lockedFields?.includes("tags"));
	const tagSourceSummary = [...new Set(Object.values(metadataProvenance?.tags ?? {}))].filter((source) => typeof source === "string" && Boolean(source.trim())).map((source) => source === "manual" ? "your edit" : source === "local-name" ? "local filename" : source === "companion-inspection" ? "Companion inspection" : source === "local-vision" ? "local vision" : source === "youtube-review" ? "your tag review" : source === "legacy" ? "saved library" : source.replace(/^provider:/, "provider · ")).join(", ");
	const creatorRating = creator ? getCreatorRating(creator) : 0;
	const creatorFavorite = creator ? creatorIsFavorited(creator) : false;
	const creatorLiked = creator ? creatorIsLiked(creator) : false;
	(0, import_react.useEffect)(() => {
		const refresh = () => setRatingRevision((value) => value + 1);
		window.addEventListener("reelcase:rating-change", refresh);
		return () => window.removeEventListener("reelcase:rating-change", refresh);
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
	const ranked = usePreviewRanking(video, videos, allTags, adultFolderIds$1, unavailable, hiddenVideos, recommendationSeed, `${ratingRevision}:${creatorRevision}:${tagRevision}`);
	const { related, recommended } = (0, import_react.useMemo)(() => {
		const items = lookupVideos(videos, [...ranked.related, ...ranked.recommended]);
		const visible = (item) => Boolean(item && !unavailable[item.id] && !hiddenVideos[item.id] && (isAdultPullKind(item.remote?.kind) || adultFolderIds$1.has(item.folderId)) === previewIsAdult);
		return {
			related: items.slice(0, ranked.related.length).filter(visible),
			recommended: items.slice(ranked.related.length).filter(visible)
		};
	}, [
		ranked,
		videos,
		unavailable,
		hiddenVideos,
		adultFolderIds$1,
		previewIsAdult
	]);
	const tagScores = (0, import_react.useMemo)(() => new Map(Object.entries(ranked.tagScores)), [ranked]);
	const tagEvidence = (tag) => tagScores.get(tag.trim().toLowerCase());
	const tagPreference = (tag) => {
		const row = tagEvidence(tag);
		const score = confidenceAdjustedPreference(row?.total ?? 0, row?.count ?? 0);
		return `${score > 0 ? "+" : ""}${score.toFixed(2)}`;
	};
	if (!video) return null;
	const adultImage = Boolean(video.remote && isAdultImageKind(video.remote.kind, video.mime, video.extension));
	const myFreeCamsRoom = video.remote?.kind === "myfreecams";
	const redgifsEmbed = video.remote?.kind === "redgifs" && Boolean(video.remote.embedUrl);
	const directAdultMedia = Boolean(video.remote && isAdultPullKind(video.remote.kind) && video.src && /\.(?:mp4|webm|gifv)(?:\?|$)/i.test(video.src) && !redgifsEmbed);
	const imageSrc = adultImage ? booruImage.original || video.src || video.remote?.embedUrl || video.remote?.previewUrl || video.poster || null : null;
	const embed = adultImage ? null : video.remote && !myFreeCamsRoom && (video.remote.embedUrl || video.remote.kind === "youtube") && !directAdultMedia ? video.remote.kind === "twitch" ? twitchChapterEmbed(twitchEmbedUrl(video.remote, window.location.hostname), chapterStart?.id === video.id ? chapterStart.seconds : void 0) : video.remote.kind === "youtube" ? youtubeEmbedUrl(video.remote.embedUrl ?? video.src ?? video.remote.watchUrl ?? "", video.remote.videoId, window.location.origin) : video.remote.embedUrl : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 overflow-y-auto bg-bg/98 px-4 py-5 sm:px-8 sm:py-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: video.remote ? "w-full max-w-none" : "mx-auto max-w-6xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						ref: closeFocus,
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
					className: video.remote?.kind === "twitch" || myFreeCamsRoom ? "mt-5 grid min-w-0 grid-cols-1 gap-7" : video.remote?.kind === "youtube" ? "mt-5 grid min-w-0 grid-cols-1 gap-7 xl:grid-cols-[minmax(0,2.35fr)_minmax(20rem,0.65fr)]" : "mt-5 grid min-w-0 grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.7fr)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-hidden rounded-lg bg-elevated shadow-border",
								children: redditRemoved ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									role: "status",
									className: "flex aspect-video items-center justify-center p-6 text-sm text-muted",
									children: "Removed by Reddit · hidden from photo recommendations."
								}) : imageSrc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: imageSrc,
									alt: video.name,
									className: "aspect-video w-full bg-bg object-contain",
									decoding: "async",
									referrerPolicy: video.remote?.channelId === "rule34" ? "strict-origin-when-cross-origin" : "no-referrer",
									onError: () => {
										if (booruImage.original) booruImage.failed();
									}
								}) : embed ? isAdultPullKind(video.remote?.kind) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdultProviderFrame, {
									video,
									src: embed,
									preview: true
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
									title: `${video.name} preview`,
									src: embed,
									className: "aspect-video w-full border-0",
									allow: "autoplay; encrypted-media; picture-in-picture; fullscreen",
									allowFullScreen: true
								}, `chapter:${video.id}:${chapterStart?.id === video.id ? chapterStart.revision : 0}`) : myFreeCamsRoom ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfficialRoomPlayer, {
									video,
									onOpen: () => recordPlay(video.id)
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
								className: "mt-2 break-words font-display text-4xl leading-none text-fg sm:text-5xl",
								children: video.name.replace(/\.[^/.]+$/, "")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 max-w-3xl text-sm leading-6 text-muted [overflow-wrap:anywhere]",
								children: video.tagline ?? "Preview this title, tune its metadata, then start watching."
							}),
							isAdultPullKind(video.remote?.kind) && !video.remote?.live && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								"data-adult-publication": true,
								className: "mt-3 text-xs text-muted",
								children: [["instant", "day"].includes(video.remote?.publishedPrecision ?? "") && video.addedAt > 0 ? "Published " + (video.remote?.publishedPrecision === "day" ? video.remote.publishedDate : new Date(video.addedAt).toLocaleDateString()) : "Publication date unknown", video.addedAt > 0 && !video.remote?.publishedPrecision ? " · legacy saved date is unverified" : ""]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeferredVideoReviews, { video }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 flex flex-wrap items-start gap-2",
								children: [
									!myFreeCamsRoom && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										onClick: () => openVideo(video.id),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 fill-current" }), " Watch now"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YoutubeDownloadButton, { video }),
									!myFreeCamsRoom && video.remote?.watchUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: isAdultPullKind(video.remote.kind) ? officialAdultUrl(video.remote) : video.remote.watchUrl,
										onClick: () => {
											if (isAdultPullKind(video.remote?.kind)) rememberOfficialViewing(video);
											recordPlay(video.id);
										},
										target: "_blank",
										rel: "noopener noreferrer",
										className: "inline-flex min-h-11 items-center rounded-sm bg-elevated px-3 text-sm text-fg shadow-border",
										children: ["Open official player ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-2 size-4" })]
									}),
									!myFreeCamsRoom && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
							!previewIsAdult && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecommendationChoices, {
								video,
								tags,
								favorite
							}, video.id),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PullPauseButton, {}),
							video.remote?.kind === "youtube" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YoutubePublicationControl, { video })
							}),
							video.remote?.kind === "youtube" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YoutubeTagsControl, { video })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TwitchChapters, {
								video,
								onNavigate: (seconds) => setChapterStart((previous) => ({
									id: video.id,
									seconds,
									revision: (previous?.revision ?? 0) + 1
								}))
							}, `chapters:${video.id}`),
							video.remote && supportsRemoteComments(video.remote.kind) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdultComments, { video }, video.id)
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
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: creatorFavorite ? "default" : "secondary",
												"aria-pressed": creatorFavorite,
												onClick: () => {
													toggleCreatorFavorite(creator);
													setCreatorRevision((value) => value + 1);
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: creatorFavorite ? "size-3.5 fill-current" : "size-3.5" }), creatorFavorite ? "Creator favorite" : "Favorite creator"]
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
										children: "Creator likes, favorites and ratings boost related recommendations. Watch time and private marks add bounded interest. Pulling older videos expands coverage."
									})
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "min-w-0 rounded-lg bg-elevated p-5 shadow-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Details"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: topicEvidence(video, tags, !previewIsAdult).map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
							video.remote?.kind === "twitch" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 rounded-md border border-border p-3",
								"aria-label": "Twitch media type",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-fg",
									children: twitchContentLabel(video)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs leading-5 text-muted",
									children: knownTwitchContent(video) ? "Twitch " + knownTwitchContent(video).source + " shelf · " + new Date(knownTwitchContent(video).at).toLocaleString() : "No matching subtype shelf observation is saved. Clip identity can be recognized from a saved clip URL or ID. Duration and title are not type evidence."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 flex flex-wrap gap-1.5",
								children: visibleTags.length ? visibleTags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex overflow-hidden rounded-xs bg-bg/50 text-xs text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										title: `Show videos tagged ${tag} · confidence-adjusted preference ${tagPreference(tag)} · ${tagEvidence(tag)?.count ?? 0} rated videos`,
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
												children: ["· ", tagPreference(tag)]
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
										"aria-label": `Rate ${video.name} ${value} stars`,
										"aria-pressed": rating === value,
										title: rating === value ? "Click again to clear your rating" : `Rate ${value} stars`,
										onClick: () => setRating(video.id, rating === value ? 0 : value),
										className: `flex size-9 items-center justify-center rounded-sm text-sm shadow-border ${value <= rating ? "bg-accent text-accent-fg" : "bg-bg/50 text-accent"}`,
										children: value
									}, value))
								})]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Suggestions use matching creators, title topics, tags and your saved feedback."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						className: "min-h-11",
						onClick: () => setRecommendationSeed((value) => value + 1 >>> 0),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), "Refresh suggestions"]
					})]
				}),
				ranked.error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					role: "status",
					className: "mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-border p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [ranked.error, " Existing suggestions remain available when compatible."]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "min-h-11",
						onClick: ranked.retry,
						children: "Retry preview suggestions"
					})]
				}),
				related.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-9",
					"data-preview-shelf": "related",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl text-fg",
						children: previewIsAdult ? "More Adult picks from this shelf" : "More from this shelf"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6",
						children: related.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RecommendationButton, {
							video: item,
							surface: "preview",
							enabled: !previewIsAdult,
							"data-preview-pick": item.id,
							type: "button",
							onClick: () => useLibrary.getState().openPreview(item.id),
							className: "overflow-hidden rounded-md bg-elevated text-left shadow-border hover:bg-surface",
							children: [
								item.poster ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: item.poster,
									alt: "",
									loading: "lazy",
									className: "aspect-video w-full object-cover",
									onError: (event) => {
										const fallback = item.remote?.kind === "youtube" && item.remote.videoId ? `https://i.ytimg.com/vi/${item.remote.videoId}/mqdefault.jpg` : "";
										if (fallback && event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
										else event.currentTarget.style.display = "none";
									}
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "block aspect-video bg-bg" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block px-3 pt-2 text-sm text-fg",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "line-clamp-2",
										children: item.name
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block truncate px-3 pb-3 pt-1 text-xs text-muted",
									children: [item.remote?.channelName || item.genre || "From your library", item.duration ? ` · ${Math.floor(item.duration / 60)}:${String(Math.floor(item.duration % 60)).padStart(2, "0")}` : ""]
								})
							]
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
							children: previewIsAdult ? "A fresh Adult-only mix based on this title’s tags, creator, source, and your saved Adult interests." : "Different picks based on this title’s topics and your saved interests, with room for other creators and less-watched videos."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6",
							children: recommended.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RecommendationButton, {
								video: item,
								surface: "preview",
								enabled: !previewIsAdult,
								"data-preview-pick": item.id,
								type: "button",
								onClick: () => useLibrary.getState().openPreview(item.id),
								className: "overflow-hidden rounded-md bg-elevated text-left shadow-border hover:bg-surface",
								children: [
									item.poster ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: item.poster,
										alt: "",
										loading: "lazy",
										className: "aspect-video w-full object-cover",
										onError: (event) => {
											const fallback = item.remote?.kind === "youtube" && item.remote.videoId ? `https://i.ytimg.com/vi/${item.remote.videoId}/mqdefault.jpg` : "";
											if (fallback && event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
											else event.currentTarget.style.display = "none";
										}
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "block aspect-video bg-bg" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block px-3 pt-2 text-sm text-fg",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "line-clamp-2",
											children: item.name
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "block truncate px-3 pb-3 pt-1 text-xs text-muted",
										children: [item.remote?.channelName || item.genre || "From your library", item.duration ? ` · ${Math.floor(item.duration / 60)}:${String(Math.floor(item.duration % 60)).padStart(2, "0")}` : ""]
									})
								]
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
