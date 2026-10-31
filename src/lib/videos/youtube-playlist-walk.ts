import type { FollowedChannel, LibraryVideo } from "./types";
import { forEachCatalogSlice, yieldCatalogTask } from "../catalog-work.ts";

export type PlaylistWalk = {
  version: 1;
  id: string;
  startedAt: number;
  at: number;
  count: number;
  fromStart: boolean;
  completed: boolean;
  nextCursor?: string;
  membership: "provisional" | "confirmed";
};
export type PlaylistMembership = { walk: string; order: number; at: number };
export function normalizePlaylistWalk(raw: unknown): PlaylistWalk | undefined {
  if (!raw || typeof raw !== "object") return;
  const r = raw as PlaylistWalk;
  if (
    r.version !== 1 ||
    typeof r.id !== "string" ||
    !/^[\w-]{1,100}$/.test(r.id) ||
    ![r.startedAt, r.at].every((n) => Number.isFinite(n) && n > 0) ||
    r.at < r.startedAt ||
    !Number.isSafeInteger(r.count) ||
    r.count < 0 ||
    r.count > 1_000_000 ||
    typeof r.fromStart !== "boolean" ||
    typeof r.completed !== "boolean" ||
    !["provisional", "confirmed"].includes(r.membership) ||
    (r.nextCursor !== undefined &&
      (typeof r.nextCursor !== "string" || !r.nextCursor.length || r.nextCursor.length > 16_384))
  )
    return;
  return {
    version: 1,
    id: r.id,
    startedAt: r.startedAt,
    at: r.at,
    count: r.count,
    fromStart: r.fromStart,
    completed: r.completed,
    nextCursor: r.nextCursor,
    membership: r.completed && r.fromStart ? r.membership : "provisional",
  };
}
/** A suffix without its matching root checkpoint cannot prove membership. */
export function markPlaylistWalk(
  channel: FollowedChannel,
  videos: LibraryVideo[],
  cursor: string | undefined,
  completed: boolean,
  previous?: PlaylistWalk,
  resume?: string,
  at = Date.now(),
): { channel: FollowedChannel; videos: LibraryVideo[] } {
  const saved = normalizePlaylistWalk(previous);
  const continued = !!resume && saved?.nextCursor === resume && !saved.completed;
  const start = continued ? saved! : undefined;
  const walk: PlaylistWalk = {
    version: 1,
    id: start?.id ?? `${at.toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
    startedAt: start?.startedAt ?? at,
    at,
    count: (start?.count ?? 0) + videos.length,
    fromStart: !resume || !!start?.fromStart,
    completed,
    nextCursor: cursor,
    membership: "provisional",
  };
  return {
    channel: {
      ...channel,
      catalogCursor: cursor,
      catalogCheckedAt: at,
      catalogExhaustedAt: completed ? at : undefined,
      playlistWalk: walk,
    },
    videos: videos.map((video, index) => ({
      ...video,
      remote: {
        ...video.remote!,
        playlistMemberships: {
          ...video.remote?.playlistMemberships,
          [channel.id]: { walk: walk.id, order: (start?.count ?? 0) + index, at },
        },
      },
    })),
  };
}
/** Only a complete root walk with every distinct row admitted may remove an
 * edge. Never delete the canonical card, its id, or personal feedback. Work
 * cooperatively and rebase at the store boundary if the snapshot changed. */
export async function reconcilePlaylistWalks(videos: LibraryVideo[], channels: FollowedChannel[]) {
  const candidates = channels.filter(
    (c) =>
      c.id.startsWith("ytpl:") &&
      c.playlistWalk?.completed &&
      c.playlistWalk.fromStart &&
      c.playlistWalk.membership === "provisional",
  );
  if (!candidates.length) return { videos, channels, changed: [] as LibraryVideo[] };
  const counts = new Map(candidates.map((c) => [c.id, 0])),
    byId = new Map(candidates.map((c) => [c.id, c.playlistWalk!]));
  await forEachCatalogSlice(
    videos,
    (v) => {
      for (const [id, edge] of Object.entries(v.remote?.playlistMemberships ?? {}))
        if (edge.walk === byId.get(id)?.id) counts.set(id, (counts.get(id) ?? 0) + 1);
    },
    yieldCatalogTask,
  );
  const confirmed = new Set(
    candidates.filter((c) => counts.get(c.id) === c.playlistWalk!.count).map((c) => c.id),
  );
  if (!confirmed.size) return { videos, channels, changed: [] as LibraryVideo[] };
  const changed: LibraryVideo[] = [],
    out: LibraryVideo[] = [],
    folderDeltas = new Map<string, number>();
  await forEachCatalogSlice(
    videos,
    (video) => {
      if (video.remote?.kind !== "youtube") {
        out.push(video);
        return;
      }
      const sources = new Set([video.folderId, ...(video.remote.sourceIds ?? [])]);
      const removed = [...sources].filter(
        (id) =>
          confirmed.has(id) && video.remote!.playlistMemberships?.[id]?.walk !== byId.get(id)!.id,
      );
      if (!removed.length) {
        out.push(video);
        return;
      }
      const memberships = { ...video.remote.playlistMemberships };
      for (const id of removed) {
        sources.delete(id);
        delete memberships[id];
      }
      const folderId = sources.has(video.folderId)
        ? video.folderId
        : ([...sources][0] ?? "youtube:retained");
      sources.add(folderId);
      const next = {
        ...video,
        folderId,
        remote: { ...video.remote, sourceIds: [...sources], playlistMemberships: memberships },
      };
      out.push(next);
      changed.push(next);
      if (folderId !== video.folderId) {
        folderDeltas.set(video.folderId, (folderDeltas.get(video.folderId) ?? 0) - 1);
        folderDeltas.set(folderId, (folderDeltas.get(folderId) ?? 0) + 1);
      }
    },
    yieldCatalogTask,
  );
  return {
    videos: changed.length ? out : videos,
    changed,
    folderDeltas,
    channels: channels.map((c) =>
      confirmed.has(c.id)
        ? { ...c, playlistWalk: { ...c.playlistWalk!, membership: "confirmed" as const } }
        : c,
    ),
  };
}
