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
  fetch?: typeof fetch; now?: () => number; sleep?: (ms: number) => Promise<void>; gapMs?: () => number;
} = {}) {
  const now = options.now ?? (() => Date.now());
  const sleep = options.sleep ?? (ms => new Promise(resolve => setTimeout(resolve, ms)));
  const cooldowns = new Map<YoutubeRequestScope, Cooldown>();
  let cooldownRevision = 0;
  let tail: Promise<unknown> = Promise.resolve(), lastStarted = -Infinity;
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
  const accept = (response: Response, at = now(), scope: YoutubeRequestScope = 'catalog', networkBlocked = false) => {
    if (response.ok) { cooldowns.delete(scope); cooldowns.delete('all'); return; }
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
    const scope = init?.scope ?? youtubeRequestScope(url);
    const path = new URL(url).pathname;
    const html = !path.startsWith('/youtubei/') && !path.startsWith('/feeds/') && path !== '/oembed';
    const checkReady = () => { ready(scope, now(), init?.manualRetry); if (html && scope !== 'page') ready('page', now(), init?.manualRetry); };
    const work = async () => {
      checkReady();
      init?.signal?.throwIfAborted();
      const gap = Math.max(0, options.gapMs?.() ?? 80);
      const delay = lastStarted + gap - now();
      if (delay > 0) await sleep(delay);
      checkReady(); init?.signal?.throwIfAborted(); lastStarted = now();
      const { timeoutMs, manualRetry: _manualRetry, scope: _scope, ...requestInit } = init ?? {};
      // Request timeouts begin at transport start, not while waiting behind
      // another job or a user-selected pacing gap.
      if (timeoutMs) requestInit.signal = AbortSignal.any([...(requestInit.signal ? [requestInit.signal] : []), AbortSignal.timeout(timeoutMs)]);
      const response = await (options.fetch ?? globalThis.fetch)(url, requestInit);
      // Finish the body before releasing the serial slot.
      const body = await response.arrayBuffer();
      const blocked = response.status === 429 && /unusual traffic from your computer network/i.test(new TextDecoder().decode(body));
      accept(response, now(), blocked && html ? 'page' : scope, blocked);
      return new Response(response.status === 204 || response.status === 205 ? null : body, { status: response.status, statusText: response.statusText, headers: response.headers });
    };
    const pending = tail.then(work);
    tail = pending.catch(() => undefined);
    return pending;
  };
  return { request, retryAt, ready, accept, cooldownScope, manualRetry };
}
let requestGapMs = 80;
export function setYoutubeRequestGap(value: unknown) {
  const gap = Number(value);
  if (Number.isFinite(gap)) requestGapMs = Math.max(0, Math.min(60_000, gap));
}
const transport = createYoutubeTransport({ gapMs: () => requestGapMs });
export const fetchYoutubeResponse = transport.request;
export const youtubeRetryAt = (now = Date.now(), scope: YoutubeRequestScope = 'catalog') => transport.retryAt(scope, now);
export const youtubeCooldownScope = (now = Date.now(), scope: YoutubeRequestScope = 'catalog') => transport.cooldownScope(scope, now);
export const assertYoutubeReady = (now = Date.now(), scope: YoutubeRequestScope = 'catalog', retry?: YoutubeManualRetry) => transport.ready(scope, now, retry);
export const createYoutubeManualRetry = transport.manualRetry;
export const acceptYoutubeResponse = transport.accept;
