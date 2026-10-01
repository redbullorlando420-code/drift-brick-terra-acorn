import test from "node:test";
import assert from "node:assert/strict";
import { applyCachedTagPatches } from "./tag-patches.ts";
import type { VideoMetadataProvenance } from "./types.ts";
test("batched normalization preserves manual edits and tag locks made while it waited", () => {
  const beforeTags = ["old"], beforeProvenance: VideoMetadataProvenance = {tags:{old:"legacy"},updatedAt:1};
  const patch = {beforeTags,beforeProvenance,tags:["new"],provenance:{tags:{new:"provider:youtube" as const},updatedAt:2}};
  const tags = {edited:["manual"], locked:beforeTags, untouched:beforeTags};
  const provenance = {edited:beforeProvenance, locked:{...beforeProvenance,lockedFields:["tags"] as VideoMetadataProvenance["lockedFields"]}, untouched:beforeProvenance};
  const result = applyCachedTagPatches(tags, provenance, new Map([["edited",patch],["locked",patch],["untouched",patch]]));
  assert.equal(result.tags.edited, tags.edited);
  assert.equal(result.tags.locked, tags.locked);
  assert.deepEqual(result.tags.untouched, ["new"]);
  assert.equal(result.metadataProvenance.edited, provenance.edited);
  assert.equal(result.metadataProvenance.locked, provenance.locked);
});
test("obsolete patches do not allocate replacement catalog ledgers", () => {
  const tags = {id:["manual"]}, provenance: Record<string, VideoMetadataProvenance> = {id:{tags:{manual:"manual"},updatedAt:3}};
  const result = applyCachedTagPatches(tags, provenance, new Map([["id",{beforeTags:["old"],beforeProvenance:{tags:{old:"legacy"},updatedAt:1},tags:["new"],provenance:{tags:{new:"provider:youtube"},updatedAt:2}}]]));
  assert.equal(result.tags, tags);
  assert.equal(result.metadataProvenance, provenance);
});
