import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  RoomParticipation,
  readParticipationAction,
  readParticipationState,
  participationVotes,
  type ParticipationAction,
  type ParticipationState,
} from "@/lib/multiplayer/room-participation";
import {
  PLAYER_LABELS,
  playerReadinessHelp,
  playerNeedsHelp,
  type RoomPlayerReadiness,
} from "@/lib/multiplayer/room-player-readiness";
import type { PeerInfo } from "@/lib/multiplayer/p2p";
import type { LibraryVideo } from "@/lib/videos/types";
type Props = {
  localPlayer: RoomPlayerReadiness;
  playing: boolean;
  onWait: () => void;
  room: string;
  guest: boolean;
  hostId: string;
  selfId: string;
  peers: PeerInfo[];
  readyRevision: number;
  queue: Array<{ id: string; video?: LibraryVideo }>;
  send: (value: unknown, peer?: string) => void;
  onMessage: (
    fn: (from: string, value: unknown, channel: "state" | "reliable") => void,
  ) => () => void;
  onPrioritize: (action: { kind: "next"; id: string }) => void;
};
const EMPTY: ParticipationState = { revision: 0, people: [] };
export const RoomParticipationPanel = memo(function RoomParticipationPanel(props: Props) {
  const {
    room,
    guest,
    hostId,
    selfId,
    peers,
    readyRevision,
    queue,
    send,
    onMessage,
    onPrioritize,
    localPlayer,
    playing,
    onWait,
  } = props;
  const model = useRef(new RoomParticipation()),
    latest = useRef(props);
  latest.current = props;
  const [state, setState] = useState<ParticipationState>(EMPTY),
    [notice, setNotice] = useState(""),
    [waiting, setWaiting] = useState(false),
    [visiblePlayers, setVisiblePlayers] = useState(16);
  const ownPlayerTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const playerTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const accepted = useRef(0),
    pending = useRef(""),
    timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const memberKey = peers
      .filter((peer) => peer.connectionState === "connected")
      .map((peer) => peer.id)
      .sort()
      .join("|"),
    queueKey = queue.map((row) => row.id).join("|");
  const acknowledge = useCallback(
    (ack?: string) => {
      const next = model.current.snapshot();
      setState(next);
      send({ type: "participation-state", state: next, ...(ack ? { ack } : {}) });
    },
    [send],
  );
  const publishPlayers = useCallback(() => {
    if (playerTimer.current !== undefined) return;
    playerTimer.current = setTimeout(() => {
      playerTimer.current = undefined;
      acknowledge();
    }, 250);
  }, [acknowledge]);
  useEffect(() => {
    clearTimeout(ownPlayerTimer.current);
    ownPlayerTimer.current = undefined;
    clearTimeout(playerTimer.current);
    playerTimer.current = undefined;
    model.current = new RoomParticipation();
    accepted.current = 0;
    setState(EMPTY);
    setVisiblePlayers(16);
    setWaiting(false);
    pending.current = "";
    clearTimeout(timeout.current);
  }, [room, guest, guest ? hostId : selfId]);
  useEffect(() => {
    if (!room) return;
    if (guest) {
      if (hostId) send({ type: "participation-hello" }, hostId);
      return;
    }
    model.current.setSelection(localPlayer.selection);
    model.current.reconcile(
      [
        selfId,
        ...peers.filter((peer) => peer.connectionState === "connected").map((peer) => peer.id),
      ],
      queue.map((row) => row.id),
    );
    acknowledge();
  }, [
    room,
    guest,
    hostId,
    selfId,
    memberKey,
    queueKey,
    readyRevision,
    localPlayer.selection,
    send,
    acknowledge,
  ]);
  useEffect(
    () =>
      onMessage((from, raw, channel) => {
        if (channel !== "reliable" || !raw || typeof raw !== "object") return;
        const data = raw as {
            type?: string;
            state?: unknown;
            action?: unknown;
            requestId?: unknown;
            ack?: unknown;
            value?: unknown;
          },
          current = latest.current;
        if (current.guest) {
          if (data.type !== "participation-state" || !current.hostId || from !== current.hostId)
            return;
          const next = readParticipationState(data.state);
          if (!next || next.revision < accepted.current) return;
          accepted.current = next.revision;
          setState(next);
          if (data.ack === pending.current) {
            pending.current = "";
            clearTimeout(timeout.current);
            setWaiting(false);
            setNotice("The host confirmed your choice.");
          }
          return;
        }
        if (!current.peers.some((peer) => peer.id === from && peer.connectionState === "connected"))
          return;
        if (data.type === "participation-hello") {
          send({ type: "participation-state", state: model.current.snapshot() }, from);
          return;
        }
        if (data.type === "participation-player") {
          if ((data.value as RoomPlayerReadiness)?.selection !== current.localPlayer.selection)
            return;
          const before = model.current.snapshot().revision;
          if (
            model.current.apply(
              from,
              { kind: "player", value: data.value },
              current.queue.map((row) => row.id),
            ) &&
            model.current.snapshot().revision !== before
          )
            publishPlayers();
          return;
        }
        if (
          data.type !== "participation-request" ||
          typeof data.requestId !== "string" ||
          data.requestId.length > 160 ||
          !readParticipationAction(data.action)
        )
          return;
        if (
          model.current.apply(
            from,
            data.action,
            current.queue.map((row) => row.id),
          )
        )
          acknowledge(data.requestId);
      }),
    [onMessage, send, acknowledge, publishPlayers],
  );
  useEffect(
    () => () => {
      clearTimeout(timeout.current);
      clearTimeout(playerTimer.current);
      clearTimeout(ownPlayerTimer.current);
    },
    [],
  );
  const connected =
    !guest ||
    Boolean(
      hostId && peers.some((peer) => peer.id === hostId && peer.connectionState === "connected"),
    );
  useEffect(() => {
    if (!room || !connected) {
      clearTimeout(ownPlayerTimer.current);
      ownPlayerTimer.current = undefined;
      return;
    }
    if (ownPlayerTimer.current !== undefined) return;
    ownPlayerTimer.current = setTimeout(() => {
      ownPlayerTimer.current = undefined;
      const current = latest.current;
      if (current.guest)
        send({ type: "participation-player", value: current.localPlayer }, current.hostId);
      else {
        const before = model.current.snapshot().revision;
        model.current.apply(current.selfId, { kind: "player", value: current.localPlayer }, []);
        if (model.current.snapshot().revision !== before) publishPlayers();
      }
    }, 250);
  }, [room, guest, hostId, selfId, connected, readyRevision, localPlayer, send, publishPlayers]);
  const choose = (action: ParticipationAction) => {
    if (!connected || waiting) return;
    if (!guest) {
      model.current.apply(
        selfId,
        action,
        queue.map((row) => row.id),
      );
      acknowledge();
      return;
    }
    const requestId = "choice-" + crypto.randomUUID();
    pending.current = requestId;
    setWaiting(true);
    setNotice("Waiting for host confirmation…");
    send({ type: "participation-request", action, requestId }, hostId);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      pending.current = "";
      setWaiting(false);
      setNotice("No confirmation yet. Check the host connection and try again.");
    }, 5000);
  };
  const own = state.people.find((row) => row.id === selfId),
    ready = state.people.filter((row) => row.ready).length;
  const effectivePlayer = (person: ParticipationState["people"][number]) =>
    person.id === selfId
      ? localPlayer
      : person.player?.selection === localPlayer.selection
        ? person.player
        : undefined;
  const waitingPlayers = state.people.filter(
    (person) => person.id !== selfId && playerNeedsHelp(effectivePlayer(person)?.status, playing),
  );
  const votes = useMemo(
      () =>
        participationVotes(
          state,
          queue.map((row) => row.id),
        ),
      [state, queue],
    ),
    counts = new Map(votes.map((row) => [row.id, row.votes])),
    winner = votes[0];
  return (
    <section
      aria-label="Room guest controls"
      className="rounded-lg border border-border bg-elevated p-4 shadow-border"
    >
      <h3 className="font-display text-xl text-fg">Make it a group watch.</h3>
      <p className="mt-1 text-xs leading-5 text-muted">
        Ready checks and next-video votes work even when queue editing is locked. The host confirms
        the order; voting never skips or starts a video automatically. Manual Ready is a choice, not
        proof that a player has started.
      </p>
      <div className="mt-4 rounded-md bg-bg/45 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-fg">
            Ready check · {ready} / {state.people.length}
          </p>
          <span className="text-xs text-muted">
            {!connected
              ? "Waiting for host"
              : waiting
                ? "Confirming choice"
                : own?.ready
                  ? "You’re ready"
                  : "Take your time"}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            size="sm"
            className="min-h-11"
            variant={own?.ready ? "default" : "secondary"}
            aria-pressed={own?.ready ?? false}
            disabled={!connected || waiting}
            onClick={() => choose({ kind: "ready", value: true })}
          >
            I’m ready
          </Button>
          <Button
            size="sm"
            className="min-h-11"
            variant={own && !own.ready ? "default" : "secondary"}
            disabled={!connected || waiting}
            onClick={() => choose({ kind: "ready", value: false })}
          >
            Need a moment
          </Button>
        </div>
        <p className="mt-3 text-xs font-medium text-fg" aria-label="Observed player summary">
          {state.people.filter((person) => effectivePlayer(person)?.status === "playing").length} /{" "}
          {state.people.length} devices report playing
        </p>
        <ul className="mt-2 space-y-1 text-xs text-muted" aria-label="Room readiness">
          {state.people.slice(0, visiblePlayers).map((person) => (
            <li
              className="rounded-md border border-border p-2 leading-5"
              key={person.id}
              data-player-person={person.id}
              data-player-state={effectivePlayer(person)?.status ?? "unknown"}
            >
              {person.id === selfId
                ? "You"
                : peers.find((peer) => peer.id === person.id)?.name || "Guest"}{" "}
              · {person.ready ? "Ready (manual)" : "Not ready yet"}
              <span className="block font-medium text-fg">
                {effectivePlayer(person)
                  ? PLAYER_LABELS[effectivePlayer(person)!.status]
                  : "Player not reported for this title"}
              </span>
              {!guest && person.id !== selfId && (
                <span className="block text-muted">
                  {playerReadinessHelp(effectivePlayer(person)?.status)}
                </span>
              )}
            </li>
          ))}
        </ul>
        {visiblePlayers < state.people.length && (
          <Button
            size="sm"
            variant="ghost"
            className="mt-2 min-h-11"
            onClick={() => setVisiblePlayers((n) => Math.min(65, n + 16))}
          >
            Show more participant statuses
          </Button>
        )}
        <p className="mt-3 text-xs leading-5 text-muted">
          Player status is device-reported for this title, not a connection test. Playback outside
          the app cannot be observed.
        </p>
        {!guest && waitingPlayers.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted">
              {waitingPlayers.length} viewer{waitingPlayers.length === 1 ? "" : "s"} may need time
              or help. You choose whether the room waits.
            </p>
            <Button
              size="sm"
              variant="secondary"
              className="min-h-11"
              disabled={!playing}
              onClick={onWait}
            >
              Pause room to wait
            </Button>
          </div>
        )}
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-medium text-fg">Vote for the next video</h4>
        <div className="mt-2 max-h-72 space-y-2 overflow-y-auto" aria-label="Next video votes">
          {queue.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between gap-2 rounded-md bg-bg/45 p-2"
            >
              <p className="min-w-0 flex-1 truncate text-xs text-fg">
                {row.video?.name || "Queued video"}
                <span className="ml-2 text-muted">{counts.get(row.id) ?? 0} votes</span>
              </p>
              <Button
                size="sm"
                className="min-h-11"
                variant={own?.vote === row.id ? "default" : "secondary"}
                aria-label={"Vote next: " + (row.video?.name || row.id)}
                aria-pressed={own?.vote === row.id}
                disabled={!connected || waiting}
                onClick={() =>
                  choose({ kind: "vote", value: own?.vote === row.id ? null : row.id })
                }
              >
                {own?.vote === row.id ? "Voted" : "Vote next"}
              </Button>
            </div>
          ))}
        </div>
        {!queue.length && (
          <p className="mt-2 text-xs text-muted">
            Queue a few public videos to choose what comes next.
          </p>
        )}
        {winner && !guest && (
          <Button
            size="sm"
            variant="secondary"
            className="mt-3 min-h-11"
            onClick={() => onPrioritize({ kind: "next", id: winner.id })}
          >
            Put the top vote next · {winner.votes}
          </Button>
        )}
        <p className="mt-2 text-xs leading-5 text-muted">
          One latest vote per connected person. Ties keep the current queue order; votes for
          consumed or removed titles disappear. Choices last for this room session.
        </p>
      </div>
      {notice && (
        <p className="mt-3 text-xs text-accent" role="status">
          {notice}
        </p>
      )}
    </section>
  );
});
