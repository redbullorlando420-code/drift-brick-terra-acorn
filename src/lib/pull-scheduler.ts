type Policy = { concurrency: number; gapMs: number };
export type PullQueueSnapshot = { active: number; waiting: number; held: boolean; cancelled: number };
type Job = { work: () => Promise<unknown>; resolve: (value: unknown) => void; reject: (error: Error) => void; generation: number };
/** One small queue for catalog responses. A completed response keeps its slot
 * until it can be committed, preventing paused viewers accumulating payloads. */
export function createPullScheduler(policy: () => Policy, available: () => boolean, maxWaiting = 8) {
  const queue: Job[] = [];
  const listeners = new Set<() => void>();
  let active = 0, lastStarted = -Infinity, timer: ReturnType<typeof setTimeout> | undefined;
  let generation = 0, cancelled = 0;
  let snapshot: PullQueueSnapshot = { active: 0, waiting: 0, held: false, cancelled: 0 };
  const emit = () => {
    const held = (queue.length > 0 || active > 0) && !available();
    if (snapshot.active === active && snapshot.waiting === queue.length && snapshot.held === held && snapshot.cancelled === cancelled) return;
    snapshot = { active, waiting: queue.length, held, cancelled };
    for (const listener of listeners) listener();
  };
  const schedule = (delay: number) => { if (timer !== undefined) clearTimeout(timer); timer = setTimeout(pump, Math.max(1, delay)); };
  const pump = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    const config = policy();
    emit();
    if (!queue.length) return;
    if (!available()) { schedule(250); return; }
    if (active >= config.concurrency) return;
    const delay = lastStarted + config.gapMs - Date.now();
    if (delay > 0) { schedule(delay); return; }
    const job = queue.shift()!;
    active++; lastStarted = Date.now(); emit();
    void (async () => {
      try {
        const result = await job.work();
        while (!available() && job.generation === generation) { emit(); await new Promise(resolve => setTimeout(resolve, 250)); }
        if (job.generation !== generation) throw new Error('Pull cancelled; accepted catalog entries remain saved.');
        job.resolve(result);
      } catch (error) { job.reject(error instanceof Error ? error : new Error(String(error))); }
      finally { active--; emit(); pump(); }
    })();
    if (queue.length && active < config.concurrency) schedule(config.gapMs);
  };
  return {
    run<T>(work: () => Promise<T>): Promise<T> {
      if (queue.length >= maxWaiting) return Promise.reject(new Error('Pull queue is full. Let the current batch finish before adding more.'));
      const result = new Promise<T>((resolve, reject) => queue.push({ work, resolve: value => resolve(value as T), reject, generation }));
      pump(); return result;
    },
    cancel() {
      generation++; cancelled += queue.length + active;
      for (const job of queue.splice(0)) job.reject(new Error('Pull cancelled; accepted catalog entries remain saved.'));
      if (timer !== undefined) clearTimeout(timer); timer = undefined; emit();
    },
    wake: pump,
    revision: () => generation,
    snapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
  };
}
