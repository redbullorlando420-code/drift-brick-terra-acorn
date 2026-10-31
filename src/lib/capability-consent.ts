export const BROWSER_PERMISSION_KEY = "reelcase.optional-permissions.v1";
export const BROWSER_SCOPES = ["draft-composer", "local-vision"] as const;
export type BrowserScope = (typeof BROWSER_SCOPES)[number];
type State = {
  version: 1;
  revision: number;
  scopes: Record<BrowserScope, { allowed: boolean; generation: number }>;
  error?: string;
};
const empty = (): State => ({
  version: 1,
  revision: 0,
  scopes: {
    "draft-composer": { allowed: false, generation: 0 },
    "local-vision": { allowed: false, generation: 0 },
  },
});
export function createBrowserConsent(storage: Pick<Storage, "getItem" | "setItem">) {
  let state = empty(),
    saveError = "";
  const listeners = new Set<() => void>(),
    leases = new Set<{ scope: BrowserScope; abort: () => void }>();
  function load() {
    let next = empty();
    try {
      const text = storage.getItem(BROWSER_PERMISSION_KEY);
      if (text) {
        if (text.length > 8192) throw Error();
        const value = JSON.parse(text);
        if (
          value.version !== 1 ||
          !Number.isSafeInteger(value.revision) ||
          value.revision < 0 ||
          BROWSER_SCOPES.some(
            (id) =>
              typeof value.scopes?.[id]?.allowed !== "boolean" ||
              !Number.isSafeInteger(value.scopes[id].generation) ||
              value.scopes[id].generation < 0,
          )
        )
          throw Error();
        next = {
          version: 1,
          revision: value.revision,
          scopes: Object.fromEntries(
            BROWSER_SCOPES.map((id) => [
              id,
              { allowed: value.scopes[id].allowed, generation: value.scopes[id].generation },
            ]),
          ) as State["scopes"],
        };
      }
    } catch {
      next.error =
        "Permission choices are unreadable. Optional actions stay blocked; saved library data is unchanged.";
    }
    if (saveError) next.error = saveError;
    if (JSON.stringify(next) !== JSON.stringify(state)) {
      for (const lease of [...leases])
        if (
          next.error ||
          next.scopes[lease.scope].generation !== state.scopes[lease.scope].generation ||
          !next.scopes[lease.scope].allowed
        ) {
          lease.abort();
          leases.delete(lease);
        }
      state = next;
      for (const listener of listeners) listener();
    }
    return state;
  }
  return {
    snapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    load,
    change: (scope: BrowserScope, allowed: boolean) => {
      if (!BROWSER_SCOPES.includes(scope) || typeof allowed !== "boolean")
        throw Error("Unknown optional permission.");
      load();
      if(state.error&&!saveError)throw Error(state.error);
      const next: State = {
        version: 1,
        revision: state.revision + 1,
        scopes: {
          ...state.scopes,
          [scope]: { allowed, generation: state.scopes[scope].generation + 1 },
        },
      };
      try {
        storage.setItem(BROWSER_PERMISSION_KEY, JSON.stringify(next));
      } catch {
        for (const lease of [...leases]) lease.abort();
        leases.clear();
        saveError =
          "Permission could not be saved. Optional actions are blocked for this visit. Retry before closing; a reload can restore the previous saved choice.";
        state = { ...empty(), error: saveError };
        for (const listener of listeners) listener();
        throw Error(state.error);
      }
      for (const lease of [...leases])
        if (lease.scope === scope) {
          lease.abort();
          leases.delete(lease);
        }
      saveError = "";
      state = next;
      for (const listener of listeners) listener();
      return state;
    },
    acquire: (scope: BrowserScope) => {
      load();
      if (!BROWSER_SCOPES.includes(scope) || state.error || !state.scopes[scope].allowed)
        throw Error(
          "Allow " +
            (scope === "local-vision" ? "local image analysis" : "draft composers") +
            " in optional permissions first.",
        );
      if (leases.size >= 128)
        throw Error("Too many pending optional actions. Wait or cancel them first.");
      const generation = state.scopes[scope].generation,
        controller = new AbortController(),
        lease = { scope, abort: () => controller.abort() };
      leases.add(lease);
      return {
        signal: controller.signal,
        assert: () => {
          load();
          if (
            controller.signal.aborted ||
            state.error ||
            !state.scopes[scope].allowed ||
            state.scopes[scope].generation !== generation
          )
            throw Error(
              "Optional permission changed. This result was discarded; saved content is unchanged.",
            );
        },
        release: () => leases.delete(lease),
      };
    },
  };
}
const noStorage = {
  getItem: () => null,
  setItem: () => {
    throw Error("Storage unavailable.");
  },
};
export const browserConsent = createBrowserConsent({
  getItem: (key) =>
    typeof window === "undefined" ? noStorage.getItem() : window.localStorage.getItem(key),
  setItem: (key, value) => {
    if (typeof window === "undefined") return noStorage.setItem();
    window.localStorage.setItem(key, value);
  },
});
export function refreshBrowserConsent() {
  browserConsent.load();
}
if (typeof window !== "undefined")
  window.addEventListener("storage", (event) => {
    if (event.key === BROWSER_PERMISSION_KEY || event.key === null) refreshBrowserConsent();
  });
export const serverPermissionSnapshot = browserConsent.snapshot();
