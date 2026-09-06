import { extensionOf } from "@/lib/utils";
import {
  isDriveName,
  isVideoFile,
  mimeFromName,
  shouldSkipDir,
  type LibraryVideo,
  type WellKnownStart,
} from "./types";
import { rememberFile, rememberFileHandle } from "./sources";

const MAX_DEPTH = 14;
const MAX_DRIVE_DEPTH = 12;

export type ScanProgress = {
  found: number;
  looked: number;
  folderName: string;
  current?: string;
};

export type ScanOpts = {
  onProgress?: (p: ScanProgress) => void;
  onBatch?: (videos: LibraryVideo[]) => void;
  signal?: AbortSignal;
  drive?: boolean;
};

function asOpts(
  arg?: ScanOpts | ((p: ScanProgress) => void),
): ScanOpts {
  if (typeof arg === "function") return { onProgress: arg };
  return arg ?? {};
}

function aborted(signal?: AbortSignal) {
  return Boolean(signal?.aborted);
}

async function yieldUi() {
  await new Promise<void>((r) => setTimeout(r, 0));
}

const BATCH_SIZE = 250;

function inferGenre(name: string): string | undefined {
  const text = name.toLowerCase();
  if (/\b(comedy|funny|standup|sitcom)\b/.test(text)) return "Comedy";
  if (/\b(horror|scary|slasher|ghost)\b/.test(text)) return "Horror";
  if (/\b(action|fight|battle|war)\b/.test(text)) return "Action";
  if (/\b(documentary|documentary|history|nature)\b/.test(text)) return "Documentary";
  if (/\b(sci[ .-]?fi|science fiction|space)\b/.test(text)) return "Science Fiction";
  return undefined;
}

function maybeFlush(
  acc: LibraryVideo[],
  flushed: { n: number },
  onBatch?: (videos: LibraryVideo[]) => void,
  force = false,
) {
  if (!onBatch) return;
  if (!force && acc.length - flushed.n < BATCH_SIZE) return;
  if (acc.length <= flushed.n) return;
  onBatch(acc.slice(flushed.n));
  flushed.n = acc.length;
}

function throttleProgress(
  opts: ScanOpts,
  state: { lastAt: number; lastFound: number },
  progress: ScanProgress,
) {
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (
    progress.found - state.lastFound < 40 &&
    now - state.lastAt < 150 &&
    progress.found % 200 !== 0
  ) {
    return;
  }
  state.lastAt = now;
  state.lastFound = progress.found;
  opts.onProgress?.(progress);
}

export async function ingestDirectoryHandle(
  dir: FileSystemDirectoryHandle,
  folderId: string,
  arg?: ScanOpts | ((p: ScanProgress) => void),
): Promise<LibraryVideo[]> {
  const opts = asOpts(arg);
  const acc: LibraryVideo[] = [];
  const flushed = { n: 0 };
  const drive = opts.drive ?? isDriveName(dir.name);
  await walkHandle(dir, "", folderId, acc, dir.name, opts, flushed, 0, drive);
  if (opts.onBatch && acc.length > flushed.n) opts.onBatch(acc.slice(flushed.n));
  return acc;
}

async function walkHandle(
  dir: FileSystemDirectoryHandle,
  prefix: string,
  folderId: string,
  acc: LibraryVideo[],
  folderName: string,
  opts: ScanOpts,
  flushed: { n: number },
  depth: number,
  drive: boolean,
  progressState: { lastAt: number; lastFound: number } = { lastAt: 0, lastFound: 0 },
): Promise<void> {
  const maxDepth = drive ? MAX_DRIVE_DEPTH : MAX_DEPTH;
  if (depth > maxDepth || aborted(opts.signal)) return;

  const iterable = dir as FileSystemDirectoryHandle & {
    entries?: () => AsyncIterableIterator<[string, FileSystemHandle]>;
  };
  if (typeof iterable.entries !== "function") return;

  let looked = 0;
  for await (const [name, handle] of iterable.entries()) {
    if (aborted(opts.signal)) return;
    looked += 1;
    if (handle.kind === "directory") {
      if (shouldSkipDir(name)) continue;
      await walkHandle(
        handle as FileSystemDirectoryHandle,
        `${prefix}${name}/`,
        folderId,
        acc,
        folderName,
        opts,
        flushed,
        depth + 1,
        drive,
        progressState,
      );
    } else if (handle.kind === "file" && isVideoFile(name)) {
      try {
        const fileHandle = handle as FileSystemFileHandle;
        const file = await fileHandle.getFile();
        pushVideo(acc, folderId, prefix + name, file, fileHandle);
        throttleProgress(opts, progressState, {
          found: acc.length,
          looked,
          folderName,
          current: prefix + name,
        });
        maybeFlush(acc, flushed, opts.onBatch);
        if (acc.length % 20 === 0) await yieldUi();
      } catch {
        // skip unreadable
      }
    } else if (looked % 200 === 0) {
      throttleProgress(opts, progressState, {
        found: acc.length,
        looked,
        folderName,
        current: prefix + name,
      });
      await yieldUi();
    }
  }
}

export async function ingestFileList(
  list: FileList | File[],
  folderId: string,
  folderName: string,
  arg?: ScanOpts | ((p: ScanProgress) => void),
): Promise<LibraryVideo[]> {
  const opts = asOpts(arg);
  const files = Array.from(list);
  const acc: LibraryVideo[] = [];
  const flushed = { n: 0 };
  let looked = 0;
  const progressState = { lastAt: 0, lastFound: 0 };
  for (const file of files) {
    if (aborted(opts.signal)) break;
    looked += 1;
    const rel =
      "webkitRelativePath" in file && file.webkitRelativePath
        ? file.webkitRelativePath
        : file.name;
    const parts = rel.split("/").filter(Boolean);
    if (parts.some((p, i) => i < parts.length - 1 && shouldSkipDir(p))) continue;
    if (!isVideoFile(file.name, file.type)) continue;
    pushVideo(acc, folderId, rel, file);
    throttleProgress(opts, progressState, {
      found: acc.length,
      looked,
      folderName,
      current: rel,
    });
    maybeFlush(acc, flushed, opts.onBatch);
    if (acc.length % 20 === 0) await yieldUi();
  }
  if (opts.onBatch && acc.length > flushed.n) opts.onBatch(acc.slice(flushed.n));
  return acc;
}

type FsEntry = {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
};

type FsFileEntry = FsEntry & {
  file: (ok: (f: File) => void, err?: (e: DOMException) => void) => void;
};

type FsDirReader = {
  readEntries: (
    ok: (entries: FsEntry[]) => void,
    err?: (e: DOMException) => void,
  ) => void;
};

type FsDirEntry = FsEntry & {
  createReader: () => FsDirReader;
};

function readAllEntries(reader: FsDirReader): Promise<FsEntry[]> {
  return new Promise((resolve, reject) => {
    const out: FsEntry[] = [];
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

function entryFile(entry: FsFileEntry): Promise<File> {
  return new Promise((resolve, reject) => entry.file(resolve, reject));
}

export async function ingestDataTransfer(
  dt: DataTransfer,
  folderId: string,
  folderName: string,
  arg?: ScanOpts | ((p: ScanProgress) => void),
): Promise<LibraryVideo[]> {
  const opts = asOpts(arg);
  const acc: LibraryVideo[] = [];
  const flushed = { n: 0 };
  const items = dt.items;
  const entries: FsEntry[] = [];

  if (items && items.length) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const getter = (
        item as DataTransferItem & {
          webkitGetAsEntry?: () => FsEntry | null;
        }
      ).webkitGetAsEntry;
      const entry = getter?.call(item) ?? null;
      if (entry) entries.push(entry);
    }
  }

  if (entries.length) {
    for (const entry of entries) {
      await walkEntry(entry, "", folderId, acc, folderName, opts, flushed, 0);
    }
    if (opts.onBatch && acc.length > flushed.n) opts.onBatch(acc.slice(flushed.n));
    if (acc.length) return acc;
  }

  if (dt.files?.length) {
    return ingestFileList(dt.files, folderId, folderName, opts);
  }
  return acc;
}

async function walkEntry(
  entry: FsEntry,
  prefix: string,
  folderId: string,
  acc: LibraryVideo[],
  folderName: string,
  opts: ScanOpts,
  flushed: { n: number },
  depth: number,
): Promise<void> {
  if (depth > MAX_DEPTH || aborted(opts.signal)) return;
  if (entry.isDirectory) {
    if (shouldSkipDir(entry.name)) return;
    const dir = entry as FsDirEntry;
    const children = await readAllEntries(dir.createReader());
    const nextPrefix = prefix ? `${prefix}${entry.name}/` : "";
    for (const child of children) {
      await walkEntry(child, nextPrefix, folderId, acc, folderName, opts, flushed, depth + 1);
    }
    return;
  }
  if (entry.isFile && isVideoFile(entry.name)) {
    try {
      const file = await entryFile(entry as FsFileEntry);
      const rel = prefix ? `${prefix}${entry.name}` : entry.name;
      pushVideo(acc, folderId, rel, file);
      if (acc.length % 40 === 0 || acc.length < 5) {
        opts.onProgress?.({ found: acc.length, looked: acc.length, folderName, current: rel });
      }
      maybeFlush(acc, flushed, opts.onBatch);
      if (acc.length % 20 === 0) await yieldUi();
    } catch {
      // skip
    }
  }
}

function pushVideo(
  acc: LibraryVideo[],
  folderId: string,
  relPath: string,
  file: File,
  handle?: FileSystemFileHandle,
) {
  const name = file.name;
  const id = `${folderId}:${relPath}`;
  // Keep File blobs only when we lack a durable handle (webkitdirectory / FileList).
  if (handle) rememberFileHandle(id, handle);
  else rememberFile(id, file);
  acc.push({
    id,
    folderId,
    name,
    path: relPath,
    extension: extensionOf(name),
    mime: file.type || mimeFromName(name),
    size: file.size,
    addedAt: Date.now(),
    genre: inferGenre(`${relPath} ${name}`),
  });
}

export async function pickDirectory(
  startIn?: WellKnownStart | "drive",
): Promise<FileSystemDirectoryHandle | "fallback" | "abort"> {
  if (typeof window === "undefined") return "fallback";
  const picker = (
    window as unknown as {
      showDirectoryPicker?: (options?: {
        id?: string;
        mode?: "read" | "readwrite";
        startIn?: FileSystemHandle | WellKnownStart;
      }) => Promise<FileSystemDirectoryHandle>;
    }
  ).showDirectoryPicker;
  if (typeof picker !== "function") return "fallback";
  try {
    if (startIn === "drive") {
      return await picker({
        id: "reelcase-drive",
        mode: "read",
      });
    }
    return await picker({
      id: startIn ? `reelcase-${startIn}` : "reelcase-videos",
      mode: "read",
      startIn: startIn ?? "videos",
    });
  } catch (err) {
    const name = (err as DOMException | undefined)?.name;
    if (name === "AbortError") return "abort";
    return "fallback";
  }
}

type Permish = {
  queryPermission?: (d?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>;
  requestPermission?: (d?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>;
};

export async function queryDirPermission(
  handle: FileSystemDirectoryHandle,
): Promise<PermissionState> {
  const h = handle as FileSystemDirectoryHandle & Permish;
  if (typeof h.queryPermission !== "function") return "granted";
  return h.queryPermission({ mode: "read" });
}

export async function requestDirPermission(
  handle: FileSystemDirectoryHandle,
): Promise<boolean> {
  const h = handle as FileSystemDirectoryHandle & Permish;
  if (typeof h.queryPermission !== "function") return true;
  const current = await h.queryPermission({ mode: "read" });
  if (current === "granted") return true;
  if (typeof h.requestPermission !== "function") return false;
  const next = await h.requestPermission({ mode: "read" });
  return next === "granted";
}
