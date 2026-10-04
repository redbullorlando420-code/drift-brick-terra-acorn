export type PeriodicMode = 'active' | 'visible' | 'always';
type Phase = 'active' | 'idle' | 'hidden';
export type PeriodicTask = {
  name: string;
  everyMs: number;
  firstMs?: number;
  /** Visible idle archives are allowed; cosmetic work requires active input.
   * Room synchronization uses always so background playback remains accurate. */
  mode?: PeriodicMode;
  enabled?: () => boolean;
  background?: boolean;
  work: (signal: AbortSignal) => unknown;
  onError?: (error: unknown) => void;
};
export type PeriodicRuntime = {
  now: () => number;
  phase: () => Phase;
  inputDelay: () => number;
  available?: () => boolean;
  setTimer: (work: () => void, delay: number) => unknown;
  clearTimer: (timer: unknown) => void;
};

/** One native timer for recurring app work. No queued ticks, concurrent calls
 * to the same job, or replay of time spent asleep. Transport deadlines and
 * debounce timers remain with their owners. */
export function createPeriodicScheduler(runtime: PeriodicRuntime) {
  type Job = PeriodicTask & { nextAt: number; controller: AbortController | null };
  const jobs = new Set<Job>();
  let timer: unknown;
  let timerAt = Infinity;
  let callbacks = 0;
  const enabled = (job: Job) => (runtime.available?.() ?? true)
    && (job.mode === 'always' || runtime.phase() === 'active' || (job.mode === 'visible' && runtime.phase() === 'idle'))
    && (job.enabled?.() ?? true);
  const dueAt = (job: Job, now: number) => Math.max(job.nextAt,
    job.background === false ? now : now + runtime.inputDelay());
  const schedule = () => {
    const now = runtime.now();
    let next = Infinity;
    for (const job of jobs) if (!job.controller && enabled(job)) next = Math.min(next, dueAt(job, now));
    // Retain the existing earliest timer instead of resetting it on every input.
    if (next === timerAt) return;
    if (timer !== undefined) runtime.clearTimer(timer);
    timer = undefined; timerAt = next;
    if (Number.isFinite(next)) timer = runtime.setTimer(pump, Math.max(0, next - now));
  };
  const finished = (job: Job, controller: AbortController) => {
    if (job.controller !== controller) return;
    job.controller = null;
    job.nextAt = runtime.now() + job.everyMs;
    schedule();
  };
  const failed = (job: Job, error: unknown) => {
    if (!jobs.has(job)) return;
    try { job.onError?.(error); } catch { /* A diagnostic must not strand the scheduler. */ }
  };
  function pump() {
    timer = undefined; timerAt = Infinity;
    const now = runtime.now();
    // One callback per task turn gives clicks/paint a boundary between jobs.
    const job = [...jobs].find(item => !item.controller && enabled(item) && dueAt(item, now) <= now);
    if (job) {
      const controller = new AbortController();
      job.controller = controller; callbacks++;
      try {
        const result = job.work(controller.signal);
        if (result && typeof (result as PromiseLike<unknown>).then === 'function') {
          void Promise.resolve(result).then(() => finished(job, controller), error => { failed(job, error); finished(job, controller); });
        } else finished(job, controller);
      } catch (error) { failed(job, error); finished(job, controller); }
    }
    schedule();
  }
  return {
    register(task: PeriodicTask) {
      if (!Number.isFinite(task.everyMs) || task.everyMs <= 0 || (task.firstMs !== undefined && (!Number.isFinite(task.firstMs) || task.firstMs < 0))) throw new Error('Invalid periodic task interval');
      const job: Job = { ...task, mode: task.mode ?? 'active', nextAt: runtime.now() + (task.firstMs ?? task.everyMs), controller: null };
      jobs.add(job); schedule();
      return {
        /** Explicit settings/pause changes can request one turn immediately. */
        wake() { if (!jobs.has(job)) return; job.nextAt = runtime.now(); schedule(); },
        cancel() {
          if (!jobs.delete(job)) return;
          job.controller?.abort(); job.controller = null;
          schedule();
        },
      };
    },
    wake: schedule,
    snapshot() {
      let running = 0, paused = 0;
      for (const job of jobs) { if (job.controller) running++; else if (!enabled(job)) paused++; }
      return { tasks: jobs.size, running, paused, timerCount: timer === undefined ? 0 : 1, callbacks };
    },
  };
}
