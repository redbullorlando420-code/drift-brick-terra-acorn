import type { LibraryPackBuildInput } from "./library-pack";
import {
  packObject,
  writePackStream,
  type PackSection,
  type PackWriteStats,
  PACK_LIMITS,
} from "./pack-stream.ts";
import { yieldCatalogTask } from "../catalog-work.ts";

/** References are captured once at the explicit export click. No provider,
 * media handle, token, session cookie or transient preview is included. */
export function* libraryPackSections(
  input: LibraryPackBuildInput,
  feedback: Record<string, unknown>,
  extras: Record<string, unknown> = {},
): Generator<PackSection> {
  const array = (file: string, field: string, data: unknown): PackSection => ({
    file,
    field,
    shape: "array",
    data: data ?? [],
  });
  const map = (file: string, field: string, data: unknown): PackSection => ({
    file,
    field,
    shape: "map",
    data: data ?? {},
  });
  yield array(
    "follows/youtube.json",
    "channels",
    input.follows.filter((c) => c.kind === "youtube"),
  );
  yield array(
    "follows/twitch.json",
    "channels",
    input.follows.filter((c) => c.kind === "twitch"),
  );
  yield array("history/history.json", "entries", input.history);
  yield array("links/links.json", "links", input.links);
  yield array("marks/shelves.json", "favorites", input.favorites);
  yield array("marks/shelves.json", "likes", input.likes);
  yield map("marks/view-counts.json", "$", input.viewCounts);
  yield map("marks/came-counts.json", "$", input.cameCounts);
  yield map("resume/resume.json", "progress", input.progress);
  yield map("resume/resume.json", "resumeProgress", input.resumeProgress);
  for (const field of [
    "ratings",
    "ratingHistory",
    "notes",
    "creatorRatings",
    "creatorLikes",
    "creatorFavorites",
    "watchTime",
  ])
    yield map("marks/ratings.json", field, feedback[field]);
  for (const field of ["tagLikes", "tagHeartHistory"])
    yield map("marks/tag-hearts.json", field, feedback[field]);
  if (feedback.recommendationRejections)
    extras = {
      ...extras,
      "marks/recommendation-rejections.json": feedback.recommendationRejections,
    };
  yield array("photos/sources.json", "sources", input.photoSources);
  yield array("photos/likes.json", "likes", input.photoLikes);
  yield map("photos/likes.json", "meta", input.photoMeta);
  for (const [file, data] of Object.entries(extras)) {
    if (file === "follows/collections.json") yield array(file, "collections", data);
    else if (packObject(data)) {
      for (const [field, value] of Object.entries(data))
        yield {
          file,
          field,
          shape: Array.isArray(value) ? "array" : packObject(value) ? "map" : "value",
          data: value,
        };
    } else yield { file, field: "$", shape: "value", data };
  }
}

export type PackSink = {
  write: (bytes: Uint8Array) => Promise<void>;
  close: () => Promise<void>;
  abort: () => Promise<void>;
};
export async function exportStreamingPack(
  sections: Iterable<PackSection>,
  sink: PackSink,
  options: {
    signal?: AbortSignal;
    progress?: (stats: PackWriteStats) => void;
    turn?: () => Promise<void>;
  } = {},
) {
  try {
    const stats = await writePackStream(sections, (bytes) => sink.write(bytes), {
      ...options,
      turn: options.turn ?? yieldCatalogTask,
    });
    options.signal?.throwIfAborted();
    await sink.close();
    return stats;
  } catch (error) {
    await sink.abort().catch(() => {});
    throw error;
  }
}

/** The download fallback retains the final file bytes (up to 128 MiB), not
 * duplicate full JSON strings. The streaming scratch budget is separate. */
export function packBlobSink() {
  let parts: Uint8Array[] = [],
    size = 0,
    blob: Blob | undefined;
  const sink: PackSink = {
    async write(bytes) {
      if (size + bytes.length > PACK_LIMITS.bytes) throw Error("Download exceeds 128 MiB.");
      parts.push(bytes);
      size += bytes.length;
    },
    async close() {
      blob = new Blob(parts as BlobPart[], { type: "application/x-reelcase-library-pack" });
      parts = [];
    },
    async abort() {
      parts = [];
      size = 0;
      blob = undefined;
    },
  };
  return { sink, result: () => blob, retainedBytes: () => size };
}
export function downloadPackBlob(blob: Blob) {
  const url = URL.createObjectURL(blob),
    link = document.createElement("a");
  link.href = url;
  link.download = "reelcase-library-" + new Date().toISOString().slice(0, 10) + ".reelpack";
  link.click();
  // Leave time for browsers to start the download, then release the final file.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
