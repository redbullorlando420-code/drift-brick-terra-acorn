export function providerDelay(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) { reject(signal.reason); return; }
    const cleanup = () => signal?.removeEventListener('abort', abort);
    const abort = () => { clearTimeout(timer); cleanup(); reject(signal?.reason); };
    const timer = setTimeout(() => { cleanup(); resolve(); }, ms);
    signal?.addEventListener('abort', abort, { once: true });
  });
}
