import {profileLocalStorage as localStorage} from "../local-profile-storage.ts";
import type { WriterLease } from "../writer-lease";
import {
  RESTORE_CONTROL,
  readRestoreControl,
  publishRestoreHead,
  type RestoreControl,
} from "../restore-epoch";
import {
  RESTORE_LIMITS,
  RESTORE_ACTIVITY_KEYS,
  RESTORE_PREFIXES,
  RESTORE_MIRRORS,
  verifyRestoreSnapshot,
  type RestoreSnapshot,
  type RestoreRow,
} from "./restore-snapshot";
import { yieldCatalogTask } from "../catalog-work";
export const RESTORE_GENERATIONS = "restore-generation:v1:";
type Side = "before" | "after";
type Manifest = {
  version: 1;
  id: string;
  name: string;
  at: number;
  choices: Record<string, string>;
  fingerprint: string;
  before: { pages: number; hash: string; bytes: number; mirrors: RestoreSnapshot["mirrors"] };
  after: Manifest["before"];
};
const pageKey = (id: string, side: Side, n: number) =>
  RESTORE_GENERATIONS + id + ":" + side + ":" + String(n).padStart(6, "0");
const manifestKey = (id: string) => RESTORE_GENERATIONS + id + ":manifest";
export function createLibraryRestoreRepository(
  open: () => Promise<IDBDatabase>,
  writer: WriterLease,
) {
  async function read<T>(store: string, key: IDBValidKey) {
    const db = await open();
    try {
      return await new Promise<T | undefined>((yes, no) => {
        const r = db.transaction(store).objectStore(store).get(key);
        r.onsuccess = () => yes(r.result);
        r.onerror = () => no(r.error);
      });
    } finally {
      db.close();
    }
  }
  const state = async () => readRestoreControl(await read("remote-cache", RESTORE_CONTROL));
  async function mutate<T>(
    body: (tx: IDBTransaction, done: (v: T) => void, fail: (error: unknown) => void) => void,
  ) {
    const db = await open();
    try {
      return await new Promise<T>((yes, no) => {
        let tx: IDBTransaction;
        try {
          tx = db.transaction(["activity", "activity-journal", "remote-cache"], "readwrite", {
            durability: "strict",
          });
        } catch (e) {
          if (!(e instanceof TypeError)) throw e;
          tx = db.transaction(["activity", "activity-journal", "remote-cache"], "readwrite");
        }
        let value: T, failure: unknown;
        const fail = (e: unknown) => {
          failure = e;
          try {
            tx.abort();
          } catch {
            /* completed */
          }
        };
        tx.oncomplete = () => yes(value);
        tx.onerror = tx.onabort = () =>
          no(
            failure ??
              tx.error ??
              Error("Restore transaction failed. The previous generation was retained."),
          );
        const token = writer.current();
        if (!token) {
          fail(Error("Restore ownership is required."));
          return;
        }
        writer.guard(
          tx,
          token,
          () => {
            try {
              body(tx, (v) => (value = v), fail);
            } catch (e) {
              fail(e);
            }
          },
          fail,
          false,
          true,
        );
      });
    } finally {
      db.close();
    }
  }
  async function snapshot(signal?: AbortSignal): Promise<RestoreSnapshot> {
    const rows: RestoreRow[] = [],
      db = await open();
    try {
      for (const store of ["activity", "activity-journal"] as const) {
        const ranges =
          store === "activity"
            ? [
                ...RESTORE_ACTIVITY_KEYS.map((k) => IDBKeyRange.only(k)),
                ...RESTORE_PREFIXES.map((p) => IDBKeyRange.bound(p, p + "\uffff")),
              ]
            : [undefined];
        for (const range of ranges) {
          let after: IDBValidKey | undefined;
          for (;;) {
            signal?.throwIfAborted();
            const page = await new Promise<Array<{ key: IDBValidKey; value: unknown }>>(
              (yes, no) => {
                const tx = db.transaction(store),
                  s = tx.objectStore(store),
                  out: Array<{ key: IDBValidKey; value: unknown }> = [];
                const r = s.openCursor(
                  after === undefined
                    ? range
                    : range
                      ? IDBKeyRange.bound(after, range.upper, true, range.upperOpen)
                      : IDBKeyRange.lowerBound(after, true),
                );
                r.onsuccess = () => {
                  const c = r.result;
                  if (!c || out.length === RESTORE_LIMITS.page) return;
                  out.push({ key: c.key, value: c.value });
                  c.continue();
                };
                tx.oncomplete = () => yes(out);
                tx.onerror = tx.onabort = () => no(tx.error);
              },
            );
            for (const row of page) {
              rows.push({ store, key: String(row.key), value: row.value });
              if (rows.length > RESTORE_LIMITS.rows)
                throw Error(
                  "The personal recovery snapshot exceeds 200,000 records. Nothing was activated.",
                );
            }
            if (page.length < RESTORE_LIMITS.page) break;
            after = page.at(-1)!.key;
            await yieldCatalogTask();
          }
        }
      }
    } finally {
      db.close();
    }
    const mirrors: RestoreSnapshot["mirrors"] = {};
    for (const k of RESTORE_MIRRORS) mirrors[k] = localStorage.getItem(k);
    return { version: 1, rows, mirrors };
  }
  async function writeSide(id: string, side: Side, data: RestoreSnapshot, signal?: AbortSignal) {
    const proof = await verifyRestoreSnapshot(data, signal),
      pages = Math.ceil(data.rows.length / RESTORE_LIMITS.page);
    for (let n = 0; n < pages; n++) {
      signal?.throwIfAborted();
      await mutate<void>((tx, done) => {
        tx.objectStore("activity").put(
          data.rows.slice(n * RESTORE_LIMITS.page, (n + 1) * RESTORE_LIMITS.page),
          pageKey(id, side, n),
        );
        done();
      });
      await yieldCatalogTask();
    }
    return { ...proof, pages, mirrors: data.mirrors };
  }
  async function manifest(id: string) {
    const raw = await read<Manifest>("activity", manifestKey(id));
    if (
      !raw ||
      raw.version !== 1 ||
      raw.id !== id ||
      typeof raw.name !== "string" ||
      !raw.before ||
      !raw.after ||
      [raw.before, raw.after].some(
        (s) =>
          !Number.isInteger(s.pages) ||
          s.pages < 0 ||
          s.pages > Math.ceil(RESTORE_LIMITS.rows / RESTORE_LIMITS.page) ||
          typeof s.hash !== "string" ||
          !/^[a-f0-9]{64}$/.test(s.hash) ||
          !s.mirrors,
      )
    )
      throw Error(
        "Restore manifest is incomplete or unsupported. Discard this staging operation; active data was kept.",
      );
    return raw;
  }
  async function load(id: string, side: Side) {
    const m = await manifest(id),
      part = m[side],
      rows: RestoreRow[] = [];
    for (let n = 0; n < part.pages; n++) {
      const page = await read<RestoreRow[]>("activity", pageKey(id, side, n));
      if (!Array.isArray(page) || page.length > RESTORE_LIMITS.page)
        throw Error("A staged restore page is missing or damaged.");
      rows.push(...page);
      await yieldCatalogTask();
    }
    const data: RestoreSnapshot = { version: 1, rows, mirrors: part.mirrors },
      proof = await verifyRestoreSnapshot(data);
    if (proof.hash !== part.hash || proof.bytes !== part.bytes)
      throw Error("Staged restore verification failed. Active data was retained.");
    return { m, data };
  }
  async function prepare(
    name: string,
    choices: Record<string, string>,
    fingerprint: string,
    build: (base: RestoreSnapshot, signal?: AbortSignal) => Promise<RestoreSnapshot>,
    signal?: AbortSignal,
  ) {
    if (
      Object.entries(choices).reduce(
        (bytes, [key, value]) => bytes + (key.length + value.length) * 2,
        0,
      ) >
      2 * 1024 ** 2
    )
      throw Error("Restore review choices exceed 2 MiB. Current data was kept.");
    if (
      typeof name !== "string" ||
      name.length > 256 ||
      !/^[a-f0-9]{64}$/.test(fingerprint) ||
      Object.keys(choices).length > 20000 ||
      Object.entries(choices).some(
        ([key, value]) => key.length > 5000 || !["current", "imported", "safe"].includes(value),
      )
    )
      throw Error("Invalid or oversized restore review.");
    return writer.run(async () => {
      const old = await state();
      if (old.phase !== "idle" || old.mirror)
        throw Error("Resolve the existing restore before preparing another.");
      const id = crypto.randomUUID(),
        control: RestoreControl = {
          ...old,
          phase: "capturing",
          pending: id,
          name: name.slice(0, 256),
          at: Date.now(),
        };
      publishRestoreHead(control);
      try {
        await mutate<void>((tx, done, fail) => {
          const r = tx.objectStore("remote-cache").get(RESTORE_CONTROL);
          r.onsuccess = () => {
            try {
              const latest = readRestoreControl(r.result);
              if (latest.epoch !== old.epoch || latest.phase !== "idle" || latest.mirror) {
                tx.abort();
                return;
              }
              tx.objectStore("remote-cache").put(control, RESTORE_CONTROL);
              done();
            } catch (e) {
              fail(e);
            }
          };
        });
      } catch (e) {
        const latest = await state();
        publishRestoreHead(latest);
        throw e;
      }
      publishRestoreHead(control);
      const base = await snapshot(signal),
        before = await writeSide(id, "before", base, signal),
        next = await build(base, signal),
        after = await writeSide(id, "after", next, signal);
      // Read every staged page back before making this generation eligible for activation.
      const m: Manifest = {
        version: 1,
        id,
        name: control.name!,
        at: Date.now(),
        choices,
        fingerprint,
        before,
        after,
      };
      await mutate<void>((tx, done) => {
        tx.objectStore("activity").put(m, manifestKey(id));
        done();
      });
      await load(id, "before");
      await load(id, "after");
      signal?.throwIfAborted();
      const ready = { ...control, phase: "ready" as const };
      await mutate<void>((tx, done) => {
        tx.objectStore("remote-cache").put(ready, RESTORE_CONTROL);
        done();
      });
      publishRestoreHead(ready);
      return ready;
    }, false);
  }
  async function collectUnused() {
    const control = await state(),
      keep = new Set([control.pending, control.previous, control.mirror].filter(Boolean));
    const db = await open();
    try {
      let after: string | undefined;
      for (;;) {
        const keys = await new Promise<string[]>((yes, no) => {
          const tx = db.transaction("activity"),
            r = tx
              .objectStore("activity")
              .getAllKeys(
                IDBKeyRange.bound(
                  after ?? RESTORE_GENERATIONS,
                  RESTORE_GENERATIONS + "\uffff",
                  !!after,
                ),
                32,
              );
          tx.oncomplete = () => yes(r.result.map(String));
          tx.onerror = () => no(tx.error);
        });
        if (!keys.length) break;
        await mutate<void>((tx, done) => {
          for (const key of keys) {
            const id = key.slice(RESTORE_GENERATIONS.length).split(":")[0];
            if (
              !keep.has(id) ||
              (key.includes(":after:") &&
                id === control.previous &&
                id !== control.pending &&
                !(id === control.mirror && control.mirrorSide === "after"))
            )
              tx.objectStore("activity").delete(key);
          }
          done();
        });
        after = keys.at(-1);
        if (keys.length < 32) break;
        await yieldCatalogTask();
      }
    } finally {
      db.close();
    }
  }
  async function repairMirrors() {
    return writer.run(async () => {
      let control = await state();
      if (!control.mirror) return control;
      const { data } = await load(control.mirror, control.mirrorSide!);
      publishRestoreHead(control);
      for (const [key, value] of Object.entries(data.mirrors)) {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      }
      control = { ...control, mirror: undefined, mirrorSide: undefined };
      await mutate<void>((tx, done) => {
        tx.objectStore("remote-cache").put(control, RESTORE_CONTROL);
        done();
      });
      publishRestoreHead(control);
      await collectUnused();
      return control;
    }, false);
  }
  async function activate(rollback = false) {
    return writer.run(async () => {
      const control = await state(),
        id = rollback ? control.previous : control.pending,
        side: Side = rollback ? "before" : "after";
      if (!id || (!rollback && control.phase !== "ready") || (rollback && control.phase !== "idle"))
        throw Error("No verified generation is available for this action.");
      const { data } = await load(id, side);
      if (control.epoch >= Number.MAX_SAFE_INTEGER)
        throw Error("Restore generation counter exhausted.");
      const next: RestoreControl = {
        version: 1,
        epoch: control.epoch + 1,
        phase: "idle",
        at: Date.now(),
        name: control.name,
        previous: rollback ? undefined : id,
        mirror: id,
        mirrorSide: side,
      };
      await mutate<void>((tx, done, fail) => {
        const activity = tx.objectStore("activity"),
          old = activity.get("preferences"),
          head = tx.objectStore("remote-cache").get(RESTORE_CONTROL);
        let count = 0;
        const ready = () => {
          if (++count < 2) return;
          try {
            const latest = readRestoreControl(head.result);
            if (
              latest.epoch !== control.epoch ||
              latest.pending !== control.pending ||
              latest.previous !== control.previous ||
              latest.phase !== control.phase
            ) {
              tx.abort();
              return;
            }
            for (const key of RESTORE_ACTIVITY_KEYS) activity.delete(key);
            for (const p of RESTORE_PREFIXES) activity.delete(IDBKeyRange.bound(p, p + "\uffff"));
            tx.objectStore("activity-journal").clear();
            for (const row of data.rows) {
              let value = row.value;
              if (
                row.store === "activity" &&
                row.key === "preferences" &&
                value &&
                typeof value === "object"
              ) {
                const previous = old.result ?? {},
                  v = value as Record<string, unknown>;
                value = {
                  ...v,
                  privateFolderIds: [
                    ...new Set([
                      ...(Array.isArray(previous.privateFolderIds)
                        ? previous.privateFolderIds
                        : []),
                      ...(Array.isArray(v.privateFolderIds) ? v.privateFolderIds : []),
                    ]),
                  ],
                  adultPinHash: previous.adultPinHash || v.adultPinHash,
                };
              }
              const store = tx.objectStore(row.store);
              if (store.keyPath) store.put(value);
              else store.put(value, row.key);
            }
            tx.objectStore("remote-cache").put(next, RESTORE_CONTROL);
            done();
          } catch (e) {
            fail(e);
          }
        };
        old.onsuccess = head.onsuccess = ready;
      });
      publishRestoreHead(next);
      await repairMirrors();
      return next;
    }, false);
  }
  async function discard() {
    return writer.run(async () => {
      const old = await state();
      if (old.phase === "idle" || old.mirror)
        throw Error("Only an unactivated staging operation can be discarded.");
      const next = { ...old, phase: "idle" as const, pending: undefined };
      await mutate<void>((tx, done) => {
        tx.objectStore("remote-cache").put(next, RESTORE_CONTROL);
        done();
      });
      publishRestoreHead(next);
      await collectUnused();
      return next;
    }, false);
  }
  return { state, prepare, activate, discard, repairMirrors, load };
}
