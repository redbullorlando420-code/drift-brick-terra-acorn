import {
  PROFILE_PREFIX,
  PROFILE_SELECTION_KEY,
  profileDatabaseName,
  validProfileId,
} from "./local-profile-storage.ts";
import { artworkBytes } from "./videos/binary-artwork.ts";

type Payload = { records: number; bytes: number; complete: boolean };
export type ProfileBudget = {
  preferences?: number;
  metadataRecords?: number;
  artwork?: Payload;
  prints?: Payload;
  origin?: { usage?: number; quota?: number };
  issues: string[];
};
const ARTWORK_SAMPLE = 256,
  PRINT_SAMPLE = 64;
const appKey = /^(?:reelcase|realhub)[.:_-]/;
export function countProfileKeys(storage: Pick<Storage, "length" | "key">, id: string) {
  const prefix = PROFILE_PREFIX + id + ":";
  let keys = 0;
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (
      key &&
      (id === "default"
        ? appKey.test(key) && key !== PROFILE_SELECTION_KEY && !key.startsWith(PROFILE_PREFIX)
        : key.startsWith(prefix))
    )
      keys++;
  }
  return keys;
}
const finiteBytes = (bytes: unknown) =>
  typeof bytes === "number" && Number.isFinite(bytes) && bytes >= 0 ? bytes : undefined;
const empty = (): Payload => ({ records: 0, bytes: 0, complete: true });

/** Open only an enumerated database, and abort if it disappeared or needs creation. */
function openExisting(
  factory: IDBFactory,
  name: string,
  signal: AbortSignal,
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted();
    const request = factory.open(name);
    let settled = false;
    const fail = (cause: unknown) => {
      if (!settled) {
        settled = true;
        finish();
        reject(cause);
      }
    };
    const abort = () => fail(signal.reason);
    signal.addEventListener("abort", abort, { once: true });
    const finish = () => signal.removeEventListener("abort", abort);
    request.onupgradeneeded = () => {
      request.transaction?.abort();
    };
    request.onsuccess = () => {
      finish();
      if (settled || signal.aborted) request.result.close();
      else {
        settled = true;
        resolve(request.result);
      }
    };
    request.onerror = () => fail(request.error);
    request.onblocked = () => fail(Error("A database is busy."));
  });
}
function untilAbort<T>(task: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted();
    const stop = () => reject(signal.reason);
    signal.addEventListener("abort", stop, { once: true });
    void task.then(resolve, reject).finally(() => signal.removeEventListener("abort", stop));
  });
}

function count(db: IDBDatabase, stores: string[], signal: AbortSignal) {
  if (!stores.length) return Promise.resolve(0);
  return new Promise<number>((resolve, reject) => {
    signal.throwIfAborted();
    const tx = db.transaction(stores, "readonly");
    let total = 0;
    const stop = () => {
      try {
        tx.abort();
      } catch {}
    };
    signal.addEventListener("abort", stop, { once: true });
    for (const store of stores) {
      const request = tx.objectStore(store).count();
      request.onsuccess = () => {
        total += request.result;
      };
    }
    tx.oncomplete = () => {
      signal.removeEventListener("abort", stop);
      resolve(total);
    };
    tx.onabort = () => {
      signal.removeEventListener("abort", stop);
      reject(tx.error ?? signal.reason);
    };
  });
}

function payload(
  db: IDBDatabase,
  store: string,
  limit: number,
  bytesFor: (row: unknown) => number | undefined,
  signal: AbortSignal,
) {
  if (!db.objectStoreNames.contains(store)) return Promise.resolve(undefined);
  return new Promise<Payload>((resolve, reject) => {
    signal.throwIfAborted();
    const tx = db.transaction(store, "readonly"),
      bucket = tx.objectStore(store);
    const total = bucket.count(),
      rows = bucket.openCursor();
    let bytes = 0,
      visited = 0,
      valid = true;
    const stop = () => {
      try {
        tx.abort();
      } catch {}
    };
    signal.addEventListener("abort", stop, { once: true });
    rows.onsuccess = () => {
      const cursor = rows.result;
      if (!cursor) return;
      visited++;
      const size = bytesFor(cursor.value);
      if (size === undefined) valid = false;
      else bytes += size;
      if (visited < limit) cursor.continue();
    };
    tx.oncomplete = () => {
      signal.removeEventListener("abort", stop);
      resolve({ records: total.result, bytes, complete: valid && visited === total.result });
    };
    tx.onabort = () => {
      signal.removeEventListener("abort", stop);
      reject(tx.error ?? signal.reason);
    };
  });
}

export async function measureProfileBudget(
  id: string,
  cancelled?: AbortSignal,
): Promise<ProfileBudget> {
  if (!validProfileId(id)) throw Error("That profile is unavailable.");
  const timeout = AbortSignal.timeout(8000),
    signal = cancelled ? AbortSignal.any([cancelled, timeout]) : timeout;
  const result: ProfileBudget = { issues: [] };
  try {
    result.preferences = countProfileKeys(globalThis.localStorage, id);
  } catch {
    result.issues.push("Browser setting counts are unavailable.");
  }
  const quota = (async () => {
    try {
      const evidence = await globalThis.navigator?.storage?.estimate?.();
      if (!evidence) return;
      const usage = finiteBytes(evidence.usage),
        quota = finiteBytes(evidence.quota);
      if (usage !== undefined || quota !== undefined) result.origin = { usage, quota };
    } catch {
      /* The origin estimate is optional and never used as profile evidence. */
    }
  })();
  const factory = globalThis.indexedDB;
  try {
    if (typeof factory?.databases !== "function") throw Error("Unavailable");
    const names = new Set((await untilAbort(factory.databases(), signal)).map((row) => row.name));
    for (const base of ["reelcase", "reelcase-prints"] as const) {
      signal.throwIfAborted();
      const name = profileDatabaseName(base, id),
        library = base === "reelcase";
      if (!names.has(name)) {
        if (library) {
          result.metadataRecords = 0;
          result.artwork = empty();
        } else result.prints = empty();
        continue;
      }
      let db: IDBDatabase | undefined;
      try {
        db = await openExisting(factory, name, signal);
        if (library) {
          const stores = ["videos", "activity", "activity-journal", "dirs", "source-health"].filter(
            (store) => db!.objectStoreNames.contains(store),
          );
          result.metadataRecords = await count(db, stores, signal);
          result.artwork = await payload(
            db,
            "thumb-cache",
            ARTWORK_SAMPLE,
            (row) => {
              const thumb = (row as { thumb?: unknown })?.thumb;
              if (thumb instanceof Blob) return thumb.size;
              if (typeof thumb === "string") return artworkBytes(thumb);
            },
            signal,
          );
        } else
          result.prints = await payload(
            db,
            "blobs",
            PRINT_SAMPLE,
            (row) => {
              const blob = (row as { blob?: unknown })?.blob;
              return blob instanceof Blob ? blob.size : undefined;
            },
            signal,
          );
      } catch {
        result.issues.push(
          library
            ? "Some library measurements are unavailable."
            : "Print file measurements are unavailable.",
        );
      } finally {
        db?.close();
      }
    }
  } catch {
    result.issues.push(
      "This browser could not enumerate saved databases. No missing database was opened.",
    );
  }
  // An unresponsive optional quota API cannot hold a profile selection open.
  await untilAbort(quota, signal).catch(() => {});
  cancelled?.throwIfAborted();
  return result;
}
