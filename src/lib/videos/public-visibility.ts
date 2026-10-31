import type { LibraryVideo } from "./types.ts";
import { adultFolderIds, ADULT_PULL_PROVIDERS } from "./adult-providers.ts";
const adult = new Set<string>(ADULT_PULL_PROVIDERS);
export type PublicFolder = { id: string; adult?: boolean };
export function videoIsPrivate(privateIds: ReadonlySet<string>, video: LibraryVideo) {
  return (
    adult.has(video.remote?.kind ?? "") ||
    privateIds.has(video.folderId) ||
    (video.remote?.sourceIds ?? []).some((id) => privateIds.has(id))
  );
}
/** Public surfaces never inherit permission from unlocking the private desk.
 * A merged title keeps the most restrictive source membership. */
export function publicVideoBoundary(folders?: readonly PublicFolder[]) {
  const privateIds = adultFolderIds(folders??[]);
  return (video: LibraryVideo) => !videoIsPrivate(privateIds, video);
}
