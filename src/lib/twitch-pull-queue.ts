export const TWITCH_FOCUSED_QUEUE_LIMIT = 8;
export type TwitchPullJob = { id: string; handle: string; name: string; vodLimit: number; clipLimit: number };
export type TwitchPullQueueSnapshot = { active: TwitchPullJob | null; waiting: readonly TwitchPullJob[]; stopping: boolean; message: string };

/** One finite batch per creator. Cancellation also wakes a paused queue owner. */
export function createTwitchPullQueue(deps: {
  revision: () => number;
  wait: (signal: AbortSignal, revision: number) => Promise<void>;
  live: () => Promise<void>;
  pull: (job: TwitchPullJob) => Promise<string>;
}) {
  let snapshot: TwitchPullQueueSnapshot = { active: null, waiting: [], stopping: false, message: '' };
  let running = false;
  let controller: AbortController | undefined;
  const listeners = new Set<() => void>();
  const publish = (patch: Partial<TwitchPullQueueSnapshot>) => { snapshot = { ...snapshot, ...patch }; for (const listener of listeners) listener(); };
  const drain = async () => {
    if (running) return;
    running = true; controller = new AbortController();
    const signal = controller.signal;
    const revision = deps.revision();
    try {
      while (snapshot.waiting.length && !signal.aborted) {
        await deps.wait(signal, revision);
        if (!snapshot.waiting.length || signal.aborted) break;
        // Live refresh owns a separate, shallow budget before every creator.
        // A failed live check must not discard the explicitly queued archive.
        await deps.live().catch(() => undefined);
        await deps.wait(signal, revision);
        const next = snapshot.waiting[0];
        if (!next || signal.aborted) break;
        publish({ active: next, waiting: snapshot.waiting.slice(1) });
        try { publish({ message: await deps.pull(next) }); }
        catch (error) { publish({ message: `${next.name}: ${error instanceof Error ? error.message : String(error)}`.slice(0, 320) }); }
        publish({ active: null });
      }
    } catch {
      // Global cancellation clears pending creators instead of silently
      // restarting the next one with a fresh cancellation revision.
      publish({ waiting: [], message: 'Queue stopped. Accepted videos and saved positions are retained.' });
    } finally {
      running = false; controller = undefined; publish({ active: null, stopping: false });
    }
  };
  return {
    snapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    enqueue: (job: TwitchPullJob) => {
      if (snapshot.stopping || snapshot.active?.id === job.id || snapshot.waiting.some(row => row.id === job.id)
        || snapshot.waiting.length + Number(Boolean(snapshot.active)) >= TWITCH_FOCUSED_QUEUE_LIMIT) return false;
      publish({ waiting: [...snapshot.waiting, { ...job }], ...(!snapshot.active && !snapshot.waiting.length ? { message: '' } : {}) }); void drain(); return true;
    },
    remove: (id: string) => {
      publish({ waiting: snapshot.waiting.filter(job => job.id !== id) });
      if (!snapshot.waiting.length && !snapshot.active && running) { publish({ stopping: true }); controller?.abort(); }
    },
    stop: () => {
      publish({ waiting: [], stopping: running, message: snapshot.active ? 'Stopping after this batch; accepted pages will be saved.' : 'Queue cleared.' });
      controller?.abort();
    },
  };
}
