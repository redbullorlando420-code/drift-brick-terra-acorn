export const PLAYER_STATES = [
  "idle",
  "loading",
  "ready",
  "playing",
  "paused",
  "buffering",
  "blocked",
  "error",
  "unsupported",
  "waiting",
  "ended",
] as const;
export type PlayerReadinessStatus = (typeof PLAYER_STATES)[number];
export type PlayerCapability = "none" | "youtube" | "twitch" | "local" | "clip";
export type RoomPlayerReadiness = {
  selection: number;
  status: PlayerReadinessStatus;
  capability: PlayerCapability;
};
/** No clocks, media identities, error text or personal device details go over the wire. */
export function readPlayerReadiness(raw: unknown): RoomPlayerReadiness | undefined {
  if (!raw || typeof raw !== "object") return;
  const r = raw as RoomPlayerReadiness;
  if (
    !Number.isSafeInteger(r.selection) ||
    r.selection < 0 ||
    !PLAYER_STATES.includes(r.status) ||
    !["none", "youtube", "twitch", "local", "clip"].includes(r.capability)
  )
    return;
  return { selection: r.selection, status: r.status, capability: r.capability };
}
export function samePlayerReadiness(
  a: RoomPlayerReadiness | undefined,
  b: RoomPlayerReadiness | undefined,
) {
  return (
    a === b ||
    Boolean(
      a &&
      b &&
      a.selection === b.selection &&
      a.status === b.status &&
      a.capability === b.capability,
    )
  );
}
/** Capability-ready events cannot clear an autoplay block or overwrite observed playback. */
export function observePlayerReadiness(
  current: PlayerReadinessStatus,
  signal: PlayerReadinessStatus,
): PlayerReadinessStatus {
  if (signal === "ready" && !["loading", "waiting", "idle"].includes(current)) return current;
  if (["blocked", "error"].includes(current) && ["loading", "buffering", "paused"].includes(signal))
    return current;
  return signal;
}
export const PLAYER_LABELS: Record<PlayerReadinessStatus, string> = {
  idle: "No video selected",
  loading: "Player loading",
  ready: "Player ready",
  playing: "Playing on device",
  paused: "Paused on device",
  buffering: "Starting / buffering",
  blocked: "Needs a Play tap",
  error: "Player error",
  unsupported: "Status unavailable",
  waiting: "Waiting for local video",
  ended: "Video ended",
};
export function playerReadinessHelp(status: PlayerReadinessStatus | undefined) {
  if (status === "blocked")
    return "Ask this viewer to use Start on this device or Play inside their player. A Ready vote cannot unlock autoplay.";
  if (status === "loading" || status === "buffering")
    return "Give this player time. The viewer can reload their player if it stays stuck; the queue stays in place.";
  if (status === "error")
    return "Ask this viewer to check Player recovery or open the provider directly. Reload affects only their device.";
  if (status === "waiting")
    return "The viewer needs the host’s local stream or an approved matching local file.";
  if (status === "unsupported")
    return "This embed cannot report playback status here. Ask the viewer to confirm playback directly.";
  return "Player observations are separate from the manual Ready check and do not change room playback.";
}

export function playerNeedsHelp(status: PlayerReadinessStatus | undefined, roomPlaying: boolean) {
  if (!status) return true;
  return (
    !["playing", "idle"].includes(status) &&
    (roomPlaying || !["ready", "paused", "ended"].includes(status))
  );
}
