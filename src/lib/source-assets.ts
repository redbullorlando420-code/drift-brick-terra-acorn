import { create } from "zustand";

export type SourcePhotoAsset = { file: File; path: string };

type SourceAssets = {
  photos: SourcePhotoAsset[];
  shortcuts: File[];
  capture: (files: FileList | File[]) => void;
  capturePhoto: (file: File, path: string) => void;
};

const imageFile = (file: File) => file.type.startsWith("image/") || /\.(avif|bmp|gif|heic|heif|jpe?g|png|tiff?|webp)$/i.test(file.name);
const shortcutFile = (file: File) => /\.(url|lnk|exe|appref-ms)$/i.test(file.name);

/** Companion assets discovered in a source picker. File handles remain browser-private. */
export const useSourceAssets = create<SourceAssets>((set) => ({
  photos: [],
  shortcuts: [],
  capture: (input) => set((state) => {
    const files = Array.from(input);
    const append = (current: File[], next: File[]) => [...current, ...next.filter((file) => !current.some((saved) => `${saved.name}:${saved.lastModified}` === `${file.name}:${file.lastModified}`))].slice(-600);
    const photoFiles = files.filter(imageFile);
    const photos = [
      ...state.photos,
      ...photoFiles
        .filter((file) => !state.photos.some((saved) => `${saved.file.name}:${saved.file.lastModified}` === `${file.name}:${file.lastModified}`))
        .map((file) => ({ file, path: file.webkitRelativePath || file.name })),
    ].slice(-600);
    return { photos, shortcuts: append(state.shortcuts, files.filter(shortcutFile)) };
  }),
  capturePhoto: (file, path) => set((state) => {
    const key = `${path}:${file.lastModified}`;
    if (state.photos.some((saved) => `${saved.path}:${saved.file.lastModified}` === key)) return state;
    return { photos: [...state.photos, { file, path }].slice(-600) };
  }),
}));
