type Schedule = (work: () => void) => () => void;
export type GridAdmissionSnapshot = { loaded: number; target: number; pending: boolean };

/** Paging keeps only two counters and one scheduled turn. A request paints
 * before bounded admission; held/obsolete jobs never mount hidden cards. */
export function createGridAdmission(initial: number, schedule: Schedule, batchSize = 8) {
  let loaded = initial, target = initial, maximum = Number.MAX_SAFE_INTEGER, held = false;
  let generation = 0, cancel: (() => void) | undefined;
  const listeners = new Set<() => void>();
  let snapshot: GridAdmissionSnapshot = { loaded, target, pending: false };
  const publish = () => {
    const pending = loaded < target;
    if (snapshot.loaded === loaded && snapshot.target === target && snapshot.pending === pending) return;
    snapshot = { loaded, target, pending };
    for (const listener of listeners) listener();
  };
  const stop = () => { generation++; cancel?.(); cancel = undefined; };
  const enqueue = () => {
    if (held || cancel || loaded >= target) return;
    const current = generation;
    cancel = schedule(() => {
      if (generation !== current || held) return;
      cancel = undefined;
      loaded = Math.min(target, loaded + Math.max(1, batchSize));
      publish();
      enqueue();
    });
  };
  return {
    snapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    request(pageSize: number) {
      target = Math.max(loaded, Math.min(maximum, target + pageSize));
      publish(); enqueue();
    },
    reset(next: number) { stop(); loaded = target = next; publish(); },
    setMaximum(next: number) {
      if (next === maximum) return;
      maximum = next;
      target = Math.max(loaded, Math.min(target, maximum));
      stop(); publish(); enqueue();
    },
    hold(next: boolean) {
      if (held === next) return;
      held = next;
      if (held) stop(); else enqueue();
    },
  };
}
