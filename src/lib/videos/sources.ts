const files = new Map<string, File>();
const fileHandles = new Map<string, FileSystemFileHandle>();
const dirHandles = new Map<string, FileSystemDirectoryHandle>();
const objectUrls = new Map<string, string>();

export function rememberFile(id: string, file: File) {
  files.set(id, file);
}

export function rememberFileHandle(id: string, handle: FileSystemFileHandle) {
  fileHandles.set(id, handle);
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

export async function resolvePlayUrl(video: {
  id: string;
  src?: string;
}): Promise<string> {
  if (video.src) return video.src;
  const cached = objectUrls.get(video.id);
  if (cached) return cached;
  let file = files.get(video.id);
  if (!file) {
    const handle = fileHandles.get(video.id);
    if (handle) file = await handle.getFile();
  }
  if (!file) {
    throw new Error("This file is no longer available. Add the folder again.");
  }
  const url = URL.createObjectURL(file);
  objectUrls.set(video.id, url);
  return url;
}
