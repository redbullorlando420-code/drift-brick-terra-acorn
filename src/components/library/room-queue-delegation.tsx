import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { createLocalId } from "@/lib/local-id";
import type { PeerInfo } from "@/lib/multiplayer/p2p";
import {
  readRoomDelegation,
  roomDelegationAllows,
  ROOM_DELEGATION_LIMIT,
  ROOM_DELEGATION_DURATIONS,
  type RoomDelegation,
  type RoomDelegationLease,
} from "@/lib/multiplayer/room-delegation";

type Transport = {
  selfId: string;
  peers: PeerInfo[];
  reliableConnection: (peer: string) => number | undefined;
  send: (data: unknown, peer?: string, valid?: () => boolean) => void;
  onMessage: (fn: (peer: string, data: unknown, channel: string) => void) => () => void;
};
const connection = (peers: PeerInfo[], peer: string) =>
  peers.find((p) => p.id === peer && p.connectionState === "connected" && p.reliableReady)
    ?.reliableGeneration;

export function useRoomQueueDelegation(
  room: string,
  guest: boolean,
  host: string,
  transport: Transport,
) {
  const scope = JSON.stringify([room, guest, transport.selfId]);
  const stateRef = useRef({
    scope,
    sequence: 0,
    leases: new Map<string, RoomDelegationLease>(),
    incoming: undefined as (RoomDelegationLease & { sequence: number }) | undefined,
    seen: 0,
    host: "",
    hostGeneration: undefined as number | undefined,
  });
  if (stateRef.current.scope !== scope)
    stateRef.current = {
      scope,
      sequence: 0,
      leases: new Map(),
      incoming: undefined,
      seen: 0,
      host: "",
      hostGeneration: undefined,
    };
  const state = stateRef.current;
  const [revision, refresh] = useState(0);
  const publish = () => refresh((v) => v + 1);
  const hostGeneration = connection(transport.peers, host);
  if (state.host !== host || state.hostGeneration !== hostGeneration) {
    state.host = host;
    state.hostGeneration = hostGeneration;
    state.incoming = undefined;
    state.seen = 0;
  }
  const send = transport.send,
    onMessage = transport.onMessage,
    self = transport.selfId;
  useEffect(() => {
    if (!guest || !room || !host || hostGeneration === undefined) return;
    return onMessage((from, value, channel) => {
      if (
        from !== host ||
        state.host !== host ||
        transport.reliableConnection(from) !== hostGeneration ||
        channel !== "reliable" ||
        !value ||
        typeof value !== "object"
      )
        return;
      const packet = value as {
        type?: string;
        room?: string;
        recipient?: string;
        sequence?: number;
        grant?: unknown;
      };
      if (
        packet.type !== "room-queue-delegation" ||
        packet.room !== room ||
        packet.recipient !== self ||
        !Number.isSafeInteger(packet.sequence) ||
        packet.sequence! <= state.seen
      )
        return;
      const grant = packet.grant === null ? undefined : readRoomDelegation(packet.grant);
      if (packet.grant !== null && (!grant || grant.issuer !== host || grant.recipient !== self))
        return;
      state.seen = packet.sequence!;
      state.incoming = grant && {
        grant,
        generation: hostGeneration,
        deadline: performance.now() + grant.durationMs,
        sequence: state.seen,
      };
      publish();
    });
  }, [guest, room, host, hostGeneration, onMessage, self, state, transport.reliableConnection]);

  const active = (lease: RoomDelegationLease) =>
    performance.now() < lease.deadline &&
    connection(transport.peers, lease.grant.recipient) === lease.generation;
  useEffect(() => {
    for (const [peer, lease] of state.leases) if (!active(lease)) state.leases.delete(peer);
    const deadlines = guest
      ? [state.incoming?.deadline]
      : [...state.leases.values()].map((lease) => lease.deadline);
    const next = Math.min(
      ...deadlines.filter(
        (time): time is number => typeof time === "number" && time > performance.now(),
      ),
    );
    if (Number.isFinite(next)) {
      const timer = window.setTimeout(publish, Math.max(1, next - performance.now() + 10));
      return () => window.clearTimeout(timer);
    }
  }, [guest, revision, state, transport.peers]);

  const issue = (recipient: string, minutes: number) => {
    const generation = transport.reliableConnection(recipient);
    if (
      guest ||
      !room ||
      generation === undefined ||
      !ROOM_DELEGATION_DURATIONS.some((v) => v === minutes)
    )
      return false;
    for (const [peer, lease] of state.leases) if (!active(lease)) state.leases.delete(peer);
    if (!state.leases.has(recipient) && state.leases.size >= ROOM_DELEGATION_LIMIT) return false;
    const durationMs = minutes * 60_000;
    const grant: RoomDelegation = {
      id: createLocalId("moderation-"),
      scope: "queue-order",
      issuer: self,
      recipient,
      expiresAt: Date.now() + durationMs,
      durationMs,
    };
    const lease = { grant, generation, deadline: performance.now() + durationMs };
    state.leases.set(recipient, lease);
    send(
      { type: "room-queue-delegation", room, recipient, sequence: ++state.sequence, grant },
      recipient,
      () =>
        stateRef.current === state &&
        state.leases.get(recipient) === lease &&
        transport.reliableConnection(recipient) === generation &&
        performance.now() < lease.deadline,
    );
    publish();
    return true;
  };
  const revoke = (recipient: string) => {
    if (guest || !state.leases.delete(recipient)) return;
    send(
      { type: "room-queue-delegation", room, recipient, sequence: ++state.sequence, grant: null },
      recipient,
    );
    publish();
  };
  const incoming = () =>
    state.incoming &&
    state.incoming.generation === hostGeneration &&
    state.incoming.deadline > performance.now()
      ? state.incoming.grant
      : undefined;
  const allows = (
    from: string,
    packet: Parameters<typeof roomDelegationAllows>[2],
    permissionRevision: number,
    queue: readonly string[],
  ) =>
    !guest &&
    stateRef.current === state &&
    roomDelegationAllows(
      state.leases.get(from),
      { from, host: self, generation: transport.reliableConnection(from) },
      packet,
      permissionRevision,
      queue,
      performance.now(),
    );
  return {
    issue,
    revoke,
    allows,
    incoming,
    available: transport.peers.filter((p) => connection(transport.peers, p.id) !== undefined),
    grants: [...state.leases.values()].filter(active).map((lease) => lease.grant),
  };
}

export function RoomQueueDelegation({
  guest,
  control,
}: {
  guest: boolean;
  control: ReturnType<typeof useRoomQueueDelegation>;
}) {
  const [recipient, setRecipient] = useState(""),
    [minutes, setMinutes] = useState(5),
    [note, setNote] = useState("");
  const grant = control.incoming(),
    selected = control.available.find((p) => p.id === recipient);
  const until = (row: RoomDelegation) =>
    new Date(row.expiresAt).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    });
  if (guest)
    return grant ? (
      <p role="status" className="mb-3 rounded-md border border-border p-3 text-sm text-accent">
        Temporary queue moderator · until {until(grant)}. Reorder or remove queued titles from Up
        next.
      </p>
    ) : null;
  return (
    <details className="mb-3 rounded-md border border-border p-3">
      <summary className="min-h-11 cursor-pointer content-center text-sm font-medium">
        Temporary queue moderators{control.grants.length ? " · " + control.grants.length : ""}
      </summary>
      <p className="text-xs leading-5 text-muted">
        Let one connected guest reorder or remove upcoming titles. This never grants new titles,
        playback controls, or library access. A new connection needs a new grant.
      </p>
      <form
        className="mt-3 flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (selected)
            setNote(
              control.issue(recipient, minutes)
                ? `${selected.name} can moderate the queue for ${minutes} minute${minutes === 1 ? "" : "s"}.`
                : "The guest is no longer connected or all moderator slots are in use.",
            );
        }}
      >
        <label className="block min-w-0 flex-1 basis-40 text-xs text-muted">
          Connected guest
          <select
            className="mt-1 min-h-11 w-full rounded-md border border-border bg-surface px-2 text-sm text-fg"
            value={selected?.id ?? ""}
            onChange={(e) => setRecipient(e.target.value)}
          >
            <option value="">Choose a guest…</option>
            {control.available.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name || "Guest"} · {p.id.slice(-5)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted">
          Duration
          <select
            className="mt-1 block min-h-11 rounded-md border border-border bg-surface px-2 text-sm text-fg"
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
          >
            {ROOM_DELEGATION_DURATIONS.map((value) => (
              <option key={value} value={value}>
                {value} min
              </option>
            ))}
          </select>
        </label>
        <Button className="min-h-11" type="submit" disabled={!selected}>
          Grant queue moderation
        </Button>
      </form>
      <ul className="mt-2 space-y-2">
        {control.grants.map((row) => (
          <li
            className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted"
            key={row.id}
          >
            <span>
              {control.available.find((p) => p.id === row.recipient)?.name || "Guest"} · until{" "}
              {until(row)}
            </span>
            <Button
              size="sm"
              variant="secondary"
              className="min-h-11"
              onClick={() => {
                control.revoke(row.recipient);
                setNote("Queue moderation revoked.");
              }}
            >
              Revoke moderation
            </Button>
          </li>
        ))}
      </ul>
      {note && (
        <p role="status" className="mt-2 text-xs text-accent">
          {note}
        </p>
      )}
    </details>
  );
}
