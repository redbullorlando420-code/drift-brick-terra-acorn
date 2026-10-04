export type StartupPhase = 'preferences' | 'remoteRead' | 'remotePrepare' | 'localRead' | 'localPrepare';
export type FirstShelfTrace = {
  /** Navigation time origin, rather than the later module-import timestamp. */
  startedAt: number;
  moduleReadyMs: number;
  homeReadyMs?: number;
  catalogReadyMs?: number;
  firstShelfAt?: number;
  elapsedMs?: number;
  route?: string;
  routeElapsedMs?: number;
  cards?: number;
  artwork: 'pending' | 'loaded' | 'deferred';
  artworkWaitMs?: number;
  phases: Partial<Record<StartupPhase, { startedAt: number; elapsedMs?: number; rows?: number; failed?: boolean }>>;
};

/** Five phases and one shelf; no catalog references, titles or video identities. */
export function createFirstShelfTrace(now: () => number) {
  let trace: FirstShelfTrace = { startedAt: 0, moduleReadyMs: Math.round(now()), phases: {}, artwork: 'pending' };
  let routeStart: { route: string; at: number } | undefined;
  let revision = 0;
  const listeners = new Set<() => void>();
  const publish = (next: FirstShelfTrace) => { trace = next; revision++; for (const listener of listeners) listener(); };
  return {
    get: () => trace,
    revision: () => revision,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    homeReady() { if (trace.homeReadyMs === undefined) publish({ ...trace, homeReadyMs: Math.round(now()) }); },
    catalogReady() { if (trace.catalogReadyMs === undefined) publish({ ...trace, catalogReadyMs: Math.round(now()) }); },
    startPhase(phase: StartupPhase) {
      if (trace.phases[phase]) return;
      publish({ ...trace, phases: { ...trace.phases, [phase]: { startedAt: now() } } });
    },
    finishPhase(phase: StartupPhase, rows?: number, failed = false) {
      const previous = trace.phases[phase];
      if (!previous || previous.elapsedMs !== undefined) return;
      publish({ ...trace, phases: { ...trace.phases, [phase]: { ...previous,
        elapsedMs: Math.max(0, Math.round(now() - previous.startedAt)),
        ...(rows === undefined ? {} : { rows }), ...(failed ? { failed: true } : {}),
      } } });
    },
    beginRoute(route: string) { if (trace.firstShelfAt === undefined) routeStart = { route, at: now() }; },
    shelfReady(cards: number) {
      if (trace.firstShelfAt !== undefined || cards <= 0) return false;
      const at = now();
      publish({ ...trace, firstShelfAt: at, elapsedMs: Math.round(at), cards,
        ...(routeStart ? { route: routeStart.route, routeElapsedMs: Math.max(0, Math.round(at - routeStart.at)) } : {}),
      });
      routeStart = undefined;
      return true;
    },
    artworkReady(loaded: boolean) {
      if (trace.firstShelfAt === undefined || trace.artwork !== 'pending') return;
      publish({ ...trace, artwork: loaded ? 'loaded' : 'deferred', artworkWaitMs: Math.max(0, Math.round(now() - trace.firstShelfAt)) });
    },
  };
}

const trace = createFirstShelfTrace(() => typeof performance === 'undefined' ? 0 : performance.now());
// Server rendering must never share readiness between visitors.
const client = () => typeof window !== 'undefined';
export const getFirstShelfTrace = trace.get;
export const getStartupTraceRevision = trace.revision;
export const subscribeStartupTrace = trace.subscribe;
export const markHomeReady = () => { if (client()) trace.homeReady(); };
export const markCatalogReady = () => { if (client()) trace.catalogReady(); };
export const beginStartupPhase = (phase: StartupPhase) => { if (client()) trace.startPhase(phase); };
export const finishStartupPhase = (phase: StartupPhase, rows?: number, failed = false) => { if (client()) trace.finishPhase(phase, rows, failed); };
export const beginFirstShelfRoute = (route: string) => { if (client()) trace.beginRoute(route); };
export function markFirstShelf(_title: string, cards: number) { return client() && trace.shelfReady(cards); }
export const markFirstShelfArtwork = (loaded: boolean) => { if (client()) trace.artworkReady(loaded); };
