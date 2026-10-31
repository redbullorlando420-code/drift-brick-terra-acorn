import { createWriterLease } from "./writer-lease.ts";
import {
  readSignalPack,
  normalizeSignalProfile,
  signalOwnerPrefix,
  SIGNAL_PLATFORMS,
  type SignalPack,
  type SignalProfile,
  type SignalEditHistory,
} from "./stream-signal.ts";

export type SignalProfileRevision = { version: 2; revision: number; profile: SignalProfile };
export class SignalConflictError extends Error {
  key: string;
  current: SignalPack | SignalProfileRevision;
  constructor(key: string, current: SignalPack | SignalProfileRevision) {
    super(
      "Another tab saved a newer revision. Your edit is kept here. Choose which changes to keep before saving.",
    );
    this.name = "SignalConflictError";
    this.key = key;
    this.current = current;
  }
}
export function readSignalProfileRevision(raw: unknown): SignalProfileRevision {
  if (raw && typeof raw === "object" && "version" in raw) {
    const row = raw as SignalProfileRevision;
    if (row.version !== 2 || !Number.isSafeInteger(row.revision) || row.revision < 0)
      throw Error("Unsupported saved channel setup.");
    return { version: 2, revision: row.revision, profile: normalizeSignalProfile(row.profile) };
  }
  return { version: 2, revision: 0, profile: normalizeSignalProfile(raw) };
}
export function nextSignalRevision(
  current: SignalPack | undefined,
  input: SignalPack,
  now = Date.now(),
): SignalPack {
  const draft = readSignalPack(input);
  if (current && current.id !== draft.id) throw Error("Announcement identity changed.");
  const changed = SIGNAL_PLATFORMS.filter(
    (platform) =>
      !current ||
      current.drafts[platform] !== draft.drafts[platform] ||
      current.shared[platform] !== draft.shared[platform],
  );
  if (current && !changed.length) return current;
  const revision = (current?.revision ?? 0) + 1;
  if (!Number.isSafeInteger(revision)) throw Error("Announcement revisions are exhausted.");
  const at = Math.max(now, draft.createdAt, (current?.updatedAt ?? 0) + 1),
    draftRevisions = { ...current?.draftRevisions };
  const history: SignalEditHistory[] = [...(current?.history ?? [])];
  for (const platform of changed) {
    draftRevisions[platform] = (draftRevisions[platform] ?? 0) + 1;
    if (current)
      history.push({
        revision,
        at,
        platform,
        text: current.drafts[platform],
        ...(current.shared[platform] !== undefined ? { shared: current.shared[platform] } : {}),
      });
  }
  return {
    ...draft,
    profile: current?.profile ?? draft.profile,
    createdAt: current?.createdAt ?? draft.createdAt,
    updatedAt: at,
    revision,
    draftRevisions,
    history: history.slice(-12),
  };
}
/** Conflict recovery reapplies only the fields this editor changed from its base.
 * Other platforms from the newer saved pack remain intact. */
export function rebaseSignalEdit(
  current: SignalPack,
  mine: SignalPack,
  base?: SignalPack,
): SignalPack {
  const drafts = { ...current.drafts },
    shared = { ...current.shared };
  for (const platform of SIGNAL_PLATFORMS) {
    if (!base || mine.drafts[platform] !== base.drafts[platform])
      drafts[platform] = mine.drafts[platform];
    if (!base || mine.shared[platform] !== base.shared[platform]) {
      if (mine.shared[platform] === undefined) delete shared[platform];
      else shared[platform] = mine.shared[platform];
    }
  }
  return { ...current, drafts, shared };
}
export function createSignalRevisions(open: () => Promise<IDBDatabase>, owner: string) {
  const prefix = signalOwnerPrefix(owner),
    writer = createWriterLease(open, "signal:" + encodeURIComponent(owner));
  async function read(key: string) {
    const db = await open();
    try {
      return await new Promise<unknown>((resolve, reject) => {
        const r = db.transaction("activity").objectStore("activity").get(key);
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      });
    } finally {
      db.close();
    }
  }
  async function save(key: string, input: unknown, expected: number) {
    if (!Number.isSafeInteger(expected) || expected < 0)
      throw Error("Invalid expected announcement revision.");
    const profile = key === prefix + "profile";
    if (!profile && !key.startsWith(prefix + "pack:"))
      throw Error("Announcement belongs to another workspace.");
    const incoming = profile ? normalizeSignalProfile(input) : readSignalPack(input);
    if (!profile && key !== prefix + (incoming as SignalPack).id)
      throw Error("Announcement key does not match its identity.");
    return writer.run(async (token) => {
      const db = await open();
      try {
        return await new Promise<SignalPack | SignalProfileRevision>((resolve, reject) => {
          const tx = db.transaction(["activity", "remote-cache"], "readwrite"),
            store = tx.objectStore("activity");
          let result: SignalPack | SignalProfileRevision,
            cause: unknown,
            didWrite = false;
          tx.oncomplete = () => {
            if (didWrite) writer.markChanged();
            resolve(result);
          };
          tx.onabort = tx.onerror = () =>
            reject(
              cause ?? tx.error ?? Error("Announcement save failed. Existing text is retained."),
            );
          const fail = (error: unknown) => {
            cause = error;
            tx.abort();
          };
          writer.guard(
            tx,
            token,
            () => {
              const request = store.get(key);
              request.onsuccess = () => {
                try {
                  const current = profile
                    ? readSignalProfileRevision(request.result)
                    : request.result === undefined
                      ? undefined
                      : readSignalPack(request.result);
                  if ((current?.revision ?? 0) !== expected)
                    throw new SignalConflictError(key, current!);
                  if (profile) {
                    const old = current as SignalProfileRevision;
                    if (JSON.stringify(old.profile) === JSON.stringify(incoming)) {
                      result = old;
                      return;
                    }
                    if (!Number.isSafeInteger(expected + 1))
                      throw Error("Channel setup revisions are exhausted.");
                    result = {
                      version: 2,
                      revision: expected + 1,
                      profile: incoming as SignalProfile,
                    };
                  } else
                    result = nextSignalRevision(
                      current as SignalPack | undefined,
                      incoming as SignalPack,
                    );
                  if (result !== current) {
                    writer.touch(tx, token);
                    store.put(result, key);
                    didWrite = true;
                  }
                } catch (error) {
                  fail(error);
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
    writer,
    save,
    read,
    profile: async () => readSignalProfileRevision(await read(prefix + "profile")),
  };
}
