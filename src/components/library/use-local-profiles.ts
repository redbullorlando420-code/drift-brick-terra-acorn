import { useSyncExternalStore } from "react";
import { listLocalProfiles, subscribeProfileRegistryChanges } from "@/lib/local-profiles";
import {
  createProfileRegistryObserver,
  PROFILE_REGISTRY_LOADING,
} from "@/lib/profile-registry-observer";

const registry = createProfileRegistryObserver(listLocalProfiles, subscribeProfileRegistryChanges);
export const refreshLocalProfiles = registry.refresh;
export async function settleLocalProfiles() {
  await registry.settled();
  const snapshot = registry.getSnapshot();
  if (snapshot.status !== "ready")
    throw Error(
      "The profile was created, but its name list could not refresh. Retry profile names to open it.",
    );
  return snapshot.profiles;
}
export const useLocalProfiles = () =>
  useSyncExternalStore(registry.subscribe, registry.getSnapshot, () => PROFILE_REGISTRY_LOADING);

const OPEN_EVENT = "realhub:open-profile-controls";
let requested = false;
export function requestProfileControls() {
  requested = true;
  window.dispatchEvent(new Event(OPEN_EVENT));
}
export function focusRequestedProfileControls() {
  if (!requested) return;
  const target = document.getElementById("local-profile-heading");
  if (!target) return;
  requested = false;
  target.scrollIntoView({ block: "start" });
  target.focus({ preventScroll: true });
}
export function listenProfileControls() {
  focusRequestedProfileControls();
  window.addEventListener(OPEN_EVENT, focusRequestedProfileControls);
  return () => window.removeEventListener(OPEN_EVENT, focusRequestedProfileControls);
}
import.meta.hot?.dispose(() => {
  requested = false;
});
