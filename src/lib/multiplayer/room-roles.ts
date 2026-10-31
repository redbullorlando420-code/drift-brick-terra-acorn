export type RoomPermissions = {
  queue: boolean;
  review: boolean;
  playback: boolean;
  seeking: boolean;
};
export const ROOM_ROLES = {
  viewer: {
    label: "Viewer",
    detail: "Chat, Ready and voting; the host selects videos and controls playback.",
    permissions: { queue: false, review: false, playback: false, seeking: false },
  },
  contributor: {
    label: "Contributor",
    detail: "Suggest public videos for host review; the host controls playback and queue order.",
    permissions: { queue: true, review: true, playback: false, seeking: false },
  },
  controller: {
    label: "Co-controller",
    detail: "Edit the queue, select videos, play, pause and seek supported videos.",
    permissions: { queue: true, review: false, playback: true, seeking: true },
  },
} as const;
export type RoomRole = keyof typeof ROOM_ROLES;
export function sameRoomPermissions(a: RoomPermissions, b: RoomPermissions) {
  return (
    a.queue === b.queue &&
    a.review === b.review &&
    a.playback === b.playback &&
    a.seeking === b.seeking
  );
}
export function roomRoleFor(p: RoomPermissions): RoomRole | "custom" {
  return (
    (Object.keys(ROOM_ROLES) as RoomRole[]).find((role) =>
      sameRoomPermissions(p, ROOM_ROLES[role].permissions),
    ) ?? "custom"
  );
}
const QUEUE_INTENTS = new Set([
  "queue-suggest",
  "queue-action",
  "queue-edit",
  "queue-batch",
  "queue-shuffle",
  "queue-request",
  "next-request",
  "video-request",
  "local-queue-request",
  "local-stage-request",
]);
/** Evaluated by the host immediately before every guest mutation. Revision zero
 * accepts legacy packets; after any policy edit an older client must refresh. */
export function roomIntentAccess(
  p: RoomPermissions,
  revision: number,
  packet: { type?: string; permissionRevision?: unknown; seek?: unknown },
  live = false,
) {
  const queue = QUEUE_INTENTS.has(packet.type ?? ""),
    playback = packet.type === "sync-request";
  if (!queue && !playback) return { mutation: false as const, allowed: true as const };
  const incoming = packet.permissionRevision === undefined ? 0 : packet.permissionRevision;
  if (!Number.isSafeInteger(incoming) || incoming !== revision)
    return {
      mutation: true as const,
      allowed: false as const,
      queue,
      reason: "Room controls changed. Refresh the host state and send a new request.",
    };
  if (queue && (!p.queue || (p.review && packet.type !== "queue-suggest")))
    return {
      mutation: true as const,
      allowed: false as const,
      queue,
      reason: p.queue
        ? "The host is reviewing suggestions. Suggest a public video instead of editing the live queue."
        : "The host has locked queue edits and video selection. Chat, Ready and voting remain available.",
    };
  if (playback && (packet.seek === true ? live || !p.seeking : !p.playback))
    return {
      mutation: true as const,
      allowed: false as const,
      queue,
      reason:
        live && packet.seek === true
          ? "Live streams keep their own playback clock."
          : packet.seek === true
            ? "The host is handling timeline seeking. Readiness, voting and chat are still available."
            : "The host is handling play and pause. Readiness, voting and chat are still available.",
    };
  return { mutation: true as const, allowed: true as const, queue };
}
