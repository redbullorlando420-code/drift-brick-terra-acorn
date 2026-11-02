import type { WriterLease } from "../writer-lease.ts";
import {
  installMediaReadPolicy,
  emptyMediaHealth,
  parseMediaHealth,
  observeMediaHealth,
  mergeMediaHealth,
  MEDIA_HEALTH_KEY,
  type MediaHealthLedger,
  type MediaObservation,
  type MediaChoice,
} from "./media-health.ts";
export function createMediaHealthRepository(open: () => Promise<IDBDatabase>, writer: WriterLease) {
  let snapshot = emptyMediaHealth(),
    loaded = false;
  const listeners = new Set<() => void>();
  const publish = (next: MediaHealthLedger) => {
    if (loaded && next.revision <= snapshot.revision) return;
    snapshot = next;
    installMediaReadPolicy(next);
    loaded = true;
    for (const fn of listeners) fn();
  };
  async function hydrate() {
    const db = await open();
    try {
      const raw = await new Promise<unknown>((yes, no) => {
        const r = db.transaction("activity").objectStore("activity").get(MEDIA_HEALTH_KEY);
        r.onsuccess = () => yes(r.result);
        r.onerror = () => no(r.error);
      });
      publish(parseMediaHealth(raw));
      return snapshot;
    } finally {
      db.close();
    }
  }
  async function change(update: (ledger: MediaHealthLedger) => MediaHealthLedger) {
    return writer.run(async () => {
      const db = await open();
      try {
        const next = await new Promise<MediaHealthLedger>((yes, no) => {
          let tx: IDBTransaction;
          try {
            tx = db.transaction(["activity", "remote-cache"], "readwrite", {
              durability: "strict",
            });
          } catch (e) {
            if (!(e instanceof TypeError)) throw e;
            tx = db.transaction(["activity", "remote-cache"], "readwrite");
          }
          let result: MediaHealthLedger, failure: unknown;
          const fail = (e: unknown) => {
            failure = e;
            tx.abort();
          };
          tx.oncomplete = () => yes(result);
          tx.onabort = tx.onerror = () =>
            no(
              failure ??
                tx.error ??
                Error("Media recovery was not saved. Existing records were kept."),
            );
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
                r = store.get(MEDIA_HEALTH_KEY);
              r.onsuccess = () => {
                try {
                  const old = parseMediaHealth(r.result);
                  if (old.revision >= Number.MAX_SAFE_INTEGER)
                    throw Error("Media recovery revision exhausted.");
                  result = update(old);
                  if (result !== old) {
                    result = parseMediaHealth({ ...result, revision: old.revision + 1 });
                    store.put(result, MEDIA_HEALTH_KEY);
                  }
                } catch (e) {
                  fail(e);
                }
              };
            },
            fail,
            false,
          );
        });
        publish(next);
        return next;
      } finally {
        db.close();
      }
    });
  }
  return {
    hydrate,
    getSnapshot: () => snapshot,
    subscribe: (fn: () => void) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    observe: (row: MediaObservation) => change((old) => observeMediaHealth(old, row)),
    choose: (id: string, choice: MediaChoice, at = Date.now()) =>
      change((old) => {
        const row = old.entries[id];
        if (!row) throw Error("Review this title before choosing a recovery action.");
        return {
          ...old,
          entries: {
            ...old.entries,
            [id]: { ...row, choice, choiceAt: Math.max(at, row.choiceAt + 1) },
          },
        };
      }),
    forget: (id: string) =>
      change((old) => {
        if (!old.entries[id]) return old;
        const entries = { ...old.entries };
        delete entries[id];
        return { ...old, entries };
      }),
    import: (raw: unknown) => {
      const incoming = parseMediaHealth(raw);
      return change((old) => mergeMediaHealth(old, incoming));
    },
  };
}
