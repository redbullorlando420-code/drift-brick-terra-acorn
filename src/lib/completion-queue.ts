export type Completion<T, R> = { item: T } & ({ ok: true; value: R } | { ok: false; error: unknown });

/** Bounded look-ahead: completed responses occupy their slot until consumed.
 * Select new work at each consumption so current retry/due rules still apply. */
export function createCompletionQueue<T, R>(options: {
  concurrency: number;
  take: () => T | undefined;
  request: (item: T, signal: AbortSignal) => Promise<R>;
}) {
  const controller = new AbortController();
  const pending = new Map<number, Promise<{ id: number; result: Completion<T, R> }>>();
  const ready: Array<{ id: number; result: Completion<T, R> }> = [];
  let sequence = 0, closed = false;
  const fill = () => {
    while (!closed && pending.size < Math.max(1, Math.min(3, options.concurrency))) {
      const item = options.take();
      if (item === undefined) break;
      const id = sequence++;
      const task = Promise.resolve().then(() => options.request(item, controller.signal))
        .then(value => ({ id, result: { item, ok: true as const, value } }),
          error => ({ id, result: { item, ok: false as const, error } }));
      pending.set(id, task);
      void task.then(result => { if (!closed) ready.push(result); });
    }
  };
  return {
    async next(): Promise<Completion<T, R> | undefined> {
      fill();
      if (!pending.size || closed) return;
      // Promise.race alone picks insertion order when several promises have
      // already settled during a catalog merge; retain actual completion order.
      if (!ready.length) await Promise.race(pending.values());
      if (closed) return;
      const completed = ready.shift()!;
      pending.delete(completed.id);
      return completed.result;
    },
    takeReady(accept: (result: Completion<T, R>) => boolean): Completion<T, R> | undefined {
      const completed = ready[0];
      if (!completed || !accept(completed.result)) return;
      ready.shift(); pending.delete(completed.id);
      return completed.result;
    },
    close() {
      closed = true; controller.abort(new Error('Live check pipeline closed.'));
      pending.clear(); ready.length = 0;
    },
  };
}
