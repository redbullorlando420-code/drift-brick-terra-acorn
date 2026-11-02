import { sha256 } from "@noble/hashes/sha2.js";
// A single inspection owns this worker. The caller terminates it on completion,
// cancellation or navigation; neither media bytes nor worker URLs are retained.
self.onmessage = async ({ data }: MessageEvent<{ id: string; file: File }>) => {
  try {
    const { file, id } = data;
    if (!(file instanceof Blob) || typeof id !== "string")
      throw Error("Choose a readable local file.");
    const hash = sha256.create(),
      chunk = 1024 * 1024;
    let last = 0;
    for (let offset = 0; offset < file.size; offset += chunk) {
      hash.update(
        new Uint8Array(await file.slice(offset, Math.min(file.size, offset + chunk)).arrayBuffer()),
      );
      if (performance.now() - last > 250) {
        last = performance.now();
        self.postMessage({ id, progress: Math.min(file.size, offset + chunk) });
      }
    }
    const digest = Array.from(hash.digest(), (byte) => byte.toString(16).padStart(2, "0")).join("");
    self.postMessage({ id, digest, size: file.size, lastModified: file.lastModified });
  } catch (e) {
    self.postMessage({
      id: data.id,
      error: e instanceof Error ? e.message : "The selected file could not be fingerprinted.",
    });
  }
};
