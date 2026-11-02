import type { WriterLease } from "../writer-lease";
import { applyTwitchAlias, validTwitchAlias, type TwitchAlias } from "./twitch-channel-identity";
import type { FollowedChannel } from "./types";
export const TWITCH_ALIAS_JOURNAL = "twitch-alias-journal:v1";
export type AliasJournal = {
  version: 1;
  revision: number;
  entries: Array<TwitchAlias & { sourceId: string; at: number }>;
};
export function readAliasJournal(raw: unknown): AliasJournal {
  if (raw === undefined) return { version: 1, revision: 0, entries: [] };
  const r = raw as AliasJournal;
  if (
    !r ||
    r.version !== 1 ||
    !Number.isSafeInteger(r.revision) ||
    r.revision < 0 ||
    !Array.isArray(r.entries) ||
    r.entries.length > 128 ||
    r.entries.some(
      (e) =>
        !validTwitchAlias(e) ||
        typeof e.sourceId !== "string" ||
        e.sourceId.length > 256 ||
        !Number.isSafeInteger(e.at) ||
        e.at < 1,
    )
  )
    throw Error("Unsupported Twitch identity journal. Existing data was kept.");
  return r;
}
/** The identity journal and canonical follow change commit together, under the catalog fence.
 * No catalog rewrite is required: source IDs, VOD/clip IDs and personal marks stay canonical. */
export function createTwitchAliasRepository(open: () => Promise<IDBDatabase>, writer: WriterLease) {
  return {
    apply: async (expected: FollowedChannel, evidence: TwitchAlias) =>
      writer.run(async () => {
        const db = await open();
        try {
          return await new Promise<FollowedChannel[]>((yes, no) => {
            let tx: IDBTransaction;
            try {
              tx = db.transaction(["activity", "remote-cache"], "readwrite", {
                durability: "strict",
              });
            } catch (e) {
              if (!(e instanceof TypeError)) throw e;
              tx = db.transaction(["activity", "remote-cache"], "readwrite");
            }
            let result: FollowedChannel[], failure: unknown;
            const fail = (e: unknown) => {
              failure = e;
              tx.abort();
            };
            tx.oncomplete = () => yes(result);
            tx.onabort = tx.onerror = () =>
              no(failure ?? tx.error ?? Error("Twitch alias was not saved."));
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
                  f = store.get("follows"),
                  j = store.get(TWITCH_ALIAS_JOURNAL);
                let read = 0;
                const ready = () => {
                  if (++read < 2) return;
                  try {
                    const payload = f.result as { channels: FollowedChannel[]; savedAt: number };
                    if (!payload || !Array.isArray(payload.channels))
                      throw Error("Save the current follows before reviewing aliases.");
                    const current = payload.channels.find((c) => c.id === expected.id);
                    if (
                      !current ||
                      current.channelId !== expected.channelId ||
                      current.handle !== expected.handle ||
                      (current.twitchAliasRevision ?? 0) !== (expected.twitchAliasRevision ?? 0)
                    )
                      throw Error("This follow changed during review. Check again.");
                    const next = applyTwitchAlias(current, evidence),
                      journal = readAliasJournal(j.result);
                    if (
                      journal.entries.length >= 128 ||
                      journal.revision === Number.MAX_SAFE_INTEGER
                    )
                      throw Error("The Twitch alias journal is full. Existing records were kept.");
                    // A second verified account at the destination login remains an independent follow.
                    result = payload.channels.map((c) => (c.id === current.id ? next : c));
                    store.put({ channels: result, savedAt: Date.now() }, "follows");
                    store.put(
                      {
                        ...journal,
                        revision: journal.revision + 1,
                        entries: [
                          ...journal.entries,
                          { ...evidence, sourceId: current.id, at: Date.now() },
                        ],
                      },
                      TWITCH_ALIAS_JOURNAL,
                    );
                  } catch (e) {
                    fail(e);
                  }
                };
                f.onsuccess = j.onsuccess = ready;
              },
              fail,
              false,
            );
          });
        } finally {
          db.close();
        }
      }, false),
  };
}
