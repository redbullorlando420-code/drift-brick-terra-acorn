import { recipeDocument, type RecipeContent } from "./studio-recipes.ts";
import type { StudioImage } from "./studio-session";

export const STUDIO_OUTPUT_LIMITS = {
  previewBytes: 10 * 1024 ** 2,
  saved: 32,
  savedBytes: 128 * 1024 ** 2,
} as const;
export type StudioOutput = RecipeContent & {
  id: string;
  savedAt: number;
  bytes: number;
  seconds: number;
  seed?: number;
};
type Ledger = { version: 1; rows: StudioOutput[] };
const validId = (id: unknown): id is string => typeof id === "string" && /^[\w:-]{1,100}$/.test(id);
function readLedger(raw: unknown): Ledger {
  if (raw === undefined) return { version: 1, rows: [] };
  const value = raw as Ledger;
  if (
    !value ||
    value.version !== 1 ||
    !Array.isArray(value.rows) ||
    value.rows.length > STUDIO_OUTPUT_LIMITS.saved
  )
    throw Error("Unsupported saved image index. Existing images were retained.");
  const seen = new Set<string>();
  const rows = value.rows.map((row) => {
    if (
      !row ||
      !validId(row.id) ||
      seen.has(row.id) ||
      !Number.isSafeInteger(row.savedAt) ||
      row.savedAt < 0 ||
      !Number.isSafeInteger(row.bytes) ||
      row.bytes < 8 ||
      row.bytes > STUDIO_OUTPUT_LIMITS.previewBytes ||
      !Number.isFinite(row.seconds) ||
      row.seconds < 0
    )
      throw Error("Saved image index is unreadable. Existing images were retained.");
    seen.add(row.id);
    const { format: _format, version: _version, ...recipe } = recipeDocument(row);
    return {
      ...recipe,
      id: row.id,
      savedAt: row.savedAt,
      bytes: row.bytes,
      seconds: row.seconds,
      ...(Number.isSafeInteger(row.seed) && row.seed! >= 0 ? { seed: row.seed } : {}),
    };
  });
  if (rows.reduce((sum, row) => sum + row.bytes, 0) > STUDIO_OUTPUT_LIMITS.savedBytes)
    throw Error("Saved image index exceeds its declared budget.");
  return { version: 1, rows };
}
/** The ledger and selected PNG commit together. A read never loads other saved image bytes.
 * Read-modify-write stays in one IDB transaction so concurrent tabs cannot overrun the budget. */
export function createStudioOutputs(open: () => Promise<IDBDatabase>, owner: string) {
  if (!owner || owner.length > 512) throw Error("A current app user is required.");
  const prefix = "studio-outputs:v1:" + encodeURIComponent(owner) + ":",
    key = prefix + "index";
  async function transaction<T>(
    mode: IDBTransactionMode,
    run: (store: IDBObjectStore, done: (value: T) => void, fail: (error: unknown) => void) => void,
  ) {
    const db = await open();
    try {
      return await new Promise<T>((resolve, reject) => {
        const tx = db.transaction("activity", mode),
          store = tx.objectStore("activity");
        let value: T, cause: unknown;
        tx.oncomplete = () => resolve(value);
        tx.onabort = tx.onerror = () =>
          reject(
            cause ??
              tx.error ??
              Error("Saved image storage failed. Previous saved images were retained."),
          );
        run(
          store,
          (result) => {
            value = result;
          },
          (error) => {
            cause = error;
            tx.abort();
          },
        );
      });
    } finally {
      db.close();
    }
  }
  async function list() {
    return transaction<StudioOutput[]>("readonly", (store, done, fail) => {
      const request = store.get(key);
      request.onsuccess = () => {
        try {
          done(readLedger(request.result).rows);
        } catch (error) {
          fail(error);
        }
      };
    });
  }
  async function save(image: StudioImage) {
    if (
      !validId(image.id) ||
      image.blob.type !== "image/png" ||
      image.blob.size > STUDIO_OUTPUT_LIMITS.previewBytes
    )
      throw Error("Choose a generated PNG within the 10 MiB preview budget.");
    const signature = new Uint8Array(await image.blob.slice(0, 8).arrayBuffer());
    if (signature.join(",") !== "137,80,78,71,13,10,26,10")
      throw Error("The generated file is not a PNG.");
    const {
      format: _format,
      version: _version,
      ...recipe
    } = recipeDocument({
      name: image.settings.prompt.slice(0, 80),
      settings: image.settings,
      checkpoint: image.checkpoint,
      provenance: image.provenance,
    });
    const row: StudioOutput = {
      ...recipe,
      id: image.id,
      savedAt: Date.now(),
      bytes: image.blob.size,
      seconds: image.seconds,
      ...(image.seed !== undefined ? { seed: image.seed } : {}),
    };
    return transaction<StudioOutput[]>("readwrite", (store, done, fail) => {
      const request = store.get(key);
      request.onsuccess = () => {
        try {
          const current = readLedger(request.result),
            existing = current.rows.find((item) => item.id === row.id);
          if (existing) {
            done(current.rows);
            return;
          }
          if (
            current.rows.length >= STUDIO_OUTPUT_LIMITS.saved ||
            current.rows.reduce((sum, item) => sum + item.bytes, 0) + row.bytes >
              STUDIO_OUTPUT_LIMITS.savedBytes
          )
            throw Error(
              "Saved image storage is full (32 images / 128 MiB). Download and explicitly remove a saved image before saving another.",
            );
          const rows = readLedger({ version: 1, rows: [row, ...current.rows] }).rows;
          store.put(image.blob, prefix + "png:" + row.id);
          store.put({ version: 1, rows }, key);
          done(rows);
        } catch (error) {
          fail(error);
        }
      };
    });
  }
  async function load(id: string) {
    if (!validId(id)) throw Error("Invalid saved image.");
    const blob = await transaction<Blob | undefined>("readonly", (store, done, fail) => {
      const request = store.get(prefix + "png:" + id);
      request.onsuccess = () => {
        const blob = request.result;
        done(
          blob instanceof Blob &&
            blob.type === "image/png" &&
            blob.size <= STUDIO_OUTPUT_LIMITS.previewBytes
            ? blob
            : undefined,
        );
      };
    });
    if (!blob || blob.size < 8) return;
    const signature = new Uint8Array(await blob.slice(0, 8).arrayBuffer());
    if (signature.join(",") !== "137,80,78,71,13,10,26,10")
      throw Error("Saved PNG is unreadable. Its receipt and settings were retained.");
    return blob;
  }
  async function remove(id: string) {
    if (!validId(id)) throw Error("Invalid saved image.");
    return transaction<StudioOutput[]>("readwrite", (store, done, fail) => {
      const request = store.get(key);
      request.onsuccess = () => {
        try {
          const current = readLedger(request.result),
            rows = current.rows.filter((row) => row.id !== id);
          store.delete(prefix + "png:" + id);
          store.put({ version: 1, rows }, key);
          done(rows);
        } catch (error) {
          fail(error);
        }
      };
    });
  }
  return { list, save, load, remove };
}
