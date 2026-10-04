type Policy = { concurrency: number; gapMs: number };
export type PullQueueSnapshot = { active: number; waiting: number; held: boolean; cancelled: number };
type Job = { work: (signal: AbortSignal) => Promise<unknown>; resolve: (value: unknown) => void; reject: (error: Error) => void; generation: number; controller: AbortController; ignorePause: boolean };
const cancelledError = () => new Error('Pull cancelled; accepted catalog entries remain saved.');
/** A bounded queue sleeps on pause/visibility changes. Each active slot retains
 * at most one response; cancellation aborts transport and releases that slot. */
export function createPullScheduler(policy: () => Policy, available: (ignorePause?: boolean) => boolean, maxWaiting = 8,
  options: { availabilityDelay?: (ignorePause?: boolean) => number; requestTimeoutMs?: number | (() => number) } = {}) {
  const queue: Job[] = [], running = new Set<Job>(), held = new Set<() => void>();
  const listeners = new Set<() => void>();
  let lastStarted = -Infinity, timer: ReturnType<typeof setTimeout> | undefined;
  let generation = 0, cancelled = 0;
  let snapshot: PullQueueSnapshot = { active: 0, waiting: 0, held: false, cancelled: 0 };
  const emit = () => {
    const waiting = (queue.length > 0 || running.size > 0) && !available(queue[0]?.ignorePause ?? false);
    if (snapshot.active === running.size && snapshot.waiting === queue.length && snapshot.held === waiting && snapshot.cancelled === cancelled) return;
    snapshot = { active: running.size, waiting: queue.length, held: waiting, cancelled };
    for (const listener of listeners) listener();
  };
  const schedule = (delay: number) => {
    if (!Number.isFinite(delay)) return;
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(pump, Math.max(1, delay));
  };
  const pump = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    emit();
    const ignorePause = queue[0]?.ignorePause ?? false;
    if (!available(ignorePause)) {
      if (queue.length || held.size) schedule(options.availabilityDelay?.(ignorePause) ?? Infinity);
      return;
    }
    for (const resume of [...held]) resume();
    const config = policy();
    if (!queue.length || running.size >= config.concurrency) return;
    const delay = lastStarted + config.gapMs - performance.now();
    if (delay > 0) { schedule(delay); return; }
    const job = queue.shift()!;
    running.add(job);
    void (async () => {
      let timeout: ReturnType<typeof setTimeout> | undefined;
      let abort = () => {};
      try {
        const interruption = new Promise<never>((_, reject) => {
            abort = () => reject(job.controller.signal.reason ?? cancelledError());
            job.controller.signal.addEventListener('abort', abort, { once: true });
            const requestTimeout = typeof options.requestTimeoutMs === 'function' ? options.requestTimeoutMs() : options.requestTimeoutMs ?? 90_000;
            timeout = setTimeout(() => job.controller.abort(new Error('Catalog request timed out. Its saved resume point is unchanged; retry the pull.')), requestTimeout);
          });
        // Measure the actual transport start, after setup and before notifying
        // subscribers. A slow store listener must not compress the next gap.
        lastStarted = performance.now();
        const work = job.work(job.controller.signal);
        emit();
        const result = await Promise.race([work, interruption]);
        clearTimeout(timeout);
        while (!available(job.ignorePause) && job.generation === generation) {
          await new Promise<void>(resolve => {
            const resume = () => { held.delete(resume); job.controller.signal.removeEventListener('abort', resume); resolve(); };
            held.add(resume);
            job.controller.signal.addEventListener('abort', resume, { once: true });
            pump();
          });
        }
        if (job.generation !== generation || job.controller.signal.aborted) throw cancelledError();
        job.resolve(result);
      } catch (error) { job.reject(error instanceof Error ? error : new Error(String(error))); }
      finally { clearTimeout(timeout); job.controller.signal.removeEventListener('abort', abort); running.delete(job); emit(); pump(); }
    })();
    if (queue.length && running.size < config.concurrency) schedule(config.gapMs);
  };
  return {
    run<T>(work: (signal: AbortSignal) => Promise<T>, options: { ignorePause?: boolean } = {}): Promise<T> {
      if (queue.length >= maxWaiting) return Promise.reject(new Error('Pull queue is full. Let the current batch finish before adding more.'));
      const ignorePause = options.ignorePause === true;
      const result = new Promise<T>((resolve, reject) => {
        const job = { work, resolve: (value: unknown) => resolve(value as T), reject, generation, controller: new AbortController(), ignorePause };
        if (ignorePause) queue.unshift(job); else queue.push(job);
      });
      pump(); return result;
    },
    cancel() {
      generation++; cancelled += queue.length + running.size;
      for (const job of queue.splice(0)) job.reject(cancelledError());
      for (const job of running) job.controller.abort(cancelledError());
      if (timer !== undefined) clearTimeout(timer); timer = undefined; emit();
    },
    wake: pump,
    revision: () => generation,
    snapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
  };
}
