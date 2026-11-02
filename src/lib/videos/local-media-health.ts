import {localIdentitySnapshot} from './local-identity';
import type { LibraryVideo } from "./types";
import { getDirHandle, resolveLocalFile } from "./sources";
import { queryDirPermission } from "./scan";
import { fingerprintFile, sameFileFingerprint } from "./file-fingerprint.ts";
import type { MediaStatus } from "./media-health.ts";
/** Selected files/granted roots only. No prompt, disk walk, player or thumbnail. */
export async function inspectLocalMedia(
  video: LibraryVideo,
  signal: AbortSignal,
): Promise<{ status: MediaStatus; code: string }> {
  signal.throwIfAborted();
  const root = getDirHandle(video.folderId);
  if (root) {
    try {
      if ((await queryDirPermission(root)) !== "granted")
        return { status: "permission-needed", code: "permission" };
    } catch {
      return { status: "source-disconnected", code: "source-unreadable" };
    }
  }
  try {
    const file = await resolveLocalFile(video);
    signal.throwIfAborted();
    if (file.size !== video.size) return { status: "content-mismatch", code: "size-changed" };
    const expected=video.localIdentity?.proof??localIdentitySnapshot().fingerprints[video.id]?.proof;
    if (expected) {
      const proof = await fingerprintFile(file, signal);
      signal.throwIfAborted();
      if (!sameFileFingerprint(proof, expected))
        return { status: "content-mismatch", code: "fingerprint-changed" };
    }
    return {
      status: "available",
      code: expected ? "verified-contents" : "readable-granted-file",
    };
  } catch (e) {
    signal.throwIfAborted();
    const code = (e as { sourceCode?: string }).sourceCode;
    return {
      status:
        code === "NotFoundError"
          ? "missing-file"
          : code === "NotAllowedError" || code === "SecurityError"
            ? "permission-needed"
            : "source-disconnected",
      code:
        code === "NotFoundError"
          ? "missing-file"
          : code === "NotAllowedError" || code === "SecurityError"
            ? "permission"
            : "source-unreadable",
    };
  }
}
