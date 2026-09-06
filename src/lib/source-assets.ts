import { create } from "zustand";

type SourceAssets = {
  photos: File[];
  shortcuts: File[];
  capture: (files: FileList | File[]) => void;
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
    return { photos: append(state.photos, files.filter(imageFile)), shortcuts: append(state.shortcuts, files.filter(shortcutFile)) };
  }),
}));
