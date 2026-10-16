/** One latest value and one timer, regardless of how many catalog batches
 * arrive. Quiet time coalesces enrichment; max wait prevents starvation. */
export function createSettledInput<T>(publish: (value: T) => void, options: {
  quietMs?: number; maxWaitMs?: number; now?: () => number;
  setTimer?: (work: () => void, delay: number) => unknown; clearTimer?: (timer: unknown) => void;
} = {}) {
  const now = options.now ?? Date.now;
  const setTimer = options.setTimer ?? ((work, delay) => setTimeout(work, delay));
  const clearTimer = options.clearTimer ?? (timer => clearTimeout(timer as ReturnType<typeof setTimeout>));
  const quiet = options.quietMs ?? 350, maxWait = options.maxWaitMs ?? 1500;
  let pending: { value: T; started: number } | undefined, timer: unknown, generation = 0;
  const cancelTimer = () => { if (timer !== undefined) clearTimer(timer); timer = undefined; };
  const cancel = () => { generation++; cancelTimer(); pending = undefined; };
  return {
    push(value: T) {
      const started = pending?.started ?? now();
      pending = { value, started }; cancelTimer();
      const ticket = ++generation;
      timer = setTimer(() => {
        if (ticket !== generation || !pending) return;
        const value = pending.value; pending = undefined; timer = undefined;
        publish(value);
      }, Math.max(0, Math.min(quiet, started + maxWait - now())));
    },
    cancel,
  };
}
