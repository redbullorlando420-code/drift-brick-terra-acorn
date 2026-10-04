import { useSyncExternalStore } from 'react';
import { getFirstShelfTrace, getStartupTraceRevision, subscribeStartupTrace, type StartupPhase } from '@/lib/first-shelf-trace';

const phases: Array<[StartupPhase, string]> = [['preferences', 'Saved preferences'], ['remoteRead', 'Provider catalog from disk'],
  ['remotePrepare', 'Provider catalog preparation'], ['localRead', 'Local catalog from disk'], ['localPrepare', 'Local catalog preparation']];
export function StartupStatus() {
  useSyncExternalStore(subscribeStartupTrace, getStartupTraceRevision, () => 0);
  const trace = getFirstShelfTrace();
  const duration = (ms?: number) => ms === undefined ? 'pending' : `${ms.toLocaleString()} ms`;
  const firstPaint = typeof performance === 'undefined' ? undefined : performance.getEntriesByName('first-contentful-paint')[0]?.startTime;
  return <section aria-label="Startup timing" className="mt-3 rounded-sm bg-bg/45 p-3 text-xs leading-5 text-muted">
    <p className="font-medium text-fg">Startup timing</p>
    <p>First contentful paint · {duration(firstPaint === undefined ? undefined : Math.round(firstPaint))} from navigation</p>
    <p>Home controls ready · {duration(trace.homeReadyMs)} from navigation</p>
    <p>Saved catalogs ready · {duration(trace.catalogReadyMs)} from navigation</p>
    <dl className="mt-2 grid gap-1">{phases.map(([id, label]) => <div key={id} className="flex flex-wrap justify-between gap-x-4">
      <dt>{label}</dt><dd data-startup-phase={id}>{duration(trace.phases[id]?.elapsedMs)}{trace.phases[id]?.rows !== undefined ? ` · ${trace.phases[id]!.rows!.toLocaleString()} rows` : ''}{trace.phases[id]?.failed ? ' · storage unavailable' : ''}</dd>
    </div>)}</dl>
    <p className="mt-2">First usable shelf · {duration(trace.elapsedMs)} from navigation{trace.route ? ` · ${duration(trace.routeElapsedMs)} after opening ${trace.route}` : ''}{trace.cards ? ` · ${trace.cards} mounted cards` : ''}</p>
    <p>First shelf artwork · {trace.artwork}{trace.artworkWaitMs === undefined ? '' : ` · ${duration(trace.artworkWaitMs)} after text was ready`}</p>
    <p className="mt-2 text-subtle">Home opens independently of catalog restoration. Landing page prepares its full recommendations on demand. Preparation yields after at most 512 records or about 4 ms; this is a work budget, not a guaranteed frame time. Disk and preparation durations include time yielded to input; YouTube selector, artwork and provider overlap appear below.</p>
  </section>;
}
