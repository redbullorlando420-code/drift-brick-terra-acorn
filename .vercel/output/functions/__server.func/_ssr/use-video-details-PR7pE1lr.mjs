import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { F as RefreshCw, Rt as ExternalLink, W as Pause, rt as Maximize } from "../_libs/lucide-react.mjs";
import { Mt as isRemovedRedditVideo } from "./live-rooms-DInVyvi_.mjs";
import { Pa as withCatalogDetails, Rn as myFreeCamsRoomUrl, hn as loadCatalogVideo } from "./persist-D_pR3DU-.mjs";
import { $n as useLibrary, E as fetchTwitchChapters, Zt as resolveBooruOriginal, pt as inspectRedditImage, tr as viewerDetails } from "./store-0MIXEefC.mjs";
import { Vt as Button } from "./library-app-BzjSyqkW.mjs";
import { a as ProviderSaveNotice, c as useProviderView, l as watchHiddenPage, r as ProviderLoginHelp } from "./provider-recovery-CuBcDi-X.mjs";
import { a as twitchChapterUrl, o as twitchVodChapterId, r as readTwitchChapterReport } from "./twitch-chapters-dTpIW994.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-video-details-PR7pE1lr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var selected = /* @__PURE__ */ new Map();
function TwitchChapters({ video, onNavigate }) {
	const id = twitchVodChapterId(video);
	return id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChapterPanel, {
		id,
		onNavigate
	}, id) : null;
}
function ChapterPanel({ id, onNavigate }) {
	const [open, setOpen] = (0, import_react.useState)(false), [result, setResult] = (0, import_react.useState)(() => {
		const saved = selected.get(id);
		return saved && Date.now() - saved.checkedAt < 6e5 ? saved : null;
	}), [busy, setBusy] = (0, import_react.useState)(false), [page, setPage] = (0, import_react.useState)(0), [notice, setNotice] = (0, import_react.useState)("");
	const request = (0, import_react.useRef)(null), alive = (0, import_react.useRef)(true);
	(0, import_react.useEffect)(() => {
		alive.current = true;
		return () => {
			alive.current = false;
			request.current?.abort();
		};
	}, []);
	const load = async () => {
		if (busy) return;
		const controller = new AbortController();
		request.current = controller;
		setBusy(true);
		setNotice("");
		try {
			const raw = await fetchTwitchChapters({
				data: { videoId: id },
				signal: AbortSignal.any([controller.signal, AbortSignal.timeout(18e3)])
			});
			if (!alive.current || controller.signal.aborted) return;
			const report = readTwitchChapterReport(id, raw);
			if (report.state !== "unavailable") {
				selected.delete(id);
				selected.set(id, report);
				while (selected.size > 4) selected.delete(selected.keys().next().value);
				setPage(0);
			}
			setResult((previous) => report.state === "unavailable" && previous?.state === "ready" ? previous : report);
			setNotice(report.note);
		} catch {
			if (alive.current && !controller.signal.aborted) setNotice("Chapters could not be loaded. Keep watching or use the official Twitch link; retry is manual.");
		} finally {
			if (alive.current && !controller.signal.aborted) setBusy(false);
		}
	};
	const toggle = () => {
		if (open) {
			request.current?.abort();
			setBusy(false);
			setOpen(false);
		} else {
			setOpen(true);
			if (!result) load();
		}
	};
	const pages = Math.max(1, Math.ceil((result?.chapters.length ?? 0) / 12));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Twitch VOD chapters",
		className: "mt-4 rounded-lg border border-border bg-elevated/55 p-4 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "min-h-11",
				"aria-expanded": open,
				onClick: toggle,
				children: open ? "Hide VOD chapters" : "Show VOD chapters"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: "Loads public game/chapter markers only when requested. Clips and live streams have no VOD chapter controls."
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						"aria-live": "polite",
						className: "text-xs leading-5 text-muted",
						children: busy ? "Loading public VOD chapters…" : notice || result?.note
					}),
					result?.state === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "space-y-2",
						children: result.chapters.slice(page * 12, page * 12 + 12).map((chapter) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								className: "min-h-11 h-auto max-w-full whitespace-normal text-left",
								onClick: () => {
									onNavigate(chapter.start);
									setNotice("Requested this chapter in the official embedded player. Twitch may require a tap or account access; use Open on Twitch if playback is unavailable.");
								},
								children: [
									Math.floor(chapter.start / 60),
									":",
									String(Math.floor(chapter.start) % 60).padStart(2, "0"),
									" · ",
									chapter.label
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "inline-flex min-h-11 items-center text-xs text-accent underline",
								href: twitchChapterUrl(id, chapter.start),
								target: "_blank",
								rel: "noreferrer",
								children: "Open on Twitch"
							})]
						}, chapter.start))
					}), pages > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						"aria-label": "Chapter pages",
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								className: "min-h-11",
								disabled: page === 0,
								onClick: () => setPage(page - 1),
								children: "Previous chapters"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted",
								children: [
									"Page ",
									page + 1,
									" of ",
									pages
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								className: "min-h-11",
								disabled: page + 1 >= pages,
								onClick: () => setPage(page + 1),
								children: "Next chapters"
							})
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							className: "min-h-11",
							disabled: busy,
							onClick: () => void load(),
							children: "Retry chapter load"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: twitchChapterUrl(id, 0),
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-11 items-center text-xs text-accent underline",
							children: "Open full VOD on Twitch"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-5 text-muted",
						children: "Timestamp navigation reloads this device’s official player using Twitch’s VOD start time. It does not change saved progress or a Watch Together room."
					})
				]
			})
		]
	});
}
function OfficialRoomPlayer({ video, onOpen }) {
	const href = myFreeCamsRoomUrl(video.remote) ?? "https://app.myfreecams.com/";
	const name = new URL(href).pathname.slice(1);
	const shareHref = name ? "https://share.myfreecams.com/" + name : "https://share.myfreecams.com/";
	const frame = (0, import_react.useRef)(null), [revision, setRevision] = (0, import_react.useState)(0);
	const [fullscreenError, setFullscreenError] = (0, import_react.useState)("");
	const { mode, ready, choose: remember } = useProviderView("myfreecams", href);
	const [suspended, setSuspended] = (0, import_react.useState)(false), [saveError, setSaveError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!ready || mode !== "embedded" || suspended) return;
		return watchHiddenPage(() => setSuspended(true));
	}, [
		ready,
		mode,
		suspended
	]);
	const choose = (next) => {
		if (next === "website" && document.fullscreenElement === frame.current) document.exitFullscreen().catch(() => {});
		setSuspended(false);
		setSaveError("");
		try {
			remember(next);
		} catch {
			setSaveError("This browser could not save your viewing choice. It applies for this visit.");
		}
	};
	const openWebsite = () => {
		choose("website");
		onOpen?.();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		ref: frame,
		"data-provider-frame": "myfreecams",
		"data-provider-running": ready && mode === "embedded" && !suspended,
		"aria-label": "MyFreeCams official player",
		className: "min-w-0 bg-surface text-fg [&:fullscreen]:h-screen [&:fullscreen]:w-screen [&:fullscreen]:overflow-y-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3 border-b border-border p-3 sm:p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg",
					children: "MyFreeCams official website"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-2xl text-xs leading-5 text-muted",
					children: "The room opens inside Realhub by default. Your viewing choice is remembered on this device. Use MFC’s own tab if embedded sign-in or panels do not work."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					"aria-label": "MyFreeCams viewing mode",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: mode === "embedded" ? "default" : "secondary",
							className: "min-h-11",
							"aria-pressed": mode === "embedded",
							onClick: () => choose("embedded"),
							children: "Inside Realhub"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href,
							target: "_blank",
							rel: "noopener noreferrer",
							onClick: openWebsite,
							className: "inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm text-fg",
							children: ["Sign in on MFC ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
								className: "size-4",
								"aria-hidden": "true"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: mode === "website" ? "default" : "secondary",
							className: "min-h-11",
							"aria-pressed": mode === "website",
							onClick: () => choose("website"),
							children: "Direct website"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href,
							target: "_blank",
							rel: "noopener noreferrer",
							onClick: openWebsite,
							className: "inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm",
							children: ["Watch on MyFreeCams ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
								className: "size-4",
								"aria-hidden": "true"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: shareHref,
							target: "_blank",
							rel: "noopener noreferrer",
							className: "inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm",
							children: ["Share & profile ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
								className: "size-4",
								"aria-hidden": "true"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-3xl text-xs leading-5 text-muted",
					children: "Inside Realhub is an embedded page, including in full screen. Browser cookie restrictions can make sign-in repeat there. Sign in on MFC opens the official room in its own tab and switches off the embedded page. The MFC session stays in that browser; signing in there may not sign in the embedded view."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderLoginHelp, {
					provider: "myfreecams",
					href,
					room: true,
					onRecover: () => choose("website")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderSaveNotice, {}),
				saveError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "text-xs text-muted",
					children: saveError
				})
			]
		}), ready && mode === "embedded" && !suspended ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						className: "min-h-11",
						onClick: () => setRevision((value) => value + 1),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
							className: "size-4",
							"aria-hidden": "true"
						}), "Reload page"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						className: "min-h-11",
						onClick: () => setSuspended(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {
							className: "size-4",
							"aria-hidden": "true"
						}), "Pause embedded page"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						className: "min-h-11",
						onClick: () => {
							setFullscreenError("");
							if (!frame.current?.requestFullscreen) setFullscreenError("Full screen is unavailable in this browser.");
							else frame.current.requestFullscreen().catch(() => setFullscreenError("Full screen is unavailable in this browser."));
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize, {
							className: "size-4",
							"aria-hidden": "true"
						}), "Full screen"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "bg-surface",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
					src: href,
					title: "MyFreeCams official room page",
					className: "block min-h-96 w-full border-0",
					style: { height: "max(24rem, 70dvh)" },
					sandbox: "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-storage-access-by-user-activation",
					allow: "autoplay; fullscreen; encrypted-media; picture-in-picture",
					allowFullScreen: true,
					referrerPolicy: "strict-origin-when-cross-origin"
				}, video.id + ":" + revision)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "px-3 py-2 text-xs leading-5 text-muted",
				children: ["Embedded pages unload after one minute in the background to release memory. Resume explicitly when you return.", fullscreenError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					role: "status",
					children: [" ", fullscreenError]
				})]
			})
		] }) : ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4 p-5 sm:p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-xl",
					children: suspended ? "Embedded page paused" : "Use MyFreeCams in its own tab"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "max-w-xl text-sm leading-6 text-muted",
					children: suspended ? "The page has been unloaded to release its player and panels. Your saved library is unchanged." : "Open the official room, then sign in and keep watching in that tab. MFC manages the session; Realhub cannot check whether you are signed in. No embedded MFC page runs here in this mode."
				}),
				suspended ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "min-h-11",
					onClick: () => setSuspended(false),
					children: "Resume embedded page"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href,
					target: "_blank",
					rel: "noopener noreferrer",
					onClick: openWebsite,
					className: "inline-flex min-h-11 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg",
					children: ["Open official room ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
						className: "size-4",
						"aria-hidden": "true"
					})]
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "status",
			className: "p-5 text-sm text-muted",
			children: "Restoring your viewing choice…"
		})]
	});
}
/** Recover old watch/short links and malformed embed metadata without throwing
* during player render. A saved provider ID is the strongest recovery source. */
function youtubeEmbedUrl(base, savedId, origin) {
	const valid = (value) => value && /^[A-Za-z0-9_-]{11}$/.test(value) ? value : void 0;
	let id = valid(savedId);
	let start = 0;
	try {
		const source = new URL(base, "https://www.youtube.com");
		const host = source.hostname.toLowerCase().replace(/^www\./, "");
		if ([
			"youtube.com",
			"m.youtube.com",
			"youtube-nocookie.com",
			"youtu.be"
		].includes(host)) {
			const parts = source.pathname.split("/").filter(Boolean);
			id ??= valid(host === "youtu.be" ? parts[0] : source.searchParams.get("v") || ([
				"embed",
				"shorts",
				"live"
			].includes(parts[0]) ? parts[1] : void 0));
			const seconds = Number(source.searchParams.get("start"));
			if (Number.isFinite(seconds) && seconds > 0) start = Math.floor(seconds);
		}
	} catch {}
	if (!id) return null;
	const url = new URL(`https://www.youtube.com/embed/${id}`);
	for (const [key, value] of Object.entries({
		autoplay: "1",
		rel: "0",
		playsinline: "1",
		controls: "1"
	})) url.searchParams.set(key, value);
	if (start) url.searchParams.set("start", String(start));
	if (origin) url.searchParams.set("origin", origin);
	return url.toString();
}
function useRedditMedia(video) {
	const [removedId, setRemovedId] = (0, import_react.useState)("");
	const markUnavailable = useLibrary((s) => s.markUnavailable);
	const known = Boolean(video && isRemovedRedditVideo(video));
	const src = video?.src || video?.remote?.embedUrl || video?.remote?.previewUrl || video?.poster;
	const redditPhoto = video?.remote?.kind === "reddit" && /^image\//.test(video.mime ?? "");
	(0, import_react.useEffect)(() => {
		if (!video || !redditPhoto || !src) return;
		let cancelled = false;
		const hide = () => {
			if (!cancelled) {
				setRemovedId(video.id);
				markUnavailable(video.id, "Removed by Reddit");
			}
		};
		if (known) hide();
		else inspectRedditImage({ data: src }).then((result) => {
			if (result.removed) hide();
		}).catch(() => void 0);
		return () => {
			cancelled = true;
		};
	}, [
		video?.id,
		redditPhoto,
		src,
		known,
		markUnavailable
	]);
	return known || Boolean(video && removedId === video.id);
}
/** Keep URL strings, not decoded images; release failed resolutions promptly. */
var cache = /* @__PURE__ */ new Map();
function cachedBooruOriginal(host, id, resolve) {
	const key = `${host}:${id}`, now = Date.now(), saved = cache.get(key);
	if (saved && now - saved.at < 18e5) return saved.promise;
	const promise = Promise.resolve().then(resolve).then((url) => {
		if (!url && cache.get(key)?.promise === promise) cache.delete(key);
		return url;
	}, () => {
		if (cache.get(key)?.promise === promise) cache.delete(key);
		return null;
	});
	cache.set(key, {
		at: now,
		promise
	});
	while (cache.size > 128) cache.delete(cache.keys().next().value);
	return promise;
}
/** Shared by preview and player; resolving the selected image never scans a shelf. */
function useBooruOriginal(video) {
	const remote = video?.remote;
	const host = remote?.kind === "booru" ? remote.channelId : void 0;
	const id = host ? remote?.videoId : void 0;
	const key = host && id ? `${host}:${id}` : "";
	const [result, setResult] = (0, import_react.useState)({
		key: "",
		url: null,
		loading: false
	});
	(0, import_react.useEffect)(() => {
		if (!host || !id) return;
		let active = true;
		setResult({
			key,
			url: null,
			loading: true
		});
		cachedBooruOriginal(host, id, () => resolveBooruOriginal({ data: {
			host,
			id
		} })).then((url) => {
			if (active) setResult({
				key,
				url,
				loading: false
			});
		});
		return () => {
			active = false;
		};
	}, [
		host,
		id,
		key
	]);
	return {
		original: result.key === key ? result.url : null,
		loading: Boolean(key) && (result.key !== key || result.loading),
		failed: () => setResult({
			key,
			url: null,
			loading: false
		})
	};
}
function clearVideoDetailCache() {
	viewerDetails.clearCache();
}
function useVideoDetails(card) {
	const [loaded, setLoaded] = (0, import_react.useState)();
	const subscribe = (0, import_react.useCallback)((listener) => viewerDetails.subscribe(card?.id, listener), [card?.id]);
	const comments = (0, import_react.useSyncExternalStore)(subscribe, () => viewerDetails.commentsFor(card?.id), () => void 0);
	(0, import_react.useEffect)(() => {
		if (!card?.detailsOnDisk) {
			setLoaded(void 0);
			return;
		}
		let cancelled = false;
		viewerDetails.load(card.id, () => loadCatalogVideo(card.id)).then((video) => {
			if (cancelled || !video) return;
			setLoaded(video);
		}).catch(() => void 0);
		return () => {
			cancelled = true;
		};
	}, [card]);
	return (0, import_react.useMemo)(() => {
		const video = card && loaded?.id === card.id ? withCatalogDetails(card, loaded) : card;
		return video?.remote && comments !== void 0 ? {
			...video,
			remote: {
				...video.remote,
				comments
			}
		} : video;
	}, [
		card,
		loaded,
		comments
	]);
}
var onVisibility = () => {
	if (document.hidden) clearVideoDetailCache();
};
var onPageHide = () => viewerDetails.clear();
var onDetailsChanged = (event) => {
	viewerDetails.invalidate(event.detail);
};
if (typeof window !== "undefined") {
	window.addEventListener("reelcase:video-details-changed", onDetailsChanged);
	window.addEventListener("pagehide", onPageHide);
	document.addEventListener("visibilitychange", onVisibility);
}
//#endregion
export { useVideoDetails as a, useRedditMedia as i, TwitchChapters as n, youtubeEmbedUrl as o, useBooruOriginal as r, OfficialRoomPlayer as t };
