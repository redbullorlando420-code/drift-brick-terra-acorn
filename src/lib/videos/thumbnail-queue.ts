type Priority = 'high' | 'low';
type Job = { key: string; work: (signal: AbortSignal) => Promise<void>; consumers: Map<symbol, Priority>; controller?: AbortController };
type Options = {
  workers: () => number;
  /** Infinity suspends decoders; a finite delay yields behind foreground input. */
  delay: () => number;
  subscribe?: (wake: () => void) => () => void;
  limit?: number;
  setTimer?: (wake: () => void, delay: number) => unknown;
  clearTimer?: (timer: unknown) => void;
};

/** Bounded local frame work. Pauses release decoders, retaining only subscribed
 * jobs to retry. One shared wake timer replaces polling by every queued card. */
export function createThumbnailQueue(options: Options) {
  const jobs = new Map<string, Job>();
  const running = new Set<Job>();
  const setTimer = options.setTimer ?? ((wake, delay) => setTimeout(wake, delay));
  const clearTimer = options.clearTimer ?? (timer => clearTimeout(timer as ReturnType<typeof setTimeout>));
  let timer: unknown, stopWatching: (() => void) | undefined, disposed = false;
  const clearWake = () => { if (timer !== undefined) clearTimer(timer); timer = undefined; };
  const remove = (job: Job) => {
    if (jobs.get(job.key) === job) jobs.delete(job.key);
    job.consumers.clear();
  };
  const next = () => {
    let low: Job | undefined;
    for (const job of jobs.values()) {
      if (job.controller) continue;
      if ([...job.consumers.values()].includes('high')) return job;
      low ??= job;
    }
    return low;
  };
  const start = (job: Job) => {
    const controller = new AbortController();
    job.controller = controller;
    running.add(job);
    void Promise.resolve().then(async () => {
      if (!controller.signal.aborted) await job.work(controller.signal);
    }).catch(() => {
      // The work owns its error UI. Never leave an unhandled queue rejection.
    }).finally(() => {
      running.delete(job);
      job.controller = undefined;
      // A pause is not a failed frame. Live consumers resume after the gate
      // opens; cancellation/unmount has already removed the old job.
      if (!controller.signal.aborted) remove(job);
      wake();
    });
  };
  function wake() {
    clearWake();
    if (disposed || !jobs.size) { stopWatching?.(); stopWatching = undefined; return; }
    const delay = options.delay();
    if (!Number.isFinite(delay)) {
      for (const job of running) job.controller?.abort();
      return;
    }
    const workers = Math.max(1, Math.min(4, options.workers()));
    if (running.size >= workers) return;
    if (delay > 0) { timer = setTimer(wake, delay); return; }
    while (running.size < workers) {
      const job = next();
      if (!job) return;
      start(job);
    }
  }
  return {
    enqueue(key: string, work: Job['work'], priority: Priority = 'low') {
      if (disposed) return () => {};
      let job = jobs.get(key);
      if (!job) {
        if (jobs.size >= (options.limit ?? 96)) return () => {};
        job = { key, work, consumers: new Map() };
        jobs.set(key, job);
      }
      const current = job;
      const consumer = Symbol(key);
      current.consumers.set(consumer, priority);
      if (!stopWatching) stopWatching = options.subscribe?.(wake);
      wake();
      return () => {
        current.consumers.delete(consumer);
        if (!current.consumers.size) { remove(current); current.controller?.abort(); }
        wake();
      };
    },
    wake,
    has: (key: string) => jobs.has(key),
    snapshot: () => ({ active: running.size, queued: [...jobs.values()].filter(job => !job.controller).length,
      jobs: jobs.size, timers: timer === undefined ? 0 : 1 }),
    clear() {
      clearWake();
      for (const job of jobs.values()) { job.consumers.clear(); job.controller?.abort(); }
      jobs.clear();
      wake();
    },
    dispose() { this.clear(); disposed = true; },
  };
}
