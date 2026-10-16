/** User events retain their order while expensive follow-up work waits for
 * foreground paint. One bounded queue/timer; hide/unload can flush explicitly. */
export function createDeferredEvents<T>(consume: (value: T) => void, schedule: (work: () => void) => () => void, limit = 64) {
  let pending: T[] = [], cancel: (() => void) | undefined, generation = 0;
  const clearTimer = () => { generation++; cancel?.(); cancel = undefined; };
  const flush = () => {
    clearTimer();
    const batch = pending; pending = [];
    for (const value of batch) consume(value);
  };
  return {
    push(value: T) {
      pending.push(value);
      if (pending.length >= limit) { flush(); return; }
      if (cancel) return;
      const ticket = ++generation;
      cancel = schedule(() => { if (ticket === generation) flush(); });
    },
    flush,
    clear() { clearTimer(); pending = []; },
    size: () => pending.length,
  };
}
