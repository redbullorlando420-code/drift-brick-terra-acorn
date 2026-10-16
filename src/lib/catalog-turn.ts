import { yieldCatalogTask } from './catalog-work';
import { getInteractionPriorityDelay, scheduleBackgroundWork } from './interaction-budget';

/** A cancelable slice boundary that lets current input paint before catalog work. */
export function catalogTurn(signal: AbortSignal) {
  return async () => {
    signal.throwIfAborted();
    await yieldCatalogTask();
    signal.throwIfAborted();
    if (getInteractionPriorityDelay() > 0) await new Promise<void>((resolve, reject) => {
      const stop = () => { cancel(); reject(signal.reason); };
      const cancel = scheduleBackgroundWork(() => { signal.removeEventListener('abort', stop); resolve(); });
      signal.addEventListener('abort', stop, { once: true });
    });
    signal.throwIfAborted();
  };
}
