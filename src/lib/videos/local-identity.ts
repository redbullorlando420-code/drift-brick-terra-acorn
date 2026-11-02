import type { LibraryVideo } from "./types";
import { validFileFingerprint, type FileFingerprint } from "./file-fingerprint.ts";
export const FILE_IDENTITIES_KEY = "file-identities:v1";
export const IDENTITY_LIMITS = { fingerprints: 2048, moves: 128, bytes: 8 * 1024 * 1024 };
export type LocalIdentityRef = {
  version: 1;
  canonicalId: string;
  targetId: string;
  proof: FileFingerprint;
  previousPaths: string[];
  revision: number;
};
export type RecordedIdentity = { video: LibraryVideo; proof: FileFingerprint; private: boolean };
export type IdentityMove = {
  id: string;
  canonicalId: string;
  active: boolean;
  before: LibraryVideo;
  target: LibraryVideo;
  after: LibraryVideo;
  proof: FileFingerprint;
  private: boolean;
  at: number;
  previousId?: string;
  undoneAt?: number;
};
export type IdentityLedger = {
  version: 1;
  revision: number;
  fingerprints: Record<string, RecordedIdentity>;
  moves: IdentityMove[];
};
export function validLocalIdentityRef(raw: unknown): raw is LocalIdentityRef {
  const r = raw as LocalIdentityRef;
  return (
    !!r &&
    r.version === 1 &&
    typeof r.canonicalId === "string" &&
    !!r.canonicalId &&
    typeof r.targetId === "string" &&
    !!r.targetId &&
    validFileFingerprint(r.proof) &&
    Number.isSafeInteger(r.revision) &&
    r.revision > 0 &&
    Array.isArray(r.previousPaths) &&
    r.previousPaths.length <= 12 &&
    r.previousPaths.every((p) => typeof p === "string" && p.length <= 4096)
  );
}
export const emptyIdentities = (): IdentityLedger => ({
  version: 1,
  revision: 0,
  fingerprints: {},
  moves: [],
});
export function readIdentityLedger(raw: unknown): IdentityLedger {
  if (raw === undefined) return emptyIdentities();
  const r = raw as IdentityLedger;
  if (
    !r ||
    r.version !== 1 ||
    !Number.isSafeInteger(r.revision) ||
    r.revision < 0 ||
    !r.fingerprints ||
    typeof r.fingerprints !== "object" ||
    Array.isArray(r.fingerprints) ||
    Object.keys(r.fingerprints).length > IDENTITY_LIMITS.fingerprints ||
    !Array.isArray(r.moves) ||
    r.moves.length > IDENTITY_LIMITS.moves
  )
    throw Error("Unsupported file identity ledger. Existing mappings were kept.");
  const active = new Set<string>(),
    ids = new Set<string>();
  for (const [id, row] of Object.entries(r.fingerprints))
    if (
      !row?.video ||
      row.video.id !== id ||
      row.video.remote ||
      typeof row.private !== "boolean" ||
      !validFileFingerprint(row.proof) ||
      row.video.size !== row.proof.size
    )
      throw Error("Invalid recorded file identity. Existing mappings were kept.");
  for (const move of r.moves) {
    if (
      !move ||
      typeof move.id !== "string" ||
      !move.id ||
      ids.has(move.id) ||
      typeof move.active !== "boolean" ||
      typeof move.private !== "boolean" ||
      !move.before ||
      !move.target ||
      !move.after ||
      move.before.remote ||
      move.target.remote ||
      move.after.remote ||
      move.canonicalId !== move.before.id ||
      move.after.id !== move.canonicalId ||
      !validFileFingerprint(move.proof) ||
      move.target.size !== move.proof.size ||
      typeof move.at !== "number" ||
      !Number.isFinite(move.at) ||
      move.at < 0 ||
      (move.active && active.has(move.canonicalId))
    )
      throw Error("Invalid file move history. Existing mappings were kept.");
    ids.add(move.id);
    if (move.active) active.add(move.canonicalId);
  }
  if (JSON.stringify(r).length > IDENTITY_LIMITS.bytes)
    throw Error("The file identity ledger is full. Existing mappings were kept.");
  for (const move of r.moves)
    if (
      !validLocalIdentityRef(move.after.localIdentity) ||
      move.after.localIdentity.canonicalId !== move.canonicalId ||
      move.after.localIdentity.targetId !== move.target.id ||
      move.after.localIdentity.proof.digest !== move.proof.digest
    )
      throw Error("Invalid file identity mapping. Existing mappings were kept.");
  return r;
}
const indexes = new WeakMap<IdentityLedger, Map<string, IdentityMove>>();
function identityIndex(ledger: IdentityLedger) {
  let index = indexes.get(ledger);
  if (index) return index;
  index = new Map();
  const active = new Map(
    ledger.moves.filter((row) => row.active).map((row) => [row.canonicalId, row]),
  );
  for (const row of active.values()) {
    index.set(row.canonicalId, row);
    index.set(row.target.id, row);
  }
  for (const row of ledger.moves) {
    const current = active.get(row.canonicalId);
    if (current && !row.active && !row.undoneAt && !index.has(row.target.id))
      index.set(row.target.id, current);
  }
  for (const row of Object.values(ledger.fingerprints)) {
    const ref = row.video.localIdentity;
    if (!ref || active.has(row.video.id)) continue;
    const current: IdentityMove = {
      id: "recorded:" + row.video.id,
      canonicalId: row.video.id,
      active: false,
      before: row.video,
      target: { ...row.video, id: ref.targetId },
      after: row.video,
      proof: row.proof,
      private: row.private,
      at: row.proof.at,
    };
    index.set(row.video.id, current);
    index.set(ref.targetId, current);
  }
  indexes.set(ledger, index);
  return index;
}
let state = emptyIdentities(),
  byCanonical = new Map<string, IdentityMove>(),
  byTarget = new Map<string, IdentityMove>();
export function installIdentityLedger(next: IdentityLedger) {
  state = next;
  byCanonical = new Map(
    next.moves.filter((row) => row.active).map((row) => [row.canonicalId, row]),
  );
  byTarget = identityIndex(next);
}
export function localIdentitySnapshot() {
  return state;
}
export function identityForCanonical(id: string) {
  return byCanonical.get(id);
}
export function identityForLocation(id: string) {
  return byTarget.get(id) ?? byCanonical.get(id);
}
export function canonicalLocalId(id: string) {
  return byTarget.get(id)?.canonicalId ?? id;
}
export function identityAdmissionAllowed(video: LibraryVideo, ledger = state) {
  if (video.remote) return true;
  const match = identityIndex(ledger).get(video.id);
  if (!match) return true;
  const ref = video.localIdentity;
  return (
    video.id === match.canonicalId &&
    video.folderId === match.target.folderId &&
    video.path === match.target.path &&
    validLocalIdentityRef(ref) &&
    ref.targetId === match.target.id &&
    ref.revision === match.after.localIdentity!.revision &&
    ref.canonicalId === match.canonicalId &&
    ref.proof.digest === match.proof.digest &&
    ref.proof.size === match.proof.size
  );
}
