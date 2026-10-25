import { PROVIDER_BUDGETS, ProviderBudgetError } from '../provider-budgets.ts';
import { readProviderBody } from './provider-body.ts';

export type YoutubeRequestScope = 'catalog' | 'page' | 'feed' | 'live' | 'details' | 'all';
export type YoutubeManualRetry = { readonly revision: number };
type YoutubeRequestInit = RequestInit & { timeoutMs?: number; manualRetry?: YoutubeManualRetry; scope?: YoutubeRequestScope };
type Cooldown = { retryAt: number; attempts: number; status: number; networkBlocked: boolean; revision: number };
export class YoutubeRequestError extends Error {
  status: number;
  retryAt?: number;
  cooldownScope?: YoutubeRequestScope;
  constructor(message: string, status: number, nextRetryAt?: number, scope?: YoutubeRequestScope) {
    super(message); this.status = status; this.retryAt = nextRetryAt; this.cooldownScope = scope;
  }
}
export function youtubeRequestScope(url: string): Exclude<YoutubeRequestScope, 'all'> {
  const path = new URL(url).pathname;
  return path.startsWith('/feeds/') ? 'feed' : /\/(streams|live)\/?$/.test(path) ? 'live'
    : path === '/watch' || path === '/oembed' || /\/youtubei\/v1\/(next|live_chat\/)/.test(path) ? 'details'
    : path.startsWith('/youtubei/') ? 'catalog' : 'page';
}

/** The browser queue limits app jobs. This queue limits the actual upstream
 * requests inside them, shared by imports, pages, RSS, and live checks. */
export function createYoutubeTransport(options: {
  fetch?: typeof fetch; now?: () => number; sleep?: (ms: number) => Promise<void>; gapMs?: () => number; liveGapMs?: () => number;
} = {}) {
  const now = options.now ?? (() => Date.now());
  const sleep = options.sleep ?? (ms => new Promise(resolve => setTimeout(resolve, ms)));
  const cooldowns = new Map<YoutubeRequestScope, Cooldown>();
  let cooldownRevision = 0;
  let startTail: Promise<unknown> = Promise.resolve(), lastStarted = -Infinity, queued = 0;
  const lanes = {
    live: { tail: Promise.resolve() as Promise<unknown>, lastStarted: -Infinity },
    other: { tail: Promise.resolve() as Promise<unknown>, lastStarted: -Infinity },
  };
  const archiveGap = () => Math.max(0, options.gapMs?.() ?? 80);
  const liveGap = () => Math.max(0, options.liveGapMs?.() ?? archiveGap());
  type TransferLane = 'live' | 'feed' | 'other';
  const waiting: Array<{ lane: TransferLane; start: () => void }> = [];
  const active = { live: 0, feed: 0, other: 0 };
  const limits = { live: PROVIDER_BUDGETS.youtubeLiveTransfers, feed: PROVIDER_BUDGETS.youtubeFeedTransfers, other: PROVIDER_BUDGETS.youtubeTransfers };
  const pump = () => {
    for (let i = 0; i < waiting.length;) {
      const job = waiting[i];
      if (active[job.lane] >= limits[job.lane]) { i++; continue; }
      waiting.splice(i, 1);
      active[job.lane]++;
      job.start();
    }
  };
  const cooling = (scope: YoutubeRequestScope, at = now()) => {
    const candidates = [cooldowns.get('all'), cooldowns.get(scope)].filter((row): row is Cooldown => Boolean(row && row.retryAt > at));
    return candidates.sort((a, b) => b.retryAt - a.retryAt)[0];
  };
  const retryAt = (scope: YoutubeRequestScope = 'catalog', at = now()) => cooling(scope, at)?.retryAt;
  const cooldownScope = (scope: YoutubeRequestScope = 'catalog', at = now()): YoutubeRequestScope | undefined => {
    const next = cooling(scope, at);
    return next ? cooldowns.get('all') === next ? 'all' : scope : undefined;
  };
  // A user retry ignores only limits known when that operation began. A new
  // rejection (including one from another job) stops its remaining requests.
  // Other jobs keep their normal cooldown; nothing is globally reset.
  const manualRetry = (): YoutubeManualRetry => ({ revision: cooldownRevision });
  const ready = (scope: YoutubeRequestScope = 'catalog', at = now(), retry?: YoutubeManualRetry) => {
    const next = [cooldowns.get('all'), cooldowns.get(scope)]
      .filter((row): row is Cooldown => Boolean(row && row.retryAt > at && (!retry || row.revision > retry.revision)))
      .sort((a, b) => b.retryAt - a.retryAt)[0];
    if (next) throw new YoutubeRequestError(`YouTube HTTP ${next.status}${next.networkBlocked ? ': Google reported unusual traffic from this network' : ' rate limit'}. Retry after ${new Date(next.retryAt).toLocaleTimeString()}.`, next.status, next.retryAt, cooldowns.get('all') === next ? 'all' : scope);
  };
  const accept = (response: Response, at = now(), scope: YoutubeRequestScope = 'catalog', networkBlocked = false, startedRevision = cooldownRevision) => {
    if (response.ok) {
      // An older in-flight success cannot clear a newer parallel rejection.
      for (const key of [scope, 'all'] as YoutubeRequestScope[]) if ((cooldowns.get(key)?.revision ?? Infinity) <= startedRevision) cooldowns.delete(key);
      return;
    }
    if (response.status === 429 || response.status === 503 && response.headers.has('retry-after')) {
      // Google's HTML challenge can coexist with healthy public browse and
      // RSS responses. Hold HTML requests without assuming those independent
      // endpoints failed too. A network rejection of JSON/RSS remains global.
      const target = networkBlocked && scope !== 'page' ? 'all' : scope;
      const attempts = Math.min(3, (cooldowns.get(target)?.attempts ?? 0) + 1);
      const header = response.headers.get('retry-after');
      const seconds = header !== null && header.trim() ? Number(header) : NaN;
      const advertised = Number.isFinite(seconds) ? at + seconds * 1000 : Date.parse(header ?? '');
      const deadline = Math.max(at + (networkBlocked ? 15 : 5) * 60_000 * 2 ** (attempts - 1), Number.isFinite(advertised) ? advertised : 0);
      cooldowns.set(target, { retryAt: deadline, attempts, status: response.status, networkBlocked, revision: ++cooldownRevision });
      void response.body?.cancel().catch(() => undefined);
      throw new YoutubeRequestError(`YouTube HTTP ${response.status}${networkBlocked ? ': Google reported unusual traffic from this network' : ' rate limit'}. Retry after ${new Date(deadline).toLocaleTimeString()}.`, response.status, deadline, target);
    }
    void response.body?.cancel().catch(() => undefined);
    throw new YoutubeRequestError(`YouTube HTTP ${response.status}: public metadata request failed.`, response.status);
  };
  const request = (url: string, init?: YoutubeRequestInit) => {
    if (init?.signal?.aborted) return Promise.reject(init.signal.reason);
    if (queued >= PROVIDER_BUDGETS.queuedRequests) return Promise.reject(new ProviderBudgetError('queue', 'YouTube metadata queue is full; accepted pages and saved positions are preserved.'));
    const scope = init?.scope ?? youtubeRequestScope(url);
    const path = new URL(url).pathname;
    queued++;
    const html = !path.startsWith('/youtubei/') && !path.startsWith('/feeds/') && path !== '/oembed';
    const checkReady = () => { ready(scope, now(), init?.manualRetry); if (html && scope !== 'page') ready('page', now(), init?.manualRetry); };
    const work = async () => {
      // Archive pacing waits outside the shared start queue. A long saved
      // archive gap must never hold live metadata behind a sleeping archive.
      const lane = scope === 'live' ? lanes.live : lanes.other;
      const start = lane.tail.then(async () => {
        checkReady(); init?.signal?.throwIfAborted();
        const gap = scope === 'live' ? liveGap() : archiveGap();
        const delay = lane.lastStarted + gap - now();
        if (delay > 0) await sleep(delay);
        const sharedStart = startTail.then(async () => {
          checkReady(); init?.signal?.throwIfAborted();
          const delay = lastStarted + Math.min(archiveGap(), liveGap(), PROVIDER_BUDGETS.youtubeLiveRequestGapMs) - now();
          if (delay > 0) await sleep(delay);
          checkReady(); init?.signal?.throwIfAborted();
          lastStarted = lane.lastStarted = now();
          return cooldownRevision;
        });
        startTail = sharedStart.catch(() => undefined);
        return sharedStart;
      });
      lane.tail = start.catch(() => undefined);
      const startedRevision = await start;
      checkReady(); init?.signal?.throwIfAborted();
      const { timeoutMs, manualRetry: _manualRetry, scope: _scope, ...requestInit } = init ?? {};
      // Request timeouts begin at transport start, not while waiting behind
      // another job or a user-selected pacing gap.
      if (timeoutMs) requestInit.signal = AbortSignal.any([...(requestInit.signal ? [requestInit.signal] : []), AbortSignal.timeout(timeoutMs)]);
      const response = await (options.fetch ?? globalThis.fetch)(url, requestInit);
      // Finish the body before releasing this lane slot.
      let body: Uint8Array;
      try {
        body = await readProviderBody(response, { signal: requestInit.signal ?? undefined,
          ...(!response.ok ? { maxBytes: PROVIDER_BUDGETS.errorPrefixBytes, prefix: true } : {}) });
      } catch (error) {
        // A stalled error body must not erase a genuine HTTP rate limit.
        if (!response.ok) accept(response, now(), scope);
        throw error;
      }
      const blocked = response.status === 429 && /unusual traffic from your computer network/i.test(new TextDecoder().decode(body));
      accept(response, now(), blocked && html ? 'page' : scope, blocked, startedRevision);
      const headers = new Headers(response.headers);
      headers.delete('content-encoding'); headers.delete('content-length'); headers.delete('transfer-encoding');
      return new Response([204, 205, 304].includes(response.status) ? null : body.buffer as ArrayBuffer, { status: response.status, statusText: response.statusText, headers });
    };
    const lane: TransferLane = scope === 'live' ? 'live' : scope === 'feed' ? 'feed' : 'other';
    return new Promise<Response>((resolve, reject) => {
      const abort = () => {
        const position = waiting.indexOf(job);
        if (position < 0) return;
        waiting.splice(position, 1); queued--;
        init?.signal?.removeEventListener('abort', abort);
        reject(init?.signal?.reason ?? new Error('YouTube request cancelled.'));
        pump();
      };
      const job = { lane, start: () => {
        init?.signal?.removeEventListener('abort', abort);
        void work().then(resolve, reject).finally(() => {
          queued--; active[lane]--; pump();
        });
      } };
      waiting.push(job);
      init?.signal?.addEventListener('abort', abort, { once: true });
      pump();
    });
  };
  return { request, retryAt, ready, accept, cooldownScope, manualRetry };
}
let requestGapMs = 80;
export function setYoutubeRequestGap(value: unknown) {
  const gap = Number(value);
  if (Number.isFinite(gap)) requestGapMs = Math.max(0, Math.min(60_000, gap));
}
const transport = createYoutubeTransport({ gapMs: () => requestGapMs, liveGapMs: () => PROVIDER_BUDGETS.youtubeLiveRequestGapMs });
export const fetchYoutubeResponse = transport.request;
export const youtubeRetryAt = (now = Date.now(), scope: YoutubeRequestScope = 'catalog') => transport.retryAt(scope, now);
export const youtubeCooldownScope = (now = Date.now(), scope: YoutubeRequestScope = 'catalog') => transport.cooldownScope(scope, now);
export const assertYoutubeReady = (now = Date.now(), scope: YoutubeRequestScope = 'catalog', retry?: YoutubeManualRetry) => transport.ready(scope, now, retry);
export const createYoutubeManualRetry = transport.manualRetry;
export const acceptYoutubeResponse = transport.accept;
