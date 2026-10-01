import { o as __toESM } from "../_runtime.mjs";
import { C as adultRemoteLabel, L as isAdultImageKind, z as isAdultPullKind } from "./adult-reddit-tags-D2uyB_M1.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { Ct as measureInteraction, Dn as useLibrary, K as getNote, Pt as resolvePlayUrl, Z as getRating, at as hasFreshViewerCount, kt as recordWatchTime, ln as setRating, n as Input, on as setNote, st as isAdultVideo, t as Button, ut as isLikelyPlayable, vt as lookupVideo } from "./input-CETQgBIY.mjs";
import { A as PictureInPicture2, H as Maximize, Ot as ChevronLeft, R as Minimize, a as Volume2, at as Heart, b as Shuffle, f as ThumbsUp, ft as Flame, i as VolumeX, j as Pause, k as Play, n as X, p as Tag, st as Glasses, v as SkipForward, vt as ExternalLink, xt as Cpu, y as SkipBack } from "../_libs/lucide-react.mjs";
import { d as formatTime, s as cn, u as formatBytes } from "./router-ZlJ09x8f.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as useThumbs, T as probeHardwareDecode, a as DropdownMenuContent, i as DropdownMenu, o as DropdownMenuItem, r as PullPauseButton, s as DropdownMenuTrigger, w as attachFrameCallback, x as downloadAdultPhoto } from "./routes-CweyLEat.mjs";
import { n as supportsRemoteComments, r as twitchEmbedUrl, t as AdultComments } from "./adult-comments-BS7w048B.mjs";
import { n as useVideoDetails, r as youtubeEmbedUrl, t as useBooruOriginal } from "./use-video-details-YjuYgwFF.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/player-CmWf3xfO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Slider({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
		className: cn("relative flex h-4 w-full touch-none items-center select-none", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
			className: "relative h-1 w-full grow overflow-hidden rounded-full bg-fg/15",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-accent" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block size-3 rounded-full bg-accent shadow-lift outline-none transition-transform duration-150 hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring/70" })]
	});
}
/** In-app full-bleed image viewer for booru / photo-kind adult pulls. */
function AdultImageLightbox({ video, tags = [] }) {
	const remote = video.remote;
	const { original, loading, failed } = useBooruOriginal(video);
	const src = original || video.src || remote?.embedUrl || remote?.previewUrl || video.poster || "";
	const sourceTags = tags.filter((tag) => tag.startsWith("source-")).slice(0, 4);
	const creatorTags = tags.filter((tag) => tag.startsWith("creator-")).slice(0, 4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 flex flex-col bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-h-0 flex-1 items-center justify-center p-3 sm:p-6",
			children: src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src,
				alt: video.name,
				className: "max-h-full max-w-full object-contain",
				decoding: "async",
				onError: () => {
					if (original) failed();
				},
				referrerPolicy: remote?.kind === "booru" && remote.channelId === "rule34" ? "strict-origin-when-cross-origin" : "no-referrer"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No image available for this title."
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-bg via-bg/80 to-transparent px-4 pb-20 pt-16 sm:px-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto mx-auto flex max-w-4xl flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: [adultRemoteLabel(remote?.kind), " photo viewer"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm text-fg",
						children: video.name
					}),
					remote?.kind === "booru" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						role: "status",
						children: loading ? "Loading original image…" : original ? "Original image" : "Showing saved image · open the post if the original is unavailable."
					}),
					(sourceTags.length > 0 || creatorTags.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: [...sourceTags, ...creatorTags].map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "rounded-full bg-elevated px-2 py-0.5 text-[11px] text-muted shadow-border",
							children: ["#", tag]
						}, tag))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "default",
							onClick: () => {
								downloadAdultPhoto(original ? {
									...video,
									src: original,
									remote: remote ? {
										...remote,
										embedUrl: original
									} : void 0
								} : video).then((result) => {
									if (result.ok) toast.success(`Saved ${result.name}`);
									else toast.error(result.error);
								});
							},
							children: "Download photo"
						}), remote?.watchUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: remote.watchUrl,
							target: "_blank",
							rel: "noreferrer",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "secondary",
								children: ["Open post page ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" })]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdultComments, { video })
				]
			})
		})]
	});
}
async function requestAdultOfflineSave(url) {
	const target = url.trim();
	if (!/^https:\/\//i.test(target)) return {
		ok: false,
		error: "No https URL to save."
	};
	try {
		const res = await fetch("http://127.0.0.1:43123/offline/save", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				origin: window.location.origin
			},
			body: JSON.stringify({ url: target }),
			signal: AbortSignal.timeout(6e3)
		});
		const data = await res.json();
		if (res.ok && data.ok) return {
			ok: true,
			detail: data.detail || (data.path ? `Download started into ${data.path}` : "Download started.")
		};
		return {
			ok: false,
			error: data.error || `Companion offline save unavailable (HTTP ${res.status}).`,
			needs: data.needs
		};
	} catch {
		return {
			ok: false,
			error: "Realhub Companion is not running. Start it locally to enable offline save.",
			needs: [
				"Start Realhub Companion",
				"Install yt-dlp on PATH or set YT_DLP_PATH",
				"Set REELCASE_ALLOWED_ROOTS / optional REELCASE_DOWNLOAD_DIR"
			]
		};
	}
}
var SPEEDS = [
	.5,
	.75,
	1,
	1.25,
	1.5,
	2
];
var EMPTY_TAGS = [];
var TAG_PRESETS = [
	"watch-later",
	"favorite",
	"family",
	"4k",
	"short",
	"documentary",
	"how-to",
	"comfort"
];
function Player({ playlist }) {
	const activeId = useLibrary((s) => s.activeId);
	const card = useLibrary((s) => lookupVideo(s.videos, s.activeId));
	const video = useVideoDetails(card);
	const directAdultMedia = Boolean(video?.remote && isAdultPullKind(video.remote.kind) && video.src && /\.(?:mp4|webm|gifv)(?:\?|$)/i.test(video.src) && !(video.remote.kind === "redgifs" && video.remote.embedUrl));
	const providerPlayback = Boolean(video?.remote) && !directAdultMedia;
	const closePlayer = useLibrary((s) => s.closePlayer);
	const openVideo = useLibrary((s) => s.openVideo);
	const playRelative = useLibrary((s) => s.playRelative);
	const markProgress = useLibrary((s) => s.markProgress);
	const toggleFavorite = useLibrary((s) => s.toggleFavorite);
	const toggleLike = useLibrary((s) => s.toggleLike);
	const setVideoTags = useLibrary((s) => s.setVideoTags);
	const setVideoCategory = useLibrary((s) => s.setVideoCategory);
	const hardwareAccel = useLibrary((s) => s.hardwareAccel);
	const setHardwareAccel = useLibrary((s) => s.setHardwareAccel);
	const removeVideo = useLibrary((s) => s.removeVideo);
	const restoreOne = useLibrary((s) => s.restoreOne);
	const markUnavailable = useLibrary((s) => s.markUnavailable);
	const folder = useLibrary((s) => s.folders.find((item) => item.id === video?.folderId));
	const fav = useLibrary((s) => s.activeId ? Boolean(s.favorites[s.activeId]) : false);
	const liked = useLibrary((s) => s.activeId ? Boolean(s.likes[s.activeId]) : false);
	const cameCount = useLibrary((s) => s.activeId ? s.cameCounts[s.activeId] ?? 0 : 0);
	const markCame = useLibrary((s) => s.markCame);
	const folders = useLibrary((s) => s.folders);
	const tags = useLibrary((s) => s.activeId ? s.tags[s.activeId] ?? EMPTY_TAGS : EMPTY_TAGS);
	const category = useLibrary((s) => s.activeId ? s.categories[s.activeId] ?? "" : "");
	const saved = useLibrary((s) => s.activeId ? s.progress[s.activeId] : void 0);
	const wrapRef = (0, import_react.useRef)(null);
	const mediaRef = (0, import_react.useRef)(null);
	const embedRef = (0, import_react.useRef)(null);
	const hideTimer = (0, import_react.useRef)(0);
	const [src, setSrc] = (0, import_react.useState)(null);
	const [srcError, setSrcError] = (0, import_react.useState)(null);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [current, setCurrent] = (0, import_react.useState)(0);
	const [duration, setDuration] = (0, import_react.useState)(0);
	const [volume, setVolume] = (0, import_react.useState)(() => {
		try {
			const saved = Number(localStorage.getItem("reelcase.player-volume") ?? "85");
			return [
				25,
				50,
				70,
				85,
				100
			].includes(saved) ? saved / 100 : .85;
		} catch {
			return .85;
		}
	});
	const [muted, setMuted] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.player-start-muted") === "true";
		} catch {
			return false;
		}
	});
	const [speed, setSpeed] = (0, import_react.useState)(1);
	const [chrome, setChrome] = (0, import_react.useState)(true);
	const [fs, setFs] = (0, import_react.useState)(false);
	const [scrub, setScrub] = (0, import_react.useState)(null);
	const [loadError, setLoadError] = (0, import_react.useState)(null);
	const [hw, setHw] = (0, import_react.useState)(null);
	const [vrAvailable, setVrAvailable] = (0, import_react.useState)(false);
	const [vrStatus, setVrStatus] = (0, import_react.useState)("");
	const [removeReady, setRemoveReady] = (0, import_react.useState)(false);
	const [twitchTheater, setTwitchTheater] = (0, import_react.useState)(true);
	const capturedDur = useThumbs((s) => video ? s.durations[video.id] : void 0);
	const scrubbing = (0, import_react.useRef)(false);
	const remoteStartedAt = (0, import_react.useRef)(0);
	const lastProgressWrite = (0, import_react.useRef)(0);
	const lastWatchTick = (0, import_react.useRef)(0);
	const pendingWatchSeconds = (0, import_react.useRef)(0);
	const enterVrTheater = (0, import_react.useCallback)(async () => {
		const xr = navigator.xr;
		const media = mediaRef.current;
		if (!xr) {
			setVrStatus("VR needs Meta Quest Browser on a secure site. Open Realhub there, allow immersive VR, then try again.");
			return;
		}
		if (!media) {
			setVrStatus("VR cinema is available for local video playback. Open a local file first; embedded provider video stays in its official player.");
			return;
		}
		try {
			const session = await xr.requestSession("immersive-vr", { optionalFeatures: ["local-floor", "bounded-floor"] });
			const canvas = document.createElement("canvas");
			const gl = canvas.getContext("webgl", { xrCompatible: true });
			if (!gl) {
				await session.end();
				setVrStatus("This headset browser could not create the cinema surface. Update Meta Quest Browser and retry.");
				return;
			}
			await gl.makeXRCompatible?.();
			const layer = new window.XRWebGLLayer(session, gl);
			session.updateRenderState({ baseLayer: layer });
			const source = await session.requestReferenceSpace("local");
			const shader = (type, code) => {
				const part = gl.createShader(type);
				gl.shaderSource(part, code);
				gl.compileShader(part);
				return part;
			};
			const program = gl.createProgram();
			gl.attachShader(program, shader(gl.VERTEX_SHADER, "attribute vec2 p; varying vec2 uv; void main(){uv=(p+1.0)*.5;gl_Position=vec4(p,0.,1.);}"));
			gl.attachShader(program, shader(gl.FRAGMENT_SHADER, "precision mediump float; varying vec2 uv; uniform sampler2D video; void main(){vec2 q=vec2(uv.x,1.0-uv.y); gl_FragColor=texture2D(video,q);}"));
			gl.linkProgram(program);
			gl.useProgram(program);
			const buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
				-1,
				-1,
				1,
				-1,
				-1,
				1,
				-1,
				1,
				1,
				-1,
				1,
				1
			]), gl.STATIC_DRAW);
			const position = gl.getAttribLocation(program, "p");
			gl.enableVertexAttribArray(position);
			gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
			const texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			let lastControl = 0;
			const render = (time, frame) => {
				const pose = frame.getViewerPose(source);
				if (pose) {
					gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer);
					for (const view of pose.views) {
						const viewport = layer.getViewport(view);
						gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
						try {
							gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, media);
						} catch {}
						gl.drawArrays(gl.TRIANGLES, 0, 6);
					}
				}
				for (const input of session.inputSources) {
					const buttons = input.gamepad?.buttons;
					if (buttons?.[0]?.pressed && time - lastControl > 500) {
						media.paused ? media.play() : media.pause();
						lastControl = time;
					}
					if (buttons?.[4]?.pressed && time - lastControl > 500) {
						media.currentTime = Math.max(0, media.currentTime - 10);
						lastControl = time;
					}
					if (buttons?.[5]?.pressed && time - lastControl > 500) {
						media.currentTime += 10;
						lastControl = time;
					}
				}
				session.requestAnimationFrame(render);
			};
			session.requestAnimationFrame(render);
			setVrStatus("VR cinema active. Trigger: play/pause · left grip: −10 seconds · right grip: +10 seconds. Use the headset system button to exit.");
			session.addEventListener("end", () => {
				gl.deleteTexture(texture);
				gl.deleteProgram(program);
				canvas.remove();
				setVrStatus("VR cinema closed.");
			});
		} catch {
			setVrStatus("VR cinema was not started. In Meta Quest Browser, allow immersive VR, use HTTPS, and retry with a local playable video.");
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (!video) {
			setSrc(null);
			return;
		}
		if (video.remote) {
			setSrc(null);
			setSrcError(null);
			setLoadError(null);
			return;
		}
		let cancelled = false;
		setSrcError(null);
		setLoadError(null);
		setPlaying(false);
		setCurrent(0);
		setHw(null);
		resolvePlayUrl(video).then((url) => {
			if (!cancelled) setSrc(url);
		}).catch((err) => {
			const message = err instanceof Error ? err.message : "Could not open file";
			if (!cancelled) {
				setSrcError(message);
				markUnavailable(video.id, message);
			}
		});
		probeHardwareDecode(video.mime).then((info) => {
			if (!cancelled) setHw(info);
		});
		return () => {
			cancelled = true;
		};
	}, [video]);
	(0, import_react.useEffect)(() => {
		return () => {
			const el = mediaRef.current;
			if (!el) return;
			try {
				el.pause();
				el.removeAttribute("src");
				el.load();
			} catch {}
		};
	}, []);
	const reveal = (0, import_react.useCallback)(() => {
		setChrome(true);
		window.clearTimeout(hideTimer.current);
		if (providerPlayback) return;
		hideTimer.current = window.setTimeout(() => {
			setChrome(false);
		}, 2400);
	}, [providerPlayback]);
	(0, import_react.useEffect)(() => {
		reveal();
		return () => window.clearTimeout(hideTimer.current);
	}, [activeId, reveal]);
	(0, import_react.useEffect)(() => {
		const el = mediaRef.current;
		if (!el || !src) return;
		const flushWatchTime = () => {
			if (video && pendingWatchSeconds.current > 0) recordWatchTime(video.id, "fullscreen", pendingWatchSeconds.current);
			pendingWatchSeconds.current = 0;
			lastWatchTick.current = 0;
		};
		const onPlay = () => {
			setPlaying(true);
			lastWatchTick.current = performance.now();
		};
		const onPause = () => {
			setPlaying(false);
			flushWatchTime();
		};
		const onMeta = () => {
			setDuration(el.duration || 0);
			const resume = saved;
			if (resume && resume.t > 1 && resume.d > 0 && resume.t / resume.d < .95) {
				el.currentTime = resume.t;
				setCurrent(resume.t);
			}
		};
		const onEnd = () => {
			if (video && el.duration) markProgress(video.id, el.duration, el.duration);
			try {
				if (JSON.parse(localStorage.getItem("reelcase.settings.v2") ?? "{}")["playback-autoplay-next-video"]) playRelative(1, playlist);
			} catch {}
		};
		const onErr = () => {
			const message = isLikelyPlayable(video?.extension ?? "") ? "This file could not be decoded." : `${(video?.extension ?? "this").toUpperCase()} often needs a desktop player.`;
			setLoadError(message);
			if (video) markUnavailable(video.id, message);
		};
		const stopFrames = attachFrameCallback(el, (t) => {
			if (scrubbing.current) return;
			if (!el.paused && !el.seeking && document.visibilityState === "visible") {
				const now = performance.now();
				if (lastWatchTick.current) pendingWatchSeconds.current += Math.min(.5, Math.max(0, (now - lastWatchTick.current) / 1e3));
				lastWatchTick.current = now;
				if (pendingWatchSeconds.current >= 4) flushWatchTime();
			} else lastWatchTick.current = 0;
			setCurrent(t);
			if (video && el.duration) {
				const now = Date.now();
				if (now - lastProgressWrite.current >= 4e3) {
					lastProgressWrite.current = now;
					markProgress(video.id, t, el.duration);
				}
			}
		});
		el.addEventListener("play", onPlay);
		el.addEventListener("pause", onPause);
		el.addEventListener("loadedmetadata", onMeta);
		el.addEventListener("ended", onEnd);
		el.addEventListener("error", onErr);
		el.play().catch(() => {});
		return () => {
			flushWatchTime();
			stopFrames();
			el.removeEventListener("play", onPlay);
			el.removeEventListener("pause", onPause);
			el.removeEventListener("loadedmetadata", onMeta);
			el.removeEventListener("ended", onEnd);
			el.removeEventListener("error", onErr);
		};
	}, [src, video?.id]);
	(0, import_react.useEffect)(() => {
		if (!video?.remote) return;
		remoteStartedAt.current = Date.now();
		lastProgressWrite.current = 0;
		const durationHint = Math.max(video.duration ?? 0, 120);
		const heartbeat = () => {
			if (document.visibilityState === "hidden") return;
			const elapsed = Math.max(2, (Date.now() - remoteStartedAt.current) / 1e3);
			markProgress(video.id, Math.min(elapsed, durationHint * .94), durationHint);
			if (elapsed >= 8 && document.hasFocus()) recordWatchTime(video.id, "fullscreenEstimated", 5);
		};
		const timer = window.setInterval(heartbeat, 1e4);
		return () => {
			heartbeat();
			window.clearInterval(timer);
		};
	}, [
		markProgress,
		video?.id,
		video?.remote
	]);
	(0, import_react.useEffect)(() => {
		const el = mediaRef.current;
		if (el) el.playbackRate = speed;
	}, [speed, src]);
	(0, import_react.useEffect)(() => {
		const xr = navigator.xr;
		if (xr) xr.isSessionSupported("immersive-vr").then(setVrAvailable).catch(() => setVrAvailable(false));
	}, []);
	(0, import_react.useEffect)(() => {
		const el = mediaRef.current;
		if (!el) return;
		el.volume = volume;
		el.muted = muted;
	}, [
		volume,
		muted,
		src
	]);
	(0, import_react.useEffect)(() => {
		const onFs = () => setFs(Boolean(document.fullscreenElement));
		document.addEventListener("fullscreenchange", onFs);
		return () => document.removeEventListener("fullscreenchange", onFs);
	}, []);
	const togglePlay = (0, import_react.useCallback)(() => {
		measureInteraction("playback");
		const el = mediaRef.current;
		if (!el) return;
		if (el.paused) el.play();
		else el.pause();
	}, []);
	const seekBy = (0, import_react.useCallback)((delta) => {
		const el = mediaRef.current;
		if (!el) return;
		el.currentTime = Math.max(0, Math.min(el.duration || 0, el.currentTime + delta));
	}, []);
	const toggleFs = (0, import_react.useCallback)(async () => {
		const wrap = wrapRef.current;
		if (!wrap) return;
		if (document.fullscreenElement) await document.exitFullscreen();
		else await (embedRef.current ?? wrap).requestFullscreen().catch(() => {});
	}, []);
	const playRandom = (0, import_react.useCallback)(() => {
		const choices = playlist.filter((id) => id !== activeId);
		const nextId = choices[Math.floor(Math.random() * choices.length)];
		if (nextId) openVideo(nextId);
	}, [
		activeId,
		openVideo,
		playlist
	]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			const tag = e.target?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target?.isContentEditable) return;
			if (embedRef.current && ![
				"Escape",
				"n",
				"N",
				"p",
				"P"
			].includes(e.key)) return;
			switch (e.key) {
				case " ":
				case "k":
				case "K":
					e.preventDefault();
					togglePlay();
					break;
				case "Escape":
					if (document.fullscreenElement) document.exitFullscreen();
					else closePlayer();
					break;
				case "ArrowLeft":
					e.preventDefault();
					seekBy(e.shiftKey ? -30 : -10);
					break;
				case "ArrowRight":
					e.preventDefault();
					seekBy(e.shiftKey ? 30 : 10);
					break;
				case "ArrowUp":
					e.preventDefault();
					setVolume((v) => Math.min(1, v + .05));
					setMuted(false);
					break;
				case "ArrowDown":
					e.preventDefault();
					setVolume((v) => Math.max(0, v - .05));
					break;
				case "f":
				case "F":
					e.preventDefault();
					toggleFs();
					break;
				case "m":
				case "M":
					setMuted((m) => !m);
					break;
				case "n":
				case "N":
					playRelative(1, playlist);
					break;
				case "p":
				case "P":
					playRelative(-1, playlist);
					break;
				case "r":
				case "R": playRandom();
			}
			reveal();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		togglePlay,
		seekBy,
		toggleFs,
		closePlayer,
		playRelative,
		playlist,
		playRandom,
		reveal
	]);
	if (!video) return null;
	const remote = video.remote;
	const adultImage = Boolean(remote && isAdultImageKind(remote.kind, video.mime, video.extension));
	const embedSrc = adultImage ? null : remote ? remote.kind === "twitch" ? twitchEmbedUrl(remote, typeof window === "undefined" ? "" : window.location.hostname) : remote.kind === "youtube" ? youtubeEmbedUrl(remote.embedUrl ?? video.src ?? remote.watchUrl ?? "", remote.videoId, typeof window === "undefined" ? void 0 : window.location.origin) : isAdultPullKind(remote.kind) ? remote.kind === "myfreecams" || directAdultMedia ? null : remote.embedUrl ?? video.src ?? null : remote.embedUrl ? `${remote.embedUrl}${remote.embedUrl.includes("?") ? "&" : "?"}autoplay=1&rel=0&modestbranding=1` : null : null;
	const shown = scrub ?? current;
	const dur = duration || capturedDur || video.duration || 0;
	const i = playlist.indexOf(video.id);
	const hwLabel = hardwareAccel && hw?.powerEfficient ? "GPU decode" : hardwareAccel ? "Hardware on" : "Software";
	const officialPlayer = Boolean(embedSrc);
	const twitchSideMode = remote?.kind === "twitch" && !twitchTheater;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: wrapRef,
		className: cn("fixed inset-0 z-50 flex flex-col bg-bg", officialPlayer && "overflow-hidden", twitchSideMode && "p-4 sm:p-6"),
		onMouseMove: reveal,
		onTouchStart: reveal,
		children: [
			adultImage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdultImageLightbox, {
				video,
				tags
			}) : embedSrc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
				ref: embedRef,
				title: video.name,
				src: embedSrc,
				className: cn("order-2 min-h-0 w-full flex-1 border-0 bg-bg", twitchSideMode && "sm:w-[68%]"),
				allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen",
				allowFullScreen: true,
				referrerPolicy: "strict-origin-when-cross-origin"
			}, `embed:${video.id}`) : remote?.kind === "youtube" || remote?.kind === "myfreecams" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex items-center justify-center bg-bg px-6 text-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl text-fg",
						children: remote.kind === "myfreecams" ? "This room plays on MyFreeCams" : "This title plays on YouTube"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-3 max-w-md text-sm text-muted",
						children: remote.kind === "myfreecams" ? "MyFreeCams does not provide an embeddable public player. Open the confirmed live room directly." : "The embedded player could not be built for this title. Open it on YouTube instead."
					}),
					remote.watchUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: remote.watchUrl,
						target: "_blank",
						rel: "noreferrer",
						className: "mt-5 inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg",
						children: [
							"Open ",
							remote.kind === "myfreecams" ? "MyFreeCams" : "YouTube",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-2 size-4" })
						]
					})
				] })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref: mediaRef,
				src: (directAdultMedia ? video.src : src) ?? void 0,
				className: cn("absolute inset-0 size-full object-contain bg-bg", hardwareAccel && "hw-video"),
				playsInline: true,
				autoPlay: true,
				preload: "auto",
				onCanPlay: (event) => {
					if (remote?.kind === "redgifs") event.currentTarget.play().catch(() => void 0);
				},
				onClick: togglePlay,
				onDoubleClick: () => void toggleFs()
			}),
			twitchSideMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "absolute right-4 top-20 hidden w-[28%] rounded-lg bg-elevated p-4 shadow-border sm:block",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Twitch details"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-2 font-display text-xl text-fg",
						children: remote?.channelName ?? video.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-6 text-muted",
						children: video.description || video.tagline || "Live and VOD details stay visible beside the official Twitch player."
					}),
					remote?.watchUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: remote.watchUrl,
						target: "_blank",
						rel: "noreferrer",
						className: "mt-4 inline-flex text-sm text-accent",
						children: ["Open on Twitch ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-1 size-4" })]
					})
				]
			}),
			!officialPlayer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("pointer-events-none absolute inset-0 bg-linear-to-t from-bg via-transparent to-bg/50 transition-opacity duration-200 ease-[var(--ease-out)]", chrome ? "opacity-100" : "opacity-0") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("relative z-10 flex items-center justify-between gap-3 px-4 py-3 transition-[opacity,transform] duration-200 ease-[var(--ease-smooth-out)] sm:px-6", officialPlayer ? "order-1 shrink-0 flex-wrap border-b border-border bg-surface" : chrome ? "opacity-100" : "pointer-events-none opacity-0 -translate-y-1"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "Back to library",
						onClick: closePlayer,
						children: fs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "truncate font-display text-xl leading-tight text-fg sm:text-2xl",
							children: video.name.replace(/\.[^/.]+$/, "")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted",
							children: remote ? [
								remote.live ? "Live" : adultRemoteLabel(remote.kind),
								remote.channelName,
								hasFreshViewerCount(remote) ? `${remote.viewers?.toLocaleString()} watching` : null
							].filter(Boolean).join(" · ") : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								video.path,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-subtle",
									children: " · "
								}),
								video.extension.toUpperCase(),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-subtle",
									children: " · "
								}),
								formatBytes(video.size)
							] })
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex max-w-full items-center gap-1 overflow-x-auto",
					children: [
						!officialPlayer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mr-1 hidden items-center gap-1 rounded-full bg-elevated px-2 py-1 text-xs text-muted shadow-border sm:inline-flex",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cpu, { className: "size-3" }), hwLabel]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": fav ? "Remove from favorites" : "Add to favorites",
							onClick: () => toggleFavorite(video.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-4", fav && "fill-accent text-accent") })
						}),
						remote?.kind === "twitch" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => setTwitchTheater((value) => !value),
							children: [twitchTheater ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize, { className: "size-4" }), twitchTheater ? "Side details" : "Theater"]
						}),
						!officialPlayer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							disabled: !vrAvailable,
							title: vrAvailable ? "Enter the headset theater" : "VR requires Meta Quest Browser on a secure site",
							onClick: () => void enterVrTheater(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glasses, { className: "size-4" }), " VR theater"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": liked ? "Remove like" : "Like",
							onClick: () => toggleLike(video.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbsUp, { className: cn("size-4", liked && "fill-accent text-accent") })
						}),
						isAdultVideo(video, folders) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: cameCount > 0 ? "secondary" : "ghost",
							size: "sm",
							"aria-label": "I cummed to it",
							onClick: () => markCame(video.id),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: cn("size-4", cameCount > 0 && "fill-accent text-accent") }),
								"I cummed to it",
								cameCount > 0 ? ` · ${cameCount}` : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "Edit tags and category",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-4" })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
							align: "end",
							className: "w-72 p-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetadataEditor, {
								videoId: video.id,
								initialTags: tags,
								initialCategory: category,
								onSave: (nextTags, nextCategory) => {
									setVideoTags(video.id, nextTags);
									setVideoCategory(video.id, nextCategory);
								}
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PullPauseButton, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "Close",
							onClick: closePlayer,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
						}),
						remote?.watchUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: remote.watchUrl,
							target: "_blank",
							rel: "noreferrer",
							className: "hidden items-center gap-1 text-xs text-accent hover:text-fg sm:inline-flex",
							children: ["Open official player ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3" })]
						}),
						remote && isAdultPullKind(remote.kind) && (remote.watchUrl || remote.embedUrl) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							title: "Requires local Companion + yt-dlp",
							onClick: () => {
								requestAdultOfflineSave(remote.watchUrl || remote.embedUrl || "").then((result) => {
									if (result.ok) toast.success(result.detail);
									else toast.error(result.needs?.length ? `${result.error} (${result.needs.join(", ")})` : result.error);
								});
							},
							children: "Save offline"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => {
								if (removeReady) removeVideo(video.id);
								else setRemoveReady(true);
							},
							children: removeReady ? "Confirm remove" : "Remove"
						})
					]
				})]
			}),
			(srcError || loadError) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 mx-auto mt-auto mb-auto max-w-md rounded-xl bg-surface px-6 py-5 text-center shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl text-fg",
						children: "Can’t play this file"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: srcError || loadError
					}),
					!remote && folder?.kind === "directory" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 border-t border-border pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs leading-5 text-subtle",
							children: "Realhub still has this title in your catalog, but the browser no longer has permission to read its folder."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "mt-3",
							onClick: () => void restoreOne(folder.id),
							children: ["Reconnect ", folder.name]
						})]
					})
				]
			}),
			vrStatus && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "absolute z-20 right-4 bottom-4 max-w-sm rounded-md bg-surface/95 px-3 py-2 text-xs text-fg shadow-border sm:right-6",
				children: vrStatus
			}),
			remote && supportsRemoteComments(remote.kind) && chrome && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn(officialPlayer ? "order-3 max-h-48 shrink-0 overflow-y-auto border-t border-border bg-surface px-4" : "absolute z-20 bottom-24 left-4 right-4 max-w-xl sm:left-6"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdultComments, { video }, video.id)
			}),
			(!remote || directAdultMedia) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("relative z-10 mt-auto px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-[opacity,transform] duration-200 ease-[var(--ease-smooth-out)] sm:px-6", chrome ? "opacity-100" : "pointer-events-none opacity-0 translate-y-1"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						min: 0,
						max: Math.max(dur, .01),
						step: .05,
						value: [shown],
						onValueChange: (v) => {
							scrubbing.current = true;
							setScrub(v[0] ?? 0);
						},
						onValueCommit: (v) => {
							const t = v[0] ?? 0;
							const el = mediaRef.current;
							if (el) el.currentTime = t;
							setCurrent(t);
							setScrub(null);
							scrubbing.current = false;
						},
						"aria-label": "Seek"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-center gap-1 sm:gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "Previous",
								disabled: i <= 0,
								onClick: () => playRelative(-1, playlist),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipBack, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								size: "icon",
								"aria-label": playing ? "Pause" : "Play",
								onClick: togglePlay,
								children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-4 fill-current" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "Next",
								disabled: i < 0 || i >= playlist.length - 1,
								onClick: () => playRelative(1, playlist),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "Play a random video",
								disabled: playlist.length < 2,
								onClick: playRandom,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "ml-1 min-w-20 font-mono text-xs tabular-nums text-muted",
								children: [
									formatTime(shown),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-subtle",
										children: " / "
									}),
									formatTime(dur)
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "ml-auto flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon-sm",
										"aria-label": muted ? "Unmute" : "Mute",
										onClick: () => setMuted((m) => !m),
										children: muted || volume === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "hidden w-24 sm:block",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
											min: 0,
											max: 1,
											step: .01,
											value: [muted ? 0 : volume],
											onValueChange: (v) => {
												setVolume(v[0] ?? 0);
												setMuted((v[0] ?? 0) === 0);
											},
											"aria-label": "Volume"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "sm",
											className: "tabular-nums",
											children: speed === 1 ? "1×" : `${speed}×`
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
										align: "end",
										children: [SPEEDS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onSelect: () => setSpeed(s),
											children: [
												s === speed ? "· " : "  ",
												s,
												"×"
											]
										}, s)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
											onSelect: () => setHardwareAccel(!hardwareAccel),
											children: [hardwareAccel ? "· " : "  ", "Hardware accel"]
										})]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon-sm",
										"aria-label": "Picture in picture",
										onClick: () => {
											const el = mediaRef.current;
											if (el && document.pictureInPictureEnabled) el.requestPictureInPicture().catch(() => {});
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PictureInPicture2, { className: "size-4" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon-sm",
										"aria-label": fs ? "Exit fullscreen" : "Fullscreen",
										onClick: () => void toggleFs(),
										children: fs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize, { className: "size-4" })
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 hidden text-center text-xs text-subtle sm:block",
						children: "Space play · ← → 10s · F full · M mute · N / P next · Esc close"
					})
				]
			}),
			remote && !directAdultMedia && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("relative z-10 flex items-center justify-between gap-3 px-4 py-3 sm:px-6", officialPlayer ? "order-4 shrink-0 border-t border-border bg-surface" : "mt-auto"),
				children: [remote.watchUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: remote.watchUrl,
					target: "_blank",
					rel: "noreferrer",
					className: "text-sm text-muted hover:text-fg",
					children: ["Open on ", adultRemoteLabel(remote.kind)]
				}), officialPlayer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-muted",
					children: [
						"Playback and fullscreen controls are in the ",
						adultRemoteLabel(remote.kind),
						" player."
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					"aria-label": officialPlayer ? "Fullscreen official player" : "Fullscreen",
					onClick: () => void toggleFs(),
					children: fs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize, { className: "size-4" })
				})]
			})
		]
	});
}
function MetadataEditor({ videoId, initialTags, initialCategory, onSave }) {
	const [tags, setTags] = (0, import_react.useState)(initialTags.join(", "));
	const [category, setCategory] = (0, import_react.useState)(initialCategory);
	const [rating, setRating$1] = (0, import_react.useState)(0);
	const [note, setNote$1] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setTags(initialTags.join(", "));
		setCategory(initialCategory);
		try {
			setRating$1(getRating(videoId));
			setNote$1(getNote(videoId));
		} catch {
			setRating$1(0);
			setNote$1("");
		}
	}, [
		videoId,
		initialCategory,
		initialTags
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium text-fg",
				children: "Local metadata"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: "Saved only in this browser."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-xs text-muted",
				children: ["Category", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: category,
					onChange: (event) => setCategory(event.target.value),
					placeholder: "Movie, tutorial, stream…",
					className: "mt-1"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-xs text-muted",
				children: ["Tags", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: tags,
					onChange: (event) => setTags(event.target.value),
					placeholder: "noir, favorites, watch later",
					className: "mt-1"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: "Quick tags"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex flex-wrap gap-1.5",
				children: TAG_PRESETS.map((preset) => {
					const selected = tags.split(",").map((tag) => tag.trim().toLowerCase()).includes(preset);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setTags((value) => {
							const rows = value.split(",").map((tag) => tag.trim()).filter(Boolean);
							return selected ? rows.filter((tag) => tag.toLowerCase() !== preset).join(", ") : [...rows, preset].join(", ");
						}),
						className: cn("rounded-full px-2 py-1 text-[11px] shadow-border", selected ? "bg-accent text-accent-fg" : "bg-elevated text-muted"),
						children: preset
					}, preset);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: "Your rating"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 flex gap-1",
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
						(0, import_react.startTransition)(() => setRating(videoId, value));
					},
					className: cn("flex size-8 items-center justify-center rounded-sm text-sm shadow-border", value <= rating ? "bg-accent text-accent-fg" : "bg-elevated text-muted"),
					children: value
				}, value))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-xs text-muted",
				children: ["Private viewing note", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: note,
					onChange: (event) => setNote$1(event.target.value),
					placeholder: "Why save this? What to watch for?",
					className: "mt-1"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				className: "w-full",
				onClick: () => {
					setNote(videoId, note);
					onSave(tags.split(","), category);
				},
				children: "Save metadata"
			})
		]
	});
}
//#endregion
export { Player };
