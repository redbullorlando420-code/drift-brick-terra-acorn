type Listener<S> = (state: S, previous: S) => void;
type ReadableStore<S> = {
  getState: () => S;
  getInitialState: () => S;
  subscribe: (listener: Listener<S>) => () => void;
};

/** Controls use the live store; catalog subscribers share one pending route.
 * Changing routes never evaluates their selectors inside the navigation event.
 * Retain references only: no copied catalog and no growing update backlog. */
export function createNavigationStore<S>(source: ReadableStore<S>, options: {
  key: (state: S) => string;
  defer: (state: S) => boolean;
  held?: (state: S) => boolean;
  prepare?: (state: S, signal: AbortSignal) => Promise<void>;
  prepared?: (prepared: S, latest: S) => boolean;
  schedule: (publish: () => void) => () => void;
}) {
  let snapshot: S | undefined;
  let pending: S | undefined;
  let disconnect: (() => void) | undefined;
  let cancel: (() => void) | undefined;
  let preparation: AbortController | undefined;
  let preparingState: S | undefined;
  let generation = 0;
  const listeners = new Set<Listener<S>>();

  const clearPending = () => {
    generation++;
    cancel?.();
    preparation?.abort();
    preparation = undefined;
    preparingState = undefined;
    cancel = undefined;
    pending = undefined;
  };
  const publish = (next: S) => {
    const previous = snapshot ?? next;
    snapshot = next;
    if (next !== previous) for (const notify of listeners) notify(next, previous);
  };
  const getState = () => {
    if (!disconnect || snapshot === undefined) snapshot = source.getState();
    return snapshot;
  };
  const publishPending = (ticket: number) => {
    if (ticket !== generation || pending === undefined || !listeners.size) return;
    const latest = pending;
    pending = undefined;
    cancel = undefined;
    preparation = undefined;
    preparingState = undefined;
    publish(latest);
  };
  const preparePending = async (ticket: number) => {
    const controller = new AbortController();
    preparation = controller;
    try {
      while (ticket === generation && pending !== undefined && !controller.signal.aborted) {
        const target = pending;
        preparingState = target;
        await options.prepare!(target, controller.signal);
        if (ticket !== generation || pending === undefined || controller.signal.aborted) return;
        if (options.prepared ? options.prepared(target, pending) : target === pending) break;
      }
    } catch {
      // A failed optimization falls back to the ordinary selector path. It
      // must not strand the destination; cancellation still forbids publishing.
      if (controller.signal.aborted || ticket !== generation) return;
    }
    publishPending(ticket);
  };
  return {
    getState,
    getInitialState: source.getInitialState,
    subscribe(listener: Listener<S>) {
      listeners.add(listener);
      if (!disconnect) {
        getState();
        disconnect = source.subscribe(next => {
          if (options.held?.(next)) { clearPending(); return; }
          // A pull can replace the catalog without changing the route. Warm
          // that replacement before publishing, just as on first navigation.
          const sameRoute = options.key(next) === options.key(snapshot!);
          const prepared = !options.prepare || !options.prepared || options.prepared(snapshot!, next);
          if ((sameRoute && prepared) || !options.defer(next)) {
            clearPending();
            publish(next);
            return;
          }
          const sameDestination = pending !== undefined && options.key(pending) === options.key(next);
          pending = next;
          // Pull progress or rating changes replace the pending reference;
          // they must not keep moving its deadline further into the future.
          if (sameDestination && (!preparation || preparingState === undefined || !options.prepared
            || options.prepared(preparingState, next))) return;
          cancel?.();
          preparation?.abort();
          preparation = undefined;
          preparingState = undefined;
          const ticket = ++generation;
          cancel = options.schedule(() => {
            if (ticket !== generation || pending === undefined || !listeners.size) return;
            if (options.prepare) void preparePending(ticket);
            else publishPending(ticket);
          });
        });
        // Catch writes between React's render and subscription, too.
        const latest = source.getState();
        if (latest !== snapshot) publish(latest);
      }
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          clearPending();
          disconnect?.();
          disconnect = undefined;
          snapshot = undefined;
        }
      };
    },
  };
}
