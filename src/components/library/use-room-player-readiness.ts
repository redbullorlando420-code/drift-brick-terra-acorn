import { useCallback, useMemo, useRef, useState } from "react";
import {
  observePlayerReadiness,
  type PlayerCapability,
  type PlayerReadinessStatus,
} from "@/lib/multiplayer/room-player-readiness";
/** A fresh player generation starts with no inherited observations. Late events
 * from a replaced player cannot update the current title. No clock polling. */
export function useRoomPlayerReadiness(
  scope: string,
  selection: number,
  capability: PlayerCapability,
  initial: PlayerReadinessStatus,
) {
  const latest = useRef(scope);
  latest.current = scope;
  const [observed, setObserved] = useState({ scope, status: initial });
  const status = observed.scope === scope ? observed.status : initial;
  const observe = useCallback(
    (signal: PlayerReadinessStatus) => {
      if (latest.current !== scope) return;
      setObserved((previous) => {
        const value = observePlayerReadiness(
          previous.scope === scope ? previous.status : initial,
          signal,
        );
        return previous.scope === scope && previous.status === value
          ? previous
          : { scope, status: value };
      });
    },
    [scope, initial],
  );
  const report = useMemo(
    () => ({ selection, capability, status }),
    [selection, capability, status],
  );
  return { report, observe };
}
