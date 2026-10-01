import type { VideoMetadataProvenance } from "./types";
export type CachedTagPatch = {
  beforeTags: string[] | undefined; beforeProvenance: VideoMetadataProvenance | undefined;
  tags: string[]; provenance: VideoMetadataProvenance;
};
/** Idle normalization may overlap a manual edit or a pull. Commit sparse
 * patches only while their original values still match; clone each ledger once. */
export function applyCachedTagPatches(tags: Record<string, string[]>, provenance: Record<string, VideoMetadataProvenance>, patches: ReadonlyMap<string, CachedTagPatch>) {
  let nextTags = tags, nextProvenance = provenance;
  for (const [id, patch] of patches) {
    if (tags[id] !== patch.beforeTags || provenance[id] !== patch.beforeProvenance || provenance[id]?.lockedFields?.includes("tags")) continue;
    if (patch.tags !== tags[id]) {
      if (nextTags === tags) nextTags = {...tags};
      nextTags[id] = patch.tags;
    }
    if (nextProvenance === provenance) nextProvenance = {...provenance};
    nextProvenance[id] = patch.provenance;
  }
  return {tags:nextTags, metadataProvenance:nextProvenance};
}
