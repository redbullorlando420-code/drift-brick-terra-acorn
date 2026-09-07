const files = new Map<string, File>();
const fileHandles = new Map<string, FileSystemFileHandle>();
const dirHandles = new Map<string, FileSystemDirectoryHandle>();
const objectUrls = new Map<string, string>();
const MAX_OBJECT_URLS = 48;

export function rememberFile(id: string, file: File) {
  files.set(id, file);
}

export function rememberFileHandle(id: string, handle: FileSystemFileHandle) {
  fileHandles.set(id, handle);
  // Prefer handles over retained File blobs — keeps large folder scans from OOM'ing.
  files.delete(id);
}

export function rememberDirHandle(folderId: string, handle: FileSystemDirectoryHandle) {
  dirHandles.set(folderId, handle);
}

export function getDirHandle(folderId: string) {
  return dirHandles.get(folderId);
}

export function forgetFolder(folderId: string, videoIds: string[]) {
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

function rememberObjectUrl(id: string, url: string) {
  if (objectUrls.has(id)) {
    const prev = objectUrls.get(id);
    if (prev && prev !== url) URL.revokeObjectURL(prev);
    objectUrls.delete(id);
  }
  while (objectUrls.size >= MAX_OBJECT_URLS) {
    const oldest = objectUrls.keys().next().value as string | undefined;
    if (!oldest) break;
    const prev = objectUrls.get(oldest);
    if (prev) URL.revokeObjectURL(prev);
    objectUrls.delete(oldest);
  }
  objectUrls.set(id, url);
}

export async function resolvePlayUrl(video: {
  id: string;
  src?: string;
  folderId?: string;
  path?: string;
}): Promise<string> {
  if (video.src) return video.src;
  const cached = objectUrls.get(video.id);
  if (cached) {
    // Refresh LRU order
    objectUrls.delete(video.id);
    objectUrls.set(video.id, cached);
    return cached;
  }
  let file = files.get(video.id);
  if (!file) {
    const handle = fileHandles.get(video.id);
    if (handle) file = await handle.getFile();
  }
  // File handles are intentionally memory-only. After a reload, recover the
  // file directly from the persisted folder permission instead of asking the
  // user to reconnect an unchanged source just to play one item.
  if (!file && video.folderId && video.path) {
    const root = dirHandles.get(video.folderId);
    if (root) {
      try {
        const segments = video.path.split("/").filter(Boolean);
        const leaf = segments.pop();
        let dir = root;
        for (const segment of segments) dir = await dir.getDirectoryHandle(segment);
        if (leaf) {
          const handle = await dir.getFileHandle(leaf);
          rememberFileHandle(video.id, handle);
          file = await handle.getFile();
        }
      } catch {
        // The existing error below remains the clear recovery path if a file
        // moved or Windows revoked the folder permission.
      }
    }
  }
  if (!file) {
    throw new Error("This file is no longer available. Add the folder again.");
  }
  const url = URL.createObjectURL(file);
  rememberObjectUrl(video.id, url);
  return url;
}
