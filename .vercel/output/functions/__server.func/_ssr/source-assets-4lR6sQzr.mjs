import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/source-assets-4lR6sQzr.js
var imageFile = (file) => file.type.startsWith("image/") || /\.(avif|bmp|gif|heic|heif|jpe?g|png|tiff?|webp)$/i.test(file.name);
var shortcutFile = (file) => /\.(url|lnk|exe|appref-ms)$/i.test(file.name);
var MAX_WARM_PHOTOS = 900;
function releaseDiscardedUrls(previous, next) {
	const retained = new Set(next.map((asset) => asset.url));
	for (const asset of previous) if (!retained.has(asset.url)) URL.revokeObjectURL(asset.url);
}
/** Companion assets discovered in a source picker. File handles remain browser-private. */
var useSourceAssets = create((set) => ({
	photos: [],
	shortcuts: [],
	capture: (input) => set((state) => {
		const files = Array.from(input);
		const append = (current, next) => [...current, ...next.filter((file) => !current.some((saved) => `${saved.name}:${saved.lastModified}` === `${file.name}:${file.lastModified}`))].slice(-600);
		const photoFiles = files.filter(imageFile);
		const existing = new Set(state.photos.map((asset) => `${asset.path}:${asset.file.lastModified}`));
		const incoming = photoFiles.filter((file) => {
			const key = `${file.webkitRelativePath || file.name}:${file.lastModified}`;
			if (existing.has(key)) return false;
			existing.add(key);
			return true;
		}).slice(-900);
		const overflow = Math.max(0, state.photos.length + incoming.length - MAX_WARM_PHOTOS);
		const photos = [...state.photos.slice(overflow), ...incoming.map((file) => ({
			file,
			path: file.webkitRelativePath || file.name,
			url: URL.createObjectURL(file)
		}))];
		releaseDiscardedUrls(state.photos, photos);
		return {
			photos,
			shortcuts: append(state.shortcuts, files.filter(shortcutFile))
		};
	}),
	capturePhoto: (file, path) => set((state) => {
		const key = `${path}:${file.lastModified}`;
		if (state.photos.some((asset) => `${asset.path}:${asset.file.lastModified}` === key)) return state;
		const next = [...state.photos, {
			file,
			path,
			url: URL.createObjectURL(file)
		}].slice(-900);
		releaseDiscardedUrls(state.photos, next);
		return { photos: next };
	})
}));
//#endregion
export { useSourceAssets as t };
