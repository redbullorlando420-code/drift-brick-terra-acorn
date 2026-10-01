import { useSyncExternalStore } from "react";
import { getSessionPhase, subscribeSessionPhase } from "./session-activity";

export function useSessionPhase() {
  return useSyncExternalStore(subscribeSessionPhase, getSessionPhase, () => "active" as const);
}
