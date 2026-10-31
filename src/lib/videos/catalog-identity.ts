import { youtubeVideoKey } from "../remote/youtube-sources.ts";
import { twitchIdentityKeys } from "./twitch-identity.ts";
import type { LibraryVideo } from "./types";
export function catalogIdentityKeys(video: LibraryVideo): string[] {
  const youtube = youtubeVideoKey(video);
  return youtube ? [youtube] : twitchIdentityKeys(video);
}
export function catalogIdentityKey(video: LibraryVideo): string | undefined {
  return catalogIdentityKeys(video)[0];
}
export function lookupCatalogIdentity<T>(
  index: ReadonlyMap<string, T>,
  video: LibraryVideo,
): T | undefined {
  for (const key of [video.id, ...catalogIdentityKeys(video)]) {
    const row = index.get(key);
    if (row !== undefined) return row;
  }
}
