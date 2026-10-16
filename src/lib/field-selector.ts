/** Select a fixed set of card/control fields without constructing Maps or a
 * fresh snapshot for unrelated store updates. Each consumer retains one small
 * snapshot, never the source store or a catalog-sized comparison cache. */
export function memoizeFields<S>() {
  return <R extends Record<string, unknown>>(readers: { [K in keyof R]: (state: S) => R[K] }) => {
    const keys = Object.keys(readers) as (keyof R)[];
    let snapshot: R | undefined;
    return (state: S): R => {
      let next: R | undefined = snapshot ? undefined : Object.create(null) as R;
      for (const key of keys) {
        const value = readers[key](state);
        if (snapshot && Object.is(snapshot[key], value)) continue;
        next ??= { ...snapshot! };
        next[key] = value;
      }
      if (next) snapshot = next;
      return snapshot!;
    };
  };
}
