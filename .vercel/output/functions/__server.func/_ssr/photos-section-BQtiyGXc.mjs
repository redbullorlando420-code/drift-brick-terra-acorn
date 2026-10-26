import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { F as RefreshCw, It as EyeOff, Jt as ChevronLeft, _t as Images, qt as ChevronRight, rt as Maximize2, v as Star, zt as Download } from "../_libs/lucide-react.mjs";
import { Dt as Input, M as registerPeriodicTask, Ot as Button, Xn as useLibrary, Yr as loadDurablePhotosSync, Z as decodeArtworkBitmap, Zt as getPerformanceProfile, er as useSourceAssets, pi as restoreDurablePhotos, si as ratingPreference, yi as saveDurablePhotos } from "./library-app-CrsCDQmv.mjs";
import { i as setReviewedPhotos, t as clearReviewedPhotos } from "./reviewed-photo-bridges-Cz-X6fSv.mjs";
import { d as bytes, s as HubShell } from "./hub-shared-CSaQ1YXN.mjs";
import { n as benchmarkVisionModelsLocally, r as classifyImagesLocally, t as VISION_MODELS } from "./local-vision-DyOHjYy5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/photos-section-BQtiyGXc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LOCAL_UPSCALER = {
	name: "Swin2SR x2 beta",
	model: "Xenova/swin2SR-classical-sr-x2-64",
	revision: "93dfc9089abda257351d3a58d5771e2c1ff69442",
	sha256: "49ffa7b96532edb9553c74be11b623dafa26db1645611096a208449451a960df",
	artifactUrl: "https://huggingface.co/Xenova/swin2SR-classical-sr-x2-64/resolve/93dfc9089abda257351d3a58d5771e2c1ff69442/onnx/model_q4f16.onnx",
	shippedArtifactUrl: "/models/swin2sr-x2-q4f16.onnx",
	cacheKey: "/reelcase-local-models/upscaler.onnx"
};
var PHOTO_FILE_RE = /\.(avif|bmp|gif|heic|heif|jpe?g|png|tiff?|webp)$/i;
var photoSourceWarmth = /* @__PURE__ */ new Map();
var PHOTO_BACKGROUND_REFRESH_MS = 18e5;
var cachedPhotoMetadata = null;
var photoMetaHydrated = false;
function photoMetadata() {
	if (cachedPhotoMetadata) return cachedPhotoMetadata;
	const durable = loadDurablePhotosSync();
	if (durable?.meta && Object.keys(durable.meta).length) {
		cachedPhotoMetadata = durable.meta;
		return cachedPhotoMetadata;
	}
	try {
		cachedPhotoMetadata = JSON.parse(localStorage.getItem("reelcase.photo-meta.v1") ?? "{}");
	} catch {
		cachedPhotoMetadata = {};
	}
	return cachedPhotoMetadata;
}
function persistPhotoMetadata(next, sources) {
	cachedPhotoMetadata = next;
	const likes = Object.entries(next).filter(([, row]) => row.favorite).map(([id]) => id);
	saveDurablePhotos({
		meta: next,
		likes,
		...sources ? { sources } : {}
	});
}
function PhotosSection() {
	const scannedPhotoSources = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		if (photoMetaHydrated) return;
		photoMetaHydrated = true;
		restoreDurablePhotos().then((durable) => {
			cachedPhotoMetadata = {
				...cachedPhotoMetadata ?? {},
				...durable.meta
			};
			if (durable.sources.length) {}
		}).catch(() => void 0);
	}, []);
	const photoUrls = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const knownPhotoIds = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const discoverySeen = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const metadataWriteTimer = (0, import_react.useRef)(null);
	const [ratingFilter, setRatingFilter] = (0, import_react.useState)("all");
	const [ratingQueuePhotoId, setRatingQueuePhotoId] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.photos.rating-queue") ?? "";
		} catch {
			return "";
		}
	});
	const [photos, setPhotos] = (0, import_react.useState)([]);
	const [photoAuditAck, setPhotoAuditAck] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		clearReviewedPhotos();
	}, []);
	const [showHiddenPhotos, setShowHiddenPhotos] = (0, import_react.useState)(false);
	const [selectedPerson, setSelectedPerson] = (0, import_react.useState)("All photos");
	const [selectedAlbum, setSelectedAlbum] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.photos.source-filter") || "All albums";
		} catch {
			return "All albums";
		}
	});
	const [selectedTag, setSelectedTag] = (0, import_react.useState)("All tags");
	const [selectedPhotoIds, setSelectedPhotoIds] = (0, import_react.useState)(() => /* @__PURE__ */ new Set());
	const [photoSearch, setPhotoSearch] = (0, import_react.useState)("");
	const [discoveryFilter, setDiscoveryFilter] = (0, import_react.useState)("all");
	const [favoritesOnly, setFavoritesOnly] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.photos.favorites-only") === "true";
		} catch {
			return false;
		}
	});
	const [photoSort, setPhotoSort] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.photos.sort") || "newest";
		} catch {
			return "newest";
		}
	});
	const [showLocations, setShowLocations] = (0, import_react.useState)(() => {
		try {
			return localStorage.getItem("reelcase.photos.show-locations") === "true";
		} catch {
			return false;
		}
	});
	const [photoFolders, setPhotoFolders] = (0, import_react.useState)([]);
	const [slideshow, setSlideshow] = (0, import_react.useState)(false);
	const [fullScreenSlide, setFullScreenSlide] = (0, import_react.useState)(false);
	const [slideSeconds, setSlideSeconds] = (0, import_react.useState)(() => {
		try {
			const value = Number(localStorage.getItem("reelcase.photos.slide-seconds") ?? "5");
			return [
				3,
				5,
				10,
				20,
				30
			].includes(value) ? value : 5;
		} catch {
			return 5;
		}
	});
	const [slideIndex, setSlideIndex] = (0, import_react.useState)(0);
	const [helperNote, setHelperNote] = (0, import_react.useState)("");
	const [focusedPhotoId, setFocusedPhotoId] = (0, import_react.useState)(null);
	const [photoViewerLoading, setPhotoViewerLoading] = (0, import_react.useState)(false);
	const [photoSourceLoading, setPhotoSourceLoading] = (0, import_react.useState)(false);
	const [photoScanTotal, setPhotoScanTotal] = (0, import_react.useState)(0);
	const [photoScanDone, setPhotoScanDone] = (0, import_react.useState)(0);
	const [photoScanStartedAt, setPhotoScanStartedAt] = (0, import_react.useState)(0);
	const [photoScanEstimatedPhotos, setPhotoScanEstimatedPhotos] = (0, import_react.useState)(0);
	const [photoScanFoundPhotos, setPhotoScanFoundPhotos] = (0, import_react.useState)(0);
	const [photoScanAverageMs, setPhotoScanAverageMs] = (0, import_react.useState)(0);
	const [photoMetadataProgress, setPhotoMetadataProgress] = (0, import_react.useState)({
		total: 0,
		done: 0,
		startedAt: 0,
		running: false
	});
	const [photoLimit, setPhotoLimit] = (0, import_react.useState)(48);
	const [visionBusy, setVisionBusy] = (0, import_react.useState)(false);
	const [visionProgress, setVisionProgress] = (0, import_react.useState)("");
	const [photoVisionRows, setPhotoVisionRows] = (0, import_react.useState)([]);
	const [selectedPhotoVision, setSelectedPhotoVision] = (0, import_react.useState)({});
	const [visionModel, setVisionModel] = (0, import_react.useState)("semanticPlus");
	const [visionReviewOpen, setVisionReviewOpen] = (0, import_react.useState)(true);
	const [visionBenchmark, setVisionBenchmark] = (0, import_react.useState)(() => {
		try {
			const saved = JSON.parse(localStorage.getItem("reelcase.photo-vision-benchmark.v1") ?? "null");
			return saved?.semantic && saved.semanticPlus && saved.semanticPro ? saved : null;
		} catch {
			return null;
		}
	});
	const [visionBenchmarkPhotos, setVisionBenchmarkPhotos] = (0, import_react.useState)([]);
	const [visionBenchmarkBusy, setVisionBenchmarkBusy] = (0, import_react.useState)(false);
	const [visionBenchmarkProgress, setVisionBenchmarkProgress] = (0, import_react.useState)("");
	const [visionBenchmarkError, setVisionBenchmarkError] = (0, import_react.useState)("");
	const [upscalerHealth, setUpscalerHealth] = (0, import_react.useState)({
		state: "checking",
		detail: "Checking local model cache…"
	});
	const [upscalerUrl, setUpscalerUrl] = (0, import_react.useState)(LOCAL_UPSCALER.artifactUrl);
	const [upscalerChecksum, setUpscalerChecksum] = (0, import_react.useState)(LOCAL_UPSCALER.sha256);
	const [upscalerInstalling, setUpscalerInstalling] = (0, import_react.useState)(false);
	const [upscalePreview, setUpscalePreview] = (0, import_react.useState)("");
	const upscalePreviewRef = (0, import_react.useRef)("");
	const [upscaleBusy, setUpscaleBusy] = (0, import_react.useState)(false);
	const [upscaleStatus, setUpscaleStatus] = (0, import_react.useState)("");
	const [companionCache, setCompanionCache] = (0, import_react.useState)(null);
	const [companionDeltaNote, setCompanionDeltaNote] = (0, import_react.useState)("");
	const appliedCompanionChanges = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const companionDeltaTimer = (0, import_react.useRef)(null);
	const [photoCacheNotice, setPhotoCacheNotice] = (0, import_react.useState)("Preparing cached photo index…");
	const libraryFolders = useLibrary((s) => s.folders);
	const sourcePhotos = useSourceAssets((s) => s.photos);
	const refreshSourcePhotos = useLibrary((s) => s.refreshSourcePhotos);
	const sourceFolders = (0, import_react.useMemo)(() => libraryFolders.filter((folder) => folder.kind === "directory" || folder.kind === "files"), [libraryFolders]);
	const sourceFolderIds = (0, import_react.useMemo)(() => sourceFolders.map((folder) => folder.id).sort().join("|"), [sourceFolders]);
	const checkUpscalerHealth = async () => {
		try {
			const raw = localStorage.getItem("reelcase.photo-upscaler.model.v1");
			const cache = "caches" in window ? await caches.open("reelcase-local-models-v1") : null;
			const manifest = cache ? await cache.match("/reelcase-local-models/upscaler.manifest.json") : null;
			const model = raw ? JSON.parse(raw) : manifest ? await manifest.json() : null;
			if (model?.name && model.verifiedAt) {
				if (!(cache && model.cacheKey ? await cache.match(model.cacheKey) : null)) throw new Error("Cached model artifact is unavailable");
				setUpscalerHealth({
					state: "ready",
					detail: `${model.name}${model.version ? ` · ${model.version}` : ""} verified ${new Date(model.verifiedAt).toLocaleDateString()} · ${bytes(model.bytes ?? 0)} cached locally. Ready for local preview runs; originals remain untouched.`
				});
			} else if ((await fetch(LOCAL_UPSCALER.shippedArtifactUrl, { method: "HEAD" })).ok) setUpscalerHealth({
				state: "ready",
				detail: "Swin2SR x2 beta is bundled and SHA-256 verified. It is ready for local preview runs; originals remain untouched."
			});
			else setUpscalerHealth({
				state: "missing",
				detail: "No verified local super-resolution model is installed. Upscaling is disabled, so no photo is ever mislabeled as enhanced."
			});
		} catch {
			setUpscalerHealth({
				state: "missing",
				detail: "The local model record could not be verified. Upscaling remains disabled and originals are safe."
			});
		}
	};
	(0, import_react.useEffect)(() => {
		checkUpscalerHealth();
	}, []);
	const installUpscalerModel = async () => {
		const url = upscalerUrl.trim();
		const expected = upscalerChecksum.trim().toLowerCase().replace(/^sha256:/, "");
		if (!/^https:\/\//i.test(url) || !/^[a-f0-9]{64}$/.test(expected)) {
			setUpscalerHealth({
				state: "missing",
				detail: "Enter an HTTPS model URL and the publisher’s exact 64-character SHA-256 checksum. Realhub will not install an unverifiable model."
			});
			return;
		}
		setUpscalerInstalling(true);
		setUpscalerHealth({
			state: "checking",
			detail: "Downloading the model after your explicit request and verifying its SHA-256…"
		});
		try {
			const response = await fetch(url, { signal: AbortSignal.timeout(12e4) });
			if (!response.ok) throw new Error(`Download returned ${response.status}`);
			const blob = await response.blob();
			if (!blob.size || blob.size > 786432e3) throw new Error("Model size is outside the safe local cache budget");
			const digest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()))).map((part) => part.toString(16).padStart(2, "0")).join("");
			if (digest !== expected) throw new Error("Checksum mismatch — the model was not stored");
			const cacheKey = LOCAL_UPSCALER.cacheKey;
			const cache = await caches.open("reelcase-local-models-v1");
			await cache.put(cacheKey, new Response(blob, { headers: { "content-type": blob.type || "application/octet-stream" } }));
			const model = {
				name: new URL(url).pathname.split("/").pop() || "local-upscaler.onnx",
				version: "user-verified",
				verifiedAt: Date.now(),
				cacheKey,
				bytes: blob.size,
				sha256: digest,
				url
			};
			await cache.put("/reelcase-local-models/upscaler.manifest.json", new Response(JSON.stringify(model), { headers: { "content-type": "application/json" } }));
			try {
				localStorage.setItem("reelcase.photo-upscaler.model.v1", JSON.stringify(model));
			} catch {}
			await checkUpscalerHealth();
		} catch (error) {
			setUpscalerHealth({
				state: "missing",
				detail: `${error instanceof Error ? error.message : "Model install failed"}. No model was enabled and originals were not changed.`
			});
		} finally {
			setUpscalerInstalling(false);
		}
	};
	const removeUpscalerModel = async () => {
		try {
			const cache = await caches.open("reelcase-local-models-v1");
			await cache.delete("/reelcase-local-models/upscaler.onnx");
			await cache.delete("/reelcase-local-models/upscaler.manifest.json");
			localStorage.removeItem("reelcase.photo-upscaler.model.v1");
		} finally {
			await checkUpscalerHealth();
		}
	};
	(0, import_react.useEffect)(() => {
		let alive = true;
		const read = async (signal) => {
			try {
				const data = await (await fetch("http://127.0.0.1:43123/cache-status", { signal: AbortSignal.any([signal, AbortSignal.timeout(5e3)]) })).json();
				if (!alive || !data.worker) return;
				setCompanionCache({
					state: data.worker.state ?? "ready",
					photos: Number(data.worker.photos) || 0,
					videos: Number(data.worker.videos) || 0,
					scannedAt: Number(data.worker.scannedAt) || 0,
					truncated: Boolean(data.worker.truncated)
				});
				const fresh = (data.recentChanges ?? []).filter((change) => Number(change.at) > 0 && !appliedCompanionChanges.current.has(Number(change.at)));
				if (!appliedCompanionChanges.current.size) {
					fresh.forEach((change) => appliedCompanionChanges.current.add(Number(change.at)));
					return;
				}
				fresh.forEach((change) => appliedCompanionChanges.current.add(Number(change.at)));
				if (appliedCompanionChanges.current.size > 240) appliedCompanionChanges.current = new Set([...appliedCompanionChanges.current].slice(-120));
				const changedIds = new Set(sourceFolders.filter((folder) => fresh.some((change) => {
					const path = String(change.path ?? "").replaceAll("\\", "/").toLowerCase();
					return path === folder.name.toLowerCase() || path.startsWith(`${folder.name.toLowerCase()}/`);
				})).map((folder) => folder.id));
				if (changedIds.size && !companionDeltaTimer.current) companionDeltaTimer.current = window.setTimeout(() => {
					companionDeltaTimer.current = null;
					Promise.all([...changedIds].slice(0, 3).map((id) => refreshSourcePhotos(id))).then((counts) => {
						if (alive) setCompanionDeltaNote(`Companion applied ${changedIds.size} folder change${changedIds.size === 1 ? "" : "s"} · ${counts.reduce((sum, count) => sum + count, 0).toLocaleString()} cached photos checked.`);
					});
				}, 1500);
			} catch {
				if (alive) setCompanionCache(null);
			}
		};
		const task = registerPeriodicTask({
			name: "Photo companion status",
			everyMs: 3e4,
			firstMs: 0,
			enabled: () => !useLibrary.getState().activeId && !useLibrary.getState().previewId,
			work: read
		});
		return () => {
			alive = false;
			task.cancel();
			if (companionDeltaTimer.current) window.clearTimeout(companionDeltaTimer.current);
		};
	}, [refreshSourcePhotos, sourceFolderIds]);
	const addPhotos = (files, folderName = "Unsorted", paths, urls) => {
		if (!files) return;
		const remembered = photoMetadata();
		const next = Array.from(files).filter((file) => file.type.startsWith("image/") || PHOTO_FILE_RE.test(file.name)).slice(0, 600).map((file, index) => {
			const path = paths?.[index] || file.webkitRelativePath || `${folderName}/${file.name}`;
			const id = `${path}-${file.lastModified}`;
			if (knownPhotoIds.current.has(id)) return null;
			const url = urls?.[index] ?? URL.createObjectURL(file);
			if (!urls?.[index]) photoUrls.current.add(url);
			return {
				id,
				bridgeAuditEligible: !paths,
				name: file.name,
				path,
				url,
				people: remembered[id]?.people ?? [],
				tags: remembered[id]?.tags ?? [],
				album: remembered[id]?.album ?? paths?.[index]?.split("/")[0] ?? folderName,
				favorite: remembered[id]?.favorite ?? false,
				hidden: remembered[id]?.hidden ?? false,
				rating: remembered[id]?.rating ?? 0,
				addedAt: file.lastModified,
				width: remembered[id]?.width,
				height: remembered[id]?.height,
				vision: remembered[id]?.vision ?? [],
				visionModel: remembered[id]?.visionModel,
				file
			};
		}).filter((photo) => photo !== null);
		if (!next.length) return;
		for (const photo of next) knownPhotoIds.current.add(photo.id);
		setPhotos((current) => current.length ? [...current, ...next] : next);
	};
	(0, import_react.useEffect)(() => {
		if (sourcePhotos.length) {
			const remembered = photoMetadata();
			const metadataKey = (asset) => `${asset.path}-${asset.file.lastModified}`;
			const hot = sourcePhotos.filter((asset) => (remembered[metadataKey(asset)]?.rating ?? 0) > 0 || remembered[metadataKey(asset)]?.favorite);
			const remaining = sourcePhotos.filter((asset) => !((remembered[metadataKey(asset)]?.rating ?? 0) > 0 || remembered[metadataKey(asset)]?.favorite));
			const prioritized = [...hot, ...remaining].slice(0, 600);
			addPhotos(prioritized.map((asset) => asset.file), "Source import", prioritized.map((asset) => asset.path), prioritized.map((asset) => asset.url));
			setPhotoCacheNotice(`Cached index ready · ${sourcePhotos.length.toLocaleString()} source photos available`);
		}
	}, [sourcePhotos]);
	(0, import_react.useEffect)(() => {
		upscalePreviewRef.current = upscalePreview;
	}, [upscalePreview]);
	(0, import_react.useEffect)(() => () => {
		for (const url of photoUrls.current) URL.revokeObjectURL(url);
		photoUrls.current.clear();
		if (upscalePreviewRef.current) {
			try {
				URL.revokeObjectURL(upscalePreviewRef.current);
			} catch {}
			upscalePreviewRef.current = "";
		}
	}, []);
	const flushPhotoMetadata = () => {
		if (metadataWriteTimer.current) clearTimeout(metadataWriteTimer.current);
		try {
			persistPhotoMetadata({
				...photoMetadata(),
				...Object.fromEntries(photos.map(({ id, path, people, tags, album, favorite, hidden, rating, width, height, vision, visionModel }) => [id, {
					path,
					people,
					tags,
					album,
					favorite,
					hidden,
					rating,
					width,
					height,
					vision,
					visionModel
				}]))
			}, useLibrary.getState().folders.filter((folder) => folder.kind === "directory" || folder.kind === "files").map((folder) => ({
				id: folder.id,
				name: folder.name,
				kind: folder.kind,
				...folder.photoCount != null ? { photoCount: folder.photoCount } : {},
				...folder.lastCheckedAt != null ? { lastCheckedAt: folder.lastCheckedAt } : {}
			})));
		} catch {}
		metadataWriteTimer.current = null;
	};
	(0, import_react.useEffect)(() => {
		if (metadataWriteTimer.current) clearTimeout(metadataWriteTimer.current);
		metadataWriteTimer.current = setTimeout(flushPhotoMetadata, 650);
		return () => {
			if (metadataWriteTimer.current) clearTimeout(metadataWriteTimer.current);
		};
	}, [photos]);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const controller = new AbortController();
		const waiting = photos.filter((photo) => photo.file && (!photo.width || !photo.height));
		if (!waiting.length) return;
		setPhotoMetadataProgress({
			total: waiting.length,
			done: 0,
			startedAt: performance.now(),
			running: true
		});
		(async () => {
			for (let start = 0; start < waiting.length && !cancelled; start += 8) {
				const chunk = waiting.slice(start, start + 8);
				const dimensions = await Promise.all(chunk.map(async (photo) => {
					try {
						const bitmap = await decodeArtworkBitmap(photo.file, controller.signal);
						const result = {
							id: photo.id,
							width: bitmap.width,
							height: bitmap.height
						};
						bitmap.close();
						return result;
					} catch {
						return {
							id: photo.id,
							width: 0,
							height: 0
						};
					}
				}));
				if (cancelled) return;
				const byId = new Map(dimensions.filter((item) => item.width > 0 && item.height > 0).map((item) => [item.id, item]));
				setPhotos((items) => items.map((photo) => {
					const next = byId.get(photo.id);
					return next ? {
						...photo,
						width: next.width,
						height: next.height
					} : photo;
				}));
				setPhotoMetadataProgress((current) => ({
					...current,
					done: Math.min(current.total, start + chunk.length)
				}));
				await new Promise((resolve) => window.setTimeout(resolve, 0));
			}
			if (!cancelled) setPhotoMetadataProgress((current) => ({
				...current,
				running: false
			}));
		})();
		return () => {
			cancelled = true;
			controller.abort();
		};
	}, [photos.length]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.photos.sort", photoSort);
		} catch {}
	}, [photoSort]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.photos.favorites-only", String(favoritesOnly));
		} catch {}
	}, [favoritesOnly]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.photos.rating-queue", ratingQueuePhotoId);
		} catch {}
	}, [ratingQueuePhotoId]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.photos.show-locations", String(showLocations));
		} catch {}
	}, [showLocations]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("reelcase.photos.slide-seconds", String(slideSeconds));
		} catch {}
	}, [slideSeconds]);
	(0, import_react.useEffect)(() => {
		const onFullscreen = () => setFullScreenSlide(Boolean(document.fullscreenElement));
		document.addEventListener("fullscreenchange", onFullscreen);
		return () => document.removeEventListener("fullscreenchange", onFullscreen);
	}, []);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		(async () => {
			await new Promise((resolve) => {
				const idle = window.requestIdleCallback;
				if (idle) idle(() => resolve(), { timeout: 450 });
				else window.setTimeout(resolve, 120);
			});
			if (cancelled) return;
			const toScan = sourceFolders.filter((folder) => !scannedPhotoSources.current.has(folder.id) && Date.now() - (photoSourceWarmth.get(folder.id) ?? 0) >= PHOTO_BACKGROUND_REFRESH_MS);
			if (toScan.length) {
				setPhotoSourceLoading(true);
				setPhotoScanTotal(toScan.length);
				setPhotoScanDone(0);
				setPhotoScanStartedAt(Date.now());
				setPhotoScanEstimatedPhotos(toScan.reduce((sum, folder) => sum + (folder.photoCount ?? 0), 0));
				setPhotoScanFoundPhotos(0);
				setPhotoScanAverageMs(0);
			}
			let cursor = 0;
			const adaptiveWorkers = Math.min(12, Math.max(2, Math.floor((navigator.hardwareConcurrency || 4) / 2)));
			const configuredWorkers = Number(localStorage.getItem("reelcase.photo-scan-workers") ?? "0");
			const workerCount = Math.min(toScan.length, getPerformanceProfile().photoWorkers, [
				2,
				4,
				6,
				8,
				12
			].includes(configuredWorkers) ? configuredWorkers : adaptiveWorkers);
			const workers = Array.from({ length: workerCount }, async () => {
				while (!cancelled) {
					const folder = toScan[cursor++];
					if (!folder) return;
					scannedPhotoSources.current.add(folder.id);
					const started = performance.now();
					const found = await refreshSourcePhotos(folder.id);
					const elapsed = performance.now() - started;
					photoSourceWarmth.set(folder.id, Date.now());
					if (!cancelled) {
						setPhotoScanDone((done) => done + 1);
						setPhotoScanFoundPhotos((total) => total + found);
						setPhotoScanAverageMs((mean) => mean ? mean * .65 + elapsed * .35 : elapsed);
					}
				}
			});
			await Promise.all(workers);
			if (!cancelled) setPhotoSourceLoading(false);
		})();
		return () => {
			cancelled = true;
		};
	}, [refreshSourcePhotos, sourceFolderIds]);
	const photoScanEta = photoSourceLoading && photoScanDone >= 2 && photoScanTotal > photoScanDone && photoScanAverageMs > 0 ? Math.max(1, Math.ceil(photoScanAverageMs * (photoScanTotal - photoScanDone) / 1e3)) : 0;
	const photoMetadataEta = photoMetadataProgress.running && photoMetadataProgress.done > 0 && photoMetadataProgress.done < photoMetadataProgress.total ? Math.max(1, Math.ceil((performance.now() - photoMetadataProgress.startedAt) / photoMetadataProgress.done * (photoMetadataProgress.total - photoMetadataProgress.done) / 1e3)) : 0;
	const addPhotoFolder = (files) => {
		if (!files?.length) return;
		const first = [...files].find((file) => file.webkitRelativePath)?.webkitRelativePath.split("/")[0] ?? "Photo folder";
		setPhotoFolders((folders) => folders.includes(first) ? folders : [...folders, first]);
		addPhotos(files, first);
	};
	(0, import_react.useEffect)(() => setPhotoAuditAck(false), [photos, selectedPhotoIds]);
	const auditPhotoSelection = photos.filter((photo) => selectedPhotoIds.has(photo.id) && !photo.hidden && photo.bridgeAuditEligible);
	const reviewPhotoTopics = () => {
		if (!photoAuditAck || auditPhotoSelection.length !== selectedPhotoIds.size || auditPhotoSelection.length > 48) return;
		flushPhotoMetadata();
		setReviewedPhotos(auditPhotoSelection.map((photo, index) => ({
			id: "reviewed-photo:" + index,
			name: photo.name,
			tags: photo.tags,
			reviewed: true,
			direct: true,
			hidden: false
		})));
		useLibrary.getState().setQuery("");
		useLibrary.getState().setSource("assistant");
	};
	const people = (0, import_react.useMemo)(() => [...new Set(photos.flatMap((photo) => photo.people))], [photos]);
	const albums = (0, import_react.useMemo)(() => [...new Set(photos.map((photo) => photo.album))], [photos]);
	const photoTags = (0, import_react.useMemo)(() => [...new Set(photos.flatMap((photo) => photo.tags))].sort(), [photos]);
	const visionProcessed = (0, import_react.useMemo)(() => photos.filter((photo) => photo.vision?.length || photo.tags.some((tag) => tag.startsWith("vision-"))).length, [photos]);
	const visionPending = Math.max(0, photos.length - visionProcessed);
	const visionReviewedPhotos = (0, import_react.useMemo)(() => photos.filter((photo) => photo.vision?.length || photo.tags.some((tag) => tag.startsWith("vision-"))).sort((a, b) => b.addedAt - a.addedAt), [photos]);
	const visible = (0, import_react.useMemo)(() => photos.filter((photo) => (showHiddenPhotos || !photo.hidden) && (selectedPerson === "All photos" || photo.people.includes(selectedPerson)) && (selectedAlbum === "All albums" || photo.album === selectedAlbum) && (selectedTag === "All tags" || photo.tags.includes(selectedTag)) && (!favoritesOnly || photo.favorite) && (ratingFilter === "all" || (ratingFilter === "unrated" ? !photo.rating : photo.rating >= Number(ratingFilter))) && (discoveryFilter === "all" || (discoveryFilter === "screenshots" ? /screenshot|screen[_ -]?shot/i.test(photo.name) : discoveryFilter === "camera" ? /^(img|dsc|pxl|photo)[_ -]?\d/i.test(photo.name) : /download|image|copy|edited/i.test(photo.name))) && `${photo.name} ${photo.path} ${photo.people.join(" ")} ${photo.tags.join(" ")} ${photo.album}`.toLowerCase().includes(photoSearch.toLowerCase())).sort((a, b) => {
		if (photoSort === "name") return a.name.localeCompare(b.name);
		if (photoSort === "rating") return ratingPreference(b.rating) - ratingPreference(a.rating) || b.addedAt - a.addedAt;
		if (photoSort === "favorite") return Number(b.favorite) - Number(a.favorite) || b.addedAt - a.addedAt;
		if (photoSort === "auto-tags") return b.tags.length - a.tags.length || b.addedAt - a.addedAt;
		return b.addedAt - a.addedAt;
	}), [
		discoveryFilter,
		favoritesOnly,
		photoSearch,
		photoSort,
		photos,
		ratingFilter,
		selectedAlbum,
		selectedPerson,
		selectedTag,
		showHiddenPhotos
	]);
	const renderedPhotos = visible.slice(0, photoLimit);
	(0, import_react.useEffect)(() => setPhotoLimit(80), [
		photoSearch,
		selectedPerson,
		selectedAlbum,
		selectedTag,
		favoritesOnly,
		photoSort,
		discoveryFilter,
		ratingFilter
	]);
	(0, import_react.useEffect)(() => {
		if (!slideshow || !visible.length) return;
		return registerPeriodicTask({
			name: "Photo slideshow",
			mode: "visible",
			background: false,
			everyMs: slideSeconds * 1e3,
			work: () => setSlideIndex((index) => (index + 1) % visible.length)
		}).cancel;
	}, [
		slideshow,
		slideSeconds,
		visible.length
	]);
	const featuredPhoto = visible[slideIndex % Math.max(visible.length, 1)];
	const focusedIndex = visible.findIndex((photo) => photo.id === focusedPhotoId);
	const focusedPhoto = focusedIndex >= 0 ? visible[focusedIndex] : photos.find((photo) => photo.id === focusedPhotoId);
	const moveFocus = (direction) => {
		if (!visible.length) return;
		const nextIndex = focusedIndex < 0 ? 0 : (focusedIndex + direction + visible.length) % visible.length;
		setFocusedPhotoId(visible[nextIndex].id);
	};
	const pickFreshDiscovery = () => {
		const unseen = visible.filter((photo) => !discoverySeen.current.has(photo.id));
		const pool = unseen.length ? unseen : visible;
		if (!unseen.length) discoverySeen.current.clear();
		const pick = pool[Math.floor(Math.random() * pool.length)];
		if (!pick) return;
		discoverySeen.current.add(pick.id);
		setSlideIndex(visible.findIndex((photo) => photo.id === pick.id));
		setPhotoViewerLoading(true);
		setFocusedPhotoId(pick.id);
	};
	const suggestPeopleFromNames = () => {
		let labeled = 0;
		setPhotos((items) => items.map((photo) => {
			if (photo.people.length) return photo;
			const candidate = photo.name.replace(/\.[^.]+$/, "").split(/[._\-\d]+/).map((word) => word.trim()).filter((word) => /^[A-Za-z]{3,20}$/.test(word)).find((word) => !/^(img|image|photo|picture|screenshot|copy|edited|final)$/i.test(word));
			if (!candidate) return photo;
			labeled += 1;
			return {
				...photo,
				people: [candidate[0].toUpperCase() + candidate.slice(1).toLowerCase()]
			};
		}));
		setHelperNote(labeled ? `Added ${labeled} suggested label${labeled === 1 ? "" : "s"} from file names. Review each label before relying on it.` : "No clear names were found in unlabeled file names.");
	};
	const autoTagPhotos = () => {
		let changed = 0;
		setPhotos((items) => items.map((photo) => {
			const text = `${photo.name} ${photo.path}`.toLowerCase();
			const extension = photo.name.split(".").pop()?.toLowerCase();
			const album = photo.album.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
			const suggestions = [
				/screenshot|screen[_ -]?shot/.test(text) ? "screenshot" : "",
				/^(img|dsc|pxl|photo)[_ -]?\d/i.test(photo.name) ? "camera" : "",
				/download|image|copy|edited/.test(text) ? "downloaded" : "",
				/vacation|travel|trip|beach|mountain/.test(text) ? "travel" : "",
				/birthday|wedding|party|event/.test(text) ? "event" : "",
				/pet|dog|cat/.test(text) ? "pets" : "",
				/receipt|invoice|document|scan/.test(text) ? "document" : "",
				/food|meal|restaurant|recipe/.test(text) ? "food" : "",
				/selfie|portrait|face/.test(text) ? "portrait" : "",
				extension ? `type-${extension}` : "",
				album && album !== "unsorted" && album !== "source-import" ? `album-${album}` : "",
				photo.favorite ? "favorite" : "",
				photo.rating >= 4 ? "highly-rated" : "",
				`year-${new Date(photo.addedAt).getFullYear()}`,
				`month-${new Date(photo.addedAt).toLocaleString("en-US", { month: "long" }).toLowerCase()}`
			].filter(Boolean);
			const tags = [.../* @__PURE__ */ new Set([...photo.tags, ...suggestions])];
			if (tags.length === photo.tags.length) return photo;
			changed += 1;
			return {
				...photo,
				tags
			};
		}));
		setHelperNote(changed ? `Added local filename-based auto tags to ${changed} photo${changed === 1 ? "" : "s"}. You can edit any tag on its card.` : "Everything already has the available local auto tags.");
	};
	const preparePhotoVision = async (candidates) => {
		const batchCandidates = candidates.slice(0, 48);
		if (!batchCandidates.length) {
			setHelperNote("Every loaded photo already has accepted local vision labels. Add more photos or edit tags to review them again.");
			return;
		}
		setVisionBusy(true);
		setVisionReviewOpen(true);
		setPhotoVisionRows([]);
		setSelectedPhotoVision({});
		setVisionProgress(`Preparing ${VISION_MODELS[visionModel].name} for ${batchCandidates.length.toLocaleString()} photos…`);
		const rows = [];
		try {
			for (let start = 0; start < batchCandidates.length; start += 12) {
				const batch = batchCandidates.slice(start, start + 12);
				const labels = await classifyImagesLocally(batch.map((photo) => photo.url), (done, total) => setVisionProgress(`${VISION_MODELS[visionModel].name} · ${start + done}/${batchCandidates.length} photos`), visionModel, (status) => {
					const transfer = status.total ? ` · ${Math.round((status.loaded ?? 0) / status.total * 100)}%` : "";
					setVisionProgress(`${VISION_MODELS[visionModel].name} · ${status.status ?? status.file ?? "loading"}${transfer} · ${start}/${batchCandidates.length} complete`);
				});
				rows.push(...batch.map((photo, index) => ({
					photoId: photo.id,
					name: photo.name,
					labels: labels[index] ?? [],
					model: visionModel
				})));
				await new Promise((resolve) => window.setTimeout(resolve, 0));
			}
			setPhotoVisionRows(rows);
			setSelectedPhotoVision(Object.fromEntries(rows.flatMap((row) => row.labels.map((label) => [`${row.photoId}:vision-${label.label}`, true]))));
			const suggested = rows.filter((row) => row.labels.length > 0).length;
			setHelperNote(`${VISION_MODELS[visionModel].name} prepared ${suggested} local photo result${suggested === 1 ? "" : "s"} for review. Nothing is saved until you apply selected labels.`);
		} catch (error) {
			if (rows.length) {
				setPhotoVisionRows(rows);
				setSelectedPhotoVision(Object.fromEntries(rows.flatMap((row) => row.labels.map((label) => [`${row.photoId}:vision-${label.label}`, true]))));
				setHelperNote(`${VISION_MODELS[visionModel].name} stopped after preparing ${rows.length} photo${rows.length === 1 ? "" : "s"}: ${error instanceof Error ? error.message : "unknown error"}. Review the completed labels; the remaining photos were not changed.`);
			} else setHelperNote(`${VISION_MODELS[visionModel].name} could not prepare local labels: ${error instanceof Error ? error.message : "unknown error"}. No photo tags changed.`);
		} finally {
			setVisionBusy(false);
			setVisionProgress("");
		}
	};
	const prepareNextPhotoVision = () => void preparePhotoVision(photos.filter((photo) => !photo.vision?.length && !photo.tags.some((tag) => tag.startsWith("vision-"))).slice(0, 48));
	const applyPhotoVision = () => {
		const selectedByPhoto = new Map(photoVisionRows.map((row) => [row.photoId, {
			labels: row.labels.filter((label) => selectedPhotoVision[`${row.photoId}:vision-${label.label}`]),
			model: row.model
		}]));
		let changedPhotos = 0;
		let addedTags = 0;
		const nextPhotos = photos.map((photo) => {
			const selected = selectedByPhoto.get(photo.id);
			if (!selected?.labels.length) return photo;
			const newTags = [
				"auto-tagged",
				`auto-tag-${selected.model}-v2`,
				...selected.labels.map((label) => `vision-${label.label}`)
			].filter((tag) => !photo.tags.includes(tag));
			if (!newTags.length) return photo;
			changedPhotos += 1;
			addedTags += newTags.length;
			return {
				...photo,
				tags: [...photo.tags, ...newTags],
				vision: selected.labels,
				visionModel: selected.model
			};
		});
		setPhotos(nextPhotos);
		setPhotoVisionRows([]);
		setSelectedPhotoVision({});
		setHelperNote(changedPhotos ? `Saved ${addedTags} reviewed vision tag${addedTags === 1 ? "" : "s"} on ${changedPhotos} photo${changedPhotos === 1 ? "" : "s"}. Unselected labels were discarded.` : "No new labels were saved. They may already exist, or every suggested label was unchecked.");
	};
	const discardPhotoVision = () => {
		setPhotoVisionRows([]);
		setSelectedPhotoVision({});
		setHelperNote("Prepared vision labels were discarded. No photo tags changed.");
	};
	const runVisionBenchmark = async () => {
		const sample = photos.filter((photo) => Boolean(photo.url)).slice(0, 24);
		if (!sample.length) {
			setHelperNote("Add photos first. The benchmark only uses photos already loaded in this browser.");
			return;
		}
		setVisionBenchmarkBusy(true);
		setVisionBenchmarkError("");
		setVisionBenchmarkProgress(`Preparing a ${sample.length}-photo local comparison…`);
		try {
			const benchmark = await benchmarkVisionModelsLocally(sample.map((photo) => photo.url), (model, done, total) => setVisionBenchmarkProgress(`${VISION_MODELS[model].name} · ${done}/${total}`), (model, status) => {
				const transfer = status.total ? ` · ${Math.round((status.loaded ?? 0) / status.total * 100)}%` : "";
				setVisionBenchmarkProgress(`${VISION_MODELS[model].name} · ${status.status ?? status.file ?? "loading"}${transfer}`);
			});
			setVisionBenchmark(benchmark);
			setVisionBenchmarkPhotos(sample.map((photo, index) => ({
				id: photo.id,
				name: photo.name,
				url: photo.url,
				clip: benchmark.semantic.labels[index] ?? [],
				siglipBase: benchmark.semanticPlus.labels[index] ?? [],
				siglipLarge: benchmark.semanticPro.labels[index] ?? []
			})));
			try {
				localStorage.setItem("reelcase.photo-vision-benchmark.v1", JSON.stringify(benchmark));
			} catch {}
			setHelperNote(`Vision comparison completed on ${sample.length} local photos. SigLIP large+ is ready for the highest-detail browser review tags.`);
		} catch (error) {
			const message = `${error instanceof Error ? error.message : "The semantic model could not start"}. No tags or defaults were changed.`;
			setVisionBenchmarkError(message);
			setHelperNote(message);
		} finally {
			setVisionBenchmarkBusy(false);
			setVisionBenchmarkProgress("");
		}
	};
	const downloadPhoto = (photo) => {
		const link = document.createElement("a");
		link.href = photo.url;
		link.download = photo.name;
		link.click();
	};
	const applyTagToSelected = (tag) => {
		const clean = tag.trim().toLowerCase();
		if (!clean || !selectedPhotoIds.size) return;
		setPhotos((items) => items.map((photo) => selectedPhotoIds.has(photo.id) ? {
			...photo,
			tags: [.../* @__PURE__ */ new Set([...photo.tags, clean])]
		} : photo));
		setHelperNote(`Added “${clean}” to ${selectedPhotoIds.size} selected photo${selectedPhotoIds.size === 1 ? "" : "s"}.`);
	};
	const startFullScreenSlideshow = async () => {
		const first = visible[slideIndex % Math.max(visible.length, 1)];
		if (!first) return;
		setFocusedPhotoId(first.id);
		setSlideshow(true);
		try {
			await document.documentElement.requestFullscreen?.();
		} catch {
			setHelperNote("Full-screen mode was blocked by this browser. The full-window viewer is still open.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Photo viewer",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Images, { className: "size-4" }),
		title: "Your photos. Your favorites.",
		copy: "Add photos from this device, then group them by people yourself. Nothing uploads from this browser. Google Photos remains a separate, opt-in destination.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap items-center gap-2 rounded-lg border border-border p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-4 text-accent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mr-2 text-sm font-medium",
						children: "Rating quest"
					}),
					[
						["all", "All ratings"],
						["unrated", "Needs a rating"],
						["3", "3+ stars"],
						["4", "4+ stars"],
						["5", "5 stars"]
					].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: ratingFilter === value ? "default" : "secondary",
						onClick: () => setRatingFilter(value),
						children: label
					}, value)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						disabled: !photos.some((photo) => !photo.rating),
						onClick: () => {
							const choices = photos.filter((photo) => !photo.rating);
							const pick = choices[(choices.findIndex((photo) => photo.id === ratingQueuePhotoId) + 1 + choices.length) % choices.length];
							if (pick) {
								setRatingQueuePhotoId(pick.id);
								setFocusedPhotoId(pick.id);
							}
						},
						children: ratingQueuePhotoId ? "Continue rating queue" : "Rate a surprise photo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted",
						children: [
							photos.filter((photo) => photo.rating > 0).length,
							" of ",
							photos.length,
							" rated"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-3 text-xs text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [photos.filter((photo) => photo.hidden).length, " hidden photos"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => setShowHiddenPhotos((value) => !value),
						children: showHiddenPhotos ? "Hide hidden photos" : "Manage hidden photos"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Hidden photos stay saved in their albums and can be restored here." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-col gap-3 rounded-lg bg-elevated p-5 shadow-border sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-fg",
					children: "Your local photo selection"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted",
					children: "Photo folders become albums here; people labels are local notes, ready to map to XMP/IPTC subject metadata later."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "sr-only",
							type: "file",
							accept: "image/*",
							multiple: true,
							onChange: (event) => addPhotos(event.target.files)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg",
							children: "Add photos"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "sr-only",
							type: "file",
							multiple: true,
							webkitdirectory: "",
							directory: "",
							onChange: (event) => addPhotoFolder(event.target.files)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border",
							children: "Add photo folder"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "https://photos.google.com/",
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border",
							children: "Open Google Photos"
						}),
						photoSearch.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: `https://photos.google.com/search/${encodeURIComponent(photoSearch.trim())}`,
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border",
							children: "Search Google Photos"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "https://www.google.com/android/find/",
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border",
							children: "Find my phone"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-col gap-3 rounded-lg bg-elevated p-4 shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: selectedPerson === "All photos" ? "default" : "secondary",
								onClick: () => setSelectedPerson("All photos"),
								children: "All photos"
							}),
							people.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: selectedPerson === name ? "default" : "secondary",
								onClick: () => setSelectedPerson(name),
								children: name
							}, name)),
							albums.map((album) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-sm bg-bg/45 px-2 py-1 text-xs text-muted",
								children: album
							}, album))
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2 border-t border-border pt-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "self-center text-xs text-muted",
								children: "Albums"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: selectedAlbum === "All albums" ? "default" : "secondary",
								onClick: () => {
									setSelectedAlbum("All albums");
									localStorage.removeItem("reelcase.photos.source-filter");
								},
								children: "All albums"
							}),
							albums.map((album) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: selectedAlbum === album ? "default" : "secondary",
								onClick: () => {
									setSelectedAlbum(album);
									localStorage.setItem("reelcase.photos.source-filter", album);
								},
								children: album
							}, album))
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "self-center text-xs text-muted",
								children: "Tags"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: selectedTag === "All tags" ? "default" : "secondary",
								onClick: () => setSelectedTag("All tags"),
								children: "All tags"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: selectedTag === "auto-tagged" ? "default" : "secondary",
								disabled: !visionProcessed,
								onClick: () => setSelectedTag("auto-tagged"),
								children: ["Auto-tagged · ", visionProcessed]
							}),
							photoTags.filter((tag) => tag !== "auto-tagged").slice(0, 16).map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: selectedTag === tag ? "default" : "secondary",
								onClick: () => setSelectedTag(tag),
								children: ["#", tag]
							}, tag))
						]
					}),
					selectedPhotoIds.size > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2 rounded-sm bg-bg/45 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm font-medium text-fg",
								children: [selectedPhotoIds.size, " selected"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => applyTagToSelected("favorite-set"),
								children: "Tag set"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => {
									photos.filter((photo) => selectedPhotoIds.has(photo.id)).forEach(downloadPhoto);
								},
								children: "Download selected"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => setSelectedPhotoIds(/* @__PURE__ */ new Set()),
								children: "Clear selection"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "w-full border-t border-border pt-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex min-h-11 items-center gap-3 text-xs text-fg",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: photoAuditAck,
											onChange: (event) => setPhotoAuditAck(event.target.checked),
											"aria-label": "Confirm selected photos are suitable for public topic connections"
										}), "I reviewed these visible photos as suitable for public topic connections."]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs leading-5 text-muted",
										children: "Only photos chosen directly here qualify; imported source photos and hidden photos stay excluded. Review up to 48 saved tag sets. Image bytes, paths and people labels stay out of the audit. This review clears on reload or when you return to Photos."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "mt-2 min-h-11",
										variant: "secondary",
										disabled: !photoAuditAck || !auditPhotoSelection.length || auditPhotoSelection.length !== selectedPhotoIds.size || auditPhotoSelection.length > 48,
										onClick: reviewPhotoTopics,
										children: "Audit selected photo topics"
									})
								]
							})
						]
					}),
					photoFolders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: ["Sources · ", photoFolders.join(" · ")]
					}),
					sourceFolders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: ["Video sources available for photo folders · ", sourceFolders.map((folder) => folder.name).slice(0, 8).join(" · ")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 sm:flex-row",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: photoSearch,
								onChange: (event) => setPhotoSearch(event.target.value),
								placeholder: "Search names, people, albums, or file locations",
								"aria-label": "Search photos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: favoritesOnly ? "default" : "secondary",
								onClick: () => setFavoritesOnly((value) => !value),
								children: "Favorites"
							}),
							[
								"newest",
								"name",
								"rating",
								"favorite",
								"auto-tags"
							].map((sort) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: photoSort === sort ? "default" : "secondary",
								onClick: () => setPhotoSort(sort),
								children: sort === "newest" ? "Newest" : sort === "name" ? "A–Z" : sort === "rating" ? "Top rated" : sort === "favorite" ? "Favorites first" : "Auto tags"
							}, sort)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: showLocations ? "default" : "secondary",
								onClick: () => setShowLocations((value) => !value),
								children: showLocations ? "Hide locations" : "Show locations"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: slideshow ? "default" : "secondary",
								onClick: () => setSlideshow((value) => !value),
								children: slideshow ? "Stop auto-change" : "Auto-change photos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: fullScreenSlide ? "default" : "secondary",
								disabled: !visible.length,
								onClick: () => void startFullScreenSlideshow(),
								children: fullScreenSlide ? "Full screen active" : "Full-screen slideshow"
							}),
							slideshow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: slideSeconds,
								onChange: (event) => setSlideSeconds(Number(event.target.value)),
								"aria-label": "Photo slideshow interval",
								className: "h-9 rounded-sm bg-elevated px-2 text-xs text-fg shadow-border",
								children: [
									3,
									5,
									10,
									20,
									30
								].map((seconds) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: seconds,
									children: [
										"Every ",
										seconds,
										"s"
									]
								}, seconds))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: !visible.length,
								onClick: pickFreshDiscovery,
								children: "Fresh discovery"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: !photos.length,
								onClick: suggestPeopleFromNames,
								children: "Suggest people labels"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: !photos.length,
								onClick: autoTagPhotos,
								children: "Auto tag photos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								disabled: !photos.length || visionBusy,
								onClick: prepareNextPhotoVision,
								children: visionBusy ? visionProgress || "Starting local vision…" : "Prepare local vision labels · 48"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "self-center text-xs text-muted",
							children: "Local discovery"
						}), [
							"all",
							"screenshots",
							"camera",
							"downloads"
						].map((filter) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: discoveryFilter === filter ? "default" : "secondary",
							onClick: () => setDiscoveryFilter(filter),
							children: filter === "all" ? "All" : filter === "camera" ? "Camera names" : filter[0].toUpperCase() + filter.slice(1)
						}, filter))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-md border border-border bg-bg/45 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
									children: "Local vision"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-fg",
									children: [
										visionProcessed.toLocaleString(),
										" accepted · ",
										visionPending.toLocaleString(),
										" waiting · SigLIP semantic+ is the balanced fast default"
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									disabled: visionBusy || !visionPending,
									onClick: prepareNextPhotoVision,
									children: visionBusy ? visionProgress || "Starting model…" : `Prepare next ${Math.min(48, visionPending)}`
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted",
									children: "Tagging model"
								}), [
									"semanticPro",
									"semanticPlus",
									"semantic"
								].map((model) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: visionModel === model ? "default" : "ghost",
									disabled: visionBusy,
									onClick: () => setVisionModel(model),
									children: VISION_MODELS[model].name
								}, model))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs leading-5 text-muted",
								children: [VISION_MODELS[visionModel].purpose, ". Labels stay on this device until you explicitly apply checked suggestions. Each review is bounded to 48 photos so you can inspect it without a bulk automatic save; CLIP and SigLIP large+ remain available for benchmarked comparison."]
							}),
							photoVisionRows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mt-3 rounded-sm border border-border bg-elevated p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs font-medium text-fg",
										children: ["Review vision labels before saving · ", photoVisionRows.length]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: "Only checked labels are added. Unchecked labels are discarded when you apply or replace this review."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "ghost",
											onClick: discardPhotoVision,
											children: "Discard review"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											disabled: !photoVisionRows.some((row) => row.labels.some((label) => selectedPhotoVision[`${row.photoId}:vision-${label.label}`])),
											onClick: applyPhotoVision,
											children: "Apply selected labels"
										})]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 grid gap-2",
									children: photoVisionRows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-sm border border-border bg-bg/55 p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-xs font-medium text-fg",
											children: row.name
										}), row.labels.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2 flex flex-wrap gap-2",
											children: row.labels.map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "flex items-center gap-2 rounded-xs bg-elevated px-2 py-1 text-xs text-fg",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													className: "size-3.5 accent-accent",
													type: "checkbox",
													checked: Boolean(selectedPhotoVision[`${row.photoId}:vision-${label.label}`]),
													onChange: (event) => setSelectedPhotoVision((current) => ({
														...current,
														[`${row.photoId}:vision-${label.label}`]: event.target.checked
													}))
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
													"#",
													`vision-${label.label}`,
													" · ",
													Math.round(label.score * 100),
													"%"
												] })]
											}, `${row.photoId}:${label.label}`))
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-xs text-muted",
											children: "No confident local label suggested. Nothing will be saved for this photo."
										})]
									}, row.photoId))
								})]
							}),
							visionReviewedPhotos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "mt-3 rounded-sm border border-border bg-elevated p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs font-medium text-fg",
											children: ["Accepted photo vision results · ", visionReviewedPhotos.length]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs text-muted",
											children: "These are labels you explicitly saved. Filter the gallery with #auto-tagged or its model-version tag."
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "ghost",
											onClick: () => setVisionReviewOpen((open) => !open),
											children: visionReviewOpen ? "Hide accepted results" : `Review ${visionReviewedPhotos.length}`
										})]
									}),
									visionReviewOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
										children: visionReviewedPhotos.slice(0, 24).map((photo) => {
											const labels = photo.vision?.length ? photo.vision : photo.tags.filter((tag) => tag.startsWith("vision-")).map((tag) => ({
												label: tag.slice(7),
												score: 0
											}));
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "overflow-hidden rounded-xs bg-bg/55 text-left",
												onClick: () => {
													setPhotoViewerLoading(true);
													setFocusedPhotoId(photo.id);
												},
												"aria-label": `Review tags for ${photo.name}`,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: photo.url,
													alt: "",
													loading: "lazy",
													decoding: "async",
													className: "aspect-square w-full object-cover"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "block p-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "block truncate text-xs font-medium text-fg",
														children: photo.name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "mt-1 flex flex-wrap gap-1",
														children: labels.length ? labels.slice(0, 3).map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "rounded-xs bg-elevated px-1.5 py-0.5 text-[11px] text-accent",
															children: [label.label, label.score ? ` · ${Math.round(label.score * 100)}%` : ""]
														}, label.label)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[11px] text-muted",
															children: "No confident label — review image"
														})
													})]
												})]
											}, photo.id);
										})
									}),
									visionReviewOpen && visionReviewedPhotos.length > 24 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 text-xs text-muted",
										children: [
											"Showing 24 of ",
											visionReviewedPhotos.length.toLocaleString(),
											" accepted photos. Use photo tags or search to narrow the gallery."
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 rounded-sm border border-border bg-elevated p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-start justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium text-fg",
											children: "Vision model benchmark"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 max-w-2xl text-xs leading-5 text-muted",
											children: "Compare CLIP, SigLIP semantic+, and SigLIP large+ on the same 24 local photos. The first run downloads optional local models; later runs reuse the browser cache."
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											disabled: visionBenchmarkBusy || !photos.length,
											onClick: () => void runVisionBenchmark(),
											children: visionBenchmarkBusy ? "Comparing…" : "Run 3-model comparison"
										})]
									}),
									visionBenchmarkBusy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 flex items-center gap-2 text-xs text-accent",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3 animate-spin" }), visionBenchmarkProgress || "Preparing local models…"]
									}),
									visionBenchmarkError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 rounded-xs bg-bg/50 px-3 py-2 text-xs text-muted",
										children: ["Benchmark stopped · ", visionBenchmarkError]
									}),
									visionBenchmark && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 grid gap-2 sm:grid-cols-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "rounded-xs bg-bg/50 p-3 text-xs",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-medium text-fg",
													children: VISION_MODELS.semantic.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 text-muted",
													children: [
														visionBenchmark.semantic.elapsedMs.toFixed(0),
														" ms · ",
														visionBenchmark.semantic.labels.flat().length,
														" labels · ",
														visionBenchmark.sampleSize,
														" photos"
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "rounded-xs bg-bg/50 p-3 text-xs",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-medium text-fg",
													children: VISION_MODELS.semanticPlus.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 text-muted",
													children: [
														visionBenchmark.semanticPlus.elapsedMs.toFixed(0),
														" ms · ",
														visionBenchmark.semanticPlus.labels.flat().length,
														" labels · ",
														visionBenchmark.sampleSize,
														" photos"
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "rounded-xs bg-bg/50 p-3 text-xs",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-medium text-fg",
													children: VISION_MODELS.semanticPro.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 text-muted",
													children: [
														visionBenchmark.semanticPro.elapsedMs.toFixed(0),
														" ms · ",
														visionBenchmark.semanticPro.labels.flat().length,
														" labels · ",
														visionBenchmark.sampleSize,
														" photos"
													]
												})]
											})
										]
									}),
									visionBenchmarkPhotos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
										className: "mt-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-medium text-fg",
												children: "Photo-by-photo tag review"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[11px] text-muted",
												children: "CLIP, SigLIP semantic+, and SigLIP large+ results on the same image"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
											children: visionBenchmarkPhotos.map((photo) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
												className: "overflow-hidden rounded-xs border border-border bg-bg/50",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: photo.url,
													alt: photo.name,
													loading: "lazy",
													decoding: "async",
													className: "aspect-video w-full object-cover"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "truncate text-xs font-medium text-fg",
														children: photo.name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "mt-2 grid gap-2",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-[11px] font-medium text-muted",
																children: "CLIP"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "mt-1 flex flex-wrap gap-1",
																children: photo.clip.length ? photo.clip.slice(0, 4).map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	className: "rounded-xs bg-elevated px-1.5 py-0.5 text-[11px] text-accent",
																	children: [
																		label.label,
																		" · ",
																		Math.round(label.score * 100),
																		"%"
																	]
																}, label.label)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-[11px] text-subtle",
																	children: "No confident label"
																})
															})] }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-[11px] font-medium text-muted",
																children: "SigLIP semantic+"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "mt-1 flex flex-wrap gap-1",
																children: photo.siglipBase.length ? photo.siglipBase.slice(0, 4).map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	className: "rounded-xs bg-elevated px-1.5 py-0.5 text-[11px] text-accent",
																	children: [
																		label.label,
																		" · ",
																		Math.round(label.score * 100),
																		"%"
																	]
																}, label.label)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-[11px] text-subtle",
																	children: "No confident label"
																})
															})] }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-[11px] font-medium text-muted",
																children: "SigLIP large+"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "mt-1 flex flex-wrap gap-1",
																children: photo.siglipLarge.length ? photo.siglipLarge.slice(0, 4).map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	className: "rounded-xs bg-elevated px-1.5 py-0.5 text-[11px] text-accent",
																	children: [
																		label.label,
																		" · ",
																		Math.round(label.score * 100),
																		"%"
																	]
																}, label.label)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-[11px] text-subtle",
																	children: "No confident label"
																})
															})] })
														]
													})]
												})]
											}, photo.id))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-[11px] leading-4 text-subtle",
										children: "The CLIP baseline is pinned to a verified revision. Results include model preparation and inference so the comparison reflects the actual browser experience."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
								className: "mt-3 rounded-sm border border-border bg-elevated p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
									className: "cursor-pointer text-xs font-medium text-fg",
									children: ["Upscaler beta · ", upscalerHealth.state === "ready" ? "verified artifact" : "not installed"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: `text-xs leading-5 ${upscalerHealth.state === "ready" ? "text-accent" : "text-muted"}`,
											children: upscalerHealth.detail
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 flex gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => void checkUpscalerHealth(),
												children: "Check"
											}), upscalerHealth.state === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "ghost",
												onClick: () => void removeUpscalerModel(),
												children: "Remove"
											})]
										}),
										upscalerHealth.state !== "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,0.7fr)_auto]",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: upscalerUrl,
													onChange: (event) => setUpscalerUrl(event.target.value),
													placeholder: "HTTPS model URL",
													"aria-label": "Upscaler model URL"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: upscalerChecksum,
													onChange: (event) => setUpscalerChecksum(event.target.value),
													placeholder: "Publisher SHA-256",
													"aria-label": "Upscaler model SHA-256 checksum"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													disabled: upscalerInstalling,
													onClick: () => void installUpscalerModel(),
													children: upscalerInstalling ? "Verifying…" : "Download + verify"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-[11px] leading-4 text-subtle",
											children: "The verified beta artifact is bundled for local preview. Originals and exports remain untouched until you explicitly save a reviewed result."
										})
									]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-5 text-muted",
						children: "Private local discovery uses file-name patterns plus an optional on-device open-source image classifier. It analyzes up to 48 queued photos at a time; photo bytes stay in this browser. A 900-photo warm URL cache and small rendered batches keep scrolling responsive while folders continue to stream."
					}),
					companionCache && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs leading-5 text-subtle",
						children: [
							"Companion cache worker · ",
							companionCache.state,
							" · ",
							companionCache.photos.toLocaleString(),
							" photo metadata hints · ",
							companionCache.videos.toLocaleString(),
							" video metadata hints",
							companionCache.truncated ? " · bounded pass reached its safe limit" : "",
							companionCache.scannedAt ? ` · checked ${new Date(companionCache.scannedAt).toLocaleTimeString([], {
								hour: "numeric",
								minute: "2-digit"
							})}` : "",
							". Media files remain on this computer."
						]
					}),
					companionDeltaNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-5 text-accent",
						children: companionDeltaNote
					}),
					(helperNote || photoSourceLoading || photoMetadataProgress.running || photoCacheNotice) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex items-center gap-2 text-xs text-accent",
						children: [(photoSourceLoading || photoMetadataProgress.running) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3 animate-spin" }), photoSourceLoading ? `Loading cached photo sources · ${photoScanDone}/${photoScanTotal} folders · ${photoScanFoundPhotos.toLocaleString()} found${photoScanEstimatedPhotos ? ` of about ${photoScanEstimatedPhotos.toLocaleString()}` : ""}${photoScanEta ? ` · about ${photoScanEta}s remaining` : " · estimating time remaining…"}` : photoMetadataProgress.running ? `Reading photo dimensions and dates · ${photoMetadataProgress.done}/${photoMetadataProgress.total} complete${photoMetadataEta ? ` · about ${photoMetadataEta}s remaining` : " · estimating time remaining…"}` : helperNote || photoCacheNotice]
					})
				]
			}),
			!photos.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-lg bg-elevated px-5 py-14 text-center shadow-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/art/realhub-media-cards.webp",
						alt: "",
						loading: "lazy",
						className: "mx-auto h-28 w-36 object-contain"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-display text-2xl text-fg",
						children: "Start with a few favorites"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Add photos here to make private people sections without connecting an account."
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 overflow-hidden rounded-lg bg-elevated shadow-border",
					children: featuredPhoto && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-0 sm:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.5fr)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: featuredPhoto.url,
							alt: featuredPhoto.name,
							decoding: "async",
							className: "aspect-video size-full object-cover"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col justify-center p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
									children: "Now showing"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 font-display text-3xl text-fg",
									children: featuredPhoto.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-sm text-muted",
									children: [
										featuredPhoto.album,
										" · ",
										featuredPhoto.rating || 0,
										"/5 rating"
									]
								}),
								showLocations && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									title: featuredPhoto.path,
									className: "mt-2 truncate text-xs text-muted",
									children: featuredPhoto.path
								})
							]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
						children: renderedPhotos.map((photo) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative overflow-hidden rounded-md bg-elevated shadow-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "absolute z-10 m-2 flex size-7 items-center justify-center rounded-sm bg-bg/75 text-fg",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: selectedPhotoIds.has(photo.id),
										onChange: () => setSelectedPhotoIds((current) => {
											const next = new Set(current);
											if (next.has(photo.id)) next.delete(photo.id);
											else next.add(photo.id);
											return next;
										}),
										"aria-label": `Select ${photo.name}`
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "group relative block w-full",
									onClick: () => {
										setPhotoViewerLoading(true);
										setFocusedPhotoId(photo.id);
									},
									"aria-label": `Open ${photo.name} full screen`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: photo.url,
										alt: photo.name,
										loading: "lazy",
										decoding: "async",
										className: "aspect-square w-full object-cover"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute inset-0 flex items-center justify-center bg-bg/45 opacity-0 transition-opacity group-hover:opacity-100",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "size-6 text-fg" })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "min-w-0 flex-1 truncate text-sm text-fg",
													children: photo.name
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: photo.favorite ? "default" : "secondary",
													onClick: () => setPhotos((items) => items.map((item) => item.id === photo.id ? {
														...item,
														favorite: !item.favorite
													} : item)),
													children: "♥"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "secondary",
													"aria-label": `Download ${photo.name}`,
													onClick: () => downloadPhoto(photo),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													size: "sm",
													variant: "secondary",
													"aria-label": `${photo.hidden ? "Restore" : "Hide"} ${photo.name}`,
													onClick: () => setPhotos((items) => items.map((item) => item.id === photo.id ? {
														...item,
														hidden: !item.hidden
													} : item)),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" })
												})
											]
										}),
										showLocations && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											title: photo.path,
											className: "mt-1 truncate text-xs text-muted",
											children: photo.path
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoStars, {
											name: photo.name,
											rating: photo.rating,
											onChange: (rating) => setPhotos((items) => items.map((item) => item.id === photo.id ? {
												...item,
												rating
											} : item))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "mt-2 h-9",
											placeholder: "People: Alex, Sam",
											value: photo.people.join(", "),
											onChange: (event) => {
												const names = event.target.value.split(",").map((value) => value.trim()).filter(Boolean);
												setPhotos((items) => items.map((item) => item.id === photo.id ? {
													...item,
													people: names
												} : item));
											}
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "mt-2 h-9",
											placeholder: "Tags: travel, pets, event",
											value: photo.tags.join(", "),
											onChange: (event) => {
												const tags = event.target.value.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean).slice(0, 20);
												setPhotos((items) => items.map((item) => item.id === photo.id ? {
													...item,
													tags: [...new Set(tags)]
												} : item));
											}
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "mt-2 h-9",
											placeholder: "Album, e.g. Summer 2026",
											value: photo.album,
											onChange: (event) => setPhotos((items) => items.map((item) => item.id === photo.id ? {
												...item,
												album: event.target.value || "Unsorted"
											} : item))
										})
									]
								})
							]
						}, photo.id))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-center justify-between gap-3 text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"Showing ",
							Math.min(renderedPhotos.length, visible.length),
							" of ",
							visible.length,
							" matching photos"
						] }), renderedPhotos.length < visible.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => setPhotoLimit((limit) => limit + 80),
							children: "Show 80 more"
						})]
					})]
				}),
				focusedPhoto && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					role: "dialog",
					"aria-modal": "true",
					"aria-label": `Viewing ${focusedPhoto.name}`,
					className: "fixed inset-0 z-[80] flex items-center justify-center bg-bg/95 p-4",
					onClick: () => setFocusedPhotoId(null),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex h-full w-full max-w-7xl flex-col gap-3",
						onClick: (event) => event.stopPropagation(),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3 text-fg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate font-medium",
											children: focusedPhoto.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted",
											children: [
												Math.max(1, focusedIndex + 1),
												" of ",
												visible.length || photos.length,
												" · ",
												focusedPhoto.album
											]
										}),
										showLocations && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											title: focusedPhoto.path,
											className: "truncate text-xs text-muted",
											children: focusedPhoto.path
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => setFocusedPhotoId(null),
									children: "Close"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: focusedPhoto.favorite ? "default" : "secondary",
										onClick: () => setPhotos((items) => items.map((item) => item.id === focusedPhoto.id ? {
											...item,
											favorite: !item.favorite
										} : item)),
										children: focusedPhoto.favorite ? "♥ Favorite" : "♡ Favorite"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "secondary",
										"aria-label": `Download ${focusedPhoto.name}`,
										onClick: () => downloadPhoto(focusedPhoto),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Download"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										disabled: visionBusy,
										onClick: () => {
											setFocusedPhotoId(null);
											preparePhotoVision([focusedPhoto]);
										},
										children: visionBusy ? visionProgress || "Preparing labels…" : "Prepare vision labels"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "h-8 min-w-56 flex-1",
										"aria-label": "Edit photo tags",
										value: focusedPhoto.tags.join(", "),
										placeholder: "Add tags, separated by commas",
										onChange: (event) => {
											const nextTags = [...new Set(event.target.value.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
											setPhotos((items) => items.map((item) => item.id === focusedPhoto.id ? {
												...item,
												tags: nextTags
											} : item));
										}
									}),
									focusedPhoto.tags.length ? focusedPhoto.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "rounded-xs bg-elevated px-2 py-1 text-xs text-muted",
										onClick: () => setSelectedTag(tag),
										children: ["#", tag]
									}, tag)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted",
										children: "No tags yet"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoStars, {
								name: focusedPhoto.name,
								rating: focusedPhoto.rating,
								onChange: (rating) => setPhotos((items) => items.map((item) => item.id === focusedPhoto.id ? {
									...item,
									rating
								} : item))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative min-h-0 flex-1",
								children: [
									photoViewerLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-bg/70 text-sm text-fg",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-7 animate-spin text-accent" }), "Loading full-resolution photo…"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: focusedPhoto.url,
										alt: focusedPhoto.name,
										className: "max-h-full w-full object-contain",
										decoding: "async",
										onLoad: () => setPhotoViewerLoading(false),
										onError: () => setPhotoViewerLoading(false)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										className: "absolute top-1/2 left-2 -translate-y-1/2",
										onClick: () => {
											setPhotoViewerLoading(true);
											moveFocus(-1);
										},
										"aria-label": "Previous photo",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										className: "absolute top-1/2 right-2 -translate-y-1/2",
										onClick: () => {
											setPhotoViewerLoading(true);
											moveFocus(1);
										},
										"aria-label": "Next photo",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
									})
								]
							})
						]
					})
				})
			] })
		]
	});
}
function PhotoStars({ name, rating, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 flex flex-wrap items-center gap-1",
		role: "group",
		"aria-label": "Rating for " + name,
		children: [[
			1,
			2,
			3,
			4,
			5
		].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "inline-flex size-11 items-center justify-center rounded-sm hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-accent",
			"aria-label": "Rate " + name + " " + value + " stars",
			"aria-pressed": rating === value,
			onClick: () => onChange(value),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-5 " + (value <= rating ? "fill-accent text-accent" : "text-muted") })
		}, value)), rating > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "min-h-11 px-2 text-xs text-muted",
			"aria-label": "Clear rating for " + name,
			onClick: () => onChange(0),
			children: "Clear"
		})]
	});
}
//#endregion
export { PhotosSection };
