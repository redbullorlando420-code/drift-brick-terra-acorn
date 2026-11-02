import type { LocalProfile } from "./local-profiles.ts";
export type ProfileRegistrySnapshot = {
  status: "loading" | "ready" | "error";
  profiles: readonly LocalProfile[];
  error: string;
};
export const PROFILE_REGISTRY_LOADING: ProfileRegistrySnapshot = {
  status: "loading",
  profiles: [],
  error: "",
};

/** One compact read in flight; an event burst schedules at most one trailing read. */
export function createProfileRegistryObserver(
  load: () => Promise<LocalProfile[]>,
  connect: (notify: () => void) => () => void,
) {
  let snapshot = PROFILE_REGISTRY_LOADING,
    disconnect: (() => void) | undefined;
  let generation = 0,
    reading = false,
    dirty = false;
  let work: Promise<void> = Promise.resolve();
  const listeners = new Set<() => void>();
  const refresh = () => {
    if (!listeners.size) return;
    dirty = true;
    if (reading) return;
    reading = true;
    const ticket = generation;
    work = (async () => {
      try {
        do {
          dirty = false;
          try {
            const profiles = await load();
            if (ticket !== generation) return;
            if (dirty) continue; // Never publish a snapshot invalidated during its read.
            if (
              snapshot.status !== "ready" ||
              JSON.stringify(snapshot.profiles) !== JSON.stringify(profiles)
            ) {
              snapshot = { status: "ready", profiles, error: "" };
              for (const listener of listeners) listener();
            }
          } catch (error) {
            if (ticket !== generation) return;
            if (dirty) continue;
            snapshot = {
              status: "error",
              profiles: [],
              error: error instanceof Error ? error.message : "Local profile names could not load.",
            };
            for (const listener of listeners) listener();
          }
        } while (dirty && listeners.size);
      } finally {
        if (ticket === generation) reading = false;
      }
    })();
  };
  return {
    getSnapshot: () => snapshot,
    settled: () => work,
    refresh,
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (listeners.size === 1) {
        disconnect = connect(refresh);
        refresh();
      }
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          generation++;
          disconnect?.();
          disconnect = undefined;
          reading = false;
          dirty = false;
          snapshot = PROFILE_REGISTRY_LOADING;
        }
      };
    },
  };
}
