import type { LibraryVideo } from './types';
export const MAX_PREVIEW_CANDIDATES = 4096;
/** Constant work at click time, even for a million-entry catalog. The owner
 * index is optional: never build a whole-catalog index while opening a card. */
export function previewCandidates(videos: readonly LibraryVideo[], target: LibraryVideo, owner: readonly LibraryVideo[] = [], limit = MAX_PREVIEW_CANDIDATES): LibraryVideo[] {
  const result = [target], seen = new Set([target.id]);
  const add = (video: LibraryVideo | undefined) => { if (video && !seen.has(video.id) && result.length < limit) { seen.add(video.id); result.push(video); } };
  const ownerLimit = Math.min(owner.length, 512, Math.floor(limit / 4));
  for (let index = 0; index < ownerLimit; index++) add(owner[Math.floor(index * owner.length / ownerLimit)]);
  // A deterministic uniform sample covers old and new entries without a scan
  // or sort. Sampling positions change with the selected title.
  let hash = 2166136261;
  for (const character of target.id) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
  const count = Math.min(videos.length, limit);
  const shift = videos.length ? hash % videos.length : 0;
  for (let index = 0; index < count; index++) add(videos[(Math.floor(index * videos.length / count) + shift) % videos.length]);
  return result;
}
