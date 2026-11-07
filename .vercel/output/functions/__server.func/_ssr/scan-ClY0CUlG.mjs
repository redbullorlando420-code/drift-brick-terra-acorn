import { n as extensionOf } from "./utils-Cq6DDHIb.mjs";
import { An as identityForLocation, Dn as hydrateCatalogDeletions, Fn as isCatalogDeleted, On as hydrateFileIdentities, Wo as validLocalIdentityRef, fr as localIdentitySnapshot, ja as sameFileFingerprint, ln as fingerprintFile, xr as mediaReadBlocked } from "./persist-BhJ4449E.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scan-ClY0CUlG.js
var files = /* @__PURE__ */ new Map();
var fileHandles = /* @__PURE__ */ new Map();
var dirHandles = /* @__PURE__ */ new Map();
var objectUrls = /* @__PURE__ */ new Map();
var pinnedUrls = /* @__PURE__ */ new Map();
var MAX_OBJECT_URLS = 48;
var verifiedIdentityIds = [];
function sourceIsPinned(id) {
	return (pinnedUrls.get(id) ?? 0) > 0;
}
function forgetLocalSource(id) {
	if (sourceIsPinned(id)) throw Error("Release this title from the Watch Room before changing its file mapping.");
	files.delete(id);
	fileHandles.delete(id);
	const url = objectUrls.get(id);
	if (url) URL.revokeObjectURL(url);
	objectUrls.delete(id);
}
function rememberVerifiedIdentityFile(id, file) {
	files.set(id, file);
	const index = verifiedIdentityIds.indexOf(id);
	if (index >= 0) verifiedIdentityIds.splice(index, 1);
	verifiedIdentityIds.push(id);
	while (verifiedIdentityIds.length > 8) {
		const oldest = verifiedIdentityIds.shift();
		if (!sourceIsPinned(oldest)) files.delete(oldest);
	}
}
/** Release transient media blobs after idle/background time, keeping the
* open player/preview valid. File handles and saved metadata remain intact. */
function trimObjectUrls(keepIds = []) {
	const keep = new Set(keepIds);
	for (const [id, url] of objectUrls) if (!keep.has(id) && !pinnedUrls.has(id)) {
		URL.revokeObjectURL(url);
		objectUrls.delete(id);
	}
}
/** Watch rooms keep their selected file alive even when the main player is closed. */
function pinPlayUrl(id) {
	pinnedUrls.set(id, (pinnedUrls.get(id) ?? 0) + 1);
	let released = false;
	return () => {
		if (released) return;
		released = true;
		const count = pinnedUrls.get(id) ?? 0;
		if (count <= 1) pinnedUrls.delete(id);
		else pinnedUrls.set(id, count - 1);
	};
}
function getSourceMemorySnapshot() {
	return {
		objectUrls: objectUrls.size,
		fileHandles: fileHandles.size,
		files: files.size
	};
}
function rememberFile(id, file) {
	files.set(id, file);
}
function rememberFileHandle(id, handle) {
	fileHandles.set(id, handle);
	files.delete(id);
}
function rememberDirHandle(folderId, handle) {
	dirHandles.set(folderId, handle);
}
function getDirHandle(folderId) {
	return dirHandles.get(folderId);
}
function forgetFolder(folderId, videoIds) {
	dirHandles.delete(folderId);
	for (const id of videoIds) {
		files.delete(id);
		fileHandles.delete(id);
		const url = objectUrls.get(id);
		if (url) {
			URL.revokeObjectURL(url);
			objectUrls.delete(id);
		}
	}
}
function rememberObjectUrl(id, url) {
	if (objectUrls.has(id)) {
		const prev = objectUrls.get(id);
		if (prev && prev !== url) URL.revokeObjectURL(prev);
		objectUrls.delete(id);
	}
	while (objectUrls.size >= MAX_OBJECT_URLS) {
		const oldest = [...objectUrls.keys()].find((key) => !pinnedUrls.has(key));
		if (!oldest) break;
		const prev = objectUrls.get(oldest);
		if (prev) URL.revokeObjectURL(prev);
		objectUrls.delete(oldest);
	}
	objectUrls.set(id, url);
}
async function resolvePlayUrl(video, signal) {
	if (mediaReadBlocked(video.id)) throw Error("This location contains different contents. Review its verified identity or check the corrected file before playback.");
	if (video.localIdentity && !validLocalIdentityRef(video.localIdentity)) throw Error("Unsupported file identity. Existing mapping was kept; review this title before playing.");
	if (video.src) return video.src;
	const cached = objectUrls.get(video.id);
	if (cached) {
		objectUrls.delete(video.id);
		objectUrls.set(video.id, cached);
		return cached;
	}
	const file = await resolveLocalFile(video);
	if (video.size !== void 0 && file.size !== video.size) throw Object.assign(Error("The file size changed. Review its identity before playback; your saved marks were kept."), { sourceCode: "ContentMismatch" });
	const expected = video.localIdentity?.proof ?? localIdentitySnapshot().fingerprints[video.id]?.proof;
	if (expected) {
		const proof = await fingerprintFile(file, signal ?? new AbortController().signal);
		if (!sameFileFingerprint(proof, expected)) throw Error("This location contains a different file. Your saved marks were kept. Review the file identity before playing.");
		rememberVerifiedIdentityFile(video.id, file);
	}
	const url = URL.createObjectURL(file);
	rememberObjectUrl(video.id, url);
	return url;
}
/** Reads only an already selected file or a previously granted source handle. */
async function resolveLocalFile(video) {
	let file = files.get(video.id);
	let sourceCode;
	if (!file) {
		const handle = fileHandles.get(video.id);
		if (handle) try {
			file = await handle.getFile();
		} catch (error) {
			sourceCode = error.name;
			fileHandles.delete(video.id);
		}
	}
	if (!file && video.folderId && video.path) {
		const root = dirHandles.get(video.folderId);
		if (root) try {
			const segments = video.path.split("/").filter(Boolean);
			const leaf = segments.pop();
			let dir = root;
			for (const segment of segments) dir = await dir.getDirectoryHandle(segment);
			if (leaf) {
				const handle = await dir.getFileHandle(leaf);
				rememberFileHandle(video.id, handle);
				file = await handle.getFile();
			}
		} catch (error) {
			sourceCode = error.name;
		}
	}
	if (!file) throw Object.assign(/* @__PURE__ */ new Error("This file is no longer available. Reconnect its source or review its verified identity."), { sourceCode });
	return file;
}
var VIDEO_EXTENSIONS = /* @__PURE__ */ new Set([
	"mp4",
	"webm",
	"mkv",
	"mov",
	"m4v",
	"avi",
	"ogv",
	"ogg",
	"3gp",
	"wmv",
	"flv",
	"ts",
	"mts",
	"m2ts",
	"mpeg",
	"mpg",
	"mpe",
	"asf",
	"m2v",
	"vob"
]);
var NATIVE_PLAYABLE = /* @__PURE__ */ new Set([
	"mp4",
	"webm",
	"ogv",
	"ogg",
	"m4v",
	"mov"
]);
var SKIP_DIRS = /* @__PURE__ */ new Set([
	"node_modules",
	".git",
	".svn",
	".hg",
	".cache",
	".next",
	".nuxt",
	"dist",
	"build",
	"__pycache__",
	"system volume information",
	"$recycle.bin",
	"windows",
	"windows.old",
	"program files",
	"program files (x86)",
	"programdata",
	"recovery",
	"perflogs",
	"boot",
	"intel",
	"amd",
	"nvidia",
	"nvidia corporation",
	"msocache",
	"config.msi",
	"$windows.~bt",
	"$windows.~ws",
	"documents and settings",
	"appdata",
	"application data",
	"local settings",
	"library",
	"system",
	"applications",
	"private",
	"usr",
	"proc",
	"sys",
	"dev",
	"run",
	"snap",
	"var",
	"cores",
	"tmp",
	"temp",
	"cache"
]);
/** Old cached viewer counts are intentionally not treated as current demand. */
function hasFreshViewerCount(remote, now = Date.now()) {
	return Boolean(remote && typeof remote.viewers === "number" && Number.isFinite(remote.viewers) && remote.viewers >= 0 && typeof remote.observedAt === "number" && now >= remote.observedAt && now - remote.observedAt <= 3e5);
}
var RECOMMENDED_FOLDERS = [
	{
		id: "videos",
		label: "Videos",
		hint: "Movies & TV"
	},
	{
		id: "downloads",
		label: "Downloads",
		hint: "Saved files"
	},
	{
		id: "desktop",
		label: "Desktop",
		hint: "On the desktop"
	},
	{
		id: "documents",
		label: "Documents",
		hint: "Docs folder"
	},
	{
		id: "pictures",
		label: "Pictures",
		hint: "Camera rolls"
	}
];
function isVideoFile(name, mime) {
	const ext = name.includes(".") ? name.slice(name.lastIndexOf(".") + 1).toLowerCase() : "";
	if (VIDEO_EXTENSIONS.has(ext)) return true;
	return Boolean(mime && mime.startsWith("video/"));
}
function shouldSkipDir(name) {
	if (name.startsWith(".")) return true;
	return SKIP_DIRS.has(name.toLowerCase());
}
function isDriveName(name) {
	const n = name.trim();
	if (/^[a-z]:?$/i.test(n)) return true;
	if (n === "/" || n === "\\") return true;
	return /^(macintosh hd|local disk|os|windows|ubuntu|fedora|linux)$/i.test(n);
}
function mimeFromName(name) {
	switch (name.slice(name.lastIndexOf(".") + 1).toLowerCase()) {
		case "mp4":
		case "m4v": return "video/mp4";
		case "webm": return "video/webm";
		case "ogv":
		case "ogg": return "video/ogg";
		case "mov": return "video/quicktime";
		case "mkv": return "video/x-matroska";
		case "avi": return "video/x-msvideo";
		default: return "video/*";
	}
}
function isLikelyPlayable(ext) {
	return NATIVE_PLAYABLE.has(ext.toLowerCase());
}
function titleOf(video) {
	return video.name.replace(/\.[^/.]+$/, "");
}
function isClassicVideo(video) {
	if (video.collection === "classics") return true;
	const blob = `${video.path} ${video.name} ${video.genre ?? ""}`.toLowerCase();
	return /\b(classic|classics|noir|silent|golden.?age)\b/.test(blob);
}
var SYSTEM_SOURCES = /* @__PURE__ */ new Set([
	"home",
	"landing",
	"all",
	"movies",
	"favorites",
	"history",
	"adults",
	"adult-fetishes",
	"continue",
	"youtube",
	"twitch",
	"live",
	"prints",
	"photos",
	"spotify",
	"games",
	"shop",
	"streaming",
	"stream-signal",
	"stable-diffusion",
	"remote-desktop",
	"social",
	"watch-room",
	"accounts",
	"settings"
]);
/** Only previously approved locations need a content read during a source scan. */
async function verifiedScannedIdentity(video, file, signal) {
	const move = identityForLocation(video.id);
	if (!move) return isCatalogDeleted(video) ? null : video;
	if (isCatalogDeleted(move.after)) return null;
	const proof = await fingerprintFile(file, signal ?? new AbortController().signal);
	if (sameFileFingerprint(proof, move.proof)) {
		if (video.id !== move.target.id) return null;
		return {
			...video,
			id: move.canonicalId,
			name: move.after.name,
			...move.private ? { privateRetention: true } : {},
			localIdentity: move.after.localIdentity
		};
	}
	const id = video.id + ":content:" + proof.digest;
	return {
		...video,
		id,
		localIdentity: {
			version: 1,
			canonicalId: id,
			targetId: video.id,
			proof,
			previousPaths: [],
			revision: move.after.localIdentity.revision
		}
	};
}
var MAX_DEPTH = 14;
var MAX_DRIVE_DEPTH = 12;
function asOpts(arg) {
	if (typeof arg === "function") return { onProgress: arg };
	return arg ?? {};
}
function aborted(signal) {
	return Boolean(signal?.aborted);
}
async function yieldUi() {
	await new Promise((r) => setTimeout(r, 0));
}
var BATCH_SIZE = 250;
function inferGenre(name) {
	const text = name.toLowerCase();
	if (/\b(comedy|funny|standup|sitcom)\b/.test(text)) return "Comedy";
	if (/\b(horror|scary|slasher|ghost)\b/.test(text)) return "Horror";
	if (/\b(action|fight|battle|war)\b/.test(text)) return "Action";
	if (/\b(documentary|documentary|history|nature)\b/.test(text)) return "Documentary";
	if (/\b(sci[ .-]?fi|science fiction|space)\b/.test(text)) return "Science Fiction";
}
function maybeFlush(acc, flushed, onBatch, force = false) {
	if (!onBatch) return;
	if (!force && acc.length - flushed.n < BATCH_SIZE) return;
	if (acc.length <= flushed.n) return;
	onBatch(acc.slice(flushed.n));
	flushed.n = acc.length;
}
function throttleProgress(opts, state, progress) {
	const now = typeof performance !== "undefined" ? performance.now() : Date.now();
	if (progress.found - state.lastFound < 40 && now - state.lastAt < 150 && progress.found % 200 !== 0) return;
	state.lastAt = now;
	state.lastFound = progress.found;
	opts.onProgress?.(progress);
}
async function ingestDirectoryHandle(dir, folderId, arg) {
	const opts = asOpts(arg);
	await Promise.all([hydrateFileIdentities(), hydrateCatalogDeletions()]);
	const acc = [];
	const flushed = { n: 0 };
	const drive = opts.drive ?? isDriveName(dir.name);
	if (opts.imagesOnly) {
		await walkImagesBreadthFirst(dir, dir.name, opts, drive);
		return acc;
	}
	await walkHandle(dir, "", folderId, acc, dir.name, opts, flushed, 0, drive);
	if (opts.onBatch && acc.length > flushed.n) opts.onBatch(acc.slice(flushed.n));
	return acc;
}
async function walkImagesBreadthFirst(root, folderName, opts, drive) {
	const maxDepth = drive ? MAX_DRIVE_DEPTH : MAX_DEPTH;
	const queue = [{
		dir: root,
		prefix: "",
		depth: 0
	}];
	let cursor = 0;
	let found = 0;
	let looked = 0;
	const progress = {
		lastAt: 0,
		lastFound: 0
	};
	while (cursor < queue.length && !aborted(opts.signal)) {
		const { dir, prefix, depth } = queue[cursor++];
		if (depth > maxDepth) continue;
		const iterable = dir;
		if (typeof iterable.entries !== "function") continue;
		for await (const [name, handle] of iterable.entries()) {
			if (aborted(opts.signal)) return;
			looked += 1;
			if (handle.kind === "directory") {
				if (!shouldSkipDir(name)) queue.push({
					dir: handle,
					prefix: `${prefix}${name}/`,
					depth: depth + 1
				});
			} else if (handle.kind === "file" && /\.(avif|bmp|gif|heic|heif|jpe?g|png|tiff?|webp)$/i.test(name)) try {
				const file = await handle.getFile();
				found += 1;
				opts.onImage?.(file, prefix + name);
				throttleProgress(opts, progress, {
					found,
					looked,
					folderName,
					current: prefix + name
				});
				if (found % 8 === 0) await yieldUi();
			} catch {}
			if (looked % 160 === 0) await yieldUi();
		}
	}
}
async function walkHandle(dir, prefix, folderId, acc, folderName, opts, flushed, depth, drive, progressState = {
	lastAt: 0,
	lastFound: 0
}) {
	if (depth > (drive ? MAX_DRIVE_DEPTH : MAX_DEPTH) || aborted(opts.signal)) return;
	const iterable = dir;
	if (typeof iterable.entries !== "function") return;
	let looked = 0;
	for await (const [name, handle] of iterable.entries()) {
		if (aborted(opts.signal)) return;
		looked += 1;
		if (handle.kind === "directory") {
			if (shouldSkipDir(name)) continue;
			await walkHandle(handle, `${prefix}${name}/`, folderId, acc, folderName, opts, flushed, depth + 1, drive, progressState);
		} else if (handle.kind === "file" && !opts.imagesOnly && isVideoFile(name)) try {
			const fileHandle = handle;
			const file = await fileHandle.getFile();
			await pushVideo(acc, folderId, prefix + name, file, fileHandle, opts.signal);
			throttleProgress(opts, progressState, {
				found: acc.length,
				looked,
				folderName,
				current: prefix + name
			});
			maybeFlush(acc, flushed, opts.onBatch);
			if (acc.length % 20 === 0) await yieldUi();
		} catch {}
		else if (handle.kind === "file" && /\.(avif|bmp|gif|heic|heif|jpe?g|png|tiff?|webp)$/i.test(name)) try {
			opts.onImage?.(await handle.getFile(), prefix + name);
		} catch {}
		else if (looked % 200 === 0) {
			throttleProgress(opts, progressState, {
				found: acc.length,
				looked,
				folderName,
				current: prefix + name
			});
			await yieldUi();
		}
	}
}
async function ingestFileList(list, folderId, folderName, arg) {
	const opts = asOpts(arg);
	const files = Array.from(list);
	await Promise.all([hydrateFileIdentities(), hydrateCatalogDeletions()]);
	const acc = [];
	const flushed = { n: 0 };
	let looked = 0;
	const progressState = {
		lastAt: 0,
		lastFound: 0
	};
	for (const file of files) {
		if (aborted(opts.signal)) break;
		looked += 1;
		const rel = "webkitRelativePath" in file && file.webkitRelativePath ? file.webkitRelativePath : file.name;
		const parts = rel.split("/").filter(Boolean);
		if (parts.some((p, i) => i < parts.length - 1 && shouldSkipDir(p))) continue;
		if (!isVideoFile(file.name, file.type)) continue;
		await pushVideo(acc, folderId, rel, file, void 0, opts.signal);
		throttleProgress(opts, progressState, {
			found: acc.length,
			looked,
			folderName,
			current: rel
		});
		maybeFlush(acc, flushed, opts.onBatch);
		if (acc.length % 20 === 0) await yieldUi();
	}
	if (opts.onBatch && acc.length > flushed.n) opts.onBatch(acc.slice(flushed.n));
	return acc;
}
function readAllEntries(reader) {
	return new Promise((resolve, reject) => {
		const out = [];
		const pump = () => {
			reader.readEntries((batch) => {
				if (!batch.length) resolve(out);
				else {
					out.push(...batch);
					pump();
				}
			}, reject);
		};
		pump();
	});
}
function entryFile(entry) {
	return new Promise((resolve, reject) => entry.file(resolve, reject));
}
async function ingestDataTransfer(dt, folderId, folderName, arg) {
	const opts = asOpts(arg);
	const acc = [];
	const flushed = { n: 0 };
	const items = dt.items;
	const entries = [];
	if (items && items.length) for (let i = 0; i < items.length; i++) {
		const item = items[i];
		const entry = item.webkitGetAsEntry?.call(item) ?? null;
		if (entry) entries.push(entry);
	}
	const files = Array.from(dt.files ?? []);
	await Promise.all([hydrateFileIdentities(), hydrateCatalogDeletions()]);
	if (entries.length) {
		for (const entry of entries) await walkEntry(entry, "", folderId, acc, folderName, opts, flushed, 0);
		if (opts.onBatch && acc.length > flushed.n) opts.onBatch(acc.slice(flushed.n));
		if (acc.length) return acc;
	}
	if (files.length) return ingestFileList(files, folderId, folderName, opts);
	return acc;
}
async function walkEntry(entry, prefix, folderId, acc, folderName, opts, flushed, depth) {
	if (depth > MAX_DEPTH || aborted(opts.signal)) return;
	if (entry.isDirectory) {
		if (shouldSkipDir(entry.name)) return;
		const children = await readAllEntries(entry.createReader());
		const nextPrefix = prefix ? `${prefix}${entry.name}/` : "";
		for (const child of children) await walkEntry(child, nextPrefix, folderId, acc, folderName, opts, flushed, depth + 1);
		return;
	}
	if (entry.isFile && isVideoFile(entry.name)) try {
		const file = await entryFile(entry);
		const rel = prefix ? `${prefix}${entry.name}` : entry.name;
		await pushVideo(acc, folderId, rel, file, void 0, opts.signal);
		if (acc.length % 40 === 0 || acc.length < 5) opts.onProgress?.({
			found: acc.length,
			looked: acc.length,
			folderName,
			current: rel
		});
		maybeFlush(acc, flushed, opts.onBatch);
		if (acc.length % 20 === 0) await yieldUi();
	} catch {}
}
async function pushVideo(acc, folderId, relPath, file, handle, signal) {
	const name = file.name;
	const admitted = await verifiedScannedIdentity({
		id: `${folderId}:${relPath}`,
		folderId,
		name,
		path: relPath,
		extension: extensionOf(name),
		mime: file.type || mimeFromName(name),
		size: file.size,
		addedAt: Date.now(),
		genre: inferGenre(`${relPath} ${name}`)
	}, file, signal);
	if (!admitted || isCatalogDeleted(admitted)) return;
	if (handle) rememberFileHandle(admitted.id, handle);
	else rememberFile(admitted.id, file);
	acc.push(admitted);
}
async function pickDirectory(startIn) {
	if (typeof window === "undefined") return "fallback";
	const picker = window.showDirectoryPicker;
	if (typeof picker !== "function") return "fallback";
	try {
		if (startIn === "drive") return await picker({
			id: "reelcase-drive",
			mode: "read"
		});
		return await picker({
			id: startIn ? `reelcase-${startIn}` : "reelcase-videos",
			mode: "read",
			startIn: startIn ?? "videos"
		});
	} catch (err) {
		if (err?.name === "AbortError") return "abort";
		return "fallback";
	}
}
async function queryDirPermission(handle) {
	const h = handle;
	if (typeof h.queryPermission !== "function") return "granted";
	return h.queryPermission({ mode: "read" });
}
async function requestDirPermission(handle) {
	const h = handle;
	if (typeof h.queryPermission !== "function") return true;
	if (await h.queryPermission({ mode: "read" }) === "granted") return true;
	if (typeof h.requestPermission !== "function") return false;
	return await h.requestPermission({ mode: "read" }) === "granted";
}
//#endregion
export { titleOf as C, sourceIsPinned as S, rememberDirHandle as _, forgetLocalSource as a, resolveLocalFile as b, hasFreshViewerCount as c, ingestFileList as d, isClassicVideo as f, queryDirPermission as g, pinPlayUrl as h, forgetFolder as i, ingestDataTransfer as l, pickDirectory as m, RECOMMENDED_FOLDERS as n, getDirHandle as o, isLikelyPlayable as p, SYSTEM_SOURCES as r, getSourceMemorySnapshot as s, NATIVE_PLAYABLE as t, ingestDirectoryHandle as u, rememberVerifiedIdentityFile as v, trimObjectUrls as w, resolvePlayUrl as x, requestDirPermission as y };
