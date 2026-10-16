import { cacheMetrics } from '../cache-metrics.ts';

/** Cache each scope independently using immutable store slices, not root state.
 * Playback and UI updates must not invalidate catalog-sized computations. */
export function memoizeSelector<S, R>(
  compute: (state: S, adult: boolean) => R,
  keys: readonly (keyof S)[] | ((state: S) => readonly (keyof S)[]),
): ((state: S, adult?: boolean) => R) & { peek: (state: S, adult?: boolean) => R | undefined; prime: (state: S, result: R, adult?: boolean) => void; clear: (adult?: boolean) => void; evictStale: (state: S) => void } {
  const inputsFor = (state: S) => {
    const selectedKeys = typeof keys === "function" ? keys(state) : keys;
    return selectedKeys.flatMap((key) => [key, state[key]]);
  };
  return memoizeSelectorInputs(compute, inputsFor);
}

/** Derived immutable inputs can ignore status-only changes to a large slice. */
export function memoizeSelectorInputs<S, R>(compute: (state: S, adult: boolean) => R, inputsFor: (state: S) => unknown[]) {
  const scopes = new Map<boolean, { inputs: unknown[]; result: R }>();
  const peek = (state: S, adult = false) => {
    const inputs = inputsFor(state);
    const cached = scopes.get(adult);
    if (cached && inputs.length === cached.inputs.length && inputs.every((value, index) => Object.is(value, cached.inputs[index]))) {
      cacheMetrics.record('catalog-selectors', 'hit');
      return cached.result;
    }
    cacheMetrics.record('catalog-selectors', 'miss');
    return undefined;
  };
  const select = (state: S, adult = false) => {
    const cached = peek(state, adult);
    if (cached !== undefined) return cached;
    const result = compute(state, adult);
    scopes.set(adult, { inputs: inputsFor(state), result });
    return result;
  };
  const evictStale = (state: S) => {
    const inputs = inputsFor(state);
    for (const [scope, cached] of scopes) if (inputs.length !== cached.inputs.length || inputs.some((value, index) => !Object.is(value, cached.inputs[index]))) scopes.delete(scope);
  };
  const prime = (state: S, result: R, adult = false) => { scopes.set(adult, { inputs: inputsFor(state), result }); };
  const clear = (adult?: boolean) => { if (adult === undefined) scopes.clear(); else scopes.delete(adult); };
  return Object.assign(select, { peek, prime, clear, evictStale });
}
