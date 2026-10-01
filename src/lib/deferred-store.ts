type Listener<S> = (state: S, previous: S) => void;
type ReadableStore<S> = {
  getState: () => S;
  getInitialState: () => S;
  subscribe: (listener: Listener<S>) => () => void;
};

/** Keep one browse snapshot while a foreground viewer owns the screen. The
 * source store remains live; no writes are delayed and no update queue grows.
 * Releasing the viewer publishes only the latest state to every subscriber. */
export function createDeferredStore<S>(source: ReadableStore<S>, held: (state: S) => boolean): ReadableStore<S> {
  let snapshot: S | undefined;
  let disconnect: (() => void) | undefined;
  const listeners = new Set<Listener<S>>();
  const getState = () => {
    const latest = source.getState();
    if (!disconnect && (snapshot === undefined || !held(latest))) snapshot = latest;
    return held(latest) ? snapshot ?? latest : latest;
  };
  return {
    getState,
    getInitialState: source.getInitialState,
    subscribe(listener) {
      if (!disconnect) {
        getState();
        disconnect = source.subscribe(next => {
          if (held(next)) return;
          const previous = snapshot ?? next;
          snapshot = next;
          if (next !== previous) for (const notify of listeners) notify(next, previous);
        });
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          disconnect?.();
          disconnect = undefined;
          snapshot = undefined;
        }
      };
    },
  };
}
