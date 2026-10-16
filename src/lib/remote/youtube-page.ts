import type { LibraryVideo } from "../videos/types";
import { exactYoutubePublished, repairYoutubePublication } from '../videos/youtube-metadata.ts';

/** A continuation identifies a whole page. Consume it completely before
 * advancing, allowing at most one provider page beyond the requested budget. */
export function uniqueYoutubePage<T extends { videoId?: string }>(rows: T[], seen: Set<string>): T[] {
  const result: T[] = [];
  for (const row of rows) {
    if (!row.videoId || seen.has(row.videoId)) continue;
    seen.add(row.videoId);
    result.push(row);
  }
  return result;
}

export function youtubePublishedTime(value: string) {
  const exact = exactYoutubePublished(value);
  return exact ? Date.parse(exact) : 0;
}


/** This exact description was generated only for undated archive rows. */
export function repairLegacyYoutubeDate(video: LibraryVideo): LibraryVideo {
  return repairYoutubePublication(video);
}

