/** Cache each scope independently using immutable store slices, not root state.
 * Playback and UI updates must not invalidate catalog-sized computations. */
export function memoizeSelector<S, R>(
  compute: (state: S, adult: boolean) => R,
  keys: readonly (keyof S)[] | ((state: S) => readonly (keyof S)[]),
): ((state: S, adult?: boolean) => R) & { peek: (state: S, adult?: boolean) => R | undefined } {
  const scopes = new Map<boolean, { inputs: unknown[]; result: R }>();
  const inputsFor = (state: S) => {
    const selectedKeys = typeof keys === "function" ? keys(state) : keys;
    return selectedKeys.flatMap((key) => [key, state[key]]);
  };
  const peek = (state: S, adult = false) => {
    const inputs = inputsFor(state);
    const cached = scopes.get(adult);
    if (cached && inputs.length === cached.inputs.length && inputs.every((value, index) => Object.is(value, cached.inputs[index]))) return cached.result;
    return undefined;
  };
  const select = (state: S, adult = false) => {
    const cached = peek(state, adult);
    if (cached !== undefined) return cached;
    const result = compute(state, adult);
    scopes.set(adult, { inputs: inputsFor(state), result });
    return result;
  };
  return Object.assign(select, { peek });
}
