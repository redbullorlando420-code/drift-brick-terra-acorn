import { reviewedPreferences } from "./reviewed-preferences.ts";
/** Explicit, profile-bound documents. No publish before a conflict-checked durable write. */
export function reviewedDocument<T>(
  key: string,
  empty: () => T,
  parse: (raw: unknown) => T,
  storage?: Pick<Storage, "getItem" | "setItem">,
) {
  const prefs = reviewedPreferences(key, empty, parse, storage),
    server = { data: empty(), ready: false, error: "" };
  let snapshot = server;
  const listeners = new Set<() => void>(),
    emit = () => listeners.forEach((fn) => fn());
  const reload = () => {
    snapshot = { data: prefs.read(), ready: true, error: prefs.error() };
    emit();
  };
  return {
    get: () => snapshot,
    server: () => server,
    subscribe: (fn: () => void) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    hydrate: () => {
      if (!snapshot.ready) reload();
    },
    reload,
    write: (next: T) => {
      const data = prefs.write(next);
      snapshot = { data, ready: true, error: "" };
      emit();
      return data;
    },
  };
}
