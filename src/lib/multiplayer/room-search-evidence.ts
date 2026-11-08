import {
  catalogRequestCurrent,
  roomCatalogAllows,
  roomCatalogRequestAllowed,
  type RoomCatalogState,
} from "./room-catalog-policy.ts";
import { roomMediaKey } from "./room-media.ts";
import type { LibraryVideo } from "../videos/types.ts";

export type RoomSearchEvidence =
  { source: "host"; revision: number } | { source: "library" | "public" };

export function readRoomSearchEvidence(value: unknown): RoomSearchEvidence | undefined {
  if (!value || typeof value !== "object") return;
  const row = value as { source?: unknown; revision?: unknown };
  if (
    row.source === "host" &&
    typeof row.revision === "number" &&
    Number.isSafeInteger(row.revision) &&
    row.revision >= 0
  )
    return { source: "host", revision: row.revision };
  if ((row.source === "library" || row.source === "public") && row.revision === undefined)
    return { source: row.source };
}

/** A guest label is never permission. Host evidence is checked against the
 * current exact provider/opaque local identity, even if it is already queued. */
export function roomSearchEvidenceAllows(
  state: RoomCatalogState,
  video: LibraryVideo,
  evidence: unknown,
  legacyRevision: unknown,
  activeKeys: readonly string[],
) {
  const parsed = readRoomSearchEvidence(evidence);
  if (evidence !== undefined && !parsed) return false;
  if (parsed?.source === "host") {
    const key = roomMediaKey(video),
      known = state.index?.known.get(key);
    return (
      !state.pending &&
      !!known &&
      catalogRequestCurrent(state.revision, parsed.revision) &&
      !state.index?.blocked.has(key) &&
      roomCatalogAllows(state.index, state.policy)(known)
    );
  }
  if (parsed && !video.remote) return false;
  return roomCatalogRequestAllowed(state, video, legacyRevision, activeKeys);
}

export function roomSearchAvailability(
  video: LibraryVideo,
  source: RoomSearchEvidence["source"],
  guest: boolean,
) {
  if (video.remote)
    return video.remote.kind === "twitch" &&
      (video.extension === "clip" || video.remote.embedUrl?.includes("clips.twitch.tv"))
      ? "Public clip · player support varies by device"
      : "Public provider video · playback depends on the provider and device";
  return source === "host"
    ? "Host file · the host must provide playback; no file path is shared"
    : guest
      ? "On this device · the host cannot open this file"
      : "On this device · played from the host";
}
