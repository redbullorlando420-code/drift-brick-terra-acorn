import type { WriterLease } from '../writer-lease.ts';
import { withCatalogDetails } from "./catalog-card.ts";
import {
  cleanupKey,
  normalizeYoutubeCleanup,
  retiredYoutubeKeys,
  type YoutubeCleanupJournal,
} from "./youtube-cleanup.ts";
import { patchSparseRecord } from "../sparse-record.ts";
import { yieldCatalogTask } from "../catalog-work.ts";
import type { LibraryVideo, Folder, VideoMetadataProvenance } from "./types";
import type { EnrichmentRow } from "./enrichment-batch";

export const CATALOG_OPERATION_PREFIX = "catalog-operation:";
export const CATALOG_CONTROL_KEY = "catalog-operation-control";
export const CATALOG_EDIT_PREFIX = "catalog-metadata:";
export const CATALOG_EDIT_MIRROR = "reelcase.catalog-edits.v1";
export const CATALOG_OPERATION_LIMITS = {
  rows: 64,
  pending: 8,
  bytes: 8 * 1024 ** 2,
  mirror: 256,
} as const;
export type CatalogEdit = EnrichmentRow & {
  category?: string;
  field?: "tags" | "category";
  nonce: string;
  at: number;
};
export type CatalogOperation = {
  version: 1;
  kind: "remote" | "local" | "cleanup" | "edit";
  rows?: LibraryVideo[];
  enrichment?: EnrichmentRow[];
  meta?: { folders: Folder[]; checkedAt: number };
  complete?: boolean;
  removed?: string[];
  cleanup?: YoutubeCleanupJournal;
  edit?: CatalogEdit;
};
export type CatalogRecovery = {
  revision: number;
  phase: "idle" | "working" | "error";
  recovered: number;
  pending: number;
  error?: string;
  lastKind?: string;
};
let state: CatalogRecovery = { revision: 0, phase: "idle", recovered: 0, pending: 0 };
const listeners = new Set<() => void>();
export const catalogRecoverySnapshot = () => state;
export const subscribeCatalogRecovery = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
function publish(patch: Partial<CatalogRecovery>) {
  state = { ...state, ...patch, revision: state.revision + 1 };
  for (const listener of listeners) listener();
}
export function catalogSaveFailure(error: unknown) {
  const quota = error instanceof DOMException && error.name === "QuotaExceededError";
  const message = quota
    ? "Browser storage is full. Preview disposable artwork cleanup, then retry saved operations."
    : "Catalog changes need recovery. Existing saved data is retained; retry or review the recovery notes.";
  if (state.phase === "error" && state.error === message) return;
  publish({ phase: "error", error: message });
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("reelcase:save-error"));
}
function sized(value: unknown) {
  const stack = [value],
    seen = new Set<object>();
  let bytes = 0,
    nodes = 0;
  while (stack.length) {
    const item = stack.pop();
    if (++nodes > 300_000) throw Error("Catalog operation exceeds its metadata budget.");
    if (typeof item === "string") bytes += item.length * 2;
    else if (item && typeof item === "object") {
      if (seen.has(item)) continue;
      seen.add(item);
      if (item instanceof Blob) bytes += item.size;
      else
        for (const [key, value] of Object.entries(item)) {
          bytes += key.length * 2;
          stack.push(value);
        }
    } else if (typeof item === "function" || typeof item === "symbol")
      throw Error("Catalog operation contains unsupported metadata.");
    else bytes += 8;
    if (bytes > CATALOG_OPERATION_LIMITS.bytes)
      throw Error("Catalog operation exceeds its metadata budget.");
  }
  return bytes;
}
const id = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0 && value.length <= 2048;
function validProvenance(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const row = value as VideoMetadataProvenance;
  return (
    !!row.tags &&
    typeof row.tags === "object" &&
    !Array.isArray(row.tags) &&
    Object.keys(row.tags).length <= 256 &&
    Object.values(row.tags).every((source) => typeof source === "string" && source.length <= 128) &&
    (!row.lockedFields ||
      (Array.isArray(row.lockedFields) &&
        row.lockedFields.every((field) => field === "tags" || field === "category"))) &&
    [row.updatedAt, row.manualTagsAt, row.manualCategoryAt].every(
      (at) => at === undefined || (Number.isFinite(at) && at >= 0),
    )
  );
}
export function validCatalogControl(value: unknown): boolean {
  if (value === undefined) return true;
  if (!value || typeof value !== "object") return false;
  const row = value as { version?: unknown; sequence?: unknown; committed?: unknown };
  return (
    row.version === 1 &&
    Number.isSafeInteger(row.sequence) &&
    Number(row.sequence) >= 0 &&
    (row.committed === undefined ||
      (Number.isSafeInteger(row.committed) && Number(row.committed) >= 0))
  );
}
export function validCatalogOperation(value: unknown): value is CatalogOperation {
  if (!value || typeof value !== "object") return false;
  const row = value as CatalogOperation;
  if (row.version !== 1 || !["remote", "local", "cleanup", "edit"].includes(row.kind)) return false;
  if (row.kind === "edit")
    return (
      !!row.edit &&
      id(row.edit.id) &&
      id(row.edit.nonce) &&
      Number.isFinite(row.edit.at) &&
      Array.isArray(row.edit.tags) &&
      row.edit.tags.length <= 256 &&
      row.edit.tags.every((tag) => typeof tag === "string" && tag.length <= 512) &&
      validProvenance(row.edit.provenance) &&
      (row.edit.field === undefined ||
        row.edit.field === "tags" ||
        row.edit.field === "category") &&
      (row.edit.category === undefined ||
        (typeof row.edit.category === "string" && row.edit.category.length <= 80))
    );
  if (row.kind === "cleanup")
    return (
      Array.isArray(row.removed) &&
      row.removed.length <= 1000 &&
      row.removed.every(id) &&
      !!row.cleanup &&
      Array.isArray(row.cleanup.recentKeys) &&
      row.cleanup.recentKeys.length <= 40_000
    );
  return (
    Array.isArray(row.rows) &&
    row.rows.length <= CATALOG_OPERATION_LIMITS.rows &&
    row.rows.every((video) => video && id(video.id) && id(video.folderId)) &&
    (!row.enrichment ||
      (row.enrichment.length <= 64 &&
        row.enrichment.every(
          (edit) =>
            id(edit.id) &&
            Array.isArray(edit.tags) &&
            edit.tags.length <= 256 &&
            edit.tags.every((tag) => typeof tag === "string" && tag.length <= 512) &&
            validProvenance(edit.provenance),
        ))) &&
    (!row.meta ||
      (Array.isArray(row.meta.folders) &&
        row.meta.folders.length <= 20_000 &&
        Number.isFinite(row.meta.checkedAt)))
  );
}
function pendingRange() {
  return IDBKeyRange.bound(CATALOG_OPERATION_PREFIX, CATALOG_OPERATION_PREFIX + "\uffff");
}
function transaction<T>(
  db: IDBDatabase,
  stores: string[],
  body: (tx: IDBTransaction, done: (value: T) => void, fail: (error: unknown) => void) => void,
): Promise<T> {
  return new Promise((resolve, reject) => {
    let tx:IDBTransaction;
    try{tx=db.transaction(stores,"readwrite",{durability:"strict"});}
    catch(error){if(!(error instanceof TypeError))throw error;tx=db.transaction(stores,"readwrite");}
    let value: T;
    let failure: unknown;
    tx.oncomplete = () => resolve(value);
    tx.onerror = tx.onabort = () =>
      reject(failure ?? tx.error ?? new Error("Catalog transaction interrupted."));
    try {
      body(
        tx,
        (next) => {
          value = next;
        },
        (error) => {
          failure = error;
          tx.abort();
        },
      );
    } catch (error) {
      try {
        tx.abort();
      } finally {
        reject(error);
      }
    }
  });
}

/** Only pending journal records are walked. Payloads are bounded deltas, never a
 * duplicate catalog. Apply, metadata and commit marker share one transaction. */
export function createCatalogMutations(open: () => Promise<IDBDatabase>, writer?:WriterLease) {
  function ownedTransaction<T>(db:IDBDatabase,stores:string[],body:(tx:IDBTransaction,done:(value:T)=>void,fail:(error:unknown)=>void)=>void,dirty=true){
    return transaction<T>(db,stores,(tx,done,fail)=>{const token=writer?.current();if(writer){if(!token){fail(Error('Catalog writer lease is required.'));return;}writer.guard(tx,token,()=>body(tx,done,fail),fail,dirty);}else body(tx,done,fail);});
  }
  let recovering: Promise<void> | undefined;
  const memoryEdits = new Map<string, CatalogEdit>();
  function readLocalMirror(): CatalogEdit[] {
    let text: string | null;
    try {
      text = localStorage.getItem(CATALOG_EDIT_MIRROR);
    } catch {
      text = null;
    }
    if (!text) return [];
    if (text.length > 4 * 1024 ** 2) throw Error("Manual edit recovery exceeds its budget.");
    const value = JSON.parse(text);
    if (
      value.version !== 1 ||
      !Array.isArray(value.edits) ||
      value.edits.length > 256 ||
      !value.edits.every((edit: CatalogEdit) =>
        validCatalogOperation({ version: 1, kind: "edit", edit }),
      )
    )
      throw Error("Unknown or damaged manual edit recovery; original records were preserved.");
    return value.edits;
  }
  function readMirror(): CatalogEdit[] {
    const rows = new Map<string, CatalogEdit>(readLocalMirror().map((row) => [row.id, row]));
    for (const [id, row] of memoryEdits) if ((rows.get(id)?.at ?? 0) <= row.at) rows.set(id, row);
    return [...rows.values()];
  }
  function mirror(rows: CatalogEdit[]) {
    if (rows.length) {
      const text = JSON.stringify({ version: 1, edits: rows });
      if (rows.length > 256 || text.length > 4 * 1024 ** 2)
        throw Error("Edit mirror budget reached.");
      localStorage.setItem(CATALOG_EDIT_MIRROR, text);
    } else localStorage.removeItem(CATALOG_EDIT_MIRROR);
  }
  async function stage(operation: CatalogOperation) {
    if (!validCatalogOperation(operation)) throw Error("Invalid or unsupported catalog operation.");
    sized(operation);
    const db = await open();
    try {
      await ownedTransaction<void>(db, ["remote-cache"], (tx, _done, fail) => {
        const remote = tx.objectStore("remote-cache"),
          control = remote.get(CATALOG_CONTROL_KEY),
          pending = remote.getAllKeys(pendingRange(), 9);
        pending.onsuccess = () => {
          try {
            if (!validCatalogControl(control.result))
              throw Error("Unknown catalog recovery version; records preserved.");
            if (pending.result.length >= 8)
              throw Error("Catalog recovery queue is full. Retry existing operations first.");
            const sequence = (control.result?.sequence ?? 0) + 1;
            if (!Number.isSafeInteger(sequence))
              throw Error("Catalog recovery sequence unavailable.");
            remote.put({ ...control.result, version: 1, sequence }, CATALOG_CONTROL_KEY);
            remote.put(operation, CATALOG_OPERATION_PREFIX + String(sequence).padStart(16, "0"));
          } catch (error) {
            fail(error);
          }
        };
      });
    } finally {
      db.close();
    }
  }
  async function applyNext(): Promise<boolean> {
    const db = await open();
    try {
      return await ownedTransaction<boolean>(
        db,
        ["remote-cache", "videos", "activity"],
        (tx, done, fail) => {
          const remote = tx.objectStore("remote-cache"),
            activity = tx.objectStore("activity"),
            videos = tx.objectStore("videos");
          const request = remote.openCursor(pendingRange());
          request.onsuccess = () => {
            const cursor = request.result;
            if (!cursor) {
              done(false);
              return;
            }
            const token=writer?.current();if(writer&&token)writer.touch(tx,token);
            const operation = cursor.value as CatalogOperation;
            if (!validCatalogOperation(operation) || operation.kind === "cleanup") {
              tx.abort();
              return;
            }
            const control = remote.get(CATALOG_CONTROL_KEY),
              cleanup = remote.get("youtube-cleanup");
            cleanup.onsuccess = () => {
              try {
                if (!control.result || !validCatalogControl(control.result))
                  throw Error("Unsupported recovery control.");
                const retired = retiredYoutubeKeys(normalizeYoutubeCleanup(cleanup.result));
                if (operation.kind === "edit") {
                  const edit = operation.edit!,
                    previous = activity.get(CATALOG_EDIT_PREFIX + edit.id);
                  previous.onsuccess = () => {
                    try {
                      if (
                        !previous.result ||
                        previous.result.at < edit.at ||
                        (previous.result.at === edit.at && previous.result.nonce !== edit.nonce)
                      ) {
                        const prior = previous.result as CatalogEdit | undefined;
                        activity.put(
                          {
                            ...edit,
                            category: edit.category ?? prior?.category,
                            provenance: {
                              ...edit.provenance,
                              manualTagsAt:
                                edit.provenance.manualTagsAt ?? prior?.provenance.manualTagsAt,
                              manualCategoryAt:
                                edit.provenance.manualCategoryAt ??
                                prior?.provenance.manualCategoryAt,
                            },
                          },
                          CATALOG_EDIT_PREFIX + edit.id,
                        );
                      }
                    } catch (error) {
                      fail(error);
                    }
                  };
                } else {
                  const target = operation.kind === "remote" ? remote : videos;
                  for (const video of operation.rows!) {
                    if (video.isSample || (video.remote && retired.has(cleanupKey(video))))
                      continue;
                    const key = operation.kind === "remote" ? "video:" + video.id : video.id,
                      previous = target.get(key);
                    previous.onsuccess = () => {
                      try {
                        target.put(
                          withCatalogDetails(video, previous.result),
                          keyPath(target, key),
                        );
                      } catch (error) {
                        fail(error);
                      }
                    };
                  }
                  for (const row of operation.enrichment ?? []) {
                    const manual = activity.get(CATALOG_EDIT_PREFIX + row.id),
                      previous = activity.get("metadata-enrichment:" + row.id);
                    previous.onsuccess = () => {
                      try {
                        if (
                          !manual.result?.provenance?.lockedFields?.includes("tags") &&
                          (!previous.result ||
                            (previous.result.provenance?.updatedAt ?? 0) <=
                              (row.provenance.updatedAt ?? 0))
                        )
                          activity.put(row, "metadata-enrichment:" + row.id);
                      } catch (error) {
                        fail(error);
                      }
                    };
                  }
                  if (operation.meta) remote.put(operation.meta, "meta");
                  if (operation.complete) remote.delete("snapshot");
                }
                remote.delete(cursor.primaryKey);
                remote.put(
                  {
                    ...control.result,
                    committed: (control.result.committed ?? 0) + 1,
                    lastKind: operation.kind,
                    at: Date.now(),
                  },
                  CATALOG_CONTROL_KEY,
                );
                done(true);
              } catch (error) {
                fail(error);
              }
            };
          };
        },
        false,
      );
    } finally {
      db.close();
    }
  }
  async function drain() {
    let count = 0;
    while (await applyNext()) {
      count++;
      writer?.markChanged();
      publish({ phase: "working", recovered: state.recovered + 1 });
      await yieldCatalogTask();
      if (count > 1024) throw Error("Recovery is still busy. Retry after current writers settle.");
    }
  }
  async function recoverInternal() {
    if (recovering) return recovering;
    recovering = (async () => {
      publish({ phase: "working", error: undefined });
      await drain();
      for (let pass = 0; pass < 8; pass++) {
        const pending = readMirror();
        if (!pending.length) {
          publish({ phase: "idle", pending: 0 });
          return;
        }
        publish({ pending: pending.length });
        for (const edit of pending) {
          await stage({ version: 1, kind: "edit", edit });
          await drain();
          const latest = readLocalMirror();
          try {
            const kept = latest.filter((row) => row.id !== edit.id || row.nonce !== edit.nonce);
            if (kept.length !== latest.length) mirror(kept);
            if (memoryEdits.get(edit.id)?.nonce === edit.nonce) memoryEdits.delete(edit.id);
          } catch {
            throw Error("The committed edit mirror could not be acknowledged. Retry safely.");
          }
        }
      }
      throw Error("New edits are still arriving. Retry after editing settles.");
    })()
      .catch((error) => {
        catalogSaveFailure(error);
        throw error;
      })
      .finally(() => {
        recovering = undefined;
      });
    return recovering;
  }
  async function commitCleanup(operation: CatalogOperation) {
    // Cleanup is already atomic. Its intent and marker stay in that same
    // transaction: an interrupted deletion rolls back instead of later deleting
    // a title the owner may have saved after the failed attempt.
    if (!validCatalogOperation(operation)) throw Error("Invalid cleanup operation.");
    sized(operation);
    const db = await open();
    try {
      await ownedTransaction<void>(db, ["remote-cache", "videos", "activity"], (tx, _done, fail) => {
        const remote = tx.objectStore("remote-cache"),
          control = remote.get(CATALOG_CONTROL_KEY);
        control.onsuccess = () => {
          try {
            if (!validCatalogControl(control.result)) throw Error("Unknown recovery control.");
            const sequence = (control.result?.sequence ?? 0) + 1,
              key = CATALOG_OPERATION_PREFIX + String(sequence).padStart(16, "0");
            remote.put(operation, key);
            for (const id of operation.removed!) {
              remote.delete("video:" + id);
              tx.objectStore("videos").delete(id);
              tx.objectStore("activity").delete("metadata-enrichment:" + id);
            }
            remote.put(operation.cleanup!, "youtube-cleanup");
            remote.delete(key);
            remote.put(
              {
                ...control.result,
                version: 1,
                sequence,
                committed: (control.result?.committed ?? 0) + 1,
                lastKind: "cleanup",
                at: Date.now(),
              },
              CATALOG_CONTROL_KEY,
            );
          } catch (error) {
            fail(error);
          }
        };
      });
    } finally {
      db.close();
    }
  }
  async function writeInternal(operation: CatalogOperation) {
    try {
      await recoverInternal();
      if (operation.kind === "cleanup") await commitCleanup(operation);
      else {
        await stage(operation);
        await drain();
      }
      publish({ phase: "idle", error: undefined, lastKind: operation.kind });
    } catch (error) {
      catalogSaveFailure(error);
      throw error;
    }
  }
  function edit(row: Omit<CatalogEdit, "nonce" | "at">) {
    let edits: CatalogEdit[];
    try {
      edits = readMirror();
    } catch (error) {
      catalogSaveFailure(error);
      return;
    }
    const previous = edits.find((value) => value.id === row.id),
      at = Math.max(Date.now(), (previous?.at ?? 0) + 1, row.provenance.updatedAt ?? 0,(row.provenance.manualTagsAt??0)+1,(row.provenance.manualCategoryAt??0)+1),
      edit: CatalogEdit = {
        ...row,
        nonce: crypto.randomUUID(),
        at,
        provenance: {
          ...row.provenance,
          updatedAt: at,
          ...(row.field === "category" ? { manualCategoryAt: at } : { manualTagsAt: at }),
        },
      };
    try {
      if (!validCatalogOperation({ version: 1, kind: "edit", edit }) || sized(edit) > 32 * 1024)
        throw Error("Manual metadata exceeds its recovery budget.");
    } catch (error) {
      catalogSaveFailure(error);
      return;
    }
    if (edits.length >= 256 && !previous) {
      catalogSaveFailure(Error("Pending edit limit reached."));
      return;
    }
    edits = edits.filter((value) => value.id !== row.id);
    edits.push(edit);
    try {
      mirror(edits);
    } catch {
      memoryEdits.set(edit.id, edit);
    }
    void recover().catch(() => {});
    return edit;
  }
  async function restore(base: {
    tags: Record<string, string[]>;
    metadataProvenance: Record<string, VideoMetadataProvenance>;
    categories: Record<string, string>;
  }) {
    let result = base,
      after: string | undefined;
    const admit = (edit: CatalogEdit) => {
      if (!validCatalogOperation({ version: 1, kind: "edit", edit })) return;
      const current = result.metadataProvenance[edit.id],
        tagAt = edit.provenance.manualTagsAt ?? (edit.field === "category" ? 0 : edit.at),
        categoryAt =
          edit.provenance.manualCategoryAt ?? (edit.category === undefined ? 0 : edit.at);
      const currentTagAt = current?.lockedFields?.includes("tags")
        ? (current.manualTagsAt ?? current.updatedAt ?? 0)
        : (current?.updatedAt ?? 0);
      const tags = tagAt > 0 && tagAt >= currentTagAt,
        category =
          edit.category !== undefined &&
          categoryAt > 0 &&
          categoryAt >=
            (current?.manualCategoryAt ??
              (current?.category === "manual" ? (current.updatedAt ?? 0) : 0));
      if (!tags && !category) return;
      const locks = new Set(current?.lockedFields ?? []);
      for (const field of ["tags", "category"] as const)
        if ((field === "tags" ? tags : category) && edit.provenance.lockedFields?.includes(field))
          locks.add(field);
      const provenance = {
        ...current,
        ...(tags ? edit.provenance : {}),
        ...(category
          ? { category: edit.provenance.category ?? "manual", manualCategoryAt: categoryAt }
          : { category: current?.category, manualCategoryAt: current?.manualCategoryAt }),
        lockedFields: [...locks],
        updatedAt: Math.max(current?.updatedAt ?? 0, edit.at),
        tags: tags ? edit.provenance.tags : (current?.tags ?? {}),
      };
      result = {
        tags: tags ? patchSparseRecord(result.tags, [[edit.id, edit.tags]]) : result.tags,
        metadataProvenance: patchSparseRecord(result.metadataProvenance, [[edit.id, provenance]]),
        categories: category
          ? patchSparseRecord(result.categories, [[edit.id, edit.category!]])
          : result.categories,
      };
    };
    const db = await open();
    try {
      for (;;) {
        const rows = await new Promise<CatalogEdit[]>((resolve, reject) => {
          const request = db
            .transaction("activity")
            .objectStore("activity")
            .getAll(
              IDBKeyRange.bound(
                after ?? CATALOG_EDIT_PREFIX,
                CATALOG_EDIT_PREFIX + "\uffff",
                !!after,
              ),
              256,
            );
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        for (const row of rows) admit(row);
        if (rows.length < 256) break;
        after = CATALOG_EDIT_PREFIX + rows.at(-1)!.id;
        await yieldCatalogTask();
      }
    } finally {
      db.close();
    }
    for (const row of readMirror()) admit(row);
    return result;
  }
  const recover=()=>writer?writer.run(()=>recoverInternal(),false):recoverInternal();
  const write=(operation:CatalogOperation)=>writer?writer.run(()=>writeInternal(operation)):writeInternal(operation);
  return { write, recover, edit, restore };
}
// Inline-key catalog stores reject an explicit key; out-of-line cache stores require it.
function keyPath(store: IDBObjectStore, key: string): IDBValidKey | undefined {
  return store.keyPath === null ? key : undefined;
}
