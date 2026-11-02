import type { LibraryVideo } from "./types";
import { identityForLocation } from "./local-identity";
import { fingerprintFile, sameFileFingerprint } from "./file-fingerprint";
import { isCatalogDeleted } from "./persist";
/** Only previously approved locations need a content read during a source scan. */
export async function verifiedScannedIdentity(
  video: LibraryVideo,
  file: File,
  signal?: AbortSignal,
): Promise<LibraryVideo | null> {
  const move = identityForLocation(video.id);
  if (!move) return isCatalogDeleted(video) ? null : video;
  if (isCatalogDeleted(move.after)) return null;
  const proof = await fingerprintFile(file, signal ?? new AbortController().signal);
  if (sameFileFingerprint(proof, move.proof)) {
    if (video.id !== move.target.id) return null;
    return {
      ...video,
      id: move.canonicalId,
      name: move.after.name,
      ...(move.private ? { privateRetention: true } : {}),
      localIdentity: move.after.localIdentity,
    };
  }
  // A reused location is a different identity. Its original owner's saved marks
  // never attach to these new bytes, even when the filename and size match.
  const id = video.id + ":content:" + proof.digest;
  return {
    ...video,
    id,
    localIdentity: {
      version: 1,
      canonicalId: id,
      targetId: video.id,
      proof,
      previousPaths: [],
      revision: move.after.localIdentity!.revision,
    },
  };
}
