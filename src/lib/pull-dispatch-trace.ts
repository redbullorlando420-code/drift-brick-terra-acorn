export type PullOperation = "archive" | "recent" | "clips" | "details" | "live" | "import";
export type DispatchPhase =
  "queued" | "started" | "held" | "complete" | "failed" | "cancelled" | "deferred";
export type DispatchEvent = {
  id: number;
  lane: string;
  operation: PullOperation;
  phase: DispatchPhase;
  at: number;
  waitedMs: number;
};
/** Session-only, bounded state transitions. No URLs, creator IDs, payloads or timers. */
export function createDispatchTrace(now = () => Date.now()) {
  let serial = 0,
    events: readonly DispatchEvent[] = [];
  const listeners = new Set<() => void>();
  return {
    begin(lane: string, operation: PullOperation) {
      const id = ++serial,
        queuedAt = now();
      return (phase: DispatchPhase) => {
        const at = now();
        events = [
          ...events.slice(-63),
          { id, lane, operation, phase, at, waitedMs: Math.max(0, at - queuedAt) },
        ];
        for (const listener of listeners) listener();
      };
    },
    snapshot: () => events,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
export const pullDispatchTrace = createDispatchTrace();
