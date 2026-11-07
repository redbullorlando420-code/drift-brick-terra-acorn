import type { RoomPlayerReadiness } from "./room-player-readiness";
export type GuestArrivalInput = {
  connected: boolean;
  handshake: boolean;
  selected: boolean;
  player: RoomPlayerReadiness;
  external?: boolean;
  roomPlaying?: boolean;
};
export function guestArrival(input: GuestArrivalInput) {
  const { player } = input;
  if (!input.connected)
    return {
      stage: "connection",
      title: "Connect to the host",
      detail:
        "Keep this invitation open. A room code or manual Ready vote does not prove a transport connection.",
      action: "none",
    } as const;
  if (!input.handshake)
    return {
      stage: "handshake",
      title: "Waiting for the host’s room state",
      detail:
        "The transport is connected, but a current authoritative selection has not arrived. Player timing is not verified yet.",
      action: "none",
    } as const;
  if (!input.selected)
    return {
      stage: "selection",
      title: "Waiting for a video",
      detail: "The host must choose an available title before this device can prepare its player.",
      action: "none",
    } as const;
  if (player.status === "unsupported" || input.external)
    return {
      stage: "unsupported",
      title: "Use the supported playback fallback",
      detail:
        "This embed cannot confirm synchronized playback here. Open the provider if available; external playback is independent of the room clock.",
      action: "external",
    } as const;
  if (player.status === "waiting")
    return {
      stage: "local",
      title: "Waiting for local media",
      detail:
        "The host must stream this file, or you can explicitly match an approved local copy in Local handoff. No directory permission is requested automatically.",
      action: "none",
    } as const;
  if (player.status === "error")
    return {
      stage: "error",
      title: "Recover this device’s player",
      detail:
        "Reload only your player, or use its provider fallback. This does not pause or advance the host.",
      action: "reload",
    } as const;
  if (input.roomPlaying === false && ["paused", "ready", "ended"].includes(player.status))
    return {
      stage: "paused",
      title: "The room is paused",
      detail:
        "This device has reported its player state. Wait for the host to resume; a manual Ready vote remains separate from playback.",
      action: "none",
    } as const;
  if (player.status === "blocked" || player.status === "ready" || player.status === "paused")
    return {
      stage: "gesture",
      title: "Start playback on this device",
      detail:
        "Tap here or press Play inside the video. A browser gesture is separate from a manual Ready vote and does not require the host to toggle pause/play.",
      action: "start",
    } as const;
  if (player.status === "playing")
    return {
      stage: "playing",
      title: "Playback observed on this device",
      detail:
        "This confirms a local playback event, not equal live delay across devices. The host remains the clock leader.",
      action: "none",
    } as const;
  return {
    stage: "loading",
    title: "Player is preparing",
    detail:
      "Wait for a player observation. If preparation stays stuck, reload only this device’s player.",
    action: "reload",
  } as const;
}
