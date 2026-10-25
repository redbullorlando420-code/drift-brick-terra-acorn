type Policy = { concurrency: number; gapMs: number };
export type PullQueueSnapshot = { active: number; waiting: number; held: boolean; cancelled: number };
type Job = { work: (signal: AbortSignal) => Promise<unknown>; resolve: (value: unknown) => void; reject: (error: Error) => void; generation: number; controller: AbortController; ignorePause: boolean; canStart?: () => boolean; deferWhenBlocked?: boolean };
export class PullPriorityDeferredError extends Error { constructor() { super('Automatic pull deferred to the active page.'); this.name = 'PullPriorityDeferredError'; } }
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
    const waiting = held.size > 0 || queue.length > 0 && !queue.some(job => available(job.ignorePause) && (job.canStart?.() ?? true));
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
    for (let index = queue.length - 1; index >= 0; index--) {
      const job = queue[index];
      if (job.deferWhenBlocked && job.canStart?.() === false) { queue.splice(index, 1); job.reject(new PullPriorityDeferredError()); }
    }
    emit();
    // Page priority affects admission only. A completed response must still be
    // released when its original pause/visibility gate opens.
    for (const resume of [...held]) resume();
    if (held.size) schedule(options.availabilityDelay?.(false) ?? Infinity);
    const config = policy();
    if (!queue.length || running.size >= config.concurrency) return;
    const position = queue.findIndex(job => available(job.ignorePause) && (job.canStart?.() ?? true));
    if (position < 0) {
      // Priority-blocked jobs sleep until wake(), without a zero-delay loop.
      const delays = queue.filter(job => job.canStart?.() ?? true).map(job => options.availabilityDelay?.(job.ignorePause) ?? Infinity);
      if (delays.length) schedule(Math.min(...delays));
      return;
    }
    const delay = lastStarted + config.gapMs - performance.now();
    if (delay > 0) { schedule(delay); return; }
    const job = queue.splice(position, 1)[0];
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
        while (!available(job.ignorePause) && job.generation === generation && !job.controller.signal.aborted) {
          await new Promise<void>(resolve => {
            const resume = () => { if (!available(job.ignorePause) && !job.controller.signal.aborted && job.generation === generation) return; held.delete(resume); job.controller.signal.removeEventListener('abort', resume); resolve(); };
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
    run<T>(work: (signal: AbortSignal) => Promise<T>, options: { ignorePause?: boolean; canStart?: () => boolean; deferWhenBlocked?: boolean; signal?: AbortSignal } = {}): Promise<T> {
      if (options.signal?.aborted) return Promise.reject(options.signal.reason ?? cancelledError());
      if (queue.length >= maxWaiting) return Promise.reject(new Error('Pull queue is full. Let the current batch finish before adding more.'));
      const ignorePause = options.ignorePause === true;
      const result = new Promise<T>((resolve, reject) => {
        const cleanup = () => options.signal?.removeEventListener('abort', abort);
        const job: Job = { work, resolve: (value: unknown) => { cleanup(); resolve(value as T); }, reject: error => { cleanup(); reject(error); }, generation, controller: new AbortController(), ignorePause, canStart: options.canStart, deferWhenBlocked: options.deferWhenBlocked };
        const abort = () => {
          const position = queue.indexOf(job);
          if (position >= 0) { queue.splice(position, 1); job.reject(cancelledError()); }
          else job.controller.abort(options.signal?.reason ?? cancelledError());
          pump();
        };
        options.signal?.addEventListener('abort', abort, { once: true });
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
