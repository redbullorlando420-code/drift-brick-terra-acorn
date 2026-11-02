export const PROFILE_SELECTION_KEY = "realhub.active-local-profile.v1";
export const PROFILE_PREFIX = "realhub.profile.v1:";
export const PROFILE_EVENT = "realhub:profile-context";
export const validProfileId = (id: string) =>
  id === "default" || /^p-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id);
function selection() {
  if (typeof window === "undefined") return "default";
  try {
    return globalThis.sessionStorage?.getItem(PROFILE_SELECTION_KEY) ?? "default";
  } catch {
    return "default";
  }
}
// Bind once per document. Changing session selection cannot redirect an older
// promise, pagehide checkpoint, worker result or database connection.
const boundId = selection();
export const currentProfileId = () => boundId;
export function assertProfileContext() {
  if (!validProfileId(boundId))
    throw Error("This local profile selection is unsupported. Return to Default to recover.");
}
export function profileDatabaseName(base: string, id = boundId) {
  return id === "default" ? base : base + ".profile." + (validProfileId(id) ? id : "invalid");
}
export function profileChannelName(base: string) {
  return boundId === "default" ? base : base + ".profile." + boundId;
}
const reserved = (key: string) => key === PROFILE_SELECTION_KEY || key.startsWith(PROFILE_PREFIX);
export function createProfileStorage(native: () => Storage, id: string): Storage {
  const prefix = id === "default" ? "" : PROFILE_PREFIX + id + ":";
  const physical = (key: string) => {
    if (!validProfileId(id)) throw Error("Unsupported local profile.");
    if (reserved(key)) throw Error("Reserved profile-control key.");
    return prefix + key;
  };
  const keys = () => {
    const store = native();
    const result: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (key === null) continue;
      if (prefix ? key.startsWith(prefix) : !reserved(key))
        result.push(prefix ? key.slice(prefix.length) : key);
    }
    // Another tab can replace keys without changing native Storage.length.
    // Enumerations are infrequent; do not retain a potentially stale key list.
    return result;
  };
  return {
    get length() {
      return keys().length;
    },
    key: (index) => keys()[index] ?? null,
    getItem: (key) => native().getItem(physical(String(key))),
    setItem: (key, value) => {
      native().setItem(physical(String(key)), String(value));
    },
    removeItem: (key) => {
      native().removeItem(physical(String(key)));
    },
    clear: () => {
      const names = keys().slice();
      for (const key of names) native().removeItem(physical(key));
    },
  };
}
export const profileLocalStorage = createProfileStorage(() => globalThis.localStorage, boundId);
export const profileSessionStorage = createProfileStorage(() => globalThis.sessionStorage, boundId);
/** Normalize only app storage events; authentication SDK transport stays global. */
export function profileEventKey(key: string | null, id = boundId): string | null | undefined {
  if (key === null) return null;
  if (key === PROFILE_SELECTION_KEY) return undefined;
  if (key.startsWith(PROFILE_PREFIX)) {
    const prefix = PROFILE_PREFIX + id + ":";
    return id !== "default" && key.startsWith(prefix) ? key.slice(prefix.length) : undefined;
  }
  if (id !== "default" && /^(?:reelcase|realhub)[.:_-]/.test(key)) return undefined;
  return key;
}
if (typeof window !== "undefined") {
  const normalized = new WeakSet<Event>();
  const receive = (event: StorageEvent) => {
    if (normalized.has(event)) return;
    const key = profileEventKey(event.key);
    if (key === event.key) return;
    event.stopImmediatePropagation();
    if (key === undefined) return;
    const translated = new StorageEvent("storage", {
      key,
      oldValue: event.oldValue,
      newValue: event.newValue,
      url: event.url,
      storageArea: event.storageArea,
    });
    normalized.add(translated);
    window.dispatchEvent(translated);
  };
  window.addEventListener("storage", receive, true);
  import.meta.hot?.dispose(() => window.removeEventListener("storage", receive, true));
}
