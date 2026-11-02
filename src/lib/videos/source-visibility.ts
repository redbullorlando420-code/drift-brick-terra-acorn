import {setHiddenPrivateSources} from './hidden-source-privacy.ts';
import type { Folder } from "./types";
import type { WriterLease } from "../writer-lease";
export const SOURCE_VISIBILITY_KEY = "source-visibility:v1";
export type HiddenSource = { id: string; at: number; folder: Folder };
export type SourceVisibility = { version: 1; revision: number; hidden: HiddenSource[] };
export function readSourceVisibility(raw: unknown): SourceVisibility {
  if (raw === undefined) return { version: 1, revision: 0, hidden: [] };
  const r = raw as SourceVisibility;
  if (
    !r ||
    r.version !== 1 ||
    !Number.isSafeInteger(r.revision) ||
    r.revision < 0 ||
    !Array.isArray(r.hidden) ||
    r.hidden.length > 256 ||
    new Set(r.hidden.map((x) => x.id)).size !== r.hidden.length ||
    r.hidden.some(
      (x) =>
        !x ||
        typeof x.id !== "string" ||
        !x.id ||
        x.id.length > 1024 ||
        !Number.isFinite(x.at) ||
        x.at < 0 ||
        x.folder?.id !== x.id ||
        !["directory", "files"].includes(x.folder.kind) ||
        typeof x.folder.name !== "string" ||
        x.folder.name.length > 4096,
    )
  )
    throw Error("Unsupported hidden-source records. Existing data was kept.");
  return r;
}
/** Hiding changes one durable flag. Catalog rows, grants and all marks stay intact. */
export function createSourceVisibilityRepository(
  open: () => Promise<IDBDatabase>,
  writer: WriterLease,
) {
  let snapshot: SourceVisibility = { version: 1, revision: 0, hidden: [] };
  async function load() {
    const db = await open();
    try {
      return await new Promise<SourceVisibility>((yes, no) => {
        const tx = db.transaction("remote-cache"),
          r = tx.objectStore("remote-cache").get(SOURCE_VISIBILITY_KEY);
        tx.oncomplete = () => {
          try {
            snapshot = readSourceVisibility(r.result);setHiddenPrivateSources(snapshot.hidden.filter(row=>row.folder.adult).map(row=>row.id));
            yes(snapshot);
          } catch (e) {
            no(e);
          }
        };
        tx.onerror = () => no(tx.error);
      });
    } finally {
      db.close();
    }
  }
  async function change(folder: Folder | undefined, id: string) {
    return writer.run(async (token) => {
      const db = await open();
      try {
        return await new Promise<SourceVisibility>((yes, no) => {
          const tx = db.transaction("remote-cache", "readwrite");
          let result: SourceVisibility, cause: unknown;
          const fail = (e: unknown) => {
            cause = e;
            try {
              tx.abort();
            } catch {}
          };
          tx.oncomplete = () => {
            snapshot = result;setHiddenPrivateSources(snapshot.hidden.filter(row=>row.folder.adult).map(row=>row.id));
            yes(result);
          };
          tx.onabort = tx.onerror = () =>
            no(cause ?? tx.error ?? Error("Source visibility could not be saved."));
          writer.guard(
            tx,
            token,
            () => {
              const store = tx.objectStore("remote-cache"),
                r = store.get(SOURCE_VISIBILITY_KEY);
              r.onsuccess = () => {
                try {
                  const before = readSourceVisibility(r.result),
                    hidden = before.hidden.filter((x) => x.id !== id);
                  if (folder) hidden.push({ id, folder, at: Date.now() });
                  result = { version: 1, revision: before.revision + 1, hidden };
                  readSourceVisibility(result);
                  store.put(result, SOURCE_VISIBILITY_KEY);
                } catch (e) {
                  fail(e);
                }
              };
            },
            fail,
          );
        });
      } finally {
        db.close();
      }
    });
  }
  return {
    load,
    getSnapshot: () => snapshot,
    hide: (folder: Folder) => change(folder, folder.id),
    show: (id: string) => change(undefined, id),
  };
}
