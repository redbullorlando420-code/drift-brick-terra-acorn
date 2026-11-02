import type { LibraryVideo, Folder } from "./types";
import type { MediaHealthLedger } from "./media-health.ts";
import { videoIsPrivate } from "./public-visibility.ts";
import { adultFolderIds } from "./adult-providers.ts";
import { forEachCatalogSlice, yieldCatalogTask } from "../catalog-work.ts";
export type RecoveryGroup = {
  id: string;
  name: string;
  private: boolean;
  remote: boolean;
  count: number;
  videos: LibraryVideo[];
};
export async function collectRecoveryGroups(
  videos: readonly LibraryVideo[],
  folders: readonly Folder[],
  unavailable: Record<string, true>,
  ledger: MediaHealthLedger,
  all: boolean,
  signal: AbortSignal,
  query = "",
  unlocked = false,
) {
  const groups = new Map<string, RecoveryGroup>(),
    seen = new Set<string>(),
    byFolder = new Map(folders.map((f) => [f.id, f])),
    privateIds = adultFolderIds(folders);
  const add = (video: LibraryVideo) => {
    const row = ledger.entries[video.id],
      folder = byFolder.get(video.folderId);
    if (
      video.isSample ||
      (video.remote && video.remote.kind !== "twitch") ||
      (!row && !unavailable[video.id] && !(!video.remote && folder?.needsPermission))
    )
      return;
    const privateSource = videoIsPrivate(privateIds, video) || row?.private === true;
    if (
      query.trim() &&
      ((privateSource && !unlocked) ||
        !video.name.toLowerCase().includes(query.trim().toLowerCase()))
    )
      return;
    if (!all && row && (row.status === "available" || row.choice !== "review")) return;
    if (row) seen.add(video.id);
    const remote = !!video.remote,
      id = remote ? "twitch" : video.folderId,
      sourcePrivate = privateSource;
    let group = groups.get(id);
    if (!group) {
      group = {
        id,
        name: remote ? "Twitch videos & clips" : (folder?.name ?? "Disconnected local source"),
        private: sourcePrivate,
        remote,
        count: 0,
        videos: [],
      };
      groups.set(id, group);
    }
    group.private ||= sourcePrivate;
    group.count++;
    const at = (v: LibraryVideo) => ledger.entries[v.id]?.at ?? 0;
    let index = 0;
    while (
      index < group.videos.length &&
      (at(group.videos[index]!) < at(video) ||
        (at(group.videos[index]!) === at(video) &&
          group.videos[index]!.id.localeCompare(video.id) <= 0))
    )
      index++;
    if (index < 20) {
      group.videos.splice(index, 0, video);
      if (group.videos.length > 20) group.videos.pop();
    }
  };
  await forEachCatalogSlice(
    videos,
    (video) => {
      signal.throwIfAborted();
      add(video);
    },
    yieldCatalogTask,
  );
  for (const row of Object.values(ledger.entries)) {
    signal.throwIfAborted();
    if (!seen.has(row.video.id)) add(row.video);
  }
  return [...groups.values()];
}
