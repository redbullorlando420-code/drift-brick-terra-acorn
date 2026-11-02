import type { WriterLease } from "../writer-lease";
import { yieldCatalogTask } from "../catalog-work";
import type { ConflictChoice } from "./pack-conflicts";
export const PACK_REVIEW_KEY = "backup-review:v1";
export type SavedPackReview = {
  version: 1;
  id: string;
  revision: number;
  name: string;
  at: number;
  fingerprint: string;
  files: Array<[string, unknown]>;
  choices: Record<string, ConflictChoice>;
};
export function readPackReview(raw: unknown): SavedPackReview | undefined {
  if (raw === undefined) return;
  const r = raw as SavedPackReview;
  if (
    !r ||
    r.version !== 1 ||
    typeof r.id !== "string" ||
    r.id.length > 128 ||
    !Number.isSafeInteger(r.revision) ||
    r.revision < 1 ||
    typeof r.name !== "string" ||
    r.name.length > 256 ||
    !Number.isSafeInteger(r.at) ||
    r.at < 1 ||
    typeof r.fingerprint !== "string" ||
    !/^[a-f0-9]{64}$/.test(r.fingerprint) ||
    !Array.isArray(r.files) ||
    r.files.length > 64 ||
    r.files.some(
      (p) => !Array.isArray(p) || p.length !== 2 || typeof p[0] !== "string" || p[0].length > 256,
    ) ||
    !r.choices ||
    typeof r.choices !== "object" ||
    Array.isArray(r.choices) ||
    Object.keys(r.choices).length > 20000 ||
    Object.entries(r.choices).some(
      ([k, v]) => k.length > 5000 || !["current", "imported", "safe"].includes(v),
    )
  )
    throw Error("Unsupported saved backup review. It was kept unchanged.");
  return r;
}
/** One optional, private review slot; choices never mutate the active library. */
export function createPackReviewRepository(open: () => Promise<IDBDatabase>, writer: WriterLease) {
  async function load() {
    const db = await open();
    try {
      return await new Promise<SavedPackReview | undefined>((yes, no) => {
        const tx = db.transaction("activity"),
          r = tx.objectStore("activity").get(PACK_REVIEW_KEY);
        tx.oncomplete = () => {
          try {
            yes(readPackReview(r.result));
          } catch (e) {
            no(e);
          }
        };
        tx.onerror = tx.onabort = () => no(tx.error);
      });
    } finally {
      db.close();
    }
  }
  async function change(
    expected: { id: string; revision: number } | undefined,
    next?: Omit<SavedPackReview, "revision">,
  ) {
    if (next) {
      let bytes = 0,
        n = 0;
      const stack: unknown[] = [next];
      while (stack.length) {
        const v = stack.pop();
        if (typeof v === "string") bytes += v.length * 2;
        else if (v && typeof v === "object") {
          if (Array.isArray(v)) for (const x of v) stack.push(x);
          else
            for (const [k, x] of Object.entries(v)) {
              bytes += k.length * 2;
              stack.push(x);
            }
        } else bytes += 8;
        if (bytes > 16 * 1024 ** 2 || ++n > 1000000)
          throw Error(
            "The resumable review exceeds 16 MiB. Continue this inspection without saving it, or split the backup.",
          );
        if (n % 512 === 0) await yieldCatalogTask();
      }
    }
    return writer.run(async () => {
      const db = await open();
      try {
        return await new Promise<SavedPackReview | undefined>((yes, no) => {
          const tx = db.transaction(["activity", "remote-cache"], "readwrite");
          let result: SavedPackReview | undefined, failure: unknown;
          const fail = (e: unknown) => {
            failure = e;
            tx.abort();
          };
          tx.oncomplete = () => yes(result);
          tx.onerror = tx.onabort = () =>
            no(failure ?? tx.error ?? Error("Backup review was not saved."));
          const token = writer.current();
          if (!token) {
            fail(Error("Catalog ownership is required."));
            return;
          }
          writer.guard(
            tx,
            token,
            () => {
              const store = tx.objectStore("activity"),
                r = store.get(PACK_REVIEW_KEY);
              r.onsuccess = () => {
                try {
                  const old = readPackReview(r.result);
                  if (old?.id !== expected?.id || old?.revision !== expected?.revision)
                    throw Error(
                      "The saved review changed in another tab. Resume it before replacing it.",
                    );
                  if (next) {
                    if (old && old.revision >= Number.MAX_SAFE_INTEGER)
                      throw Error("Review revision exhausted.");
                    result = readPackReview({ ...next, revision: (old?.revision ?? 0) + 1 });
                    store.put(result, PACK_REVIEW_KEY);
                  } else store.delete(PACK_REVIEW_KEY);
                } catch (e) {
                  fail(e);
                }
              };
            },
            fail,
            false,
          );
        });
      } finally {
        db.close();
      }
    }, false);
  }
  return {
    load,
    save: (
      expected: { id: string; revision: number } | undefined,
      next: Omit<SavedPackReview, "revision">,
    ) => change(expected, next),
    discard: (expected: { id: string; revision: number }) => change(expected),
  };
}
