import {mediaReadBlocked} from './media-health.ts';
const files = new Map<string, File>();
const fileHandles = new Map<string, FileSystemFileHandle>();
const dirHandles = new Map<string, FileSystemDirectoryHandle>();
const objectUrls = new Map<string, string>();
const pinnedUrls = new Map<string, number>();
const MAX_OBJECT_URLS = 48;
import {fingerprintFile,sameFileFingerprint} from './file-fingerprint.ts';
import {localIdentitySnapshot,validLocalIdentityRef,type LocalIdentityRef} from './local-identity.ts';
const verifiedIdentityIds:string[]=[];
export function sourceIsPinned(id:string){return (pinnedUrls.get(id)??0)>0;}
export function forgetLocalSource(id:string){if(sourceIsPinned(id))throw Error('Release this title from the Watch Room before changing its file mapping.');files.delete(id);fileHandles.delete(id);const url=objectUrls.get(id);if(url)URL.revokeObjectURL(url);objectUrls.delete(id);}
export function rememberVerifiedIdentityFile(id:string,file:File){files.set(id,file);const index=verifiedIdentityIds.indexOf(id);if(index>=0)verifiedIdentityIds.splice(index,1);verifiedIdentityIds.push(id);while(verifiedIdentityIds.length>8){const oldest=verifiedIdentityIds.shift()!;if(!sourceIsPinned(oldest))files.delete(oldest);}}

/** Release transient media blobs after idle/background time, keeping the
 * open player/preview valid. File handles and saved metadata remain intact. */
export function trimObjectUrls(keepIds: readonly string[] = []) {
  const keep = new Set(keepIds);
  for (const [id, url] of objectUrls) if (!keep.has(id) && !pinnedUrls.has(id)) {
    URL.revokeObjectURL(url);
    objectUrls.delete(id);
  }
}

/** Watch rooms keep their selected file alive even when the main player is closed. */
export function pinPlayUrl(id: string) {
  pinnedUrls.set(id, (pinnedUrls.get(id) ?? 0) + 1);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    const count = pinnedUrls.get(id) ?? 0;
    if (count <= 1) pinnedUrls.delete(id); else pinnedUrls.set(id, count - 1);
  };
}

export function getSourceMemorySnapshot() { return { objectUrls: objectUrls.size, fileHandles: fileHandles.size, files: files.size }; }

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
    const oldest = [...objectUrls.keys()].find((key) => !pinnedUrls.has(key));
    if (!oldest) break;
    const prev = objectUrls.get(oldest);
    if (prev) URL.revokeObjectURL(prev);
    objectUrls.delete(oldest);
  }
  objectUrls.set(id, url);
}

export async function resolvePlayUrl(video: {
  localIdentity?:LocalIdentityRef;
  size?:number;
  id: string;
  src?: string;
  folderId?: string;
  path?: string;
},signal?:AbortSignal): Promise<string> {
  if(mediaReadBlocked(video.id))throw Error('This location contains different contents. Review its verified identity or check the corrected file before playback.');
  if(video.localIdentity&&!validLocalIdentityRef(video.localIdentity))throw Error('Unsupported file identity. Existing mapping was kept; review this title before playing.');
  if (video.src) return video.src;
  const cached = objectUrls.get(video.id);
  if (cached) {
    // Refresh LRU order
    objectUrls.delete(video.id);
    objectUrls.set(video.id, cached);
    return cached;
  }
  const file=await resolveLocalFile(video);
  if(video.size!==undefined&&file.size!==video.size)throw Object.assign(Error('The file size changed. Review its identity before playback; your saved marks were kept.'),{sourceCode:'ContentMismatch'});
  const expected=video.localIdentity?.proof??localIdentitySnapshot().fingerprints[video.id]?.proof;
  if(expected){const proof=await fingerprintFile(file,signal??new AbortController().signal);if(!sameFileFingerprint(proof,expected))throw Error('This location contains a different file. Your saved marks were kept. Review the file identity before playing.');rememberVerifiedIdentityFile(video.id,file);}
  const url = URL.createObjectURL(file);
  rememberObjectUrl(video.id, url);
  return url;
}

/** Reads only an already selected file or a previously granted source handle. */
export async function resolveLocalFile(video:{id:string;folderId?:string;path?:string}):Promise<File>{
  let file = files.get(video.id);let sourceCode:string|undefined;
  if (!file) {
    const handle = fileHandles.get(video.id);
    if (handle) {try{file = await handle.getFile();}catch(error){sourceCode=(error as Error).name;fileHandles.delete(video.id);}}
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
      } catch(error) {
        sourceCode=(error as Error).name;
        // The existing error below remains the clear recovery path if a file
        // moved or Windows revoked the folder permission.
      }
    }
  }
  if (!file) {
    throw Object.assign(new Error("This file is no longer available. Reconnect its source or review its verified identity."),{sourceCode});
  }
  return file;
}
