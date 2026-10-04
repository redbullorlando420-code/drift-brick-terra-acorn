export type IdleProgress = { scanned: number; total: number; changed: number; batches: number };
export type IdleStep<T> = { progress: IdleProgress; done: false } | { progress: IdleProgress; done: true; result: T };
export type IdleQueueRuntime = {
  allowed(): boolean;
  start?(signal: AbortSignal): Promise<void>;
  turn(signal: AbortSignal): Promise<void>;
  subscribe(wake: (interrupt?: boolean) => void): () => void;
};
type Job = { id: string; label: string; step(signal: AbortSignal, turn: () => Promise<void>): Promise<IdleStep<unknown>>;
  promise: Promise<unknown>; resolve(value: unknown): void; reject(error: unknown): void; progress: IdleProgress };
export type IdleQueueSnapshot = { paused: boolean; state: 'ready' | 'running' | 'waiting' | 'error';
  jobs: Array<{ id: string; label: string; progress: IdleProgress }>; error?: string;
  completed?: { label: string; progress: IdleProgress } };

/** One owner for optional work. An interrupted step drops its scratch arrays;
 * the job retains only its last completed cursor and retries that step later. */
export function createIdleQueue(runtime: IdleQueueRuntime) {
  const jobs = new Map<string, Job>(), listeners = new Set<() => void>();
  let paused = false, disposed = false, controller: AbortController | undefined;
  let running: Job | undefined, detach: (() => void) | undefined;
  let completed: IdleQueueSnapshot['completed'];
  let snapshot: IdleQueueSnapshot = { paused, state: 'ready', jobs: [] };
  const publish = (error?: string) => {
    snapshot = { paused, state: error ? 'error' : !jobs.size ? 'ready' : paused || !runtime.allowed() ? 'waiting' : running ? 'running' : 'ready',
      jobs: [...jobs.values()].map(({ id, label, progress }) => ({ id, label, progress })), ...(error ? { error } : {}), ...(completed ? { completed } : {}) };
    for (const listener of listeners) listener();
  };
  const release = () => { if (!jobs.size && !running) { detach?.(); detach = undefined; } };
  const pump = () => {
    if (disposed || running || paused || !runtime.allowed() || !jobs.size) { release(); return; }
    const job = jobs.values().next().value!;
    const abort = new AbortController(); controller = abort; running = job; publish();
    const turn = async () => { abort.signal.throwIfAborted(); await runtime.turn(abort.signal); abort.signal.throwIfAborted(); };
    void (async () => {
      try {
        if (runtime.start) { await runtime.start(abort.signal); abort.signal.throwIfAborted(); }
        else await turn();
        const result = await job.step(abort.signal, turn);
        abort.signal.throwIfAborted();
        // A committed batch may finish saving after interruption. Keep its
        // reported cursor, but never let a canceled owner publish a result.
        if (jobs.get(job.id) !== job) return;
        job.progress = result.progress;
        if (result.done) { completed = { label: job.label, progress: result.progress }; jobs.delete(job.id); job.resolve(result.result); }
        else { jobs.delete(job.id); jobs.set(job.id, job); }
      } catch (error) {
        if (!abort.signal.aborted && jobs.get(job.id) === job) {
          jobs.delete(job.id); job.reject(error);
          publish(error instanceof Error ? error.message : 'Metadata work could not be saved.');
        }
      } finally {
        running = undefined; controller = undefined;
        // Preserve the last failure until a new action or successful batch.
        if (!snapshot.error) publish();
        release(); pump();
      }
    })();
  };
  const wake = (interrupt = false) => {
    if (interrupt || paused || !runtime.allowed()) controller?.abort();
    if (!snapshot.error) publish(); pump();
  };
  return {
    enqueue<T>(id: string, label: string, step: (signal: AbortSignal, turn: () => Promise<void>) => Promise<IdleStep<T>>) {
      if (disposed) return Promise.reject<T>(new Error('Metadata queue has been disposed.'));
      const existing = jobs.get(id); if (existing) return existing.promise as Promise<T>;
      let resolve!: (value: unknown) => void, reject!: (error: unknown) => void;
      const promise = new Promise<unknown>((yes, no) => { resolve = yes; reject = no; });
      jobs.set(id, { id, label, step, promise, resolve, reject, progress: { scanned: 0, total: 0, changed: 0, batches: 0 } });
      detach ??= runtime.subscribe(wake);
      publish(); pump(); return promise as Promise<T>;
    },
    setPaused(value: boolean) { paused = value; publish(); wake(true); },
    cancel(id: string) {
      const job = jobs.get(id); if (!job) return;
      jobs.delete(id); job.reject(new DOMException('Metadata work canceled', 'AbortError'));
      if (running === job) controller?.abort(); publish(); release(); pump();
    },
    dispose() {
      disposed = true; controller?.abort();
      for (const job of jobs.values()) job.reject(new DOMException('Metadata work disposed', 'AbortError'));
      jobs.clear(); detach?.(); detach = undefined; publish();
    },
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  };
}
