export type FileFingerprint = {
  version: 1;
  algorithm: "sha256";
  digest: string;
  size: number;
  lastModified: number;
  at: number;
};
export function validFileFingerprint(value: unknown): value is FileFingerprint {
  const f = value as FileFingerprint;
  return (
    !!f &&
    f.version === 1 &&
    f.algorithm === "sha256" &&
    typeof f.digest === "string" &&
    /^[a-f0-9]{64}$/.test(f.digest) &&
    Number.isSafeInteger(f.size) &&
    f.size >= 0 &&
    Number.isFinite(f.lastModified) &&
    f.lastModified >= 0 &&
    Number.isFinite(f.at) &&
    f.at >= 0
  );
}
export function sameFileFingerprint(a: FileFingerprint, b: FileFingerprint) {
  return (
    validFileFingerprint(a) && validFileFingerprint(b) && a.size === b.size && a.digest === b.digest
  );
}
const verifiedFiles = new WeakMap<Blob, FileFingerprint>();
let activeWorkers = 0;
export function fingerprintFile(
  file: File,
  signal: AbortSignal,
  progress?: (done: number, total: number) => void,
): Promise<FileFingerprint> {
  const cached = verifiedFiles.get(file);
  if (cached && !signal.aborted && Date.now() >= cached.at && Date.now() - cached.at < 60_000)
    return Promise.resolve(cached);
  signal.throwIfAborted();
  if (typeof Worker === "undefined")
    return Promise.reject(
      Error("This browser needs worker support to verify a file without blocking playback."),
    );
  if (activeWorkers >= 2)
    return Promise.reject(
      Error("Two file inspections are already running. Finish or cancel one before retrying."),
    );
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./file-fingerprint.worker.ts", import.meta.url), {
        type: "module",
      }),
      id = "file-fingerprint";
    activeWorkers++;
    let settled = false;
    const timeout = setTimeout(() => {
      done();
      reject(Error("File inspection timed out. No mapping changed."));
    }, 10 * 60_000);
    const done = () => {
      if (settled) return;
      settled = true;
      activeWorkers--;
      clearTimeout(timeout);
      worker.terminate();
      signal.removeEventListener("abort", abort);
    };
    const abort = () => {
      done();
      reject(new DOMException("File inspection cancelled. No mapping changed.", "AbortError"));
    };
    signal.addEventListener("abort", abort, { once: true });
    worker.onerror = () => {
      done();
      reject(Error("The file-inspection worker stopped. No mapping changed."));
    };
    worker.onmessage = ({ data }) => {
      if (data.id !== id) return;
      if (data.error) {
        done();
        reject(Error(String(data.error)));
        return;
      }
      if (typeof data.digest === "string") {
        done();
        const value: FileFingerprint = {
          version: 1,
          algorithm: "sha256",
          digest: data.digest,
          size: data.size,
          lastModified: data.lastModified,
          at: Date.now(),
        };
        if (!validFileFingerprint(value) || value.size !== file.size) {
          reject(Error("The file changed during inspection. Select it again."));
          return;
        }
        verifiedFiles.set(file, value);
        progress?.(file.size, file.size);
        resolve(value);
      } else if (Number.isFinite(data.progress)) progress?.(data.progress, file.size);
    };
    if (signal.aborted) {
      abort();
      return;
    }
    try {
      worker.postMessage({ id, file });
    } catch (error) {
      done();
      reject(error);
    }
  });
}
