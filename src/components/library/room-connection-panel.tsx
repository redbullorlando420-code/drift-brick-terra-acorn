import {DiagnosticExportPreview} from './diagnostic-export-preview';
import { useRoomListFocus } from './use-room-list-focus';
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  connectionSteps,
  recordConnectionSteps,
  roomConnectionDiagnostic,
  type ConnectionInput,
  type ConnectionEvent,
} from "@/lib/multiplayer/room-connection-timeline";
export function RoomConnectionPanel({
  scope,
  input,
  queueCount,
  queueRevision,
  onSignaling,
  onPeers,
  onHandshake,
  onPlayer,
  onNotice,
}: {
  scope: string;
  input: ConnectionInput;
  queueCount: number;
  queueRevision: number;
  onSignaling: () => void;
  onPeers: () => void;
  onHandshake: () => void;
  onPlayer: () => void;
  onNotice: (text: string) => void;
}) {
  const steps = useMemo(
    () => connectionSteps(input),
    [
      input.signaling,
      input.peers,
      input.ice,
      input.transport,
      input.transportFailed,
      input.relay,
      input.handshake,
      input.guest,
      input.player,
    ],
  );
  const focusRoot = useRef<HTMLDetailsElement>(null);
  useRoomListFocus(focusRoot, 'data-connection-stage', steps.map(step=>step.stage+':'+step.state));
  const [timeline, setTimeline] = useState<{ scope: string; events: ConnectionEvent[] }>({
    scope,
    events: [],
  });
  const [fallback, setFallback] = useState("");
  useEffect(() => {
    setTimeline((old) => {
      const events = recordConnectionSteps(
        old.scope === scope ? old.events : [],
        steps,
        Date.now(),
      );
      return old.scope === scope && events === old.events ? old : { scope, events };
    });
  }, [scope, steps]);
  useEffect(() => setFallback(""), [scope]);
  const events = timeline.scope === scope ? timeline.events : [],
    lastReady = [...events].reverse().find((e) => e.state === "ready");
  const copy = async () => {
    const text = JSON.stringify(
      roomConnectionDiagnostic(input, events, queueCount, queueRevision),
      null,
      2,
    );
    try {
      if (!navigator.clipboard?.writeText) throw Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      setFallback("");
      onNotice(
        "Redacted connection diagnostic copied. Invitations, names, paths and titles were excluded.",
      );
    } catch {
      setFallback(text);
      onNotice("Clipboard unavailable. Select the redacted diagnostic below to copy it.");
    }
  };
  return (
    <details ref={focusRoot} data-room-a11y
      aria-label="Room connection timeline"
      className="mt-3 rounded-md border border-border p-3"
    >
      <summary className="min-h-11 cursor-pointer text-sm font-medium text-fg">
        Connection timeline · {input.handshake ? "Room state confirmed" : "Checking connection"}
      </summary>
      <DiagnosticExportPreview kind="room" data={roomConnectionDiagnostic(input,events,queueCount,queueRevision)}/>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-fg">Connection checks</h3>
        <Button variant="ghost" className="min-h-11" onClick={() => void copy()}>
          Copy room diagnostic
        </Button>
      </div>
      <p className="mt-1 text-xs leading-5 text-muted">
        Last successful stage:{" "}
        {lastReady
          ? steps.find((s) => s.stage === lastReady.stage)?.label +
            " · " +
            new Date(lastReady.at).toLocaleTimeString()
          : "waiting for evidence"}
        . Player loading and autoplay do not mean a guest disconnected.
      </p>
      <ol className="mt-3 space-y-2">
        {steps.map((step) => (
          <li
            key={step.stage}
            data-connection-stage={step.stage}
            data-connection-state={step.state}
            className="rounded-md border border-border p-3 text-xs leading-5"
          >
            <p data-room-list-heading tabIndex={-1} className="scroll-mt-36 font-medium text-fg">
              {step.label} ·{" "}
              {step.state === "attention"
                ? "Needs attention"
                : step.state === "working"
                  ? "In progress"
                  : step.state === "ready"
                    ? "Confirmed"
                    : step.state === "idle"
                      ? "Idle"
                      : "Waiting"}
            </p>
            <p className="text-muted">{step.detail}</p>
            {step.stage === "signaling" && step.state !== "ready" && (
              <Button variant="secondary" className="mt-2 min-h-11" onClick={onSignaling}>
                Retry signaling only
              </Button>
            )}
            {step.stage === "ice" && step.state === "attention" && !input.relay && (
              <Button variant="secondary" className="mt-2 min-h-11" onClick={onPeers}>
                Retry failed peer paths
              </Button>
            )}
            {step.stage === "transport" && step.state === "attention" && input.ice !== "failed" && (
              <Button variant="secondary" className="mt-2 min-h-11" onClick={onPeers}>
                Retry failed peer paths
              </Button>
            )}
            {step.stage === "handshake" && step.state === "working" && (
              <Button variant="secondary" className="mt-2 min-h-11" onClick={onHandshake}>
                Request room state
              </Button>
            )}
            {step.stage === "player" &&
              ["loading", "buffering", "error"].includes(input.player) && (
                <Button variant="secondary" className="mt-2 min-h-11" onClick={onPlayer}>
                  Reload this player only
                </Button>
              )}
          </li>
        ))}
      </ol>
      <details className="mt-3">
        <summary className="min-h-11 cursor-pointer text-xs text-fg">
          Recent stage changes · {events.length}/24
        </summary>
        <ol className="space-y-1 text-xs text-muted">
          {events
            .slice(-12)
            .reverse()
            .map((e, i) => (
              <li key={i}>
                {new Date(e.at).toLocaleTimeString()} · {e.stage} · {e.state}
              </li>
            ))}
        </ol>
      </details>
      {fallback && (
        <label className="mt-3 block text-xs text-muted">
          Redacted diagnostic to copy
          <textarea
            readOnly
            aria-label="Redacted room diagnostic to copy"
            className="mt-2 min-h-40 w-full rounded-md border border-border bg-surface p-3 font-mono text-xs text-fg"
            value={fallback}
            onFocus={(e) => e.currentTarget.select()}
          />
        </label>
      )}
    </details>
  );
}
