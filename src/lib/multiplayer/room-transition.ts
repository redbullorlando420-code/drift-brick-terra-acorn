/** Local versioned interpretation of existing selection fields. Clock packets
 * can update an established selection; only a host video/state packet may replace it. */
export type RoomTransition = { version: 1; selection: number; mediaId: string };
export function transitionIntent(selection: unknown, mediaId: unknown): RoomTransition | undefined {
  if (
    typeof selection !== "number" ||
    !Number.isSafeInteger(selection) ||
    selection < 0 ||
    typeof mediaId !== "string" ||
    mediaId.length > 600
  )
    return;
  return { version: 1, selection, mediaId };
}
export function acceptsRoomTransition(
  current: RoomTransition | undefined,
  packet: { type?: string; selectionRevision?: unknown; videoId?: unknown },
) {
  if (!["video", "room-state", "sync"].includes(packet.type ?? "")) return false;
  const next = transitionIntent(
    packet.selectionRevision === undefined ? 0 : packet.selectionRevision,
    packet.videoId,
  );
  if (packet.type === "video" && !next?.mediaId) return false;
  if (!next)
    return (
      packet.selectionRevision === undefined &&
      (!current || current.selection === 0) &&
      packet.videoId === undefined &&
      packet.type === "sync"
    );
  if (!current) return packet.type === "video" || packet.type === "room-state";
  if (next.selection < current.selection) return false;
  if (
    next.selection === current.selection &&
    next.mediaId !== current.mediaId &&
    !(current.selection === 0 && packet.type !== "sync")
  )
    return false;
  return packet.type === "sync"
    ? next.selection === current.selection && next.mediaId === current.mediaId
    : true;
}
