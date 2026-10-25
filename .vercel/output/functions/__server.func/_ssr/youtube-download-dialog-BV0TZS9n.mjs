import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { Ht as CircleCheck, It as Download, L as Play, N as RefreshCw, Pt as ExternalLink, it as LoaderCircle, n as X } from "../_libs/lucide-react.mjs";
import { a as DialogOverlay, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { t as COMPANION_ORIGIN } from "./companion-C8xPNDAD.mjs";
import { Z as Button, bn as closeYoutubeDownload } from "./library-app-VjV5eJfN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/youtube-download-dialog-BV0TZS9n.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var active = (status) => status === "queued" || status === "running";
async function request(path, signal, body) {
	const response = await fetch(`${COMPANION_ORIGIN}/youtube/downloads${path}`, {
		signal: AbortSignal.any([signal, AbortSignal.timeout(5e3)]),
		...body ? {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(body)
		} : {}
	});
	const result = await response.json();
	if (!response.ok || !result.ok) throw new Error(result.error || "Companion could not complete the request.");
	return result;
}
function YoutubeDownloadDialog({ target }) {
	const [state, setState] = (0, import_react.useState)(null), [error, setError] = (0, import_react.useState)(""), [loading, setLoading] = (0, import_react.useState)(true), [busy, setBusy] = (0, import_react.useState)(false);
	const [revision, setRevision] = (0, import_react.useState)(0);
	const [useBrowserSession, setUseBrowserSession] = (0, import_react.useState)(false);
	const [browser, setBrowser] = (0, import_react.useState)("chrome");
	const [watching, setWatching] = (0, import_react.useState)(false), [playError, setPlayError] = (0, import_react.useState)("");
	const mutation = (0, import_react.useRef)(null);
	const job = state?.jobs.find((row) => row.key === target.videoId);
	const running = active(job?.status);
	const refresh = (0, import_react.useCallback)(() => setRevision((n) => n + 1), []);
	(0, import_react.useEffect)(() => {
		let disposed = false, timer, controller = null;
		const load = async () => {
			clearTimeout(timer);
			if (document.hidden || busy || disposed) return;
			controller?.abort();
			const attempt = new AbortController();
			controller = attempt;
			try {
				const next = await request("", attempt.signal);
				if (disposed || attempt.signal.aborted) return;
				setState(next);
				setError("");
				setLoading(false);
				if (next.jobs.some((row) => row.key === target.videoId && active(row.status))) timer = setTimeout(load, 2e3);
			} catch (cause) {
				if (disposed || attempt.signal.aborted) return;
				setState(null);
				setLoading(false);
				setError(cause instanceof Error && !/fetch|network|timeout/i.test(cause.message) ? cause.message : "Companion is unavailable on this computer. Start Realhub Companion, then try again.");
			}
		};
		const visibility = () => {
			clearTimeout(timer);
			if (document.hidden) controller?.abort();
			else load();
		};
		load();
		document.addEventListener("visibilitychange", visibility);
		return () => {
			disposed = true;
			clearTimeout(timer);
			controller?.abort();
			document.removeEventListener("visibilitychange", visibility);
		};
	}, [
		target.videoId,
		revision,
		busy
	]);
	(0, import_react.useEffect)(() => () => mutation.current?.abort(), []);
	const act = async (cancel = false) => {
		if (busy || cancel && !job) return;
		const controller = new AbortController();
		mutation.current = controller;
		setBusy(true);
		setError("");
		try {
			setWatching(false);
			setPlayError("");
			const result = await request(cancel ? `/${job.id}/cancel` : "", controller.signal, cancel ? {} : {
				videoId: target.videoId,
				title: target.title,
				...useBrowserSession ? {
					useBrowserSession: true,
					browser
				} : {}
			});
			if (controller.signal.aborted) return;
			setState((previous) => previous ? {
				...previous,
				jobs: [result.job, ...previous.jobs.filter((row) => row.id !== result.job.id)]
			} : previous);
		} catch (cause) {
			if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Download request failed.");
		} finally {
			if (!controller.signal.aborted) {
				setBusy(false);
				refresh();
			}
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (open) => {
			if (!open) closeYoutubeDownload();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-60 bg-bg/80" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "youtube-download-dialog fixed inset-x-3 top-1/2 z-60 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-surface p-5 text-fg shadow-xl outline-none sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-widest text-accent",
						children: "Save to your computer"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "mt-2 font-display text-2xl",
						children: "YouTube download"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "min-h-11 min-w-11 shrink-0",
							"aria-label": "Close YouTube download",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "mt-3 break-words text-sm leading-6 text-muted",
					children: target.title
				}),
				!watching && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 rounded-lg border border-border bg-bg p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-sm font-medium",
							children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 motion-safe:animate-spin" }) : state?.configured ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-accent" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), loading ? "Checking Companion…" : state?.configured ? `${state.engine} ${state.version ?? ""}` : "Setup needed"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs leading-5 text-muted",
							children: "One video per download. Prefers MP4 with audio; uses the best combined format available. No playlist or live recording."
						}),
						state?.path && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 break-all text-xs leading-5 text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-fg",
									children: "Save folder"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								job?.path || state.path
							]
						})
					]
				}),
				!watching && !target.live && state?.configured && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-label": "Browser sign-in",
					className: "mt-4 rounded-lg border border-border p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-11 items-center gap-3 text-sm font-medium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: useBrowserSession,
								disabled: !state.browserAuth || running || busy,
								onChange: (event) => setUseBrowserSession(event.target.checked),
								className: "size-4 accent-accent"
							}), "Use my signed-in browser for this download"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs leading-5 text-muted",
							children: "For age-restricted or sign-in-required videos your YouTube account can already watch. The local downloader reads browser cookies for this request; cookies are never sent to Realhub or saved in its library."
						}),
						useBrowserSession && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-3 flex flex-wrap items-center gap-3 text-sm",
							children: ["Signed-in browser", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								"aria-label": "Signed-in browser",
								value: browser,
								disabled: running || busy,
								onChange: (event) => setBrowser(event.target.value),
								className: "min-h-11 rounded-md border border-border bg-bg px-3 text-fg",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "chrome",
										children: "Chrome"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "edge",
										children: "Edge"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "firefox",
										children: "Firefox"
									})
								]
							})]
						}),
						!state.browserAuth && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs leading-5 text-muted",
							children: "Update Companion with Setup-YouTube-Downloads.cmd to enable browser sign-in. Existing downloads still work."
						}),
						useBrowserSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs leading-5 text-muted",
							children: "If the browser cookie database is locked, close that browser and retry. If Chrome or Edge reports an encryption error, choose a signed-in Firefox session. YouTube may still require age verification or reject the request."
						})
					]
				}),
				!loading && !state?.configured && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 text-sm leading-6 text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"On the computer running Realhub, open ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-fg",
								children: "Setup-YouTube-Downloads.cmd"
							}),
							" in the Companion folder once, then open ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-fg",
								children: "Start-Realhub-Companion.cmd"
							}),
							"."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2",
							children: "The included setup installs the official yt-dlp release and approves a local save folder. Downloading requires Realhub on the same computer as Companion. A phone cannot use the computer’s download button remotely."
						}),
						state?.needs?.map((need) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2",
							children: need
						}, need))
					]
				}),
				target.live && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "note",
					className: "mt-4 text-sm text-muted",
					children: "This is a live stream. Download the archived video after it ends."
				}),
				job && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-label": "Download status",
					className: "mt-4 rounded-lg border border-border p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							role: "status",
							className: "text-sm font-medium",
							children: [{
								queued: "Queued",
								running: "Downloading",
								done: "Download complete",
								error: "Download failed",
								cancelled: "Cancelled"
							}[job.status], running && job.progress > 0 ? ` · ${Math.round(job.progress)}%` : ""]
						}),
						running && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("progress", {
							"aria-label": "Download progress",
							max: 100,
							value: job.progress || void 0,
							className: "mt-3 h-2 w-full accent-accent"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 break-words text-xs leading-5 text-muted",
							children: job.detail
						}),
						job.file && job.status === "done" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 break-all text-xs text-fg",
							children: job.file
						})
					]
				}),
				job?.status === "error" && /age|sign.?in|cookie|DPAPI|decrypt|encrypt|database|confirm.*bot/i.test(job.detail) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "note",
					className: "mt-3 text-sm leading-6 text-muted",
					children: "This video needs account access, or the browser session could not be read. Enable browser sign-in and choose the browser where this video plays on YouTube. For an encrypted Chrome/Edge session, try Firefox."
				}),
				watching && job?.status === "done" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-label": "Saved YouTube video",
					className: "mt-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							controls: true,
							autoPlay: true,
							playsInline: true,
							crossOrigin: "anonymous",
							preload: "metadata",
							"aria-label": `Saved video: ${target.title}`,
							src: `http://127.0.0.1:43123/youtube/downloads/${encodeURIComponent(job.id)}/media`,
							className: "aspect-video w-full rounded-lg bg-bg",
							onError: () => setPlayError("The saved video could not be played. Check Companion and the saved file; this browser may not support its codec.")
						}, job.id),
						playError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							role: "alert",
							className: "mt-2 text-sm leading-6 text-muted",
							children: playError
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted",
							children: "Playing the completed copy on this computer. Seeking uses the local file."
						})
					]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "mt-4 break-words text-sm leading-6 text-fg",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-wrap gap-2",
					children: [
						state?.configured && !target.live && !running && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "min-h-11",
							disabled: busy || useBrowserSession && !state.browserAuth,
							onClick: () => void act(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), busy ? "Starting…" : job?.status === "error" || job?.status === "cancelled" ? "Retry download" : job?.status === "done" ? "Download again" : `Download with ${state.engine}`]
						}),
						job?.status === "done" && state?.localPlayback && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							className: "min-h-11",
							onClick: () => {
								setWatching((value) => !value);
								setPlayError("");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), watching ? "Hide local player" : "Watch saved video"]
						}),
						running && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "min-h-11",
							disabled: busy,
							onClick: () => void act(true),
							children: "Cancel download"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							className: "min-h-11",
							disabled: busy,
							onClick: refresh,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), "Check status"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: `https://www.youtube.com/watch?v=${target.videoId}`,
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-11 items-center gap-2 px-2 text-sm text-muted hover:text-fg",
							children: ["Open YouTube", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" })]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-xs leading-5 text-muted",
					children: "Closing this panel keeps a started download running. Reopen this video’s Download button to check it."
				})
			]
		})] })
	});
}
//#endregion
export { YoutubeDownloadDialog as default };
