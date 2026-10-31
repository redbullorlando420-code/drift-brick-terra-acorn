import { yieldCatalogTask } from "../catalog-work.ts";
export type StorageInventory = {
  at: number;
  usage?: number;
  quota?: number;
  localKeys?: number;
  stores: Array<{ name: string; count: number; disposable: boolean }>;
};
type Receipt = { id: string; at: number; bytes: number };
export type ArtworkCleanupPreview = {
  id: string;
  at: number;
  count: number;
  estimatedBytes: number;
  limit: 256;
  inventory: StorageInventory;
};
const bytes = (thumb: unknown) =>
  typeof thumb === "string" ? thumb.length * 2 : thumb instanceof Blob ? thumb.size : 0;
const labels: Record<string, string> = {
  "thumb-cache": "Disposable artwork",
  videos: "Saved video catalog",
  dirs: "Approved folder handles",
  "source-health": "Source health",
  activity: "Personal state and tool documents",
  "activity-journal": "Watch activity events",
  "remote-cache": "Remote catalog, details and pending recovery",
};
/** Counts/estimates only. Personal values and full catalogs are never scanned. */
export function createStorageRecovery(open: () => Promise<IDBDatabase>, now = Date.now) {
  let plan: { preview: ArtworkCleanupPreview; rows: Receipt[] } | undefined;
  async function inventory(signal?: AbortSignal): Promise<StorageInventory> {
    signal?.throwIfAborted();
    const db = await open();
    let stores: StorageInventory["stores"];
    try {
      stores = await new Promise((resolve, reject) => {
        const names = Array.from(db.objectStoreNames).filter((name) => Object.hasOwn(labels, name)),
          tx = db.transaction(names),
          rows: StorageInventory["stores"] = [];
        for (const name of names) {
          const request = tx.objectStore(name).count();
          request.onsuccess = () =>
            rows.push({
              name: labels[name]!,
              count: request.result,
              disposable: name === "thumb-cache",
            });
        }
        tx.oncomplete = () => resolve(rows);
        tx.onerror = tx.onabort = () => reject(tx.error ?? Error("Storage inventory unavailable."));
      });
    } finally {
      db.close();
    }
    let estimate: StorageEstimate = {};
    try {
      estimate = (await navigator.storage?.estimate()) ?? {};
    } catch {
      /* Missing measurement stays unknown. */
    }
    let localKeys: number | undefined;
    try {
      localKeys = localStorage.length;
    } catch {
      /* Preferences remain protected. */
    }
    signal?.throwIfAborted();
    return {
      at: now(),
      stores,
      localKeys,
      ...(Number.isFinite(estimate.usage) && estimate.usage! >= 0 ? { usage: estimate.usage } : {}),
      ...(Number.isFinite(estimate.quota) && estimate.quota! > 0 ? { quota: estimate.quota } : {}),
    };
  }
  async function preview(signal?: AbortSignal): Promise<ArtworkCleanupPreview> {
    plan = undefined;
    const snapshot = await inventory(signal),
      db = await open(),
      rows: Receipt[] = [];
    let after: IDBValidKey | undefined;
    try {
      while (rows.length < 256) {
        signal?.throwIfAborted();
        const page = await new Promise<{
          keys: IDBValidKey[];
          values: Array<{ id: string; at: number; thumb: unknown }>;
        }>((resolve, reject) => {
          const tx = db.transaction("thumb-cache"),
            store = tx.objectStore("thumb-cache"),
            range = after === undefined ? undefined : IDBKeyRange.lowerBound(after, true),
            keys = store.getAllKeys(range, 16),
            values = store.getAll(range, 16);
          tx.oncomplete = () => resolve({ keys: keys.result, values: values.result });
          tx.onerror = tx.onabort = () => reject(tx.error ?? Error("Artwork preview unavailable."));
        });
        for (const row of page.values) {
          if (rows.length >= 256) break;
          if (typeof row.id === "string" && Number.isFinite(row.at))
            rows.push({ id: row.id, at: row.at, bytes: bytes(row.thumb) });
        }
        if (page.keys.length < 16) break;
        after = page.keys.at(-1);
        await yieldCatalogTask();
      }
    } finally {
      db.close();
    }
    signal?.throwIfAborted();
    const result: ArtworkCleanupPreview = {
      id: crypto.randomUUID(),
      at: now(),
      count: rows.length,
      estimatedBytes: rows.reduce((total, row) => total + row.bytes, 0),
      limit: 256,
      inventory: snapshot,
    };
    plan = { preview: result, rows };
    return result;
  }
  function cancel(id?: string) {
    if (!id || plan?.preview.id === id) plan = undefined;
  }
  async function clean(id: string) {
    const selected = plan;
    if (!selected || selected.preview.id !== id || now() - selected.preview.at > 5 * 60_000) {
      plan = undefined;
      throw Error("Artwork preview expired. Preview again before clearing.");
    }
    plan = undefined;
    const db = await open();
    let removed = 0,
      estimatedBytes = 0;
    try {
      for (let offset = 0; offset < selected.rows.length; offset += 16) {
        const batch = selected.rows.slice(offset, offset + 16);
        const result = await new Promise<{ removed: number; estimatedBytes: number }>(
          (resolve, reject) => {
            const tx = db.transaction("thumb-cache", "readwrite"),
              store = tx.objectStore("thumb-cache");
            let removed = 0,
              estimatedBytes = 0,
              failure: unknown;
            for (const receipt of batch) {
              const request = store.get(receipt.id);
              request.onsuccess = () => {
                try {
                  const row = request.result;
                  if (row && row.at === receipt.at && bytes(row.thumb) === receipt.bytes) {
                    store.delete(receipt.id);
                    removed++;
                    estimatedBytes += receipt.bytes;
                  }
                } catch (error) {
                  failure = error;
                  tx.abort();
                }
              };
            }
            tx.oncomplete = () => resolve({ removed, estimatedBytes });
            tx.onerror = tx.onabort = () =>
              reject(failure ?? tx.error ?? Error("Artwork cleanup was interrupted."));
          },
        );
        removed += result.removed;
        estimatedBytes += result.estimatedBytes;
        await yieldCatalogTask();
      }
    } catch (error) {
      throw Object.assign(
        new Error(
          "Artwork cleanup stopped. " +
            removed +
            " cache entries were removed; saved media and personal records are unchanged. Preview again to continue.",
        ),
        { cause: error, removed, estimatedBytes },
      );
    } finally {
      db.close();
    }
    return { removed, estimatedBytes, skipped: selected.rows.length - removed };
  }
  return { inventory, preview, cancel, clean };
}
