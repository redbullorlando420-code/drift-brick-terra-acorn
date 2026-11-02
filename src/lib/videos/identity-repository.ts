import type { WriterLease } from "../writer-lease";
import type { LibraryVideo } from "./types";
import { decodeSparseRecord } from "../sparse-record";
import { deletionCard, deletedBy, readDeletions, DELETIONS_KEY } from "./deletion-tombstones";
import {
  sameFileFingerprint,
  validFileFingerprint,
  type FileFingerprint,
} from "./file-fingerprint";
import {
  FILE_IDENTITIES_KEY,
  IDENTITY_LIMITS,
  emptyIdentities,
  readIdentityLedger,
  installIdentityLedger,
  type IdentityLedger,
  type IdentityMove,
} from "./local-identity";
type ObjectData = Record<string, unknown>;
const object = (value: unknown): ObjectData =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as ObjectData) : {};
const readField = (raw: unknown, field: string, id: string) => {
  const row = object(raw),
    meta = object(row.sparseMetadataRecords),
    activity = object(row.sparseActivityRecords);
  return decodeSparseRecord(
    (meta[field] ?? activity[field] ?? row[field]) as Record<string, unknown> | undefined,
  )?.[id];
};
const meaningful = (value: unknown): boolean =>
  typeof value === "number"
    ? value > 0
    : typeof value === "string"
      ? !!value.trim()
      : Array.isArray(value)
        ? !!value.length
        : !!value && typeof value === "object"
          ? !!Object.keys(value).length
          : value === true;
export function destinationHasSignals(docs: ReadonlyMap<string, unknown>, video: LibraryVideo) {
  for (const [key, value] of docs) {
    const row = object(value);
    if (key.startsWith("saved-edit:") || key.startsWith("catalog-metadata:")) {
      if (value !== undefined) return true;
      continue;
    }
    for (const field of [
      "ratings",
      "ratingHistory",
      "notes",
      "watchTime",
      "progress",
      "viewCounts",
      "cameCounts",
    ])
      if (meaningful(readField(row, field, video.id))) return true;
    for (const field of ["favorites", "likes", "hiddenVideoIds"])
      if (Array.isArray(row[field]) && (row[field] as unknown[]).includes(video.id)) return true;
    for (const field of ["history", "entries"])
      if (
        Array.isArray(row[field]) &&
        (row[field] as unknown[]).some((entry) => object(entry).id === video.id)
      )
        return true;
    const provenance = object(readField(row, "metadataProvenance", video.id)),
      tags = readField(row, "tags", video.id),
      origins = object(provenance.tags);
    if (
      Array.isArray(tags) &&
      tags.some(
        (tag) =>
          typeof tag === "string" &&
          (!origins[tag] || ["manual", "legacy", "youtube-review"].includes(String(origins[tag]))),
      )
    )
      return true;
    if (Array.isArray(provenance.lockedFields) && provenance.lockedFields.length) return true;
    if (meaningful(readField(row, "categories", video.id))) return true;
    for (const resumeKey of ["id:" + video.id, video.path])
      if (meaningful(readField(row, "resumeProgress", resumeKey))) return true;
    if (
      (key === "film-reviews" && object(row.versions)[video.id] !== undefined) ||
      (key === "anime-reviews" && object(row.episodes)[video.id] !== undefined)
    )
      return true;
  }
  return false;
}
const docsFor = (id: string) => [
  "preferences",
  "primary",
  "history",
  "resume",
  "marks",
  "shelves",
  "feedback",
  "film-reviews",
  "anime-reviews",
  "catalog-metadata:" + id,
  "saved-edit:favorites:" + id,
  "saved-edit:likes:" + id,
];
export function createIdentityRepository(open: () => Promise<IDBDatabase>, writer: WriterLease) {
  let snapshot = emptyIdentities(),
    loaded = false;
  const listeners = new Set<() => void>();
  const publish = (next: IdentityLedger) => {
    if (loaded && next.revision <= snapshot.revision) return;
    snapshot = next;
    loaded = true;
    installIdentityLedger(next);
    for (const fn of listeners) fn();
  };
  async function hydrate() {
    const db = await open();
    try {
      const raw = await new Promise<unknown>((yes, no) => {
        const r = db
          .transaction("remote-cache")
          .objectStore("remote-cache")
          .get(FILE_IDENTITIES_KEY);
        r.onsuccess = () => yes(r.result);
        r.onerror = () => no(r.error);
      });
      publish(readIdentityLedger(raw));
      return snapshot;
    } finally {
      db.close();
    }
  }
  type Action =
    | { kind: "record"; video: LibraryVideo; proof: FileFingerprint; private: boolean }
    | {
        kind: "move";
        sourceId: string;
        target: LibraryVideo;
        proof: FileFingerprint;
        expectedRevision: number;
      }
    | { kind: "undo"; moveId: string; expectedRevision: number };
  async function update(action: Action) {
    return writer.run(async () => {
      const db = await open();
      try {
        const next = await new Promise<IdentityLedger>((resolve, reject) => {
          let tx: IDBTransaction;
          try {
            tx = db.transaction(["remote-cache", "videos", "activity"], "readwrite", {
              durability: "strict",
            });
          } catch (e) {
            if (!(e instanceof TypeError)) throw e;
            tx = db.transaction(["remote-cache", "videos", "activity"], "readwrite");
          }
          let result: IdentityLedger, failure: unknown;
          tx.oncomplete = () => resolve(result);
          tx.onabort = tx.onerror = () =>
            reject(
              failure ??
                tx.error ??
                Error("Identity change was interrupted. Previous mapping was kept."),
            );
          const fail = (e: unknown) => {
              failure = e;
              tx.abort();
            },
            token = writer.current();
          if (!token) {
            fail(Error("Catalog ownership is required."));
            return;
          }
          writer.guard(
            tx,
            token,
            () => {
              const remote = tx.objectStore("remote-cache"),
                videos = tx.objectStore("videos"),
                activity = tx.objectStore("activity"),
                read = remote.get(FILE_IDENTITIES_KEY);
              read.onsuccess = () => {
                try {
                  const current = readIdentityLedger(read.result);
                  if (current.revision >= Number.MAX_SAFE_INTEGER)
                    throw Error("Identity revision exhausted. Existing mappings were kept.");
                  if (action.kind !== "record" && action.expectedRevision !== current.revision)
                    throw Error("Identity records changed. Verify and review this choice again.");
                  const move =
                    action.kind === "undo"
                      ? current.moves.find((row) => row.id === action.moveId && row.active)
                      : undefined;
                  if (action.kind === "undo" && !move)
                    throw Error("Only the current active move can be undone.");
                  const sourceId =
                    action.kind === "record"
                      ? action.video.id
                      : action.kind === "move"
                        ? action.sourceId
                        : move!.canonicalId;
                  const source = current.fingerprints[sourceId];
                  const requests: Array<{ key: string; request: IDBRequest }> = [
                    { key: "source", request: videos.get(sourceId) },
                    { key: "deletions", request: remote.get(DELETIONS_KEY) },
                  ];
                  if (action.kind === "move") {
                    if (!source)
                      throw Error(
                        "Record the original file fingerprint before selecting its new location.",
                      );
                    requests.push({ key: "target", request: videos.get(action.target.id) });
                    for (const key of docsFor(action.target.id))
                      requests.push({ key, request: activity.get(key) });
                  }
                  if (action.kind === "undo")
                    requests.push({ key: "target", request: videos.get(move!.target.id) });
                  const values = new Map<string, unknown>();
                  let left = requests.length;
                  for (const item of requests)
                    item.request.onsuccess = () => {
                      values.set(item.key, item.request.result);
                      if (--left) return;
                      try {
                        const original = values.get("source") as LibraryVideo | undefined,
                          deletions = readDeletions(values.get("deletions"));
                        let updated: IdentityLedger = {
                          ...current,
                          revision: current.revision + 1,
                        };
                        if (action.kind === "record") {
                          if (
                            !original ||
                            original.remote ||
                            original.id !== action.video.id ||
                            original.path !== action.video.path ||
                            original.size !== action.video.size ||
                            !validFileFingerprint(action.proof) ||
                            action.proof.size !== original.size
                          )
                            throw Error(
                              "The source changed. Reload it before recording its fingerprint.",
                            );
                          if (deletedBy(deletions, original))
                            throw Error(
                              "Restore this removed title before recording its identity.",
                            );
                          if (
                            current.fingerprints[sourceId] &&
                            !sameFileFingerprint(current.fingerprints[sourceId].proof, action.proof)
                          )
                            throw Error(
                              "This location contains different bytes. Undo or review the existing mapping first.",
                            );
                          if (
                            !current.fingerprints[sourceId] &&
                            Object.keys(current.fingerprints).length >= IDENTITY_LIMITS.fingerprints
                          )
                            throw Error(
                              "The fingerprint ledger is full. Existing records were kept.",
                            );
                          const video = deletionCard(
                            action.private ? { ...original, privateRetention: true } : original,
                          );
                          updated.fingerprints = {
                            ...current.fingerprints,
                            [sourceId]: { video, proof: action.proof, private: action.private },
                          };
                        } else if (action.kind === "move") {
                          const target = values.get("target") as LibraryVideo | undefined,
                            before = original ?? source!.video;
                          if (
                            !target ||
                            target.remote ||
                            target.localIdentity ||
                            target.id === sourceId ||
                            target.path !== action.target.path ||
                            target.folderId !== action.target.folderId ||
                            target.size !== action.target.size
                          )
                            throw Error(
                              "The destination changed or already owns an identity mapping. Review it again.",
                            );
                          if (
                            !validFileFingerprint(action.proof) ||
                            !sameFileFingerprint(source!.proof, action.proof) ||
                            action.proof.size !== target.size ||
                            Date.now() - action.proof.at > 5 * 60_000 ||
                            action.proof.at > Date.now() + 1000
                          )
                            throw Error(
                              "The complete file fingerprints do not match, or verification expired. Nothing was linked.",
                            );
                          if (
                            before.remote ||
                            before.path !== source!.video.path ||
                            before.size !== source!.video.size
                          )
                            throw Error(
                              "The original identity changed. Record and review its fingerprint again.",
                            );
                          if (deletedBy(deletions, before) || deletedBy(deletions, target))
                            throw Error("Restore removed titles before reviewing a file move.");
                          if (current.moves.length >= IDENTITY_LIMITS.moves)
                            throw Error(
                              "The reversible move history is full. Existing mappings were kept.",
                            );
                          if (
                            destinationHasSignals(
                              new Map(docsFor(target.id).map((key) => [key, values.get(key)])),
                              target,
                            )
                          )
                            throw Error(
                              "The destination already has saved choices. Nothing was merged. Per-field conflict review is required before combining those identities.",
                            );
                          const preferences = object(values.get("preferences")),
                            privateIds = Array.isArray(preferences.privateFolderIds)
                              ? preferences.privateFolderIds
                              : [];
                          const sourcePrivate =
                            source!.private ||
                            before.privateRetention === true ||
                            privateIds.includes(before.folderId);
                          const targetPrivate =
                            target.privateRetention === true ||
                            privateIds.includes(target.folderId);
                          if (sourcePrivate && !targetPrivate)
                            throw Error(
                              "A private title needs a private destination. Mark that source private before linking it.",
                            );
                          const previous = current.moves.find(
                              (row) => row.active && row.canonicalId === sourceId,
                            ),
                            privateSource = sourcePrivate || targetPrivate;
                          const after: LibraryVideo = {
                            ...deletionCard(before),
                            folderId: target.folderId,
                            path: target.path,
                            size: target.size,
                            mime: target.mime,
                            extension: target.extension,
                            ...(privateSource ? { privateRetention: true } : {}),
                            localIdentity: {
                              version: 1,
                              canonicalId: sourceId,
                              targetId: target.id,
                              proof: action.proof,
                              previousPaths: [
                                ...new Set([
                                  before.path,
                                  ...(before.localIdentity?.previousPaths ?? []),
                                ]),
                              ].slice(0, 12),
                              revision: updated.revision,
                            },
                          };
                          const record: IdentityMove = {
                            id: "move:" + updated.revision,
                            canonicalId: sourceId,
                            active: true,
                            before: deletionCard(
                              sourcePrivate ? { ...before, privateRetention: true } : before,
                            ),
                            target: deletionCard(
                              targetPrivate ? { ...target, privateRetention: true } : target,
                            ),
                            after,
                            proof: action.proof,
                            private: privateSource,
                            at: Date.now(),
                            ...(previous ? { previousId: previous.id } : {}),
                          };
                          updated.fingerprints = {
                            ...current.fingerprints,
                            [sourceId]: {
                              video: after,
                              proof: action.proof,
                              private: privateSource,
                            },
                          };
                          updated.moves = [
                            record,
                            ...current.moves.map((row) =>
                              row.canonicalId === sourceId ? { ...row, active: false } : row,
                            ),
                          ];
                          videos.delete(target.id);
                          videos.put(after);
                        } else {
                          if (
                            !original ||
                            original.path !== move!.after.path ||
                            original.folderId !== move!.after.folderId
                          )
                            throw Error(
                              "The current file mapping changed. Review the active identity before Undo.",
                            );
                          if (values.get("target") !== undefined)
                            throw Error(
                              "The old destination ID is occupied. No saved title was overwritten.",
                            );
                          if (deletedBy(deletions, original) || deletedBy(deletions, move!.target))
                            throw Error(
                              "Restore the chosen removed title before undoing its move.",
                            );
                          const restored = {
                            ...original,
                            folderId: move!.before.folderId,
                            path: move!.before.path,
                            localIdentity: move!.before.localIdentity ?? {
                              version: 1 as const,
                              canonicalId: sourceId,
                              targetId: sourceId,
                              proof: move!.proof,
                              previousPaths: [move!.after.path],
                              revision: updated.revision,
                            },
                            privateRetention: move!.before.privateRetention,
                          };
                          videos.put(restored);
                          videos.put(move!.target);
                          updated.fingerprints = {
                            ...current.fingerprints,
                            [sourceId]: {
                              video: restored,
                              proof: move!.proof,
                              private: move!.before.privateRetention === true,
                            },
                          };
                          updated.moves = current.moves.map((row) =>
                            row.id === move!.id
                              ? { ...row, active: false, undoneAt: Date.now() }
                              : row.id === move!.previousId
                                ? { ...row, active: true }
                                : row,
                          );
                        }
                        readIdentityLedger(updated);
                        remote.put(updated, FILE_IDENTITIES_KEY);
                        result = updated;
                      } catch (e) {
                        fail(e);
                      }
                    };
                } catch (e) {
                  fail(e);
                }
              };
            },
            fail,
            action.kind !== "record",
          );
        });
        publish(next);
        if (action.kind !== "record") writer.markChanged();
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
    record: (video: LibraryVideo, proof: FileFingerprint, privateSource: boolean) =>
      update({ kind: "record", video, proof, private: privateSource }),
    move: (
      sourceId: string,
      target: LibraryVideo,
      proof: FileFingerprint,
      expectedRevision: number,
    ) => update({ kind: "move", sourceId, target, proof, expectedRevision }),
    undo: (moveId: string, expectedRevision: number) =>
      update({ kind: "undo", moveId, expectedRevision }),
  };
}
