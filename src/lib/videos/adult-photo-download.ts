import type { LibraryVideo } from "./types";
import { isAdultImageKind } from "./adult-sites";

/** Resolve the best direct image URL for an adult photo-kind card. */
export function adultPhotoDownloadUrl(video: LibraryVideo): string | null {
  if (!isAdultImageKind(video.remote?.kind, video.mime, video.extension)) {
    // Still allow explicit image mime/src even if kind is reddit with image.
    if (!(video.mime?.startsWith("image/") || video.extension === "image")) return null;
  }
  const url = video.src || video.remote?.embedUrl || video.remote?.previewUrl || video.poster || "";
  if (!url || !/^https?:\/\//i.test(url)) return null;
  return url;
}

function filenameFor(video: LibraryVideo, url: string) {
  const fromPath = url.split("?")[0]?.split("/").pop() || "";
  const extMatch = fromPath.match(/\.(jpe?g|png|gif|webp|avif)$/i);
  const ext = extMatch?.[1]?.toLowerCase() || "jpg";
  const base = (video.name || video.id || "adult-photo")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72) || "adult-photo";
  return `${base}.${ext}`;
}

/**
 * Save an adult photo to the user's local disk via browser download.
 * Uses File System Access `showSaveFilePicker` when available; otherwise
 * falls back to an anchor download of a fetched blob.
 */
export async function downloadAdultPhoto(video: LibraryVideo): Promise<{ ok: true; name: string } | { ok: false; error: string }> {
  const url = adultPhotoDownloadUrl(video);
  if (!url) return { ok: false, error: "No downloadable image on this title." };
  const name = filenameFor(video, url);
  try {
    const res = await fetch(url, { mode: "cors", credentials: "omit" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const handlePicker = (window as unknown as { showSaveFilePicker?: (opts: unknown) => Promise<FileSystemFileHandle> }).showSaveFilePicker;
    if (typeof handlePicker === "function") {
      try {
        const handle = await handlePicker({
          suggestedName: name,
          types: [{ description: "Image", accept: { [blob.type || "image/jpeg"]: [`.${name.split(".").pop()}`] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return { ok: true, name: handle.name || name };
      } catch (err) {
        // User cancelled picker — don't fall through as failure noise.
        if (err instanceof DOMException && err.name === "AbortError") {
          return { ok: false, error: "Save cancelled." };
        }
        // Fall back to anchor download when picker is blocked.
      }
    }
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = name;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
    return { ok: true, name };
  } catch (err) {
    // CORS can block blob fetch; last resort open the image for manual save.
    try {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return { ok: true, name };
    } catch {
      return { ok: false, error: err instanceof Error ? err.message : "Download failed." };
    }
  }
}
