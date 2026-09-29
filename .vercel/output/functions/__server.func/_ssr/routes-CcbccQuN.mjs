import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { $ as rankingFeedbackSnapshot, B as isClassicVideo, Bt as topicsForVideo, C as exportFeedback, Ct as selectLive, Dt as selectYoutubeLiveChannels, E as getCreatorRating, Et as selectYoutube, F as getYoutubeFirstClickTrace, Ft as tagIsLiked, G as loadAdultArchiveCursors, Gt as youtubeCreatorProfiles, H as isTopicTag, I as getYoutubeTraceRevision, It as titleOf, J as markYoutubeArtworkReady, Jt as Input, K as loadDurablePhotosSync, Kt as youtubeSweepDue, L as hasFreshViewerCount, Lt as toggleCreatorLike, M as getRatingStreakSnapshot, Mt as setRatingWeeklyGoal, N as getWatchTime, Nt as subscribeYoutubeTrace, O as getHeartedTagHistory, Ot as selectYoutubeSweepChannels, Pt as tagHasHeartHistory, Q as planFollowRemoval, Qt as formatTime, R as importFeedback, S as ensureImageBudgetVisibilityHook, St as selectHistory, T as fetchTwitchFollowing, Tt as selectVisible, U as librarySearchIndex, Ut as userFolderCount, V as isLikelyPlayable, Vt as useLibrary, W as linksFromHistoryAndResume, Wt as watchTimeScore, X as markYoutubeSelectorReady, Xt as formatAgo, Y as markYoutubeRailReady, Yt as cn, Z as measureInteraction, Zt as formatBytes, _t as selectAdultRemote, bt as selectFavorites, c as companionCacheThumbUrl, ct as saveDurableLinks, dt as saveDurableResume, et as ratingPreference, ft as saveDurableShelves, ht as scheduleBackgroundWork, it as resolvePlayUrl, j as getRating, jt as setRating, kt as setCreatorRating, lt as saveDurableMarks, mt as saveThumbCache, n as RECOMMENDED_FOLDERS, ot as resumeForVideo, pt as saveFollows, q as loadThumbCache, qt as Button, r as acquireImageSlot, st as saveDurableHistory, t as RATING_GOALS, u as companionGetThumb, ut as saveDurablePhotos, vt as selectClassics, wt as selectTwitch, x as creatorIsLiked, xt as selectFeatured, yt as selectContinue } from "./store-uZbLuJol.mjs";
import { B as isDecodedAdultThumbLikelyReal, D as adultThumbCandidatesForVideo, F as isAdultGenreTag, H as markAdultThumbFailed, I as isAdultImageKind, R as isAdultPullKind, T as adultTaxonomyTags, U as markAdultThumbGood, c as ADULT_PULL_PROVIDERS, p as LIBRARY_LIMITS, w as adultTaxonomyLabel, x as adultRemoteLabel, z as isAdultThumbBlacklisted } from "./adult-pull-cache-CM6xh6_t.mjs";
import { n as create, t as useShallow } from "../_libs/zustand.mjs";
import { a as countAdultBySource, c as rankAdultMetaTags, d as videoMatchesAdultTag, l as rankAdultTags, n as adultProviderKind, o as isAdultInterestTag, r as adultProviderKinds, s as isAdultMetaTag, t as ADULT_SOURCE_FILTERS, u as videoMatchesAdultSource } from "./adult-rank-Bn2wocg4.mjs";
import { C as Settings2, Ct as CircleAlert, D as RefreshCw, Dt as Check, Et as ChevronDown, F as MonitorPlay, G as List, H as Lock, K as ListPlus, Mt as BellOff, N as Music2, O as Radio, Ot as ChartColumn, P as Monitor, Q as Image, St as CircleCheck, U as LockOpen, W as LoaderCircle, Y as LayoutGrid, Z as Images, _ as Smartphone, _t as Download, at as Gamepad2, b as Shuffle, bt as Clock3, c as Upload, ct as FolderPlus, d as Trash2, dt as Film, et as ImageOff, f as ThumbsUp, ft as FileText, g as Sparkles, h as Star, ht as ExternalLink, jt as Bell, k as Play, kt as Box, l as Twitch, lt as Flame, mt as EyeOff, n as X, nt as Heart, o as Video, ot as Folder, p as Tag, pt as Eye, q as ListChecks, r as Wifi, s as Users, st as FolderSearch, t as Youtube, tt as History, w as Search, wt as ChevronRight, x as ShoppingBag, xt as Clapperboard, z as Menu } from "../_libs/lucide-react.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { i as zipSync, n as strToU8, r as unzipSync, t as strFromU8 } from "../_libs/fflate.mjs";
import { a as DialogPortal, i as DialogOverlay, n as DialogClose, o as DialogTitle, r as DialogContent, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { a as Trigger, i as Root2, n as Item2, r as Portal2, t as Content2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { t as Root } from "../_libs/radix-ui__react-separator.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/adult-photo-download-78-zrAip.js
var cache = /* @__PURE__ */ new Map();
async function probeHardwareDecode(mime, width = 1920, height = 1080) {
	const key = `${mime}:${width}x${height}`;
	const hit = cache.get(key);
	if (hit) return hit;
	const fallback = {
		supported: true,
		powerEfficient: false,
		smooth: true
	};
	const mc = navigator.mediaCapabilities;
	if (!mc?.decodingInfo) {
		cache.set(key, fallback);
		return fallback;
	}
	const contentType = mime.includes("codecs") ? mime : mime === "video/webm" ? "video/webm; codecs=\"vp09.00.10.08\"" : "video/mp4; codecs=\"avc1.640028\"";
	try {
		const hw = await mc.decodingInfo({
			type: "file",
			video: {
				contentType,
				width,
				height,
				bitrate: 8e6,
				framerate: 30,
				hardwareAcceleration: "prefer-hardware"
			}
		});
		const info = {
			supported: hw.supported,
			powerEfficient: hw.powerEfficient,
			smooth: hw.smooth
		};
		cache.set(key, info);
		return info;
	} catch {
		cache.set(key, fallback);
		return fallback;
	}
}
function attachFrameCallback(video, onFrame) {
	const el = video;
	if (typeof el.requestVideoFrameCallback !== "function") {
		const onTime = () => onFrame(video.currentTime);
		video.addEventListener("timeupdate", onTime);
		return () => video.removeEventListener("timeupdate", onTime);
	}
	let id = 0;
	let alive = true;
	const loop = (_now, meta) => {
		if (!alive) return;
		onFrame(meta.mediaTime);
		id = el.requestVideoFrameCallback(loop);
	};
	id = el.requestVideoFrameCallback(loop);
	return () => {
		alive = false;
		el.cancelVideoFrameCallback?.(id);
	};
}
async function bitmapFromVideo(video) {
	try {
		if (typeof createImageBitmap === "function" && video.videoWidth) return await createImageBitmap(video);
	} catch {
		return null;
	}
	return null;
}
var inflight = /* @__PURE__ */ new Set();
var active = 0;
var waiting = [];
var MAX_MEMORY_THUMBS = LIBRARY_LIMITS.memoryThumbEntries;
var MAX_ARTWORK_ATTEMPTS = 3;
var MAX_THUMB_QUEUE = 96;
var artworkHits = 0;
var artworkMisses = 0;
var artworkEvictions = 0;
function inputOrBackgroundWork() {
	return Boolean((typeof navigator !== "undefined" ? navigator : void 0)?.scheduling?.isInputPending?.()) || typeof document !== "undefined" && document.visibilityState !== "visible";
}
function maxThumbnailWorkers() {
	const nav = typeof navigator !== "undefined" ? navigator : void 0;
	const cores = nav?.hardwareConcurrency ?? 4;
	const memory = nav?.deviceMemory ?? 4;
	const adaptive = Boolean(nav?.scheduling?.isInputPending?.()) || typeof document !== "undefined" && document.visibilityState !== "visible" || memory <= 2 ? 1 : Math.min(4, Math.max(2, Math.floor(cores / (memory <= 4 ? 3 : 2))));
	try {
		const saved = Number(localStorage.getItem("reelcase.thumbnail-workers") ?? "0");
		return [
			1,
			2,
			3,
			4
		].includes(saved) ? Math.min(saved, adaptive + 1) : adaptive;
	} catch {
		return adaptive;
	}
}
async function acquire() {
	while (inputOrBackgroundWork() || active >= maxThumbnailWorkers()) if (inputOrBackgroundWork()) await new Promise((resolve) => window.setTimeout(resolve, 80));
	else await new Promise((resolve) => waiting.push(resolve));
	active += 1;
}
/** Local-only artwork queue/cache numbers for the opt-in diagnostics panel. */
function getThumbDiagnostics() {
	return {
		active,
		queued: waiting.length,
		inflight: inflight.size,
		hits: artworkHits,
		misses: artworkMisses,
		evictions: artworkEvictions
	};
}
function release() {
	active = Math.max(0, active - 1);
	const next = waiting.shift();
	if (next) next();
}
function capture(src) {
	return new Promise((resolve) => {
		const video = document.createElement("video");
		video.muted = true;
		video.playsInline = true;
		video.preload = "metadata";
		video.crossOrigin = "anonymous";
		video.className = "hw-video";
		let settled = false;
		const finish = (thumb, duration) => {
			if (settled) return;
			settled = true;
			window.clearTimeout(timer);
			video.removeAttribute("src");
			video.load();
			resolve({
				thumb,
				duration
			});
		};
		const timer = window.setTimeout(() => finish(null), 6e3);
		video.addEventListener("loadedmetadata", () => {
			const duration = Number.isFinite(video.duration) ? video.duration : void 0;
			const t = duration && duration > 0 ? Math.min(Math.max(duration * .15, .35), 6) : .35;
			try {
				video.currentTime = t;
			} catch {
				finish(null, duration);
			}
		});
		video.addEventListener("seeked", () => {
			(async () => {
				try {
					const width = video.videoWidth;
					const height = video.videoHeight;
					if (!width || !height) {
						finish(null, Number.isFinite(video.duration) ? video.duration : void 0);
						return;
					}
					const w = 360;
					const h = Math.round(height / width * w) || 360;
					const canvas = document.createElement("canvas");
					canvas.width = w;
					canvas.height = h;
					const ctx = canvas.getContext("2d", { alpha: false });
					if (!ctx) {
						finish(null);
						return;
					}
					const bitmap = await bitmapFromVideo(video);
					if (bitmap) {
						ctx.drawImage(bitmap, 0, 0, w, h);
						bitmap.close();
					} else ctx.drawImage(video, 0, 0, w, h);
					finish(canvas.toDataURL("image/jpeg", .74), Number.isFinite(video.duration) ? video.duration : void 0);
				} catch {
					finish(null);
				}
			})();
		});
		video.addEventListener("error", () => finish(null));
		video.src = src;
	});
}
var useThumbs = create((set, get) => ({
	byId: {},
	failed: {},
	durations: {},
	diagnostics: {},
	request: (video) => {
		const { byId, failed, diagnostics } = get();
		if (byId[video.id]) {
			artworkHits += 1;
			return;
		}
		if (failed[video.id] || inflight.has(video.id)) return;
		if ((diagnostics[video.id]?.attempts ?? 0) >= MAX_ARTWORK_ATTEMPTS) return;
		if (inflight.size >= MAX_THUMB_QUEUE) return;
		artworkMisses += 1;
		if (video.remote) return;
		inflight.add(video.id);
		(async () => {
			await acquire();
			try {
				const { thumb, duration } = await capture(await resolvePlayUrl(video));
				inflight.delete(video.id);
				if (thumb) {
					set((s) => {
						const nextThumbs = {
							...s.byId,
							[video.id]: thumb
						};
						const ids = Object.keys(nextThumbs);
						if (ids.length > MAX_MEMORY_THUMBS) {
							const evictedId = ids[0];
							const evicted = nextThumbs[evictedId];
							delete nextThumbs[evictedId];
							artworkEvictions += 1;
							if (typeof evicted === "string" && evicted.startsWith("blob:")) try {
								URL.revokeObjectURL(evicted);
							} catch {}
						}
						return {
							byId: nextThumbs,
							durations: duration && duration > 0 ? {
								...s.durations,
								[video.id]: duration
							} : s.durations
						};
					});
					saveThumbCache({
						id: video.id,
						thumb,
						at: Date.now()
					}).catch(() => void 0);
				} else set((s) => ({
					failed: {
						...s.failed,
						[video.id]: true
					},
					diagnostics: {
						...s.diagnostics,
						[video.id]: {
							attempts: (s.diagnostics[video.id]?.attempts ?? 0) + 1,
							lastError: "No decodable frame",
							at: Date.now()
						}
					},
					durations: duration && duration > 0 ? {
						...s.durations,
						[video.id]: duration
					} : s.durations
				}));
			} catch {
				inflight.delete(video.id);
				set((s) => ({
					failed: {
						...s.failed,
						[video.id]: true
					},
					diagnostics: {
						...s.diagnostics,
						[video.id]: {
							attempts: (s.diagnostics[video.id]?.attempts ?? 0) + 1,
							lastError: "Source could not be reopened",
							at: Date.now()
						}
					}
				}));
			} finally {
				release();
			}
		})();
	},
	retry: (video) => {
		set((s) => {
			if ((s.diagnostics[video.id]?.attempts ?? 0) >= MAX_ARTWORK_ATTEMPTS) return s;
			const failed = { ...s.failed };
			delete failed[video.id];
			return { failed };
		});
		get().request(video);
	},
	hydrate: async () => {
		try {
			const rows = await loadThumbCache(MAX_MEMORY_THUMBS);
			set((s) => ({ byId: {
				...Object.fromEntries(rows.map((row) => [row.id, row.thumb])),
				...s.byId
			} }));
		} catch {}
	},
	/** Recall a companion-disk thumb when browser IndexedDB was pruned. */
	recallCompanion: async (id) => {
		if (!id || get().byId[id]) return;
		const dataUrl = await companionGetThumb(id);
		if (!dataUrl) return;
		set((s) => ({ byId: {
			...s.byId,
			[id]: dataUrl
		} }));
		saveThumbCache({
			id,
			thumb: dataUrl,
			at: Date.now()
		}).catch(() => void 0);
	}
}));
/** Resolve the best direct image URL for an adult photo-kind card. */
function adultPhotoDownloadUrl(video) {
	if (!isAdultImageKind(video.remote?.kind, video.mime, video.extension)) {
		if (!(video.mime?.startsWith("image/") || video.extension === "image")) return null;
	}
	const url = video.src || video.remote?.embedUrl || video.remote?.previewUrl || video.poster || "";
	if (!url || !/^https?:\/\//i.test(url)) return null;
	return url;
}
function filenameFor(video, url) {
	const ext = (url.split("?")[0]?.split("/").pop() || "").match(/\.(jpe?g|png|gif|webp|avif)$/i)?.[1]?.toLowerCase() || "jpg";
	return `${(video.name || video.id || "adult-photo").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72) || "adult-photo"}.${ext}`;
}
/**
* Save an adult photo to the user's local disk via browser download.
* Uses File System Access `showSaveFilePicker` when available; otherwise
* falls back to an anchor download of a fetched blob.
*/
async function downloadAdultPhoto(video) {
	const url = adultPhotoDownloadUrl(video);
	if (!url) return {
		ok: false,
		error: "No downloadable image on this title."
	};
	const name = filenameFor(video, url);
	try {
		const res = await fetch(url, {
			mode: "cors",
			credentials: "omit"
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const blob = await res.blob();
		const handlePicker = window.showSaveFilePicker;
		if (typeof handlePicker === "function") try {
			const handle = await handlePicker({
				suggestedName: name,
				types: [{
					description: "Image",
					accept: { [blob.type || "image/jpeg"]: [`.${name.split(".").pop()}`] }
				}]
			});
			const writable = await handle.createWritable();
			await writable.write(blob);
			await writable.close();
			return {
				ok: true,
				name: handle.name || name
			};
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return {
				ok: false,
				error: "Save cancelled."
			};
		}
		const objectUrl = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = objectUrl;
		a.download = name;
		a.rel = "noopener";
		document.body.appendChild(a);
		a.click();
		a.remove();
		window.setTimeout(() => URL.revokeObjectURL(objectUrl), 3e4);
		return {
			ok: true,
			name
		};
	} catch (err) {
		try {
			const a = document.createElement("a");
			a.href = url;
			a.target = "_blank";
			a.rel = "noreferrer";
			a.download = name;
			document.body.appendChild(a);
			a.click();
			a.remove();
			return {
				ok: true,
				name
			};
		} catch {
			return {
				ok: false,
				error: err instanceof Error ? err.message : "Download failed."
			};
		}
	}
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CcbccQuN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var mountedCards = 0;
var longFrames = 0;
var lastFrameMs = 0;
var worstFrameMs = 0;
var previousFrame = 0;
var frameLoopRunning = false;
var startedAt$1 = Date.now();
function observeFrames() {
	if (frameLoopRunning || typeof window === "undefined") return;
	frameLoopRunning = true;
	const frame = (now) => {
		if (previousFrame) {
			lastFrameMs = Math.round(now - previousFrame);
			worstFrameMs = Math.max(worstFrameMs, lastFrameMs);
			if (lastFrameMs > 34) longFrames += 1;
		}
		previousFrame = now;
		if (mountedCards > 0) window.requestAnimationFrame(frame);
		else frameLoopRunning = false;
	};
	window.requestAnimationFrame(frame);
}
/** Lightweight, local-only telemetry for the diagnostics panel. */
function registerMountedCard() {
	mountedCards += 1;
	observeFrames();
	return () => {
		mountedCards = Math.max(0, mountedCards - 1);
	};
}
function getRenderBudgetSnapshot() {
	return {
		mountedCards,
		longFrames,
		lastFrameMs,
		worstFrameMs,
		startedAt: startedAt$1
	};
}
var publishedDateFormat = new Intl.DateTimeFormat(void 0, {
	month: "short",
	day: "numeric",
	year: "numeric"
});
var THUMB_LOAD_TIMEOUT_MS = 4500;
var RAIL_WARM_INDEX = 8;
var EMPTY_TAGS = [];
var artworkRepairRequested = /* @__PURE__ */ new Set();
var remoteArtworkRepairRequested = /* @__PURE__ */ new Set();
var VideoCard = (0, import_react.memo)(function VideoCard({ video, variant = "grid", index = 0, playedAt, className }) {
	const ref = (0, import_react.useRef)(null);
	const thumb = useThumbs((s) => s.byId[video.id]);
	const failed = useThumbs((s) => s.failed[video.id]);
	const capturedDur = useThumbs((s) => s.durations[video.id]);
	const request = useThumbs((s) => s.request);
	const retry = useThumbs((s) => s.retry);
	const recallCompanion = useThumbs((s) => s.recallCompanion);
	const artworkDiagnostic = useThumbs((s) => s.diagnostics[video.id]);
	const repairArtworkSource = useLibrary((s) => s.repairArtworkSource);
	const followRemoteQuery = useLibrary((s) => s.followRemoteQuery);
	const progress = useLibrary((s) => s.progress[video.id]);
	const fav = useLibrary((s) => Boolean(s.favorites[video.id]));
	const liked = useLibrary((s) => Boolean(s.likes[video.id]));
	const tags = useLibrary((s) => s.tags[video.id] ?? EMPTY_TAGS);
	const category = useLibrary((s) => s.categories[video.id] ?? "");
	const viewCount = useLibrary((s) => s.viewCounts[video.id] ?? 0);
	const cameCount = useLibrary((s) => s.cameCounts[video.id] ?? 0);
	const adultFolder = useLibrary((s) => Boolean(s.folders.find((folder) => folder.id === video.folderId)?.adult));
	const markCame = useLibrary((s) => s.markCame);
	const adult = adultFolder || isAdultPullKind(video.remote?.kind);
	const adultPhoto = Boolean(adult && isAdultImageKind(video.remote?.kind, video.mime, video.extension));
	const toggleLike = useLibrary((s) => s.toggleLike);
	const openPreview = useLibrary((s) => s.openPreview);
	const toggleFavorite = useLibrary((s) => s.toggleFavorite);
	const hideVideo = useLibrary((s) => s.hideVideo);
	const setVideoTags = useLibrary((s) => s.setVideoTags);
	const setQuery = useLibrary((s) => s.setQuery);
	const setSource = useLibrary((s) => s.setSource);
	const sourceId = useLibrary((s) => s.sourceId);
	const hiddenAdult = adult && tags.includes("hidden");
	const duration = capturedDur ?? video.duration;
	const ratio = progress && progress.d > 0 ? Math.min(1, progress.t / progress.d) : 0;
	const playable = isLikelyPlayable(video.extension);
	const youtubeId = video.remote?.kind === "youtube" ? video.remote.videoId ?? video.remote.embedUrl?.match(/(?:embed\/|v=)([A-Za-z0-9_-]{11})/)?.[1] : void 0;
	const youtubeFallback = youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : void 0;
	const youtubeFallbacks = youtubeId ? [
		`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
		`https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`,
		`https://i.ytimg.com/vi/${youtubeId}/sddefault.jpg`,
		`https://i.ytimg.com/vi/${youtubeId}/default.jpg`
	] : [];
	const adultCandidates = (0, import_react.useMemo)(() => video.remote && video.remote.kind !== "youtube" && video.remote.kind !== "twitch" ? adultThumbCandidatesForVideo(video) : [], [video]);
	const providerArt = video.poster || youtubeFallback || video.remote?.previewUrl;
	const isPoster = variant === "poster";
	const live = Boolean(video.remote?.live);
	const imageReferrerPolicy = video.remote?.kind === "booru" && video.remote.channelId === "rule34" ? "strict-origin-when-cross-origin" : "no-referrer";
	const dualSource = video.remote?.sourceKinds?.includes("reddit") && video.remote.sourceKinds.includes("redgifs");
	const preview = video.remote?.previewUrl;
	const [hovered, setHovered] = (0, import_react.useState)(false);
	const [thumbIndex, setThumbIndex] = (0, import_react.useState)(0);
	const [artVisible, setArtVisible] = (0, import_react.useState)(false);
	const [artPriority, setArtPriority] = (0, import_react.useState)("low");
	const [artAllowed, setArtAllowed] = (0, import_react.useState)(false);
	const [paintedSrc, setPaintedSrc] = (0, import_react.useState)();
	const [candidateReady, setCandidateReady] = (0, import_react.useState)(false);
	const [textFirst, setTextFirst] = (0, import_react.useState)(false);
	const [rating, setRating$1] = (0, import_react.useState)(0);
	const imageSlotRelease = (0, import_react.useRef)(void 0);
	const releaseImageSlot = () => {
		imageSlotRelease.current?.();
		imageSlotRelease.current = void 0;
		setArtAllowed(false);
	};
	const thumbCandidates = (0, import_react.useMemo)(() => {
		const out = [];
		const seen = /* @__PURE__ */ new Set();
		const push = (url) => {
			if (!url || seen.has(url)) return;
			seen.add(url);
			out.push(url);
		};
		if (variant === "poster") {
			push(providerArt);
			push(thumb);
		} else {
			push(thumb);
			push(providerArt);
		}
		for (const url of adultCandidates) push(url);
		for (const url of youtubeFallbacks) push(url);
		push(preview);
		return out;
	}, [
		adultCandidates,
		preview,
		providerArt,
		thumb,
		variant,
		youtubeId
	]);
	const resolvedThumbIndex = (() => {
		for (let i = thumbIndex; i < thumbCandidates.length; i++) if (!isAdultThumbBlacklisted(thumbCandidates[i])) return i;
		return thumbCandidates.length;
	})();
	const thumbsExhausted = thumbCandidates.length === 0 || resolvedThumbIndex >= thumbCandidates.length;
	const activeThumb = thumbsExhausted ? void 0 : thumbCandidates[resolvedThumbIndex];
	const showPreview = Boolean(hovered && preview && preview !== activeThumb && resolvedThumbIndex === 0 && !isAdultThumbBlacklisted(preview));
	const advanceThumb = () => {
		setCandidateReady(false);
		setThumbIndex((index) => {
			let next = index + 1;
			while (next < thumbCandidates.length && isAdultThumbBlacklisted(thumbCandidates[next])) next += 1;
			if (next >= thumbCandidates.length) repairRemoteArtwork();
			return next;
		});
	};
	(0, import_react.useEffect)(() => {
		setThumbIndex(0);
		setPaintedSrc(void 0);
		setCandidateReady(false);
	}, [
		video.id,
		video.poster,
		video.remote?.previewUrl
	]);
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el) return;
		const nearObserver = new IntersectionObserver((entries) => {
			const visible = entries.some((e) => e.isIntersecting);
			setArtVisible(visible);
			if (visible && !video.remote) request(video);
		}, { rootMargin: "160px" });
		const visibleObserver = new IntersectionObserver((entries) => {
			setArtPriority(entries.some((entry) => entry.isIntersecting) ? "high" : "low");
		});
		nearObserver.observe(el);
		visibleObserver.observe(el);
		return () => {
			nearObserver.disconnect();
			visibleObserver.disconnect();
		};
	}, [request, video]);
	(0, import_react.useEffect)(() => {
		if (!artVisible || !video.remote) return;
		recallCompanion(video.id);
	}, [
		artVisible,
		recallCompanion,
		video.id,
		video.remote
	]);
	(0, import_react.useEffect)(() => {
		if (!artVisible || thumbsExhausted || candidateReady || paintedSrc === activeThumb) {
			setArtAllowed(false);
			return;
		}
		let release;
		let cancelled = false;
		const controller = new AbortController();
		acquireImageSlot({
			priority: artPriority,
			signal: controller.signal
		}).then((done) => {
			if (!done) return;
			if (cancelled) {
				done();
				return;
			}
			release = done;
			imageSlotRelease.current = done;
			setArtAllowed(true);
		});
		return () => {
			cancelled = true;
			controller.abort();
			if (imageSlotRelease.current === release) imageSlotRelease.current = void 0;
			release?.();
			setArtAllowed(false);
		};
	}, [
		activeThumb,
		artPriority,
		artVisible,
		candidateReady,
		paintedSrc,
		thumbsExhausted,
		video.id
	]);
	(0, import_react.useEffect)(() => {
		setCandidateReady(false);
	}, [activeThumb]);
	(0, import_react.useEffect)(() => {
		if (!artVisible || !artAllowed || !activeThumb || showPreview || candidateReady) return;
		if (paintedSrc === activeThumb) return;
		const timer = window.setTimeout(() => {
			markAdultThumbFailed(activeThumb, adult ? video.id : void 0);
			releaseImageSlot();
			advanceThumb();
		}, THUMB_LOAD_TIMEOUT_MS);
		return () => window.clearTimeout(timer);
	}, [
		activeThumb,
		artAllowed,
		artVisible,
		candidateReady,
		paintedSrc,
		showPreview,
		thumbIndex
	]);
	(0, import_react.useEffect)(() => {
		setRating$1(getRating(video.id));
	}, [video.id]);
	(0, import_react.useEffect)(() => {
		setTextFirst(document.documentElement.dataset.artworkMode === "text");
	}, []);
	(0, import_react.useEffect)(() => registerMountedCard(), []);
	(0, import_react.useEffect)(() => {
		if (!failed || video.remote || artworkRepairRequested.has(video.folderId)) return;
		artworkRepairRequested.add(video.folderId);
		repairArtworkSource(video.folderId).then((rescanned) => {
			if (rescanned) retry(video);
		});
	}, [
		failed,
		repairArtworkSource,
		retry,
		video
	]);
	const rate = (value) => {
		measureInteraction("rating");
		setRating$1(value);
		window.requestAnimationFrame(() => setRating(video.id, value));
	};
	const repairRemoteArtwork = () => {
		if (!video.remote || video.remote.kind !== "youtube" && video.remote.kind !== "twitch" || remoteArtworkRepairRequested.has(video.folderId)) return;
		remoteArtworkRepairRequested.add(video.folderId);
		const query = video.remote.channelId ?? video.folderId.replace(/^(?:yt|tw):/, "");
		followRemoteQuery(query, video.remote.kind).catch(() => void 0);
	};
	const poster = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative overflow-hidden bg-elevated", variant === "list" && "h-16 w-28 shrink-0 rounded-sm", variant === "poster" && "aspect-poster w-full rounded-md", (variant === "grid" || variant === "rail") && "aspect-video w-full rounded-md"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"aria-hidden": "true",
				className: "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface text-muted",
				children: [failed || thumbsExhausted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageOff, {
					className: "size-8",
					strokeWidth: 1.5
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					className: "size-7 animate-spin text-accent",
					strokeWidth: 1.75
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs",
					children: failed || thumbsExhausted ? "Artwork unavailable" : "Loading preview"
				})]
			}),
			paintedSrc && !textFirst && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: paintedSrc,
				alt: "",
				"aria-hidden": true,
				decoding: "async",
				referrerPolicy: imageReferrerPolicy,
				className: "absolute inset-0 size-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
			}),
			!textFirst && artVisible && (artAllowed || candidateReady || paintedSrc === activeThumb) && !thumbsExhausted && (showPreview ? preview : activeThumb) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				loading: artPriority === "high" && index <= RAIL_WARM_INDEX ? "eager" : "lazy",
				decoding: "async",
				fetchPriority: index <= 3 && artPriority === "high" ? "high" : "auto",
				referrerPolicy: imageReferrerPolicy,
				src: showPreview ? preview : activeThumb,
				alt: "",
				onLoad: (event) => {
					if (showPreview) return;
					const img = event.currentTarget;
					const url = activeThumb;
					if (!url) return;
					if (!isDecodedAdultThumbLikelyReal(img)) {
						markAdultThumbFailed(url, adult ? video.id : void 0);
						releaseImageSlot();
						advanceThumb();
						return;
					}
					markAdultThumbGood(url, adult ? video.id : void 0);
					setPaintedSrc(url);
					setCandidateReady(true);
					releaseImageSlot();
					if (video.remote && /^https:\/\//i.test(url)) companionCacheThumbUrl(video.id, url);
				},
				onError: () => {
					if (showPreview) return;
					if (activeThumb) markAdultThumbFailed(activeThumb, adult ? video.id : void 0);
					releaseImageSlot();
					advanceThumb();
				},
				className: cn("relative size-full object-cover outline outline-1 -outline-offset-1 outline-fg/10 transition-opacity duration-150", candidateReady || paintedSrc === activeThumb ? "opacity-100" : "opacity-0")
			}, `${video.id}:${resolvedThumbIndex}:${showPreview ? "p" : "a"}`) : !paintedSrc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 outline outline-1 -outline-offset-1 outline-fg/10",
				children: failed && !video.remote && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					title: artworkDiagnostic ? `${artworkDiagnostic.lastError} · attempt ${artworkDiagnostic.attempts}/3` : void 0,
					className: "absolute bottom-2 left-2 right-2 rounded-xs bg-bg/80 px-2 py-1 text-center text-[11px] text-muted",
					children: ["Local artwork unavailable", artworkDiagnostic ? ` · ${artworkDiagnostic.attempts}/3` : ""]
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-linear-to-t from-bg/80 via-transparent to-transparent opacity-90" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-11 items-center justify-center rounded-full bg-accent text-accent-fg shadow-lift",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-4 fill-current" })
				})
			}),
			live && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "absolute top-2 left-2 flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger px-2.5 py-1 text-[11px] font-bold tracking-[0.12em] text-white uppercase shadow-lift",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "live-dot size-1.5 rounded-full bg-white shadow-[0_0_0_3px_rgb(255_255_255_/_0.2)]" }), "Live"]
			}),
			video.remote?.kind === "youtube" && !live && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute top-2 left-2 rounded-xs bg-bg/75 px-1.5 py-0.5 text-xs text-muted",
				children: "YouTube"
			}),
			video.remote?.kind === "twitch" && !live && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute top-2 left-2 rounded-xs bg-bg/75 px-1.5 py-0.5 text-xs text-muted",
				children: "Twitch"
			}),
			dualSource && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute top-2 left-2 rounded-xs bg-bg/80 px-1.5 py-0.5 text-xs text-accent",
				children: "Reddit + Redgifs"
			}),
			duration && !isPoster && !live ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute right-2 bottom-2 rounded-xs bg-bg/75 px-1.5 py-0.5 font-mono text-xs tabular-nums text-fg",
				children: formatTime(duration)
			}) : null,
			isPoster && video.year ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute bottom-2 left-2 font-mono text-xs tabular-nums text-fg/90",
				children: video.year
			}) : null,
			ratio > .02 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute inset-x-0 bottom-0 h-0.5 bg-fg/20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block h-full bg-accent",
					style: { width: `${Math.round(ratio * 100)}%` }
				})
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-video-card": true,
		className: cn("stagger-in group relative", isPoster && "poster-hit", live && "rounded-lg border border-border bg-surface p-2 shadow-border", className),
		style: { ["--stagger-i"]: Math.min(index, 16) },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				ref,
				"data-video-card-open": true,
				type: "button",
				onMouseEnter: () => setHovered(true),
				onMouseLeave: () => setHovered(false),
				onClick: () => openPreview(video.id),
				className: cn("w-full text-left outline-none", variant === "list" && "flex items-center gap-3 rounded-lg p-2 hover:bg-elevated", variant === "grid" && "block", variant === "rail" && "block w-56 shrink-0", variant === "poster" && "block w-full"),
				children: [
					poster,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("min-w-0", variant === "list" ? "flex-1" : "mt-2.5"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "min-w-0 flex-1 truncate text-sm font-medium text-fg",
									children: titleOf(video)
								}), fav && variant !== "list" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "mt-0.5 size-3.5 shrink-0 fill-accent text-accent" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 truncate text-xs text-muted",
								children: playedAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: formatAgo(playedAt) }) : live ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [video.remote?.channelName ?? "Twitch", hasFreshViewerCount(video.remote) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-subtle",
										children: " · "
									}),
									video.remote?.viewers?.toLocaleString(),
									" watching"
								] }) : null] }) : video.remote ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									video.remote.channelName ?? video.remote.kind,
									video.remote.views ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-subtle",
											children: " · "
										}),
										video.remote.views.toLocaleString(),
										" views"
									] }) : null,
									video.remote.kind === "youtube" || video.remote.kind === "twitch" && !live ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-subtle",
										children: " · "
									}), video.addedAt > Date.UTC(2e3, 0, 1) ? `Published ${publishedDateFormat.format(video.addedAt)}` : "Older catalog item"] }) : null
								] }) : video.year || video.genre ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [video.year ?? video.extension.toUpperCase(), video.genre && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-subtle",
									children: " · "
								}), video.genre] })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									video.extension.toUpperCase(),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-subtle",
										children: " · "
									}),
									formatBytes(video.size),
									!playable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-subtle",
										children: " · "
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "May not play" })] })
								] })
							}),
							rating > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 flex items-center gap-1 text-xs text-accent",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-3 fill-current" }),
									" Your rating ",
									rating,
									"/5"
								]
							}),
							viewCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-subtle",
								children: [
									"Watched ",
									viewCount,
									" time",
									viewCount === 1 ? "" : "s"
								]
							}),
							adult && cameCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-accent",
								children: [
									"I cummed to it · ",
									cameCount,
									"×"
								]
							}),
							(category || tags.length > 0) && variant !== "list" && variant !== "rail" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 flex items-center gap-1 truncate text-xs text-subtle",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-3 shrink-0" }), [category, ...tags.slice(0, 6)].filter(Boolean).join(" · ")]
							})
						]
					}),
					variant === "list" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden max-w-xs truncate text-xs text-subtle sm:block",
						children: video.path
					})
				]
			}),
			tags.length > 0 && variant !== "list" && variant !== "rail" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 flex flex-wrap gap-1",
				"aria-label": "Tags",
				children: tags.slice(0, 4).map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: (event) => {
						event.stopPropagation();
						if (adult || sourceId === "adults" || sourceId === "adult-fetishes") {
							setQuery("");
							setSource("adults");
							window.dispatchEvent(new CustomEvent("reelcase:adult-tag", { detail: { tag } }));
						} else setQuery(tag);
					},
					className: "rounded-sm bg-elevated px-1.5 py-0.5 text-[10px] text-subtle transition-colors hover:bg-border hover:text-fg",
					title: `Show titles tagged ${tag}`,
					children: ["#", tag]
				}, tag))
			}),
			failed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": `Retry artwork for ${video.name}`,
				onClick: (event) => {
					event.stopPropagation();
					retry(video);
				},
				className: "absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-sm bg-bg/75 text-fg opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" })
			}),
			!live && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": fav ? "Remove from favorites" : "Add to favorites",
				onClick: (e) => {
					e.stopPropagation();
					toggleFavorite(video.id);
				},
				className: cn("absolute top-2 right-2 flex size-9 items-center justify-center rounded-sm bg-bg/55 text-fg opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100", fav && "opacity-100", variant === "list" && "top-3 right-3"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-3.5", fav && "fill-accent text-accent") })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": `Hide ${video.name} from your library`,
				title: "Hide this title everywhere until restored in Settings",
				onClick: (event) => {
					event.stopPropagation();
					hideVideo(video.id);
					toast.message("Title hidden. Restore it from Settings → Hidden titles.");
				},
				className: "absolute top-2 left-2 flex size-9 items-center justify-center rounded-sm bg-bg/75 text-fg opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-3.5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				"aria-label": `Watch ${video.name} together`,
				onClick: (event) => {
					event.stopPropagation();
					localStorage.setItem("reelcase.watch-room.pending-video", video.id);
					setSource("watch-room");
				},
				className: cn("absolute bottom-2 left-2 flex min-h-9 items-center gap-1 rounded-sm bg-bg/75 px-2 text-xs text-fg opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100", variant === "list" && "bottom-3 left-auto right-3"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5" }), " Together"]
			}),
			!live && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": liked ? "Remove like" : "Like",
				onClick: (event) => {
					event.stopPropagation();
					toggleLike(video.id);
				},
				className: cn("absolute top-11 right-2 flex size-9 items-center justify-center rounded-sm bg-bg/55 text-fg opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100", liked && "opacity-100", variant === "list" && "top-12 right-3"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, { className: cn("size-3.5", liked && "fill-accent text-accent") })
			}),
			adult && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				"aria-label": "I cummed to it",
				onClick: (event) => {
					event.stopPropagation();
					markCame(video.id);
				},
				className: cn("absolute top-20 right-2 flex min-h-9 items-center gap-1 rounded-sm bg-bg/55 px-1.5 text-[10px] text-fg opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100", cameCount > 0 && "opacity-100 text-accent", variant === "list" && "top-[4.75rem] right-3"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: cn("size-3.5", cameCount > 0 && "fill-accent text-accent") }), cameCount > 0 ? cameCount : ""]
			}),
			adult && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": hiddenAdult ? "Show this Adult title in rails" : "Hide this Adult title from rails",
				title: hiddenAdult ? "Remove #hidden and show in Adult rails" : "Add #hidden and remove from Adult rails",
				onClick: (event) => {
					event.stopPropagation();
					setVideoTags(video.id, hiddenAdult ? tags.filter((tag) => tag !== "hidden") : [...tags, "hidden"]);
					toast.message(hiddenAdult ? "Removed #hidden — title is visible again." : "Added #hidden — title is removed from Adult rails.");
				},
				className: cn("absolute bottom-2 right-2 flex size-9 items-center justify-center rounded-sm bg-bg/75 text-fg opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100", hiddenAdult && "opacity-100 text-accent", failed && "bottom-11", variant === "list" && "bottom-3 right-3"),
				children: hiddenAdult ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-3.5" })
			}),
			adultPhoto && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Download photo",
				title: "Download photo to this device",
				onClick: (event) => {
					event.stopPropagation();
					downloadAdultPhoto(video).then((result) => {
						if (result.ok) toast.success(`Saved ${result.name}`);
						else if (result.error !== "Save cancelled.") toast.error(result.error);
					});
				},
				className: cn("absolute top-[7.25rem] right-2 flex size-9 items-center justify-center rounded-sm bg-bg/55 text-fg opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100", variant === "list" && "top-[6.5rem] right-3"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" })
			}),
			live && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex items-center justify-between border-t border-border pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] text-muted",
					children: "Save this stream"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-label": fav ? "Remove from favorites" : "Add to favorites",
						onClick: (event) => {
							event.stopPropagation();
							toggleFavorite(video.id);
						},
						className: cn("flex min-h-8 items-center gap-1 rounded-sm px-2 text-xs transition-colors hover:bg-elevated", fav && "bg-accent/15 text-accent"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-3.5", fav && "fill-current") }), fav ? "Saved" : "Save"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-label": liked ? "Remove like" : "Like",
						onClick: (event) => {
							event.stopPropagation();
							toggleLike(video.id);
						},
						className: cn("flex min-h-8 items-center gap-1 rounded-sm px-2 text-xs transition-colors hover:bg-elevated", liked && "bg-accent/15 text-accent"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, { className: cn("size-3.5", liked && "fill-current") }), liked ? "Liked" : "Like"]
					})]
				})]
			}),
			!live && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute right-2 bottom-2 hidden items-center gap-0.5 rounded-sm bg-bg/75 p-1 text-accent backdrop-blur-sm group-hover:flex group-focus-within:flex",
				children: [
					1,
					2,
					3,
					4,
					5
				].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": `Rate ${video.name} ${value} stars`,
					onClick: (event) => {
						event.stopPropagation();
						rate(value);
					},
					className: cn("p-0.5", value <= rating && "text-fg"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-3", value <= rating && "fill-current") })
				}, value))
			})
		]
	});
});
function coverage(ready, total) {
	return {
		ready,
		missing: Math.max(0, total - ready),
		share: total ? ready / total : 0
	};
}
function isHttpUrl(value) {
	return Boolean(value && /^https?:\/\//i.test(value.trim()));
}
function previewCandidates(video) {
	const raw = [
		video.poster,
		video.remote?.previewUrl,
		...video.remote?.thumbFallbacks ?? []
	];
	const seen = /* @__PURE__ */ new Set();
	return raw.filter(isHttpUrl).map((url) => url.trim()).filter((url) => {
		const key = url.toLowerCase();
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}
/** Legacy transport/parser fragments should stay searchable on a card but
* must not be exported as a personal preference or a tag connection. */
function isAdultStatsNoiseTag(raw) {
	const tag = raw.trim().toLowerCase();
	if (!tag) return true;
	if (/(?:https?:|\bwww\b|\.com\b|\/watch\b|\/comments?\b)/.test(tag)) return true;
	const plain = tag.replace(/^fetish-/, "");
	return /^(?:https?|www|com|watch|comments?|reddit|redgifs|eporner|redtube|chaturbate|myfreecams|booru)(?:-|$)/.test(plain);
}
function usefulInterestTags(video, tags) {
	const raw = tags[video.id] ?? [];
	return [.../* @__PURE__ */ new Set([...raw, ...raw.flatMap(adultTaxonomyTags)])].filter((tag) => isAdultInterestTag(tag) && !isAdultStatsNoiseTag(tag));
}
function usefulMetaTags(video, tags) {
	const raw = tags[video.id] ?? [];
	return [.../* @__PURE__ */ new Set([...raw, ...raw.flatMap(adultTaxonomyTags)])].filter((tag) => isAdultMetaTag(tag) && !isAdultStatsNoiseTag(tag));
}
function meaningfulCreatorKeys(video, itemTags) {
	const creatorTags = itemTags.filter((tag) => tag.startsWith("creator-")).map((tag) => tag.slice(8).trim().toLowerCase()).filter((tag) => tag.length >= 2 && !isAdultStatsNoiseTag(tag));
	if (creatorTags.length) return [...new Set(creatorTags.map((tag) => `tag:${tag}`))];
	const name = video.remote?.channelName?.trim();
	if (!name) return [];
	const normalized = name.toLowerCase().replace(/^@/, "").replace(/\s+/g, " ");
	const kind = adultProviderKind(video);
	const providerNames = /* @__PURE__ */ new Set([
		kind,
		adultRemoteLabel(kind).toLowerCase(),
		"adult",
		"video",
		"live",
		"cam"
	]);
	if (!normalized || providerNames.has(normalized) || normalized.startsWith("r/")) return [];
	return [`remote:${normalized}`];
}
function hasAmbiguousCreator(video, itemTags) {
	return Boolean(video.remote?.channelName?.trim()) && meaningfulCreatorKeys(video, itemTags).length === 0;
}
function redgifsSlug(raw) {
	return raw.match(/https?:\/\/(?:www\.)?redgifs\.com\/(?:watch|ifr)\/([a-z0-9_-]+)/i)?.[1] ?? raw.match(/https?:\/\/thumbs\d*\.redgifs\.com\/([a-z0-9_-]+)-(?:mobile|poster|thumb)\.(?:jpe?g|webp)/i)?.[1] ?? raw.match(/https?:\/\/(?:i|media)\.redgifs\.com\/([a-z0-9_-]+)(?:[._-]|$)/i)?.[1];
}
function canonicalMediaLink(raw) {
	const redgifs = redgifsSlug(raw);
	if (redgifs) return `redgifs:${redgifs.toLowerCase()}`;
	try {
		const url = new URL(raw);
		const host = url.hostname.replace(/^www\./, "").toLowerCase();
		const path = url.pathname.replace(/\/+$/, "").toLowerCase();
		const hash = url.hash && url.hash !== "#" ? url.hash.toLowerCase() : "";
		if (host && path && path !== "/") return `url:${host}${path}${hash}`;
		return host && hash ? `url:${host}${hash}` : void 0;
	} catch {
		return;
	}
}
function duplicateSignalsFor(video) {
	const rows = [];
	const kind = adultProviderKind(video);
	const id = video.remote?.videoId?.trim();
	if (kind && id) rows.push({
		signal: "provider-id",
		key: `provider:${kind}:${id.toLowerCase()}`
	});
	for (const url of [
		video.remote?.embedUrl,
		video.remote?.watchUrl,
		video.src,
		video.poster,
		video.remote?.previewUrl
	].filter(isHttpUrl)) {
		const key = canonicalMediaLink(url);
		if (key) rows.push({
			signal: "media-link",
			key
		});
	}
	const seen = /* @__PURE__ */ new Set();
	return rows.filter((row) => {
		const identity = `${row.signal}\u0000${row.key}`;
		if (seen.has(identity)) return false;
		seen.add(identity);
		return true;
	});
}
function duplicateStats(videos) {
	const bySignal = /* @__PURE__ */ new Map([["provider-id", /* @__PURE__ */ new Map()], ["media-link", /* @__PURE__ */ new Map()]]);
	for (const video of videos) for (const row of duplicateSignalsFor(video)) {
		const groups = bySignal.get(row.signal);
		const group = groups.get(row.key) ?? /* @__PURE__ */ new Set();
		group.add(video.id);
		groups.set(row.key, group);
	}
	const parent = new Map(videos.map((video) => [video.id, video.id]));
	const find = (id) => {
		const root = parent.get(id) ?? id;
		if (root === id) return id;
		const canonical = find(root);
		parent.set(id, canonical);
		return canonical;
	};
	const join = (left, right) => {
		const a = find(left);
		const b = find(right);
		if (a !== b) parent.set(b, a);
	};
	for (const groups of bySignal.values()) for (const ids of groups.values()) {
		const [first, ...rest] = ids;
		if (!first || ids.size < 2) continue;
		for (const id of rest) join(first, id);
	}
	const components = /* @__PURE__ */ new Map();
	for (const video of videos) {
		const root = find(video.id);
		const group = components.get(root) ?? [];
		group.push(video.id);
		components.set(root, group);
	}
	const duplicateComponents = [...components.values()].filter((ids) => ids.length > 1);
	const bySignalRows = ["provider-id", "media-link"].map((signal) => {
		const groups = [...bySignal.get(signal).values()].filter((ids) => ids.size > 1);
		return {
			signal,
			groups: groups.length,
			affectedTitles: groups.reduce((sum, ids) => sum + ids.size, 0),
			extraTitles: groups.reduce((sum, ids) => sum + ids.size - 1, 0)
		};
	});
	const affectedTitles = duplicateComponents.reduce((sum, ids) => sum + ids.length, 0);
	const extraTitles = duplicateComponents.reduce((sum, ids) => sum + ids.length - 1, 0);
	return {
		candidateGroups: duplicateComponents.length,
		affectedTitles,
		extraTitles,
		share: videos.length ? affectedTitles / videos.length : 0,
		bySignal: bySignalRows
	};
}
function countSubredditTags(videos, tags) {
	const counts = /* @__PURE__ */ new Map();
	for (const video of videos) if (adultProviderKinds(video).includes("reddit")) for (const tag of new Set((tags[video.id] ?? []).filter((tag) => tag.startsWith("sub-") && !isAdultStatsNoiseTag(tag)))) counts.set(tag, (counts.get(tag) ?? 0) + 1);
	return [...counts.entries()].map(([tag, count]) => ({
		tag,
		count,
		score: Math.log2(count + 1) * 10
	})).sort((a, b) => b.count - a.count || b.score - a.score || a.tag.localeCompare(b.tag)).slice(0, 40);
}
function buildAdultStatsSnapshot(videos, folders, tags, ctx) {
	const adultIds = new Set(folders.filter((folder) => folder.adult).map((folder) => folder.id));
	const matchedAdults = videos.filter((video) => adultIds.has(video.folderId) || Boolean(adultProviderKind(video)));
	const adultVideos = [...new Map(matchedAdults.map((video) => [video.id, video])).values()];
	const rankCtx = {
		...ctx,
		tags
	};
	const ranked = rankAdultTags(adultVideos, rankCtx, 160).filter((row) => !isAdultStatsNoiseTag(row.tag));
	const metaRanked = rankAdultMetaTags(adultVideos, rankCtx, 160).filter((row) => !isAdultStatsNoiseTag(row.tag));
	const sources = countAdultBySource(adultVideos);
	const primarySources = { all: adultVideos.length };
	for (const provider of ADULT_PULL_PROVIDERS) primarySources[provider] = 0;
	for (const video of adultVideos) {
		const provider = adultProviderKind(video);
		if (provider) primarySources[provider] = (primarySources[provider] ?? 0) + 1;
	}
	const dedupe = duplicateStats(adultVideos);
	const duplicateVideoIds = /* @__PURE__ */ new Set();
	for (const signal of ["provider-id", "media-link"]) {
		const seen = /* @__PURE__ */ new Map();
		for (const video of adultVideos) for (const row of duplicateSignalsFor(video)) if (row.signal === signal) {
			const previous = seen.get(row.key);
			if (previous) {
				duplicateVideoIds.add(previous);
				duplicateVideoIds.add(video.id);
			} else seen.set(row.key, video.id);
		}
	}
	const connections = /* @__PURE__ */ new Map();
	const interestCounts = /* @__PURE__ */ new Map();
	let noisyTagAssignments = 0;
	let adultTagged = 0;
	let declaredPreviews = 0;
	let backedPreviews = 0;
	let embeddable = 0;
	let redgifsTitles = 0;
	let redgifsPreviews = 0;
	let redgifsBackedPreviews = 0;
	let creatorCredited = 0;
	let creatorTagged = 0;
	let ambiguousCreators = 0;
	let usefulTagged = 0;
	let metadataTagged = 0;
	let multiInterestTagged = 0;
	let sourceTagged = 0;
	let usefulTagAssignments = 0;
	const creators = /* @__PURE__ */ new Set();
	for (const video of adultVideos) {
		const itemTags = tags[video.id] ?? [];
		const kind = adultProviderKind(video);
		const providerKinds = adultProviderKinds(video);
		const previews = previewCandidates(video);
		const interests = usefulInterestTags(video, tags);
		const metadata = usefulMetaTags(video, tags);
		const creatorKeys = meaningfulCreatorKeys(video, itemTags);
		if (itemTags.includes("adult")) adultTagged += 1;
		if (previews.length) declaredPreviews += 1;
		if (previews.length >= 2) backedPreviews += 1;
		if (video.remote?.embedUrl) embeddable += 1;
		if (providerKinds.includes("redgifs")) {
			redgifsTitles += 1;
			if (previews.length) redgifsPreviews += 1;
			if (previews.length >= 2) redgifsBackedPreviews += 1;
		}
		if (creatorKeys.length) {
			creatorCredited += 1;
			for (const creator of creatorKeys) creators.add(creator);
		}
		if (itemTags.some((tag) => tag.startsWith("creator-"))) creatorTagged += 1;
		if (hasAmbiguousCreator(video, itemTags)) ambiguousCreators += 1;
		if (interests.length) usefulTagged += 1;
		if (metadata.length) metadataTagged += 1;
		if (interests.length >= 2) multiInterestTagged += 1;
		if (providerKinds.length || itemTags.some((tag) => tag.startsWith("source-"))) sourceTagged += 1;
		usefulTagAssignments += interests.length;
		for (const tag of itemTags) if (isAdultStatsNoiseTag(tag)) noisyTagAssignments += 1;
		const useful = interests.slice(0, 8).sort();
		for (const tag of useful) interestCounts.set(tag, (interestCounts.get(tag) ?? 0) + 1);
		for (let left = 0; left < useful.length; left += 1) for (let right = left + 1; right < useful.length; right += 1) {
			const key = `${useful[left]}\u0000${useful[right]}`;
			const row = connections.get(key) ?? {
				count: 0,
				providers: /* @__PURE__ */ new Set()
			};
			row.count += 1;
			row.providers.add(kind || "local");
			connections.set(key, row);
		}
	}
	const providerMix = ADULT_PULL_PROVIDERS.map((provider) => {
		const providerVideos = adultVideos.filter((video) => adultProviderKind(video) === provider);
		const linkedTitles = adultVideos.filter((video) => adultProviderKind(video) !== provider && adultProviderKinds(video).includes(provider)).length;
		const primaryTitles = providerVideos.length;
		const previewed = providerVideos.filter((video) => previewCandidates(video).length > 0).length;
		const backed = providerVideos.filter((video) => previewCandidates(video).length >= 2).length;
		const credited = providerVideos.filter((video) => meaningfulCreatorKeys(video, tags[video.id] ?? []).length > 0).length;
		const tagged = providerVideos.filter((video) => usefulInterestTags(video, tags).length > 0).length;
		return {
			provider,
			label: adultRemoteLabel(provider),
			titles: primaryTitles,
			share: adultVideos.length ? primaryTitles / adultVideos.length : 0,
			status: primaryTitles || linkedTitles ? "active" : "empty",
			linkedTitles,
			previewCoverage: coverage(previewed, primaryTitles),
			backupPreviewCoverage: coverage(backed, primaryTitles),
			creatorCoverage: coverage(credited, primaryTitles),
			usefulTagCoverage: coverage(tagged, primaryTitles),
			duplicateCandidates: providerVideos.filter((video) => duplicateVideoIds.has(video.id)).length
		};
	}).sort((a, b) => b.titles - a.titles || b.linkedTitles - a.linkedTitles || a.label.localeCompare(b.label));
	const tagConnections = [...connections.entries()].map(([key, row]) => {
		const [left, right] = key.split("\0");
		const expected = (interestCounts.get(left) ?? 0) * (interestCounts.get(right) ?? 0) / Math.max(adultVideos.length, 1);
		return {
			left,
			right,
			count: row.count,
			providerCount: row.providers.size,
			lift: Math.round(row.count / Math.max(expected, .01) * 100) / 100
		};
	}).filter((row) => row.count >= 2).sort((a, b) => b.count * Math.min(b.lift, 3) - a.count * Math.min(a.lift, 3) || b.count - a.count || b.providerCount - a.providerCount || a.left.localeCompare(b.left) || a.right.localeCompare(b.right)).slice(0, 40);
	return {
		at: Date.now(),
		titles: adultVideos.length,
		sources,
		primarySources,
		providerMix,
		genres: ranked.filter((row) => isAdultGenreTag(row.tag)).slice(0, 40).map((row) => ({
			...row,
			label: adultTaxonomyLabel(row.tag)
		})),
		topTags: ranked.slice(0, 60),
		metaTags: metaRanked.slice(0, 60),
		fetishTags: ranked.filter((row) => row.tag.startsWith("fetish-")).slice(0, 40),
		redditTags: countSubredditTags(adultVideos, tags),
		adultTagCoverage: {
			tagged: adultTagged,
			missing: adultVideos.length - adultTagged,
			share: adultVideos.length ? adultTagged / adultVideos.length : 0
		},
		previewCoverage: {
			...coverage(declaredPreviews, adultVideos.length),
			backed: backedPreviews,
			backedShare: adultVideos.length ? backedPreviews / adultVideos.length : 0,
			embeddable,
			redgifs: {
				...coverage(redgifsPreviews, redgifsTitles),
				backed: redgifsBackedPreviews,
				backedShare: redgifsTitles ? redgifsBackedPreviews / redgifsTitles : 0
			}
		},
		creatorCoverage: {
			...coverage(creatorCredited, adultVideos.length),
			canonicalTagged: creatorTagged,
			ambiguous: ambiguousCreators,
			uniqueCreators: creators.size
		},
		tagQuality: {
			usefulTagged,
			metadataTagged,
			multiInterestTagged,
			noUsefulInterest: adultVideos.length - usefulTagged,
			averageUsefulTags: adultVideos.length ? usefulTagAssignments / adultVideos.length : 0,
			sourceTagged
		},
		dedupe,
		tagConnections,
		noisyTagAssignments,
		markedTitles: adultVideos.filter((video) => (ctx.cameCounts[video.id] ?? 0) > 0).length,
		totalMarks: adultVideos.reduce((sum, video) => sum + (ctx.cameCounts[video.id] ?? 0), 0)
	};
}
function adultStatsToCsv(snapshot) {
	const quote = (value) => `"${String(value).replaceAll("\"", "\"\"")}"`;
	const rows = [
		[
			"metric",
			"key",
			"count",
			"score"
		],
		[
			"titles",
			"all",
			snapshot.titles,
			""
		],
		[
			"adult_tagged_titles",
			"adult",
			snapshot.adultTagCoverage.tagged,
			`${Math.round(snapshot.adultTagCoverage.share * 100)}%`
		],
		[
			"adult_tag_missing",
			"adult",
			snapshot.adultTagCoverage.missing,
			""
		],
		[
			"preview_declared",
			"all",
			snapshot.previewCoverage.ready,
			`${Math.round(snapshot.previewCoverage.share * 100)}%`
		],
		[
			"preview_backup",
			"all",
			snapshot.previewCoverage.backed,
			`${Math.round(snapshot.previewCoverage.backedShare * 100)}%`
		],
		[
			"preview_missing",
			"all",
			snapshot.previewCoverage.missing,
			""
		],
		[
			"redgifs_preview_declared",
			"linked-or-primary",
			snapshot.previewCoverage.redgifs.ready,
			`${Math.round(snapshot.previewCoverage.redgifs.share * 100)}%`
		],
		[
			"redgifs_preview_backup",
			"linked-or-primary",
			snapshot.previewCoverage.redgifs.backed,
			`${Math.round(snapshot.previewCoverage.redgifs.backedShare * 100)}%`
		],
		[
			"creator_credited",
			"all",
			snapshot.creatorCoverage.ready,
			`${Math.round(snapshot.creatorCoverage.share * 100)}%`
		],
		[
			"creator_canonical_tag",
			"creator-*",
			snapshot.creatorCoverage.canonicalTagged,
			""
		],
		[
			"creator_ambiguous",
			"provider-label-only",
			snapshot.creatorCoverage.ambiguous,
			""
		],
		[
			"unique_creators",
			"normalized",
			snapshot.creatorCoverage.uniqueCreators,
			""
		],
		[
			"useful_interest_tagged",
			"all",
			snapshot.tagQuality.usefulTagged,
			`${Math.round(snapshot.tagQuality.usefulTagged / Math.max(snapshot.titles, 1) * 100)}%`
		],
		[
			"metadata_tagged",
			"all",
			snapshot.tagQuality.metadataTagged,
			`${Math.round(snapshot.tagQuality.metadataTagged / Math.max(snapshot.titles, 1) * 100)}%`
		],
		[
			"multi_interest_tagged",
			"two-or-more",
			snapshot.tagQuality.multiInterestTagged,
			""
		],
		[
			"no_useful_interest",
			"all",
			snapshot.tagQuality.noUsefulInterest,
			""
		],
		[
			"average_useful_tags",
			"per-title",
			snapshot.tagQuality.averageUsefulTags.toFixed(2),
			""
		],
		[
			"duplicate_candidate_groups",
			"stable-provider-or-media",
			snapshot.dedupe.candidateGroups,
			""
		],
		[
			"duplicate_candidate_titles",
			"affected",
			snapshot.dedupe.affectedTitles,
			`${Math.round(snapshot.dedupe.share * 100)}%`
		],
		[
			"duplicate_extra_titles",
			"after-one-per-group",
			snapshot.dedupe.extraTitles,
			""
		],
		[
			"noisy_tag_assignments",
			"transport-or-parser",
			snapshot.noisyTagAssignments,
			""
		],
		[
			"marked_titles",
			"i-cummed",
			snapshot.markedTitles,
			""
		],
		[
			"total_marks",
			"i-cummed",
			snapshot.totalMarks,
			""
		]
	];
	for (const [key, count] of Object.entries(snapshot.sources)) rows.push([
		"source_link",
		key,
		count,
		""
	]);
	for (const [key, count] of Object.entries(snapshot.primarySources)) rows.push([
		"primary_source",
		key,
		count,
		""
	]);
	for (const row of snapshot.providerMix) {
		rows.push([
			"provider_mix",
			`${row.provider}:${row.status}:${Math.round(row.share * 100)}%`,
			row.titles,
			""
		]);
		rows.push([
			"provider_linked",
			row.provider,
			row.linkedTitles,
			""
		]);
		rows.push([
			"provider_preview",
			row.provider,
			row.previewCoverage.ready,
			`${Math.round(row.previewCoverage.share * 100)}%`
		]);
		rows.push([
			"provider_preview_backup",
			row.provider,
			row.backupPreviewCoverage.ready,
			`${Math.round(row.backupPreviewCoverage.share * 100)}%`
		]);
		rows.push([
			"provider_creator",
			row.provider,
			row.creatorCoverage.ready,
			`${Math.round(row.creatorCoverage.share * 100)}%`
		]);
		rows.push([
			"provider_useful_tag",
			row.provider,
			row.usefulTagCoverage.ready,
			`${Math.round(row.usefulTagCoverage.share * 100)}%`
		]);
		rows.push([
			"provider_duplicate_candidate",
			row.provider,
			row.duplicateCandidates,
			""
		]);
	}
	for (const row of snapshot.dedupe.bySignal) rows.push([
		"duplicate_signal",
		row.signal,
		row.extraTitles,
		`${row.groups} groups / ${row.affectedTitles} titles`
	]);
	for (const row of snapshot.genres) rows.push([
		"genre",
		row.tag,
		row.count,
		row.score.toFixed(2)
	]);
	for (const row of snapshot.topTags) rows.push([
		"tag",
		row.tag,
		row.count,
		row.score.toFixed(2)
	]);
	for (const row of snapshot.metaTags) rows.push([
		"meta_tag",
		row.tag,
		row.count,
		row.score.toFixed(2)
	]);
	for (const row of snapshot.redditTags) rows.push([
		"reddit_tag",
		row.tag,
		row.count,
		row.score.toFixed(2)
	]);
	for (const row of snapshot.tagConnections) rows.push([
		"tag_connection",
		`${row.left} + ${row.right}`,
		row.count,
		`lift ${row.lift.toFixed(2)} / ${row.providerCount} sources`
	]);
	return rows.map((row) => row.map(quote).join(",")).join("\n");
}
function downloadTextFile(body, filename, mime) {
	const url = URL.createObjectURL(new Blob([body], { type: mime }));
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}
function exportAdultStats(snapshot, format) {
	const stamp = new Date(snapshot.at).toISOString().slice(0, 10);
	if (format === "json") {
		downloadTextFile(JSON.stringify(snapshot, null, 2), `reelcase-adult-stats-${stamp}.json`, "application/json");
		return;
	}
	downloadTextFile(adultStatsToCsv(snapshot), `reelcase-adult-stats-${stamp}.csv`, "text/csv;charset=utf-8");
}
var FOLLOW_COLLECTIONS_KEY = "reelcase.follow-collections.v1";
var FOLLOW_COLLECTIONS_CHANGED = "reelcase:follow-collections-change";
function normalizeCreatorCollections(raw) {
	if (!Array.isArray(raw)) return [];
	const byId = /* @__PURE__ */ new Map();
	for (const value of raw.slice(0, 200)) {
		if (!value || typeof value !== "object") continue;
		const row = value;
		if (typeof row.id !== "string" || !row.id.trim() || typeof row.name !== "string" || !row.name.trim() || !Array.isArray(row.followIds)) continue;
		const followIds = [...new Set(row.followIds.filter((id) => typeof id === "string" && Boolean(id.trim())).slice(0, 1e4))];
		if (!followIds.length) continue;
		byId.set(row.id, {
			id: row.id,
			name: row.name.trim().slice(0, 48),
			followIds,
			createdAt: typeof row.createdAt === "number" && Number.isFinite(row.createdAt) ? row.createdAt : 0
		});
	}
	return [...byId.values()];
}
function loadCreatorCollections() {
	if (typeof localStorage === "undefined") return [];
	try {
		return normalizeCreatorCollections(JSON.parse(localStorage.getItem("reelcase.follow-collections.v1") ?? "[]"));
	} catch {
		return [];
	}
}
function saveCreatorCollections(collections) {
	const normalized = normalizeCreatorCollections(collections);
	try {
		localStorage.setItem(FOLLOW_COLLECTIONS_KEY, JSON.stringify(normalized));
		if (typeof window !== "undefined") window.dispatchEvent(new Event(FOLLOW_COLLECTIONS_CHANGED));
	} catch {}
}
/** Merge by stable collection ID so a recovery pack never erases newer local groups. */
function mergeCreatorCollections(current, incoming) {
	const byId = new Map(normalizeCreatorCollections(current).map((row) => [row.id, row]));
	for (const row of normalizeCreatorCollections(incoming)) {
		const prior = byId.get(row.id);
		byId.set(row.id, prior ? {
			...prior,
			followIds: [.../* @__PURE__ */ new Set([...prior.followIds, ...row.followIds])]
		} : row);
	}
	return [...byId.values()];
}
var LIBRARY_PACK_ROOT = "reelcase-library-pack";
function stamp() {
	return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function quoteCsv(value) {
	return `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;
}
function rowsToCsv(rows) {
	return rows.map((row) => row.map(quoteCsv).join(",")).join("\n");
}
function parseCsv(text) {
	const rows = [];
	let row = [];
	let cell = "";
	let inQuotes = false;
	for (let i = 0; i < text.length; i += 1) {
		const ch = text[i];
		if (inQuotes) {
			if (ch === "\"" && text[i + 1] === "\"") {
				cell += "\"";
				i += 1;
			} else if (ch === "\"") inQuotes = false;
			else cell += ch;
			continue;
		}
		if (ch === "\"") {
			inQuotes = true;
			continue;
		}
		if (ch === ",") {
			row.push(cell);
			cell = "";
			continue;
		}
		if (ch === "\n") {
			row.push(cell);
			rows.push(row);
			row = [];
			cell = "";
			continue;
		}
		if (ch === "\r") continue;
		cell += ch;
	}
	if (cell.length || row.length) {
		row.push(cell);
		rows.push(row);
	}
	return rows.filter((r) => r.some((c) => c.trim().length));
}
function normalizeFollowRow(row) {
	const kindRaw = String(row.kind ?? row.service ?? "").toLowerCase();
	const kind = kindRaw === "twitch" || kindRaw === "youtube" ? kindRaw : null;
	const handle = String(row.handle ?? row.channel ?? row.title ?? "").trim().replace(/^@/, "");
	const id = String(row.id ?? "").trim() || (kind && handle ? `${kind === "twitch" ? "tw" : "yt"}:${handle}` : "");
	const title = String(row.title ?? row.channel ?? handle).trim() || handle;
	const cacheRaw = row.cache && typeof row.cache === "object" ? row.cache : null;
	const cache = cacheRaw && typeof cacheRaw.at === "number" && Number.isFinite(cacheRaw.at) && typeof cacheRaw.hits === "number" && Number.isFinite(cacheRaw.hits) && typeof cacheRaw.misses === "number" && Number.isFinite(cacheRaw.misses) && (cacheRaw.scope === "feed" || cacheRaw.scope === "catalog" || cacheRaw.scope === "uncached") ? {
		at: cacheRaw.at,
		hits: Math.max(0, Math.floor(cacheRaw.hits)),
		misses: Math.max(0, Math.floor(cacheRaw.misses)),
		scope: cacheRaw.scope
	} : void 0;
	if (!kind || !handle) return null;
	return {
		id,
		kind,
		handle,
		title,
		...typeof row.channelId === "string" && row.channelId ? { channelId: row.channelId } : {},
		...typeof row.thumb === "string" && row.thumb ? { thumb: row.thumb } : {},
		...typeof row.lastCheckedAt === "number" && Number.isFinite(row.lastCheckedAt) ? { lastCheckedAt: row.lastCheckedAt } : {},
		...typeof row.newestPublishedAt === "number" && Number.isFinite(row.newestPublishedAt) ? { newestPublishedAt: row.newestPublishedAt } : {},
		...typeof row.newestVideoId === "string" && row.newestVideoId ? { newestVideoId: row.newestVideoId } : {},
		...typeof row.lastResponseCount === "number" && Number.isFinite(row.lastResponseCount) ? { lastResponseCount: row.lastResponseCount } : {},
		...cache ? { cache } : {}
	};
}
function dedupeFollows(rows) {
	const seen = /* @__PURE__ */ new Set();
	return rows.filter((row) => {
		const key = `${row.kind}:${row.handle.toLowerCase()}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}
function engagementSummary(input) {
	const feedback = exportFeedback();
	const rated = Object.keys(feedback.ratings).filter((id) => (feedback.ratings[id] ?? 0) > 0).length;
	return {
		at: (/* @__PURE__ */ new Date()).toISOString(),
		follows: input.follows.length,
		youtubeFollows: input.follows.filter((f) => f.kind === "youtube").length,
		twitchFollows: input.follows.filter((f) => f.kind === "twitch").length,
		historyEvents: input.history.length,
		savedLinks: input.links.length,
		favorites: input.favorites.length,
		likes: input.likes.length,
		photoSources: input.photoSources?.length ?? 0,
		photoLikes: input.photoLikes?.length ?? Object.values(input.photoMeta ?? {}).filter((row) => row.favorite).length,
		titlesWithViews: Object.keys(input.viewCounts).length,
		titlesWithCameMarks: Object.keys(input.cameCounts).length,
		totalCameMarks: Object.values(input.cameCounts).reduce((a, b) => a + b, 0),
		resumePointers: Object.keys(input.resumeProgress).length,
		ratedTitles: rated
	};
}
function packReadme() {
	return `# Realhub library pack

Local-only backup / fill-in folder for YouTube & Twitch follows, creator collections, watch history,
saved video links, continue-watching pointers, favorites/likes, Photos sources & likes, Adult marks,
ratings & tag hearts, and Adult stats snapshots.

No cloud. Nothing here uploads. Import **merges** by default so unrelated data
is not wiped.

## Folder layout

\`\`\`
${LIBRARY_PACK_ROOT}/
  README.md
  manifest.json
  follows/
    youtube.json
    twitch.json
    follows.csv
    collections.json
  history/
    history.json
    history.csv
  links/
    links.json
    links.csv
  marks/
    view-counts.json
    came-counts.json
    shelves.json
    ratings.json
    tag-hearts.json
  resume/
    resume.json
  stats/
    adult-stats.json
    adult-stats.csv
    engagement-summary.json
\`\`\`

## How to fill offline

1. Copy \`public/import-templates/\` (or an exported zip) to your PC.
2. Edit the JSON/CSV files in a spreadsheet or text editor.
3. Zip the folder back to \`${LIBRARY_PACK_ROOT}.zip\` (keep the same paths).
4. In Realhub → **Settings** → **Import library pack**, choose the zip (or
   individual files). Confirm only if you want to replace all follows.

### follows/follows.csv
Columns: \`kind,handle,title,channelId,id\`
- \`kind\` must be \`youtube\` or \`twitch\`
- \`handle\` is the channel handle (no @ required)
- \`title\` is optional display name
- \`channelId\` optional provider id

### follows/collections.json
Optional named creator groups. Each entry stores a name and stable follow IDs;
import merges membership without removing local groups.

### history/history.csv
Columns: \`id,at,url,title,position,duration,source,eventId\`
- \`at\` is epoch milliseconds
- \`url\` keeps a recoverable link if the catalog card was pruned

### links/links.csv
Columns: \`id,url,title,kind,savedAt,source\`
- \`source\` is \`history\`, \`bookmark\`, or \`continue\`

### marks/
- \`view-counts.json\` / \`came-counts.json\`: \`{ "video-id": 3 }\`
- \`shelves.json\`: \`{ "favorites": ["id"], "likes": ["id"] }\`
- \`ratings.json\`: \`{ "ratings": { "id": 5 }, "ratingHistory": { ... } }\`
- \`tag-hearts.json\`: \`{ "tagLikes": { "fetish-foo": true }, "tagHeartHistory": { ... } }\`

### resume/resume.json
\`{ "progress": { "id": { "t": 12, "d": 100, "at": 0 } }, "resumeProgress": { "https://...": { "t": 12, "d": 100, "at": 0 } } }\`

### stats/
Adult stats are snapshots for backup/analysis. Importing stats does not rebuild
the live Adult catalog; it is informational unless you also merge marks.

## Photos

- \`photos/sources.json\`: \`{ "sources": [{ "id", "name", "kind": "directory"|"files", "photoCount?", "lastCheckedAt?" }] }\`
- \`photos/likes.json\`: \`{ "likes": ["photo-id"], "meta": { "photo-id": { "favorite", "rating", "tags", "people", "album", "path" } } }\`

Photo media bytes stay on disk; the pack only stores source stubs and like/rating metadata.

## Durable stores (what Import writes)

| Pack file | IndexedDB key (\`activity\`) | localStorage mirror |
|---|---|---|
| follows/youtube+twitch+follows.csv | \`follows\` | \`reelcase.follows.v1\` |
| follows/collections.json | — | \`reelcase.follow-collections.v1\` |
| history/* | \`history\` | \`reelcase.history.v1\` |
| resume/* | \`resume\` | \`reelcase.resume.v1\` |
| marks/view+came | \`marks\` | \`reelcase.marks.v1\` |
| marks/shelves | \`shelves\` | \`reelcase.shelves.v1\` |
| links/* | \`links\` | \`reelcase.links.v1\` |
| marks/ratings+hearts | \`feedback\` | \`reelcase.media-feedback.v1\` |
| photos/* | \`photos\` | \`reelcase.photos.v1\` (+ legacy \`reelcase.photo-meta.v1\`) |

Thumb prune, Adult catalog caps, and prefs QuotaExceeded never clear these keys.
`;
}
function buildLibraryPackFiles(input) {
	const youtube = input.follows.filter((f) => f.kind === "youtube");
	const twitch = input.follows.filter((f) => f.kind === "twitch");
	const feedback = exportFeedback();
	const adultStats = input.adultStats ?? (input.adultVideos && input.folders && input.tags ? buildAdultStatsSnapshot(input.adultVideos, input.folders, input.tags, {
		favorites: Object.fromEntries(input.favorites.map((id) => [id, true])),
		likes: Object.fromEntries(input.likes.map((id) => [id, true])),
		cameCounts: input.cameCounts,
		viewCounts: input.viewCounts,
		ratingOf: (id) => feedback.ratings[id] ?? 0
	}) : void 0);
	const files = {
		[`${LIBRARY_PACK_ROOT}/README.md`]: packReadme(),
		[`${LIBRARY_PACK_ROOT}/manifest.json`]: JSON.stringify({
			version: 1,
			exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
			note: "Realhub local library pack. Metadata only — no media files.",
			counts: engagementSummary(input)
		}, null, 2),
		[`${LIBRARY_PACK_ROOT}/follows/youtube.json`]: JSON.stringify({
			exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
			channels: youtube
		}, null, 2),
		[`${LIBRARY_PACK_ROOT}/follows/twitch.json`]: JSON.stringify({
			exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
			channels: twitch
		}, null, 2),
		[`${LIBRARY_PACK_ROOT}/follows/follows.csv`]: rowsToCsv([[
			"kind",
			"handle",
			"title",
			"channelId",
			"id"
		], ...input.follows.map((f) => [
			f.kind,
			f.handle,
			f.title,
			f.channelId ?? "",
			f.id
		])]),
		[`${LIBRARY_PACK_ROOT}/follows/collections.json`]: JSON.stringify({
			exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
			collections: loadCreatorCollections()
		}, null, 2),
		[`${LIBRARY_PACK_ROOT}/history/history.json`]: JSON.stringify({
			exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
			entries: input.history
		}, null, 2),
		[`${LIBRARY_PACK_ROOT}/history/history.csv`]: rowsToCsv([[
			"id",
			"at",
			"url",
			"title",
			"position",
			"duration",
			"source",
			"eventId"
		], ...input.history.map((h) => [
			h.id,
			h.at,
			h.url ?? "",
			h.title ?? "",
			h.position ?? "",
			h.duration ?? "",
			h.source ?? "",
			h.eventId ?? ""
		])]),
		[`${LIBRARY_PACK_ROOT}/links/links.json`]: JSON.stringify({
			exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
			links: input.links
		}, null, 2),
		[`${LIBRARY_PACK_ROOT}/links/links.csv`]: rowsToCsv([[
			"id",
			"url",
			"title",
			"kind",
			"savedAt",
			"source"
		], ...input.links.map((l) => [
			l.id,
			l.url,
			l.title ?? "",
			l.kind ?? "",
			l.savedAt,
			l.source
		])]),
		[`${LIBRARY_PACK_ROOT}/marks/view-counts.json`]: JSON.stringify(input.viewCounts, null, 2),
		[`${LIBRARY_PACK_ROOT}/marks/came-counts.json`]: JSON.stringify(input.cameCounts, null, 2),
		[`${LIBRARY_PACK_ROOT}/marks/shelves.json`]: JSON.stringify({
			favorites: input.favorites,
			likes: input.likes
		}, null, 2),
		[`${LIBRARY_PACK_ROOT}/marks/ratings.json`]: JSON.stringify({
			ratings: feedback.ratings,
			ratingHistory: feedback.ratingHistory,
			notes: feedback.notes,
			creatorRatings: feedback.creatorRatings,
			creatorLikes: feedback.creatorLikes
		}, null, 2),
		[`${LIBRARY_PACK_ROOT}/marks/tag-hearts.json`]: JSON.stringify({
			tagLikes: feedback.tagLikes,
			tagHeartHistory: feedback.tagHeartHistory
		}, null, 2),
		[`${LIBRARY_PACK_ROOT}/resume/resume.json`]: JSON.stringify({
			progress: input.progress,
			resumeProgress: input.resumeProgress
		}, null, 2),
		[`${LIBRARY_PACK_ROOT}/stats/engagement-summary.json`]: JSON.stringify(engagementSummary(input), null, 2)
	};
	if (adultStats) {
		files[`${LIBRARY_PACK_ROOT}/stats/adult-stats.json`] = JSON.stringify(adultStats, null, 2);
		files[`${LIBRARY_PACK_ROOT}/stats/adult-stats.csv`] = adultStatsToCsv(adultStats);
	}
	return files;
}
function downloadLibraryPackZip(input) {
	const files = buildLibraryPackFiles(input);
	const zipped = zipSync(Object.fromEntries(Object.entries(files).map(([name, body]) => [name, strToU8(body)])), { level: 6 });
	const url = URL.createObjectURL(new Blob([zipped.buffer.slice(zipped.byteOffset, zipped.byteOffset + zipped.byteLength)], { type: "application/zip" }));
	const link = document.createElement("a");
	link.href = url;
	link.download = `${LIBRARY_PACK_ROOT}-${stamp()}.zip`;
	link.click();
	URL.revokeObjectURL(url);
}
function pathKey(name) {
	return name.replace(/\\/g, "/").replace(/^\/+/, "");
}
function fileEndsWith(name, suffix) {
	return pathKey(name).toLowerCase().endsWith(suffix.toLowerCase());
}
function readPackTextFiles(buffer) {
	const unzipped = unzipSync(new Uint8Array(buffer));
	const out = {};
	for (const [name, bytes] of Object.entries(unzipped)) {
		if (name.endsWith("/")) continue;
		out[pathKey(name)] = strFromU8(bytes);
	}
	return out;
}
function collectFollows(files) {
	const rows = [];
	for (const [name, body] of Object.entries(files)) {
		if (fileEndsWith(name, "follows.csv") || /follows\/.*\.csv$/i.test(name)) {
			const table = parseCsv(body);
			const header = table[0]?.map((h) => h.trim().toLowerCase()) ?? [];
			for (const line of table.slice(1)) {
				const rec = {};
				header.forEach((key, i) => {
					rec[key] = line[i];
				});
				const normalized = normalizeFollowRow(rec);
				if (normalized) rows.push(normalized);
			}
		}
		if (/follows\/.*\.json$/i.test(name) || fileEndsWith(name, "youtube.json") || fileEndsWith(name, "twitch.json") || fileEndsWith(name, "channels.json")) try {
			const parsed = JSON.parse(body);
			const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed.channels) ? parsed.channels : [];
			for (const item of list) {
				if (!item || typeof item !== "object") continue;
				const normalized = normalizeFollowRow(item);
				if (normalized) rows.push(normalized);
			}
		} catch {}
	}
	return dedupeFollows(rows);
}
function normalizeHistoryEntry(raw) {
	if (!raw || typeof raw !== "object") return null;
	const row = raw;
	const eventId = typeof row.eventId === "string" ? row.eventId.trim() : "";
	const eventMatch = eventId.match(/^(.*):(\d{10,}):(open|progress|watch-room)$/);
	const id = String(row.id ?? eventMatch?.[1] ?? "").trim();
	const atValue = row.at ?? (typeof row.occurredAt === "string" ? Date.parse(row.occurredAt) : NaN);
	const at = Number(atValue);
	if (!id || !Number.isFinite(at)) return null;
	const source = row.source === "open" || row.source === "progress" || row.source === "watch-room" ? row.source : void 0;
	const position = Number(row.position ?? row.positionSeconds);
	const duration = Number(row.duration ?? row.durationSeconds);
	return {
		id,
		at,
		...typeof row.url === "string" && row.url ? { url: row.url } : {},
		...typeof row.title === "string" && row.title ? { title: row.title } : {},
		...Number.isFinite(position) ? { position } : {},
		...Number.isFinite(duration) ? { duration } : {},
		...source ? { source } : {},
		...eventId ? { eventId } : {}
	};
}
function collectHistory(files) {
	const rows = [];
	for (const [name, body] of Object.entries(files)) {
		if (fileEndsWith(name, "history.json") || /(?:^|\/)reelcase-history-[^/]+\.json$/i.test(pathKey(name))) try {
			const parsed = JSON.parse(body);
			const list = Array.isArray(parsed) ? parsed : parsed.entries ?? [];
			for (const entry of list) {
				const normalized = normalizeHistoryEntry(entry);
				if (normalized) rows.push(normalized);
			}
		} catch {}
		if (fileEndsWith(name, "history.csv")) {
			const table = parseCsv(body);
			const header = table[0]?.map((h) => h.trim().toLowerCase()) ?? [];
			for (const line of table.slice(1)) {
				const rec = {};
				header.forEach((key, i) => {
					rec[key] = line[i] ?? "";
				});
				const id = rec.id?.trim();
				const at = Number(rec.at);
				if (!id || !Number.isFinite(at)) continue;
				const normalized = normalizeHistoryEntry({
					id,
					at,
					url: rec.url,
					title: rec.title,
					position: rec.position,
					duration: rec.duration,
					source: rec.source,
					eventId: rec.eventid
				});
				if (normalized) rows.push(normalized);
			}
		}
	}
	return rows;
}
function collectLinks(files) {
	const rows = [];
	for (const [name, body] of Object.entries(files)) {
		if (fileEndsWith(name, "links.json")) try {
			const parsed = JSON.parse(body);
			const list = Array.isArray(parsed) ? parsed : parsed.links ?? [];
			rows.push(...list);
		} catch {}
		if (fileEndsWith(name, "links.csv")) {
			const table = parseCsv(body);
			const header = table[0]?.map((h) => h.trim().toLowerCase()) ?? [];
			for (const line of table.slice(1)) {
				const rec = {};
				header.forEach((key, i) => {
					rec[key] = line[i] ?? "";
				});
				if (!rec.url || !rec.id) continue;
				const source = rec.source === "bookmark" || rec.source === "continue" ? rec.source : "history";
				rows.push({
					id: rec.id,
					url: rec.url,
					savedAt: Number(rec.savedat) || Date.now(),
					source,
					...rec.title ? { title: rec.title } : {},
					...rec.kind ? { kind: rec.kind } : {}
				});
			}
		}
	}
	return rows;
}
function asCountMap(raw) {
	if (!raw || typeof raw !== "object") return {};
	const out = {};
	for (const [id, value] of Object.entries(raw)) if (typeof value === "number" && Number.isFinite(value) && value > 0) out[id] = Math.floor(value);
	return out;
}
function mergeHistory(a, b) {
	const rows = /* @__PURE__ */ new Map();
	for (const entry of [...a, ...b]) {
		if (!entry?.id || !Number.isFinite(entry.at)) continue;
		const key = entry.eventId ?? `${entry.id}:${entry.at}:${entry.source ?? "open"}`;
		if (!rows.has(key)) rows.set(key, entry);
	}
	return [...rows.values()].sort((left, right) => right.at - left.at);
}
function mergeCounts(a, b) {
	const out = { ...a };
	for (const [id, value] of Object.entries(b)) out[id] = Math.max(out[id] ?? 0, value);
	return out;
}
/** Apply a zip or loose text map into durable stores via the provided hooks. */
function applyLibraryPackFiles(files, hooks, mode = "merge") {
	const warnings = [];
	const filesRead = Object.keys(files);
	const incomingFollows = collectFollows(files);
	const incomingHistory = collectHistory(files);
	const incomingLinks = collectLinks(files);
	let followsAdded = 0;
	if (incomingFollows.length) {
		const current = hooks.getFollows();
		const next = mode === "replace-follows" ? dedupeFollows(incomingFollows) : dedupeFollows([...incomingFollows, ...current]);
		followsAdded = Math.max(0, next.length - current.length);
		hooks.setFollows(next);
		saveFollows(next);
	}
	let collectionsMerged = 0;
	let collectionsRead = false;
	for (const [name, body] of Object.entries(files)) {
		if (!fileEndsWith(name, "follows/collections.json")) continue;
		collectionsRead = true;
		try {
			const parsed = JSON.parse(body);
			if (!Array.isArray(parsed.collections)) throw new Error("invalid collection list");
			const current = loadCreatorCollections();
			const merged = mergeCreatorCollections(current, normalizeCreatorCollections(parsed.collections));
			collectionsMerged = Math.max(0, merged.length - current.length);
			saveCreatorCollections(merged);
		} catch {
			warnings.push(`Could not parse ${name}`);
		}
	}
	let historyMerged = 0;
	if (incomingHistory.length) {
		const merged = mergeHistory(hooks.getHistory(), incomingHistory);
		historyMerged = Math.max(0, merged.length - hooks.getHistory().length);
		hooks.setHistory(merged);
		saveDurableHistory(merged);
	}
	let linksMerged = 0;
	if (incomingLinks.length) {
		const byUrl = /* @__PURE__ */ new Map();
		for (const link of [...hooks.getLinks(), ...incomingLinks]) byUrl.set(link.url.toLowerCase(), link);
		const merged = [...byUrl.values()];
		linksMerged = Math.max(0, merged.length - hooks.getLinks().length);
		hooks.setLinks(merged);
		saveDurableLinks(merged);
	}
	let marksMerged = 0;
	let viewCounts = hooks.getViewCounts();
	let cameCounts = hooks.getCameCounts();
	for (const [name, body] of Object.entries(files)) {
		if (fileEndsWith(name, "view-counts.json")) try {
			viewCounts = mergeCounts(viewCounts, asCountMap(JSON.parse(body)));
			marksMerged += 1;
		} catch {
			warnings.push(`Could not parse ${name}`);
		}
		if (fileEndsWith(name, "came-counts.json")) try {
			cameCounts = mergeCounts(cameCounts, asCountMap(JSON.parse(body)));
			marksMerged += 1;
		} catch {
			warnings.push(`Could not parse ${name}`);
		}
	}
	if (marksMerged) {
		hooks.setMarks(viewCounts, cameCounts);
		saveDurableMarks(viewCounts, cameCounts);
	}
	let shelvesMerged = 0;
	for (const [name, body] of Object.entries(files)) {
		if (!fileEndsWith(name, "shelves.json")) continue;
		try {
			const parsed = JSON.parse(body);
			const favorites = [.../* @__PURE__ */ new Set([...hooks.getFavorites(), ...parsed.favorites ?? []])];
			const likes = [.../* @__PURE__ */ new Set([...hooks.getLikes(), ...parsed.likes ?? []])];
			shelvesMerged = favorites.length + likes.length - hooks.getFavorites().length - hooks.getLikes().length;
			hooks.setShelves(favorites, likes);
			saveDurableShelves(favorites, likes);
		} catch {
			warnings.push(`Could not parse ${name}`);
		}
	}
	let feedbackMerged = false;
	let feedbackPartial = {};
	for (const [name, body] of Object.entries(files)) if (fileEndsWith(name, "ratings.json") || fileEndsWith(name, "tag-hearts.json") || fileEndsWith(name, "feedback.json")) try {
		feedbackPartial = {
			...feedbackPartial,
			...JSON.parse(body)
		};
		feedbackMerged = true;
	} catch {
		warnings.push(`Could not parse ${name}`);
	}
	if (feedbackMerged) importFeedback(feedbackPartial);
	for (const [name, body] of Object.entries(files)) {
		if (!fileEndsWith(name, "resume.json")) continue;
		try {
			const parsed = JSON.parse(body);
			const progress = {
				...hooks.getProgress(),
				...parsed.progress ?? {}
			};
			const resumeProgress = {
				...hooks.getResumeProgress(),
				...parsed.resumeProgress ?? {}
			};
			hooks.setResume(progress, resumeProgress);
			saveDurableResume(progress, resumeProgress);
		} catch {
			warnings.push(`Could not parse ${name}`);
		}
	}
	let photosMerged = 0;
	let incomingPhotoSources = [];
	let incomingPhotoMeta = {};
	let incomingPhotoLikes = [];
	for (const [name, body] of Object.entries(files)) {
		if (fileEndsWith(name, "photos/sources.json") || /photos\/sources\.json$/i.test(name)) try {
			const parsed = JSON.parse(body);
			incomingPhotoSources = [...incomingPhotoSources, ...parsed.sources ?? []];
		} catch {
			warnings.push(`Could not parse ${name}`);
		}
		if (fileEndsWith(name, "photos/likes.json") || /photos\/likes\.json$/i.test(name)) try {
			const parsed = JSON.parse(body);
			incomingPhotoLikes = [...incomingPhotoLikes, ...parsed.likes ?? []];
			incomingPhotoMeta = {
				...incomingPhotoMeta,
				...parsed.meta ?? {}
			};
		} catch {
			warnings.push(`Could not parse ${name}`);
		}
	}
	if (incomingPhotoSources.length || Object.keys(incomingPhotoMeta).length || incomingPhotoLikes.length) {
		const current = loadDurablePhotosSync();
		const byId = new Map([...current?.sources ?? [], ...incomingPhotoSources].map((row) => [row.id, row]));
		const meta = {
			...current?.meta ?? {},
			...incomingPhotoMeta
		};
		for (const id of incomingPhotoLikes) meta[id] = {
			...meta[id] ?? {},
			favorite: true
		};
		const likes = [.../* @__PURE__ */ new Set([
			...current?.likes ?? [],
			...incomingPhotoLikes,
			...Object.entries(meta).filter(([, row]) => row.favorite).map(([id]) => id)
		])];
		const sources = [...byId.values()];
		saveDurablePhotos({
			sources,
			meta,
			likes
		});
		hooks.setPhotoSources?.(sources);
		photosMerged = sources.length + likes.length;
	}
	if (!incomingFollows.length && !incomingHistory.length && !incomingLinks.length && !marksMerged && !shelvesMerged && !feedbackMerged && !photosMerged && !collectionsRead) warnings.push("No recognized pack files were found. Expect follows/, history/, links/, marks/, resume/, or photos/ paths.");
	return {
		followsAdded,
		historyMerged,
		linksMerged,
		marksMerged,
		shelvesMerged,
		feedbackMerged,
		photosMerged,
		collectionsMerged,
		filesRead,
		warnings
	};
}
async function importLibraryPackZip(file, hooks, mode = "merge") {
	const buffer = await file.arrayBuffer();
	if (file.name.toLowerCase().endsWith(".zip") || file.type.includes("zip")) return applyLibraryPackFiles(readPackTextFiles(buffer), hooks, mode);
	const text = strFromU8(new Uint8Array(buffer));
	return applyLibraryPackFiles({ [file.name || "import.json"]: text }, hooks, mode);
}
var startedAt = typeof performance === "undefined" ? Date.now() : performance.now();
var trace = { startedAt };
/** Records the first mounted shelf only. It is local diagnostics, not analytics. */
function markFirstShelf(title, cards) {
	if (trace.firstShelfAt) return;
	const now = typeof performance === "undefined" ? Date.now() : performance.now();
	trace = {
		startedAt,
		firstShelfAt: now,
		elapsedMs: Math.round(now - startedAt),
		title,
		cards
	};
}
function getFirstShelfTrace() {
	return trace;
}
var DEVICE_ID_KEY = "reelcase.network-device.v1";
function newDeviceId() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (letter) => {
		const value = Math.floor(Math.random() * 16);
		return (letter === "x" ? value : value & 3 | 8).toString(16);
	});
}
function getDeviceId() {
	try {
		const saved = localStorage.getItem(DEVICE_ID_KEY);
		if (saved && /^[a-z0-9-]{8,64}$/i.test(saved)) return saved;
		const next = newDeviceId();
		localStorage.setItem(DEVICE_ID_KEY, next);
		return next;
	} catch {
		return newDeviceId();
	}
}
function deviceDetails() {
	const mobile = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
	const browser = /edg\//i.test(navigator.userAgent) ? "Edge" : /firefox\//i.test(navigator.userAgent) ? "Firefox" : /chrome\//i.test(navigator.userAgent) ? "Chrome" : "Browser";
	return {
		label: `${mobile ? "Mobile" : "Desktop"} · ${browser}`,
		kind: mobile ? "mobile" : "desktop"
	};
}
function getNetworkDeviceId() {
	return getDeviceId();
}
async function announceNetworkPresence() {
	const details = deviceDetails();
	const response = await fetch("/api/network-presence", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			id: getDeviceId(),
			...details
		}),
		keepalive: true
	});
	if (!response.ok) throw new Error("Network presence could not be updated");
	return response.json();
}
async function listNetworkDevices() {
	const response = await fetch("/api/network-presence", { cache: "no-store" });
	if (!response.ok) throw new Error("Network devices could not be read");
	return response.json();
}
function DropdownMenu(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root2, { ...props });
}
function DropdownMenuTrigger(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, { ...props });
}
function DropdownMenuContent({ className, sideOffset = 6, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		sideOffset,
		className: cn("z-50 min-w-40 overflow-hidden rounded-lg bg-elevated p-1 text-fg shadow-border shadow-lift", className),
		...props
	}) });
}
function DropdownMenuItem({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
		className: cn("flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none", "focus:bg-surface focus:text-fg data-[disabled]:pointer-events-none data-[disabled]:opacity-40", className),
		...props
	});
}
function Sheet(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, { ...props });
}
function SheetContent({ className, children, side = "left", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-bg/70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: cn("fixed z-50 flex h-full w-72 flex-col bg-surface p-4 shadow-lift outline-none", side === "left" ? "inset-y-0 left-0" : "inset-y-0 right-0", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-3 right-3 rounded-sm p-2 text-muted transition-colors duration-150 hover:bg-elevated hover:text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function SheetTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
		className: cn("font-display text-xl text-fg", className),
		...props
	});
}
function clamp(value, min, max) {
	return Math.max(min, Math.min(value, max));
}
/** Calculate the only contiguous card window that needs to be mounted. */
function railWindow(length, width, stride, requestedStart, overscan = 1) {
	const visibleSlots = Math.max(3, Math.ceil(Math.max(320, width) / stride) + overscan * 2);
	const start = clamp(requestedStart, 0, Math.max(0, length - visibleSlots));
	return {
		start,
		end: Math.min(length, start + visibleSlots),
		visibleSlots
	};
}
/** Pick a valid card target for the rail's explicit keyboard controls. */
function railKeyboardTarget(key, current, length) {
	if (!length || current < 0 || current >= length) return null;
	if (key === "ArrowLeft") return current > 0 ? current - 1 : null;
	if (key === "ArrowRight") return current < length - 1 ? current + 1 : null;
	if (key === "Home") return current === 0 ? null : 0;
	if (key === "End") return current === length - 1 ? null : length - 1;
	return null;
}
/** Center a requested card where possible, retaining a small overscan buffer. */
function railWindowStartForTarget(target, length, visibleSlots, overscan = 1) {
	const maxStart = Math.max(0, length - visibleSlots);
	return clamp(target - Math.max(overscan, Math.floor(visibleSlots / 2)), 0, maxStart);
}
/** Expand the logical rail only as far as a requested keyboard target needs. */
function railLimitForTarget(limit, target, length, pageSize = 16) {
	if (target < limit) return limit;
	return Math.min(length, Math.max(limit + pageSize, target + 1));
}
var RAIL_SIZES = [
	8,
	16,
	32,
	48
];
var GRID_SIZES = [
	24,
	48,
	96,
	144
];
function savedRenderBudget(key, allowed, fallback) {
	if (typeof window === "undefined") return fallback;
	const value = Number(localStorage.getItem(key) ?? fallback);
	return allowed.includes(value) ? value : fallback;
}
function Billboard({ video }) {
	const thumb = useThumbs((s) => s.byId[video.id]);
	const request = useThumbs((s) => s.request);
	const openVideo = useLibrary((s) => s.openVideo);
	const toggleFavorite = useLibrary((s) => s.toggleFavorite);
	const fav = useLibrary((s) => Boolean(s.favorites[video.id]));
	const [artIndex, setArtIndex] = (0, import_react.useState)(0);
	const artwork = [
		thumb,
		video.poster,
		video.remote?.previewUrl,
		...adultThumbCandidatesForVideo(video)
	].filter((url, index, all) => Boolean(url) && all.indexOf(url) === index);
	const art = artwork[artIndex];
	(0, import_react.useEffect)(() => {
		request(video);
	}, [request, video]);
	(0, import_react.useEffect)(() => setArtIndex(0), [video.id]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "relative mb-8 overflow-hidden rounded-xl bg-elevated shadow-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-video max-h-[min(72vh,560px)] w-full min-h-64",
			children: [
				art ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: art,
					alt: "",
					decoding: "async",
					referrerPolicy: "no-referrer",
					onError: () => setArtIndex((index) => Math.min(index + 1, artwork.length)),
					className: "absolute inset-0 size-full object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-elevated" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-linear-to-t from-bg via-bg/40 to-bg/10" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-linear-to-r from-bg/80 via-bg/30 to-transparent" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-x-0 bottom-0 flex flex-col gap-3 px-5 py-5 sm:max-w-xl sm:px-8 sm:py-8",
					children: [
						video.genre || video.year ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs font-medium tracking-wide text-accent uppercase",
							children: [video.genre ?? "Featured", video.year ? ` · ${video.year}` : ""]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-wide text-accent uppercase",
							children: "Featured"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-4xl leading-none tracking-tight text-fg sm:text-5xl",
							children: titleOf(video)
						}),
						video.tagline && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "max-w-md text-sm text-muted sm:text-base",
							children: video.tagline
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => openVideo(video.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 fill-current" }), "Play"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								onClick: () => toggleFavorite(video.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-4", fav && "fill-accent text-accent") }), fav ? "In My List" : "My List"]
							})]
						})
					]
				})
			]
		})
	});
}
function TitleRail({ title, videos, variant = "poster", playedAt, onTitleClick, reason, priority = false }) {
	const shelfRef = (0, import_react.useRef)(null);
	const railRef = (0, import_react.useRef)(null);
	const scrollLeft = (0, import_react.useRef)(0);
	const pendingFocus = (0, import_react.useRef)(void 0);
	const attachRail = (0, import_react.useCallback)((rail) => {
		railRef.current = rail;
		if (rail) rail.scrollLeft = scrollLeft.current;
	}, []);
	const leaveTimer = (0, import_react.useRef)(void 0);
	const [nearViewport, setNearViewport] = (0, import_react.useState)(priority);
	const [collapsed, setCollapsed] = (0, import_react.useState)(false);
	const [shelfHeight, setShelfHeight] = (0, import_react.useState)();
	const [railWidth, setRailWidth] = (0, import_react.useState)(0);
	const [windowStart, setWindowStart] = (0, import_react.useState)(0);
	const [focusRequest, setFocusRequest] = (0, import_react.useState)(0);
	const cardStride = variant === "poster" ? 148 : 236;
	const overscan = 1;
	(0, import_react.useEffect)(() => {
		const shelf = shelfRef.current;
		if (!shelf || !videos.length) return;
		if (priority) {
			setNearViewport(true);
			return;
		}
		if (typeof IntersectionObserver === "undefined") {
			setNearViewport(true);
			return;
		}
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting || shelf.contains(document.activeElement)) {
				if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
				leaveTimer.current = void 0;
				setNearViewport(true);
				return;
			}
			if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
			leaveTimer.current = window.setTimeout(() => setNearViewport(false), 900);
		}, { rootMargin: "240px 0px" });
		observer.observe(shelf);
		return () => {
			observer.disconnect();
			if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
		};
	}, [priority, Boolean(videos.length)]);
	(0, import_react.useEffect)(() => {
		const shelf = shelfRef.current;
		if (!shelf || !nearViewport) return;
		const observer = new ResizeObserver(() => setShelfHeight(shelf.getBoundingClientRect().height));
		observer.observe(shelf);
		return () => observer.disconnect();
	}, [nearViewport]);
	(0, import_react.useEffect)(() => {
		const rail = railRef.current;
		if (!rail || !nearViewport) return;
		const sync = () => setRailWidth(Math.max(320, Math.round(rail.clientWidth)));
		sync();
		const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(sync) : void 0;
		observer?.observe(rail);
		return () => observer?.disconnect();
	}, [nearViewport, variant]);
	const [limit, setLimit] = (0, import_react.useState)(() => savedRenderBudget("reelcase.home-rail-limit", RAIL_SIZES, 8));
	(0, import_react.useEffect)(() => {
		const sync = () => setLimit(savedRenderBudget("reelcase.home-rail-limit", RAIL_SIZES, 8));
		window.addEventListener("reelcase:render-settings", sync);
		return () => window.removeEventListener("reelcase:render-settings", sync);
	}, []);
	(0, import_react.useEffect)(() => {
		const target = pendingFocus.current;
		const rail = railRef.current;
		if (target === void 0 || !rail || !nearViewport) return;
		const trigger = rail.querySelector(`[data-rail-index="${target}"] [data-video-card-open]`);
		if (!trigger) return;
		pendingFocus.current = void 0;
		const centeredLeft = Math.max(0, target * cardStride - Math.max(0, (rail.clientWidth - cardStride) / 2));
		scrollLeft.current = centeredLeft;
		rail.scrollLeft = centeredLeft;
		trigger.focus({ preventScroll: true });
	}, [
		cardStride,
		focusRequest,
		limit,
		nearViewport,
		railWidth,
		windowStart
	]);
	(0, import_react.useEffect)(() => {
		if (nearViewport && videos.length) markFirstShelf(title, Math.min(videos.length, limit));
	}, [
		nearViewport,
		limit,
		title,
		videos.length
	]);
	(0, import_react.useEffect)(() => {
		if (!priority || title !== "Latest uploads" || !nearViewport || !videos.length) return;
		const rail = railRef.current;
		const mountedCards = rail?.querySelectorAll("[data-rail-index]").length ?? 0;
		if (!rail || !mountedCards) return;
		markYoutubeRailReady(mountedCards);
		if (getYoutubeFirstClickTrace()?.artwork !== "pending" || getYoutubeFirstClickTrace()?.railReadyMs === void 0) return;
		let finished = false;
		const seen = /* @__PURE__ */ new WeakSet();
		const finish = (loaded) => {
			if (finished) return;
			finished = true;
			markYoutubeArtworkReady(loaded);
			observer.disconnect();
			window.clearTimeout(timeout);
		};
		const watchImages = () => {
			for (const image of rail.querySelectorAll("img")) {
				if (image.complete && image.naturalWidth > 0) {
					finish(true);
					return;
				}
				if (seen.has(image)) continue;
				seen.add(image);
				image.addEventListener("load", () => finish(true), { once: true });
			}
		};
		const observer = new MutationObserver(watchImages);
		const timeout = window.setTimeout(() => finish(false), 5e3);
		observer.observe(rail, {
			childList: true,
			subtree: true
		});
		watchImages();
		return () => {
			observer.disconnect();
			window.clearTimeout(timeout);
		};
	}, [
		priority,
		title,
		nearViewport,
		Boolean(videos.length),
		limit
	]);
	if (!videos.length) return null;
	const shown = videos.slice(0, limit);
	const { start, end, visibleSlots } = railWindow(shown.length, railWidth || 320, cardStride, windowStart, overscan);
	const windowed = shown.slice(start, end);
	const leadPx = start * cardStride;
	const trailPx = Math.max(0, shown.length - end) * cardStride;
	const endCaps = Math.max(0, Math.min(6, Math.min(limit, 8) - shown.length));
	const onRailScroll = (rail) => {
		scrollLeft.current = rail.scrollLeft;
		const nextStart = Math.max(0, Math.floor(rail.scrollLeft / cardStride) - overscan);
		setWindowStart((current) => current === nextStart ? current : nextStart);
		if (rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 160) setLimit((value) => Math.min(videos.length, value + 16));
	};
	const focusRailIndex = (target) => {
		if (target < 0 || target >= videos.length) return;
		pendingFocus.current = target;
		setFocusRequest((value) => value + 1);
		setLimit((value) => railLimitForTarget(value, target, videos.length));
		setWindowStart(railWindowStartForTarget(target, Math.max(shown.length, target + 1), visibleSlots, overscan));
	};
	const onRailKeyDown = (event) => {
		if (event.altKey || event.ctrlKey || event.metaKey) return;
		if (![
			"ArrowLeft",
			"ArrowRight",
			"Home",
			"End"
		].includes(event.key)) return;
		const card = (event.target instanceof Element ? event.target.closest("[data-video-card-open]") : null)?.closest("[data-rail-index]");
		const index = Number(card?.dataset.railIndex);
		if (!Number.isInteger(index)) return;
		event.preventDefault();
		const target = railKeyboardTarget(event.key, index, videos.length);
		if (target !== null) focusRailIndex(target);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		ref: shelfRef,
		className: "media-shelf mb-8 min-w-0",
		style: !nearViewport ? { minHeight: shelfHeight ?? (variant === "poster" ? 320 : 250) } : void 0,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1 basis-48",
				children: [onTitleClick ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onTitleClick,
					className: "block min-w-0 truncate font-display text-xl text-fg hover:text-accent sm:text-2xl",
					children: [
						title,
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-muted",
							children: "Open source →"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "min-w-0 truncate font-display text-xl text-fg sm:text-2xl",
					children: title
				}), reason && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 truncate text-xs text-muted",
					children: reason
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center gap-1",
				children: [videos.length > limit && !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "ghost",
					className: "text-xs",
					onClick: () => setLimit((value) => Math.min(videos.length, value + 16)),
					children: ["Show 16 more · ", videos.length - limit]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "ghost",
					"aria-expanded": !collapsed,
					"aria-label": `${collapsed ? "Expand" : "Minimize"} ${title}`,
					onClick: () => setCollapsed((value) => !value),
					children: [collapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4" }), collapsed ? "Expand" : "Minimize"]
				})]
			})]
		}), nearViewport && !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: attachRail,
			onScroll: (event) => onRailScroll(event.currentTarget),
			onKeyDown: onRailKeyDown,
			className: "rail-scroll flex gap-3 overflow-x-auto pb-3 sm:gap-4",
			children: [
				leadPx > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"aria-hidden": "true",
					className: "shrink-0",
					style: {
						width: leadPx,
						height: 1
					}
				}),
				start > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "sr-only focus:not-sr-only focus:rounded-sm focus:bg-elevated focus:px-3 focus:py-2 focus:text-sm focus:text-fg",
					onFocus: () => focusRailIndex(start - 1),
					children: [
						"Previous ",
						title,
						" title"
					]
				}),
				windowed.map((video, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"data-rail-index": start + i,
					className: cn(variant === "poster" && "w-32 shrink-0 sm:w-36 md:w-40", variant === "rail" && "shrink-0"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, {
						video,
						variant,
						index: start + i,
						playedAt: playedAt?.[video.id]
					})
				}, video.id)),
				end < videos.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "sr-only focus:not-sr-only focus:rounded-sm focus:bg-elevated focus:px-3 focus:py-2 focus:text-sm focus:text-fg",
					onFocus: () => focusRailIndex(end),
					children: [
						"Next ",
						title,
						" title"
					]
				}),
				trailPx > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"aria-hidden": "true",
					className: "shrink-0",
					style: {
						width: trailPx,
						height: 1
					}
				}),
				Array.from({ length: endCaps }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"aria-hidden": "true",
					className: cn("shrink-0 rounded-md border border-border/50 bg-elevated/35", variant === "poster" ? "aspect-poster w-32 sm:w-36 md:w-40" : "h-36 w-56")
				}, `end-cap-${index}`))
			]
		})]
	});
}
function PosterRow({ videos, start, estimate }) {
	const ref = (0, import_react.useRef)(null);
	const intersecting = (0, import_react.useRef)(false);
	const [visible, setVisible] = (0, import_react.useState)(false);
	const [height, setHeight] = (0, import_react.useState)(estimate);
	(0, import_react.useEffect)(() => setHeight(estimate), [estimate]);
	(0, import_react.useEffect)(() => {
		const row = ref.current;
		if (!row) return;
		if (typeof IntersectionObserver === "undefined") {
			setVisible(true);
			return;
		}
		const observer = new IntersectionObserver(([entry]) => {
			intersecting.current = entry.isIntersecting;
			setVisible(entry.isIntersecting || row.contains(document.activeElement));
		}, { rootMargin: "180px 0px" });
		observer.observe(row);
		return () => observer.disconnect();
	}, []);
	(0, import_react.useEffect)(() => {
		const row = ref.current;
		if (!row || !visible) return;
		const observer = new ResizeObserver(() => setHeight(Math.ceil(row.getBoundingClientRect().height)));
		observer.observe(row);
		return () => observer.disconnect();
	}, [visible]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		"data-poster-row": true,
		role: "group",
		"aria-label": `Titles ${start + 1}–${start + videos.length}`,
		tabIndex: visible ? -1 : 0,
		onFocus: () => setVisible(true),
		onBlur: (event) => {
			if (!intersecting.current && !event.currentTarget.contains(event.relatedTarget)) setVisible(false);
		},
		className: "col-span-full grid grid-cols-subgrid gap-3 sm:gap-4",
		style: !visible ? { height } : void 0,
		children: visible && videos.map((video, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, {
			video,
			variant: "poster",
			index: start + i,
			className: "w-full"
		}, video.id))
	});
}
function PosterGrid({ videos }) {
	const gridRef = (0, import_react.useRef)(null);
	const layoutRef = (0, import_react.useRef)(null);
	const [layout, setLayout] = (0, import_react.useState)({
		columns: 3,
		estimate: 260
	});
	const leaveTimer = (0, import_react.useRef)(void 0);
	const [nearViewport, setNearViewport] = (0, import_react.useState)(false);
	const [gridHeight, setGridHeight] = (0, import_react.useState)();
	const [pageSize, setPageSize] = (0, import_react.useState)(() => savedRenderBudget("reelcase.grid-page-size", GRID_SIZES, 24));
	(0, import_react.useEffect)(() => {
		const sync = () => setPageSize(savedRenderBudget("reelcase.grid-page-size", GRID_SIZES, 24));
		window.addEventListener("reelcase:render-settings", sync);
		return () => window.removeEventListener("reelcase:render-settings", sync);
	}, []);
	const safePageSize = pageSize;
	const [limit, setLimit] = (0, import_react.useState)(safePageSize);
	(0, import_react.useEffect)(() => setLimit(safePageSize), [safePageSize]);
	(0, import_react.useEffect)(() => {
		const grid = gridRef.current;
		if (!grid || !videos.length) return;
		if (typeof IntersectionObserver === "undefined") {
			setNearViewport(true);
			return;
		}
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting || grid.contains(document.activeElement)) {
				if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
				leaveTimer.current = void 0;
				setNearViewport((current) => current ? current : true);
				return;
			}
			if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
			leaveTimer.current = window.setTimeout(() => setNearViewport(false), 900);
		}, { rootMargin: "320px 0px" });
		observer.observe(grid);
		return () => {
			observer.disconnect();
			if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
		};
	}, [videos.length]);
	(0, import_react.useEffect)(() => {
		const grid = gridRef.current;
		if (!grid || !nearViewport || typeof ResizeObserver === "undefined") return;
		const observer = new ResizeObserver(() => {
			const next = Math.round(grid.getBoundingClientRect().height);
			setGridHeight((current) => current === next ? current : next);
		});
		observer.observe(grid);
		return () => observer.disconnect();
	}, [nearViewport]);
	(0, import_react.useEffect)(() => {
		const grid = layoutRef.current;
		if (!grid) return;
		const sync = () => {
			const style = getComputedStyle(grid);
			const columns = style.gridTemplateColumns.split(" ").length;
			const gap = parseFloat(style.columnGap) || 12;
			const estimate = Math.ceil((grid.clientWidth - gap * (columns - 1)) / columns * (9 / 16) + 80);
			setLayout((old) => old.columns === columns && old.estimate === estimate ? old : {
				columns,
				estimate
			});
		};
		sync();
		const observer = new ResizeObserver(sync);
		observer.observe(grid);
		return () => observer.disconnect();
	}, [nearViewport]);
	if (!videos.length) return null;
	const visible = videos.slice(0, limit);
	const rows = Array.from({ length: Math.ceil(visible.length / layout.columns) }, (_, row) => row * layout.columns);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		ref: gridRef,
		className: "media-shelf",
		style: !nearViewport ? { minHeight: gridHeight ?? 900 } : void 0,
		children: nearViewport && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: layoutRef,
			className: "grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7",
			children: rows.map((start) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosterRow, {
				start,
				videos: visible.slice(start, start + layout.columns),
				estimate: layout.estimate
			}, `${layout.columns}:${start}`))
		}), videos.length > limit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [
					"Page ",
					Math.ceil(limit / safePageSize),
					" · showing ",
					limit.toLocaleString(),
					" of ",
					videos.length.toLocaleString(),
					" titles"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "secondary",
				onClick: () => setLimit((value) => Math.min(value + safePageSize, videos.length)),
				children: ["Next page · ", safePageSize]
			})]
		})] })
	});
}
var LIVE_SOURCES = [
	{
		id: "twitch",
		label: "Twitch"
	},
	{
		id: "youtube",
		label: "YouTube"
	},
	{
		id: "chaturbate",
		label: "Chaturbate"
	},
	{
		id: "myfreecams",
		label: "MyFreeCams"
	}
];
/** Compare against the current clock at ingestion/render, not the last timer tick. */
function hasFreshTwitchLiveState(video, now, maxAge) {
	if (video.remote?.kind !== "twitch" || !video.remote.live) return true;
	const observedAt = video.remote.observedAt ?? 0;
	return observedAt > 0 && observedAt <= now + 5e3 && now - observedAt <= maxAge;
}
function hasFreshRemoteLiveState(video, now, twitchMaxAge, youtubeMaxAge) {
	if (!video.remote?.live) return true;
	if (video.remote.kind === "twitch") return hasFreshTwitchLiveState(video, now, twitchMaxAge);
	if (video.remote.kind !== "youtube") return true;
	const observedAt = video.remote.observedAt ?? 0;
	return observedAt > 0 && observedAt <= now + 5e3 && now - observedAt <= youtubeMaxAge;
}
function liveDeskRows(videos, adultVideos) {
	const unique = /* @__PURE__ */ new Map();
	for (const video of [...videos, ...adultVideos]) if (video.remote?.live && LIVE_SOURCES.some((source) => source.id === video.remote?.kind)) unique.set(video.id, video);
	return [...unique.values()];
}
function filterLiveRows(videos, options) {
	const needle = options.search.trim().toLowerCase();
	return videos.filter((video) => (options.source === "all" || video.remote?.kind === options.source) && (options.filter === "all" || Boolean((options.filter === "favorites" ? options.favorites : options.likes)[video.id])) && `${video.name} ${video.remote?.channelName ?? ""}`.toLowerCase().includes(needle)).sort((a, b) => {
		const name = (a.remote?.channelName || a.name).localeCompare(b.remote?.channelName || b.name);
		if (options.sort === "name") return name;
		return (options.sort === "favorites" ? Number(Boolean(options.favorites[b.id])) - Number(Boolean(options.favorites[a.id])) : 0) || (b.remote?.viewers ?? 0) - (a.remote?.viewers ?? 0) || name;
	});
}
function LiveDesk({ videos, adultLiveVideos = [], staleTwitchCount = 0, staleYoutubeCount = 0 }) {
	const favorites = useLibrary((s) => s.favorites);
	const likes = useLibrary((s) => s.likes);
	const follows = useLibrary((s) => s.follows);
	const refreshing = useLibrary((s) => s.refreshing || s.remoteBusy);
	const refresh = useLibrary((s) => s.refreshFollows);
	const follow = useLibrary((s) => s.followRemoteQuery);
	const [adding, setAdding] = (0, import_react.useState)("");
	const setSource = useLibrary((s) => s.setSource);
	const status = useLibrary((s) => s.remoteRefreshStatus);
	const [source, setSourceFilter] = (0, import_react.useState)("all");
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)("favorites");
	const [search, setSearch] = (0, import_react.useState)("");
	const [columns, setColumns] = (0, import_react.useState)(4);
	const [limits, setLimits] = (0, import_react.useState)({});
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		try {
			const saved = JSON.parse(localStorage.getItem("reelcase.live-desk") ?? "{}");
			if (["all", ...LIVE_SOURCES.map((s) => s.id)].includes(saved.source)) setSourceFilter(saved.source);
			if ([
				"all",
				"favorites",
				"likes"
			].includes(saved.filter)) setFilter(saved.filter);
			if ([
				"favorites",
				"viewers",
				"name"
			].includes(saved.sort)) setSort(saved.sort);
			const count = Number(localStorage.getItem("reelcase.live-columns"));
			if ([
				3,
				4,
				6
			].includes(count)) setColumns(count);
		} catch {}
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		try {
			localStorage.setItem("reelcase.live-desk", JSON.stringify({
				source,
				filter,
				sort
			}));
			localStorage.setItem("reelcase.live-columns", String(columns));
		} catch {}
	}, [
		ready,
		source,
		filter,
		sort,
		columns
	]);
	(0, import_react.useEffect)(() => setLimits({}), [
		source,
		filter,
		search,
		sort
	]);
	const rows = (0, import_react.useMemo)(() => liveDeskRows(videos, adultLiveVideos), [videos, adultLiveVideos]);
	const counts = (0, import_react.useMemo)(() => Object.fromEntries(LIVE_SOURCES.map((s) => [s.id, rows.filter((v) => v.remote?.kind === s.id).length])), [rows]);
	const visible = (0, import_react.useMemo)(() => filterLiveRows(rows, {
		source,
		filter,
		sort,
		search,
		favorites,
		likes
	}), [
		rows,
		source,
		filter,
		sort,
		search,
		favorites,
		likes
	]);
	const twitchFollows = follows.filter((f) => f.kind === "twitch");
	const youtubeFollows = follows.filter((f) => f.kind === "youtube" && !f.id.startsWith("ytpl:"));
	const youtubeFailures = youtubeFollows.filter((f) => f.lastProviderFailure);
	const lastYoutubeLiveCheck = Math.max(0, ...youtubeFollows.map((f) => f.liveCheckedAt ?? 0));
	const twitchFailures = twitchFollows.filter((f) => f.lastProviderFailure);
	const sources = LIVE_SOURCES.filter((s) => source === "all" || source === s.id);
	const grid = columns === 3 ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" : columns === 6 ? "grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6" : "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4";
	const reset = () => {
		setSourceFilter("all");
		setFilter("all");
		setSearch("");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Live streams",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-6 rounded-xl border border-border bg-surface p-5 sm:p-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-4" }), "On air"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap items-end justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-3xl text-fg sm:text-4xl",
							children: "Live, by source."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-muted",
							children: [rows.length.toLocaleString(), " live streams in your library. Twitch and YouTube come first; Adult rooms have their own sections."]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							disabled: refreshing,
							onClick: () => void (source === "youtube" ? refresh("youtube", { youtubeLiveOnly: true }) : refresh(source === "twitch" ? "twitch" : void 0)),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: refreshing ? "size-4 animate-spin" : "size-4" }), refreshing ? "Checking channels…" : source === "twitch" ? "Refresh Twitch" : source === "youtube" ? "Check YouTube live" : "Refresh Twitch & YouTube"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 flex flex-wrap gap-2",
						role: "group",
						"aria-label": "Filter live by source",
						children: [{
							id: "all",
							label: "All sources"
						}, ...LIVE_SOURCES].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "min-h-11",
							variant: source === s.id ? "default" : "secondary",
							"aria-pressed": source === s.id,
							onClick: () => setSourceFilter(s.id),
							children: [
								s.label,
								" · ",
								s.id === "all" ? rows.length : counts[s.id]
							]
						}, s.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						role: "group",
						"aria-label": "Filter live by saved status",
						children: [
							["all", "All streams"],
							["favorites", "Favorites"],
							["likes", "Liked"]
						].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "min-h-11",
							variant: filter === id ? "default" : "ghost",
							"aria-pressed": filter === id,
							onClick: () => setFilter(id),
							children: label
						}, id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "min-w-0 basis-full sm:flex-1 sm:basis-auto",
								value: search,
								onChange: (e) => setSearch(e.target.value),
								placeholder: "Find a stream or creator",
								"aria-label": "Search live streams"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								"aria-label": "Sort live streams",
								className: "min-h-11 max-w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg",
								value: sort,
								onChange: (e) => setSort(e.target.value),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "favorites",
										children: "Favorites first"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "viewers",
										children: "Most viewers"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "name",
										children: "Channel A–Z"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								"aria-label": "Live card size",
								className: "min-h-11 max-w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg",
								value: columns,
								onChange: (e) => setColumns(Number(e.target.value)),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: 3,
										children: "Large cards"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: 4,
										children: "Comfortable"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: 6,
										children: "Compact"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						role: "status",
						className: "mt-4 text-sm text-muted",
						children: [
							visible.length.toLocaleString(),
							" matching streams",
							status ? ` · Last channel batch: ${status.refreshed}/${status.checked} checked successfully${status.failed ? `, ${status.failed} unavailable` : ""}` : ""
						]
					})
				]
			}),
			(source === "all" || source === "twitch") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "mb-6 rounded-lg border border-border bg-elevated p-4",
				"aria-label": "Twitch live status",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium text-fg",
						children: [
							"Twitch · ",
							counts.twitch,
							" live · ",
							twitchFollows.length,
							" followed"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: !twitchFollows.length ? "No Twitch channels are saved in this library. Add channels from the Twitch desk to see them here." : staleTwitchCount ? `${staleTwitchCount} cached stream${staleTwitchCount === 1 ? " needs" : "s need"} a fresh check. Older observations are held out of the live grid.` : counts.twitch ? "Showing recently confirmed streams from your followed channels." : "No followed Twitch channel is currently confirmed live. Refresh to check the next batch."
					}),
					twitchFailures.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [
							twitchFailures.length,
							" channel check",
							twitchFailures.length === 1 ? "" : "s",
							" failed. ",
							twitchFailures[0].lastProviderFailure?.recovery
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							disabled: refreshing || !twitchFollows.length,
							onClick: () => void refresh("twitch"),
							children: "Check Twitch channels"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => setSource("twitch"),
							children: "Manage Twitch channels"
						})]
					})
				]
			}),
			(source === "all" || source === "youtube") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "mb-6 rounded-lg border border-border bg-elevated p-4",
				"aria-label": "YouTube live status",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium text-fg",
						children: [
							"YouTube · ",
							counts.youtube,
							" live · ",
							youtubeFollows.length,
							" followed"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [!youtubeFollows.length ? "Follow YouTube creators to check their current broadcasts here." : staleYoutubeCount ? `${staleYoutubeCount} saved stream${staleYoutubeCount === 1 ? " needs" : "s need"} a fresh check. YouTube creators rotate through live checks every minute.` : counts.youtube ? "Showing recently confirmed broadcasts. Creator checks rotate every minute." : "No followed creator is currently confirmed live. YouTube checks continue in rotating batches every minute.", lastYoutubeLiveCheck ? ` Last creator check ${new Date(lastYoutubeLiveCheck).toLocaleTimeString([], {
							hour: "numeric",
							minute: "2-digit"
						})}.` : ""]
					}),
					youtubeFailures.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [
							youtubeFailures.length,
							" creator check",
							youtubeFailures.length === 1 ? "" : "s",
							" failed. ",
							youtubeFailures[0].lastProviderFailure?.recovery
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							disabled: refreshing || !youtubeFollows.length,
							onClick: () => void refresh("youtube", { youtubeLiveOnly: true }),
							children: "Check YouTube live now"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => setSource("youtube"),
							children: "Manage YouTube creators"
						})]
					})
				]
			}),
			!visible.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 rounded-lg border border-border p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl text-fg",
						children: "No streams match this view"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Try a different source, clear your search, or check your saved channels."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4",
						variant: "secondary",
						onClick: reset,
						children: "Reset live filters"
					})
				]
			}),
			sources.map((s) => {
				const items = visible.filter((v) => v.remote?.kind === s.id);
				if (!items.length) return null;
				const limit = limits[s.id] ?? 24;
				const adult = s.id === "chaturbate" || s.id === "myfreecams";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mb-8",
					"aria-label": `${s.label} live streams`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 flex flex-wrap items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "font-display text-2xl text-fg",
								children: [
									s.label,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-base text-muted",
										children: [
											items.length.toLocaleString(),
											" live",
											adult ? " · 18+" : ""
										]
									})
								]
							}), adult && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => setSource("adults"),
								children: "Manage Adult sources"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: grid,
							children: items.slice(0, limit).map((video, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, {
								video,
								variant: "rail",
								index,
								className: "w-full"
							}, video.id))
						}),
						items.length > limit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "mt-4",
							variant: "secondary",
							onClick: () => setLimits((previous) => ({
								...previous,
								[s.id]: limit + 24
							})),
							children: [
								"Show more ",
								s.label,
								" · ",
								items.length - limit,
								" remaining"
							]
						})
					]
				}, s.id);
			}),
			(source === "all" || source === "twitch") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "mt-6 rounded-lg border border-border bg-surface p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "cursor-pointer font-medium text-fg",
						children: "Discover more Twitch channels"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Following a channel adds it to your saved feed and checks its current status."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [
							"twitch",
							"eslcs",
							"gamesdonequick",
							"otknetwork",
							"criticalrole"
						].filter((handle) => !twitchFollows.some((f) => f.handle.toLowerCase() === handle)).map((handle) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							disabled: Boolean(adding),
							onClick: () => void (async () => {
								setAdding(handle);
								try {
									await follow(handle, "twitch");
								} finally {
									setAdding("");
								}
							})(),
							children: adding === handle ? "Checking…" : `Follow ${handle}`
						}, handle))
					})
				]
			})
		]
	});
}
function DiscoveryDesk({ videos }) {
	const [seed, setSeed] = (0, import_react.useState)(1);
	const [picks, setPicks] = (0, import_react.useState)([]);
	const open = useLibrary((s) => s.openVideo);
	(0, import_react.useEffect)(() => {
		const rotate = () => setSeed((Date.now() ^ Math.floor(Math.random() * 4294967295)) >>> 0);
		rotate();
		const timer = window.setInterval(rotate, 6e4);
		return () => window.clearInterval(timer);
	}, []);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const compute = () => {
			if (cancelled) return;
			let state = seed >>> 0;
			const random = () => {
				state ^= state << 13;
				state ^= state >>> 17;
				state ^= state << 5;
				return (state >>> 0) / 4294967296;
			};
			const pool = videos.filter((video) => !video.remote?.live && !video.isSample);
			const stride = pool.length > 2400 ? Math.ceil(pool.length / 2400) : 1;
			const chosen = [];
			for (let i = 0; i < pool.length; i += stride) {
				const video = pool[i];
				const classicFallback = video.collection === "classics" || /classic|noir/i.test(`${video.name} ${video.remote?.channelName ?? ""}`);
				const freshness = Math.max(1, Math.min(8, (video.addedAt - Date.now() + 31536e6) / 3942e6));
				const weight = (video.remote ? 7 : 2) + freshness + (classicFallback ? -6 : 0);
				const entry = {
					video,
					score: random() * Math.max(.25, weight)
				};
				if (chosen.length < 12) {
					chosen.push(entry);
					continue;
				}
				let weakest = 0;
				for (let index = 1; index < chosen.length; index += 1) if (chosen[index].score < chosen[weakest].score) weakest = index;
				if (entry.score > chosen[weakest].score) chosen[weakest] = entry;
			}
			setPicks(chosen.map((entry) => entry.video));
		};
		const cancelSchedule = scheduleBackgroundWork(compute, { timeoutMs: 400 });
		return () => {
			cancelled = true;
			cancelSchedule();
		};
	}, [videos, seed]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-8 rounded-xl border border-border bg-surface p-5 sm:p-7",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex flex-wrap items-end justify-between gap-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-xs font-semibold uppercase tracking-widest text-accent",
					children: "Your daily detour"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "discovery-heading font-display",
					children: "Something worth finding."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "A fresh mix from your library. Follow your curiosity."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					disabled: !picks.length,
					onClick: () => open(picks[0].id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Surprise me"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					onClick: () => setSeed(Math.floor(Math.random() * 4294967295) || 1),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-4" }), "Shuffle picks"]
				})]
			})]
		}), picks.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
			title: "Random discoveries",
			videos: picks,
			variant: "rail"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-6 text-sm text-muted",
			children: "Add videos or follow a channel to start discovering."
		})]
	});
}
function RatingStreakCard() {
	const [snapshot, setSnapshot] = (0, import_react.useState)(() => getRatingStreakSnapshot());
	(0, import_react.useEffect)(() => {
		const refresh = () => setSnapshot(getRatingStreakSnapshot());
		refresh();
		window.addEventListener("reelcase:rating-streak-change", refresh);
		window.addEventListener("reelcase:rating-change", refresh);
		return () => {
			window.removeEventListener("reelcase:rating-streak-change", refresh);
			window.removeEventListener("reelcase:rating-change", refresh);
		};
	}, []);
	const remaining = Math.max(0, snapshot.weeklyGoal - snapshot.thisWeek);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-8 rounded-xl border border-border bg-surface p-5 shadow-border sm:p-6",
		"aria-label": "Rating streak",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 text-xs font-semibold tracking-widest text-accent uppercase",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4" }), "Rating rhythm"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "Small ratings, clearer shelves."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: remaining ? `${remaining} more distinct rating${remaining === 1 ? "" : "s"} unlocks this week’s local reward.` : "This week’s local reward is unlocked."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-elevated px-4 py-3 text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Weekly streak"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-display text-2xl text-fg",
						children: [
							snapshot.weeklyStreak,
							" week",
							snapshot.weeklyStreak === 1 ? "" : "s"
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 h-2 overflow-hidden rounded-full bg-bg/70",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full rounded-full bg-accent transition-[width] duration-200 ease-out",
					style: { width: `${Math.min(100, snapshot.thisWeek / snapshot.weeklyGoal * 100)}%` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					snapshot.thisWeek,
					" of ",
					snapshot.weeklyGoal,
					" rated this week"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: snapshot.nextReward })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mr-1 text-xs text-muted",
					children: "Weekly goal"
				}), RATING_GOALS.map((goal) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: snapshot.weeklyGoal === goal ? "default" : "secondary",
					onClick: () => {
						setRatingWeeklyGoal(goal);
						setSnapshot(getRatingStreakSnapshot());
					},
					children: [goal, " ratings"]
				}, goal))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-2 sm:grid-cols-3",
				children: snapshot.rewards.map((reward) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md bg-elevated px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium text-fg",
						children: [reward.earned ? "Earned · " : "Next · ", reward.label]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs leading-5 text-muted",
						children: reward.detail
					})]
				}, reward.label))
			})
		]
	});
}
function Separator({ className, orientation = "horizontal", decorative = true, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
		decorative,
		orientation,
		className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className),
		...props
	});
}
function NavItem({ active, onClick, icon: Icon, label, count, trailing }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("flex h-10 w-full items-center gap-2.5 rounded-md px-2.5 text-sm transition-[background-color,color] duration-150 ease-[var(--ease-out)]", active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated/70 hover:text-fg"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 shrink-0" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 flex-1 truncate text-left",
				children: label
			}),
			typeof count === "number" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-xs tabular-nums text-subtle",
				children: count
			}),
			trailing
		]
	});
}
function SidebarNav({ onAddFolder, onNavigate }) {
	const folders = useLibrary((s) => s.folders);
	const videos = useLibrary((s) => s.videos);
	const sourceId = useLibrary((s) => s.sourceId);
	const hideDemo = useLibrary((s) => s.hideDemo);
	const setSource = useLibrary((s) => s.setSource);
	const removeFolder = useLibrary((s) => s.removeFolder);
	const restoreOne = useLibrary((s) => s.restoreOne);
	const setFolderAdult = useLibrary((s) => s.setFolderAdult);
	const unfollow = useLibrary((s) => s.unfollow);
	const favorites = useLibrary((s) => s.favorites);
	const progress = useLibrary((s) => s.progress);
	const resumeProgress = useLibrary((s) => s.resumeProgress);
	const history = useLibrary((s) => s.history);
	const adultCatalog = useLibrary(selectAdultRemote);
	const [followingOpen, setFollowingOpen] = (0, import_react.useState)(false);
	const [sourcesOpen, setSourcesOpen] = (0, import_react.useState)(false);
	const [followingLimit] = (0, import_react.useState)(12);
	const [sourceLimit, setSourceLimit] = (0, import_react.useState)(80);
	(0, import_react.useEffect)(() => {
		try {
			setFollowingOpen(localStorage.getItem("reelcase.sidebar.following-open") === "true");
			setSourcesOpen(localStorage.getItem("reelcase.sidebar.sources-open") === "true");
		} catch {}
	}, []);
	const toggleFollowing = () => setFollowingOpen((open) => {
		const next = !open;
		try {
			localStorage.setItem("reelcase.sidebar.following-open", String(next));
		} catch {}
		return next;
	});
	const toggleSources = () => setSourcesOpen((open) => {
		const next = !open;
		try {
			localStorage.setItem("reelcase.sidebar.sources-open", String(next));
		} catch {}
		return next;
	});
	const go = (id) => {
		setSource(id);
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
		onNavigate?.();
	};
	const { publicFolders, networkFolders, adultFolders, counts } = (0, import_react.useMemo)(() => {
		const publicFolders = [];
		const networkFolders = [];
		const adultFolders = [];
		const folderById = new Map(folders.map((folder) => [folder.id, folder]));
		let publicCount = 0, ytCount = 0, twitchCount = 0, liveCount = 0, continueCount = 0;
		const videosById = new Map(videos.map((video) => [video.id, video]));
		for (const folder of folders) if (folder.adult) adultFolders.push(folder);
		else if ((folder.kind === "youtube" || folder.kind === "twitch") && folder.id !== "youtube:featured") networkFolders.push(folder);
		else if (folder.kind !== "demo" && folder.kind !== "youtube" && folder.kind !== "twitch") publicFolders.push(folder);
		for (const video of videos) {
			if (Boolean(folderById.get(video.folderId)?.adult)) continue;
			if (!(hideDemo && video.isSample)) {
				publicCount += 1;
				const mark = resumeForVideo({
					progress,
					resumeProgress
				}, video);
				if (mark && mark.t >= (video.remote ? 2 : 5) && mark.t / mark.d < (video.remote ? .992 : .985)) continueCount += 1;
			}
			if (video.remote?.kind === "youtube") ytCount += 1;
			if (video.remote?.kind === "twitch") twitchCount += 1;
			if (video.remote?.live) liveCount += 1;
		}
		let favCount = 0, historyCount = 0;
		for (const id of Object.keys(favorites)) if (videosById.get(id) && !folderById.get(videosById.get(id).folderId)?.adult) favCount += 1;
		for (const entry of history) {
			const video = videosById.get(entry.id);
			if (video && !folderById.get(video.folderId)?.adult && !(hideDemo && video.isSample)) historyCount += 1;
		}
		return {
			publicFolders,
			networkFolders,
			adultFolders,
			counts: {
				publicCount,
				ytCount,
				twitchCount,
				liveCount,
				continueCount,
				favCount,
				historyCount
			}
		};
	}, [
		favorites,
		folders,
		hideDemo,
		history,
		progress,
		resumeProgress,
		videos
	]);
	const demo = folders.find((f) => f.kind === "demo" && !hideDemo);
	const youtubeFollowing = networkFolders.filter((folder) => folder.kind === "youtube");
	const twitchFollowing = networkFolders.filter((folder) => folder.kind === "twitch");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-full flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-2 pt-1 pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-9 items-center justify-center rounded-lg bg-accent text-accent-fg shadow-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl leading-none tracking-tight text-fg",
						children: "Realhub"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted",
					children: "Vault · networks · live"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "flex flex-col gap-0.5 px-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "home",
						onClick: () => go("home"),
						icon: Clapperboard,
						label: "Home",
						count: counts.publicCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "movies",
						onClick: () => go("movies"),
						icon: Film,
						label: "Movies"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "anime",
						onClick: () => go("anime"),
						icon: Clapperboard,
						label: "Anime"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "genres",
						onClick: () => go("genres"),
						icon: Film,
						label: "Topics"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "youtube",
						onClick: () => go("youtube"),
						icon: Youtube,
						label: "YouTube",
						count: counts.ytCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "twitch",
						onClick: () => go("twitch"),
						icon: Radio,
						label: "Twitch",
						count: counts.twitchCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "live",
						onClick: () => go("live"),
						icon: Radio,
						label: "Live",
						count: counts.liveCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "favorites",
						onClick: () => go("favorites"),
						icon: Heart,
						label: "Favorites",
						count: counts.favCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "continue",
						onClick: () => go("continue"),
						icon: Clock3,
						label: "Continue",
						count: counts.continueCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "history",
						onClick: () => go("history"),
						icon: History,
						label: "History",
						count: counts.historyCount
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "adults",
						onClick: () => go("adults"),
						icon: Flame,
						label: "Adults",
						count: adultCatalog.length
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "adult-fetishes",
						onClick: () => go("adult-fetishes"),
						icon: Sparkles,
						label: "Fetish Explorer"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "photos",
						onClick: () => go("photos"),
						icon: Images,
						label: "Photos"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "spotify",
						onClick: () => go("spotify"),
						icon: Music2,
						label: "Spotify"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "prints",
						onClick: () => go("prints"),
						icon: Box,
						label: "3D prints"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "games",
						onClick: () => go("games"),
						icon: Gamepad2,
						label: "Games"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "shop",
						onClick: () => go("shop"),
						icon: ShoppingBag,
						label: "Shop"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "streaming",
						onClick: () => go("streaming"),
						icon: MonitorPlay,
						label: "Streaming"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "watch-room",
						onClick: () => go("watch-room"),
						icon: Users,
						label: "Watch room"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "connection",
						onClick: () => go("connection"),
						icon: Wifi,
						label: "Connection guide"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "find-phone",
						onClick: () => go("find-phone"),
						icon: Smartphone,
						label: "Find my phone"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "social",
						onClick: () => go("social"),
						icon: X,
						label: "X accounts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "assistant",
						onClick: () => go("assistant"),
						icon: Sparkles,
						label: "AI guide"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "mission-plan",
						onClick: () => go("mission-plan"),
						icon: Clapperboard,
						label: "Mission plan"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "settings",
						onClick: () => go("settings"),
						icon: Settings2,
						label: "Settings"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === "stats",
						onClick: () => go("stats"),
						icon: ChartColumn,
						label: "Stats"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-4" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: toggleSources,
				className: "flex items-center justify-between px-3 pb-2 text-xs font-medium tracking-wide text-subtle uppercase",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Local sources" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: sourcesOpen ? "Hide" : `${publicFolders.length}` })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col gap-0.5 overflow-y-auto px-1",
				children: [
					sourcesOpen && demo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
						active: sourceId === demo.id,
						onClick: () => go(demo.id),
						icon: Film,
						label: demo.name,
						count: demo.videoCount
					}),
					sourcesOpen && publicFolders.slice(0, sourceLimit).map((folder) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderRow, {
						folder,
						active: sourceId === folder.id,
						onClick: () => {
							if (folder.needsPermission) restoreOne(folder.id);
							else go(folder.id);
						},
						onRemove: () => void removeFolder(folder.id),
						onToggleAdult: () => setFolderAdult(folder.id, true)
					}, folder.id)),
					sourcesOpen && publicFolders.length > sourceLimit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						className: "mx-1 mt-1",
						onClick: () => setSourceLimit((value) => value + 80),
						children: "Show 80 more sources"
					}),
					networkFolders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: toggleFollowing,
							className: "mt-3 flex items-center justify-between px-2 pb-1 text-xs font-medium tracking-wide text-subtle uppercase",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Following" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: followingOpen ? "Hide" : networkFolders.length })]
						}),
						followingOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "px-2 pt-1 text-[10px] font-medium tracking-wide text-subtle uppercase",
							children: ["YouTube · ", youtubeFollowing.length]
						}),
						followingOpen && youtubeFollowing.slice(0, followingLimit).map((folder) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderRow, {
							folder,
							active: sourceId === folder.id,
							onClick: () => go(folder.id),
							onRemove: () => unfollow(folder.id),
							onToggleAdult: () => {},
							hideAdult: true
						}, folder.id)),
						followingOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "px-2 pt-3 text-[10px] font-medium tracking-wide text-subtle uppercase",
							children: ["Twitch · ", twitchFollowing.length]
						}),
						followingOpen && twitchFollowing.slice(0, followingLimit).map((folder) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderRow, {
							folder,
							active: sourceId === folder.id,
							onClick: () => go(folder.id),
							onRemove: () => unfollow(folder.id),
							onToggleAdult: () => {},
							hideAdult: true
						}, folder.id)),
						followingOpen && (youtubeFollowing.length > followingLimit || twitchFollowing.length > followingLimit) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-1 mt-2 grid gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => go("youtube"),
								children: "Manage YouTube follows"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => go("twitch"),
								children: "Manage Twitch follows"
							})]
						})
					] }),
					adultFolders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 px-2 pb-1 text-xs font-medium tracking-wide text-subtle uppercase",
						children: "Private"
					}), adultFolders.map((folder) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderRow, {
						folder,
						active: sourceId === folder.id,
						onClick: () => {
							if (folder.needsPermission) restoreOne(folder.id);
							else go("adults");
						},
						onRemove: () => void removeFolder(folder.id),
						onToggleAdult: () => setFolderAdult(folder.id, false)
					}, folder.id))] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-col gap-2 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "w-full",
					onClick: () => onAddFolder(false),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderPlus, { className: "size-4" }), "Add folder"]
				}), (sourceId === "adults" || sourceId === "adult-fetishes") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					className: "w-full",
					onClick: () => onAddFolder(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4" }), "Private folder"]
				})]
			})
		]
	});
}
function FolderRow({ folder, active, onClick, onRemove, onToggleAdult, hideAdult }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "group relative",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
			active,
			onClick,
			icon: folder.adult ? Lock : Folder,
			label: folder.needsPermission ? `${folder.name} (restore)` : folder.name,
			count: folder.needsPermission ? void 0 : folder.videoCount,
			trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center",
				children: [
					folder.health && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						title: folder.health === "healthy" ? "Source checked" : folder.health === "cached" ? "Cached catalog" : "Source needs attention",
						className: cn("mr-1 size-2 rounded-full", folder.health === "healthy" ? "bg-accent" : folder.health === "cached" ? "bg-muted" : "bg-danger")
					}),
					!hideAdult && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						role: "button",
						tabIndex: 0,
						"aria-label": folder.adult ? `Move ${folder.name} to library` : `Move ${folder.name} to Adults`,
						onClick: (e) => {
							e.stopPropagation();
							onToggleAdult();
						},
						onKeyDown: (e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								e.stopPropagation();
								onToggleAdult();
							}
						},
						className: "flex size-7 items-center justify-center rounded-sm text-subtle opacity-0 transition-opacity duration-150 hover:bg-bg hover:text-fg group-hover:opacity-100 focus-visible:opacity-100",
						children: folder.adult ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockOpen, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						role: "button",
						tabIndex: 0,
						"aria-label": `Remove ${folder.name}`,
						onClick: (e) => {
							e.stopPropagation();
							onRemove();
						},
						onKeyDown: (e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								e.stopPropagation();
								onRemove();
							}
						},
						className: "flex size-7 items-center justify-center rounded-sm text-subtle opacity-0 transition-opacity duration-150 hover:bg-bg hover:text-fg group-hover:opacity-100 focus-visible:opacity-100",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
					})
				]
			})
		})
	});
}
function NoticeBell() {
	const notices = useLibrary((s) => s.notices);
	const unread = notices.filter((n) => !n.read).length;
	const markNoticesRead = useLibrary((s) => s.markNoticesRead);
	const notifyPush = useLibrary((s) => s.notifyPush);
	const setNotifyPush = useLibrary((s) => s.setNotifyPush);
	const openVideo = useLibrary((s) => s.openVideo);
	const enablePush = async () => {
		if (!("Notification" in window)) return;
		const perm = await Notification.requestPermission();
		setNotifyPush(perm === "granted");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
		onOpenChange: (open) => {
			if (open) markNoticesRead();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "ghost",
				size: "icon-sm",
				"aria-label": "Notifications",
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" }), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1 right-1 size-1.5 rounded-full bg-danger" })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
			align: "end",
			className: "w-80 p-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b border-border px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-fg",
					children: "Notifications"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => notifyPush ? setNotifyPush(false) : void enablePush(),
					className: "flex items-center gap-1 text-xs text-muted hover:text-fg",
					children: [notifyPush ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellOff, { className: "size-3.5" }), notifyPush ? "Alerts on" : "Enable alerts"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-h-80 overflow-y-auto",
				children: notices.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-3 py-6 text-center text-sm text-muted",
					children: "Follow YouTube or Twitch to get live and upload alerts."
				}) : notices.slice(0, 20).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => n.videoId && openVideo(n.videoId),
					className: cn("flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left hover:bg-elevated", !n.read && "bg-elevated/50"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-fg",
							children: n.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted",
							children: n.body
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-subtle",
							children: formatAgo(n.at)
						})
					]
				}, n.id))
			})]
		})]
	});
}
var worker = null;
var sequence = 0;
var generation = 0;
var timer;
var idleTimer;
var source;
var offset = 0;
var pending = /* @__PURE__ */ new Map();
var status = "idle";
var listeners = /* @__PURE__ */ new Set();
function setStatus(next) {
	status = next;
	listeners.forEach((listener) => listener(status));
}
function fail() {
	clearTimeout(timer);
	clearTimeout(idleTimer);
	worker?.terminate();
	worker = null;
	source = void 0;
	setStatus("failed");
	for (const request of pending.values()) request.resolve(null);
	pending.clear();
}
function releaseWhenIdle() {
	clearTimeout(idleTimer);
	if (pending.size || status !== "ready") return;
	idleTimer = setTimeout(() => {
		if (pending.size || status !== "ready") return;
		worker?.terminate();
		worker = null;
		source = void 0;
		setStatus("idle");
	}, 6e4);
}
function watch() {
	clearTimeout(timer);
	timer = setTimeout(fail, 15e3);
}
function sendBatch() {
	if (!source || !worker) return;
	const { videos, tags, categories } = source;
	const batch = videos.slice(offset, offset + 128).map((v) => ({
		video: {
			id: v.id,
			name: v.name,
			path: v.path,
			genre: v.genre,
			tagline: v.tagline,
			collection: v.collection,
			description: v.description,
			remote: v.remote && {
				channelName: v.remote.channelName,
				channelId: v.remote.channelId,
				kind: v.remote.kind
			}
		},
		tags: tags[v.id] ?? [],
		category: categories[v.id]
	}));
	const reset = offset === 0;
	offset += batch.length;
	watch();
	worker.postMessage({
		type: "batch",
		generation,
		reset,
		done: offset >= videos.length,
		batch
	});
}
function instance() {
	if (!worker) {
		worker = new Worker(new URL("./search.worker.ts", import.meta.url), { type: "module" });
		worker.onerror = fail;
		worker.onmessageerror = fail;
		worker.onmessage = ({ data }) => {
			if (data.generation !== generation) return;
			if (data.type === "next") {
				clearTimeout(timer);
				timer = setTimeout(sendBatch, 0);
				return;
			}
			if (data.type === "ready") {
				clearTimeout(timer);
				setStatus("ready");
				for (const [requestId, request] of pending) worker?.postMessage({
					type: "search",
					generation,
					requestId,
					query: request.query
				});
				if (pending.size) watch();
				else releaseWhenIdle();
				return;
			}
			pending.get(data.requestId)?.resolve(data.ids);
			pending.delete(data.requestId);
			if (!pending.size) {
				clearTimeout(timer);
				releaseWhenIdle();
			}
		};
	}
	return worker;
}
var searchWorkerIndex = {
	sync(videos, tags, categories) {
		clearTimeout(idleTimer);
		if (source?.videos === videos && source.tags === tags && source.categories === categories) return;
		source = {
			videos,
			tags,
			categories
		};
		offset = 0;
		generation++;
		clearTimeout(timer);
		setStatus("building");
		try {
			instance();
			timer = setTimeout(sendBatch, 0);
		} catch {
			fail();
		}
	},
	search(query) {
		clearTimeout(idleTimer);
		if (status === "failed" || status === "idle") return Promise.resolve(null);
		return new Promise((resolve) => {
			const requestId = ++sequence;
			pending.set(requestId, {
				query,
				resolve
			});
			if (status === "ready") {
				worker?.postMessage({
					type: "search",
					generation,
					requestId,
					query
				});
				watch();
			}
		});
	},
	getStatus() {
		return status;
	},
	subscribe(listener) {
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	}
};
var SORTS = [
	{
		key: "name",
		label: "Name"
	},
	{
		key: "added",
		label: "Date added"
	},
	{
		key: "recent",
		label: "Recently played"
	},
	{
		key: "size",
		label: "Size"
	},
	{
		key: "duration",
		label: "Duration"
	},
	{
		key: "type",
		label: "File type"
	},
	{
		key: "folder",
		label: "Folder"
	},
	{
		key: "path",
		label: "Full path"
	}
];
function TopBar({ onMenu, onAddFolder }) {
	const query = useLibrary((s) => s.query);
	const setQuery = useLibrary((s) => s.setQuery);
	const sourceId = useLibrary((s) => s.sourceId);
	const [draft, setDraft] = (0, import_react.useState)(query);
	const [lookup, setLookup] = (0, import_react.useState)(query);
	const [now, setNow] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setDraft(query);
	}, [query]);
	(0, import_react.useEffect)(() => {
		const id = window.setTimeout(() => setLookup(draft), 140);
		return () => window.clearTimeout(id);
	}, [draft]);
	(0, import_react.useEffect)(() => {
		if (draft === query) return;
		if (sourceId === "adults" || sourceId === "adult-fetishes") return;
		const t = window.setTimeout(() => setQuery(draft), 180);
		return () => window.clearTimeout(t);
	}, [
		draft,
		query,
		setQuery,
		sourceId
	]);
	(0, import_react.useEffect)(() => {
		setNow(/* @__PURE__ */ new Date());
		const id = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), 15e3);
		return () => window.clearInterval(id);
	}, []);
	const view = useLibrary((s) => s.view);
	const setView = useLibrary((s) => s.setView);
	const sort = useLibrary((s) => s.sort);
	const setSort = useLibrary((s) => s.setSort);
	const scanning = useLibrary((s) => s.scanning);
	const folders = useLibrary((s) => s.folders);
	const videos = useLibrary((s) => s.videos);
	const openPreview = useLibrary((s) => s.openPreview);
	const setSource = useLibrary((s) => s.setSource);
	const tags = useLibrary((s) => s.tags);
	const adultsUnlocked = useLibrary((s) => s.adultsUnlocked);
	const [focused, setFocused] = (0, import_react.useState)(false);
	const [recent, setRecent] = (0, import_react.useState)(() => {
		try {
			return JSON.parse(localStorage.getItem("reelcase.search.recent") ?? "[]");
		} catch {
			return [];
		}
	});
	const sortLabel = SORTS.find((s) => s.key === sort)?.label ?? "Name";
	const sourceLabel = sourceId === "live" ? "Live" : sourceId === "home" ? "Home" : sourceId === "movies" ? "Movies" : sourceId === "photos" ? "Photos" : sourceId === "twitch" ? "Twitch" : sourceId === "youtube" ? "YouTube" : folders.find((folder) => folder.id === sourceId)?.name ?? "Library";
	const sourceCount = sourceId === "home" ? videos.length : folders.find((folder) => folder.id === sourceId)?.videoCount;
	const needle = lookup.trim().toLowerCase();
	const [workerIds, setWorkerIds] = (0, import_react.useState)(null);
	const [searchIndexStatus, setSearchIndexStatus] = (0, import_react.useState)(searchWorkerIndex.getStatus());
	(0, import_react.useEffect)(() => searchWorkerIndex.subscribe(setSearchIndexStatus), []);
	(0, import_react.useEffect)(() => {
		let active = true;
		setWorkerIds(null);
		if (!needle) {
			setWorkerIds(null);
			return;
		}
		searchWorkerIndex.search(needle).then((ids) => {
			if (active) setWorkerIds(ids);
		});
		return () => {
			active = false;
		};
	}, [needle, searchIndexStatus]);
	const videoById = (0, import_react.useMemo)(() => new Map(videos.map((video) => [video.id, video])), [videos]);
	const hits = (0, import_react.useMemo)(() => {
		if (!needle || searchIndexStatus === "building" || workerIds === null && searchIndexStatus !== "failed") return [];
		const indexedIds = workerIds ? new Set(workerIds) : librarySearchIndex.search(needle);
		return (indexedIds ? Array.from(indexedIds, (id) => videoById.get(id)).filter((video) => Boolean(video)) : videos).filter((video) => {
			if (folders.find((item) => item.id === video.folderId)?.adult && !((sourceId === "adults" || sourceId === "adult-fetishes") && adultsUnlocked)) return false;
			if (sourceId === "youtube" && video.remote?.kind !== "youtube") return false;
			if (sourceId === "twitch" && video.remote?.kind !== "twitch") return false;
			return indexedIds ? true : `${video.name} ${video.path} ${video.description ?? ""} ${video.remote?.channelName ?? ""} ${(tags[video.id] ?? []).join(" ")}`.toLowerCase().includes(needle);
		}).sort((a, b) => b.addedAt - a.addedAt).slice(0, 6);
	}, [
		adultsUnlocked,
		folders,
		needle,
		sourceId,
		tags,
		videoById,
		videos,
		workerIds,
		searchIndexStatus
	]);
	const suggestionTags = (0, import_react.useMemo)(() => [...new Set(hits.flatMap((video) => tags[video.id] ?? []))].filter((tag) => tag.length >= 3).slice(0, 5), [hits, tags]);
	const applyAdultTagStay = (raw) => {
		const tag = raw.trim().replace(/^#/, "");
		if (!tag) return;
		setDraft("");
		setQuery("");
		window.dispatchEvent(new CustomEvent("reelcase:adult-tag", { detail: { tag } }));
		setFocused(false);
	};
	const onAdultDesk = sourceId === "adults" || sourceId === "adult-fetishes";
	const commit = (value = draft) => {
		const clean = value.trim();
		if (onAdultDesk && clean) {
			applyAdultTagStay(clean);
			if (clean) {
				const next = [clean.replace(/^#/, ""), ...recent.filter((item) => item !== clean.replace(/^#/, ""))].slice(0, 5);
				setRecent(next);
				localStorage.setItem("reelcase.search.recent", JSON.stringify(next));
			}
			return;
		}
		setQuery(clean);
		if (clean) {
			const next = [clean, ...recent.filter((item) => item !== clean)].slice(0, 5);
			setRecent(next);
			localStorage.setItem("reelcase.search.recent", JSON.stringify(next));
		}
		setFocused(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "grid gap-3 border-b border-border px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6 xl:grid-cols-[minmax(13rem,0.55fr)_minmax(20rem,1.4fr)_auto]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					className: "lg:hidden",
					"aria-label": "Open menu",
					onClick: onMenu,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate font-display text-lg leading-none text-fg",
						children: sourceLabel
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: typeof sourceCount === "number" ? `${sourceCount.toLocaleString()} indexed` : "Control room"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative min-w-0 xl:max-w-3xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-accent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "search",
						value: draft,
						onChange: (e) => setDraft(e.target.value),
						onKeyDown: (e) => {
							if (e.key === "Enter") commit();
							if (e.key === "Escape") setFocused(false);
						},
						onFocus: () => setFocused(true),
						placeholder: onAdultDesk ? "Find Adult tags — e.g. role play or creator…" : "Search your entire media desk…",
						className: "h-12 border-border bg-elevated pl-11 pr-10 text-base shadow-border",
						"aria-label": "Global media search"
					}),
					draft && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Clear search",
						onClick: () => {
							setDraft("");
							setQuery("");
							if (sourceId === "adults" || sourceId === "adult-fetishes") window.dispatchEvent(new CustomEvent("reelcase:adult-tag", { detail: { tag: "All" } }));
						},
						className: "absolute top-1/2 right-3 -translate-y-1/2 text-subtle hover:text-fg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					}),
					focused && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute top-[calc(100%+0.5rem)] z-40 w-full overflow-hidden rounded-lg bg-surface p-2 shadow-lift shadow-border",
						children: [
							searchIndexStatus === "building" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-3 py-2 text-xs text-muted",
								children: "Preparing search… you can keep browsing."
							}),
							onAdultDesk && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-3 py-2 text-xs text-muted",
								children: "Use plain words or #tags. Adult tag searches stay on this desk and match saved creator, source, and interest labels."
							}),
							hits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "px-3 py-2 text-xs font-medium tracking-[0.14em] text-accent uppercase",
									children: sourceId === "youtube" ? "YouTube matches" : sourceId === "twitch" ? "Twitch matches" : "Best matches"
								}),
								hits.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onMouseDown: (event) => event.preventDefault(),
									onClick: () => {
										openPreview(video.id);
										setFocused(false);
									},
									className: "flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left hover:bg-elevated",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex size-8 shrink-0 items-center justify-center rounded-sm bg-bg/60 text-accent",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderSearch, { className: "size-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate text-sm font-medium text-fg",
											children: video.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate text-xs text-muted",
											children: video.remote?.channelName ?? video.path
										})]
									})]
								}, video.id)),
								suggestionTags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2 border-t border-border px-3 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "self-center text-xs text-muted",
										children: "Related tags"
									}), suggestionTags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "secondary",
										onMouseDown: (event) => event.preventDefault(),
										onClick: () => {
											setDraft(tag);
											commit(tag);
										},
										children: ["#", tag]
									}, tag))]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onMouseDown: (event) => event.preventDefault(),
									onClick: () => commit(),
									className: "mt-1 flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-accent hover:bg-elevated",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }),
										" See all results for “",
										draft,
										"”"
									]
								})
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "px-3 py-2 text-xs font-medium tracking-[0.14em] text-accent uppercase",
									children: "Search everywhere"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-2 px-3 py-2",
									children: [
										"favorites",
										"4k",
										"documentary",
										"watch later"
									].map((term) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										onMouseDown: (event) => event.preventDefault(),
										onClick: () => {
											setDraft(term);
											commit(term);
										},
										children: term
									}, term))
								}),
								recent.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "border-t border-border px-3 pt-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: "Recent"
									}), recent.map((term) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onMouseDown: (event) => event.preventDefault(),
										onClick: () => {
											setDraft(term);
											commit(term);
										},
										className: "mt-1 flex w-full items-center gap-2 py-1 text-left text-sm text-fg hover:text-accent",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }), term]
									}, term))]
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex gap-2 border-t border-border px-3 pt-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										onMouseDown: (event) => event.preventDefault(),
										onClick: () => setSource("home"),
										children: "Library"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										onMouseDown: (event) => event.preventDefault(),
										onClick: () => setSource("youtube"),
										children: "YouTube"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										onMouseDown: (event) => event.preventDefault(),
										onClick: () => setSource("twitch"),
										children: "Twitch"
									})
								]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5 sm:justify-end",
				children: [
					scanning && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mr-2 hidden truncate text-xs text-muted sm:inline",
						children: [
							"Scanning ",
							scanning.folderName,
							" · ",
							scanning.found
						]
					}),
					sourceId !== "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							children: sortLabel
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
						align: "end",
						children: SORTS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							onSelect: () => setSort(s.key),
							children: [s.key === sort ? "· " : "  ", s.label]
						}, s.key))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "hidden items-center gap-1.5 px-2 text-xs tabular-nums text-muted xl:flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-3.5" }), now ? now.toLocaleTimeString([], {
							hour: "numeric",
							minute: "2-digit"
						}) : "--:--"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoticeBell, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex rounded-md bg-elevated p-0.5 shadow-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Grid view",
							onClick: () => setView("grid"),
							className: cn("flex size-9 items-center justify-center rounded-sm transition-colors duration-150", view === "grid" ? "bg-surface text-fg" : "text-muted hover:text-fg"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "List view",
							onClick: () => setView("list"),
							className: cn("flex size-9 items-center justify-center rounded-sm transition-colors duration-150", view === "list" ? "bg-surface text-fg" : "text-muted hover:text-fg"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { className: "size-4" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						size: "sm",
						onClick: onAddFolder,
						className: "hidden sm:inline-flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-3.5" }), "Folder"]
					})
				]
			})
		]
	});
}
var ICONS = {
	videos: Video,
	downloads: Download,
	desktop: Monitor,
	documents: FileText,
	pictures: Image,
	music: Video
};
function InviteStrip({ onAddFolder, onAddFiles, onRecommended }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-8 rounded-xl bg-surface px-5 py-5 shadow-border sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl leading-tight text-fg",
						children: "Pull in the rest of this computer"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Start with a recommended folder, or pick any drive. Files are read in the browser and never leave the machine."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: onAddFolder,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderPlus, { className: "size-4" }), "Add folder"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						onClick: onAddFiles,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }), "Add files"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 mb-2 text-xs font-medium tracking-wide text-subtle uppercase",
				children: "Recommended folders"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5",
				children: RECOMMENDED_FOLDERS.map((folder) => {
					const Icon = ICONS[folder.id];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onRecommended(folder.id),
						className: "flex h-16 items-center gap-3 rounded-lg bg-elevated px-3 text-left shadow-border transition-[box-shadow,transform] duration-150 hover:shadow-border-hover active:scale-[0.96]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-9 items-center justify-center rounded-sm bg-surface text-fg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-sm font-medium text-fg",
								children: folder.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-xs text-muted",
								children: folder.hint
							})]
						})]
					}, folder.id);
				})
			})
		]
	});
}
/** Initial / incremental page size — catalog stays full in memory/IDB; only this many cards mount. */
var PAGE = 36;
/** Hard ceiling for simultaneously mounted cards in the infinite grid. */
var MOUNT_CAP = 108;
var ROW_ESTIMATE = 280;
function VideoGrid({ videos, playedAt }) {
	const view = useLibrary((s) => s.view);
	const [limit, setLimit] = (0, import_react.useState)(PAGE);
	const [windowStart, setWindowStart] = (0, import_react.useState)(0);
	const sentinelRef = (0, import_react.useRef)(null);
	const topSentinelRef = (0, import_react.useRef)(null);
	const sourceKey = `${videos.length}:${videos[0]?.id ?? ""}:${videos[videos.length - 1]?.id ?? ""}`;
	(0, import_react.useEffect)(() => {
		setLimit(PAGE);
		setWindowStart(0);
	}, [sourceKey]);
	(0, import_react.useEffect)(() => {
		const el = sentinelRef.current;
		if (!el || limit >= videos.length) return;
		const io = new IntersectionObserver((entries) => {
			if (entries.some((e) => e.isIntersecting)) setLimit((value) => {
				const next = Math.min(videos.length, value + PAGE);
				queueMicrotask(() => setWindowStart((start) => Math.max(start, Math.max(0, next - MOUNT_CAP))));
				return next;
			});
		}, { rootMargin: "400px 0px" });
		io.observe(el);
		return () => io.disconnect();
	}, [limit, videos.length]);
	(0, import_react.useEffect)(() => {
		const el = topSentinelRef.current;
		if (!el || windowStart <= 0) return;
		const io = new IntersectionObserver((entries) => {
			if (entries.some((e) => e.isIntersecting)) setWindowStart((start) => Math.max(0, start - PAGE));
		}, { rootMargin: "200px 0px" });
		io.observe(el);
		return () => io.disconnect();
	}, [windowStart]);
	if (!videos.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-surface px-6 py-16 text-center shadow-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-2xl text-fg",
			children: "No videos here"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mx-auto mt-2 max-w-sm text-sm text-muted",
			children: "Try another source, clear search, or add a folder from this computer."
		})]
	});
	const more = limit < videos.length;
	const start = Math.min(windowStart, Math.max(0, limit - 1));
	const visible = videos.slice(start, limit);
	const leadPx = view === "list" ? start * 72 : Math.ceil(start / 2) * ROW_ESTIMATE;
	if (view === "list") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		leadPx > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: topSentinelRef,
			"aria-hidden": "true",
			style: { height: leadPx }
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-1",
			children: visible.map((video, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, {
				video,
				variant: "list",
				index: start + i,
				playedAt: playedAt?.[video.id]
			}, video.id))
		}),
		more && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: sentinelRef,
			className: "h-8",
			"aria-hidden": true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "secondary",
			className: "mt-5 w-full",
			onClick: () => {
				const next = Math.min(videos.length, limit + PAGE);
				setLimit(next);
				setWindowStart((s) => Math.max(s, Math.max(0, next - MOUNT_CAP)));
			},
			children: [
				"Show more · ",
				videos.length - limit,
				" remaining"
			]
		})] })
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		leadPx > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: topSentinelRef,
			"aria-hidden": "true",
			style: { height: leadPx }
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
			children: visible.map((video, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, {
				video,
				variant: "grid",
				index: start + i,
				playedAt: playedAt?.[video.id]
			}, video.id))
		}),
		more && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: sentinelRef,
			className: "h-8",
			"aria-hidden": true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "secondary",
			className: "mt-6 w-full",
			onClick: () => {
				const next = Math.min(videos.length, limit + PAGE);
				setLimit(next);
				setWindowStart((s) => Math.max(s, Math.max(0, next - MOUNT_CAP)));
			},
			children: [
				"Show more · ",
				videos.length - limit,
				" remaining"
			]
		})] })
	] });
}
function rankingVideo(video) {
	return {
		id: video.id,
		folderId: video.folderId,
		name: "",
		path: "",
		size: 0,
		addedAt: video.addedAt,
		extension: video.extension,
		mime: video.mime,
		poster: video.poster ? "available" : void 0,
		remote: video.remote ? {
			kind: video.remote.kind,
			live: video.remote.live,
			channelName: video.remote.channelName,
			sourceKinds: video.remote.sourceKinds,
			previewUrl: video.remote.previewUrl ? "available" : void 0
		} : void 0
	};
}
function useAdultBrowse(enabled, inputs, params) {
	const [packet, setPacket] = (0, import_react.useState)();
	const [failed, setFailed] = (0, import_react.useState)(false);
	const [attempt, setAttempt] = (0, import_react.useState)(0);
	const sequence = (0, import_react.useRef)(0);
	const enqueue = (0, import_react.useRef)(void 0);
	(0, import_react.useEffect)(() => {
		if (enabled) return;
		setPacket(void 0);
	}, [enabled]);
	(0, import_react.useEffect)(() => {
		if (!enabled) return;
		let worker;
		let active = true;
		let busy;
		let queued;
		let sent;
		let timeout;
		const fail = () => {
			if (!active) return;
			active = false;
			clearTimeout(timeout);
			worker?.terminate();
			enqueue.current = void 0;
			setFailed(true);
		};
		try {
			worker = new Worker(new URL("../../lib/videos/adult-browse.worker.ts", import.meta.url), { type: "module" });
		} catch {
			fail();
			return;
		}
		setFailed(false);
		const pump = () => {
			if (!active || busy || !queued) return;
			const job = queued;
			busy = job;
			queued = void 0;
			try {
				if (!sent || sent.videos !== job.inputs.videos || sent.tags !== job.inputs.tags || sent.personalVideos !== job.inputs.personalVideos || sent.deepVideos !== job.inputs.deepVideos) {
					const scopedTags = {};
					for (const list of [
						job.inputs.videos,
						job.inputs.personalVideos,
						job.inputs.deepVideos
					]) for (const video of list) if (job.inputs.tags[video.id]) scopedTags[video.id] = job.inputs.tags[video.id];
					worker.postMessage({
						type: "catalog",
						videos: job.inputs.videos.map(rankingVideo),
						personalVideos: job.inputs.personalVideos.map(rankingVideo),
						deepVideos: job.inputs.deepVideos.map(rankingVideo),
						tags: scopedTags
					});
				}
				if (sent !== job.inputs) worker.postMessage({
					type: "signals",
					signals: job.signals
				});
				sent = job.inputs;
				worker.postMessage({
					type: "browse",
					requestId: job.id,
					params: job.params
				});
				timeout = setTimeout(fail, 3e4);
			} catch {
				fail();
			}
		};
		enqueue.current = (job) => {
			queued = job;
			pump();
		};
		worker.onmessage = ({ data }) => {
			if (!active || !busy || data.requestId !== busy.id) return;
			clearTimeout(timeout);
			const completed = busy;
			busy = void 0;
			if (data.error) {
				fail();
				return;
			}
			if (data.requestId === sequence.current) (0, import_react.startTransition)(() => setPacket({
				inputs: completed.inputs,
				params: completed.params,
				result: data.result
			}));
			pump();
		};
		worker.onerror = (event) => {
			event.preventDefault();
			fail();
		};
		worker.onmessageerror = fail;
		return () => {
			active = false;
			clearTimeout(timeout);
			enqueue.current = void 0;
			worker.terminate();
		};
	}, [enabled, attempt]);
	(0, import_react.useEffect)(() => {
		const id = ++sequence.current;
		if (!enabled) return;
		let cancelled = false;
		const start = () => {
			rankingFeedbackSnapshot().then((feedback) => {
				if (cancelled) return;
				enqueue.current?.({
					id,
					inputs,
					params,
					signals: {
						...feedback,
						favorites: inputs.favorites,
						likes: inputs.likes,
						cameCounts: inputs.cameCounts,
						viewCounts: inputs.viewCounts,
						continueIds: inputs.continueIds,
						favoriteIds: inputs.favoriteIds
					}
				});
			}).catch(() => {
				if (!cancelled) setFailed(true);
			});
		};
		const cancelSchedule = scheduleBackgroundWork(start, {
			timeoutMs: 500,
			fallbackDelayMs: 80
		});
		return () => {
			cancelled = true;
			cancelSchedule();
		};
	}, [
		enabled,
		inputs,
		params,
		attempt
	]);
	const result = enabled && packet?.params === params && packet.inputs.videos === inputs.videos && packet.inputs.tags === inputs.tags ? packet.result : void 0;
	return {
		result,
		facets: enabled && packet?.params.source === params.source && packet.inputs.videos === inputs.videos && packet.inputs.tags === inputs.tags ? packet.result : void 0,
		failed,
		pending: enabled && (!result || packet?.inputs !== inputs),
		retry: () => setAttempt((value) => value + 1)
	};
}
/** Split pasted lists on newlines, commas, or whitespace (URLs never contain spaces). */
function linesToCandidates(value, kind) {
	return [...new Set(value.split(/[\s,]+/).map((line) => line.trim().replaceAll("\\_", "_").replace(/^["'([{<]+|["')\]}>.;:]+$/g, "")).filter(Boolean))].map((query) => ({
		query,
		kind
	}));
}
function ConnectPanel({ defaultKind = "youtube", lockedKind }) {
	const followRemoteQuery = useLibrary((s) => s.followRemoteQuery);
	const importBatch = useLibrary((s) => s.importBatch);
	const remoteBusy = useLibrary((s) => s.remoteBusy);
	const importProgress = useLibrary((s) => s.importProgress);
	const follows = useLibrary((s) => s.follows);
	const [kind, setKind] = (0, import_react.useState)(lockedKind ?? defaultKind);
	const [query, setQuery] = (0, import_react.useState)("");
	const [discovery, setDiscovery] = (0, import_react.useState)("");
	const [bulk, setBulk] = (0, import_react.useState)("");
	const [twitchName, setTwitchName] = (0, import_react.useState)("");
	const [found, setFound] = (0, import_react.useState)([]);
	const [finding, setFinding] = (0, import_react.useState)(false);
	const [savedLists, setSavedLists] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		try {
			setBulk(localStorage.getItem(`reelcase.import-draft.${kind}`) ?? "");
		} catch {}
	}, [kind]);
	(0, import_react.useEffect)(() => {
		if (lockedKind) setKind(lockedKind);
	}, [lockedKind]);
	(0, import_react.useEffect)(() => {
		try {
			setSavedLists(JSON.parse(localStorage.getItem(`reelcase.import-history.${kind}`) ?? "[]"));
		} catch {
			setSavedLists([]);
		}
	}, [kind]);
	const candidates = (0, import_react.useMemo)(() => linesToCandidates(bulk, kind), [bulk, kind]);
	const networkFollows = follows.filter((follow) => follow.kind === kind);
	const recommended = (kind === "twitch" ? [
		"Northernlion",
		"CohhCarnage",
		"LIRIK"
	] : [
		"H3Podcast",
		"LinusTechTips",
		"MarquesBrownlee",
		"Kurzgesagt"
	]).filter((handle) => !follows.some((follow) => follow.kind === kind && follow.handle.toLowerCase() === handle.toLowerCase()));
	const submit = async () => {
		const items = linesToCandidates(query, kind);
		if (!items.length) return;
		if (items.length > 1) {
			await importItems(items);
			setQuery("");
			return;
		}
		try {
			await followRemoteQuery(items[0].query, kind);
			setQuery("");
			toast.success(kind === "twitch" ? "Twitch channel added" : items[0].query.includes("list=") ? "YouTube playlist added" : "YouTube channel added");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not add that source");
		}
	};
	const importItems = async (items) => {
		if (!items.length) return;
		const normalized = items.map((item) => ({
			...item,
			query: item.query.trim().replaceAll("\\_", "_")
		}));
		const saved = [.../* @__PURE__ */ new Set([...normalized.map((item) => item.query), ...savedLists])].slice(0, 1e3);
		localStorage.setItem(`reelcase.import-history.${kind}`, JSON.stringify(saved));
		localStorage.setItem(`reelcase.import-draft.${kind}`, bulk);
		setSavedLists(saved);
		try {
			const result = await importBatch(normalized);
			setFound([]);
			if (result.failed && result.failedQueries?.length) toast.message(`${result.ok} added · ${result.failed} unavailable`, { description: result.failedQueries.slice(0, 8).map((query) => `${query}: ${result.failedReasons?.[query] ?? "unavailable"}`).join(" · ") + (result.failedQueries.length > 8 ? "…" : "") });
			else toast.success(result.failed ? `${result.ok} added · ${result.failed} unavailable` : `${result.ok} channel${result.ok === 1 ? "" : "s"} added`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not import those channels");
		}
	};
	const findTwitchFollows = async () => {
		const login = twitchName.trim();
		if (!login) return;
		setFinding(true);
		try {
			const result = await fetchTwitchFollowing({ data: { login } });
			const rows = result.channels.map((channel) => ({
				query: channel.login,
				kind: "twitch"
			}));
			setFound(rows);
			if (!rows.length) toast.message(result.privateList ? "Twitch did not expose a public following list for that profile." : "No follows were found for that profile.");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not look up that Twitch profile");
		} finally {
			setFinding(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-8 overflow-hidden rounded-xl bg-surface shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border bg-elevated/45 px-5 py-5 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-w-xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-accent uppercase",
								children: [
									kind === "twitch" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Youtube, { className: "size-3.5" }),
									" ",
									kind === "twitch" ? "Twitch follow manager" : "YouTube subscriptions"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 font-display text-3xl leading-none text-fg sm:text-4xl",
								children: kind === "twitch" ? "Build your live desk." : "Bring subscriptions home."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: kind === "twitch" ? "Keep live channels, VODs, and clips in a Twitch-only follow list." : "Keep channel uploads, previews, and recommendations in a YouTube-only subscription list."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Following",
							value: follows.length
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "This network",
							value: networkFollows.length
						})]
					})]
				}), !lockedKind && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 inline-flex rounded-md bg-bg/50 p-1 shadow-border",
					role: "tablist",
					"aria-label": "Network",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NetworkTab, {
						active: kind === "youtube",
						onClick: () => {
							setKind("youtube");
							setFound([]);
						},
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Youtube, { className: "size-4" }),
						label: "YouTube"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NetworkTab, {
						active: kind === "twitch",
						onClick: () => {
							setKind("twitch");
							setFound([]);
						},
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-4" }),
						label: "Twitch"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepBadge, {
						number: "01",
						label: kind === "twitch" ? "Follow live channels" : "Add subscriptions"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: kind === "youtube" ? "Paste a channel URL, @handle, channel ID, video link, or public playlist link. Several at once is fine." : "Paste one or more Twitch usernames or channel URLs (comma, space, or newline separated)."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-3 flex flex-col gap-2 sm:flex-row",
						onSubmit: (event) => {
							event.preventDefault();
							submit();
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: query,
							onChange: (event) => setQuery(event.target.value),
							placeholder: kind === "youtube" ? "youtube.com/@creator or youtube.com/playlist?list=…" : "ironmouse, zackrawrr  or  twitch.tv/creator",
							"aria-label": kind === "youtube" ? "YouTube channel, playlist, or video" : "Twitch channels"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "submit",
							disabled: remoteBusy || !query.trim(),
							className: "sm:w-32",
							children: [
								remoteBusy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" }),
								" ",
								"Follow"
							]
						})]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepBadge, {
						number: "02",
						label: kind === "twitch" ? "Import Twitch follows" : "Import YouTube subscriptions"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: kind === "twitch" ? "Paste a list of Twitch logins or channel URLs. You can also look up someone else's public follows below." : "Paste one channel URL or @handle per line. This is the fastest way to move a saved subscription list into Realhub."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 rounded-md bg-bg/45 px-3 py-2 text-xs leading-5 text-muted",
							children: kind === "twitch" ? "How to import: copy public channel links or logins from Twitch, paste them below (one per line, or comma-separated), then select Import list. Private Twitch follows are not exposed by the site, so Realhub cannot read them directly." : "How to import: copy YouTube channel URLs or @handles from your subscriptions, paste them below (one per line, or comma-separated), then select Import list. Your pasted list stays saved locally for future refreshes."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: bulk,
							onChange: (event) => {
								setBulk(event.target.value);
								localStorage.setItem(`reelcase.import-draft.${kind}`, event.target.value);
							},
							className: "mt-3 min-h-28 w-full resize-y rounded-md bg-elevated px-3 py-2.5 text-sm text-fg shadow-border outline-none transition-[box-shadow] duration-150 placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/50",
							placeholder: kind === "twitch" ? "ironmouse\nzackrawrr\ntwitch.tv/shroud, pokimane" : "@CreatorOne\nyoutube.com/@CreatorTwo\nhttps://youtube.com/channel/UC...",
							"aria-label": kind === "twitch" ? "Twitch channels to import" : "YouTube channels to import"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-subtle",
								children: candidates.length ? `${candidates.length} channels ready` : "Separate with spaces, commas, or new lines."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								disabled: remoteBusy || !candidates.length,
								onClick: () => void importItems(candidates),
								children: [
									remoteBusy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListPlus, { className: "size-4" }),
									" ",
									"Import list"
								]
							})]
						}),
						kind === "twitch" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 border-t border-border pt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "Or enter a Twitch profile to look for its publicly visible follows, then choose what to add."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex flex-col gap-2 sm:flex-row",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: twitchName,
										onChange: (event) => setTwitchName(event.target.value),
										placeholder: "Twitch username",
										"aria-label": "Twitch username to inspect"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "secondary",
										disabled: finding || !twitchName.trim(),
										onClick: () => void findTwitchFollows(),
										className: "sm:w-40",
										children: [
											finding ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListPlus, { className: "size-4" }),
											" ",
											"Find follows"
										]
									})]
								}),
								found.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportReview, {
									items: found,
									onImport: () => void importItems(found),
									busy: remoteBusy
								})
							]
						})
					] })]
				})]
			}),
			recommended.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-border px-5 py-4 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Recommended follows"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: "Quick local suggestions. Already saved channels are hidden automatically."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: recommended.map((handle) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							disabled: remoteBusy,
							onClick: () => void importItems([{
								query: handle,
								kind
							}]),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListPlus, { className: "size-3.5" }),
								" ",
								handle
							]
						}, handle))
					})
				]
			}),
			savedLists.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-border px-5 py-4 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Saved import list"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted",
						children: [savedLists.length, " channel entries retained locally for this service. Realhub retries this list automatically at startup when the follow shelf is empty."]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: savedLists.slice(0, 12).map((handle) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-sm bg-elevated px-2 py-1 text-xs text-muted",
							children: handle
						}, handle))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-3",
						size: "sm",
						variant: "secondary",
						disabled: remoteBusy,
						onClick: () => void importItems(savedLists.map((query) => ({
							query,
							kind
						}))),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListPlus, { className: "size-3.5" }), " Load saved list now"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 border-t border-border bg-elevated/30 px-5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 text-accent" }), " Latest uploads and live streams appear automatically on Home."]
					}),
					importProgress && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						role: "status",
						"aria-live": "polite",
						className: "font-mono text-xs text-accent",
						children: [
							importProgress.label,
							" · ",
							importProgress.done.toLocaleString(),
							" of ",
							importProgress.total.toLocaleString(),
							" sources processed",
							importProgress.total > 0 ? ` · ${Math.round(Math.min(1, importProgress.done / importProgress.total) * 100)}%` : ""
						]
					}),
					kind === "twitch" && !importProgress && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-1.5 text-xs text-subtle",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-3.5" }), " Private following lists cannot be read by Twitch."]
					})
				]
			}),
			kind === "youtube" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-border px-5 py-5 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Live discovery"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-col gap-2 sm:flex-row sm:items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: discovery,
							onChange: (event) => setDiscovery(event.target.value),
							placeholder: "Search live channels, games, or events",
							"aria-label": "Discover live YouTube channels"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "inline-flex min-h-10 items-center justify-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg",
							target: "_blank",
							rel: "noreferrer",
							href: `https://www.youtube.com/results?search_query=${encodeURIComponent(discovery || "live")}&sp=EgJAAQ%3D%3D`,
							children: "Browse live"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-subtle",
						children: "Open a live channel, then paste it above to add it to your guide. Your followed channels remain browsable, refreshable, and ready for a random pick from Home."
					})
				]
			})
		]
	});
}
function NetworkTab({ active, icon, label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		role: "tab",
		"aria-selected": active,
		onClick,
		className: cn("flex h-10 items-center gap-2 rounded-sm px-4 text-sm transition-[background-color,color,box-shadow] duration-150", active ? "bg-surface text-fg shadow-border" : "text-muted hover:text-fg"),
		children: [icon, label]
	});
}
function Metric({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-20 rounded-md bg-bg/50 px-3 py-2 shadow-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-lg leading-none tabular-nums text-fg",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-subtle",
			children: label
		})]
	});
}
function StepBadge({ number, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "font-mono text-xs font-medium tracking-[0.12em] text-accent uppercase",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mr-2 text-subtle",
			children: number
		}), label]
	});
}
function ImportReview({ items, onImport, busy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 rounded-md bg-elevated p-3 shadow-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-fg",
				children: [
					items.length,
					" public follow",
					items.length === 1 ? "" : "s",
					" found"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				disabled: busy,
				onClick: onImport,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListPlus, { className: "size-4" }), " Import all"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 line-clamp-2 text-xs text-muted",
			children: [items.slice(0, 12).map((item) => item.query).join(" · "), items.length > 12 ? " · …" : ""]
		})]
	});
}
var PAGE_SIZE = 48;
var CREATOR_PAGE_SIZE = 24;
var EMPTY_CREATOR_VIDEOS = [];
var nameCollator = new Intl.Collator(void 0, {
	sensitivity: "base",
	numeric: true
});
function creatorLabel(channel) {
	return channel.title.trim() || channel.handle.trim() || "Untitled creator";
}
function initials(label) {
	return label.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "?";
}
function CreatorAvatar({ channel, label }) {
	const [failed, setFailed] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setFailed(false), [channel.thumb]);
	return channel.thumb && !failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: channel.thumb,
		alt: "",
		className: "size-full object-cover",
		loading: "lazy",
		onError: () => {
			setFailed(true);
			window.dispatchEvent(new CustomEvent("reelcase:creator-avatar-error", { detail: channel.id }));
		}
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		"aria-hidden": "true",
		children: initials(label)
	});
}
function ProviderGlyph({ kind, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(kind === "youtube" ? Youtube : Twitch, {
		"aria-hidden": "true",
		className: cn("size-3", className)
	});
}
function channelStatus(channel) {
	if (channel.lastProviderFailure) return channel.lastProviderFailure.kind.replaceAll("-", " ");
	if (channel.live) return "live now";
	if (channel.lastCheckedAt) return `checked ${new Date(channel.lastCheckedAt).toLocaleDateString([], {
		month: "short",
		day: "numeric"
	})}`;
	return "not checked yet";
}
/** The large controls do not mount or scan the video library until requested. */
function FollowManager({ kind }) {
	const follows = useLibrary((state) => state.follows);
	const [expanded, setExpanded] = (0, import_react.useState)(false);
	const [initialSelectedId, setInitialSelectedId] = (0, import_react.useState)(null);
	const [sort, setSort] = (0, import_react.useState)("recent");
	if (expanded) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FollowManagerExpanded, {
		kind,
		initialSelectedId,
		sort,
		setSort,
		onCollapse: () => setExpanded(false)
	});
	const scoped = follows.filter((channel) => !kind || channel.kind === kind);
	const heading = kind === "youtube" ? "YouTube creator control" : kind === "twitch" ? "Twitch creator control" : "Creator control";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-7 rounded-xl border border-border bg-surface p-5 shadow-border sm:p-6",
		"aria-label": heading,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
					children: "Following system"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-2xl text-fg",
					children: heading
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [
						scoped.length.toLocaleString(),
						" followed creator",
						scoped.length === 1 ? "" : "s",
						" · open controls to search, sort, pull videos, and manage your list."
					]
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "secondary",
				onClick: () => setExpanded(true),
				"aria-expanded": false,
				"aria-label": `Expand ${heading}`,
				children: "Manage creators"
			})]
		}), scoped.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex flex-wrap gap-2",
			"aria-label": "Quick creator access",
			children: [scoped.slice(0, 8).map((channel) => {
				const label = creatorLabel(channel);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "flex size-11 items-center justify-center overflow-hidden rounded-full border border-border bg-elevated text-xs font-semibold text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
					"aria-label": `Manage ${label}`,
					title: label,
					onClick: () => {
						setInitialSelectedId(channel.id);
						setExpanded(true);
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatorAvatar, {
						channel,
						label
					})
				}, channel.id);
			}), scoped.length > 8 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex min-h-11 items-center px-2 text-xs text-muted",
				children: [
					"+",
					(scoped.length - 8).toLocaleString(),
					" more"
				]
			})]
		})]
	});
}
function FollowManagerExpanded({ kind, initialSelectedId, sort, setSort, onCollapse }) {
	const follows = useLibrary((state) => state.follows);
	const unfollow = useLibrary((state) => state.unfollow);
	const unfollowMany = useLibrary((state) => state.unfollowMany);
	const updateFollowProfiles = useLibrary((state) => state.updateFollowProfiles);
	const refreshFollows = useLibrary((state) => state.refreshFollows);
	const refreshing = useLibrary((state) => state.refreshing);
	const setSource = useLibrary((state) => state.setSource);
	const openPreview = useLibrary((state) => state.openPreview);
	const [query, setQuery] = (0, import_react.useState)("");
	const deferredQuery = (0, import_react.useDeferredValue)(query);
	const [provider, setProvider] = (0, import_react.useState)(kind ?? "all");
	const [visible, setVisible] = (0, import_react.useState)(CREATOR_PAGE_SIZE);
	const attemptedCreatorProfiles = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const [brokenCreatorIds, setBrokenCreatorIds] = (0, import_react.useState)(() => /* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		const note = (event) => {
			const id = event.detail;
			if (id) setBrokenCreatorIds((current) => new Set(current).add(id));
		};
		window.addEventListener("reelcase:creator-avatar-error", note);
		return () => window.removeEventListener("reelcase:creator-avatar-error", note);
	}, []);
	const [selectedId, setSelectedId] = (0, import_react.useState)(initialSelectedId);
	const [feedbackRevision, setFeedbackRevision] = (0, import_react.useState)(0);
	const [selectionMode, setSelectionMode] = (0, import_react.useState)(false);
	const [selectedIds, setSelectedIds] = (0, import_react.useState)([]);
	const [collectionName, setCollectionName] = (0, import_react.useState)("");
	const [collections, setCollections] = (0, import_react.useState)([]);
	const [reviewingRemoval, setReviewingRemoval] = (0, import_react.useState)(false);
	const [reviewVisible, setReviewVisible] = (0, import_react.useState)(PAGE_SIZE);
	const [pullingSelection, setPullingSelection] = (0, import_react.useState)(false);
	const [creatorVideoQuery, setCreatorVideoQuery] = (0, import_react.useState)("");
	const [creatorVideoSort, setCreatorVideoSort] = (0, import_react.useState)("newest");
	const [creatorVideoVisible, setCreatorVideoVisible] = (0, import_react.useState)(24);
	const videos = useLibrary((state) => selectedId || reviewingRemoval ? state.videos : EMPTY_CREATOR_VIDEOS);
	const hiddenVideos = useLibrary((state) => state.hiddenVideos);
	const favorites = useLibrary((state) => state.favorites);
	const likes = useLibrary((state) => state.likes);
	const progress = useLibrary((state) => state.progress);
	const resumeProgress = useLibrary((state) => state.resumeProgress);
	const history = useLibrary((state) => state.history);
	(0, import_react.useEffect)(() => {
		setProvider(kind ?? "all");
		setVisible(CREATOR_PAGE_SIZE);
	}, [kind]);
	(0, import_react.useEffect)(() => {
		setVisible(CREATOR_PAGE_SIZE);
	}, [
		deferredQuery,
		provider,
		sort
	]);
	(0, import_react.useEffect)(() => {
		const sync = () => setFeedbackRevision((revision) => revision + 1);
		window.addEventListener("reelcase:rating-change", sync);
		return () => window.removeEventListener("reelcase:rating-change", sync);
	}, []);
	(0, import_react.useEffect)(() => {
		const sync = () => setCollections(loadCreatorCollections());
		sync();
		window.addEventListener(FOLLOW_COLLECTIONS_CHANGED, sync);
		const syncStorage = (event) => {
			if (event.key === "reelcase.follow-collections.v1") sync();
		};
		window.addEventListener("storage", syncStorage);
		return () => {
			window.removeEventListener(FOLLOW_COLLECTIONS_CHANGED, sync);
			window.removeEventListener("storage", syncStorage);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const followIds = new Set(follows.map((follow) => follow.id));
		setSelectedIds((ids) => ids.filter((id) => followIds.has(id)));
	}, [follows]);
	(0, import_react.useEffect)(() => {
		setReviewVisible(PAGE_SIZE);
	}, [selectedIds]);
	const filtered = (0, import_react.useMemo)(() => {
		const needle = deferredQuery.trim().toLocaleLowerCase();
		const rows = follows.filter((channel) => (!kind || channel.kind === kind) && (provider === "all" || channel.kind === provider)).filter((channel) => !needle || `${creatorLabel(channel)} ${channel.handle}`.toLocaleLowerCase().includes(needle)).map((channel) => {
			const label = creatorLabel(channel);
			return {
				channel,
				label,
				favorite: creatorIsLiked(label),
				rating: getCreatorRating(label),
				checkedAt: channel.kind === "youtube" ? channel.catalogCheckedAt ?? channel.lastCheckedAt ?? 0 : channel.lastCheckedAt ?? 0
			};
		});
		rows.sort((left, right) => {
			const byName = nameCollator.compare(left.label, right.label) || left.channel.id.localeCompare(right.channel.id);
			if (sort === "name") return byName;
			if (sort === "favorite") return Number(right.favorite) - Number(left.favorite) || right.rating - left.rating || byName;
			if (sort === "rating") return right.rating - left.rating || Number(right.favorite) - Number(left.favorite) || byName;
			return right.checkedAt - left.checkedAt || byName;
		});
		return rows.map((row) => row.channel);
	}, [
		deferredQuery,
		feedbackRevision,
		follows,
		kind,
		provider,
		sort
	]);
	const selected = (0, import_react.useMemo)(() => selectedId ? filtered.find((channel) => channel.id === selectedId) ?? null : null, [filtered, selectedId]);
	const shown = filtered.slice(0, visible);
	const missingCreatorIds = shown.filter((channel) => channel.kind === "youtube" && (!channel.thumb || brokenCreatorIds.has(channel.id)) && /^yt:UC[A-Za-z0-9_-]{20,}$/.test(channel.id)).map((channel) => channel.id).join(",");
	(0, import_react.useEffect)(() => {
		const pending = missingCreatorIds.split(",").filter((id) => id && !attemptedCreatorProfiles.current.has(id));
		if (!pending.length) return;
		let cancelled = false;
		(async () => {
			for (let index = 0; index < pending.length && !cancelled; index += 16) {
				const ids = pending.slice(index, index + 16);
				ids.forEach((id) => attemptedCreatorProfiles.current.add(id));
				try {
					const profiles = await youtubeCreatorProfiles({ data: ids });
					if (!cancelled) updateFollowProfiles(profiles);
				} catch {}
				if (index + 16 < pending.length) await new Promise((resolve) => window.setTimeout(resolve, 250));
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [missingCreatorIds, updateFollowProfiles]);
	const selectedName = selected ? creatorLabel(selected) : "";
	const selectedVideos = (0, import_react.useMemo)(() => selected ? videos.filter((video) => !hiddenVideos[video.id] && (video.folderId === selected.id || selected.channelId && video.remote?.channelId === selected.channelId)) : [], [
		hiddenVideos,
		selected,
		videos
	]);
	const selectedVideoStats = (0, import_react.useMemo)(() => {
		const ids = new Set(selectedVideos.map((video) => video.id));
		return {
			favorites: selectedVideos.reduce((count, video) => count + Number(Boolean(favorites[video.id])), 0),
			watched: new Set(history.filter((entry) => ids.has(entry.id)).map((entry) => entry.id)).size
		};
	}, [
		favorites,
		history,
		selectedVideos
	]);
	const filteredCreatorVideos = (0, import_react.useMemo)(() => {
		const needle = creatorVideoQuery.trim().toLocaleLowerCase();
		return selectedVideos.filter((video) => !needle || video.name.toLocaleLowerCase().includes(needle)).sort((a, b) => creatorVideoSort === "title" ? a.name.localeCompare(b.name) : creatorVideoSort === "oldest" ? a.addedAt - b.addedAt : b.addedAt - a.addedAt);
	}, [
		creatorVideoQuery,
		creatorVideoSort,
		selectedVideos
	]);
	const selectedPage = selected?.kind === "youtube" ? selected.channelId ? `https://www.youtube.com/channel/${encodeURIComponent(selected.channelId)}` : selected.handle.startsWith("http") ? selected.handle : `https://www.youtube.com/@${encodeURIComponent(selected.handle.replace(/^@/, ""))}` : selected ? `https://www.twitch.tv/${encodeURIComponent(selected.handle.replace(/^@/, ""))}` : "";
	const selectedRating = selected ? getCreatorRating(selectedName) : 0;
	const selectedFavorite = selected ? creatorIsLiked(selectedName) : false;
	const removalPlan = (0, import_react.useMemo)(() => reviewingRemoval ? planFollowRemoval({
		follows,
		videos,
		favorites,
		likes,
		progress,
		resumeProgress,
		history
	}, selectedIds, exportFeedback()) : null, [
		reviewingRemoval,
		follows,
		videos,
		favorites,
		likes,
		progress,
		resumeProgress,
		history,
		selectedIds
	]);
	const scopedCollections = (0, import_react.useMemo)(() => {
		const scope = new Set(follows.filter((channel) => !kind || channel.kind === kind).map((channel) => channel.id));
		return collections.map((collection) => ({
			...collection,
			followIds: collection.followIds.filter((id) => scope.has(id))
		})).filter((collection) => collection.followIds.length);
	}, [
		collections,
		follows,
		kind
	]);
	const changeFavorite = () => {
		if (!selected) return;
		toggleCreatorLike(selectedName);
		setFeedbackRevision((revision) => revision + 1);
	};
	const rate = (rating) => {
		if (!selected) return;
		setCreatorRating(selectedName, selectedRating === rating ? 0 : rating);
		setFeedbackRevision((revision) => revision + 1);
	};
	const remove = () => {
		if (!selected || !window.confirm(`Remove ${selectedName} from your followed creators? Saved videos and favorites stay in your library.`)) return;
		unfollow(selected.id);
		setSelectedId(null);
	};
	const toggleSelected = (id) => {
		setSelectedIds((ids) => ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]);
		setReviewingRemoval(false);
	};
	const updateCollections = (update) => {
		const next = update(collections);
		setCollections(next);
		saveCreatorCollections(next);
	};
	const saveCollection = () => {
		const name = collectionName.trim();
		if (!name || !selectedIds.length) return;
		const next = {
			id: `collection:${Date.now()}`,
			name: name.slice(0, 48),
			followIds: selectedIds,
			createdAt: Date.now()
		};
		updateCollections((saved) => [...saved.filter((collection) => collection.name.toLocaleLowerCase() !== next.name.toLocaleLowerCase()), next]);
		setCollectionName("");
	};
	const loadCollection = (collection) => {
		const available = new Set(follows.filter((channel) => !kind || channel.kind === kind).map((channel) => channel.id));
		setSelectedIds(collection.followIds.filter((id) => available.has(id)));
		setSelectionMode(true);
		setReviewingRemoval(false);
	};
	const removeCollection = (id) => updateCollections((saved) => saved.filter((collection) => collection.id !== id));
	const removeSelected = () => {
		if (!removalPlan?.channels.length) return;
		unfollowMany(removalPlan.channels.map((row) => row.follow.id));
		setSelectedIds([]);
		setReviewingRemoval(false);
		setSelectedId(null);
	};
	const pullCreators = async (ids) => {
		const requested = new Set(ids);
		const youtubeIds = follows.filter((channel) => requested.has(channel.id) && channel.kind === "youtube").map((channel) => channel.id);
		if (!youtubeIds.length || pullingSelection || refreshing) return;
		setPullingSelection(true);
		try {
			await refreshFollows("youtube", {
				catalog: true,
				channelIds: youtubeIds
			});
		} finally {
			setPullingSelection(false);
		}
	};
	const heading = kind === "youtube" ? "YouTube creator control" : kind === "twitch" ? "Twitch creator control" : "Creator control";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-7 overflow-hidden rounded-xl border border-border bg-surface shadow-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-b border-border bg-elevated/45 p-5 sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col justify-between gap-4 lg:flex-row lg:items-end",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "Following system"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-2xl text-fg",
							children: heading
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 max-w-2xl text-sm text-muted",
							children: kind ? `Search, sort, and act on ${kind === "youtube" ? "YouTube" : "Twitch"} follows without mounting the whole list at once.` : "Search, sort, and act on every followed creator without mounting the whole list at once."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-fg",
									children: filtered.length.toLocaleString()
								}),
								" of ",
								follows.filter((channel) => !kind || channel.kind === kind).length.toLocaleString(),
								" creator",
								follows.length === 1 ? "" : "s"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							variant: "ghost",
							onClick: onCollapse,
							"aria-label": `Collapse ${heading}`,
							children: "Collapse controls"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-col gap-3 lg:flex-row lg:items-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "relative block min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
								"aria-hidden": "true",
								className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: query,
								onChange: (event) => setQuery(event.target.value),
								className: "h-11 pl-10",
								placeholder: "Find a creator or handle",
								"aria-label": "Find a followed creator"
							})]
						}),
						!kind && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							"aria-label": "Filter by service",
							children: [
								"all",
								"youtube",
								"twitch"
							].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: provider === value ? "default" : "secondary",
								onClick: () => setProvider(value),
								children: value === "all" ? "All services" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderGlyph, { kind: value }), value === "youtube" ? "YouTube" : "Twitch"] })
							}, value))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							"aria-label": "Sort followed creators",
							children: [
								"recent",
								"name",
								"favorite",
								"rating"
							].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: sort === value ? "default" : "secondary",
								onClick: () => setSort(value),
								children: value === "recent" ? "Recently checked" : value === "name" ? "A–Z" : value === "favorite" ? "Favorites" : "Rating"
							}, value))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 border-t border-border pt-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									size: "sm",
									variant: selectionMode ? "default" : "secondary",
									onClick: () => {
										setSelectionMode((value) => !value);
										setReviewingRemoval(false);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListChecks, {
										"aria-hidden": "true",
										className: "size-4"
									}), selectionMode ? `Selecting ${selectedIds.length}` : "Select creators"]
								}),
								selectionMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									size: "sm",
									variant: "secondary",
									disabled: !filtered.length,
									onClick: () => {
										const ids = new Set(selectedIds);
										filtered.forEach((channel) => ids.add(channel.id));
										setSelectedIds([...ids]);
										setReviewingRemoval(false);
									},
									children: [
										"Select all ",
										filtered.length.toLocaleString(),
										" matching"
									]
								}),
								selectionMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									size: "sm",
									variant: "ghost",
									onClick: () => {
										setSelectedIds([]);
										setReviewingRemoval(false);
									},
									children: "Clear selection"
								}),
								selectionMode && kind !== "twitch" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									size: "sm",
									disabled: !selectedIds.some((id) => follows.some((channel) => channel.id === id && channel.kind === "youtube")) || pullingSelection || refreshing,
									onClick: () => void pullCreators(selectedIds),
									children: pullingSelection ? "Pulling selected creators…" : `Pull videos · ${selectedIds.filter((id) => follows.some((channel) => channel.id === id && channel.kind === "youtube")).length}`
								}),
								scopedCollections.map((collection) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center rounded-sm bg-bg/45",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										size: "sm",
										variant: "ghost",
										onClick: () => loadCollection(collection),
										children: [
											collection.name,
											" · ",
											collection.followIds.length
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										size: "icon-sm",
										variant: "ghost",
										onClick: () => removeCollection(collection.id),
										"aria-label": `Remove ${collection.name} collection`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
											"aria-hidden": "true",
											className: "size-3.5"
										})
									})]
								}, collection.id))
							]
						}),
						selectionMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid gap-3 rounded-lg bg-bg/45 p-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: collectionName,
									onChange: (event) => setCollectionName(event.target.value),
									className: "h-11",
									placeholder: "Save selected creators as a collection",
									"aria-label": "Collection name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "secondary",
									disabled: !collectionName.trim() || !selectedIds.length,
									onClick: saveCollection,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderPlus, {
										"aria-hidden": "true",
										className: "size-4"
									}), "Save collection"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: reviewingRemoval ? "danger" : "secondary",
									disabled: !selectedIds.length,
									onClick: () => setReviewingRemoval((value) => !value),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
											"aria-hidden": "true",
											className: "size-4"
										}),
										"Review removal",
										selectedIds.length ? ` · ${selectedIds.length}` : ""
									]
								})
							]
						}),
						reviewingRemoval && removalPlan && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 rounded-lg border border-danger/50 bg-danger/10 p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-medium text-fg",
										children: [
											"Review ",
											removalPlan.channels.length,
											" selected creator",
											removalPlan.channels.length === 1 ? "" : "s"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-sm text-muted",
										children: [
											"Removing follows also removes their source folders and ",
											removalPlan.removedRows.toLocaleString(),
											" unprotected catalog rows. ",
											removalPlan.keptRows.toLocaleString(),
											" saved or watched rows stay with favorites, likes, ratings, notes, and playback history."
										]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										size: "icon-sm",
										variant: "ghost",
										onClick: () => setReviewingRemoval(false),
										"aria-label": "Close removal review",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
											"aria-hidden": "true",
											className: "size-4"
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 max-h-64 space-y-1 overflow-y-auto rounded-md bg-bg/50 p-2",
									"aria-label": "Affected creator preview",
									children: removalPlan.channels.slice(0, reviewVisible).map(({ follow, keptRows, removedRows }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-3 rounded-sm px-2 py-1 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "min-w-0 truncate text-fg",
											children: [
												creatorLabel(follow),
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-muted",
													children: ["· ", follow.kind === "youtube" ? "YouTube" : "Twitch"]
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "shrink-0 text-muted",
											children: [
												removedRows,
												" remove · ",
												keptRows,
												" keep"
											]
										})]
									}, follow.id))
								}),
								reviewVisible < removalPlan.channels.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									size: "sm",
									variant: "ghost",
									className: "mt-2",
									onClick: () => setReviewVisible((count) => Math.min(removalPlan.channels.length, count + PAGE_SIZE)),
									children: [
										"Show next ",
										Math.min(PAGE_SIZE, removalPlan.channels.length - reviewVisible),
										" affected creators"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									className: "mt-4",
									variant: "danger",
									disabled: !removalPlan.channels.length,
									onClick: removeSelected,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
											"aria-hidden": "true",
											className: "size-4"
										}),
										"Remove ",
										removalPlan.channels.length,
										" reviewed follows"
									]
								})
							]
						})
					]
				})
			]
		}), !filtered.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "p-6 text-sm text-muted",
			children: query ? "No followed creators match that search." : "No creators are followed here yet. Use the import tools below to add channels."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("grid gap-0", selected && "lg:grid-cols-[minmax(0,1fr)_20rem]"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-5 sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-6 gap-3 sm:grid-cols-8 lg:grid-cols-10 2xl:grid-cols-12",
						children: shown.map((channel) => {
							const label = creatorLabel(channel);
							const favorite = creatorIsLiked(label);
							const rating = getCreatorRating(label);
							const active = selectionMode ? selectedIds.includes(channel.id) : selected?.id === channel.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => selectionMode ? toggleSelected(channel.id) : setSelectedId(active ? null : channel.id),
								"aria-label": `${selectionMode ? "Select" : "Manage"} ${label}`,
								"aria-pressed": active,
								title: label,
								className: cn("group relative flex size-11 items-center justify-center overflow-visible rounded-full border bg-elevated text-sm font-semibold text-fg shadow-border transition-[transform,background-color,border-color] duration-150 hover:-translate-y-0.5 hover:bg-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active ? "border-accent ring-2 ring-accent/40" : "border-border"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex size-full items-center justify-center overflow-hidden rounded-full bg-bg/60",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatorAvatar, {
											channel,
											label
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border border-surface bg-bg text-accent",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderGlyph, { kind: channel.kind })
									}),
									favorite && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-accent text-accent-fg",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
											"aria-hidden": "true",
											className: "size-3 fill-current"
										})
									}),
									!favorite && rating > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-elevated text-accent",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] leading-none",
											children: rating
										})
									})
								]
							}, channel.id);
						})
					}),
					!selected && !selectionMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-xs text-muted",
						children: "Choose a creator icon to see videos and actions. More icons load only when you ask."
					}),
					visible < filtered.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "secondary",
						className: "mt-5",
						onClick: () => setVisible((count) => Math.min(filtered.length, count + CREATOR_PAGE_SIZE)),
						children: [
							"Show ",
							Math.min(CREATOR_PAGE_SIZE, filtered.length - visible),
							" more creators"
						]
					})
				]
			}), selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "border-t border-border bg-elevated/35 p-5 lg:border-t-0 lg:border-l sm:p-6",
				"aria-label": `Manage ${selectedName}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-bg text-sm font-semibold text-fg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatorAvatar, {
								channel: selected,
								label: selectedName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full border border-surface bg-elevated text-accent",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderGlyph, { kind: selected.kind })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-medium text-fg",
								children: selectedName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-xs text-muted",
								children: [
									selected.handle,
									" · ",
									channelStatus(selected)
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 grid gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs leading-5 text-muted",
								children: selected.description || "No channel description supplied yet. Refresh this creator to look for a public profile description."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-2 text-center text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-md bg-bg/55 p-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "block text-lg text-fg",
											children: selectedVideos.length
										}), "videos"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-md bg-bg/55 p-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "block text-lg text-fg",
											children: selectedVideoStats.favorites
										}), "favorites"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-md bg-bg/55 p-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "block text-lg text-fg",
											children: selectedVideoStats.watched
										}), "watched"]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										onClick: () => void pullCreators([selected.id]),
										disabled: refreshing || pullingSelection || selected.kind !== "youtube",
										children: refreshing || pullingSelection ? "Pulling videos…" : "Pull creator videos"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										onClick: () => setSource(selected.id),
										children: "Open creator catalog"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: selectedPage,
										target: "_blank",
										rel: "noreferrer",
										className: "inline-flex min-h-9 items-center gap-1 rounded-md bg-bg/55 px-3 text-xs text-fg",
										children: ["Channel page ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3" })]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs font-medium tracking-wide text-subtle uppercase",
										children: ["Creator videos · ", filteredCreatorVideos.length.toLocaleString()]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										"aria-label": "Sort creator videos",
										value: creatorVideoSort,
										onChange: (event) => setCreatorVideoSort(event.target.value),
										className: "h-8 rounded-md border border-border bg-bg px-2 text-xs text-fg",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "newest",
												children: "Newest"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "oldest",
												children: "Oldest"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "title",
												children: "Title A–Z"
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: creatorVideoQuery,
									onChange: (event) => {
										setCreatorVideoQuery(event.target.value);
										setCreatorVideoVisible(24);
									},
									className: "mb-2 h-9",
									placeholder: "Search this creator’s videos",
									"aria-label": "Search creator videos"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "max-h-72 space-y-1 overflow-y-auto",
									children: [filteredCreatorVideos.slice(0, creatorVideoVisible).map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "block w-full rounded-md bg-bg/55 px-2 py-2 text-left text-xs text-fg hover:text-accent",
										title: video.name,
										onClick: () => openPreview(video.id),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate",
											children: video.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-1 block text-[11px] text-muted",
											children: [
												video.addedAt > 0 && video.addedAt < Date.now() ? new Date(video.addedAt).toLocaleDateString() : "Date unavailable",
												" · ",
												video.duration ? `${Math.round(video.duration / 60)} min` : "runtime unknown"
											]
										})]
									}, video.id)), !filteredCreatorVideos.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "px-2 py-3 text-xs text-muted",
										children: selectedVideos.length ? "No videos match this search." : "No saved videos yet. Pull this creator’s public archive to start the list."
									})]
								}),
								creatorVideoVisible < filteredCreatorVideos.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									size: "sm",
									variant: "ghost",
									className: "mt-2 w-full",
									onClick: () => setCreatorVideoVisible((count) => count + 24),
									children: [
										"Show ",
										Math.min(24, filteredCreatorVideos.length - creatorVideoVisible),
										" more"
									]
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								variant: selectedFavorite ? "default" : "secondary",
								onClick: changeFavorite,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
									"aria-hidden": "true",
									className: cn("size-4", selectedFavorite && "fill-current")
								}), selectedFavorite ? "Creator favorite" : "Favorite creator"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-2 text-xs font-medium tracking-wide text-subtle uppercase",
									children: "Creator rating"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex gap-1",
									"aria-label": `Rate ${selectedName}`,
									children: [
										1,
										2,
										3,
										4,
										5
									].map((rating) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => rate(rating),
										className: "flex size-11 items-center justify-center rounded-md text-accent hover:bg-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
										"aria-label": `${rating} star${rating === 1 ? "" : "s"}`,
										"aria-pressed": selectedRating === rating,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
											"aria-hidden": "true",
											className: cn("size-5", rating <= selectedRating && "fill-current")
										})
									}, rating))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted",
									children: selectedRating ? `${selectedRating} of 5 stars` : "Not rated"
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								variant: "danger",
								onClick: remove,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
									"aria-hidden": "true",
									className: "size-4"
								}), "Remove following"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 border-t border-border pt-4 text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, {
								"aria-hidden": "true",
								className: "size-3.5 text-accent"
							}), selected.live ? "Live status is active." : "Follow remains locally stored."]
						}), selected.cache && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2",
							children: [
								selected.cache.scope === "catalog" ? "Focused catalog" : selected.cache.scope === "feed" ? "Routine feed" : "No retained",
								" cache · ",
								Math.round(selected.cache.hits / Math.max(1, selected.cache.hits + selected.cache.misses) * 100),
								"% hit rate"
							]
						})]
					})
				]
			})]
		})]
	});
}
var YT_FOLDER_ID = "youtube:featured";
function ytFilm(opts) {
	const videoId = opts.id;
	return {
		id: `yt:${videoId}`,
		folderId: YT_FOLDER_ID,
		name: opts.name,
		path: `youtube/${opts.name}`,
		extension: "yt",
		mime: "video/youtube",
		size: 0,
		duration: opts.duration,
		addedAt: 20 + opts.year,
		isSample: true,
		year: opts.year,
		genre: opts.genre,
		tagline: opts.tagline,
		poster: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
		src: `https://www.youtube.com/embed/${videoId}`,
		remote: {
			kind: "youtube",
			videoId,
			channelName: opts.channel,
			embedUrl: `https://www.youtube.com/embed/${videoId}`,
			watchUrl: `https://www.youtube.com/watch?v=${videoId}`
		}
	};
}
ytFilm({
	id: "aqz-KE-bpKQ",
	name: "Big Buck Bunny",
	year: 2008,
	duration: 596,
	genre: "Animation",
	tagline: "An open movie from the Blender Foundation.",
	channel: "Blender"
}), ytFilm({
	id: "Y-rmzh0PI3c",
	name: "Cosmos Laundromat",
	year: 2015,
	duration: 720,
	genre: "Fantasy",
	tagline: "A down-on-his-luck sheep, and a deal.",
	channel: "Blender"
}), ytFilm({
	id: "R6MlUcmOul8",
	name: "Tears of Steel",
	year: 2012,
	duration: 734,
	genre: "Sci-Fi",
	tagline: "Amsterdam, after the machines.",
	channel: "Blender"
}), ytFilm({
	id: "UXqq0ZvbOnk",
	name: "Charge",
	year: 2022,
	duration: 720,
	genre: "Sci-Fi",
	tagline: "A Blender Studio open movie.",
	channel: "Blender Studio"
}), ytFilm({
	id: "eRsGyueVLvQ",
	name: "Elephants Dream",
	year: 2006,
	duration: 650,
	genre: "Sci-Fi",
	tagline: "The first Blender open movie.",
	channel: "Blender"
}), ytFilm({
	id: "YE7VzlLtp-4",
	name: "Sintel",
	year: 2010,
	duration: 888,
	genre: "Fantasy",
	tagline: "An open adventure from Blender.",
	channel: "Blender"
}), ytFilm({
	id: "XCejtdKK40o",
	name: "Caminandes",
	year: 2013,
	duration: 120,
	genre: "Animation",
	tagline: "A short open-film journey.",
	channel: "Blender"
}), ytFilm({
	id: "mN0zPOpADL4",
	name: "Agent 327",
	year: 2017,
	duration: 210,
	genre: "Animation",
	tagline: "A Blender Studio open project.",
	channel: "Blender Studio"
});
/**
* A small, deterministic look-ahead for the shared Hub code boundary.
*
* Hub desks currently ship in one lazy module. Keeping the destination name
* here makes the scheduling decision explainable and leaves room for later
* per-desk splitting without changing the caller's interaction contract.
*/
var NEXT_LIKELY_HUB = {
	home: "anime",
	movies: "anime",
	anime: "genres",
	genres: "photos",
	youtube: "photos",
	twitch: "photos",
	live: "photos",
	favorites: "photos",
	continue: "photos",
	history: "photos",
	adults: "photos",
	"adult-fetishes": "photos",
	photos: "spotify",
	spotify: "prints",
	prints: "games",
	games: "shop",
	shop: "streaming",
	streaming: "watch-room",
	"watch-room": "connection",
	connection: "find-phone",
	"find-phone": "social",
	social: "assistant",
	assistant: "mission-plan",
	"mission-plan": "settings",
	settings: "stats"
};
/** Return one adjacent Hub destination, never a speculative set of routes. */
function nextLikelyHub(sourceId) {
	return NEXT_LIKELY_HUB[sourceId] ?? null;
}
/**
* Warm code only when it is polite to do so. Unlike visible-image loading,
* this background fetch has no user-visible priority and should not contend
* with a weak connection, a low-memory device, or the current input frame.
*/
function shouldWarmHubRoute(hints) {
	if (!hints.visible || hints.saveData || hints.inputPending) return false;
	if (typeof hints.deviceMemory === "number" && hints.deviceMemory <= 2) return false;
	return !/^(?:slow-2g|2g|3g)$/i.test(hints.effectiveType?.trim() ?? "");
}
/** Sort order used by the shelf: a negative value means left ranks first. */
function compareRanked(left, right) {
	return right.score - left.score || right.video.addedAt - left.video.addedAt || left.shuffle - right.shuffle;
}
/** Keep only the requested best items per creator in a worst-first heap. */
function keepCreatorCandidate(bucket, row, max) {
	if (bucket.length < max) {
		bucket.push(row);
		let child = bucket.length - 1;
		while (child > 0) {
			const parent = Math.floor((child - 1) / 2);
			if (compareRanked(bucket[parent], bucket[child]) >= 0) break;
			[bucket[parent], bucket[child]] = [bucket[child], bucket[parent]];
			child = parent;
		}
		return;
	}
	if (compareRanked(row, bucket[0]) >= 0) return;
	bucket[0] = row;
	let parent = 0;
	while (true) {
		const left = parent * 2 + 1;
		if (left >= bucket.length) break;
		const right = left + 1;
		const worseChild = right < bucket.length && compareRanked(bucket[left], bucket[right]) < 0 ? right : left;
		if (compareRanked(bucket[parent], bucket[worseChild]) >= 0) break;
		[bucket[parent], bucket[worseChild]] = [bucket[worseChild], bucket[parent]];
		parent = worseChild;
	}
}
/** Personalizes from explicit feedback and observed viewing, then interleaves
* creators so a deep archive from one prolific channel cannot fill the shelf. */
function rankYoutubeRecommendations(videos, taste) {
	const max = Math.max(0, Math.floor(taste.limit ?? videos.length));
	if (!max || !videos.length) return [];
	const now = taste.now ?? Date.now();
	const watchedAt = /* @__PURE__ */ new Map();
	for (const entry of taste.history) watchedAt.set(entry.id, Math.max(watchedAt.get(entry.id) ?? 0, entry.at));
	const activeCreatorWatch = /* @__PURE__ */ new Map();
	const latestWatchedPublishAt = /* @__PURE__ */ new Map();
	const tagEvidence = /* @__PURE__ */ new Map();
	const creatorAffinity = /* @__PURE__ */ new Map();
	const byId = new Map(videos.map((video) => [video.id, video]));
	for (const [id, at] of watchedAt) {
		const video = byId.get(id);
		const creator = video?.remote?.channelName?.trim().toLowerCase();
		if (creator && now - at < 15552e6) {
			activeCreatorWatch.set(creator, (activeCreatorWatch.get(creator) ?? 0) + (now - at < 2592e6 ? 2 : 1));
			latestWatchedPublishAt.set(creator, Math.max(latestWatchedPublishAt.get(creator) ?? 0, video?.addedAt ?? 0));
		}
	}
	for (const video of videos) {
		const rating = taste.ratingOf(video.id);
		watchedAt.has(video.id) || taste.viewCounts[video.id];
		const evidence = (rating === 1 ? -3 : Math.max(taste.ratingPreference(rating), taste.favorites[video.id] ? 2 : 0, taste.likes[video.id] ? 1 : 0)) + Math.min(2, taste.watchScore(video.id) / 4 + Math.log2(1 + (taste.viewCounts[video.id] ?? 0)) * .35);
		for (const raw of taste.tags[video.id] ?? []) {
			const tag = raw.trim().toLowerCase();
			if (!tag || tag.length < 3) continue;
			if (evidence) {
				const row = tagEvidence.get(tag) ?? {
					total: 0,
					count: 0
				};
				row.total += evidence;
				row.count += 1;
				tagEvidence.set(tag, row);
			}
		}
		const creator = video.remote?.channelName?.trim().toLowerCase();
		if (creator) creatorAffinity.set(creator, (creatorAffinity.get(creator) ?? 0) + evidence / 5);
	}
	const buckets = /* @__PURE__ */ new Map();
	for (const video of videos) {
		if (video.remote?.kind !== "youtube" || video.remote.live) continue;
		const creatorLabel = video.remote?.channelName?.trim() ?? "";
		const creator = creatorLabel.toLowerCase();
		const rating = taste.ratingOf(video.id);
		const watched = watchedAt.has(video.id) || (taste.viewCounts[video.id] ?? 0) > 0;
		const tags = (taste.tags[video.id] ?? []).map((tag) => tag.trim().toLowerCase()).filter((tag) => tag.length >= 3);
		const tagScore = tags.reduce((sum, tag) => {
			const row = tagEvidence.get(tag);
			return sum + (row ? row.total / (row.count + 2) : 0);
		}, 0) / Math.max(tags.length, 1);
		const explicitTagScore = tags.reduce((sum, tag) => sum + (taste.tagIsLiked(tag) ? 12 : taste.tagHasHeartHistory(tag) ? -5 : 0), 0);
		const creatorWatch = activeCreatorWatch.get(creator) ?? 0;
		const explicitCreator = taste.creatorIsLiked(creatorLabel) ? 14 : 0;
		const creatorScore = creatorAffinity.get(creator) ?? 0;
		const row = {
			video,
			score: tagScore * 10 + creatorScore * 2.5 + Math.min(24, creatorWatch * 7) + taste.ratingPreference(taste.creatorRating(creatorLabel)) * 3 + explicitCreator + explicitTagScore + (watched ? -28 : 10) + (creatorWatch && video.addedAt < (latestWatchedPublishAt.get(creator) ?? 0) ? Math.min(10, Math.log2(1 + ((latestWatchedPublishAt.get(creator) ?? 0) - video.addedAt) / 864e5) * 2) : 0) + (rating === 1 ? -50 : 0) + (taste.favorites[video.id] ? -8 : 0) + (taste.likes[video.id] ? -5 : 0) + (video.addedAt > now - 7776e6 ? 2 : 0),
			creator: creator || `unknown:${video.id}`,
			shuffle: taste.shuffle?.(video.id) ?? 0
		};
		const bucket = buckets.get(row.creator) ?? [];
		keepCreatorCandidate(bucket, row, max);
		if (!buckets.has(row.creator)) buckets.set(row.creator, bucket);
	}
	for (const bucket of buckets.values()) bucket.sort(compareRanked);
	const orderedCreators = [...buckets.entries()].sort((a, b) => (b[1][0]?.score ?? 0) - (a[1][0]?.score ?? 0) || a[0].localeCompare(b[0])).map(([creator]) => creator);
	const result = [];
	while (result.length < max && orderedCreators.length) {
		const remaining = [];
		for (const creator of orderedCreators) {
			const item = buckets.get(creator)?.shift();
			if (item) result.push(item.video);
			if (buckets.get(creator)?.length) remaining.push(creator);
			if (result.length >= max) break;
		}
		orderedCreators.splice(0, orderedCreators.length, ...remaining);
	}
	return result;
}
function isTwitchClip(video) {
	return video.remote?.kind === "twitch" && !video.remote.live && (video.extension === "clip" || video.id.startsWith("tw:c:") || (video.duration ?? 0) > 0 && (video.duration ?? 0) <= 120);
}
function rank(id, seed) {
	let hash = seed ^ 2166136261;
	for (let i = 0; i < id.length; i++) hash = Math.imul(hash ^ id.charCodeAt(i), 16777619);
	return hash >>> 0;
}
/** O(catalog size) scan, bounded candidates, and round-robin creator exposure. */
function sampleTwitchClips(videos, seed, creator = "all", limit = 48) {
	const perCreator = /* @__PURE__ */ new Map();
	const cap = creator === "all" ? Math.min(limit, 12) : limit;
	for (const video of videos) {
		if (!isTwitchClip(video)) continue;
		const name = video.remote?.channelName?.trim() || "Unknown creator";
		if (creator !== "all" && creator !== name) continue;
		const rows = perCreator.get(name) ?? [];
		const score = rank(video.id, seed);
		if (rows.length < cap) rows.push({
			video,
			rank: score
		});
		else {
			let largest = 0;
			for (let i = 1; i < rows.length; i++) if (rows[i].rank > rows[largest].rank) largest = i;
			if (score < rows[largest].rank) rows[largest] = {
				video,
				rank: score
			};
		}
		perCreator.set(name, rows);
	}
	const groups = [...perCreator.entries()].sort(([a], [b]) => rank(a, seed) - rank(b, seed)).map(([, rows]) => rows.sort((a, b) => a.rank - b.rank).map((row) => row.video));
	const out = [];
	for (let depth = 0; out.length < limit && groups.some((group) => depth < group.length); depth++) for (const group of groups) {
		if (group[depth]) out.push(group[depth]);
		if (out.length >= limit) break;
	}
	return out;
}
/** Return the best few rows without retaining or sorting a huge candidate list.
* `compare(a, b) < 0` means a should appear before b. */
function takeBestMapped(items, limit, project, compare) {
	if (limit <= 0) return [];
	const heap = [];
	for (const item of items) {
		const row = project(item);
		if (row == null) continue;
		if (heap.length < limit) {
			heap.push(row);
			let child = heap.length - 1;
			while (child > 0) {
				const parent = Math.floor((child - 1) / 2);
				if (compare(heap[parent], heap[child]) >= 0) break;
				[heap[parent], heap[child]] = [heap[child], heap[parent]];
				child = parent;
			}
			continue;
		}
		if (compare(row, heap[0]) >= 0) continue;
		heap[0] = row;
		let parent = 0;
		while (true) {
			const left = parent * 2 + 1;
			if (left >= heap.length) break;
			const right = left + 1;
			const worse = right < heap.length && compare(heap[right], heap[left]) > 0 ? right : left;
			if (compare(heap[parent], heap[worse]) >= 0) break;
			[heap[parent], heap[worse]] = [heap[worse], heap[parent]];
			parent = worse;
		}
	}
	return heap.sort(compare);
}
function* concatIterables(...sources) {
	for (const source of sources) yield* source;
}
var adultModulePromise;
var loadAdult = () => adultModulePromise ??= import("./adult-panel-s4q3TF2o.mjs").catch((error) => {
	adultModulePromise = void 0;
	throw error;
});
var AdultPanel = (0, import_react.lazy)(async () => ({ default: (await loadAdult()).AdultPanel }));
var AdultFetishExplorer = (0, import_react.lazy)(async () => ({ default: (await loadAdult()).AdultFetishExplorer }));
var Player = (0, import_react.lazy)(async () => ({ default: (await import("./player-BHgiGji4.mjs")).Player }));
var PreVideo = (0, import_react.lazy)(async () => ({ default: (await import("./pre-video-DkSg26ay.mjs")).PreVideo }));
var AiGuide = (0, import_react.lazy)(async () => ({ default: (await import("./ai-guide-yHKMDN4L.mjs")).AiGuide }));
var hubModulePromise;
var loadHub = () => {
	if (!hubModulePromise) hubModulePromise = import("./hub-sections-tXlbEosy.mjs").then((n) => n.t).catch((error) => {
		hubModulePromise = void 0;
		throw error;
	});
	return hubModulePromise;
};
var hubSection = (name) => (0, import_react.lazy)(async () => ({ default: (await loadHub())[name] }));
var AnimeSection = hubSection("AnimeSection");
var GamesSection = hubSection("GamesSection");
var FindPhoneSection = hubSection("FindPhoneSection");
var GenreSection = hubSection("GenreSection");
var LanConnectionSection = hubSection("LanConnectionSection");
var MissionPlanSection = hubSection("MissionPlanSection");
var PhotosSection = hubSection("PhotosSection");
var PrivateWebShortcuts = hubSection("PrivateWebShortcuts");
var PrintsSection = hubSection("PrintsSection");
var SettingsSection = hubSection("SettingsSection");
var StatsSection = hubSection("StatsSection");
var ShopSection = hubSection("ShopSection");
var SocialSection = hubSection("SocialSection");
var SpotifySection = hubSection("SpotifySection");
var StreamingSection = hubSection("StreamingSection");
var WatchRoomSection = hubSection("WatchRoomSection");
var EMPTY_ADULT_VIDEOS = [];
var EMPTY_PROVIDER_VIDEOS = [];
var YOUTUBE_SWEEP_KEY = "reelcase.youtube-catalog-sweep.v1";
var youtubeSweepLastAttemptAt = 0;
var twitchLastAttemptAt = 0;
var youtubeRecentLastAttemptAt = 0;
var YOUTUBE_LIVE_KEY = "reelcase.youtube-live-check.v1";
var youtubeLiveLastAttemptAt = 0;
var pullProviderLabel = {
	youtube: "YouTube",
	twitch: "Twitch",
	adult: "Adult sources",
	photos: "Photo sources",
	multi: "Multiple sources"
};
function YoutubeFirstClickStatus() {
	(0, import_react.useSyncExternalStore)(subscribeYoutubeTrace, getYoutubeTraceRevision, () => 0);
	const trace = getYoutubeFirstClickTrace();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-t border-border px-5 py-3 text-xs leading-5 text-muted sm:px-7",
		"aria-label": "YouTube first-click timing",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-medium text-fg",
			children: "First-click timing · local only"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: !trace ? "Open YouTube from another section to record a timing sample." : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			trace.railReadyMs === void 0 ? "Waiting for the first available upload" : `${trace.railReadyMs}ms to ${trace.railCards} usable cards`,
			` · selector ${trace.selectorMs ?? "…"}ms work / ${trace.selectorReadyMs ?? "…"}ms ready · ${trace.catalogRows ?? 0} cached`,
			` · artwork ${trace.artwork === "pending" ? "pending" : trace.artwork === "loaded" ? `${trace.artworkWaitMs ?? 0}ms later` : "deferred or unavailable"}`,
			` · provider ${trace.provider === "idle" ? "not needed" : `${trace.providerOverlapMs}ms overlap`}`
		] }) })]
	});
}
function PullStatusBanner() {
	const activity = useLibrary((state) => state.pullActivity);
	const latest = useLibrary((state) => state.pullHistory[0] ?? null);
	const [dismissed, setDismissed] = (0, import_react.useState)(null);
	const id = activity?.id ?? latest?.id;
	if (!id || dismissed === id) return null;
	const running = Boolean(activity);
	const item = activity ?? latest;
	const label = pullProviderLabel[item.provider];
	const percent = running ? Math.min(100, Math.round(item.done / Math.max(1, item.total) * 100)) : 100;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "mb-5 rounded-lg border border-border bg-elevated px-4 py-3 shadow-border",
		role: running ? "status" : "region",
		"aria-label": "Latest pull status",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [
				running ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					"aria-hidden": "true",
					className: "mt-0.5 size-4 shrink-0 animate-spin text-accent"
				}) : latest?.status === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
					"aria-hidden": "true",
					className: "mt-0.5 size-4 shrink-0 text-danger"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
					"aria-hidden": "true",
					className: "mt-0.5 size-4 shrink-0 text-accent"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-fg",
							children: running ? `Pulling ${label} · ${item.action.toLocaleLowerCase()}` : `${label} pull ${latest?.status === "failed" ? "failed" : latest?.status === "partial" ? "finished with issues" : "complete"}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs leading-5 text-muted",
							children: running ? `${item.done.toLocaleString()} of ${item.total.toLocaleString()} targets checked · ${item.received.toLocaleString()} videos returned · ${item.added.toLocaleString()} new · ${item.failed.toLocaleString()} failed${item.targets[item.done] ? ` · Now: ${item.targets[item.done]}` : ""}` : `${latest?.done.toLocaleString() ?? 0} / ${latest?.total.toLocaleString() ?? 0} targets · ${latest?.received.toLocaleString() ?? 0} returned · ${latest?.added.toLocaleString() ?? 0} new · ${latest?.failed.toLocaleString() ?? 0} failed · ${latest ? new Date(latest.finishedAt).toLocaleTimeString([], {
								hour: "numeric",
								minute: "2-digit"
							}) : ""}`
						}),
						running && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 h-1 overflow-hidden rounded-full bg-bg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full rounded-full bg-accent transition-[width] duration-300",
								style: { width: `${percent}%` }
							})
						}),
						!running && latest?.errors?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
							className: "mt-2 text-xs text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
								className: "cursor-pointer",
								children: [
									"Show ",
									latest.errors.length,
									" failure detail",
									latest.errors.length === 1 ? "" : "s"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 space-y-1",
								children: latest.errors.map((error, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: error }, `${index}:${error}`))
							})]
						}) : null
					]
				}),
				!running && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					onClick: () => setDismissed(id),
					"aria-label": "Dismiss pull result",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
						"aria-hidden": "true",
						className: "size-4"
					})
				})
			]
		})
	});
}
function canonicalAdultTag(raw) {
	const normalized = raw.trim().replace(/^#+/, "").toLowerCase().replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
	return !normalized || normalized === "all" ? "All" : normalized;
}
function shuffleRank(id, seed) {
	let value = seed >>> 0;
	for (let index = 0; index < id.length; index += 1) value = Math.imul(value ^ id.charCodeAt(index), 73244475);
	return value >>> 0;
}
/**
* Adult catalog quality still leads, but each rail gets a time-stamped shuffle
* inside a bounded rank window. That rotates fresh cards into view without
* letting low-signal results displace the useful part of the catalog.
*/
function rotateAdultRail(items, rail, seed, limit = items.length) {
	return items.slice(0, limit + 28).map((video, index) => ({
		video,
		rank: index + shuffleRank(`${rail}:${video.id}`, seed) / 4294967295 * 28
	})).sort((a, b) => a.rank - b.rank).slice(0, limit).map(({ video }) => video);
}
function diversifyCreators(items, limit = 48) {
	const groups = /* @__PURE__ */ new Map();
	const seenIds = /* @__PURE__ */ new Set();
	for (const item of items) {
		if (seenIds.has(item.id)) continue;
		seenIds.add(item.id);
		const key = item.remote?.channelName?.trim().toLowerCase() || "local";
		const group = groups.get(key) ?? [];
		group.push(item);
		groups.set(key, group);
	}
	const rows = [...groups.values()];
	const result = [];
	for (let index = 0; result.length < limit; index += 1) {
		let added = false;
		for (const group of rows) {
			const item = group[index];
			if (!item) continue;
			result.push(item);
			added = true;
			if (result.length >= limit) break;
		}
		if (!added) break;
	}
	return result;
}
function isExcludedDemoVideo(video) {
	return Boolean(video.isSample) || /\bblender\b/i.test(`${video.name} ${video.remote?.channelName ?? ""} ${video.tagline ?? ""}`);
}
function isOfflineChannelCard(video) {
	if (video.remote?.kind !== "twitch" || video.remote.live) return false;
	return /^offline\b/i.test(video.tagline ?? "") || video.extension === "live" || /\/(?:live|channel)$/i.test(video.path ?? "") || /:(?:live|channel)$/i.test(video.id ?? "");
}
var isTasteTag = isTopicTag;
function LibraryApp() {
	const [liveStateClock, setLiveStateClock] = (0, import_react.useState)(() => Date.now());
	(0, import_react.useEffect)(() => {
		const timer = window.setInterval(() => setLiveStateClock(Date.now()), 3e4);
		return () => window.clearInterval(timer);
	}, []);
	(0, import_react.useEffect)(() => {
		const announce = () => {
			if (document.visibilityState === "visible") announceNetworkPresence().catch(() => void 0);
		};
		announce();
		const timer = window.setInterval(announce, 25e3);
		document.addEventListener("visibilitychange", announce);
		return () => {
			window.clearInterval(timer);
			document.removeEventListener("visibilitychange", announce);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const failed = () => toast.error("Library changes could not be saved. Browser storage is unavailable or full.");
		window.addEventListener("reelcase:save-error", failed);
		return () => window.removeEventListener("reelcase:save-error", failed);
	}, []);
	const dirInputRef = (0, import_react.useRef)(null);
	const fileInputRef = (0, import_react.useRef)(null);
	const pendingAdult = (0, import_react.useRef)(false);
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const [movieShuffle, setMovieShuffle] = (0, import_react.useState)(() => Date.now());
	const [homePickShuffle, setHomePickShuffle] = (0, import_react.useState)(() => Date.now());
	const [ratingRevision, setRatingRevision] = (0, import_react.useState)(0);
	const [tagHeartRevision, setTagHeartRevision] = (0, import_react.useState)(0);
	const [adultTag, setAdultTag] = (0, import_react.useState)("All");
	const [adultSource, setAdultSource] = (0, import_react.useState)("all");
	const [adultView, setAdultView] = (0, import_react.useState)("all");
	const [adultArtworkOnly, setAdultArtworkOnly] = (0, import_react.useState)(true);
	const [adultRailLimit, setAdultRailLimit] = (0, import_react.useState)(24);
	const [adultTagQuery, setAdultTagQuery] = (0, import_react.useState)("");
	/** Visible ranked tag chips — starts small; Show more adds a page, never dumps hundreds. */
	const [adultTagVisibleCount, setAdultTagVisibleCount] = (0, import_react.useState)(10);
	const [adultExplorerTag, setAdultExplorerTag] = (0, import_react.useState)("");
	const [adultRailSeed, setAdultRailSeed] = (0, import_react.useState)(() => Date.now() >>> 0);
	const [adultSort, setAdultSort] = (0, import_react.useState)("ranked");
	const [twitchSort, setTwitchSort] = (0, import_react.useState)("live");
	const [twitchFilter, setTwitchFilter] = (0, import_react.useState)("all");
	const [twitchClipSeed, setTwitchClipSeed] = (0, import_react.useState)(1);
	const [twitchClipCreator, setTwitchClipCreator] = (0, import_react.useState)("all");
	const [youtubeTagFilter, setYoutubeTagFilter] = (0, import_react.useState)("all");
	const [youtubeExploreVisible, setYoutubeExploreVisible] = (0, import_react.useState)(false);
	const [youtubeDeepVisible, setYoutubeDeepVisible] = (0, import_react.useState)(false);
	const [youtubeHealthVisible, setYoutubeHealthVisible] = (0, import_react.useState)(false);
	const [youtubeHealthLimit] = (0, import_react.useState)(48);
	const [adultDeepVisible, setAdultDeepVisible] = (0, import_react.useState)(false);
	const archiveQueueRef = (0, import_react.useRef)([]);
	const archiveQueueBusyRef = (0, import_react.useRef)(false);
	const [archiveQueued, setArchiveQueued] = (0, import_react.useState)([]);
	const [twitchTagFilter, setTwitchTagFilter] = (0, import_react.useState)("all");
	const [historyWindow, setHistoryWindow] = (0, import_react.useState)("all");
	const [historySource, setHistorySource] = (0, import_react.useState)("all");
	const [historyRetention, setHistoryRetention] = (0, import_react.useState)("forever");
	const [historyImportNote, setHistoryImportNote] = (0, import_react.useState)("");
	const [homeExpanded, setHomeExpanded] = (0, import_react.useState)(false);
	const [homeRecommendationsReady, setHomeRecommendationsReady] = (0, import_react.useState)(false);
	const [invitedToTheater, setInvitedToTheater] = (0, import_react.useState)(false);
	const [remoteRefreshMs, setRemoteRefreshMs] = (0, import_react.useState)(() => {
		try {
			const seconds = Number(localStorage.getItem("reelcase.twitch-refresh-seconds") ?? "30");
			return [
				15,
				30,
				60,
				120,
				300
			].includes(seconds) ? seconds * 1e3 : 3e4;
		} catch {
			return 3e4;
		}
	});
	const restoreFolders = useLibrary((s) => s.restoreFolders);
	const openVideo = useLibrary((s) => s.openVideo);
	const addFolder = useLibrary((s) => s.addFolder);
	const ingestFromInput = useLibrary((s) => s.ingestFromInput);
	const ingestDrop = useLibrary((s) => s.ingestDrop);
	const clearHistory = useLibrary((s) => s.clearHistory);
	const pruneHistory = useLibrary((s) => s.pruneHistory);
	const folders = useLibrary((s) => s.folders);
	const catalogVideos = useLibrary((s) => s.videos);
	const hiddenVideos = useLibrary((s) => s.hiddenVideos);
	const sourceId = useLibrary((s) => s.sourceId);
	const setSource = useLibrary((s) => s.setSource);
	const hydrated = useLibrary((s) => s.hydrated);
	const refreshing = useLibrary((s) => s.refreshing);
	const query = useLibrary((s) => s.query);
	const searchResult = useLibrary((s) => s.searchResult);
	const searchPending = useLibrary((s) => Boolean(s.query.trim()) && (!s.searchResult || s.searchResult.query !== s.query.trim().toLowerCase() || s.searchResult.videos !== s.videos || s.searchResult.tags !== s.tags || s.searchResult.categories !== s.categories));
	const setQuery = useLibrary((s) => s.setQuery);
	const showHiddenAdult = useLibrary((s) => s.showHiddenAdult);
	const setShowHiddenAdult = useLibrary((s) => s.setShowHiddenAdult);
	const applyAdultTag = (0, import_react.useCallback)((raw) => {
		const tag = canonicalAdultTag(raw);
		setAdultTag(tag);
		setAdultSource(tag.startsWith("source-") ? tag.slice(7) || "all" : "all");
		setAdultView("all");
		setAdultArtworkOnly(false);
		setAdultTagVisibleCount(10);
		setQuery("");
		setSource("adults");
	}, [setQuery, setSource]);
	const scanning = useLibrary((s) => s.scanning);
	const activeId = useLibrary((s) => s.activeId);
	const previewId = useLibrary((s) => s.previewId);
	const history = useLibrary((s) => s.history);
	const videos = useLibrary(useShallow(selectVisible));
	const continueVideos = useLibrary(useShallow((s) => selectContinue(s, false)));
	const favoriteVideos = useLibrary(useShallow((s) => selectFavorites(s, false)));
	const historyVideos = useLibrary(useShallow((s) => selectHistory(s, false)));
	const historyLastDay = (0, import_react.useMemo)(() => history.filter((entry) => entry.at > Date.now() - 864e5).length, [history]);
	const classics = useLibrary(useShallow(selectClassics));
	const featured = useLibrary((s) => s.sourceId === "movies" ? selectFeatured(s, false) : void 0);
	const youtubeSelectorWork = (0, import_react.useRef)(0);
	const youtubeSelectorDoneAt = (0, import_react.useRef)(0);
	const youtubeCatalog = useLibrary(useShallow((state) => {
		if (state.sourceId !== "home" && state.sourceId !== "youtube") return EMPTY_PROVIDER_VIDEOS;
		const started = typeof performance === "undefined" ? 0 : performance.now();
		const selected = selectYoutube(state);
		if (state.sourceId === "youtube" && started) {
			const finished = performance.now();
			youtubeSelectorWork.current = Math.max(youtubeSelectorWork.current, finished - started);
			youtubeSelectorDoneAt.current = finished;
		}
		return selected;
	}));
	(0, import_react.useEffect)(() => {
		if (sourceId !== "youtube") {
			youtubeSelectorWork.current = 0;
			youtubeSelectorDoneAt.current = 0;
			return;
		}
		markYoutubeSelectorReady(youtubeCatalog.length, youtubeSelectorWork.current, youtubeSelectorDoneAt.current || void 0);
		youtubeSelectorWork.current = 0;
		youtubeSelectorDoneAt.current = 0;
	}, [sourceId, youtubeCatalog]);
	const youtubeVideos = (0, import_react.useMemo)(() => youtubeCatalog.filter((video) => !isExcludedDemoVideo(video)), [youtubeCatalog]);
	const newestYoutube = youtubeVideos;
	const youtubeCreatorShelves = (0, import_react.useMemo)(() => {
		if (sourceId !== "youtube" || !youtubeExploreVisible || !youtubeDeepVisible) return [];
		const groups = /* @__PURE__ */ new Map();
		for (const video of newestYoutube) {
			const creator = video.remote?.channelName;
			if (!creator || !groups.has(creator) && groups.size >= 16) continue;
			const group = groups.get(creator) ?? [];
			group.push(video);
			groups.set(creator, group);
		}
		return [...groups].map(([creator, videos]) => ({
			creator,
			videos
		}));
	}, [
		newestYoutube,
		sourceId,
		youtubeDeepVisible,
		youtubeExploreVisible
	]);
	const twitchVideos = useLibrary(useShallow((state) => state.sourceId === "home" || state.sourceId === "twitch" ? selectTwitch(state) : EMPTY_PROVIDER_VIDEOS));
	const newThisWeek = (0, import_react.useMemo)(() => {
		if (sourceId !== "home" || !homeRecommendationsReady) return [];
		const now = Date.now();
		return takeBestMapped(concatIterables(youtubeVideos, twitchVideos), 160, (video) => video.remote && !isOfflineChannelCard(video) && now - video.addedAt >= -3e5 && now - video.addedAt < 6048e5 ? video : null, (a, b) => b.addedAt - a.addedAt || a.id.localeCompare(b.id));
	}, [
		homeRecommendationsReady,
		sourceId,
		twitchVideos,
		youtubeVideos
	]);
	const liveVideos = useLibrary(useShallow(selectLive));
	const currentLiveVideos = (0, import_react.useMemo)(() => liveVideos.filter((video) => hasFreshRemoteLiveState(video, Math.max(Date.now(), liveStateClock), LIBRARY_LIMITS.twitchLiveStateFreshnessMs, LIBRARY_LIMITS.youtubeLiveStateFreshnessMs)), [liveStateClock, liveVideos]);
	const adultContinue = useLibrary(useShallow((s) => selectContinue(s, true)));
	const adultFavorites = useLibrary(useShallow((s) => selectFavorites(s, true)));
	const adultHistory = useLibrary(useShallow((s) => selectHistory(s, true)));
	const adultRemoteVideos = useLibrary(useShallow(selectAdultRemote));
	const cameCounts = useLibrary((s) => s.cameCounts);
	const hasUserFolders = userFolderCount(folders) > 0;
	const publicFolders = folders.filter((f) => f.kind !== "demo" && f.kind !== "youtube" && f.kind !== "twitch" && !f.adult);
	const adultFolders = folders.filter((f) => f.adult);
	const tags = useLibrary((s) => s.tags);
	const adultHistoryTagged = (0, import_react.useMemo)(() => adultHistory.filter((video) => (tags[video.id] ?? []).includes("adult")), [adultHistory, tags]);
	const markedAdult = (0, import_react.useMemo)(() => [...adultRemoteVideos.filter((video) => (cameCounts[video.id] ?? 0) > 0)].sort((a, b) => (cameCounts[b.id] ?? 0) - (cameCounts[a.id] ?? 0)), [adultRemoteVideos, cameCounts]);
	const sourceMatchedAdult = (0, import_react.useMemo)(() => adultRemoteVideos.filter((video) => videoMatchesAdultSource(video, adultSource)), [adultRemoteVideos, adultSource]);
	const adultKind = (video) => video.remote?.live || ["chaturbate", "myfreecams"].includes(video.remote?.kind ?? "") ? "live" : isAdultImageKind(video.remote?.kind, video.mime, video.extension) ? "photos" : "videos";
	const viewMatchedAdult = (0, import_react.useMemo)(() => adultView === "all" ? sourceMatchedAdult : sourceMatchedAdult.filter((video) => adultKind(video) === adultView), [
		adultSource,
		adultView,
		sourceMatchedAdult
	]);
	const filteredEporner = (0, import_react.useMemo)(() => viewMatchedAdult.filter((video) => videoMatchesAdultTag(video, adultTag, tags)).filter((video) => !adultArtworkOnly || adultThumbCandidatesForVideo(video).length > 0), [
		adultArtworkOnly,
		adultTag,
		tags,
		viewMatchedAdult
	]);
	const adultArtworkReadyCount = (0, import_react.useMemo)(() => viewMatchedAdult.filter((video) => adultThumbCandidatesForVideo(video).length > 0).length, [viewMatchedAdult]);
	const adultSourceCounts = (0, import_react.useMemo)(() => countAdultBySource(adultRemoteVideos), [adultRemoteVideos]);
	const adultKindCounts = (0, import_react.useMemo)(() => ({
		videos: adultRemoteVideos.filter((video) => adultKind(video) === "videos").length,
		live: adultRemoteVideos.filter((video) => adultKind(video) === "live").length,
		photos: adultRemoteVideos.filter((video) => adultKind(video) === "photos").length
	}), [adultRemoteVideos]);
	(0, import_react.useMemo)(() => [...new Set(sourceMatchedAdult.flatMap((video) => tags[video.id] ?? []))].sort(), [sourceMatchedAdult, tags]);
	const historyTopTags = (0, import_react.useMemo)(() => {
		const counts = /* @__PURE__ */ new Map();
		for (const entry of history) for (const tag of tags[entry.id] ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1);
		return [...counts.entries()].filter(([tag]) => !/^year-|^month-|^type-|^format-|^https$|^youtube$|^twitch$/.test(tag)).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 12);
	}, [history, tags]);
	const historyRecovery = (0, import_react.useMemo)(() => {
		const sources = {
			open: 0,
			progress: 0,
			watchRoom: 0
		};
		let resumable = 0;
		for (const entry of history) {
			if (entry.source === "watch-room") sources.watchRoom += 1;
			else if (entry.source === "progress") sources.progress += 1;
			else sources.open += 1;
			if ((entry.position ?? 0) > 1 && (entry.duration ?? 0) > 0 && (entry.position ?? 0) < (entry.duration ?? 0) * .985) resumable += 1;
		}
		return {
			sources,
			resumable
		};
	}, [history]);
	const importHistoryRecovery = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".zip,.json,.csv,application/zip,application/json,text/csv";
		input.onchange = () => {
			const file = input.files?.[0];
			if (!file) return;
			if (!window.confirm("Merge this Realhub recovery pack? Existing activity is kept and duplicate entries are ignored.")) return;
			importLibraryPackZip(file, {
				getFollows: () => useLibrary.getState().follows,
				setFollows: (follows) => useLibrary.setState({ follows }),
				getHistory: () => useLibrary.getState().history,
				setHistory: (history) => useLibrary.setState({ history }),
				getViewCounts: () => useLibrary.getState().viewCounts,
				getCameCounts: () => useLibrary.getState().cameCounts,
				setMarks: (viewCounts, cameCounts) => useLibrary.setState({
					viewCounts,
					cameCounts
				}),
				getFavorites: () => Object.keys(useLibrary.getState().favorites),
				getLikes: () => Object.keys(useLibrary.getState().likes),
				setShelves: (favorites, likes) => useLibrary.setState({
					favorites: Object.fromEntries(favorites.map((id) => [id, true])),
					likes: Object.fromEntries(likes.map((id) => [id, true]))
				}),
				getProgress: () => useLibrary.getState().progress,
				getResumeProgress: () => useLibrary.getState().resumeProgress,
				setResume: (progress, resumeProgress) => useLibrary.setState({
					progress,
					resumeProgress
				}),
				getLinks: () => linksFromHistoryAndResume(useLibrary.getState().history, useLibrary.getState().resumeProgress),
				setLinks: () => {}
			}).then((result) => setHistoryImportNote(`Recovered +${result.historyMerged} activity entries · +${result.followsAdded} follows · +${result.linksMerged} saved links${result.feedbackMerged ? " · ratings and hearts merged" : ""}${result.warnings.length ? ` · ${result.warnings[0]}` : ""}.`)).catch((error) => setHistoryImportNote(error instanceof Error ? error.message : "Recovery import failed."));
		};
		input.click();
	};
	const favorites = useLibrary((s) => s.favorites);
	const likes = useLibrary((s) => s.likes);
	const viewCounts = useLibrary((s) => s.viewCounts);
	const adultPersonalVideos = (0, import_react.useMemo)(() => [...adultContinue, ...adultFavorites], [adultContinue, adultFavorites]);
	const adultBrowseInputs = (0, import_react.useMemo)(() => ({
		videos: adultRemoteVideos,
		personalVideos: adultPersonalVideos,
		deepVideos: adultDeepVisible ? videos : EMPTY_ADULT_VIDEOS,
		tags,
		favorites,
		likes,
		cameCounts,
		viewCounts,
		continueIds: adultContinue.map((video) => video.id),
		favoriteIds: adultFavorites.map((video) => video.id),
		ratingRevision,
		tagHeartRevision
	}), [
		adultRemoteVideos,
		adultPersonalVideos,
		adultDeepVisible,
		videos,
		tags,
		favorites,
		likes,
		cameCounts,
		viewCounts,
		adultContinue,
		adultFavorites,
		ratingRevision,
		tagHeartRevision
	]);
	const adultBrowseParams = (0, import_react.useMemo)(() => ({
		source: adultSource,
		tag: adultTag,
		view: adultView,
		limit: adultRailLimit,
		seed: adultRailSeed
	}), [
		adultSource,
		adultTag,
		adultView,
		adultRailLimit,
		adultRailSeed
	]);
	const adultBrowse = useAdultBrowse(sourceId === "adults", adultBrowseInputs, adultBrowseParams);
	const adultById = (0, import_react.useMemo)(() => new Map([...adultRemoteVideos, ...adultPersonalVideos].map((video) => [video.id, video])), [adultRemoteVideos, adultPersonalVideos]);
	const adultRows = (0, import_react.useMemo)(() => {
		const resolve = (ids) => ids.map((id) => adultById.get(id)).filter((video) => Boolean(video));
		const result = adultBrowse.result;
		if (result) return {
			overview: {
				videos: resolve(result.overview.videos),
				photos: resolve(result.overview.photos),
				picks: resolve(result.overview.picks)
			},
			tagRails: result.tagRails.map((row) => ({
				...row,
				videos: resolve(row.videos)
			})),
			shelves: {
				recommended: resolve(result.shelves.recommended),
				related: resolve(result.shelves.related),
				continueRail: resolve(result.shelves.continueRail),
				marked: resolve(result.shelves.marked),
				reddit: resolve(result.shelves.reddit),
				latest: resolve(result.shelves.latest),
				catalog: resolve(result.shelves.catalog),
				poster: resolve(result.shelves.poster)
			},
			live: resolve(result.live)
		};
		const empty = [];
		const overview = {
			videos: [],
			photos: [],
			picks: []
		};
		const live = [];
		for (const video of filteredEporner) {
			const kind = adultKind(video);
			if (kind === "live") {
				if (live.length < adultRailLimit) live.push(video);
			} else if (overview[kind].length < adultRailLimit) overview[kind].push(video);
			else if (overview.picks.length < adultRailLimit) overview.picks.push(video);
			if (overview.videos.length >= adultRailLimit && overview.photos.length >= adultRailLimit && overview.picks.length >= adultRailLimit && live.length >= adultRailLimit) break;
		}
		const personal = (list) => list.filter((video) => videoMatchesAdultSource(video, adultSource) && videoMatchesAdultTag(video, adultTag, tags) && (adultView === "all" || adultKind(video) === adultView)).slice(0, 24);
		return {
			overview,
			tagRails: [],
			live,
			shelves: {
				recommended: empty,
				related: empty,
				continueRail: personal(adultContinue),
				marked: personal(markedAdult),
				reddit: empty,
				latest: filteredEporner.slice(0, adultRailLimit),
				catalog: filteredEporner.slice(0, adultRailLimit * 3),
				poster: filteredEporner.slice(0, adultRailLimit * 6)
			}
		};
	}, [
		adultBrowse.result,
		adultById,
		filteredEporner,
		adultRailLimit,
		adultContinue,
		markedAdult,
		adultSource,
		adultTag,
		adultView,
		tags
	]);
	const adultOverviewRails = adultRows.overview;
	const adultTopTagRails = adultRows.tagRails;
	const adultShelfRails = adultRows.shelves;
	const adultTagRank = adultBrowse.facets?.tagRank ?? [];
	const adultMetaTagRank = adultBrowse.facets?.metaTagRank ?? [];
	const adultTagMatches = (0, import_react.useMemo)(() => {
		const needle = adultTagQuery.trim().toLowerCase();
		if (!needle) return adultTagRank;
		return adultTagRank.filter((row) => row.tag.includes(needle) || row.tag.replace(/-/g, " ").includes(needle));
	}, [adultTagQuery, adultTagRank]);
	const heartedAdultTags = (0, import_react.useMemo)(() => {
		const ranked = new Set(adultTagRank.map((row) => row.tag));
		return getHeartedTagHistory().filter((tag) => ranked.has(tag) || adultRemoteVideos.some((video) => videoMatchesAdultTag(video, tag, tags)));
	}, [
		adultRemoteVideos,
		adultTagRank,
		tagHeartRevision,
		tags
	]);
	const visibleAdultTags = (0, import_react.useMemo)(() => {
		const page = Math.min(Math.max(10, adultTagVisibleCount), 36);
		return adultTagMatches.slice(0, page);
	}, [adultTagMatches, adultTagVisibleCount]);
	const adultRecommendedRail = adultShelfRails.recommended;
	const adultRelatedRail = adultShelfRails.related;
	const adultContinueRail = adultShelfRails.continueRail;
	const adultMarkedRail = adultShelfRails.marked;
	const adultRedditRail = adultShelfRails.reddit;
	const adultLatestRail = adultShelfRails.latest;
	const adultCatalogRail = adultShelfRails.catalog;
	const adultPosterCatalog = adultShelfRails.poster;
	const adultFeatured = (0, import_react.useMemo)(() => [
		...adultRecommendedRail,
		...adultLatestRail,
		...adultRemoteVideos
	].find((video) => Boolean(video.poster || video.remote?.previewUrl)), [
		adultLatestRail,
		adultRecommendedRail,
		adultRemoteVideos
	]);
	const adultExplorerResults = (0, import_react.useMemo)(() => {
		if (sourceId !== "adult-fetishes") return [];
		const selected = adultExplorerTag.trim();
		return rotateAdultRail(adultRemoteVideos.filter((video) => selected ? (tags[video.id] ?? []).includes(selected) : (tags[video.id] ?? []).some((tag) => tag.startsWith("fetish-"))).sort((a, b) => b.addedAt - a.addedAt), `explorer:${selected || "all"}`, adultRailSeed).slice(0, Math.max(48, adultRailLimit * 2));
	}, [
		sourceId,
		adultExplorerTag,
		adultRailLimit,
		adultRailSeed,
		adultRemoteVideos,
		tags
	]);
	(0, import_react.useEffect)(() => {
		setAdultTagVisibleCount(10);
	}, [adultTagQuery, adultSource]);
	(0, import_react.useEffect)(() => {
		const onAdultTag = (event) => {
			applyAdultTag(String(event.detail?.tag ?? ""));
		};
		window.addEventListener("reelcase:adult-tag", onAdultTag);
		return () => window.removeEventListener("reelcase:adult-tag", onAdultTag);
	}, [applyAdultTag]);
	(0, import_react.useEffect)(() => {
		const load = () => {
			const saved = Number(localStorage.getItem("reelcase.adult-rail-limit") ?? "48");
			setAdultRailLimit([
				16,
				24,
				48,
				72
			].includes(saved) ? saved : 24);
		};
		load();
		window.addEventListener("reelcase:adult-render-settings", load);
		return () => window.removeEventListener("reelcase:adult-render-settings", load);
	}, []);
	(0, import_react.useEffect)(() => {
		if (sourceId !== "adults") return;
		const rotate = () => setAdultRailSeed(Date.now() >>> 0);
		rotate();
		const timer = window.setInterval(rotate, 18e4);
		return () => window.clearInterval(timer);
	}, [sourceId]);
	const filteredYoutube = (0, import_react.useMemo)(() => youtubeTagFilter === "all" ? newestYoutube : newestYoutube.filter((video) => topicsForVideo(video, tags[video.id]).includes(youtubeTagFilter)), [
		newestYoutube,
		tags,
		youtubeTagFilter
	]);
	const searchInsights = (0, import_react.useMemo)(() => {
		const needle = query.trim().toLowerCase().replace(/^#/, "");
		if (!needle) return {
			ranked: videos,
			tags: []
		};
		if (searchPending || !searchResult) return {
			ranked: [],
			tags: []
		};
		const adultIds = new Set(folders.filter((folder) => folder.adult).map((folder) => folder.id));
		const inAdults = sourceId === "adults" || sourceId === "adult-fetishes";
		const pool = catalogVideos.filter((video) => {
			if (!searchResult.ids.has(video.id) || video.isSample || hiddenVideos[video.id]) return false;
			const isAdult = adultIds.has(video.folderId) || Boolean(video.remote && [
				"eporner",
				"redtube",
				"chaturbate",
				"myfreecams",
				"reddit",
				"booru",
				"redgifs"
			].includes(video.remote.kind));
			return inAdults ? isAdult : !isAdult;
		});
		const terms = needle.split(/[^a-z0-9]+/).filter(Boolean);
		const bare = needle.replace(/^(?:fetish|genre|meta|creator|sub|source)-/, "");
		const score = (video) => {
			const title = video.name.toLowerCase();
			const creator = (video.remote?.channelName ?? "").toLowerCase();
			const videoTags = [...new Set([...topicsForVideo(video, tags[video.id]), ...tags[video.id] ?? []].map((tag) => tag.toLowerCase()))];
			const exactTag = videoTags.some((tag) => tag === needle || tag === bare || tag === `fetish-${bare}` || tag === `genre-${bare}`) ? 220 : 0;
			const exactTagHits = videoTags.filter((tag) => terms.some((term) => tag === term || tag.includes(term))).length;
			const titleHits = terms.filter((term) => title.includes(term)).length;
			const creatorHits = terms.filter((term) => creator.includes(term)).length;
			return exactTag + (title.includes(needle) ? 120 : 0) + (creator.includes(needle) ? 95 : 0) + titleHits * 28 + creatorHits * 22 + exactTagHits * 18 + ratingPreference(getRating(video.id)) * 7 + (favorites[video.id] ? 12 : 0) + (likes[video.id] ? 6 : 0) + Math.min(8, viewCounts[video.id] ?? 0);
		};
		const rankedRows = pool.map((video) => ({
			video,
			score: score(video)
		})).filter((row) => row.score > 0).sort((a, b) => b.score - a.score || b.video.addedAt - a.video.addedAt || a.video.name.localeCompare(b.video.name));
		const tagRows = /* @__PURE__ */ new Map();
		for (const row of rankedRows.slice(0, 240)) for (const tag of [...topicsForVideo(row.video, tags[row.video.id]), ...tags[row.video.id] ?? []]) {
			const clean = tag.toLowerCase();
			if (clean.length < 2 || /^(?:year|month|day|type|format|provider)-/.test(clean)) continue;
			const previous = tagRows.get(clean) ?? {
				count: 0,
				score: 0
			};
			tagRows.set(clean, {
				count: previous.count + 1,
				score: previous.score + row.score
			});
		}
		return {
			ranked: rankedRows.map((row) => row.video),
			tags: [...tagRows.entries()].map(([tag, value]) => ({
				tag,
				...value
			})).sort((a, b) => b.score - a.score || b.count - a.count || a.tag.localeCompare(b.tag)).slice(0, 12)
		};
	}, [
		catalogVideos,
		favorites,
		folders,
		hiddenVideos,
		likes,
		query,
		ratingRevision,
		searchPending,
		searchResult,
		sourceId,
		tags,
		videos,
		viewCounts
	]);
	const trendingYoutube = (0, import_react.useMemo)(() => sourceId === "youtube" && youtubeExploreVisible ? diversifyCreators([...filteredYoutube.slice(0, LIBRARY_LIMITS.youtubeTrendingCandidateWindow)].sort((a, b) => (b.remote?.views ?? 0) - (a.remote?.views ?? 0) || b.addedAt - a.addedAt)) : [], [
		filteredYoutube,
		sourceId,
		youtubeExploreVisible
	]);
	const categories = useLibrary((s) => s.categories);
	const progress = useLibrary((s) => s.progress);
	const resumeProgress = useLibrary((s) => s.resumeProgress);
	const unavailable = useLibrary((s) => s.unavailable);
	const follows = useLibrary((s) => s.follows);
	const youtubePlaylistShelves = (0, import_react.useMemo)(() => {
		if (sourceId !== "youtube") return [];
		const playlistFollows = follows.filter((follow) => follow.id.startsWith("ytpl:")).slice(0, 6);
		if (!playlistFollows.length) return [];
		const wanted = new Set(playlistFollows.map((follow) => follow.id));
		const byFolder = /* @__PURE__ */ new Map();
		for (const video of youtubeVideos) if (wanted.has(video.folderId)) {
			const rows = byFolder.get(video.folderId) ?? [];
			if (rows.length < 24) rows.push(video);
			byFolder.set(video.folderId, rows);
		}
		return playlistFollows.map((follow) => ({
			id: follow.id,
			title: follow.title,
			videos: byFolder.get(follow.id) ?? []
		})).filter((row) => row.videos.length);
	}, [
		follows,
		sourceId,
		youtubeVideos
	]);
	const remoteCheckedAt = useLibrary((s) => s.remoteCheckedAt);
	const remoteRetryAt = useLibrary((s) => s.remoteRetryAt);
	const youtubeLiveCheckedAt = (0, import_react.useMemo)(() => Math.max(0, ...follows.filter((channel) => channel.kind === "youtube").map((channel) => channel.liveCheckedAt ?? 0)), [follows]);
	const youtubeHealth = (0, import_react.useMemo)(() => {
		if (sourceId !== "youtube" || !youtubeHealthVisible) return [];
		const counts = /* @__PURE__ */ new Map();
		for (const video of youtubeVideos) {
			const row = counts.get(video.folderId) ?? {
				cached: 0,
				newest: 0
			};
			row.cached++;
			row.newest = Math.max(row.newest, video.addedAt);
			counts.set(video.folderId, row);
		}
		return follows.filter((channel) => channel.kind === "youtube").map((channel) => ({
			...channel,
			...counts.get(channel.id) ?? {
				cached: 0,
				newest: 0
			},
			retryAt: remoteRetryAt[channel.id]
		})).sort((a, b) => (a.lastCheckedAt ?? 0) - (b.lastCheckedAt ?? 0) || a.title.localeCompare(b.title)).slice(0, youtubeHealthLimit);
	}, [
		follows,
		remoteRetryAt,
		sourceId,
		youtubeHealthLimit,
		youtubeHealthVisible,
		youtubeVideos
	]);
	const continueInsights = (0, import_react.useMemo)(() => {
		const marks = Object.values(progress);
		const staleBefore = Date.now() - 15552e6;
		const valid = marks.filter((mark) => Number.isFinite(mark.t) && Number.isFinite(mark.d) && mark.d > .25 && mark.d <= 2592e3 && mark.t >= 0 && mark.t <= mark.d * 1.015);
		return {
			valid: valid.length,
			stale: valid.filter((mark) => mark.at < staleBefore).length,
			linked: continueVideos.filter((video) => Boolean(resumeForVideo({
				progress,
				resumeProgress
			}, video))).length
		};
	}, [
		continueVideos,
		progress,
		resumeProgress
	]);
	const adultPageVideos = (0, import_react.useMemo)(() => sourceId === "adults" ? videos : [], [sourceId, videos]);
	const moviesByGenre = (0, import_react.useMemo)(() => sourceId === "home" ? videos.filter((video) => Boolean(video.genre)).sort((a, b) => a.genre.localeCompare(b.genre)) : [], [sourceId, videos]);
	const movieCatalog = (0, import_react.useMemo)(() => {
		if (sourceId !== "movies") return [];
		const adultIds = new Set(folders.filter((folder) => folder.adult).map((folder) => folder.id));
		return catalogVideos.filter((video) => !video.remote && !video.isSample && !adultIds.has(video.folderId) && !unavailable[video.id] && !hiddenVideos[video.id]);
	}, [
		catalogVideos,
		folders,
		hiddenVideos,
		sourceId,
		unavailable
	]);
	const randomSourceMovies = (0, import_react.useMemo)(() => movieCatalog.map((video) => ({
		video,
		rank: shuffleRank(video.id, movieShuffle)
	})).sort((a, b) => a.rank - b.rank).map((entry) => entry.video), [movieCatalog, movieShuffle]);
	const priorityMovieGenres = (0, import_react.useMemo)(() => [
		"Comedy",
		"Action",
		"Horror",
		"Drama",
		"Documentary",
		"Science Fiction"
	].map((genre) => ({
		genre,
		videos: movieCatalog.filter((video) => video.genre?.toLowerCase() === genre.toLowerCase())
	})).filter((shelf) => shelf.videos.length > 0), [movieCatalog]);
	const movieTypeShelves = (0, import_react.useMemo)(() => {
		const groups = /* @__PURE__ */ new Map();
		for (const video of movieCatalog) {
			const type = (video.extension || "file").replace(/^\./, "").toUpperCase();
			const rows = groups.get(type) ?? [];
			rows.push(video);
			groups.set(type, rows);
		}
		return [...groups.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])).slice(0, 10).map(([type, videos]) => ({
			type,
			videos
		}));
	}, [movieCatalog]);
	const adultSorted = (0, import_react.useMemo)(() => {
		if (sourceId !== "adults" || !adultDeepVisible) return adultPageVideos;
		if (adultSort === "ranked") {
			if (!adultBrowse.result?.deepRankedIds.length) return adultPageVideos;
			const byId = new Map(adultPageVideos.map((video) => [video.id, video]));
			return adultBrowse.result.deepRankedIds.map((id) => byId.get(id)).filter((video) => Boolean(video));
		}
		return [...adultPageVideos].sort((a, b) => adultSort === "name" ? a.name.localeCompare(b.name) : adultSort === "favorites" ? Number(Boolean(favorites[b.id])) - Number(Boolean(favorites[a.id])) || b.addedAt - a.addedAt : adultSort === "tagged" ? (tags[b.id] ?? []).length - (tags[a.id] ?? []).length || b.addedAt - a.addedAt : adultSort === "played" ? (progress[b.id]?.at ?? 0) - (progress[a.id]?.at ?? 0) || b.addedAt - a.addedAt : b.addedAt - a.addedAt);
	}, [
		adultBrowse.result,
		adultDeepVisible,
		adultSort,
		adultPageVideos,
		cameCounts,
		favorites,
		likes,
		progress,
		sourceId,
		tags,
		viewCounts,
		ratingRevision
	]);
	const adultTagged = (0, import_react.useMemo)(() => {
		if (!adultDeepVisible) return [];
		return adultPageVideos.filter((video) => (tags[video.id] ?? []).length > 0).sort((a, b) => (tags[b.id] ?? []).length - (tags[a.id] ?? []).length);
	}, [
		adultDeepVisible,
		tags,
		adultPageVideos
	]);
	const adultNeedsTags = (0, import_react.useMemo)(() => {
		if (!adultDeepVisible) return [];
		return adultPageVideos.filter((video) => !(tags[video.id] ?? []).length);
	}, [
		adultDeepVisible,
		tags,
		adultPageVideos
	]);
	const highlyRatedTags = (0, import_react.useMemo)(() => {
		const preferred = /* @__PURE__ */ new Set();
		if (sourceId !== "twitch") return preferred;
		for (const video of videos) {
			const rating = getRating(video.id);
			for (const tag of topicsForVideo(video, tags[video.id])) if (rating >= 4 || tagIsLiked(tag)) preferred.add(tag);
		}
		return preferred;
	}, [
		ratingRevision,
		sourceId,
		tags,
		videos
	]);
	const tasteAverages = (0, import_react.useMemo)(() => {
		if (!(sourceId === "home" && homeRecommendationsReady || sourceId === "youtube" && youtubeExploreVisible)) return {
			tag: /* @__PURE__ */ new Map(),
			creator: /* @__PURE__ */ new Map()
		};
		const tagsByScore = /* @__PURE__ */ new Map();
		const creatorsByScore = /* @__PURE__ */ new Map();
		for (const video of videos) {
			const rating = getRating(video.id);
			const signal = rating === 1 ? -3 : Math.max(ratingPreference(rating), favorites[video.id] ? 2 : 0, likes[video.id] ? 1 : 0) + Math.min(1, watchTimeScore(getWatchTime(video.id)) / 6);
			if (!signal) continue;
			for (const tag of topicsForVideo(video, tags[video.id])) {
				const row = tagsByScore.get(tag) ?? {
					total: 0,
					count: 0
				};
				row.total += signal;
				row.count += 1;
				tagsByScore.set(tag, row);
			}
			const creator = video.remote?.channelName?.trim().toLowerCase();
			if (creator) {
				const row = creatorsByScore.get(creator) ?? {
					total: 0,
					count: 0
				};
				row.total += signal;
				row.count += 1;
				creatorsByScore.set(creator, row);
			}
		}
		const score = (row) => row.total / (row.count + 3);
		const confidence = (row) => Math.min(1, row.count / 5);
		return {
			tag: new Map([...tagsByScore].map(([key, row]) => [key, {
				score: score(row),
				confidence: confidence(row)
			}])),
			creator: new Map([...creatorsByScore].map(([key, row]) => [key, {
				score: score(row),
				confidence: confidence(row)
			}]))
		};
	}, [
		favorites,
		homeRecommendationsReady,
		likes,
		ratingRevision,
		sourceId,
		tags,
		videos,
		youtubeExploreVisible
	]);
	const personalizedPicks = (0, import_react.useMemo)(() => {
		if (sourceId !== "home" || !homeRecommendationsReady) return [];
		const watched = new Set(history.map((entry) => entry.id));
		const preferredTags = new Set(videos.filter((video) => favorites[video.id] || likes[video.id] || getRating(video.id) >= 4).flatMap((video) => topicsForVideo(video, tags[video.id])));
		const score = (video) => {
			const creatorAverage = tasteAverages.creator.get(video.remote?.channelName?.trim().toLowerCase() ?? "");
			const tagAverage = topicsForVideo(video, tags[video.id]).reduce((total, tag) => {
				const signal = tasteAverages.tag.get(tag);
				return total + (signal ? (signal.score - 3) * signal.confidence : 0);
			}, 0);
			const creatorLift = creatorAverage ? (creatorAverage.score - 3) * creatorAverage.confidence : 0;
			return ratingPreference(getRating(video.id)) * 18 + (getRating(video.id) === 1 ? 0 : watchTimeScore(getWatchTime(video.id))) + ratingPreference(getCreatorRating(video.remote?.channelName ?? "")) * 10 + creatorLift * 9 + tagAverage * 7 + (creatorIsLiked(video.remote?.channelName ?? "") ? 9 : 0) + (favorites[video.id] ? 6 : 0) + (likes[video.id] ? 4 : 0) + topicsForVideo(video, tags[video.id]).filter((tag) => isTasteTag(tag) && preferredTags.has(tag)).length * 2 + (video.remote?.live ? 1 : 0);
		};
		return videos.filter((video) => !video.remote && !video.isSample && !watched.has(video.id)).map((video) => ({
			video,
			rank: score(video) * .45 + shuffleRank(`${video.id}:${homePickShuffle}`, homePickShuffle) / 4294967295
		})).sort((a, b) => b.rank - a.rank).map(({ video }) => video);
	}, [
		favorites,
		history,
		homePickShuffle,
		homeRecommendationsReady,
		likes,
		ratingRevision,
		sourceId,
		tags,
		tasteAverages,
		videos
	]);
	const topRatedLocalPicks = (0, import_react.useMemo)(() => {
		const perFolder = /* @__PURE__ */ new Map();
		return personalizedPicks.filter((video) => !video.remote && !video.isSample).map((video) => ({
			video,
			score: ratingPreference(getRating(video.id)) * 5 + (getRating(video.id) === 1 ? 0 : watchTimeScore(getWatchTime(video.id))) + (favorites[video.id] ? 2 : 0) + (likes[video.id] ? 1 : 0) + shuffleRank(`local-rated:${video.id}:${homePickShuffle}`, homePickShuffle) / 4294967295 * 5
		})).sort((a, b) => b.score - a.score).filter(({ video }) => {
			const seen = perFolder.get(video.folderId) ?? 0;
			if (seen >= 3) return false;
			perFolder.set(video.folderId, seen + 1);
			return true;
		}).map(({ video }) => video);
	}, [
		favorites,
		homePickShuffle,
		likes,
		personalizedPicks
	]);
	const freshPicks = (0, import_react.useMemo)(() => {
		if (sourceId === "home" ? !homeRecommendationsReady : sourceId === "youtube" ? !youtubeExploreVisible : sourceId !== "twitch") return [];
		const seed = Math.floor(Date.now() / 36e5);
		return takeBestMapped(sourceId === "youtube" ? youtubeVideos : sourceId === "twitch" ? twitchVideos : videos, 48, (video) => !video.isSample && !video.remote?.live ? {
			video,
			views: viewCounts[video.id] ?? 0,
			rank: shuffleRank(`${video.id}:${seed}`, seed)
		} : null, (a, b) => a.views - b.views || a.rank - b.rank).map(({ video }) => video);
	}, [
		homeRecommendationsReady,
		sourceId,
		videos,
		viewCounts,
		youtubeExploreVisible,
		youtubeVideos,
		twitchVideos
	]);
	const homeLocalRecent = (0, import_react.useMemo)(() => {
		if (sourceId !== "home" || !homeRecommendationsReady) return [];
		const now = Date.now();
		return takeBestMapped(videos, 48, (video) => !video.remote && !video.isSample ? {
			video,
			ageBucket: Math.floor(Math.max(0, now - video.addedAt) / 6048e5),
			rank: shuffleRank(`${video.id}:recent`, homePickShuffle)
		} : null, (a, b) => a.ageBucket - b.ageBucket || a.rank - b.rank).map(({ video }) => video);
	}, [
		homePickShuffle,
		homeRecommendationsReady,
		sourceId,
		videos
	]);
	const homeLatestChannels = (0, import_react.useMemo)(() => sourceId !== "home" || !homeRecommendationsReady ? [] : takeBestMapped(concatIterables(youtubeVideos, twitchVideos), 48, (video) => !video.remote?.live && !video.isSample && !isOfflineChannelCard(video) ? video : null, (a, b) => b.addedAt - a.addedAt || a.id.localeCompare(b.id)), [
		homeRecommendationsReady,
		sourceId,
		twitchVideos,
		youtubeVideos
	]);
	const sortedTwitch = (0, import_react.useMemo)(() => {
		if (sourceId !== "twitch") return [];
		const counts = new Map(twitchVideos.map((video) => [video.id, hasFreshViewerCount(video.remote) ? video.remote?.viewers ?? 0 : 0]));
		return twitchVideos.filter((video) => !isOfflineChannelCard(video)).sort((a, b) => {
			const viewers = (video) => counts.get(video.id) ?? 0;
			if (twitchSort === "viewers") return viewers(b) - viewers(a) || a.name.localeCompare(b.name);
			if (twitchSort === "name") return a.name.localeCompare(b.name);
			return Number(Boolean(b.remote?.live)) - Number(Boolean(a.remote?.live)) || viewers(b) - viewers(a) || b.addedAt - a.addedAt;
		});
	}, [
		sourceId,
		twitchSort,
		twitchVideos
	]);
	const twitchVodPicks = (0, import_react.useMemo)(() => {
		if (sourceId !== "twitch") return [];
		const popularity = (video) => (hasFreshViewerCount(video.remote) ? video.remote?.viewers ?? 0 : 0) + ratingPreference(getRating(video.id)) * 40 + (getRating(video.id) === 1 ? 0 : watchTimeScore(getWatchTime(video.id))) + (favorites[video.id] ? 28 : 0) + (likes[video.id] ? 16 : 0) + (viewCounts[video.id] ?? 0) * 5 + topicsForVideo(video, tags[video.id]).filter((tag) => highlyRatedTags.has(tag)).length * 8;
		return sortedTwitch.filter((video) => !video.remote?.live && !isTwitchClip(video)).map((video) => ({
			video,
			score: popularity(video)
		})).sort((a, b) => b.score - a.score || b.video.addedAt - a.video.addedAt).map(({ video }) => video);
	}, [
		favorites,
		highlyRatedTags,
		likes,
		ratingRevision,
		sortedTwitch,
		sourceId,
		tags,
		viewCounts
	]);
	const twitchArchiveDepth = (0, import_react.useMemo)(() => {
		if (sourceId !== "twitch") return {
			total: 0,
			sparse: 0,
			channels: []
		};
		const rows = /* @__PURE__ */ new Map();
		for (const video of twitchVideos) {
			if (!isTwitchClip(video)) continue;
			const name = video.remote?.channelName?.trim() || "Unknown creator";
			const previous = rows.get(name) ?? {
				count: 0,
				oldest: Number.MAX_SAFE_INTEGER,
				newest: 0,
				clips: 0
			};
			rows.set(name, {
				...previous,
				clips: previous.clips + 1
			});
		}
		for (const video of twitchVodPicks) {
			const name = video.remote?.channelName?.trim() || "Unknown creator";
			const previous = rows.get(name) ?? {
				count: 0,
				oldest: Number.MAX_SAFE_INTEGER,
				newest: 0,
				clips: 0
			};
			rows.set(name, {
				count: previous.count + 1,
				oldest: Math.min(previous.oldest, video.addedAt),
				newest: Math.max(previous.newest, video.addedAt),
				clips: previous.clips
			});
		}
		const channels = follows.filter((channel) => channel.kind === "twitch").map((channel) => ({
			id: channel.id,
			name: channel.title,
			...rows.get(channel.title) ?? {
				count: 0,
				oldest: 0,
				newest: 0,
				clips: 0
			},
			lastCheckedAt: channel.lastCheckedAt,
			lastResponseCount: channel.lastResponseCount,
			retryAt: remoteRetryAt[channel.id],
			lastProviderFailure: channel.lastProviderFailure
		})).sort((a, b) => a.count - b.count || a.name.localeCompare(b.name));
		return {
			total: twitchVodPicks.length,
			sparse: channels.filter((channel) => channel.count < 24).length,
			channels
		};
	}, [
		follows,
		remoteRetryAt,
		sourceId,
		twitchVodPicks,
		twitchVideos
	]);
	const twitchClipTotal = (0, import_react.useMemo)(() => sourceId === "twitch" ? twitchVideos.reduce((count, video) => count + Number(isTwitchClip(video)), 0) : 0, [sourceId, twitchVideos]);
	const twitchClips = (0, import_react.useMemo)(() => sourceId === "twitch" ? sampleTwitchClips(twitchVideos, twitchClipSeed, twitchClipCreator) : [], [
		sourceId,
		twitchVideos,
		twitchClipSeed,
		twitchClipCreator
	]);
	const favoriteTwitchPicks = (0, import_react.useMemo)(() => sortedTwitch.filter((video) => favorites[video.id]).sort((a, b) => (viewCounts[b.id] ?? 0) - (viewCounts[a.id] ?? 0) || b.addedAt - a.addedAt), [
		favorites,
		sortedTwitch,
		viewCounts
	]);
	const likedTwitchPicks = (0, import_react.useMemo)(() => sortedTwitch.filter((video) => likes[video.id] && !favorites[video.id]).sort((a, b) => getRating(b.id) - getRating(a.id) || (viewCounts[a.id] ?? 0) - (viewCounts[b.id] ?? 0) || b.addedAt - a.addedAt), [
		favorites,
		likes,
		ratingRevision,
		sortedTwitch,
		viewCounts
	]);
	const twitchVodChannels = (0, import_react.useMemo)(() => {
		const groups = /* @__PURE__ */ new Map();
		for (const video of twitchVodPicks) {
			const creator = video.remote?.channelName?.trim() || "Unknown creator";
			const group = groups.get(creator) ?? [];
			group.push(video);
			groups.set(creator, group);
		}
		return [...groups.entries()].map(([creator, vods]) => ({
			creator,
			vods,
			score: vods.reduce((total, video) => total + ratingPreference(getRating(video.id)) * 10 + (favorites[video.id] ? 8 : 0) + (likes[video.id] ? 4 : 0) + (viewCounts[video.id] ?? 0), 0)
		})).sort((a, b) => b.score - a.score || b.vods.length - a.vods.length || a.creator.localeCompare(b.creator)).slice(0, 12);
	}, [
		favorites,
		likes,
		ratingRevision,
		twitchVodPicks,
		viewCounts
	]);
	const liveChannelVods = (0, import_react.useMemo)(() => {
		const liveByCreator = /* @__PURE__ */ new Map();
		for (const video of sortedTwitch) {
			const creator = video.remote?.channelName?.trim();
			if (video.remote?.live && creator && !liveByCreator.has(creator.toLowerCase())) liveByCreator.set(creator.toLowerCase(), video);
		}
		const vodsByCreator = /* @__PURE__ */ new Map();
		for (const video of twitchVodPicks) {
			const key = video.remote?.channelName?.trim().toLowerCase();
			if (!key || !liveByCreator.has(key)) continue;
			const group = vodsByCreator.get(key) ?? [];
			group.push(video);
			vodsByCreator.set(key, group);
		}
		return [...liveByCreator.values()].map((live) => {
			const creator = live.remote?.channelName?.trim() ?? "";
			return {
				creator,
				live,
				vods: vodsByCreator.get(creator.toLowerCase()) ?? []
			};
		}).filter((group) => group.vods.length > 0).slice(0, 8);
	}, [sortedTwitch, twitchVodPicks]);
	const relatedYoutube = (0, import_react.useMemo)(() => {
		if (sourceId !== "youtube" || !youtubeExploreVisible) return [];
		return rankYoutubeRecommendations(youtubeVideos, {
			tags,
			history,
			viewCounts,
			favorites,
			likes,
			ratingOf: getRating,
			tagIsLiked,
			tagHasHeartHistory,
			ratingPreference,
			watchScore: (id) => watchTimeScore(getWatchTime(id)),
			creatorIsLiked,
			creatorRating: getCreatorRating,
			shuffle: (id) => shuffleRank(`${id}:${homePickShuffle}`, homePickShuffle),
			limit: 1600
		});
	}, [
		favorites,
		history,
		homePickShuffle,
		likes,
		ratingRevision,
		sourceId,
		tags,
		viewCounts,
		youtubeExploreVisible,
		youtubeVideos
	]);
	const watchedYoutubeCreators = (0, import_react.useMemo)(() => {
		if (sourceId !== "youtube") return /* @__PURE__ */ new Set();
		const videosById = new Map(youtubeVideos.map((video) => [video.id, video]));
		const creators = /* @__PURE__ */ new Set();
		for (const entry of history) {
			if (Date.now() - entry.at > 15552e6) continue;
			const creator = videosById.get(entry.id)?.remote?.channelName?.trim().toLowerCase();
			if (creator) creators.add(creator);
		}
		return creators;
	}, [
		history,
		sourceId,
		youtubeVideos
	]);
	const watchedYoutubeVideoIds = (0, import_react.useMemo)(() => new Set(history.map((entry) => entry.id)), [history]);
	const deeperFromWatchedCreators = (0, import_react.useMemo)(() => relatedYoutube.filter((video) => !watchedYoutubeVideoIds.has(video.id) && watchedYoutubeCreators.has(video.remote?.channelName?.trim().toLowerCase() ?? "")).slice(0, 48), [
		relatedYoutube,
		watchedYoutubeCreators,
		watchedYoutubeVideoIds
	]);
	const youtubeDiscovery = (0, import_react.useMemo)(() => {
		if (sourceId !== "youtube" || !youtubeExploreVisible) return [];
		const known = new Set(follows.filter((channel) => channel.kind === "youtube").map((channel) => channel.title.toLowerCase()));
		return youtubeVideos.filter((video) => !known.has((video.remote?.channelName ?? "").toLowerCase()) || Boolean(video.isSample));
	}, [
		follows,
		sourceId,
		youtubeExploreVisible,
		youtubeVideos
	]);
	const channelTagShelves = (0, import_react.useMemo)(() => {
		if (sourceId !== "youtube" && sourceId !== "twitch") return {
			youtube: [],
			twitch: []
		};
		const build = (items, kind) => {
			const groups = /* @__PURE__ */ new Map();
			for (const video of items) {
				if (video.remote?.kind !== kind) continue;
				for (const tag of topicsForVideo(video, tags[video.id])) {
					const clean = tag.toLowerCase();
					if ([
						kind,
						"vod",
						"live"
					].includes(clean) || clean.length < 4) continue;
					const list = groups.get(clean) ?? [];
					list.push(video);
					groups.set(clean, list);
				}
			}
			return [...groups.entries()].filter(([, items]) => items.length >= 2).map(([tag, videos]) => ({
				tag,
				videos,
				score: videos.reduce((score, video) => score + ratingPreference(getRating(video.id)) * 2 + (getRating(video.id) === 1 ? 0 : watchTimeScore(getWatchTime(video.id)) / 4), 0)
			})).sort((a, b) => b.score - a.score || b.videos.length - a.videos.length || a.tag.localeCompare(b.tag)).slice(0, 40).map(({ tag, videos }) => ({
				tag,
				videos: diversifyCreators(videos)
			}));
		};
		if (sourceId === "youtube") return {
			youtube: youtubeExploreVisible ? build(youtubeVideos, "youtube") : [],
			twitch: []
		};
		return {
			youtube: [],
			twitch: build(twitchVideos, "twitch")
		};
	}, [
		ratingRevision,
		sourceId,
		tags,
		twitchVideos,
		youtubeExploreVisible,
		youtubeVideos
	]);
	(0, import_react.useEffect)(() => {
		restoreFolders();
	}, [restoreFolders]);
	(0, import_react.useEffect)(() => {
		if (sourceId === "home") setHomePickShuffle(Date.now());
	}, [sourceId]);
	(0, import_react.useEffect)(() => {
		ensureImageBudgetVisibilityHook();
		if (sourceId !== "youtube") {
			setYoutubeExploreVisible(false);
			setYoutubeDeepVisible(false);
			setYoutubeHealthVisible(false);
			setYoutubeTagFilter("all");
		}
		if (sourceId !== "adults" && sourceId !== "adult-fetishes") {
			setAdultDeepVisible(false);
			setAdultTagVisibleCount(10);
		}
		if (sourceId !== "home") setHomeExpanded(false);
	}, [sourceId]);
	(0, import_react.useEffect)(() => {
		if (sourceId !== "home") {
			setHomeRecommendationsReady(false);
			return;
		}
		let cancelled = false;
		const ready = () => {
			if (!cancelled) (0, import_react.startTransition)(() => setHomeRecommendationsReady(true));
		};
		const frame = window.requestAnimationFrame(() => window.setTimeout(ready, 0));
		return () => {
			cancelled = true;
			window.cancelAnimationFrame(frame);
		};
	}, [sourceId, videos.length]);
	(0, import_react.useEffect)(() => {
		const target = nextLikelyHub(sourceId);
		if (!hydrated || !target || sourceId === "home" && !homeRecommendationsReady) return;
		let cancelled = false;
		let frame;
		let idle;
		let idleCallback = false;
		const clearScheduled = () => {
			if (typeof frame === "number") window.cancelAnimationFrame(frame);
			if (typeof idle === "number") {
				if (idleCallback) window.cancelIdleCallback(idle);
				else window.clearTimeout(idle);
			}
			frame = void 0;
			idle = void 0;
		};
		const warm = () => {
			idle = void 0;
			if (cancelled) return;
			const nav = navigator;
			if (!shouldWarmHubRoute({
				visible: document.visibilityState === "visible",
				saveData: nav.connection?.saveData,
				effectiveType: nav.connection?.effectiveType,
				deviceMemory: nav.deviceMemory,
				inputPending: nav.scheduling?.isInputPending?.()
			})) return;
			loadHub().catch(() => {});
		};
		const schedule = () => {
			clearScheduled();
			if (cancelled || document.visibilityState !== "visible") return;
			frame = window.requestAnimationFrame(() => {
				frame = void 0;
				if (cancelled || document.visibilityState !== "visible") return;
				if (typeof window.requestIdleCallback === "function") {
					idleCallback = true;
					idle = window.requestIdleCallback(warm, { timeout: 4e3 });
				} else {
					idleCallback = false;
					idle = window.setTimeout(warm, 450);
				}
			});
		};
		const onVisibilityChange = () => {
			if (document.visibilityState === "visible") schedule();
			else clearScheduled();
		};
		document.addEventListener("visibilitychange", onVisibilityChange);
		schedule();
		return () => {
			cancelled = true;
			document.removeEventListener("visibilitychange", onVisibilityChange);
			clearScheduled();
		};
	}, [
		homeRecommendationsReady,
		hydrated,
		sourceId
	]);
	(0, import_react.useEffect)(() => {
		const refreshRatedShelves = () => (0, import_react.startTransition)(() => {
			setRatingRevision((value) => value + 1);
			setTagHeartRevision((value) => value + 1);
		});
		window.addEventListener("reelcase:rating-change", refreshRatedShelves);
		return () => window.removeEventListener("reelcase:rating-change", refreshRatedShelves);
	}, []);
	(0, import_react.useEffect)(() => {
		useThumbs.getState().hydrate();
	}, []);
	(0, import_react.useEffect)(() => {
		const update = () => {
			try {
				const seconds = Number(localStorage.getItem("reelcase.twitch-refresh-seconds") ?? "30");
				setRemoteRefreshMs(([
					15,
					30,
					60,
					120,
					300
				].includes(seconds) ? seconds : 30) * 1e3);
			} catch {
				setRemoteRefreshMs(3e4);
			}
		};
		window.addEventListener("reelcase:refresh-settings", update);
		return () => window.removeEventListener("reelcase:refresh-settings", update);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!hydrated || refreshing) return;
		const build = () => {
			searchWorkerIndex.sync(catalogVideos, tags, categories);
		};
		return scheduleBackgroundWork(build, {
			timeoutMs: 2e3,
			fallbackDelayMs: 350
		});
	}, [
		catalogVideos,
		categories,
		hydrated,
		refreshing,
		tags
	]);
	(0, import_react.useEffect)(() => {
		const needle = query.trim().toLowerCase();
		if (!hydrated || !needle) return;
		let active = true;
		searchWorkerIndex.sync(catalogVideos, tags, categories);
		searchWorkerIndex.search(needle).then((ids) => {
			if (!active) return;
			if (ids === null) librarySearchIndex.sync(catalogVideos, tags, categories);
			const matches = ids === null ? librarySearchIndex.search(needle) ?? /* @__PURE__ */ new Set() : new Set(ids);
			useLibrary.setState({ searchResult: {
				query: needle,
				ids: matches,
				videos: catalogVideos,
				tags,
				categories
			} });
		});
		return () => {
			active = false;
		};
	}, [
		catalogVideos,
		categories,
		hydrated,
		query,
		tags
	]);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		const room = new URLSearchParams(window.location.search).get("room")?.trim().toUpperCase() ?? "";
		const invited = /^RC[A-Z0-9]{4,12}$/.test(room);
		setInvitedToTheater(invited);
		if (invited) setSource("watch-room");
	}, [hydrated, setSource]);
	const refreshFollows = useLibrary((s) => s.refreshFollows);
	const remoteRefreshStatus = useLibrary((s) => s.remoteRefreshStatus);
	const followRemoteQuery = useLibrary((s) => s.followRemoteQuery);
	const pushNotice = useLibrary((s) => s.pushNotice);
	const [channelRefreshing, setChannelRefreshing] = (0, import_react.useState)("");
	const drainArchiveQueue = async () => {
		if (archiveQueueBusyRef.current) return;
		const next = archiveQueueRef.current.shift();
		if (!next) return;
		archiveQueueBusyRef.current = true;
		setArchiveQueued(archiveQueueRef.current.map((item) => item.id));
		setChannelRefreshing(next.id);
		try {
			await followRemoteQuery(next.handle, "twitch");
		} catch {} finally {
			setChannelRefreshing("");
			archiveQueueBusyRef.current = false;
			drainArchiveQueue();
		}
	};
	const queueArchivePull = (id, handle) => {
		if (channelRefreshing === id || archiveQueueRef.current.some((item) => item.id === id)) return;
		archiveQueueRef.current.push({
			id,
			handle
		});
		setArchiveQueued(archiveQueueRef.current.map((item) => item.id));
		drainArchiveQueue();
	};
	const queueAllArchivePulls = () => {
		for (const channel of follows.filter((item) => item.kind === "twitch")) queueArchivePull(channel.id, channel.handle);
	};
	const refreshYoutubeCatalog = async () => {
		const state = useLibrary.getState();
		if (state.refreshing || state.remoteBusy) {
			toast.message("Another catalog pull is still running.");
			return;
		}
		if (!selectYoutubeSweepChannels(state.follows, Date.now(), LIBRARY_LIMITS.youtubeManualRefreshChannels, LIBRARY_LIMITS.youtubeCatalogRecheckExhaustedMs, {
			includeExhausted: true,
			includePlaylists: true
		}).length) {
			toast.message("Add a YouTube creator or public playlist to pull an archive.");
			return;
		}
		setChannelRefreshing("youtube-refresh");
		try {
			await refreshFollows("youtube", { catalog: true });
			const status = useLibrary.getState().remoteRefreshStatus;
			const added = useLibrary.getState().pullHistory[0]?.added ?? 0;
			const checked = status?.checked ?? 0;
			const failed = status?.failed ?? 0;
			if (!checked || failed === checked) {
				toast.error("YouTube did not return a channel catalog. Open Channel health for the provider result.");
				return;
			}
			const received = useLibrary.getState().pullHistory[0]?.received ?? 0;
			pushNotice({
				title: "YouTube refresh complete",
				body: `${added.toLocaleString()} new videos added · ${received.toLocaleString()} returned from ${checked - failed} checked creator/playlist source${checked - failed === 1 ? "" : "s"}${failed ? ` · ${failed} unavailable` : ""}.`,
				kind: "youtube"
			});
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "YouTube refresh failed.");
		} finally {
			setChannelRefreshing("");
		}
	};
	(0, import_react.useEffect)(() => {
		if (!hydrated || !follows.some((channel) => channel.kind === "twitch")) return;
		let cancelled = false;
		const tick = async () => {
			if (document.hidden || !navigator.onLine) return;
			const now = Date.now();
			if (now - twitchLastAttemptAt < remoteRefreshMs || useLibrary.getState().remoteBusy) return;
			twitchLastAttemptAt = now;
			const { wentLive, newVideos } = await refreshFollows("twitch", { backgroundLive: true });
			if (cancelled) return;
			const preferences = (() => {
				try {
					return JSON.parse(localStorage.getItem("reelcase.settings.v2") ?? "{}");
				} catch {
					return {};
				}
			})();
			if (preferences["alerts-go-live-alerts"] === true) for (const ch of wentLive) pushNotice({
				title: `${ch.title} is live`,
				body: "Tap to watch in Realhub.",
				kind: "twitch",
				videoId: `tw:${ch.handle}:live`
			});
			for (const v of newVideos.filter((video) => video.remote?.kind === "twitch" && preferences["alerts-new-twitch-vod-alerts"] === true).slice(0, 3)) pushNotice({
				title: v.name,
				body: v.remote?.channelName ?? "New Twitch video",
				kind: "twitch",
				videoId: v.id
			});
		};
		const id = window.setInterval(() => void tick(), remoteRefreshMs);
		const first = window.setTimeout(() => void tick(), 1500);
		const onVisibilityChange = () => {
			if (!document.hidden) tick();
		};
		document.addEventListener("visibilitychange", onVisibilityChange);
		return () => {
			cancelled = true;
			window.clearInterval(id);
			window.clearTimeout(first);
			document.removeEventListener("visibilitychange", onVisibilityChange);
		};
	}, [
		hydrated,
		follows.length,
		refreshFollows,
		pushNotice,
		remoteRefreshMs
	]);
	(0, import_react.useEffect)(() => {
		if (!hydrated || !follows.some((channel) => channel.kind === "youtube" && !channel.id.startsWith("ytpl:"))) return;
		const tick = async () => {
			if (document.hidden || !navigator.onLine) return;
			const state = useLibrary.getState();
			if (state.refreshing || state.remoteBusy) return;
			const now = Date.now();
			if (now - youtubeRecentLastAttemptAt < LIBRARY_LIMITS.youtubeRecentRefreshIntervalMs) return;
			youtubeRecentLastAttemptAt = now;
			await refreshFollows("youtube");
		};
		const first = window.setTimeout(() => void tick(), 12e3);
		const interval = window.setInterval(() => void tick(), 6e4);
		const onVisible = () => {
			if (!document.hidden) tick();
		};
		document.addEventListener("visibilitychange", onVisible);
		return () => {
			window.clearTimeout(first);
			window.clearInterval(interval);
			document.removeEventListener("visibilitychange", onVisible);
		};
	}, [
		hydrated,
		follows.length,
		refreshFollows
	]);
	(0, import_react.useEffect)(() => {
		if (!hydrated || !follows.some((channel) => channel.kind === "youtube")) return;
		const tick = async () => {
			if (document.hidden || !navigator.onLine) return;
			const state = useLibrary.getState();
			if (state.refreshing || state.remoteBusy) return;
			const now = Date.now();
			const saved = (() => {
				try {
					return Number(localStorage.getItem(YOUTUBE_SWEEP_KEY));
				} catch {
					return 0;
				}
			})();
			let latestCatalogCheck = 0;
			for (const channel of state.follows) if (channel.kind === "youtube") latestCatalogCheck = Math.max(latestCatalogCheck, channel.catalogCheckedAt ?? 0);
			if (!youtubeSweepDue(Math.max(saved, youtubeSweepLastAttemptAt, latestCatalogCheck), now, LIBRARY_LIMITS.youtubeCatalogSweepIntervalMs)) return;
			if (!selectYoutubeSweepChannels(state.follows, now, 1, LIBRARY_LIMITS.youtubeCatalogRecheckExhaustedMs).length) return;
			youtubeSweepLastAttemptAt = now;
			try {
				localStorage.setItem(YOUTUBE_SWEEP_KEY, String(now));
			} catch {}
			await refreshFollows("youtube", {
				catalog: true,
				scheduled: true
			});
		};
		const first = window.setTimeout(() => void tick(), 25e3);
		const interval = window.setInterval(() => void tick(), 6e4);
		const onVisible = () => {
			if (!document.hidden) tick();
		};
		document.addEventListener("visibilitychange", onVisible);
		return () => {
			window.clearTimeout(first);
			window.clearInterval(interval);
			document.removeEventListener("visibilitychange", onVisible);
		};
	}, [
		hydrated,
		follows.length,
		refreshFollows
	]);
	(0, import_react.useEffect)(() => {
		if (!hydrated || !follows.some((channel) => channel.kind === "youtube" && !channel.id.startsWith("ytpl:"))) return;
		const tick = async () => {
			if (document.hidden || !navigator.onLine) return;
			const state = useLibrary.getState();
			if (state.remoteBusy) return;
			const now = Date.now();
			const stored = (() => {
				try {
					return Number(localStorage.getItem(YOUTUBE_LIVE_KEY));
				} catch {
					return 0;
				}
			})();
			if (!youtubeSweepDue(Number.isFinite(stored) ? Math.max(stored, youtubeLiveLastAttemptAt) : youtubeLiveLastAttemptAt, now, LIBRARY_LIMITS.youtubeLiveRefreshIntervalMs)) return;
			if (!selectYoutubeLiveChannels(state.follows, 1).length) return;
			youtubeLiveLastAttemptAt = now;
			try {
				localStorage.setItem(YOUTUBE_LIVE_KEY, String(now));
			} catch {}
			await refreshFollows("youtube", { youtubeLiveOnly: true });
		};
		const first = window.setTimeout(() => void tick(), 5e3);
		const interval = window.setInterval(() => void tick(), 15e3);
		const onVisible = () => {
			if (!document.hidden) tick();
		};
		document.addEventListener("visibilitychange", onVisible);
		return () => {
			window.clearTimeout(first);
			window.clearInterval(interval);
			document.removeEventListener("visibilitychange", onVisible);
		};
	}, [
		hydrated,
		follows.length,
		refreshFollows
	]);
	(0, import_react.useEffect)(() => {
		if (!hydrated || sourceId !== "adults") return;
		let cancelled = false;
		let cursor = 0;
		const tick = async () => {
			if (cancelled || document.hidden || !navigator.onLine) return;
			const state = useLibrary.getState();
			if (state.remoteBusy || state.refreshing) return;
			let adultCount = 0;
			let redditCount = 0;
			for (const video of state.videos) {
				if (!video.remote || !ADULT_PULL_PROVIDERS.includes(video.remote.kind)) continue;
				adultCount += 1;
				if (video.remote.kind === "reddit") redditCount += 1;
				if (adultCount >= LIBRARY_LIMITS.adultTargetCatalogVideos) return;
			}
			const redditFloor = Math.max(200, Math.floor(adultCount * .2));
			const provider = redditCount < redditFloor ? "reddit" : ADULT_PULL_PROVIDERS[cursor % ADULT_PULL_PROVIDERS.length];
			cursor += 1;
			const page = loadAdultArchiveCursors("all", "top-weekly")[provider]?.page ?? 1;
			try {
				await state.searchAdultFeed("all", "top-weekly", {
					append: true,
					providers: [provider],
					maxVideos: LIBRARY_LIMITS.adultRefreshVideosPerTick,
					providerPages: { [provider]: page }
				});
			} catch {}
		};
		const first = window.setTimeout(() => void tick(), 8e3);
		const id = window.setInterval(() => void tick(), LIBRARY_LIMITS.adultRefreshIntervalMs);
		return () => {
			cancelled = true;
			window.clearTimeout(first);
			window.clearInterval(id);
		};
	}, [hydrated, sourceId]);
	const prevScanning = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const was = prevScanning.current;
		prevScanning.current = scanning;
		if (was && !scanning) {
			const folder = useLibrary.getState().folders.find((f) => f.name === was.folderName);
			const n = folder?.videoCount ?? 0;
			if (n === 0 && folder?.photoCount) toast.success(`Found ${folder.photoCount} photo${folder.photoCount === 1 ? "" : "s"} in ${was.folderName}`);
			else if (n > 0) toast.success(`Found ${n} video${n === 1 ? "" : "s"} in ${was.folderName}`);
		}
	}, [scanning]);
	(0, import_react.useEffect)(() => {
		let depth = 0;
		const prevent = (e) => e.preventDefault();
		const enter = (e) => {
			e.preventDefault();
			depth += 1;
			setDragging(true);
		};
		const leave = (e) => {
			e.preventDefault();
			depth -= 1;
			if (depth <= 0) {
				depth = 0;
				setDragging(false);
			}
		};
		const drop = (e) => {
			e.preventDefault();
			depth = 0;
			setDragging(false);
			if (!e.dataTransfer) return;
			ingestDrop(e.dataTransfer).catch((err) => {
				toast.error(err instanceof Error ? err.message : "Could not read files");
			});
		};
		window.addEventListener("dragenter", enter);
		window.addEventListener("dragleave", leave);
		window.addEventListener("dragover", prevent);
		window.addEventListener("drop", drop);
		return () => {
			window.removeEventListener("dragenter", enter);
			window.removeEventListener("dragleave", leave);
			window.removeEventListener("dragover", prevent);
			window.removeEventListener("drop", drop);
		};
	}, [ingestDrop]);
	const heading = (0, import_react.useMemo)(() => {
		if (sourceId === "continue") return "Continue watching";
		if (sourceId === "favorites") return "Favorites";
		if (sourceId === "history") return "History";
		if (sourceId === "movies") return "Movies";
		if (sourceId === "home") return "Home";
		if (sourceId === "adults") return "Adults";
		if (sourceId === "youtube") return "YouTube";
		if (sourceId === "twitch") return "Twitch";
		if (sourceId === "live") return "Live";
		return folders.find((f) => f.id === sourceId)?.name ?? "Library";
	}, [sourceId, folders]);
	const onAddFolder = (startIn, adult) => {
		pendingAdult.current = Boolean(adult);
		addFolder(dirInputRef.current, startIn, { adult }).catch((err) => {
			const message = err instanceof Error ? err.message : "Could not open folder";
			toast.error(/system files|system folder|not allowed/i.test(message) ? "Choose a media subfolder instead. Windows system folders cannot be cataloged; use Folder to pick Videos, Downloads, or a dedicated library folder." : message);
		});
	};
	const playlist = videos.map((v) => v.id);
	const playedAt = (0, import_react.useMemo)(() => {
		const map = {};
		for (const h of history) if (map[h.id] == null) map[h.id] = h.at;
		return map;
	}, [history]);
	const historyVisibleEntries = (0, import_react.useMemo)(() => {
		const cutoff = historyWindow === "day" ? Date.now() - 864e5 : historyWindow === "week" ? Date.now() - 6048e5 : 0;
		return history.filter((entry) => entry.at >= cutoff && (historySource === "all" || (entry.source ?? "open") === historySource));
	}, [
		history,
		historySource,
		historyWindow
	]);
	const historyFilteredVideos = (0, import_react.useMemo)(() => {
		const visibleIds = new Set(historyVisibleEntries.map((entry) => entry.id));
		return historyVideos.filter((video) => visibleIds.has(video.id));
	}, [historyVideos, historyVisibleEntries]);
	const historyVideoById = (0, import_react.useMemo)(() => new Map(catalogVideos.map((video) => [video.id, video])), [catalogVideos]);
	const historyOrphans = (0, import_react.useMemo)(() => history.filter((entry) => !historyVideoById.has(entry.id) && Boolean(entry.url)).length, [history, historyVideoById]);
	const historyRetentionCutoff = historyRetention === "week" ? Date.now() - 6048e5 : historyRetention === "month" ? Date.now() - 2592e6 : historyRetention === "year" ? Date.now() - 31536e6 : 0;
	const exportHistory = () => {
		const rows = historyVisibleEntries.map((entry) => ({
			id: entry.id,
			eventId: entry.eventId ?? `${entry.id}:${entry.at}:${entry.source ?? "open"}`,
			occurredAt: new Date(entry.at).toISOString(),
			localTime: new Date(entry.at).toLocaleString(),
			source: entry.source ?? "open",
			positionSeconds: entry.position ?? null,
			durationSeconds: entry.duration ?? null,
			url: entry.url ?? null,
			title: historyVideoById.get(entry.id)?.name ?? "Recovered activity"
		}));
		const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = `reelcase-history-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
		link.click();
		URL.revokeObjectURL(link.href);
	};
	const browsing = !query && (sourceId === "home" || sourceId === "movies" || sourceId === "adults" || sourceId === "adult-fetishes" || sourceId === "youtube" || sourceId === "twitch" || sourceId === "live");
	const isHubSection = [
		"photos",
		"anime",
		"spotify",
		"prints",
		"games",
		"shop",
		"streaming",
		"social",
		"watch-room",
		"settings",
		"stats",
		"genres",
		"assistant",
		"mission-plan",
		"connection",
		"find-phone"
	].includes(sourceId) || invitedToTheater;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "sticky top-0 hidden h-dvh w-60 shrink-0 overflow-y-auto border-r border-border bg-surface/80 px-3 py-5 lg:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarNav, { onAddFolder: (adult) => onAddFolder(void 0, adult) })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open: menuOpen,
				onOpenChange: setMenuOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
					side: "left",
					className: "overflow-y-auto bg-surface p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
						className: "sr-only",
						children: "Library menu"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarNav, {
						onAddFolder: (adult) => {
							setMenuOpen(false);
							onAddFolder(void 0, adult);
						},
						onNavigate: () => setMenuOpen(false)
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
					onMenu: () => setMenuOpen(true),
					onAddFolder: () => onAddFolder()
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
					className: "w-full max-w-none flex-1 px-4 py-6 sm:px-6 xl:px-8 2xl:px-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PullStatusBanner, {}), isHubSection ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
						fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
							className: "rounded-xl bg-elevated p-8 text-sm text-muted shadow-border",
							children: "Loading this library workspace…"
						}),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							sourceId === "prints" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrintsSection, {}),
							sourceId === "anime" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimeSection, {}),
							sourceId === "photos" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotosSection, {}),
							sourceId === "spotify" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpotifySection, {}),
							sourceId === "games" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GamesSection, {}),
							sourceId === "shop" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopSection, {}),
							sourceId === "streaming" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StreamingSection, {}),
							sourceId === "social" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialSection, {}),
							(sourceId === "watch-room" || invitedToTheater) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WatchRoomSection, {}),
							sourceId === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSection, {}),
							sourceId === "stats" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatsSection, {}),
							sourceId === "connection" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanConnectionSection, {}),
							sourceId === "find-phone" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FindPhoneSection, {}),
							sourceId === "genres" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GenreSection, {}),
							sourceId === "assistant" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AiGuide, {}),
							sourceId === "mission-plan" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MissionPlanSection, {})
						] })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						sourceId === "home" && !query && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiscoveryDesk, { videos }),
						!hasUserFolders && sourceId === "home" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InviteStrip, {
							onAddFolder: () => onAddFolder(),
							onAddFiles: () => fileInputRef.current?.click(),
							onRecommended: (id) => onAddFolder(id)
						}),
						sourceId === "home" && !query && !follows.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectPanel, { defaultKind: "youtube" }, "home-imports"),
						sourceId === "movies" && !query && (randomSourceMovies[0] || featured) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Billboard, { video: randomSourceMovies[0] ?? featured }),
						sourceId === "adults" && adultFeatured && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Billboard, { video: adultFeatured }),
						sourceId === "home" && browsing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-elevated px-4 py-3 shadow-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "Local picks rotate inside your taste matches, so the same few titles do not take over Home."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => setHomePickShuffle(Date.now()),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-4" }), " Mix local picks"]
								})]
							}),
							!homeRecommendationsReady && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-8 flex min-h-12 items-center gap-3 rounded-lg bg-elevated/70 px-4 py-3 text-sm text-muted shadow-border",
								role: "status",
								"aria-live": "polite",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-accent" }), "Preparing recommendations after the first screen…"]
							}),
							homeRecommendationsReady && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RatingStreakCard, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Recently added from your folders",
									reason: "Fresh additions from your local folders.",
									videos: homeLocalRecent,
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Unseen & ready to discover",
									reason: "Less-played titles, rotated so familiar picks do not take over.",
									videos: freshPicks,
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Top-rated local picks",
									reason: "Built from your ratings, likes, and saved favorites.",
									videos: topRatedLocalPicks,
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Live now",
									reason: "Channels confirmed live in the latest check.",
									videos: currentLiveVideos,
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "New this week",
									reason: "Recently published or added from your saved sources.",
									videos: newThisWeek,
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: follows.length ? "Latest from your channels" : "Fresh from YouTube",
									reason: "The newest uploads from creators you follow.",
									videos: homeLatestChannels,
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "mb-8",
									variant: "secondary",
									onClick: () => setHomeExpanded((value) => !value),
									children: homeExpanded ? "Show fewer home shelves" : "Show more home shelves"
								}),
								homeExpanded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
										title: "Continue watching",
										reason: "Items with a saved, unfinished watch position.",
										videos: continueVideos,
										variant: "rail"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
										title: "From YouTube",
										reason: "Your saved YouTube channel cache.",
										videos: youtubeVideos.filter((video) => !video.isSample),
										variant: "rail"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
										title: "Twitch",
										reason: "Live and archived videos from your followed Twitch creators.",
										videos: twitchVideos.filter((video) => !video.isSample && !isOfflineChannelCard(video)),
										variant: "rail"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
										title: "Every local source",
										videos: homeLocalRecent,
										variant: "rail"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
										title: "Favorites",
										reason: "Titles you explicitly saved.",
										videos: favoriteVideos,
										variant: "rail"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
										title: "Short films & quick watches",
										videos: videos.filter((video) => !video.isSample && (video.collection === "shorts" || (video.duration ?? 0) > 0 && (video.duration ?? 0) < 1800)).slice(0, 18),
										variant: "rail"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
										title: "Browse by genre",
										videos: moviesByGenre.filter((video) => !video.isSample).slice(0, 24),
										variant: "rail"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
										title: "History",
										videos: historyVideos,
										variant: "rail",
										playedAt
									}),
									publicFolders.slice(0, 12).map((folder) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
										title: `${folder.name} · local source`,
										videos: videos.filter((v) => v.folderId === folder.id).slice(0, 24),
										variant: "rail",
										onTitleClick: () => setSource(folder.id)
									}, folder.id))
								] })
							] })
						] }),
						sourceId === "youtube" && browsing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-7 overflow-hidden rounded-xl border border-border bg-surface shadow-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-6 bg-elevated/60 p-5 sm:p-7 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-medium tracking-[0.16em] text-accent uppercase",
												children: "YouTube · your archive"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
												className: "mt-2 font-display text-4xl tracking-tight text-fg sm:text-5xl",
												children: "More of what you watch."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-3 max-w-2xl text-sm leading-6 text-muted",
												children: "Recommendations learn from watched creators, tag likes, ratings, and watch time. Archive pulls resume across creators fairly; older public uploads stay in each creator’s catalog."
											})
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												disabled: channelRefreshing === "youtube-refresh" || !follows.some((channel) => channel.kind === "youtube"),
												onClick: () => void refreshYoutubeCatalog(),
												children: channelRefreshing === "youtube-refresh" ? "Pulling all sources…" : "Pull all creators & playlists"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "secondary",
												onClick: () => setYoutubeHealthVisible((value) => !value),
												children: youtubeHealthVisible ? "Hide pull health" : "Pull health"
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 divide-x divide-y divide-border border-t border-border sm:grid-cols-4 sm:divide-y-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-4 sm:px-5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted",
													children: "Following"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 font-display text-2xl tabular-nums text-fg",
													children: follows.filter((channel) => channel.kind === "youtube").length.toLocaleString()
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-4 sm:px-5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted",
													children: "Cached videos"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 font-display text-2xl tabular-nums text-fg",
													children: youtubeVideos.length.toLocaleString()
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-4 sm:px-5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted",
													children: "Creators you watched"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 font-display text-2xl tabular-nums text-fg",
													children: watchedYoutubeCreators.size.toLocaleString()
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-4 sm:px-5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted",
													children: "Last YouTube live check"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 truncate text-sm font-medium text-fg",
													children: youtubeLiveCheckedAt ? new Date(youtubeLiveCheckedAt).toLocaleString([], {
														month: "short",
														day: "numeric",
														hour: "numeric",
														minute: "2-digit"
													}) : "Not checked yet"
												})]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "border-t border-border px-5 py-3 text-xs text-muted sm:px-7",
										children: [
											"Live checks rotate every minute. Recent uploads check a small creator batch every 5 minutes. Background archive sweeps run once an hour while the app is visible, covering up to ",
											LIBRARY_LIMITS.youtubeScheduledRefreshChannels,
											" creator or playlist and ",
											LIBRARY_LIMITS.youtubeScheduledVideosPerChannel,
											" videos. Pull all is the explicit deep action: it walks every eligible source, up to ",
											LIBRARY_LIMITS.youtubeManualRefreshVideosPerChannel.toLocaleString(),
											" uploads per creator and ",
											LIBRARY_LIMITS.youtubePlaylistVideosPerPull.toLocaleString(),
											" videos per playlist. Historical cached uploads do not expire automatically. ",
											remoteRefreshStatus ? `Last archive/feed refresh checked ${remoteRefreshStatus.refreshed}/${remoteRefreshStatus.checked} sources · ${remoteRefreshStatus.youtube.toLocaleString()} videos returned · ${remoteRefreshStatus.failed} failed.` : "Select specific creators below to target their archive."
										]
									}),
									youtubeHealthVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YoutubeFirstClickStatus, {}),
									youtubeHealthVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
										children: youtubeHealth.map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
											className: "rounded-sm bg-bg/45 p-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "truncate text-sm font-medium text-fg",
													children: channel.title
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 text-xs text-muted",
													children: [
														channel.cached.toLocaleString(),
														" cached · last result ",
														channel.lastResponseCount ?? 0,
														" rows"
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 text-xs text-muted",
													children: [
														channel.newest ? `Newest ${new Date(channel.newest).toLocaleDateString()}` : "No published item cached",
														" · ",
														channel.lastCheckedAt ? `checked ${new Date(channel.lastCheckedAt).toLocaleString([], {
															month: "short",
															day: "numeric",
															hour: "numeric",
															minute: "2-digit"
														})}` : "not checked yet"
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 text-xs text-muted",
													children: [
														channel.catalogCursor ? "Archive paging in progress" : channel.catalogExhaustedAt ? "Public archive reached" : "Archive sweep not started",
														" · ",
														channel.lastProviderFailure ? `${channel.lastProviderFailure.kind.replaceAll("-", " ")} · ${channel.lastProviderFailure.recovery}` : channel.retryAt && channel.retryAt > Date.now() ? `Retry ${new Date(channel.retryAt).toLocaleTimeString([], {
															hour: "numeric",
															minute: "2-digit"
														})}` : "Provider ready"
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 text-xs text-muted",
													children: channel.cache ? `${channel.cache.scope === "catalog" ? "Catalog cache" : channel.cache.scope === "feed" ? "Feed cache" : "Not retained"} · ${Math.max(0, Math.floor((Date.now() - channel.cache.at) / 1e3))}s old · ${Math.round(channel.cache.hits / Math.max(1, channel.cache.hits + channel.cache.misses) * 100)}% hit rate` : "Cache telemetry appears after the first refresh"
												}),
												channel.lastProviderFailure && channel.retryAt && channel.retryAt > Date.now() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 text-xs text-accent",
													children: ["Retry ", new Date(channel.retryAt).toLocaleTimeString([], {
														hour: "numeric",
														minute: "2-digit",
														second: "2-digit"
													})]
												})
											]
										}, channel.id))
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FollowManager, { kind: "youtube" }),
							youtubePlaylistShelves.map((playlist) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: `Playlist · ${playlist.title}`,
								reason: "Public playlist saved to your library.",
								videos: playlist.videos,
								variant: "rail",
								onTitleClick: () => setSource(playlist.id)
							}, playlist.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Latest uploads",
								videos: filteredYoutube,
								variant: "rail",
								priority: true
							}),
							youtubeExploreVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "More from creators you watch",
								reason: "Unwatched public uploads from recent viewing creators, including older catalog items.",
								videos: deeperFromWatchedCreators.filter((video) => youtubeTagFilter === "all" || topicsForVideo(video, tags[video.id]).includes(youtubeTagFilter)),
								variant: "rail"
							}),
							!youtubeExploreVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-6 rounded-xl border border-border bg-surface p-5 shadow-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
										children: "Fast start"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-2 font-display text-2xl text-fg",
										children: "Open YouTube fast, then deepen the catalog when you want it."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: "Recommendations, artwork-heavy discovery shelves, tag filters, and the full grid wait until requested. Your newest uploads are ready immediately."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "mt-4",
										variant: "secondary",
										onClick: () => setYoutubeExploreVisible(true),
										children: "Explore recommendations and full catalog"
									})
								]
							}),
							youtubeExploreVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Trending in your tracked channels",
									videos: trendingYoutube,
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "New to you on YouTube",
									videos: freshPicks.filter((video) => video.remote?.kind === "youtube" && (youtubeTagFilter === "all" || topicsForVideo(video, tags[video.id]).includes(youtubeTagFilter))),
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "More from your rated YouTube",
									videos: relatedYoutube.filter((video) => youtubeTagFilter === "all" || topicsForVideo(video, tags[video.id]).includes(youtubeTagFilter)),
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Quick picks",
									videos: filteredYoutube.filter((video) => (video.duration ?? 0) > 0 && (video.duration ?? 0) < 1200),
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-5 flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: youtubeTagFilter === "all" ? "default" : "secondary",
										onClick: () => setYoutubeTagFilter("all"),
										children: "All tags"
									}), channelTagShelves.youtube.map((shelf) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: youtubeTagFilter === shelf.tag ? "default" : "secondary",
										onClick: () => setYoutubeTagFilter(shelf.tag),
										children: [
											"#",
											shelf.tag,
											" · ",
											shelf.videos.length
										]
									}, shelf.tag))]
								}),
								youtubeTagFilter !== "all" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "-mt-2 mb-5 text-xs text-accent",
									children: [
										"Filtering every YouTube shelf and the full catalog by #",
										youtubeTagFilter,
										" · ",
										filteredYoutube.length.toLocaleString(),
										" matching videos."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									className: "mb-6 rounded-xl border border-border bg-surface p-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
											children: "Creator discovery"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "mt-2 font-display text-2xl text-fg",
											children: "Outside your known follows."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted",
											children: "Discovery stays in its own shelf so saved channels never get mixed with suggestions. Follow adds a channel to your saved refresh list."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-4",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
												title: "Explore new YouTube",
												videos: youtubeDiscovery,
												variant: "rail"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-4 flex flex-wrap gap-2",
											children: [
												["Kurzgesagt", "kurzgesagt"],
												["Veritasium", "veritasium"],
												["PBS Space Time", "pbsspacetime"]
											].filter(([, handle]) => !follows.some((channel) => channel.kind === "youtube" && channel.handle.toLowerCase() === handle)).map(([label, handle]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "secondary",
												disabled: channelRefreshing === handle,
												onClick: () => void (async () => {
													setChannelRefreshing(handle);
													try {
														await followRemoteQuery(handle, "youtube");
													} finally {
														setChannelRefreshing("");
													}
												})(),
												children: channelRefreshing === handle ? "Checking…" : `Follow ${label}`
											}, handle))
										})
									]
								}),
								!youtubeDeepVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									className: "mb-6 rounded-xl border border-border bg-surface p-5 shadow-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
											children: "Deep discovery"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "mt-2 font-display text-2xl text-fg",
											children: "Browse creator and topic shelves."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted",
											children: "These shelves remain optional so opening YouTube stays responsive even with a very large archive."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											className: "mt-4",
											variant: "secondary",
											onClick: () => setYoutubeDeepVisible(true),
											children: "Load creator and topic shelves"
										})
									]
								}),
								youtubeDeepVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [youtubeCreatorShelves.map(({ creator, videos }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: `From ${creator}`,
									videos,
									variant: "rail"
								}, creator)), channelTagShelves.youtube.map((shelf) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: `YouTube · ${shelf.tag}`,
									videos: shelf.videos,
									variant: "rail"
								}, `youtube-tag-${shelf.tag}`))] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosterGrid, { videos: filteredYoutube })
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectPanel, {
								defaultKind: "youtube",
								lockedKind: "youtube"
							}, "youtube-imports")
						] }),
						sourceId === "twitch" && browsing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-7 rounded-xl bg-elevated p-5 shadow-border sm:p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
										children: "Live desk"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "mt-2 font-display text-4xl text-fg",
										children: "Twitch, live first."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 max-w-2xl text-sm text-muted",
										children: [
											"Sort live streams and VODs by what matters right now. ",
											follows.filter((channel) => channel.kind === "twitch").length,
											" channel",
											follows.filter((channel) => channel.kind === "twitch").length === 1 ? "" : "s",
											" tracked locally. A different rotating batch checks every minute; a successful check removes stale live cards."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-xs text-accent",
										children: [
											remoteCheckedAt ? `Live state checked ${new Date(remoteCheckedAt).toLocaleTimeString([], {
												hour: "numeric",
												minute: "2-digit"
											})}` : "Live state has not been checked yet.",
											" · ",
											sortedTwitch.filter((video) => video.remote?.live).length,
											" live · ",
											twitchVodPicks.length,
											" VODs · ",
											twitchClipTotal.toLocaleString(),
											" clips",
											remoteRefreshStatus ? ` · last batch returned ${remoteRefreshStatus.twitch.toLocaleString()} VODs from ${remoteRefreshStatus.refreshed}/${remoteRefreshStatus.checked} checked channels${remoteRefreshStatus.failed ? ` (${remoteRefreshStatus.failed} unavailable)` : ""}` : ""
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-wrap gap-2",
										children: [
											[
												"live",
												"viewers",
												"name"
											].map((sort) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: twitchSort === sort ? "default" : "secondary",
												onClick: () => setTwitchSort(sort),
												children: sort === "live" ? "Live first" : sort === "viewers" ? "Most viewers" : "A–Z"
											}, sort)),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "secondary",
												onClick: () => void refreshFollows(),
												children: "Refresh next live batch"
											}),
											follows.filter((channel) => channel.kind === "twitch").slice(0, 12).map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												disabled: channelRefreshing === channel.id,
												onClick: () => void (async () => {
													setChannelRefreshing(channel.id);
													try {
														await followRemoteQuery(channel.handle, "twitch");
													} finally {
														setChannelRefreshing("");
													}
												})(),
												children: channelRefreshing === channel.id ? "Checking…" : `Refresh ${channel.title}`
											}, channel.id))
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FollowManager, { kind: "twitch" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-5 flex flex-wrap gap-2",
								children: [
									["all", "All Twitch"],
									["favorites", "Favorites"],
									["likes", "Liked"]
								].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: twitchFilter === value ? "default" : "secondary",
									onClick: () => setTwitchFilter(value),
									children: [label, value === "all" ? "" : " · " + twitchVideos.filter((video) => value === "favorites" ? favorites[video.id] : likes[video.id]).length]
								}, value))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-5 flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: twitchTagFilter === "all" ? "default" : "secondary",
									onClick: () => setTwitchTagFilter("all"),
									children: "All tags"
								}), channelTagShelves.twitch.map((shelf) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: twitchTagFilter === shelf.tag ? "default" : "secondary",
									onClick: () => setTwitchTagFilter(shelf.tag),
									children: [
										"#",
										shelf.tag,
										" · ",
										shelf.videos.length
									]
								}, shelf.tag))]
							}),
							twitchFilter === "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Favorite Twitch videos",
								videos: favoriteTwitchPicks,
								variant: "rail"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Liked on Twitch · discovery",
								videos: likedTwitchPicks,
								variant: "rail"
							})] }) : null,
							twitchFilter !== "all" && !sortedTwitch.some((video) => twitchFilter === "favorites" ? favorites[video.id] : likes[video.id]) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-6 rounded-lg border border-border p-6 text-muted",
								children: "Nothing saved here yet. Use the heart or like action on a Twitch video to keep it here between visits."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: twitchFilter === "all" ? "Your Twitch mix" : twitchFilter === "favorites" ? "Your favorites" : "Your liked videos",
								videos: sortedTwitch.filter((video) => twitchFilter === "all" || (twitchFilter === "favorites" ? favorites[video.id] : likes[video.id])),
								variant: "rail"
							}),
							twitchFilter === "all" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "New to you on Twitch",
								videos: freshPicks.filter((video) => video.remote?.kind === "twitch"),
								variant: "rail"
							}),
							twitchFilter === "all" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Live",
									videos: sortedTwitch.filter((video) => video.remote?.live),
									variant: "rail"
								}),
								liveChannelVods.map(({ creator, vods }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: `${creator} · recent VODs`,
									videos: vods,
									variant: "rail"
								}, creator)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Popular VODs",
									videos: twitchVodPicks,
									variant: "rail"
								}),
								twitchVodChannels.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									className: "mb-8 rounded-xl border border-border bg-surface p-5 shadow-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
											children: "VOD explorer"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "mt-2 font-display text-2xl text-fg",
											children: "Browse VODs by creator."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted",
											children: "Channels rise through your plays, saves, likes, high ratings, and the tags those highly rated videos share."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-5 space-y-6",
											children: twitchVodChannels.map(({ creator, vods }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
												title: `${creator} · ${vods.length} VOD${vods.length === 1 ? "" : "s"}`,
												videos: vods,
												variant: "rail"
											}, `vod-explorer-${creator}`))
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									className: "mb-5 rounded-lg border border-border bg-surface p-4 shadow-border",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-end justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
											children: "Numbered clip pulls"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-sm text-muted",
											children: [twitchClipTotal.toLocaleString(), " clips cached · pull a counted window per channel (public clip shelves, multi-period, rate-limit friendly)."]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex flex-wrap gap-2",
											children: LIBRARY_LIMITS.twitchClipPullChoices.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "secondary",
												disabled: Boolean(channelRefreshing) || !follows.some((channel) => channel.kind === "twitch"),
												onClick: () => void (async () => {
													const channels = follows.filter((channel) => channel.kind === "twitch");
													setChannelRefreshing("twitch-clips");
													try {
														for (const channel of channels.slice(0, 12)) {
															setChannelRefreshing(channel.id);
															await followRemoteQuery(channel.handle, "twitch", { clipLimit: n });
														}
													} finally {
														setChannelRefreshing("");
													}
												})(),
												children: channelRefreshing === "twitch-clips" || channelRefreshing.startsWith("tw:") && channelRefreshing !== "" ? `Pulling ${n}…` : `Pull ${n} clips`
											}, n))
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 flex flex-wrap gap-2",
										children: follows.filter((channel) => channel.kind === "twitch").slice(0, 8).map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center gap-1 rounded-sm bg-bg/45 px-2 py-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted",
												children: channel.title
											}), LIBRARY_LIMITS.twitchClipPullChoices.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												disabled: channelRefreshing === channel.id,
												onClick: () => void (async () => {
													setChannelRefreshing(channel.id);
													try {
														await followRemoteQuery(channel.handle, "twitch", { clipLimit: n });
													} finally {
														setChannelRefreshing("");
													}
												})(),
												children: n
											}, `${channel.id}-${n}`))]
										}, `clips-${channel.id}`))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									className: "mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 shadow-border",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
										children: "Clip shuffle"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-sm text-muted",
										children: [
											"A balanced random window from ",
											twitchClipTotal.toLocaleString(),
											" cached clips. Shuffle to discover older clips across creators without loading the whole archive into cards."
										]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											"aria-label": "Clip creator",
											className: "min-h-11 rounded-md border border-border bg-bg px-3 text-sm text-fg",
											value: twitchClipCreator,
											onChange: (event) => setTwitchClipCreator(event.target.value),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "all",
												children: "All creators"
											}), follows.filter((channel) => channel.kind === "twitch").map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: channel.title,
												children: channel.title
											}, channel.id))]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "secondary",
											onClick: () => setTwitchClipSeed((seed) => seed + 1),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "mr-2 size-4" }), "Shuffle clips"]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: `Clips to explore · ${twitchClipTotal.toLocaleString()} cached`,
									videos: twitchClips,
									variant: "rail"
								}),
								channelTagShelves.twitch.map((shelf) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: `Twitch · ${shelf.tag}`,
									videos: shelf.videos,
									variant: "rail"
								}, `twitch-tag-${shelf.tag}`))
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
								className: "mb-5 rounded-lg border border-border bg-surface p-4 shadow-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
										className: "cursor-pointer list-none",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
												children: "Archive coverage"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-1 text-sm text-muted",
												children: [
													twitchArchiveDepth.total.toLocaleString(),
													" cached VODs across ",
													twitchArchiveDepth.channels.length,
													" channels · expand to review and queue deep pulls."
												]
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-accent",
												children: "Expand"
											})]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-wrap items-end justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
												children: "Archive coverage"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-1 text-sm text-fg",
												children: [
													twitchArchiveDepth.total.toLocaleString(),
													" cached VODs across ",
													twitchArchiveDepth.channels.length,
													" channels · ",
													twitchArchiveDepth.sparse,
													" sparse channel",
													twitchArchiveDepth.sparse === 1 ? "" : "s",
													" under 24 VODs."
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-xs text-muted",
												children: "Background checks use a fast recent-VOD window. Focused pulls run serially through the queued creators, so live-state checks retain their budget. Partial responses preserve the existing archive."
											})
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "secondary",
												disabled: channelRefreshing === "twitch-archives",
												onClick: () => void (async () => {
													setChannelRefreshing("twitch-archives");
													try {
														await refreshFollows();
													} finally {
														setChannelRefreshing("");
													}
												})(),
												children: channelRefreshing === "twitch-archives" ? "Refreshing archives…" : "Refresh Twitch archives"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "secondary",
												disabled: Boolean(channelRefreshing) || archiveQueued.length > 0,
												onClick: queueAllArchivePulls,
												children: "Queue all deep pulls"
											})]
										})]
									}),
									archiveQueued.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 rounded-sm bg-bg/45 px-3 py-2 text-xs text-accent",
										children: [
											"Focused archive queue · ",
											archiveQueued.length,
											" waiting. Realhub continues creator-by-creator toward the oldest public VOD available; it retains every accepted page."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
										children: twitchArchiveDepth.channels.map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "rounded-sm bg-bg/45 p-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-start justify-between gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "min-w-0",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "truncate text-sm font-medium text-fg",
															children: channel.name
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
															className: "mt-1 text-xs text-muted",
															children: [
																channel.count.toLocaleString(),
																" cached VODs · ",
																channel.clips,
																" confirmed clip",
																channel.clips === 1 ? "" : "s",
																" · last result ",
																channel.lastResponseCount ?? 0,
																" rows"
															]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
															className: "mt-1 text-xs text-muted",
															children: [channel.oldest ? `${new Date(channel.oldest).toLocaleDateString()} – ${new Date(channel.newest).toLocaleDateString()}` : "No archive dates yet", " · public depth may be limited"]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "mt-1 text-xs text-muted",
															children: channel.lastProviderFailure ? `${channel.lastProviderFailure.kind.replaceAll("-", " ")} · ${channel.lastProviderFailure.recovery}` : channel.lastCheckedAt ? `Checked ${new Date(channel.lastCheckedAt).toLocaleString([], {
																month: "short",
																day: "numeric",
																hour: "numeric",
																minute: "2-digit"
															})}` : "Not checked yet"
														}),
														channel.retryAt && channel.retryAt > Date.now() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
															className: "mt-1 text-xs text-accent",
															children: ["Cooldown until ", new Date(channel.retryAt).toLocaleTimeString([], {
																hour: "numeric",
																minute: "2-digit",
																second: "2-digit"
															})]
														})
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "secondary",
													disabled: channelRefreshing === channel.id || archiveQueued.includes(channel.id),
													onClick: () => queueArchivePull(channel.id, channel.id.replace(/^tw:/, "")),
													children: channelRefreshing === channel.id ? "Pulling…" : archiveQueued.includes(channel.id) ? "Queued" : "Queue deep pull"
												})]
											})
										}, channel.id))
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosterGrid, { videos: sortedTwitch.filter((video) => (twitchFilter === "all" || (twitchFilter === "favorites" ? favorites[video.id] : likes[video.id])) && (twitchTagFilter === "all" || topicsForVideo(video, tags[video.id]).includes(twitchTagFilter))) }),
							!twitchVideos.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "Add a channel from the follow manager below to fill this shelf."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectPanel, {
								defaultKind: "twitch",
								lockedKind: "twitch"
							}, "twitch-imports")
						] }),
						sourceId === "live" && browsing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveDesk, {
							videos: currentLiveVideos,
							staleTwitchCount: liveVideos.filter((video) => video.remote?.kind === "twitch").length - currentLiveVideos.filter((video) => video.remote?.kind === "twitch").length,
							staleYoutubeCount: liveVideos.filter((video) => video.remote?.kind === "youtube").length - currentLiveVideos.filter((video) => video.remote?.kind === "youtube").length,
							adultLiveVideos: adultRemoteVideos.filter((video) => adultKind(video) === "live")
						}),
						sourceId === "movies" && browsing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-5 flex items-center justify-between gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
										className: "font-display text-4xl text-fg",
										children: ["Movies ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xl text-muted",
											children: movieCatalog.length
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: "Liked titles stay at the front. Change the order when you want a surprise."
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "secondary",
										size: "sm",
										onClick: () => setMovieShuffle(Date.now()),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-4" }), " Random pick"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "secondary",
										size: "sm",
										onClick: () => void restoreFolders(),
										children: "Reload local files"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "From your source folders",
								videos: randomSourceMovies,
								variant: "poster"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Random from your library",
								videos: randomSourceMovies,
								variant: "poster"
							}),
							movieTypeShelves.map((shelf) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: `${shelf.type} files · ${shelf.videos.length}`,
								videos: shelf.videos,
								variant: "poster"
							}, shelf.type)),
							priorityMovieGenres.map((shelf) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: `${shelf.genre} first`,
								videos: shelf.videos,
								variant: "poster"
							}, shelf.genre)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "All movies",
								videos: randomSourceMovies.filter((video) => !isClassicVideo(video)),
								variant: "poster"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Classic movies",
								videos: classics,
								variant: "poster"
							}),
							!movieCatalog.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-surface px-6 py-14 text-center shadow-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-2xl text-fg",
									children: "Your movie cache is warming up"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mx-auto mt-2 max-w-md text-sm text-muted",
									children: "Local titles return here from the durable catalog even while a folder needs reconnection. Use Reload local files only if the source is missing from the sidebar."
								})]
							}),
							classics.length === 0 && videos.length === 0 ? null : null
						] }),
						sourceId === "adult-fetishes" && browsing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
							fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
								className: "mb-6 rounded-xl bg-surface p-5 text-sm text-muted shadow-border",
								role: "status",
								children: "Opening the Adult explorer…"
							}),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdultFetishExplorer, { onSelectedTag: (tag) => {
								setAdultExplorerTag(tag);
								setAdultTag(tag);
							} })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "mb-6 rounded-xl border border-border bg-surface p-5 shadow-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
										children: "Explorer results"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-2 font-display text-2xl text-fg",
										children: adultExplorerTag ? `#${adultExplorerTag.replace(/^fetish-/, "")}` : "Your pulled Adult interests"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: adultExplorerTag ? "Freshly pulled and saved matching titles. Results stay tagged for the Adult catalog too." : "Pick a topic above to pull it. Existing fetish-tagged titles appear here while you choose."
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => setSource("adults"),
									children: "Browse all Adults"
								})]
							}), adultExplorerResults.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: adultExplorerTag ? "Matching titles" : "Recently pulled interests",
								videos: adultExplorerResults,
								variant: "rail"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-5 rounded-lg bg-elevated px-4 py-5 text-sm text-muted",
								children: "No saved titles match this topic yet. Choose a provider and pull a topic above."
							})]
						})] }),
						sourceId === "adults" && browsing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
								fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
									className: "mb-6 rounded-xl bg-surface p-5 text-sm text-muted shadow-border",
									role: "status",
									children: "Opening Adult controls…"
								}),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdultPanel, {
									showMilestones: adultDeepVisible,
									autoPull: true,
									sourceFilter: adultSource,
									tagFilter: adultTag,
									onSourceFilter: setAdultSource,
									onTagFilter: applyAdultTag
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-5 rounded-xl border border-border bg-surface p-4 shadow-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
										children: "Adult media view"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: "Choose one media type or keep the combined discovery view. Provider, tag, and artwork filters apply to every Adult rail below."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 flex flex-wrap gap-2",
										children: [
											["all", `Combined · ${adultRemoteVideos.length}`],
											["videos", `Videos · ${adultKindCounts.videos}`],
											["live", `Live · ${adultKindCounts.live}`],
											["photos", `Photos · ${adultKindCounts.photos}`]
										].map(([view, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: adultView === view ? "default" : "secondary",
											onClick: () => setAdultView(view),
											children: label
										}, view))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted",
												children: "Artwork"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: adultArtworkOnly ? "default" : "secondary",
												onClick: () => setAdultArtworkOnly(true),
												children: ["Preview-ready · ", adultArtworkReadyCount]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: !adultArtworkOnly ? "default" : "secondary",
												onClick: () => setAdultArtworkOnly(false),
												children: ["All cards · ", viewMatchedAdult.length]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: showHiddenAdult ? "default" : "ghost",
												onClick: () => setShowHiddenAdult(!showHiddenAdult),
												children: showHiddenAdult ? "Hide #hidden again" : "Show #hidden"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-xs text-muted",
										children: "Preview-ready keeps cards without a usable poster out of the opening rails. Use the eye-slash control on a card to add #hidden; hidden cards stay out of all Adult rails until shown here."
									})
								]
							}),
							adultView === "all" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-6 space-y-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "border-b border-border pb-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
											children: "Browse the full mix"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted",
											children: "Videos, photos, and rotating picks each have their own full-width rail, so the opening catalog never compresses three different discovery paths into narrow columns."
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
										title: `Adult videos · ${adultKindCounts.videos}`,
										reason: "Full-width video rail, ranked independently from photos and rotating picks.",
										videos: adultOverviewRails.videos,
										variant: "rail"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
										title: `Adult photos · ${adultKindCounts.photos}`,
										reason: "Reddit and Booru photos with preview fallbacks, presented in a dedicated full-width rail.",
										videos: adultOverviewRails.photos,
										variant: "rail"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
										title: "Adult picks",
										reason: "A distinct mixed full-width rail after the video and photo cards above.",
										videos: adultOverviewRails.picks,
										variant: "rail"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-5 rounded-xl border border-border bg-surface p-4 shadow-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
											children: "For you right now"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "mt-1 font-display text-2xl text-fg",
											children: "Better Adult recommendations"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											role: "status",
											className: "mt-1 text-xs text-muted",
											children: adultBrowse.failed ? "Recommendations are unavailable. You can still browse your catalog." : adultBrowse.pending ? "Updating your mix… Keep browsing while it finishes." : "Your mix is ready."
										}),
										adultBrowse.failed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "secondary",
											onClick: adultBrowse.retry,
											children: "Retry recommendations"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 max-w-3xl text-sm text-muted",
											children: "Taste signals from ratings, saves, likes, hearted tags, watch history, and private marks lead the mix. Preview-ready cards get a small lift; creator and provider round-robin guards keep a fresh batch from taking over the shelf."
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "secondary",
										onClick: () => setAdultRailSeed(Date.now() >>> 0),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-4" }), " Refresh mix"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex flex-wrap gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-md bg-elevated px-3 py-2 text-xs text-muted",
											children: [
												adultRecommendedRail.length,
												" fresh recommendation",
												adultRecommendedRail.length === 1 ? "" : "s"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-md bg-elevated px-3 py-2 text-xs text-muted",
											children: [adultRelatedRail.length, " related by current interests"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "rounded-md bg-elevated px-3 py-2 text-xs text-muted",
											children: "Overview cards are held out of these first shelves"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Recommended for you",
								reason: "Tag overlap, hearted interests, ratings, private marks, creator and provider variety, thumbnail readiness, and a fresh timestamped mix.",
								videos: adultRecommendedRail,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "More from your interests",
								reason: "Nearby titles sharing your top Adult tags, recent watches, favorites, and pulled fetish topics.",
								videos: adultRelatedRail,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Continue watching",
								videos: adultContinueRail,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "I cummed to it",
								reason: "Private local marks only — counts stay on this device.",
								videos: adultMarkedRail,
								variant: "rail"
							}),
							(adultSource === "all" || adultSource === "reddit") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Reddit photos & videos",
								reason: "Curated 18+ Atom feeds — photos, gifs, and v.redd.it / redgifs posters.",
								videos: adultRedditRail,
								variant: "rail"
							}),
							(adultSource === "all" || adultSource === "rule34" || adultSource === "booru") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: `Rule34 · ${adultSourceCounts.rule34 ?? 0}`,
								reason: "First-class Rule34 filter — JSON API primary with HTML listing backup, surfaced alongside other booru hosts.",
								videos: sourceMatchedAdult.filter((video) => videoMatchesAdultSource(video, "rule34")).slice(0, Math.max(24, adultRailLimit)),
								variant: "rail"
							}),
							adultTopTagRails.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: `Top #${row.tag} · ${row.count}`,
								reason: `Stabilized tag score ${Math.round(row.score)} from ${row.count} titles, ratings, saves, marks, recency, and taxonomy relevance. One-off tags stay out of these rails.`,
								videos: row.videos,
								variant: "rail"
							}, `adult-tag-rail-${row.tag}`)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-5 rounded-xl border border-border bg-surface p-4 shadow-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-end justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
											children: "Interest tags"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted",
											children: "Interest tags narrow every Adult rail. Source tags select providers; creator tags identify performers; metadata tags describe format. Tap any card tag to filter Adults in place — the desk stays put."
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: adultTagQuery,
											onChange: (event) => setAdultTagQuery(event.target.value),
											placeholder: "Filter tags…",
											className: "max-w-xs"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 flex flex-wrap gap-2",
										children: ADULT_SOURCE_FILTERS.map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: adultSource === source.id ? "default" : "secondary",
											onClick: () => setAdultSource(source.id),
											children: [
												source.label,
												" · ",
												source.id === "all" ? adultRemoteVideos.length : adultSourceCounts[source.id] ?? 0
											]
										}, source.id))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex flex-wrap gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: adultTag === "All" ? "default" : "secondary",
												onClick: () => applyAdultTag("All"),
												children: "All adult tags"
											}),
											heartedAdultTags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: adultTag === tag ? "default" : "secondary",
												onClick: () => applyAdultTag(tag),
												children: ["♥ #", tag]
											}, `adult-hearted-${tag}`)),
											visibleAdultTags.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: adultTag === row.tag ? "default" : "secondary",
												onClick: () => applyAdultTag(row.tag),
												children: [
													"#",
													row.tag,
													" · ",
													row.count,
													" · ",
													Math.round(row.score)
												]
											}, `adult-tag-${row.tag}`)),
											adultTagMatches.length > visibleAdultTags.length && visibleAdultTags.length < 36 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "secondary",
												onClick: () => setAdultTagVisibleCount((count) => Math.min(36, count + 10)),
												children: [
													"Show more · ",
													Math.min(10, Math.min(36, adultTagMatches.length) - visibleAdultTags.length),
													" of ",
													adultTagMatches.length
												]
											}),
											visibleAdultTags.length > 10 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => setAdultTagVisibleCount(10),
												children: "Show fewer"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-xs text-muted",
										children: [
											"Showing ",
											visibleAdultTags.length,
											" of ",
											adultTagMatches.length || adultTagRank.length,
											" ranked tags",
											adultTagQuery.trim() ? " (filtered)" : "",
											" · cap 36 on screen.",
											heartedAdultTags.length ? ` · ${heartedAdultTags.length} hearted tag${heartedAdultTags.length === 1 ? "" : "s"} stay prioritized and retained in local history.` : ""
										]
									}),
									adultMetaTagRank.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 border-t border-border pt-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-medium tracking-[0.12em] text-accent uppercase",
												children: "Ranked metadata"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-xs text-muted",
												children: "Verified provider descriptors scored by ratings, saves, marks, recency, and cross-provider coverage. Use one to focus every Adult rail."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-2 flex flex-wrap gap-2",
												children: adultMetaTagRank.slice(0, 18).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													variant: adultTag === row.tag ? "default" : "secondary",
													onClick: () => applyAdultTag(row.tag),
													children: [
														"#",
														row.tag,
														" · ",
														row.count,
														" · ",
														Math.round(row.score)
													]
												}, `adult-meta-${row.tag}`))
											})
										]
									}),
									(adultTag !== "All" || adultSource !== "all") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-xs text-accent",
										children: [
											"Showing ",
											filteredEporner.length.toLocaleString(),
											" ",
											adultArtworkOnly ? "preview-ready " : "",
											"titles",
											adultSource !== "all" ? ` · ${adultSource}` : "",
											adultTag !== "All" ? ` · #${adultTag}` : "",
											"."
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
								className: "mb-5 rounded-xl bg-elevated p-4 shadow-border",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
										children: "Adult stats"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-sm text-muted",
										children: [
											adultRemoteVideos.length.toLocaleString(),
											" cached titles · Reddit ",
											adultSourceCounts.reddit ?? 0,
											" · export tag ranks and source counts."
										]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "secondary",
											onClick: () => exportAdultStats(buildAdultStatsSnapshot(adultRemoteVideos, folders, tags, {
												favorites,
												likes,
												cameCounts,
												viewCounts,
												ratingOf: getRating
											}), "csv"),
											children: "Export CSV"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "secondary",
											onClick: () => exportAdultStats(buildAdultStatsSnapshot(adultRemoteVideos, folders, tags, {
												favorites,
												likes,
												cameCounts,
												viewCounts,
												ratingOf: getRating
											}), "json"),
											children: "Export JSON"
										})]
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Latest from official adult APIs",
								reason: "Ranked catalog from official APIs and Reddit Atom — source chips actually filter these rails.",
								videos: adultLatestRail,
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "From official adult APIs",
								reason: "Windowed filtered catalog, ranked (first 120).",
								videos: adultCatalogRail,
								variant: "rail"
							}),
							adultView === "all" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
								className: "mt-8 border-t border-border pt-5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: `Adult live now · ${adultKindCounts.live}`,
									reason: "Public live rooms stay together at the bottom of the combined Adult view, with their own rotating order.",
									videos: adultRows.live,
									variant: "rail"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosterGrid, { videos: adultPosterCatalog }),
							!adultDeepVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-6 rounded-xl border border-border bg-surface p-5 shadow-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
										children: "Deep discovery"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-2 font-display text-2xl text-fg",
										children: "Milestones, private shelves, and history."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: "Link-out catalogs, private folder rails, and full adult history stay optional so opening Adults stays responsive with a large cached archive."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "mt-4",
										variant: "secondary",
										onClick: () => setAdultDeepVisible(true),
										children: "Load milestones and private shelves"
									})
								]
							}),
							adultDeepVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
									className: "mb-6 rounded-xl bg-elevated p-5 shadow-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
													children: "Private library"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
													className: "mt-2 font-display text-4xl text-fg",
													children: "Your shelves, your tags."
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-2 text-sm text-muted",
													children: "Tags, history, and organization remain private to this browser. Edit a title’s tags from its preview or player."
												})
											] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												disabled: !videos.length,
												onClick: () => {
													const choices = adultTag === "All" ? adultSorted : adultSorted.filter((video) => (tags[video.id] ?? []).includes(adultTag));
													const pick = choices[Math.floor(Math.random() * choices.length)];
													if (pick) openVideo(pick.id);
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-4" }), " Random private pick"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-4 flex flex-wrap gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: adultTag === "All" ? "default" : "secondary",
													onClick: () => setAdultTag("All"),
													children: "All titles"
												}),
												visibleAdultTags.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													variant: adultTag === row.tag ? "default" : "secondary",
													onClick: () => setAdultTag(row.tag),
													children: ["#", row.tag]
												}, row.tag)),
												adultTagMatches.length > visibleAdultTags.length && visibleAdultTags.length < 36 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "secondary",
													onClick: () => setAdultTagVisibleCount((count) => Math.min(36, count + 10)),
													children: "Show more tags"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 flex flex-wrap gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "self-center text-xs text-muted",
												children: "Sort"
											}), [
												"ranked",
												"recent",
												"name",
												"favorites",
												"tagged",
												"played"
											].map((sort) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: adultSort === sort ? "default" : "secondary",
												onClick: () => setAdultSort(sort),
												children: sort === "tagged" ? "Most tagged" : sort === "played" ? "Last played" : sort === "ranked" ? "Ranked" : sort
											}, sort))]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-6 grid gap-3 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg bg-surface p-4 shadow-border",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium text-fg",
											children: "Private favorite links"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs leading-5 text-muted",
											children: "Reserved for your personally saved, consented links. Nothing is added or shared automatically."
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg bg-surface p-4 shadow-border",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium text-fg",
											children: "Recommended sites"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs leading-5 text-muted",
											children: "Reserved for future opt-in recommendations. Link sorting will stay separate from your private video catalog."
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrivateWebShortcuts, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Favorites",
									videos: adultFavorites,
									variant: "poster"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Most organized",
									videos: adultTagged,
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Needs a tag",
									videos: adultNeedsTags,
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "Recently added",
									videos: [...videos].sort((a, b) => b.addedAt - a.addedAt).slice(0, 24),
									variant: "rail"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: adultTag === "All" ? "All private titles" : `Tagged · ${adultTag}`,
									videos: adultTag === "All" ? adultSorted : adultSorted.filter((video) => (tags[video.id] ?? []).includes(adultTag)),
									variant: "poster"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: "History · #adult",
									videos: adultHistoryTagged,
									variant: "rail",
									playedAt
								}),
								adultFolders.map((folder) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
									title: folder.name,
									videos: videos.filter((v) => v.folderId === folder.id),
									variant: "rail"
								}, folder.id)),
								adultFolders.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl bg-surface px-6 py-14 text-center shadow-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mx-auto size-6 text-muted" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 font-display text-2xl text-fg",
											children: "No private folders yet"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mx-auto mt-2 max-w-sm text-sm text-muted",
											children: "Add a private folder, or lock an existing source. Those titles stay off Home, Movies, and Favorites."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											className: "mt-4",
											onClick: () => onAddFolder(void 0, true),
											children: "Add private folder"
										})
									]
								})
							] })
						] }),
						sourceId === "favorites" && !query && favoriteVideos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "font-display text-3xl leading-none tracking-tight text-fg sm:text-4xl",
									children: "Favorites"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted",
									children: "Your list, on this computer. Saved titles remain here even when a source is temporarily unavailable."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-md bg-elevated p-3 shadow-border",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted",
												children: "Saved titles"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 font-display text-2xl text-fg",
												children: favoriteVideos.length
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-md bg-elevated p-3 shadow-border",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted",
												children: "Local favorites"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 font-display text-2xl text-fg",
												children: favoriteVideos.filter((video) => !video.remote).length
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-md bg-elevated p-3 shadow-border",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted",
												children: "Provider favorites"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 font-display text-2xl text-fg",
												children: favoriteVideos.filter((video) => video.remote).length
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => setSource("stats"),
											className: "rounded-md bg-elevated p-3 text-left shadow-border hover:bg-surface",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted",
												children: "Recovery & export"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-sm font-medium text-accent",
												children: "Open favorite diagnostics →"
											})]
										})
									]
								})
							]
						}),
						sourceId === "favorites" && !query && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-6 rounded-lg bg-elevated p-4 shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-fg",
									children: "Photo favorites stay with the photo library"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted",
									children: "Open your saved photos in their optimized viewer without mixing large image assets into this video grid."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									className: "mt-3",
									onClick: () => {
										localStorage.setItem("reelcase.photos.favorites-only", "true");
										setSource("photos");
									},
									children: "Open photo favorites"
								})
							]
						}),
						sourceId === "favorites" && !query && favoriteVideos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Continue your favorites",
								videos: favoriteVideos.filter((video) => {
									const mark = progress[video.id];
									return mark && mark.t > 0 && mark.t < mark.d;
								}),
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Favorite movies",
								videos: favoriteVideos.filter((video) => !video.remote && !video.isSample),
								variant: "poster"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Favorite YouTube",
								videos: favoriteVideos.filter((video) => video.remote?.kind === "youtube"),
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Favorite Twitch",
								videos: favoriteVideos.filter((video) => video.remote?.kind === "twitch"),
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
								title: "Most recently saved",
								videos: [...favoriteVideos].sort((a, b) => (progress[b.id]?.at ?? b.addedAt) - (progress[a.id]?.at ?? a.addedAt)),
								variant: "rail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mb-3 font-display text-xl text-fg sm:text-2xl",
								children: "Everything in My List"
							})
						] }),
						sourceId === "favorites" && !query ? favoriteVideos.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-full min-w-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosterGrid, { videos: favoriteVideos })
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-surface px-6 py-16 text-center shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: "/art/realhub-media-cards.webp",
									alt: "",
									loading: "lazy",
									className: "mx-auto mb-4 h-28 w-36 object-contain"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-2xl text-fg",
									children: "Nothing in Favorites"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mx-auto mt-2 max-w-sm text-sm text-muted",
									children: "Heart a title or use My List on the billboard."
								})
							]
						}) : null,
						(sourceId === "history" || sourceId === "continue" || query || !browsing && sourceId !== "favorites" && sourceId !== "home" && sourceId !== "movies" && sourceId !== "adults" && sourceId !== "adult-fetishes" && sourceId !== "genres" && sourceId !== "stats" && sourceId !== "connection" && sourceId !== "find-phone") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4 flex items-end justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "font-display text-3xl leading-none tracking-tight text-fg sm:text-4xl",
									children: query ? "Search" : heading
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted",
									children: sourceId === "history" ? `${history.length} saved watch event${history.length === 1 ? "" : "s"} · ${historyLastDay} in the last 24 hours · no maximum · newest first` : scanning ? `Scanning ${scanning.folderName} · ${scanning.found} found` : `${videos.length} video${videos.length === 1 ? "" : "s"}`
								})] }), sourceId === "history" && history.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: historyWindow === "all" ? "default" : "secondary",
											onClick: () => setHistoryWindow("all"),
											children: "All time"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: historyWindow === "day" ? "default" : "secondary",
											onClick: () => setHistoryWindow("day"),
											children: "24 hours"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: historyWindow === "week" ? "default" : "secondary",
											onClick: () => setHistoryWindow("week"),
											children: "7 days"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "secondary",
											onClick: exportHistory,
											children: "Export visible"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "sm",
											onClick: clearHistory,
											children: "Clear history"
										})
									]
								})]
							}),
							query && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-5 rounded-lg border border-border bg-surface p-4 shadow-border",
								"aria-label": "Search ranking and matching tags",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-baseline justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
											children: "Search ranking"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted",
											children: "Exact title and creator matches lead, followed by matching tags and your saved reactions."
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-accent",
											children: searchPending ? "Searching…" : `${searchInsights.ranked.length.toLocaleString()} ranked results`
										})]
									}),
									searchInsights.tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex flex-wrap gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "self-center text-xs text-muted",
											children: "Top tags"
										}), searchInsights.tags.map(({ tag, count }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "secondary",
											onClick: () => {
												if (sourceId === "adults" || sourceId === "adult-fetishes") {
													setQuery("");
													setSource("adults");
													window.dispatchEvent(new CustomEvent("reelcase:adult-tag", { detail: { tag } }));
													return;
												}
												setQuery(tag);
											},
											children: [
												"#",
												tag,
												" · ",
												count
											]
										}, tag))]
									}),
									searchInsights.ranked.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 grid gap-2 md:grid-cols-3",
										children: searchInsights.ranked.slice(0, 3).map((video, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => openVideo(video.id),
											className: "flex min-w-0 items-center gap-3 rounded-md bg-elevated px-3 py-3 text-left hover:bg-bg",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "shrink-0 rounded-full bg-accent/15 px-2 py-1 text-xs font-medium text-accent",
												children: ["#", index + 1]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block truncate text-sm font-medium text-fg",
													children: video.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block truncate text-xs text-muted",
													children: (video.remote?.channelName ?? topicsForVideo(video, tags[video.id]).slice(0, 2).join(" · ")) || "Library match"
												})]
											})]
										}, video.id))
									})
								]
							}),
							(sourceId === "continue" || sourceId === "history") && !query && (adultContinue.length > 0 || adultHistoryTagged.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-5 rounded-xl border border-border bg-surface p-5 shadow-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
										children: "Adults activity"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-2 font-display text-2xl text-fg",
										children: "Private continue & history stay in Adults."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: "Public Continue / History rails stay clean. Open Adults for private resume marks, fetish-tagged history, and I-cummed counters — catalog shelves on Home stay public-only."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-wrap gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											onClick: () => setSource("adults"),
											children: "Open Adults"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "secondary",
											onClick: () => {
												setSource("adults");
												setAdultDeepVisible(true);
											},
											children: "Adults history & shelves"
										})]
									}),
									sourceId === "continue" && adultContinue.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
											title: "Adults · continue watching",
											videos: adultContinue.slice(0, 18),
											variant: "rail"
										})
									}),
									sourceId === "history" && adultHistoryTagged.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleRail, {
											title: "Adults · recent history · #adult",
											videos: adultHistoryTagged.slice(0, 18),
											variant: "rail",
											playedAt
										})
									})
								]
							}),
							sourceId === "continue" && !query && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-5 rounded-lg border border-border bg-surface p-4 shadow-border",
								"aria-label": "Continue recovery details",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-baseline justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
											children: "Resume recovery"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted",
											children: "Continue uses a provider URL or approved local path when a catalog card changes, then keeps the newest credible mark."
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-subtle",
											children: [continueInsights.linked, " ready to resume"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 grid gap-2 sm:grid-cols-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "rounded-md bg-elevated px-3 py-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted",
													children: "Durable marks"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 font-display text-xl text-fg",
													children: continueInsights.valid
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "rounded-md bg-elevated px-3 py-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted",
													children: "Stale, review-only"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 font-display text-xl text-fg",
													children: continueInsights.stale
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "rounded-md bg-elevated px-3 py-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted",
													children: "Resume rule"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 text-sm font-medium text-fg",
													children: "Local 5 sec · providers 2 sec"
												})]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-xs leading-5 text-subtle",
										children: "Repair preview is non-destructive: invalid marks are rejected on recovery, while older marks remain visible for review and no file handle is reopened automatically."
									}),
									continueVideos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 border-t border-border pt-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium tracking-[0.12em] text-muted uppercase",
											children: "Why these are here"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2 grid gap-2",
											children: continueVideos.slice(0, 8).map((video) => {
												const mark = resumeForVideo({
													progress,
													resumeProgress
												}, video);
												const percent = mark ? Math.round(mark.t / mark.d * 100) : 0;
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													onClick: () => openVideo(video.id),
													className: "flex min-h-11 items-center gap-3 rounded-md border border-border px-3 text-left",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "shrink-0 rounded-full bg-accent/15 px-2 py-1 text-[11px] font-medium text-accent",
															children: video.remote ? "Provider key" : "Local path"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "min-w-0 flex-1 truncate text-sm text-fg",
															children: video.name
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "shrink-0 text-xs text-muted",
															children: [
																percent,
																"% · ",
																mark ? new Date(mark.at).toLocaleString() : "awaiting mark"
															]
														})
													]
												}, video.id);
											})
										})]
									})
								]
							}),
							sourceId === "history" && history.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-5 rounded-lg border border-border bg-surface p-4 shadow-border",
								"aria-label": "History controls",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mr-1 text-xs font-medium tracking-[0.12em] text-muted uppercase",
										children: "Activity source"
									}), [
										"all",
										"open",
										"progress",
										"watch-room"
									].map((kind) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: historySource === kind ? "default" : "secondary",
										onClick: () => setHistorySource(kind),
										children: kind === "all" ? "Everything" : kind === "open" ? "Direct opens" : kind === "progress" ? "Playback" : "Watch Room"
									}, kind))]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "text-xs text-muted",
											htmlFor: "history-retention",
											children: "Keep activity"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											id: "history-retention",
											value: historyRetention,
											onChange: (event) => setHistoryRetention(event.target.value),
											className: "min-h-9 rounded-md border border-border bg-elevated px-2 text-sm text-fg",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "forever",
													children: "Until I remove it"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "week",
													children: "7 days"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "month",
													children: "30 days"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "year",
													children: "1 year"
												})
											]
										}),
										historyRetention !== "forever" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "secondary",
											onClick: () => pruneHistory(historyRetentionCutoff),
											children: "Remove older entries"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-subtle",
											children: "Export first if you want a copy."
										})
									]
								})]
							}),
							sourceId === "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-5 rounded-lg border border-border bg-surface p-4 shadow-border",
								"aria-label": "History recovery import",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-end justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
											children: "Recovery import"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "mt-1 text-lg font-medium text-fg",
											children: "Restore a saved activity pack."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 max-w-2xl text-xs leading-5 text-muted",
											children: "Merge a Realhub library pack to recover History, Continue marks, follows, favorites, ratings, Adult marks, and saved provider links. Duplicate activity is ignored; it never clears data already here."
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "secondary",
										onClick: importHistoryRecovery,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }), "Import recovery pack"]
									})]
								}), historyImportNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-xs text-accent",
									role: "status",
									children: historyImportNote
								})]
							}),
							sourceId === "history" && historyTopTags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-5 rounded-lg bg-elevated px-4 py-3 shadow-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
									children: "Historical interests"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex flex-wrap gap-2",
									children: historyTopTags.map(([tag, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "rounded-full border border-border px-2.5 py-1 text-xs text-muted",
										children: [
											"#",
											tag,
											" · ",
											count
										]
									}, tag))
								})]
							}),
							sourceId === "history" && history.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-5 flex flex-wrap gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-xs text-muted shadow-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-fg",
											children: "Viewing record"
										}),
										" · ",
										historyRecovery.resumable,
										" resumable activity mark",
										historyRecovery.resumable === 1 ? "" : "s"
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"· ",
										historyRecovery.sources.progress,
										" playback"
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"· ",
										historyRecovery.sources.watchRoom,
										" Watch Room"
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"· ",
										historyRecovery.sources.open,
										" direct opens"
									] })
								]
							}),
							sourceId === "history" && history.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-5 rounded-lg bg-elevated px-4 py-3 shadow-border",
								"aria-label": "History privacy and recovery",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
										children: "Local record"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs leading-5 text-muted",
										children: "This device stores event time, source, optional playback position, and a provider URL only when available. Private and adult items remain behind the existing library gate."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-subtle",
										children: historyOrphans ? `${historyOrphans} recovered event${historyOrphans === 1 ? "" : "s"} can still use a saved provider link after its card left the catalog.` : "Saved provider links are retained so an evicted card can be recovered."
									})
								]
							}),
							sourceId === "history" && history.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mb-5 rounded-lg border border-border bg-surface p-4 shadow-border",
								"aria-label": "Recent history activity",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-baseline justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium text-fg",
											children: "Recent activity"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-subtle",
											children: "Times shown in your local timezone"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 grid gap-2",
										children: historyVisibleEntries.slice(0, 12).map((entry) => {
											const video = historyVideoById.get(entry.id);
											const label = entry.source === "watch-room" ? "Watch Room" : entry.source === "progress" ? "Playback" : "Direct open";
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												disabled: !video,
												onClick: () => video && openVideo(video.id),
												className: "flex min-h-11 items-center gap-3 rounded-md border border-border px-3 text-left disabled:cursor-default disabled:opacity-75",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "shrink-0 rounded-full bg-accent/15 px-2 py-1 text-[11px] font-medium text-accent",
														children: label
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "min-w-0 flex-1 truncate text-sm text-fg",
														children: video?.name ?? "Recovered activity — source card unavailable"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
														className: "shrink-0 text-xs text-muted",
														dateTime: new Date(entry.at).toISOString(),
														title: new Date(entry.at).toISOString(),
														children: new Date(entry.at).toLocaleString()
													})
												]
											}, entry.eventId ?? `${entry.id}:${entry.at}:${entry.source ?? "open"}`);
										})
									}),
									historyVisibleEntries.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-sm text-muted",
										children: "No activity matches this time and source filter. Try Everything or a longer time window; recovered cards appear when a saved provider URL is available."
									})
								]
							}),
							folders.find((folder) => folder.id === sourceId)?.photoCount ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4 flex items-center justify-between gap-3 rounded-lg bg-elevated px-4 py-3 shadow-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-fg",
									children: [
										"This source also has ",
										folders.find((folder) => folder.id === sourceId)?.photoCount,
										" discovered photos."
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => {
										const folder = folders.find((item) => item.id === sourceId);
										if (folder) localStorage.setItem("reelcase.photos.source-filter", folder.name);
										setSource("photos");
									},
									children: "Browse this source’s photos"
								})]
							}) : null,
							sourceId === "history" || sourceId === "continue" || query ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoGrid, {
								videos: sourceId === "history" ? historyFilteredVideos : query ? searchInsights.ranked : videos,
								playedAt: sourceId === "history" ? playedAt : void 0
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosterGrid, { videos })
						] }),
						sourceId === "demo" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-8 text-center text-xs text-subtle",
							children: "Original shorts styled as classics. Add a folder to scan this computer."
						})
					] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Suspense, {
				fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "fixed inset-0 z-50 flex items-center justify-center bg-bg/90 text-sm text-fg",
					role: "status",
					children: "Opening video…"
				}),
				children: [activeId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Player, { playlist }), previewId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreVideo, {})]
			}),
			dragging && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-bg/80",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-surface px-8 py-6 text-center shadow-border shadow-lift",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl text-fg",
						children: "Drop to add"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Folders or video files"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: dirInputRef,
				type: "file",
				multiple: true,
				className: "sr-only",
				tabIndex: -1,
				"aria-hidden": "true",
				suppressHydrationWarning: true,
				webkitdirectory: "",
				directory: "",
				onChange: (e) => {
					const files = e.target.files;
					const adult = pendingAdult.current;
					pendingAdult.current = false;
					if (files?.length) ingestFromInput(files, true, { adult }).catch((err) => {
						toast.error(err instanceof Error ? err.message : "Could not read folder");
					});
					e.target.value = "";
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileInputRef,
				type: "file",
				multiple: true,
				accept: "video/*",
				className: "sr-only",
				tabIndex: -1,
				"aria-hidden": "true",
				suppressHydrationWarning: true,
				onChange: (e) => {
					const files = e.target.files;
					if (files?.length) ingestFromInput(files, false).catch((err) => {
						toast.error(err instanceof Error ? err.message : "Could not read files");
					});
					e.target.value = "";
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				theme: "dark",
				position: "bottom-right",
				toastOptions: { classNames: {
					toast: "bg-elevated text-fg shadow-border border-0",
					title: "text-fg",
					description: "text-muted"
				} }
			})
		]
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LibraryApp, {});
}
//#endregion
export { useThumbs as S, __exportAll as _, DropdownMenuTrigger as a, getThumbDiagnostics as b, getFirstShelfTrace as c, downloadLibraryPackZip as d, importLibraryPackZip as f, getRenderBudgetSnapshot as g, VideoCard as h, DropdownMenuItem as i, applyLibraryPackFiles as l, exportAdultStats as m, DropdownMenu as n, getNetworkDeviceId as o, buildAdultStatsSnapshot as p, DropdownMenuContent as r, listNetworkDevices as s, routes_exports as t, buildLibraryPackFiles as u, attachFrameCallback as v, probeHardwareDecode as x, downloadAdultPhoto as y };
