import { PROVIDER_BUDGETS, ProviderBudgetError } from '../provider-budgets.ts';

/** Count actual decompressed UTF-8 bytes, including chunked responses with no
 * length header. Reject a whole oversized page; never publish truncated JSON. */
export async function readProviderBody(response: Response, options: {
  maxBytes?: number; timeoutMs?: number; signal?: AbortSignal; prefix?: boolean;
} = {}): Promise<Uint8Array> {
  const maximum = Math.max(1, Math.floor(options.maxBytes ?? PROVIDER_BUDGETS.responseBytes));
  if (!Number.isFinite(maximum)) throw new Error('Invalid metadata byte budget');
  options.signal?.throwIfAborted();
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  // Consolidate small network chunks so a byte-bounded response cannot retain
  // millions of tiny typed arrays. At most 128 blocks for the default budget.
  const blocks: Uint8Array[] = []; let bytes = 0, allocated = 0, used = 0;
  const append = (value: Uint8Array) => {
    let offset = 0;
    while (offset < value.byteLength) {
      let block = blocks[blocks.length - 1];
      if (!block || used === block.byteLength) {
        block = new Uint8Array(Math.min(64 * 1024, maximum - allocated));
        blocks.push(block); allocated += block.byteLength; used = 0;
      }
      const length = Math.min(value.byteLength - offset, block.byteLength - used);
      block.set(value.subarray(offset, offset + length), used);
      used += length; offset += length; bytes += length;
    }
  };
  const controller = new AbortController();
  const signal = options.signal ? AbortSignal.any([options.signal, controller.signal]) : controller.signal;
  const timer = setTimeout(() => controller.abort(new DOMException('Provider metadata body timed out', 'TimeoutError')), options.timeoutMs ?? PROVIDER_BUDGETS.bodyTimeoutMs);
  let fail: (error: unknown) => void = () => {};
  const aborted = new Promise<never>((_resolve, reject) => { fail = reject; });
  const abort = () => { void reader.cancel(signal.reason).catch(() => undefined); fail(signal.reason); };
  signal.addEventListener('abort', abort, { once: true });
  try {
    if (signal.aborted) abort();
    while (true) {
      const { value, done } = await Promise.race([reader.read(), aborted]);
      signal.throwIfAborted();
      if (done) break;
      if (bytes + value.byteLength > maximum) {
        if (!options.prefix) throw new ProviderBudgetError('bytes', `Provider metadata exceeded the ${maximum.toLocaleString()}-byte response budget; the incomplete page was not accepted.`);
        const remaining = maximum - bytes;
        if (remaining) append(value.subarray(0, remaining));
        void reader.cancel().catch(() => undefined); break;
      }
      if (value.byteLength) append(value);
      if (options.prefix && bytes === maximum) { void reader.cancel().catch(() => undefined); break; }
    }
    const result = new Uint8Array(bytes); let offset = 0;
    for (const block of blocks) {
      const length = Math.min(block.byteLength, bytes - offset);
      result.set(block.subarray(0, length), offset); offset += length;
    }
    return result;
  } catch (error) { void reader.cancel(error).catch(() => undefined); throw error; }
  finally { clearTimeout(timer); signal.removeEventListener('abort', abort); reader.releaseLock(); }
}

/** Serialize complete transfers through a bounded shared lane. A cancelled
 * queued job releases its closure immediately and never reaches fetch. */
export function createProviderMetadataTransport(concurrency: number, fetcher: typeof fetch = (...args) => globalThis.fetch(...args)) {
  if (!Number.isInteger(concurrency) || concurrency < 1) throw new Error('Invalid metadata concurrency');
  type Job = { url: string; init?: RequestInit; resolve: (response: Response) => void; reject: (error: unknown) => void; abort: () => void };
  const queue: Job[] = []; let active = 0;
  const work = async (job: Job) => {
    job.init?.signal?.throwIfAborted();
    const response = await fetcher(job.url, job.init);
    const bytes = await readProviderBody(response, { signal: job.init?.signal ?? undefined,
      ...(!response.ok ? { maxBytes: PROVIDER_BUDGETS.errorPrefixBytes, prefix: true } : {}) });
    const headers = new Headers(response.headers);
    // Fetch already decompressed these bytes. Do not advertise the original
    // compressed length/encoding on the reconstructed in-process response.
    headers.delete('content-encoding'); headers.delete('content-length'); headers.delete('transfer-encoding');
    return new Response([204, 205, 304].includes(response.status) ? null : bytes.buffer as ArrayBuffer, { status: response.status, statusText: response.statusText, headers });
  };
  const drain = () => {
    while (active < concurrency && queue.length) {
      const job = queue.shift()!; job.init?.signal?.removeEventListener('abort', job.abort);
      active++;
      void work(job).then(job.resolve, job.reject).finally(() => { active--; drain(); });
    }
  };
  return {
    request: (url: string, init?: RequestInit): Promise<Response> => new Promise((resolve, reject) => {
      if (init?.signal?.aborted) { reject(init.signal.reason); return; }
      if (queue.length >= PROVIDER_BUDGETS.queuedRequests) { reject(new ProviderBudgetError('queue', 'Provider metadata queue is full; accepted pages and saved positions are preserved.')); return; }
      const job: Job = { url, init, resolve, reject, abort: () => {
        const index = queue.indexOf(job); if (index < 0) return;
        queue.splice(index, 1); init?.signal?.removeEventListener('abort', job.abort); reject(init?.signal?.reason);
      } };
      queue.push(job); init?.signal?.addEventListener('abort', job.abort, { once: true }); drain();
    }),
    snapshot: () => ({ active, queued: queue.length, concurrency, maxQueued: PROVIDER_BUDGETS.queuedRequests }),
  };
}
const twitch = createProviderMetadataTransport(PROVIDER_BUDGETS.twitchTransfers);
const adult = createProviderMetadataTransport(PROVIDER_BUDGETS.adultTransfers);
export const fetchProviderMetadata = (url: string, init?: RequestInit) =>
  (new URL(url).hostname === 'gql.twitch.tv' ? twitch : adult).request(url, init);
