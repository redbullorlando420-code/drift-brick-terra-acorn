import {diagnosticExport} from '../diagnostic-export.ts';
import type { PlayerReadinessStatus } from "./room-player-readiness.ts";
export type ConnectionInput = {
  signaling: "connecting" | "online" | "retrying";
  peers: number;
  ice: "waiting" | "connecting" | "connected" | "failed";
  transport: boolean;
  transportFailed?: boolean;
  relay: boolean;
  handshake: boolean;
  guest: boolean;
  player: PlayerReadinessStatus;
};
export type ConnectionStage = "signaling" | "ice" | "transport" | "handshake" | "player";
export type ConnectionState = "waiting" | "working" | "ready" | "attention" | "idle";
export type ConnectionStep = {
  stage: ConnectionStage;
  state: ConnectionState;
  label: string;
  detail: string;
};
export type ConnectionEvent = { stage: ConnectionStage; state: ConnectionState; at: number };
export function connectionSteps(input: ConnectionInput): ConnectionStep[] {
  const network = input.transport || input.relay;
  const playerReady = ["ready", "playing", "paused", "ended"].includes(input.player),
    playerIssue = ["blocked", "error", "unsupported"].includes(input.player);
  return [
    {
      stage: "signaling",
      state:
        input.signaling === "online"
          ? "ready"
          : input.signaling === "retrying"
            ? "attention"
            : "working",
      label: "Signaling",
      detail:
        input.signaling === "online"
          ? "Room roster is reachable."
          : input.signaling === "retrying"
            ? "The last signaling poll failed; existing peer channels may still work."
            : "Registering with the room roster.",
    },
    {
      stage: "ice",
      state:
        input.ice === "connected"
          ? "ready"
          : input.ice === "failed"
            ? "attention"
            : input.peers
              ? "working"
              : "waiting",
      label: "ICE connection",
      detail:
        input.ice === "connected"
          ? "A WebRTC path connected."
          : input.relay
            ? "A same-browser relay delivered data; WebRTC is still separate."
            : input.ice === "failed"
              ? "A peer path failed. Retry failed paths or review relay settings."
              : input.peers
                ? "Negotiating a direct or configured relay path."
                : "Waiting for another participant.",
    },
    {
      stage: "transport",
      state: network
        ? "ready"
        : input.transportFailed
          ? "attention"
          : input.peers
            ? "working"
            : "waiting",
      label: "Room data",
      detail: input.relay
        ? "A same-browser relay delivered a message."
        : input.transport
          ? "A reliable data channel opened."
          : input.transportFailed
            ? "The reliable room-data channel closed. Other room state is retained."
            : "Waiting for a usable room-data channel.",
    },
    {
      stage: "handshake",
      state: input.handshake ? "ready" : network ? "working" : "waiting",
      label: "Room handshake",
      detail: input.handshake
        ? input.guest
          ? "Received an accepted host state."
          : "Answered a guest state request."
        : "Waiting for the authoritative room-state exchange.",
    },
    {
      stage: "player",
      state: playerReady
        ? "ready"
        : playerIssue
          ? "attention"
          : input.player === "idle"
            ? "idle"
            : "working",
      label: "This device’s player",
      detail:
        input.player === "blocked"
          ? "Autoplay needs a tap on this device; the room is still connected."
          : input.player === "error"
            ? "The local player reported an error; this is separate from peer connectivity."
            : input.player === "unsupported"
              ? "This player cannot report readiness. Use its official recovery options."
              : playerReady
                ? "Readiness observed from this device’s media player."
                : input.player === "idle"
                  ? "No video is selected."
                  : "Waiting for this device’s player or local stream.",
    },
  ];
}
export function recordConnectionSteps(
  previous: readonly ConnectionEvent[],
  steps: readonly ConnectionStep[],
  at: number,
): ConnectionEvent[] {
  const latest = new Map<ConnectionStage, ConnectionState>();
  for (const item of previous) latest.set(item.stage, item.state);
  const changes = steps
    .filter((item) => latest.get(item.stage) !== item.state)
    .map(({ stage, state }) => ({ stage, state, at }));
  return changes.length ? [...previous, ...changes].slice(-24) : (previous as ConnectionEvent[]);
}
/** Allowlisted export: no room/invite/peer IDs, names, raw event strings, URLs,
 * ICE candidates, relay config, titles, paths, chat or file fingerprints. */
export function roomConnectionDiagnostic(
  input: ConnectionInput,
  events: readonly ConnectionEvent[],
  queueCount: number,
  queueRevision: number,
  at = Date.now(),
) {
  const stages = connectionSteps(input);
  const allowedStages = new Set(stages.map((s) => s.stage));
  const allowedStates = new Set(["waiting", "working", "ready", "attention", "idle"]);
  const count = (n: number, max: number) =>
    Number.isFinite(n) ? Math.min(max, Math.max(0, Math.floor(n))) : 0;
  return diagnosticExport('room',{
    version: 1,
    capturedAt: at,
    role: input.guest ? "guest" : "host",
    signaling: ["connecting", "online", "retrying"].includes(input.signaling)
      ? input.signaling
      : "connecting",
    peers: count(input.peers, 100),
    stages: stages.map(({ stage, state }) => ({ stage, state })),
    events: events
      .filter(
        (e) =>
          allowedStages.has(e.stage) &&
          allowedStates.has(e.state) &&
          Number.isFinite(e.at) &&
          e.at > 0 &&
          e.at <= at,
      )
      .slice(-24)
      .map(({ stage, state, at }) => ({ stage, state, at })),
    queue: {
      count: count(queueCount, 200),
      revision: count(queueRevision, Number.MAX_SAFE_INTEGER),
    },
    excluded: [
      "room and invitation IDs",
      "peer names and addresses",
      "local paths and media titles",
      "chat and raw transport logs",
      "credentials and relay configuration",
    ],
  });
}
