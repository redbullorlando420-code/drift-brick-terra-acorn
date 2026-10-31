import { createLocalId } from "./local-id.ts";

export const WRITER_LEASE_MS = 15_000;
export const WRITER_LEASE_PREFIX = "writer-lease:v1:";
export type WriterToken = {
  version: 1;
  scope: string;
  owner: string;
  generation: number;
  expiresAt: number;
  revision: number;
  dirty?: boolean;
};
export type WriterNotice = {
  type: "commit";
  scope: string;
  generation: number;
  revision: number;
  owner: string;
};
export class WriterBusyError extends Error {
  constructor() {
    super(
      "Another app tab is updating this workspace. Your pending changes are kept; retry after that tab finishes.",
    );
    this.name = "WriterBusyError";
  }
}
export class WriterFenceError extends Error {
  constructor() {
    super(
      "This tab no longer owns the write lease. No fenced transaction was applied; review current data before retrying.",
    );
    this.name = "WriterFenceError";
  }
}
export function validWriterToken(raw: unknown): raw is WriterToken {
  const row = raw as WriterToken;
  return (
    !!row &&
    row.version === 1 &&
    typeof row.scope === "string" &&
    row.scope.length <= 1024 &&
    typeof row.owner === "string" &&
    row.owner.length <= 128 &&
    row.owner.length > 0 &&
    (row.dirty === undefined || typeof row.dirty === "boolean") &&
    [row.generation, row.expiresAt, row.revision].every(
      (value) => Number.isSafeInteger(value) && value >= 0,
    )
  );
}
type Snapshot = {
  phase: "idle" | "owned" | "busy" | "error";
  generation: number;
  revision: number;
  message: string;
};
/** One short same-origin lease per workspace. Generations fence every write in
 * the same IDB transaction as its data. Idle tabs do not renew or poll. */
export function createWriterLease(
  open: () => Promise<IDBDatabase>,
  scope: string,
  options: { owner?: string; now?: () => number; ttl?: number; transport?: boolean } = {},
) {
  if (!scope || scope.length > 1024) throw Error("Invalid writer scope.");
  const owner = options.owner ?? createLocalId("tab:"),
    now = options.now ?? Date.now,
    ttl = options.ttl ?? WRITER_LEASE_MS,
    key = WRITER_LEASE_PREFIX + scope;
  let active:
    | {
        token: WriterToken;
        users: number;
        changed: boolean;
        timer?: ReturnType<typeof setInterval>;
      }
    | undefined;
  let acquiring: Promise<void> | undefined, ending: Promise<void> | undefined;
  let state: Snapshot = { phase: "idle", generation: 0, revision: 0, message: "" };
  const listeners = new Set<() => void>(),
    commits = new Set<(notice: WriterNotice) => void>();
  const publish = (patch: Partial<Snapshot>) => {
    state = { ...state, ...patch };
    for (const listener of listeners) listener();
  };
  let disposed = false;
  let channel: BroadcastChannel | undefined,
    lastRemoteRevision = 0;
  const receive = (raw: unknown) => {
    const release = raw as { type?: string; scope?: string; owner?: string };
    if (
      release?.type === "released" &&
      release.scope === scope &&
      release.owner !== owner &&
      state.phase === "busy"
    )
      publish({ phase: "idle", message: "" });
    const notice = raw as WriterNotice;
    if (
      notice?.type !== "commit" ||
      notice.scope !== scope ||
      notice.owner === owner ||
      typeof notice.owner !== "string" ||
      notice.owner.length > 128 ||
      notice.revision <= lastRemoteRevision ||
      !Number.isSafeInteger(notice.generation) ||
      !Number.isSafeInteger(notice.revision) ||
      notice.revision < 1
    )
      return;
    lastRemoteRevision = notice.revision;
    for (const listener of commits) listener(notice);
  };
  const listen = () => {
    if (disposed || channel || typeof window === "undefined" || options.transport === false) return;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel("reelcase-writers.v1");
      channel.onmessage = (event) => receive(event.data);
    }
  };
  async function update<T>(
    body: (store: IDBObjectStore, current: unknown, done: (value: T) => void) => void,
  ) {
    const db = await open();
    try {
      return await new Promise<T>((resolve, reject) => {
        const tx = db.transaction("remote-cache", "readwrite"),
          store = tx.objectStore("remote-cache");
        let value: T, cause: unknown;
        tx.oncomplete = () => resolve(value);
        tx.onabort = tx.onerror = () =>
          reject(cause ?? tx.error ?? Error("Writer lease storage failed."));
        const request = store.get(key);
        request.onsuccess = () => {
          try {
            body(store, request.result, (result) => {
              value = result;
            });
          } catch (error) {
            cause = error;
            tx.abort();
          }
        };
      });
    } finally {
      db.close();
    }
  }
  async function acquire() {
    const token = await update<WriterToken>((store, raw, done) => {
      if (raw !== undefined && !validWriterToken(raw))
        throw Error("Unsupported writer lease. Existing data is retained.");
      const previous = raw as WriterToken | undefined;
      if (previous && previous.scope !== scope) throw Error("Writer scope mismatch.");
      if (previous && previous.expiresAt > now()) throw new WriterBusyError();
      const generation = (previous?.generation ?? 0) + 1;
      if (!Number.isSafeInteger(generation)) throw Error("Writer generations are exhausted.");
      const next: WriterToken = {
        version: 1,
        scope,
        owner,
        generation,
        expiresAt: now() + ttl,
        revision: previous?.revision ?? 0,
        dirty: previous?.dirty === true,
      };
      store.put(next, key);
      done(next);
    });
    active = { token, users: 0, changed: token.dirty === true };
    publish({
      phase: "owned",
      generation: token.generation,
      revision: token.revision,
      message: "This tab is saving this workspace.",
    });
    active.timer = setInterval(
      () => {
        const held = active;
        if (!held) return;
        void update<void>((store, raw, done) => {
          if (active !== held) {
            done();
            return;
          }
          assert(raw, held.token);
          store.put({ ...(raw as WriterToken), expiresAt: now() + ttl }, key);
          done();
        }).catch((error) => {
          if (active === held)
            publish({
              phase: "error",
              message: error instanceof Error ? error.message : "Writer renewal failed.",
            });
        });
      },
      Math.max(100, Math.floor(ttl / 3)),
    );
  }
  function assert(raw: unknown, token: WriterToken) {
    if (
      !validWriterToken(token) ||
      token.scope !== scope ||
      !validWriterToken(raw) ||
      raw.scope !== scope ||
      raw.owner !== token.owner ||
      raw.generation !== token.generation ||
      raw.expiresAt <= now()
    )
      throw new WriterFenceError();
  }
  function guard(
    tx: IDBTransaction,
    token: WriterToken,
    body: () => void,
    failed?: (error: unknown) => void,
    dirty = true,
  ) {
    const request = tx.objectStore("remote-cache").get(key);
    request.onsuccess = () => {
      try {
        assert(request.result, token);
        if (dirty && !request.result.dirty)
          tx.objectStore("remote-cache").put({ ...request.result, dirty: true }, key);
        body();
      } catch (error) {
        publish({
          phase: "error",
          message: error instanceof Error ? error.message : "Writer fencing failed.",
        });
        failed?.(error);
        try {
          tx.abort();
        } catch {
          /* already aborted */
        }
      }
    };
  }
  async function finish() {
    const held = active;
    if (!held) return;
    clearInterval(held.timer);
    active = undefined;
    try {
      let released = false;
      const notice = await update<WriterNotice | undefined>((store, raw, done) => {
        // An expired or displaced owner may release only its own generation.
        if (
          !validWriterToken(raw) ||
          raw.owner !== owner ||
          raw.generation !== held.token.generation
        ) {
          done(undefined);
          return;
        }
        released = true;
        const revision = raw.revision + (held.changed || raw.dirty ? 1 : 0);
        if (!Number.isSafeInteger(revision)) throw Error("Writer revisions are exhausted.");
        store.put({ ...raw, expiresAt: 0, revision, dirty: false }, key);
        done(
          held.changed || raw.dirty
            ? { type: "commit", scope, owner, generation: raw.generation, revision }
            : undefined,
        );
      });
      if (notice) {
        listen();
        channel?.postMessage(notice);
        publish({ revision: notice.revision });
      }
      listen();
      if (released)
        channel?.postMessage({ type: "released", scope, owner, generation: held.token.generation });
      if (state.phase !== "error") publish({ phase: "idle", message: "" });
    } catch (error) {
      publish({
        phase: "error",
        message: error instanceof Error ? error.message : "Writer release failed.",
      });
      throw error;
    }
  }
  async function run<T>(work: (token: WriterToken) => Promise<T>, mutates = true): Promise<T> {
    if (disposed)
      throw Error("This writer instance was closed. Reopen the workspace before retrying.");
    listen();
    if (ending) await ending;
    if (!active) {
      if (!acquiring)
        acquiring = acquire().finally(() => {
          acquiring = undefined;
        });
      try {
        await acquiring;
      } catch (error) {
        publish({
          phase: error instanceof WriterBusyError ? "busy" : "error",
          message: error instanceof Error ? error.message : "Writer unavailable.",
        });
        throw error;
      }
    }
    const held = active!;
    held.users++;
    try {
      const result = await work(held.token);
      if (mutates) held.changed = true;
      return result;
    } catch (error) {
      publish({
        phase: "error",
        message: error instanceof Error ? error.message : "Workspace save failed.",
      });
      throw error;
    } finally {
      held.users--;
      if (!held.users) {
        ending = finish();
        try {
          await ending;
        } finally {
          ending = undefined;
        }
      }
    }
  }
  async function inspect() {
    const db = await open();
    try {
      return await new Promise<WriterToken | undefined>((resolve, reject) => {
        const request = db.transaction("remote-cache").objectStore("remote-cache").get(key);
        request.onsuccess = () => {
          if (request.result !== undefined && !validWriterToken(request.result)) {
            reject(Error("Unsupported writer lease."));
            return;
          }
          resolve(request.result);
        };
        request.onerror = () => reject(request.error);
      });
    } finally {
      db.close();
    }
  }
  return {
    owner,
    scope,
    run,
    guard,
    touch: (tx: IDBTransaction, token: WriterToken) => guard(tx, token, () => {}),
    assert,
    inspect,
    current: () => active?.token,
    markChanged: () => {
      if (active) active.changed = true;
    },
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listen();
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    onCommit(listener: (notice: WriterNotice) => void) {
      listen();
      commits.add(listener);
      return () => {
        commits.delete(listener);
      };
    },
    close() {
      disposed = true;
      channel?.close();
      channel = undefined;
      if (active) clearInterval(active.timer);
    },
  };
}
export type WriterLease = ReturnType<typeof createWriterLease>;
