import type { VideoMetadataProvenance } from "./types";
import { sparseRecordBuilder } from '../sparse-record.ts';
export type CachedTagPatch = {
  beforeTags: string[] | undefined; beforeProvenance: VideoMetadataProvenance | undefined;
  tags: string[]; provenance: VideoMetadataProvenance;
};
/** Idle normalization may overlap a manual edit or a pull. Commit sparse
 * patches only while their original values still match; share unchanged entries. */
export function applyCachedTagPatches(tags: Record<string, string[]>, provenance: Record<string, VideoMetadataProvenance>, patches: ReadonlyMap<string, CachedTagPatch>) {
  const nextTags = sparseRecordBuilder(tags), nextProvenance = sparseRecordBuilder(provenance);
  for (const [id, patch] of patches) {
    if (tags[id] !== patch.beforeTags || provenance[id] !== patch.beforeProvenance || provenance[id]?.lockedFields?.includes("tags")) continue;
    if (patch.tags !== tags[id]) {
      nextTags.set(id, patch.tags);
    }
    nextProvenance.set(id, patch.provenance);
  }
  return {tags:nextTags.finish(), metadataProvenance:nextProvenance.finish()};
}
