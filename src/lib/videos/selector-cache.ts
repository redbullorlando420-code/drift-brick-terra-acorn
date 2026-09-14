/** Cache each scope independently using immutable store slices, not root state.
 * Playback and UI updates must not invalidate catalog-sized computations. */
export function memoizeSelector<S, R>(
  compute: (state: S, adult: boolean) => R,
  keys: readonly (keyof S)[],
): (state: S, adult?: boolean) => R {
  const scopes = new Map<boolean, { inputs: unknown[]; result: R }>();
  return (state, adult = false) => {
    const inputs = keys.map((key) => state[key]);
    const cached = scopes.get(adult);
    if (cached && inputs.every((value, index) => Object.is(value, cached.inputs[index]))) return cached.result;
    const result = compute(state, adult);
    scopes.set(adult, { inputs, result });
    return result;
  };
}
