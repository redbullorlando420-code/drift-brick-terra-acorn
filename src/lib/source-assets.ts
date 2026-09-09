import { create } from "zustand";

export type SourcePhotoAsset = { file: File; path: string; url: string };

type SourceAssets = {
  photos: SourcePhotoAsset[];
  shortcuts: File[];
  capture: (files: FileList | File[]) => void;
  capturePhoto: (file: File, path: string) => void;
};

const imageFile = (file: File) => file.type.startsWith("image/") || /\.(avif|bmp|gif|heic|heif|jpe?g|png|tiff?|webp)$/i.test(file.name);
const shortcutFile = (file: File) => /\.(url|lnk|exe|appref-ms)$/i.test(file.name);
const MAX_WARM_PHOTOS = 900;

function releaseDiscardedUrls(previous: SourcePhotoAsset[], next: SourcePhotoAsset[]) {
  const retained = new Set(next.map((asset) => asset.url));
  for (const asset of previous) {
    if (!retained.has(asset.url)) URL.revokeObjectURL(asset.url);
  }
}

/** Companion assets discovered in a source picker. File handles remain browser-private. */
export const useSourceAssets = create<SourceAssets>((set) => ({
  photos: [],
  shortcuts: [],
  capture: (input) => set((state) => {
    const files = Array.from(input);
    const append = (current: File[], next: File[]) => [...current, ...next.filter((file) => !current.some((saved) => `${saved.name}:${saved.lastModified}` === `${file.name}:${file.lastModified}`))].slice(-600);
    const photoFiles = files.filter(imageFile);
    const existing = new Set(state.photos.map((asset) => `${asset.path}:${asset.file.lastModified}`));
    const incoming = photoFiles
      .filter((file) => {
        const key = `${file.webkitRelativePath || file.name}:${file.lastModified}`;
        if (existing.has(key)) return false;
        existing.add(key);
        return true;
      })
      // Do not allocate object URLs for photos that the bounded warm cache
      // cannot retain. This keeps large folder imports from briefly holding
      // every decoded file in memory.
      .slice(-MAX_WARM_PHOTOS);
    const overflow = Math.max(0, state.photos.length + incoming.length - MAX_WARM_PHOTOS);
    const retained = state.photos.slice(overflow);
    const photos = [...retained, ...incoming.map((file) => ({ file, path: file.webkitRelativePath || file.name, url: URL.createObjectURL(file) }))];
    releaseDiscardedUrls(state.photos, photos);
    return { photos, shortcuts: append(state.shortcuts, files.filter(shortcutFile)) };
  }),
  capturePhoto: (file, path) => set((state) => {
    const key = `${path}:${file.lastModified}`;
    if (state.photos.some((asset) => `${asset.path}:${asset.file.lastModified}` === key)) return state;
    const next = [...state.photos, { file, path, url: URL.createObjectURL(file) }].slice(-MAX_WARM_PHOTOS);
    releaseDiscardedUrls(state.photos, next);
    return { photos: next };
  }),
}));
