/** One short-lived completed snapshot. Scope fields are weak references so
 * caching a result cannot keep a superseded complete library/ledger alive. */
export function createWeakSnapshotCache<T extends { [K in keyof T]: object }, R>(
  ttlMs: number,
  options: {
    now?: () => number;
    setTimer?: (work: () => void, ms: number) => unknown;
    clearTimer?: (timer: unknown) => void;
  } = {},
) {
  const now = options.now ?? Date.now;
  const setTimer = options.setTimer ?? ((work, ms) => setTimeout(work, ms));
  const clearTimer =
    options.clearTimer ?? ((timer) => clearTimeout(timer as ReturnType<typeof setTimeout>));
  let entry:
    | { fields: Array<[keyof T, WeakRef<object>]>; version: number; result: R; expires: number }
    | undefined;
  let timer: unknown;
  const clear = () => {
    entry = undefined;
    if (timer !== undefined) clearTimer(timer);
    timer = undefined;
  };
  return {
    get(scope: T, version: number): R | undefined {
      if (!entry) return;
      if (entry.expires <= now()) {
        clear();
        return;
      }
      if (
        entry.version !== version ||
        Object.keys(scope).length !== entry.fields.length ||
        entry.fields.some(([key, reference]) => reference.deref() !== scope[key])
      )
        return;
      return entry.result;
    },
    put(scope: T, version: number, result: R) {
      clear();
      const fields = (Object.keys(scope) as Array<keyof T>).map(
        (key) => [key, new WeakRef(scope[key] as object)] as [keyof T, WeakRef<object>],
      );
      entry = { fields, version, result, expires: now() + ttlMs };
      timer = setTimer(clear, ttlMs);
    },
    clear,
  };
}
