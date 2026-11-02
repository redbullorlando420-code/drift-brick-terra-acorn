import type { LibraryVideo } from "./types";
import { catalogIdentityKeys } from "./catalog-identity.ts";
import type { WriterLease } from "../writer-lease.ts";

export const DELETIONS_KEY = "catalog-deletions:v1";
export const DELETION_LIMIT = 1024;
export type Deletion = {
  id: string;
  keys: string[];
  at: number;
  reason: "manual";
  private: boolean;
  video: LibraryVideo;
};
export type DeletionLedger = { version: 1; revision: number; entries: Deletion[] };
export const emptyDeletions = (): DeletionLedger => ({ version: 1, revision: 0, entries: [] });
export function deletionKeys(video: LibraryVideo): string[] {
  return [
    ...new Set([
      "id:" + video.id,
      ...catalogIdentityKeys(video),
      ...(video.remote?.kind &&
      !["youtube", "twitch"].includes(video.remote.kind) &&
      video.remote.videoId
        ? ["provider:" + video.remote.kind + ":" + video.remote.videoId]
        : []),
    ]),
  ];
}
export function readDeletions(raw: unknown): DeletionLedger {
  if (raw === undefined) return emptyDeletions();
  const row = raw as DeletionLedger;
  if (
    !row ||
    row.version !== 1 ||
    !Number.isSafeInteger(row.revision) ||
    row.revision < 0 ||
    !Array.isArray(row.entries) ||
    row.entries.length > DELETION_LIMIT
  )
    throw Error("Unsupported deletion recovery ledger. Existing records were kept.");
  const ids = new Set<string>();
  for (const item of row.entries) {
    if (
      !item ||
      typeof item.id !== "string" ||
      !item.id ||
      ids.has(item.id) ||
      item.reason !== "manual" ||
      typeof item.private !== "boolean" ||
      !Number.isFinite(item.at) ||
      item.at < 0 ||
      !Array.isArray(item.keys) ||
      !item.keys.length ||
      item.keys.length > 16 ||
      item.keys.some((k) => typeof k !== "string" || !k || k.length > 4096) ||
      !item.video ||
      item.video.id !== item.id ||
      typeof item.video.name !== "string" ||
      typeof item.video.folderId !== "string" ||
      typeof item.video.path !== "string"
    )
      throw Error("Invalid deletion recovery entry. Existing records were kept.");
    if (JSON.stringify(item.video).length > 16 * 1024)
      throw Error("Invalid deletion recovery budget. Existing records were kept.");
    ids.add(item.id);
  }
  return row;
}
export function deletedBy(ledger: DeletionLedger, video: LibraryVideo): Deletion | undefined {
  const keys = new Set(deletionKeys(video));
  return ledger.entries.find((row) => row.keys.some((key) => keys.has(key)));
}
export function deletionCard(video: LibraryVideo): LibraryVideo {
  const r = video.remote;
  const card: LibraryVideo = {
    id: video.id,
    folderId: video.folderId,
    name: video.name,
    path: video.path,
    extension: video.extension,
    mime: video.mime,
    size: video.size,
    addedAt: video.addedAt,
    ...(video.privateRetention ? { privateRetention: true } : {}),
    ...(video.localIdentity ? { localIdentity: video.localIdentity } : {}),
    ...(video.duration !== undefined ? { duration: video.duration } : {}),
    ...(video.year !== undefined ? { year: video.year } : {}),
    ...(video.genre ? { genre: video.genre } : {}),
    ...(r
      ? {
          remote: {
            kind: r.kind,
            videoId: r.videoId,
            channelId: r.channelId,
            channelName: r.channelName,
            watchUrl: r.watchUrl,
            embedUrl: r.embedUrl,
            live: r.live,
            twitchClipIdentity: r.twitchClipIdentity,
            twitchContent: r.twitchContent,
            sourceIds: r.sourceIds,
          },
        }
      : {}),
  };
  if (JSON.stringify(card).length > 16 * 1024)
    throw Error("This title exceeds the removal recovery budget. No deletion was saved.");
  return card;
}
/** One fenced transaction changes suppression and the actual catalog together. */
export function createDeletionRepository(open: () => Promise<IDBDatabase>, writer: WriterLease) {
  let snapshot = emptyDeletions(),
    error = "",
    keys = new Set<string>(),
    loaded = false;
  const listeners = new Set<() => void>();
  const publish = (next: DeletionLedger) => {
    if (loaded && next.revision <= snapshot.revision && !error) return;
    loaded = true;
    snapshot = next;
    keys = new Set(next.entries.flatMap((row) => row.keys));
    error = "";
    for (const fn of listeners) fn();
  };
  async function hydrate() {
    const db = await open();
    try {
      const value = await new Promise<unknown>((resolve, reject) => {
        const r = db.transaction("remote-cache").objectStore("remote-cache").get(DELETIONS_KEY);
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      });
      publish(readDeletions(value));
      return snapshot;
    } catch (e) {
      error = e instanceof Error ? e.message : "Deletion recovery could not load.";
      for (const fn of listeners) fn();
      throw e;
    } finally {
      db.close();
    }
  }
  async function change(video: LibraryVideo | undefined, restoreId?: string, privateSource = true) {
    return writer.run(async () => {
      const db = await open();
      try {
        const result = await new Promise<DeletionLedger>((resolve, reject) => {
          let tx: IDBTransaction;
          try {
            tx = db.transaction(["remote-cache", "videos"], "readwrite", { durability: "strict" });
          } catch (e) {
            if (!(e instanceof TypeError)) throw e;
            tx = db.transaction(["remote-cache", "videos"], "readwrite");
          }
          const token = writer.current();
          let next: DeletionLedger;
          let failure: unknown;
          tx.oncomplete = () => resolve(next);
          tx.onabort = tx.onerror = () =>
            reject(failure ?? tx.error ?? Error("Removal was not saved. Previous data was kept."));
          if (!token) {
            tx.abort();
            return;
          }
          writer.guard(tx, token, () => {
            const remote = tx.objectStore("remote-cache"),
              read = remote.get(DELETIONS_KEY);
            read.onsuccess = () => {
              try {
                const current = readDeletions(read.result);
                next = current;
                if (current.revision >= Number.MAX_SAFE_INTEGER)
                  throw Error("Removal revision exhausted. Existing data was kept.");
                if (restoreId) {
                  const chosen = current.entries.find((row) => row.id === restoreId);
                  if (!chosen) return;
                  next = {
                    ...current,
                    revision: current.revision + 1,
                    entries: current.entries.filter((row) => row.id !== restoreId),
                  };
                  if (chosen.video.remote) remote.put(chosen.video, "video:" + chosen.id);
                  else tx.objectStore("videos").put(chosen.video);
                } else if (video) {
                  if (deletedBy(current, video)) return;
                  if (current.entries.length >= DELETION_LIMIT)
                    throw Error(
                      "Removal recovery is full. Restore a chosen title before removing another.",
                    );
                  const card = deletionCard(
                    privateSource ? { ...video, privateRetention: true } : video,
                  );
                  next = {
                    ...current,
                    revision: current.revision + 1,
                    entries: [
                      {
                        id: video.id,
                        keys: deletionKeys(video),
                        at: Date.now(),
                        reason: "manual",
                        private: privateSource,
                        video: card,
                      },
                      ...current.entries,
                    ],
                  };
                  remote.delete("video:" + video.id);
                  tx.objectStore("videos").delete(video.id);
                }
                remote.put(next, DELETIONS_KEY);
              } catch (e) {
                failure = e;
                error = e instanceof Error ? e.message : "Removal could not be saved.";
                tx.abort();
              }
            };
          });
        });
        publish(result);
        writer.markChanged();
        return result;
      } finally {
        db.close();
      }
    });
  }
  return {
    hydrate,
    remove: (video: LibraryVideo, privateSource = true) => change(video, undefined, privateSource),
    restore: (id: string) => change(undefined, id),
    getSnapshot: () => snapshot,
    getError: () => error,
    isDeleted: (video: LibraryVideo) => deletionKeys(video).some((key) => keys.has(key)),
    subscribe: (fn: () => void) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
  };
}
